// Authorized Staff & Admin registry helper for INNOSPRINT 2026

export const KNOWN_ADMINS = [
  { email: 'rajavardhan445@gmail.com', name: 'Raja Vardhan', role: 'superadmin' },
  { email: '24bq5a6135@vvit.net', name: 'Ujwal', role: 'organizer' },
  { email: 'admin@vvit.ac.in', name: 'VVITU Admin', role: 'superadmin' },
  { email: 'organizer@vvit.net', name: 'Hackathon Organizer', role: 'organizer' }
];

export function checkIsAdminEmail(rawEmail) {
  if (!rawEmail) return null;
  const clean = rawEmail.trim().toLowerCase();

  // 1. Direct match with primary admin roster
  const found = KNOWN_ADMINS.find(a => a.email.toLowerCase() === clean);
  if (found) return found;

  // 2. Check localStorage authorized admins list
  try {
    const local = JSON.parse(localStorage.getItem('inno_sprint_authorized_admins') || '[]');
    const localFound = local.find(a => a.email && a.email.toLowerCase() === clean);
    if (localFound) {
      return {
        email: localFound.email,
        name: localFound.full_name || localFound.name || 'Organizer',
        role: localFound.role || 'organizer'
      };
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  // 3. Keyword heuristic
  if (clean.includes('admin') || clean.includes('organizer')) {
    return {
      email: clean,
      name: 'INNOSPRINT Staff',
      role: 'organizer'
    };
  }

  return null;
}
