import { supabase, isSupabaseConfigured } from './supabase.js';
import { checkIsAdminEmail, checkIsAdminEmailAsync } from './adminList.js';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

export const CERTIFICATES_BUCKET = 'certificates';

export const ALLOWED_CERTIFICATE_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

export const ALLOWED_CERTIFICATE_EXTENSIONS = [
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
];

const configuredMaxMb = Number(import.meta.env?.VITE_MAX_CERTIFICATE_SIZE_MB);
export const MAX_CERTIFICATE_FILE_SIZE_MB =
  Number.isFinite(configuredMaxMb) && configuredMaxMb > 0 ? configuredMaxMb : 10;
export const MAX_CERTIFICATE_FILE_SIZE_BYTES = MAX_CERTIFICATE_FILE_SIZE_MB * 1024 * 1024;

// Short-lived signed URL TTL in seconds (2 minutes)
export const SIGNED_URL_EXPIRY_SECONDS = 120;

// Envelope marker used to sync certificate records inside registrations.organizer_notes
// when the dedicated public.certificates table migration has not yet been applied in SQL Editor.
const NOTES_CERT_ENVELOPE_KEY = '__inno_certs_v1';
const LOCAL_CERTS_STORAGE_KEY = 'inno_sprint_certificates_v1';

// In-memory sliding-window rate limiter for public status/certificate verification
const verificationRateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_ATTEMPTS = 25;

// ============================================================================
// 1. RATE LIMITING & ABUSE PROTECTION
// ============================================================================

export function checkVerificationRateLimit(identifier = 'global') {
  const key = String(identifier || 'global').trim().toLowerCase();
  const now = Date.now();
  const entry = verificationRateLimitMap.get(key) || { count: 0, windowStart: now };

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1;
    entry.windowStart = now;
    verificationRateLimitMap.set(key, entry);
    return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - 1 };
  }

  entry.count += 1;
  verificationRateLimitMap.set(key, entry);

  if (entry.count > RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.windowStart)) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec,
      error: `Too many verification requests. Please wait ${retryAfterSec}s before trying again.`,
    };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - entry.count };
}

export function resetVerificationRateLimit() {
  verificationRateLimitMap.clear();
}

// ============================================================================
// 2. FILE VALIDATION & FILENAME SANITIZATION
// ============================================================================

export function getExtensionFromMimeOrName(mimeType = '', filename = '') {
  const lowerName = String(filename || '').trim().toLowerCase();
  const lowerMime = String(mimeType || '').trim().toLowerCase();

  if (lowerMime === 'application/pdf' || lowerName.endsWith('.pdf')) return 'pdf';
  if (lowerMime === 'image/png' || lowerName.endsWith('.png')) return 'png';
  if (lowerMime === 'image/webp' || lowerName.endsWith('.webp')) return 'webp';
  if (lowerMime === 'image/jpeg' || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) return 'jpg';
  return '';
}

export function inferMimeType(file) {
  if (!file) return '';
  const rawType = String(file.type || '').trim().toLowerCase();
  if (ALLOWED_CERTIFICATE_MIME_TYPES.includes(rawType)) {
    return rawType;
  }
  const name = String(file.name || '').trim().toLowerCase();
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.webp')) return 'image/webp';
  return rawType;
}

export function validateCertificateFile(file, customMaxBytes = MAX_CERTIFICATE_FILE_SIZE_BYTES) {
  if (!file) {
    return { valid: false, error: 'Please select a certificate file to upload.' };
  }

  const fileName = String(file.name || '').trim();
  if (!fileName) {
    return { valid: false, error: 'Selected file does not have a valid filename.' };
  }

  const fileSize = Number(file.size ?? file.byteLength ?? 0);
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return { valid: false, error: 'The selected file is empty (0 bytes).' };
  }

  if (fileSize > customMaxBytes) {
    const maxMb = (customMaxBytes / (1024 * 1024)).toFixed(1);
    const actualMb = (fileSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${actualMb} MB) exceeds the maximum allowed limit of ${maxMb} MB.`,
    };
  }

  const mimeType = inferMimeType(file);
  const ext = getExtensionFromMimeOrName(mimeType, fileName);

  const hasValidMime = ALLOWED_CERTIFICATE_MIME_TYPES.includes(mimeType);
  const hasValidExt = ALLOWED_CERTIFICATE_EXTENSIONS.some((allowedExt) =>
    fileName.toLowerCase().endsWith(allowedExt)
  );

  if (!hasValidMime || !hasValidExt || !ext) {
    return {
      valid: false,
      error: `Invalid file format "${fileName}". Only PDF, PNG, JPG/JPEG, and WEBP certificate files are permitted.`,
    };
  }

  return {
    valid: true,
    mimeType,
    extension: ext,
    fileSize,
    originalFilename: fileName,
  };
}

export function sanitizeParticipantNameForFilename(rawName = 'Participant') {
  const cleaned = String(rawName || 'Participant')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '_');

  return cleaned || 'Participant';
}

export function buildCertificateDownloadFilename(participantName, mimeType = 'application/pdf', originalFilename = '') {
  const safeName = sanitizeParticipantNameForFilename(participantName);
  const ext = getExtensionFromMimeOrName(mimeType, originalFilename) || 'pdf';
  return `INNO_SPRINT_Certificate_${safeName}.${ext}`;
}

export function generateUniqueToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '');
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 12) +
    Math.random().toString(36).substring(2, 12)
  );
}

export function generateCertificateStoragePath({ registrationId, participantKey, extension = 'pdf' }) {
  const safeRegId = String(registrationId || 'reg')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 36);
  const safePartKey = String(participantKey || 'leader')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
  const token = generateUniqueToken();
  const cleanExt = String(extension || 'pdf').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'pdf';

  return `certs/${safeRegId}/${safePartKey}_${token}.${cleanExt}`;
}

// ============================================================================
// 3. TRUSTED ADMIN AUTHORIZATION VERIFICATION
// ============================================================================

/**
 * Verifies that the caller is an authorized organizer or superadmin.
 * Never trusts query parameters, editable profile fields, or unverified client claims.
 */
export async function verifyAdminCertificateAuthority(actorContext = null) {
  // 1. Check active Supabase Auth session first if available
  let sessionUser = null;
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.auth.getSession();
      sessionUser = data?.session?.user || null;
    } catch {
      // Continue to check verified actor context
    }
  }

  const candidateUser = sessionUser || actorContext?.user || null;
  const candidateEmail = String(candidateUser?.email || actorContext?.email || '')
    .trim()
    .toLowerCase();
  const candidateRole = String(actorContext?.role || '').trim().toLowerCase();

  if (!candidateEmail || !candidateEmail.includes('@')) {
    return {
      authorized: false,
      error: 'UNAUTHORIZED: An authenticated administrator session is required to manage certificates.',
    };
  }

  // Reject if actor explicitly has a non-admin role (e.g., ordinary participant)
  if (candidateRole && !['organizer', 'superadmin'].includes(candidateRole)) {
    return {
      authorized: false,
      error: 'ACCESS_DENIED: Ordinary participants are not authorized to upload, replace, or modify official certificates.',
    };
  }

  // 2. Check trusted server-side authorized_admins table in Supabase if available
  if (isSupabaseConfigured) {
    try {
      const { data: dbAdmin, error: dbErr } = await supabase
        .from('authorized_admins')
        .select('email, role, full_name')
        .ilike('email', candidateEmail)
        .maybeSingle();

      if (!dbErr && dbAdmin && ['organizer', 'superadmin'].includes(String(dbAdmin.role).toLowerCase())) {
        return {
          authorized: true,
          adminEmail: dbAdmin.email.toLowerCase(),
          adminId: sessionUser?.id || null,
          adminRole: dbAdmin.role,
          adminName: dbAdmin.full_name,
        };
      }
    } catch {
      // Table may not exist yet; proceed to verified registry check
    }
  }

  // 3. Check verified KNOWN_ADMINS and cloud registry (strictly requires organizer or superadmin role)
  const knownAdmin = checkIsAdminEmail(candidateEmail) || (await checkIsAdminEmailAsync(candidateEmail));
  if (knownAdmin && ['organizer', 'superadmin'].includes(String(knownAdmin.role).toLowerCase())) {
    // Also ensure that if actorContext passed a role, it wasn't 'participant'
    if (actorContext?.isParticipantOverride) {
      return {
        authorized: false,
        error: 'ACCESS_DENIED: Participant sessions cannot upload or modify certificates.',
      };
    }
    return {
      authorized: true,
      adminEmail: knownAdmin.email.toLowerCase(),
      adminId: sessionUser?.id && /^[0-9a-f-]{36}$/i.test(sessionUser.id) ? sessionUser.id : null,
      adminRole: knownAdmin.role,
      adminName: knownAdmin.name,
    };
  }

  return {
    authorized: false,
    error: `ACCESS_DENIED: Account "${candidateEmail}" does not have organizer or superadmin privileges to manage certificates.`,
  };
}

// ============================================================================
// 4. ENVELOPE HELPERS FOR REGISTRATIONS FALLBACK PERSISTENCE
// ============================================================================

export function parseRegistrationNotesEnvelope(rawNotes) {
  if (!rawNotes) {
    return { plainNotes: '', certificates: {} };
  }
  if (typeof rawNotes === 'object') {
    return {
      plainNotes: rawNotes.plainNotes || '',
      certificates: rawNotes[NOTES_CERT_ENVELOPE_KEY] || {},
    };
  }
  const str = String(rawNotes).trim();
  if (str.startsWith('{') && str.includes(NOTES_CERT_ENVELOPE_KEY)) {
    try {
      const parsed = JSON.parse(str);
      return {
        plainNotes: parsed.plainNotes || '',
        certificates: parsed[NOTES_CERT_ENVELOPE_KEY] || {},
      };
    } catch {
      return { plainNotes: str, certificates: {} };
    }
  }
  return { plainNotes: str, certificates: {} };
}

export function serializeRegistrationNotesEnvelope(plainNotes, certificatesMap) {
  const payload = {
    plainNotes: plainNotes || '',
    [NOTES_CERT_ENVELOPE_KEY]: certificatesMap || {},
  };
  return JSON.stringify(payload);
}

function getLocalCertificatesStore() {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CERTS_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalCertificatesStore(store) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CERTS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota issues
  }
}

// ============================================================================
// 5. TEAM & PARTICIPANT ROSTER EXPANSION (INDIVIDUAL CERTIFICATES PER MEMBER)
// ============================================================================

/**
 * Expands team and individual registrations into individual participant rows.
 * Even when registration is team-based, each member (Team Leader + each Team Member)
 * receives a distinct row and participantKey so certificates are issued individually.
 */
export function expandRegistrationsToParticipantRows(registrations = [], certificatesByCompositeKey = {}) {
  const participantRows = [];

  for (const reg of registrations) {
    if (!reg || !reg.id) continue;

    const regId = reg.id;
    const referenceCode = reg.reference_code || 'N/A';
    const teamName =
      reg.teams?.team_name ||
      reg.team_name ||
      (reg.participation_type === 'team' ? 'Team Entry' : 'Individual Entry');
    const regStatus = (reg.status || 'pending').toLowerCase();

    // Extract any certificates stored in the registration's organizer_notes envelope
    const { certificates: envelopeCerts } = parseRegistrationNotesEnvelope(reg.organizer_notes);

    // 1. Primary Applicant / Team Leader row
    const leaderKey = 'leader';
    const leaderCompositeKey = `${regId}::${leaderKey}`;
    const leaderCert =
      certificatesByCompositeKey[leaderCompositeKey] ||
      envelopeCerts[leaderKey] ||
      null;

    const leaderName =
      reg.applicant_name || reg.profiles?.full_name || reg.user_name || 'Participant';
    const leaderEmail = (
      reg.applicant_email ||
      reg.profiles?.email ||
      reg.user_email ||
      ''
    ).trim();

    participantRows.push({
      uid: leaderCompositeKey,
      registrationId: regId,
      referenceCode,
      participantKey: leaderKey,
      participantId: reg.user_id || null,
      teamMemberId: null,
      eventId: reg.event_id || null,
      fullName: leaderName,
      email: leaderEmail,
      mobile: reg.applicant_mobile || reg.profiles?.mobile || '',
      college: reg.applicant_college || reg.profiles?.college || 'VVITU',
      teamName,
      participationType: reg.participation_type || 'team',
      roleInTeam: reg.participation_type === 'team' ? 'Team Leader' : 'Individual Participant',
      registrationStatus: regStatus,
      theme: reg.theme || '',
      certificate: leaderCert && leaderCert.storage_path ? leaderCert : null,
      certificateStatus: leaderCert && leaderCert.storage_path ? 'Available' : 'Not Uploaded',
      uploadedAt: leaderCert?.updated_at || leaderCert?.created_at || null,
    });

    // 2. Individual Team Member rows (from teams.team_members)
    const rawMembers = Array.isArray(reg.teams?.team_members)
      ? reg.teams.team_members
      : Array.isArray(reg.team_members)
      ? reg.team_members
      : [];

    rawMembers.forEach((member, idx) => {
      if (!member) return;
      const memberId = member.id || `idx_${idx + 1}`;
      const memberKey = `member:${memberId}`;
      const memberCompositeKey = `${regId}::${memberKey}`;

      const memberName = (member.member_name || member.name || `Team Member ${idx + 1}`).trim();
      const memberEmail = (member.member_email || member.email || '').trim();

      // Avoid duplicating the leader row only if both name and email are identical and role says leader
      if (
        String(member.role_in_team || '').toLowerCase() === 'team leader' &&
        memberEmail.toLowerCase() === leaderEmail.toLowerCase() &&
        memberName.toLowerCase() === leaderName.toLowerCase()
      ) {
        return;
      }

      const memberCert =
        certificatesByCompositeKey[memberCompositeKey] ||
        envelopeCerts[memberKey] ||
        null;

      participantRows.push({
        uid: memberCompositeKey,
        registrationId: regId,
        referenceCode,
        participantKey: memberKey,
        participantId: member.user_id || null,
        teamMemberId: member.id || null,
        eventId: reg.event_id || null,
        fullName: memberName,
        email: memberEmail,
        mobile: member.member_phone || member.phone || '',
        college: reg.applicant_college || 'VVITU',
        teamName,
        participationType: 'team',
        roleInTeam: member.role_in_team || `Member ${idx + 1}`,
        registrationStatus: regStatus,
        theme: reg.theme || '',
        certificate: memberCert && memberCert.storage_path ? memberCert : null,
        certificateStatus: memberCert && memberCert.storage_path ? 'Available' : 'Not Uploaded',
        uploadedAt: memberCert?.updated_at || memberCert?.created_at || null,
      });
    });
  }

  return participantRows;
}

/**
 * Groups registrations into team certificate cards with individual member rosters
 * and progress metrics (e.g., "2 of 4 certificates uploaded", completion percentage).
 */
export function groupRegistrationsIntoTeamCertificateCards(registrations = [], certificatesByCompositeKey = {}) {
  return registrations.map((reg) => {
    const members = expandRegistrationsToParticipantRows([reg], certificatesByCompositeKey);
    const totalMembersCount = members.length;
    const uploadedCount = members.filter((m) => m.certificateStatus === 'Available').length;
    const pendingCount = totalMembersCount - uploadedCount;
    const completionPercentage =
      totalMembersCount > 0 ? Math.round((uploadedCount / totalMembersCount) * 100) : 0;
    const teamName =
      reg.teams?.team_name ||
      reg.team_name ||
      (reg.participation_type === 'team' ? 'Team Entry' : 'Individual Entry');

    return {
      registrationId: reg.id,
      teamId: reg.team_id || reg.teams?.id || null,
      teamName,
      referenceCode: reg.reference_code,
      participationType: reg.participation_type || 'team',
      registrationStatus: (reg.status || 'pending').toLowerCase(),
      theme: reg.theme || '',
      college: reg.applicant_college || reg.profiles?.college || 'VVITU',
      members,
      totalMembersCount,
      uploadedCount,
      pendingCount,
      completionPercentage,
      statusText: `${uploadedCount} of ${totalMembersCount} certificates uploaded`,
      isComplete: uploadedCount === totalMembersCount && totalMembersCount > 0,
    };
  });
}

// ============================================================================
// 6. FETCHING CERTIFICATES FROM SUPABASE
// ============================================================================

/**
 * Loads all certificate records from Supabase (combining public.certificates table
 * if present and registration envelope records).
 * Returns a map keyed by `${registration_id}::${participant_key}`.
 */
export async function fetchAllCertificatesMap(registrations = []) {
  const map = {};

  // 1. Seed from local cache if any
  const localStore = getLocalCertificatesStore();
  Object.assign(map, localStore);

  // 2. Seed from registrations organizer_notes envelope (real Supabase registrations rows)
  for (const reg of registrations) {
    if (!reg?.id) continue;
    const { certificates } = parseRegistrationNotesEnvelope(reg.organizer_notes);
    for (const [partKey, certObj] of Object.entries(certificates)) {
      if (certObj && certObj.storage_path) {
        map[`${reg.id}::${partKey}`] = certObj;
      }
    }
  }

  // 3. Query dedicated public.certificates table in Supabase if migration has been applied
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          if (row.registration_id && row.participant_key && row.storage_path) {
            map[`${row.registration_id}::${row.participant_key}`] = row;
          }
        }
      }
    } catch {
      // Table not yet created; envelope records from registrations are used seamlessly
    }
  }

  return map;
}

// ============================================================================
// 7. UPLOAD & REPLACEMENT WITH ATOMIC ROLLBACK AND ORPHAN CLEANUP
// ============================================================================

/**
 * Safely uploads or replaces an individual participant's certificate.
 * - Verifies admin authorization first.
 * - Validates file type and size.
 * - Uploads to private 'certificates' Supabase Storage bucket at a non-guessable path.
 * - Persists metadata in Supabase (public.certificates + registration envelope).
 * - If DB write fails after Storage upload succeeds, rolls back the new Storage object
 *   and never marks the certificate as Available or deletes an existing valid certificate.
 * - After successful replacement, cleans up the old Storage object to prevent orphans.
 */
export async function uploadOrReplaceParticipantCertificate({
  participantRow,
  file,
  adminActor,
  onProgress,
  simulateDbFailure = false,
  customMaxBytes = MAX_CERTIFICATE_FILE_SIZE_BYTES,
}) {
  const reportProgress = (percent, stage) => {
    if (typeof onProgress === 'function') {
      onProgress({ percent, stage });
    }
  };

  reportProgress(5, 'Verifying administrator authorization...');

  // 1. Enforce strict admin authorization
  const authCheck = await verifyAdminCertificateAuthority(adminActor);
  if (!authCheck.authorized) {
    throw new Error(authCheck.error || 'UNAUTHORIZED: Admin privileges required.');
  }

  if (!participantRow || !participantRow.registrationId || !participantRow.participantKey) {
    throw new Error('Invalid participant target: missing registration ID or participant key.');
  }

  reportProgress(15, 'Validating certificate file format and size...');

  // 2. Validate file type & size
  const validation = validateCertificateFile(file, customMaxBytes);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const { registrationId, participantKey, participantId, teamMemberId, eventId } = participantRow;
  const previousStoragePath = participantRow.certificate?.storage_path || null;

  // 3. Generate unique, non-guessable storage object path
  const newStoragePath = generateCertificateStoragePath({
    registrationId,
    participantKey,
    extension: validation.extension,
  });

  reportProgress(35, 'Uploading certificate to private Supabase Storage...');

  // 4. Upload file to private Supabase Storage bucket ('certificates')
  let storageUploaded = false;
  if (isSupabaseConfigured) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .upload(newStoragePath, file, {
        contentType: validation.mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError || !uploadData?.path) {
      throw new Error(
        `Storage upload failed: ${uploadError?.message || 'Could not write object to private certificates bucket.'}`
      );
    }
    storageUploaded = true;
  }

  reportProgress(70, 'Recording certificate metadata in Supabase database...');

  const nowIso = new Date().toISOString();
  const certificateRecord = {
    id:
      participantRow.certificate?.id ||
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'cert_' + generateUniqueToken().slice(0, 24)),
    participant_id: participantId && /^[0-9a-f-]{36}$/i.test(String(participantId)) ? participantId : null,
    registration_id: registrationId,
    team_member_id: teamMemberId && /^[0-9a-f-]{36}$/i.test(String(teamMemberId)) ? teamMemberId : null,
    participant_key: participantKey,
    event_id: eventId && /^[0-9a-f-]{36}$/i.test(String(eventId)) ? eventId : null,
    storage_path: newStoragePath,
    original_filename: validation.originalFilename,
    mime_type: validation.mimeType,
    file_size: validation.fileSize,
    uploaded_by: authCheck.adminId,
    uploaded_by_email: authCheck.adminEmail,
    created_at: participantRow.certificate?.created_at || nowIso,
    updated_at: nowIso,
  };

  // 5. Save metadata to Supabase Database (with safe rollback if DB write fails)
  try {
    if (simulateDbFailure) {
      throw new Error('SIMULATED_DB_WRITE_FAILURE: Database transaction aborted.');
    }

    if (isSupabaseConfigured) {
      let savedToCertificatesTable = false;

      // A. Attempt upsert into dedicated public.certificates table
      const { data: certRow, error: certTableErr } = await supabase
        .from('certificates')
        .upsert(
          {
            participant_id: certificateRecord.participant_id,
            registration_id: certificateRecord.registration_id,
            team_member_id: certificateRecord.team_member_id,
            participant_key: certificateRecord.participant_key,
            event_id: certificateRecord.event_id,
            storage_path: certificateRecord.storage_path,
            original_filename: certificateRecord.original_filename,
            mime_type: certificateRecord.mime_type,
            file_size: certificateRecord.file_size,
            uploaded_by: certificateRecord.uploaded_by,
            uploaded_by_email: certificateRecord.uploaded_by_email,
            updated_at: nowIso,
          },
          { onConflict: 'registration_id,participant_key' }
        )
        .select()
        .single();

      if (!certTableErr && certRow) {
        savedToCertificatesTable = true;
        Object.assign(certificateRecord, certRow);
      } else if (
        certTableErr &&
        !String(certTableErr.message || '').includes('Could not find the table') &&
        !String(certTableErr.code || '').includes('PGRST205') &&
        !String(certTableErr.code || '').includes('42501')
      ) {
        throw new Error(`Database write error on certificates table: ${certTableErr.message}`);
      }

      // B. Always sync the certificate record into the registration row in Supabase
      // so status checks and team member lookups work even before SQL migration is run
      const { data: currentReg, error: fetchRegErr } = await supabase
        .from('registrations')
        .select('id, organizer_notes')
        .eq('id', registrationId)
        .single();

      if (fetchRegErr || !currentReg) {
        if (!savedToCertificatesTable) {
          throw new Error(
            `Database write failed: Could not locate registration ${registrationId} (${fetchRegErr?.message || 'not found'}).`
          );
        }
      } else {
        const { plainNotes, certificates } = parseRegistrationNotesEnvelope(currentReg.organizer_notes);
        const updatedCerts = {
          ...certificates,
          [participantKey]: certificateRecord,
        };
        const serializedNotes = serializeRegistrationNotesEnvelope(plainNotes, updatedCerts);

        const { error: updateRegErr } = await supabase
          .from('registrations')
          .update({
            organizer_notes: serializedNotes,
            updated_at: nowIso,
          })
          .eq('id', registrationId);

        if (updateRegErr && !savedToCertificatesTable) {
          throw new Error(`Database write failed: ${updateRegErr.message}`);
        }
      }
    }

    // Update local cache
    const localStore = getLocalCertificatesStore();
    localStore[`${registrationId}::${participantKey}`] = certificateRecord;
    saveLocalCertificatesStore(localStore);
  } catch (dbError) {
    // CRITICAL ROLLBACK (Section 8 & Test Case 7):
    // Storage upload succeeded, but DB write failed!
    // Clean up the newly uploaded partial file in Storage and do NOT mark as Available.
    let rollbackCleaned = false;
    if (storageUploaded && isSupabaseConfigured) {
      try {
        await supabase.storage.from(CERTIFICATES_BUCKET).remove([newStoragePath]);
        rollbackCleaned = true;
      } catch (cleanupErr) {
        console.warn('[Certificate Rollback Warning] Failed to remove partial upload:', cleanupErr);
      }
    }

    const wrappedError = new Error(
      `Certificate upload aborted because database record could not be saved: ${dbError.message}`
    );
    wrappedError.code = 'DB_WRITE_FAILED_ROLLED_BACK';
    wrappedError.rolledBackStoragePath = newStoragePath;
    wrappedError.rollbackCleaned = rollbackCleaned;
    throw wrappedError;
  }

  reportProgress(90, 'Finalizing and cleaning up any replaced certificate file...');

  // 6. Safe Orphan Cleanup on Replacement (Section 1.B, Section 8 & Test Case 6):
  // Only after the new file is uploaded AND the new DB record is committed, remove the old file.
  let previousFileCleaned = false;
  if (previousStoragePath && previousStoragePath !== newStoragePath && isSupabaseConfigured) {
    try {
      const { error: remErr } = await supabase.storage
        .from(CERTIFICATES_BUCKET)
        .remove([previousStoragePath]);
      previousFileCleaned = !remErr;
    } catch (remEx) {
      console.warn('[Orphan Cleanup Notice] Could not delete replaced storage file:', remEx);
    }
  }

  reportProgress(100, 'Certificate available!');

  return {
    certificate: certificateRecord,
    replacedPrevious: Boolean(previousStoragePath),
    previousStoragePath,
    previousFileCleaned,
  };
}

// ============================================================================
// 8. SECURE PARTICIPANT CERTIFICATE RETRIEVAL & SIGNED DOWNLOAD
// ============================================================================

/**
 * Resolves which specific participant (Team Leader or individual Team Member)
 * in a registration matches the verified email address, and returns ONLY that
 * participant's individual certificate status and metadata.
 *
 * Security enforcement (Section 5):
 * - A publicly known registration ID (reference_code) alone is NEVER sufficient
 *   to unlock or return a private certificate.
 * - Requires a verified email matching either registrations.applicant_email or
 *   a specific team_members.member_email on that registration.
 * - Never exposes another team member's certificate or storage path.
 */
export async function resolveVerifiedParticipantCertificate({
  registration,
  verifiedEmail,
  targetParticipantKey = null,
}) {
  if (!registration || !registration.id) {
    return {
      verified: false,
      status: 'Not Uploaded',
      reason: 'NO_REGISTRATION',
      error: 'Registration record not found.',
    };
  }

  const cleanEmail = String(verifiedEmail || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      verified: false,
      requiresEmailVerification: true,
      status: 'Verification Required',
      reason: 'EMAIL_REQUIRED',
      error: 'Please enter your personal registered email address to verify your identity and check your individual certificate.',
    };
  }

  // Rate limit check
  const rateCheck = checkVerificationRateLimit(`cert_verify:${cleanEmail}`);
  if (!rateCheck.allowed) {
    throw new Error(rateCheck.error);
  }

  // Expand this registration into its individual participants
  const certMap = await fetchAllCertificatesMap([registration]);
  const participants = expandRegistrationsToParticipantRows([registration], certMap);

  // If caller requested a specific targetParticipantKey (e.g., attempting to access a specific participant's cert),
  // verify that the targetParticipantKey actually belongs to cleanEmail!
  if (targetParticipantKey) {
    const targetRow = participants.find((p) => p.participantKey === targetParticipantKey);
    if (!targetRow) {
      return {
        verified: false,
        status: 'Access Denied',
        reason: 'TARGET_NOT_FOUND',
        error: 'ACCESS_DENIED: Requested participant record does not exist in this registration.',
      };
    }
    if (String(targetRow.email || '').trim().toLowerCase() !== cleanEmail) {
      return {
        verified: false,
        status: 'Access Denied',
        reason: 'CROSS_PARTICIPANT_DENIED',
        error: 'ACCESS_DENIED: You are not authorized to access or download another participant’s certificate.',
      };
    }
  }

  // Find the participant row matching cleanEmail
  const matchedParticipant = participants.find(
    (p) => String(p.email || '').trim().toLowerCase() === cleanEmail
  );

  if (!matchedParticipant) {
    return {
      verified: false,
      requiresEmailVerification: true,
      status: 'Access Denied',
      reason: 'EMAIL_MISMATCH',
      error: `ACCESS_DENIED: The email "${cleanEmail}" does not match any registered participant on registration ${registration.reference_code}.`,
    };
  }

  // Also check server-side RPC verify_and_get_certificate if deployed in Supabase
  let certificate = matchedParticipant.certificate;
  if (isSupabaseConfigured && !certificate) {
    try {
      const { data: rpcRows, error: rpcErr } = await supabase.rpc('verify_and_get_certificate', {
        p_email: cleanEmail,
        p_reference_code: registration.reference_code || null,
      });
      if (!rpcErr && Array.isArray(rpcRows) && rpcRows.length > 0 && rpcRows[0].storage_path) {
        const r = rpcRows[0];
        certificate = {
          id: r.certificate_id,
          registration_id: r.registration_id,
          participant_key: r.participant_key,
          storage_path: r.storage_path,
          original_filename: r.original_filename,
          mime_type: r.mime_type,
          file_size: r.file_size,
          updated_at: r.uploaded_at,
        };
      }
    } catch {
      // RPC not yet deployed; use verified certificate record from registration/table
    }
  }

  const isAvailable = Boolean(certificate && certificate.storage_path);

  return {
    verified: true,
    participant: {
      fullName: matchedParticipant.fullName,
      email: matchedParticipant.email,
      roleInTeam: matchedParticipant.roleInTeam,
      teamName: matchedParticipant.teamName,
      registrationId: matchedParticipant.registrationId,
      referenceCode: matchedParticipant.referenceCode,
      participantKey: matchedParticipant.participantKey,
      registrationStatus: matchedParticipant.registrationStatus,
    },
    status: isAvailable ? 'Available' : 'Not Uploaded',
    certificate: isAvailable
      ? {
          id: certificate.id,
          registrationId: certificate.registration_id,
          participantKey: certificate.participant_key,
          originalFilename: certificate.original_filename,
          mimeType: certificate.mime_type,
          fileSize: certificate.file_size,
          uploadedAt: certificate.updated_at || certificate.created_at,
          downloadFilename: buildCertificateDownloadFilename(
            matchedParticipant.fullName,
            certificate.mime_type,
            certificate.original_filename
          ),
          // Note: storage_path is kept internal for signed URL generation and not exposed in UI
          _storagePath: certificate.storage_path,
        }
      : null,
  };
}

/**
 * Verifies participant ownership and generates a short-lived signed download URL
 * for the participant's private certificate object in Supabase Storage.
 */
export async function generateVerifiedCertificateSignedUrl({
  registration,
  verifiedEmail,
  targetParticipantKey = null,
  expirySeconds = SIGNED_URL_EXPIRY_SECONDS,
}) {
  if (expirySeconds <= 0) {
    throw new Error('SIGNED_URL_EXPIRED: The download link has expired. Please request a fresh download.');
  }

  const resolution = await resolveVerifiedParticipantCertificate({
    registration,
    verifiedEmail,
    targetParticipantKey,
  });

  if (!resolution.verified) {
    throw new Error(resolution.error || 'ACCESS_DENIED: Certificate ownership verification failed.');
  }

  if (resolution.status !== 'Available' || !resolution.certificate?._storagePath) {
    throw new Error('CERTIFICATE_NOT_AVAILABLE: Your certificate has not been published yet.');
  }

  const storagePath = resolution.certificate._storagePath;

  const { data: signedData, error: signErr } = await supabase.storage
    .from(CERTIFICATES_BUCKET)
    .createSignedUrl(storagePath, expirySeconds);

  if (signErr || !signedData?.signedUrl) {
    throw new Error(
      `Failed to generate secure download link: ${signErr?.message || 'Certificate file is missing from storage.'}`
    );
  }

  return {
    signedUrl: signedData.signedUrl,
    expiresInSeconds: expirySeconds,
    downloadFilename: resolution.certificate.downloadFilename,
    mimeType: resolution.certificate.mimeType,
    participant: resolution.participant,
  };
}

/**
 * Downloads the verified certificate directly as a Blob and triggers a browser file download
 * with `INNO_SPRINT_Certificate_<SanitizedParticipantName>.<ext>`.
 * Gracefully detects missing Storage files, expired signed URLs, and network errors.
 */
export async function downloadVerifiedParticipantCertificate({
  registration,
  verifiedEmail,
  targetParticipantKey = null,
}) {
  const { signedUrl, downloadFilename, mimeType, participant } =
    await generateVerifiedCertificateSignedUrl({
      registration,
      verifiedEmail,
      targetParticipantKey,
    });

  let response;
  try {
    response = await fetch(signedUrl, { method: 'GET', cache: 'no-store' });
  } catch (netErr) {
    throw new Error(`Network failure while downloading certificate: ${netErr.message}`);
  }

  if (!response.ok) {
    if (response.status === 400 || response.status === 403) {
      throw new Error('SIGNED_URL_EXPIRED_OR_INVALID: Your download link expired or the file is missing. Please try again.');
    }
    if (response.status === 404) {
      throw new Error('STORAGE_OBJECT_MISSING: The certificate file could not be found in secure storage.');
    }
    throw new Error(`Certificate download failed with HTTP ${response.status}.`);
  }

  const blob = await response.blob();
  if (!blob || blob.size === 0) {
    throw new Error('Downloaded certificate file is empty or corrupted.');
  }

  // Trigger browser download if running in DOM environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && window.URL?.createObjectURL) {
    const objectUrl = window.URL.createObjectURL(
      new Blob([blob], { type: mimeType || blob.type || 'application/pdf' })
    );
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = downloadFilename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 5000);
  }

  return {
    success: true,
    downloadFilename,
    byteLength: blob.size,
    mimeType: mimeType || blob.type,
    participant,
  };
}
