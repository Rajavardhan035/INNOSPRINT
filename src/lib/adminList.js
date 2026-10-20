// Authorized Staff & Admin registry helper for INNOSPRINT 2026
// Syncs authorized coordinators and judges across all devices using Supabase cloud persistence

import { supabase, isSupabaseConfigured } from './supabase';

export const KNOWN_ADMINS = [
  { email: 'rajavardhan445@gmail.com', name: 'Raja Vardhan', full_name: 'Raja Vardhan', role: 'superadmin' },
  { email: '24bq5a6135@vvit.net', name: 'Ujwal', full_name: 'Ujwal', role: 'organizer' },
  { email: 'admin@vvit.ac.in', name: 'VVITU Admin', full_name: 'VVITU Admin', role: 'superadmin' },
  { email: 'organizer@vvit.net', name: 'Hackathon Organizer', full_name: 'Hackathon Organizer', role: 'organizer' }
];

// In-memory cache of authorized administrators synced from Supabase
let cachedAdmins = null;

/**
 * Synchronously checks if an email belongs to an authorized admin or staff member.
 * Checks memory cache, KNOWN_ADMINS, and localStorage.
 */
export function checkIsAdminEmail(rawEmail) {
  if (!rawEmail) return null;
  const clean = rawEmail.trim().toLowerCase();

  // 1. Check in-memory cache
  if (Array.isArray(cachedAdmins)) {
    const foundCached = cachedAdmins.find((a) => a.email && a.email.toLowerCase() === clean);
    if (foundCached) {
      return {
        email: foundCached.email.toLowerCase(),
        name: foundCached.full_name || foundCached.name || 'Organizer',
        role: foundCached.role || 'organizer',
      };
    }
  }

  // 2. Direct match with primary admin roster
  const found = KNOWN_ADMINS.find((a) => a.email.toLowerCase() === clean);
  if (found) return found;

  // 3. Check localStorage authorized admins list
  try {
    const local = JSON.parse(localStorage.getItem('inno_sprint_authorized_admins') || '[]');
    const localFound = local.find((a) => a.email && a.email.toLowerCase() === clean);
    if (localFound) {
      return {
        email: localFound.email.toLowerCase(),
        name: localFound.full_name || localFound.name || 'Organizer',
        role: localFound.role || 'organizer',
      };
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  // 4. Keyword heuristic fallback
  if (clean.includes('admin') || clean.includes('organizer')) {
    return {
      email: clean,
      name: 'INNOSPRINT Staff',
      role: 'organizer',
    };
  }

  return null;
}

/**
 * Asynchronously loads the authoritative authorized admins list from Supabase cloud
 * so any device gets the full roster of added staff, coordinators, and judges.
 */
export async function fetchCloudAuthorizedAdmins() {
  const merged = [...KNOWN_ADMINS];

  // Merge with localStorage first
  try {
    const local = JSON.parse(localStorage.getItem('inno_sprint_authorized_admins') || '[]');
    if (Array.isArray(local)) {
      local.forEach((item) => {
        if (item?.email && !merged.some((m) => m.email.toLowerCase() === item.email.toLowerCase())) {
          merged.push({
            email: item.email.toLowerCase(),
            name: item.full_name || item.name || 'Organizer',
            full_name: item.full_name || item.name || 'Organizer',
            role: item.role || 'organizer',
            added_by: item.added_by || 'system',
            created_at: item.created_at || new Date().toISOString(),
          });
        }
      });
    }
  } catch {
    // Ignore parse errors
  }

  if (isSupabaseConfigured) {
    // 1. Check dedicated authorized_admins table if available
    try {
      const { data: authAdminData } = await supabase
        .from('authorized_admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (Array.isArray(authAdminData) && authAdminData.length > 0) {
        authAdminData.forEach((item) => {
          if (item?.email && !merged.some((m) => m.email.toLowerCase() === item.email.toLowerCase())) {
            merged.push({
              id: item.id,
              email: item.email.toLowerCase(),
              name: item.full_name || 'Organizer',
              full_name: item.full_name || 'Organizer',
              role: item.role || 'organizer',
              added_by: item.added_by || 'system',
              created_at: item.created_at || new Date().toISOString(),
            });
          }
        });
      }
    } catch {
      // Table may not exist yet
    }

    // 2. Check cloud registry record (reference_code = 'SYS-AUTH-ADMINS') in registrations
    try {
      const { data: sysRecord } = await supabase
        .from('registrations')
        .select('organizer_notes')
        .eq('reference_code', 'SYS-AUTH-ADMINS')
        .maybeSingle();

      if (sysRecord?.organizer_notes) {
        try {
          const parsed = JSON.parse(sysRecord.organizer_notes);
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (item?.email && !merged.some((m) => m.email.toLowerCase() === item.email.toLowerCase())) {
                merged.push({
                  email: item.email.toLowerCase(),
                  name: item.full_name || item.name || 'Organizer',
                  full_name: item.full_name || item.name || 'Organizer',
                  role: item.role || 'organizer',
                  added_by: item.added_by || 'system',
                  created_at: item.created_at || new Date().toISOString(),
                });
              }
            });
          }
        } catch {
          // JSON parse notice
        }
      }
    } catch (e) {
      console.warn('[Admin Registry] SYS-AUTH-ADMINS fetch notice:', e);
    }
  }

  cachedAdmins = merged;
  try {
    localStorage.setItem('inno_sprint_authorized_admins', JSON.stringify(merged));
  } catch {}

  return merged;
}

/**
 * Asynchronously verifies if an email is an authorized admin.
 * If not in local cache, it contacts Supabase live to verify cross-device logins.
 */
export async function checkIsAdminEmailAsync(rawEmail) {
  if (!rawEmail) return null;
  const localMatch = checkIsAdminEmail(rawEmail);
  if (localMatch) return localMatch;

  // Not in local cache; query Supabase cloud registry
  const cloudList = await fetchCloudAuthorizedAdmins();
  const clean = rawEmail.trim().toLowerCase();
  const cloudMatch = cloudList.find((a) => a.email && a.email.toLowerCase() === clean);
  if (cloudMatch) {
    return {
      email: cloudMatch.email.toLowerCase(),
      name: cloudMatch.full_name || cloudMatch.name || 'Organizer',
      role: cloudMatch.role || 'organizer',
    };
  }

  return null;
}

/**
 * Saves a new authorized administrator to both the Supabase cloud registry
 * and local storage so that they can sign in from ANY device immediately.
 */
export async function saveCloudAuthorizedAdmin({
  email,
  full_name,
  role = 'organizer',
  added_by = 'rajavardhan445@gmail.com',
}) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = full_name.trim();

  const newAdminItem = {
    id: 'adm_' + Date.now(),
    email: cleanEmail,
    name: cleanName,
    full_name: cleanName,
    role: role,
    added_by: added_by,
    created_at: new Date().toISOString(),
  };

  // Fetch current list and append/replace
  const currentList = await fetchCloudAuthorizedAdmins();
  const updated = [
    newAdminItem,
    ...currentList.filter((a) => a.email.toLowerCase() !== cleanEmail),
  ];

  cachedAdmins = updated;
  try {
    localStorage.setItem('inno_sprint_authorized_admins', JSON.stringify(updated));
  } catch {}

  if (isSupabaseConfigured) {
    // 1. Save to SYS-AUTH-ADMINS cloud record in registrations (accessible from ANY device)
    try {
      const { data: existingSys } = await supabase
        .from('registrations')
        .select('id')
        .eq('reference_code', 'SYS-AUTH-ADMINS')
        .maybeSingle();

      if (existingSys?.id) {
        await supabase
          .from('registrations')
          .update({
            organizer_notes: JSON.stringify(updated),
            updated_at: new Date().toISOString(),
          })
          .eq('reference_code', 'SYS-AUTH-ADMINS');
      } else {
        await supabase
          .from('registrations')
          .insert({
            reference_code: 'SYS-AUTH-ADMINS',
            participation_type: 'individual',
            theme: 'Open Innovation',
            applicant_name: 'SYSTEM_CONFIG',
            applicant_email: 'system-authorized-admins@innosprint.internal',
            status: 'approved',
            organizer_notes: JSON.stringify(updated),
          });
      }
    } catch (sysErr) {
      console.warn('[Admin Registry] Error saving to SYS-AUTH-ADMINS:', sysErr);
    }

    // 2. Also try saving to authorized_admins table in case it exists
    try {
      await supabase.from('authorized_admins').upsert(
        {
          email: cleanEmail,
          full_name: cleanName,
          role: role,
          added_by: added_by,
        },
        { onConflict: 'email' }
      );
    } catch {
      // Table may not exist yet
    }
  }

  return updated;
}

/**
 * Removes an authorized administrator from both Supabase cloud and local storage.
 */
export async function removeCloudAuthorizedAdmin(email) {
  const cleanEmail = email.trim().toLowerCase();
  const currentList = await fetchCloudAuthorizedAdmins();
  const updated = currentList.filter((a) => a.email.toLowerCase() !== cleanEmail);

  cachedAdmins = updated;
  try {
    localStorage.setItem('inno_sprint_authorized_admins', JSON.stringify(updated));
  } catch {}

  if (isSupabaseConfigured) {
    // 1. Update SYS-AUTH-ADMINS in registrations
    try {
      await supabase
        .from('registrations')
        .update({
          organizer_notes: JSON.stringify(updated),
          updated_at: new Date().toISOString(),
        })
        .eq('reference_code', 'SYS-AUTH-ADMINS');
    } catch (sysErr) {
      console.warn('[Admin Registry] Error updating SYS-AUTH-ADMINS on remove:', sysErr);
    }

    // 2. Also attempt delete from authorized_admins table
    try {
      await supabase.from('authorized_admins').delete().ilike('email', cleanEmail);
    } catch {}
  }

  return updated;
}
