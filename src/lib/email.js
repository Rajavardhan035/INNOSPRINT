// INNOSPRINT Email Service Integration Helper
import { supabase, isSupabaseConfigured } from './supabase.js';

/**
 * Invokes the Supabase Edge Function to dispatch an official shortlisted project email
 * via the configured Google Apps Script endpoint.
 *
 * @param {Object} params
 * @param {string} params.registrationId - UUID or reference code of the approved registration
 * @param {string} [params.submissionId] - Optional project_submissions UUID
 * @param {boolean} [params.forceRetry=false] - If true, bypasses duplicate check to retry delivery
 */
export async function sendProjectApprovalEmail({ registrationId, submissionId, forceRetry = false, notificationType = 'shortlisted' }) {
  const targetId = registrationId || submissionId;
  if (!targetId) {
    return { success: false, error: 'Registration or Submission ID is required.' };
  }

  if (!isSupabaseConfigured) {
    console.info('[Email Fallback] Offline mode. Shortlist email recorded locally for:', targetId);
    return {
      success: true,
      delivered: false,
      isLocalFallback: true,
      message: 'Offline mode active. Shortlist email simulated.',
    };
  }

  try {
    // Resolve current active admin email for caller identification
    let callerEmail = '';
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        callerEmail = session.user.email;
      }
    } catch {}

    if (!callerEmail) {
      try {
        const stored = JSON.parse(localStorage.getItem('inno_sprint_user') || '{}');
        callerEmail = stored?.user?.email || stored?.profile?.email || '';
      } catch {}
    }

    const { data, error } = await supabase.functions.invoke('send-project-notification', {
      body: {
        registrationId,
        submissionId: submissionId || registrationId,
        forceRetry,
        callerEmail,
        notificationType,
      },
      headers: callerEmail ? { 'x-caller-email': callerEmail } : {},
    });

    if (error) {
      console.warn('[Email Edge Function Notice]', error);
      const errMsg = error.message || 'Failed to dispatch email via Edge Function';
      return {
        success: false,
        delivered: false,
        canRetry: true,
        error: errMsg,
      };
    }

    return {
      success: data?.success ?? true,
      delivered: data?.delivered ?? false,
      alreadySent: Boolean(data?.alreadySent),
      recipient: data?.recipient,
      teamName: data?.teamName,
      projectTitle: data?.projectTitle,
      sentAt: data?.sentAt,
      error: data?.error,
      canRetry: Boolean(data?.canRetry),
    };
  } catch (err) {
    console.error('[sendProjectApprovalEmail Exception]', err);
    return {
      success: false,
      delivered: false,
      canRetry: true,
      error: err.message || 'An unexpected error occurred during email dispatch.',
    };
  }
}

export async function sendEmailNotification({ to, subject, template, data }) {
  const resendKey = import.meta.env.VITE_RESEND_API_KEY;
  const sender = import.meta.env.VITE_SENDER_EMAIL || 'noreply@vvit.ac.in';

  if (!resendKey) {
    // Clarify that Resend is only used for participant self-registration confirmation and contact forms
    console.info('[Resend Service] VITE_RESEND_API_KEY is not configured for participant registration confirmation/contact forms. Skipping Resend dispatch.');
    return {
      success: true,
      delivered: false,
      message: 'Resend API key missing. Participant confirmation logged in fallback mode.'
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: `INNOSPRINT Organizers <${sender}>`,
        to: [to],
        subject: subject,
        html: generateEmailHtml(template, data)
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to dispatch email');
    }

    return { success: true, delivered: true, data: result };
  } catch (error) {
    console.error('[Email Dispatch Error]', error);
    return { success: false, error: error.message };
  }
}

function generateEmailHtml(template, data) {
  const portalUrl = `https://inno-sprint.vercel.app/register/status${data.referenceCode ? `?ref=${encodeURIComponent(data.referenceCode)}` : ''}`;

  switch (template) {
    case 'registration_confirmation':
      return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>INNOSPRINT 2026: Registration Received</title></head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 24px 0;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="background-color: #0f172a; padding: 24px 32px; border-bottom: 3px solid #0284c7;">
                      <div style="color: #38bdf8; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">National Hackathon 2026</div>
                      <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 4px 0 0 0;">INNOSPRINT 2026</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 28px 32px; color: #1e293b; font-size: 15px; line-height: 1.6;">
                      <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Dear ${data.name || 'Participant'},</p>
                      <p style="margin: 0 0 16px 0; color: #334155;">
                        Thank you for registering for <strong>INNOSPRINT 2026</strong> at Vasireddy Venkatadri Institute of Technology (VVIT). Your application has been logged and queued for review.
                      </p>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 20px 0; font-size: 13px;">
                        <tr>
                          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 35%; color: #64748b; font-weight: 600;">Reference Code</td>
                          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-family: monospace; font-weight: 700;">${data.referenceCode}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Track / Theme</td>
                          <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #334155;">${data.theme || 'Open Innovation'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; color: #64748b; font-weight: 600;">Participation Type</td>
                          <td style="padding: 12px 16px; color: #334155;">${data.participationType || 'Individual'}</td>
                        </tr>
                      </table>
                      <div style="text-align: center; margin: 24px 0;">
                        <a href="${portalUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 6px;">Check Live Application Status &rarr;</a>
                      </div>
                      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 13px; color: #64748b;">
                        <p style="margin: 0;">INNOSPRINT 2026 Organizing Committee</p>
                        <p style="margin: 2px 0 0 0;">VVIT University, Guntur, Andhra Pradesh</p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; text-align: center; font-size: 11px; color: #64748b;">
                      Official Event Portal: <a href="https://inno-sprint.vercel.app" style="color: #0284c7; text-decoration: none;">https://inno-sprint.vercel.app</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    case 'contact_acknowledgement':
      return `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>INNOSPRINT 2026: Message Received</title></head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 24px 0;">
            <tr>
              <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                  <tr>
                    <td style="background-color: #0f172a; padding: 24px 32px; border-bottom: 3px solid #0284c7;">
                      <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0;">INNOSPRINT 2026 Helpdesk</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 24px 32px; color: #1e293b; font-size: 15px; line-height: 1.6;">
                      <p style="margin: 0 0 12px 0; font-weight: 600; color: #0f172a;">Dear ${data.name || 'Participant'},</p>
                      <p style="margin: 0 0 16px 0; color: #334155;">
                        Thank you for reaching out. We have logged your enquiry under inquiry reference: <strong>${data.referenceCode}</strong>.
                      </p>
                      <p style="margin: 0 0 16px 0; color: #334155;">
                        Our student coordinators and technical committee will review your query and reply to this thread shortly.
                      </p>
                      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 20px; font-size: 13px; color: #64748b;">
                        <p style="margin: 0;">INNOSPRINT 2026 Secretariat • VVIT University</p>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    default:
      return `<p>${data.message || 'Official Notification from INNOSPRINT Organizers'}</p>`;
  }
}

export { sendEmailNotification as sendEmail };
