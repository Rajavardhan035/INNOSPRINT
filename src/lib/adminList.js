// Authorized Staff & Admin registry helper for INNOSPRINT 2026
// Syncs authorized coordinators and judges across all devices using Supabase cloud persistence

import { supabase, isSupabaseConfigured } from './supabase.js';

// Immutable primary site owner
export const PRIMARY_OWNER = {
  email: 'rajavardhan445@gmail.com',
  name: 'Raja Vardhan',
  full_name: 'Raja Vardhan',
  role: 'superadmin',
  added_by: 'Primary Owner',
};

export const KNOWN_ADMINS = [PRIMARY_OWNER];

// In-memory cache of authorized administrators and revoked email list
let cachedAdmins = null;
let cachedRevoked = [];

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function getRevokedList() {
  if (Array.isArray(cachedRevoked) && cachedRevoked.length > 0) {
    return cachedRevoked;
  }
  try {
    const stored = JSON.parse(localStorage.getItem('inno_sprint_revoked_admins') || '[]');
    if (Array.isArray(stored)) {
      cachedRevoked = stored.map(normalizeEmail);
      return cachedRevoked;
    }
  } catch {}
  return [];
}

/**
 * Synchronously checks if an email belongs to an authorized admin or staff member.
 * Strictly verifies against the revoked list so deleted emails are immediately denied.
 */
export function checkIsAdminEmail(rawEmail) {
  if (!rawEmail) return null;
  const clean = normalizeEmail(rawEmail);

  // 0. If email was deleted/revoked, strictly deny access across all devices
  const revoked = getRevokedList();
  if (revoked.includes(clean)) {
    return null;
  }

  // 1. Check in-memory cache
  if (Array.isArray(cachedAdmins)) {
    const foundCached = cachedAdmins.find((a) => a.email && normalizeEmail(a.email) === clean);
    if (foundCached) {
      return {
        email: clean,
        name: foundCached.full_name || foundCached.name || 'Organizer',
        role: foundCached.role || 'organizer',
      };
    }
  }

  // 2. Direct match with primary site owner
  if (clean === normalizeEmail(PRIMARY_OWNER.email)) {
    return PRIMARY_OWNER;
  }

  // 3. Check localStorage authorized admins list
  try {
    const local = JSON.parse(localStorage.getItem('inno_sprint_authorized_admins') || '[]');
    if (Array.isArray(local)) {
      const localFound = local.find((a) => a?.email && normalizeEmail(a.email) === clean);
      if (localFound) {
        return {
          email: clean,
          name: localFound.full_name || localFound.name || 'Organizer',
          role: localFound.role || 'organizer',
        };
      }
    }
  } catch {}

  return null;
}

/**
 * Asynchronously loads the authoritative authorized admins list from Supabase cloud
 * and strictly honors the revoked blacklist so deleted admins never reappear on refresh or other devices.
 */
export async function fetchCloudAuthorizedAdmins() {
  let cloudAdmins = [];
  let cloudRevoked = [];
  let fetchedFromCloud = false;

  if (isSupabaseConfigured) {
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
            // Legacy format: raw array of admins
            cloudAdmins = parsed;
            fetchedFromCloud = true;
          } else if (parsed && typeof parsed === 'object') {
            // New structure: { admins: [...], revoked: [...] }
            if (Array.isArray(parsed.admins)) cloudAdmins = parsed.admins;
            if (Array.isArray(parsed.revoked)) cloudRevoked = parsed.revoked.map(normalizeEmail);
            fetchedFromCloud = true;
          }
        } catch (parseErr) {
          console.warn('[Admin Registry] JSON parse notice:', parseErr);
        }
      }
    } catch (e) {
      console.warn('[Admin Registry] SYS-AUTH-ADMINS fetch error:', e);
    }
  }

  // If not reachable or offline, fallback to local storage
  if (!fetchedFromCloud) {
    try {
      const local = JSON.parse(localStorage.getItem('inno_sprint_authorized_admins') || '[]');
      if (Array.isArray(local)) cloudAdmins = local;
    } catch {}
    try {
      const localRev = JSON.parse(localStorage.getItem('inno_sprint_revoked_admins') || '[]');
      if (Array.isArray(localRev)) cloudRevoked = localRev.map(normalizeEmail);
    } catch {}
  }

  // Merge any local revoked cache to be thoroughly safe
  const allRevoked = [...new Set([...cloudRevoked, ...getRevokedList()])];

  // Start always with the immutable primary owner
  const finalRoster = [
    {
      id: 'main_admin',
      email: PRIMARY_OWNER.email.toLowerCase(),
      name: PRIMARY_OWNER.name,
      full_name: PRIMARY_OWNER.full_name,
      role: PRIMARY_OWNER.role,
      added_by: 'Primary Owner',
      created_at: '2026-03-01T00:00:00.000Z',
    },
  ];

  // Add any active admin that is NOT revoked and NOT primary owner duplicate
  cloudAdmins.forEach((item) => {
    if (!item?.email) return;
    const clean = normalizeEmail(item.email);
    if (clean === normalizeEmail(PRIMARY_OWNER.email)) return;
    if (allRevoked.includes(clean)) return; // Strictly ignore deleted/revoked emails

    if (!finalRoster.some((m) => normalizeEmail(m.email) === clean)) {
      finalRoster.push({
        id: item.id || 'adm_' + clean.replace(/[^a-zA-Z0-9]/g, '_'),
        email: clean,
        name: item.full_name || item.name || 'Organizer',
        full_name: item.full_name || item.name || 'Organizer',
        role: item.role || 'organizer',
        added_by: item.added_by || 'system',
        created_at: item.created_at || new Date().toISOString(),
      });
    }
  });

  // Update in-memory caches
  cachedAdmins = finalRoster;
  cachedRevoked = allRevoked;

  // Persist clean authoritative state in localStorage
  try {
    localStorage.setItem('inno_sprint_authorized_admins', JSON.stringify(finalRoster));
    localStorage.setItem('inno_sprint_revoked_admins', JSON.stringify(allRevoked));
  } catch {}

  return finalRoster;
}

/**
 * Asynchronously verifies if an email is an authorized admin.
 * If not in local cache, it contacts Supabase live to verify cross-device logins.
 */
export async function checkIsAdminEmailAsync(rawEmail) {
  if (!rawEmail) return null;
  const clean = normalizeEmail(rawEmail);

  // Check if revoked first
  const revoked = getRevokedList();
  if (revoked.includes(clean)) return null;

  const localMatch = checkIsAdminEmail(rawEmail);
  if (localMatch) return localMatch;

  // Not in local cache; query Supabase cloud registry
  const cloudList = await fetchCloudAuthorizedAdmins();
  const cloudMatch = cloudList.find((a) => a.email && normalizeEmail(a.email) === clean);
  if (cloudMatch) {
    return {
      email: clean,
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
  const cleanEmail = normalizeEmail(email);
  const cleanName = full_name.trim();

  // Load current cloud state
  const currentAdmins = await fetchCloudAuthorizedAdmins();
  // If this email was previously revoked, un-revoke it upon re-authorization
  const currentRevoked = getRevokedList().filter((e) => e !== cleanEmail);

  const newAdminItem = {
    id: 'adm_' + Date.now(),
    email: cleanEmail,
    name: cleanName,
    full_name: cleanName,
    role: role,
    added_by: added_by,
    created_at: new Date().toISOString(),
  };

  const updatedAdmins = [
    newAdminItem,
    ...currentAdmins.filter((a) => normalizeEmail(a.email) !== cleanEmail),
  ];

  cachedAdmins = updatedAdmins;
  cachedRevoked = currentRevoked;

  try {
    localStorage.setItem('inno_sprint_authorized_admins', JSON.stringify(updatedAdmins));
    localStorage.setItem('inno_sprint_revoked_admins', JSON.stringify(currentRevoked));
  } catch {}

  if (isSupabaseConfigured) {
    const payload = JSON.stringify({
      admins: updatedAdmins,
      revoked: currentRevoked,
      last_updated: new Date().toISOString(),
    });

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
            organizer_notes: payload,
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
            organizer_notes: payload,
          });
      }
    } catch (sysErr) {
      console.warn('[Admin Registry] Error saving to SYS-AUTH-ADMINS:', sysErr);
    }

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
    } catch {}
  }

  return updatedAdmins;
}

/**
 * Removes an authorized administrator from both Supabase cloud and local storage
 * and records them in the revoked blacklist so they never reappear across devices or on page refresh.
 */
export async function removeCloudAuthorizedAdmin(email) {
  const cleanEmail = normalizeEmail(email);

  if (cleanEmail === normalizeEmail(PRIMARY_OWNER.email)) {
    throw new Error('Primary owner (rajavardhan445@gmail.com) cannot be deleted.');
  }

  // Load current cloud state
  const currentAdmins = await fetchCloudAuthorizedAdmins();
  const currentRevoked = getRevokedList();

  const updatedAdmins = currentAdmins.filter((a) => normalizeEmail(a.email) !== cleanEmail);
  const updatedRevoked = [...new Set([...currentRevoked, cleanEmail])];

  cachedAdmins = updatedAdmins;
  cachedRevoked = updatedRevoked;

  try {
    localStorage.setItem('inno_sprint_authorized_admins', JSON.stringify(updatedAdmins));
    localStorage.setItem('inno_sprint_revoked_admins', JSON.stringify(updatedRevoked));
  } catch {}

  if (isSupabaseConfigured) {
    const payload = JSON.stringify({
      admins: updatedAdmins,
      revoked: updatedRevoked,
      last_updated: new Date().toISOString(),
    });

    try {
      await supabase
        .from('registrations')
        .update({
          organizer_notes: payload,
          updated_at: new Date().toISOString(),
        })
        .eq('reference_code', 'SYS-AUTH-ADMINS');
    } catch (sysErr) {
      console.warn('[Admin Registry] Error updating SYS-AUTH-ADMINS on remove:', sysErr);
    }

    try {
      await supabase.from('authorized_admins').delete().ilike('email', cleanEmail);
    } catch {}
  }

  return updatedAdmins;
}
