// scripts/send-rejection-emails.mjs
// Official InnoSprint 2026 Batch Rejection Notice Email Dispatcher

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hbntxrrexilmjvxncwvc.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VGgqOJg5ycmcCRQNXm-29w_lXDIbYBM';
const CALLER_EMAIL = process.env.ADMIN_EMAIL || 'rajavardhan445@gmail.com';

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null;
const testIndex = args.indexOf('--test');
const testTargetEmail = testIndex !== -1 ? args[testIndex + 1].trim().toLowerCase() : null;

console.log('='.repeat(70));
console.log('  INNOSPRINT 2026 — Rejection Notice Email Batch Dispatcher');
console.log('='.repeat(70));
console.log(`Supabase URL : ${SUPABASE_URL}`);
console.log(`Caller Admin : ${CALLER_EMAIL}`);
console.log(`Mode         : ${isDryRun ? 'DRY RUN (No emails will be sent)' : 'LIVE DISPATCH'}`);
if (limit) console.log(`Limit        : ${limit} registration(s)`);
if (testTargetEmail) console.log(`Test Target  : ${testTargetEmail}`);
console.log('-'.repeat(70));

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  // 1. Fetch rejected registrations
  const { data: registrations, error: fetchErr } = await supabase
    .from('registrations')
    .select('id, reference_code, applicant_name, applicant_email, status, organizer_notes')
    .eq('status', 'rejected')
    .order('created_at', { ascending: false });

  if (fetchErr) {
    console.error('Error fetching registrations:', fetchErr);
    process.exit(1);
  }

  let candidates = registrations || [];

  if (testTargetEmail) {
    candidates = candidates.filter(r => (r.applicant_email || '').toLowerCase().trim() === testTargetEmail);
  }

  console.log(`Found ${candidates.length} candidate registration(s) with status = 'rejected'.`);

  if (candidates.length === 0) {
    console.log('No matching rejected registrations found.');
    return;
  }

  const toProcess = limit ? candidates.slice(0, limit) : candidates;
  console.log(`Processing ${toProcess.length} candidate(s)...\n`);

  let sentCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const reg = toProcess[i];
    const ref = reg.reference_code || reg.id;
    const email = (reg.applicant_email || '').trim();
    const name = reg.applicant_name || 'Applicant';
    const notes = reg.organizer_notes || '';
    const alreadySent = notes.includes('EMAIL_REJECTION_SENT');

    const prefix = `[${i + 1}/${toProcess.length}] ${ref} (${email})`;

    if (alreadySent && !isForce) {
      console.log(`${prefix} -> SKIPPED (Already received notice)`);
      skippedCount++;
      continue;
    }

    if (isDryRun) {
      console.log(`${prefix} -> WOULD SEND to ${name} <${email}>`);
      sentCount++;
      continue;
    }

    // Call Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('send-project-notification', {
        body: {
          registrationId: reg.id || ref,
          callerEmail: CALLER_EMAIL,
          notificationType: 'rejected',
          forceRetry: isForce,
        },
        headers: {
          'x-caller-email': CALLER_EMAIL,
        },
      });

      if (error) {
        console.error(`${prefix} -> ERROR: ${error.message || error}`);
        failedCount++;
      } else if (data?.delivered) {
        console.log(`${prefix} -> SUCCESS! Delivered. Remaining GAS Quota: ${data.quotaRemaining ?? 'N/A'}`);
        sentCount++;
      } else if (data?.alreadySent) {
        console.log(`${prefix} -> ALREADY SENT: ${data.message}`);
        skippedCount++;
      } else {
        console.error(`${prefix} -> FAILED: ${data?.error || 'Unknown error'}`);
        failedCount++;
      }
    } catch (e) {
      console.error(`${prefix} -> EXCEPTION: ${e.message}`);
      failedCount++;
    }

    // Rate-limiting delay between dispatches (500ms)
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n' + '='.repeat(70));
  console.log(`Dispatch Summary: Sent: ${sentCount} | Skipped: ${skippedCount} | Failed: ${failedCount}`);
  console.log('='.repeat(70));
}

run().catch(console.error);
