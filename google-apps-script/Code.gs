/**
 * ============================================================================
 * InnoSprint 2026 — Official Project Approval Email Dispatcher
 * Google Apps Script Project: "InnoSprint Email Notification"
 * ============================================================================
 * 
 * Features:
 *  - Secure webhook endpoint (doPost) validating EMAIL_WEBHOOK_SECRET
 *  - Strict payload validation (only 'shortlisted' notification type accepted)
 *  - Sanitization & dynamic HTML escaping against injection attacks
 *  - Responsive, high-conversion InnoSprint 2026 branded HTML email
 *  - RFC-compliant plain-text alternative fallback
 *  - Informative JSON responses with quota telemetry
 *  - Zero credential leakage in error responses
 */

// Configuration constants
var CONFIG = {
  NOTIFICATION_TYPE: 'shortlisted',
  EVENT_NAME: 'InnoSprint 2026',
  EVENT_DATES: 'October 26–28, 2026',
  EVENT_VENUE: 'VVIT University, Guntur, Andhra Pradesh, India',
  WEBSITE_URL: 'https://inno-sprint.vercel.app',
  STATUS_PORTAL_URL: 'https://inno-sprint.vercel.app/register/status',
  SUPPORT_EMAIL: 'innosprint2k26@gmail.com'
};

/**
 * HTTP GET handler - Liveness health check & status probe
 */
function doGet(e) {
  var remainingQuota = 0;
  try {
    remainingQuota = MailApp.getRemainingDailyQuota();
  } catch (err) {
    remainingQuota = -1;
  }

  return createJsonResponse({
    success: true,
    service: 'InnoSprint Email Notification',
    status: 'ONLINE',
    event: CONFIG.EVENT_NAME,
    remainingDailyQuota: remainingQuota,
    timestamp: new Date().toISOString()
  }, 200);
}

/**
 * HTTP POST handler - Main webhook for project shortlist notifications
 */
function doPost(e) {
  try {
    // 1. Verify that a body was supplied
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        error: 'Bad Request: Missing POST payload body.'
      }, 400);
    }

    // 2. Parse JSON payload safely
    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return createJsonResponse({
        success: false,
        error: 'Bad Request: Malformed JSON payload.'
      }, 400);
    }

    // 3. Authenticate shared secret against Script Properties
    var scriptProperties = PropertiesService.getScriptProperties();
    var configuredSecret = scriptProperties.getProperty('EMAIL_WEBHOOK_SECRET');

    if (!configuredSecret) {
      console.error('[InnoSprint Email Notification] EMAIL_WEBHOOK_SECRET is not configured in Script Properties.');
      return createJsonResponse({
        success: false,
        error: 'Configuration Error: Webhook secret has not been set in Script Properties.'
      }, 500);
    }

    var providedSecret = payload.secret || payload.webhookSecret || '';
    if (!constantTimeCompare(providedSecret, configuredSecret)) {
      console.warn('[InnoSprint Email Notification] Unauthorized request rejected. Provided secret does not match.');
      return createJsonResponse({
        success: false,
        error: 'Unauthorized: Invalid or missing webhook secret.'
      }, 401);
    }

    // 4. Validate notification type (accept 'shortlisted' or 'approved')
    var notificationType = String(payload.notificationType || 'shortlisted').trim().toLowerCase();
    if (notificationType !== 'shortlisted' && notificationType !== 'approved') {
      return createJsonResponse({
        success: false,
        error: "Invalid Request: Only notificationType 'shortlisted' or 'approved' is supported by this endpoint."
      }, 400);
    }

    // 5. Validate recipient email
    var rawRecipient = String(payload.recipientEmail || '').trim();
    if (!isValidEmail(rawRecipient)) {
      return createJsonResponse({
        success: false,
        error: 'Validation Error: Invalid recipient email address provided: ' + rawRecipient
      }, 400);
    }

    // 6. Check Google daily sending quota
    var remainingQuota = MailApp.getRemainingDailyQuota();
    if (remainingQuota <= 0) {
      console.error('[InnoSprint Email Sender] Daily email quota exhausted.');
      return createJsonResponse({
        success: false,
        error: 'Service Unavailable: Google Apps Script daily email sending quota has been exhausted. Please retry tomorrow or upgrade workspace.',
        quotaRemaining: 0
      }, 503);
    }

    // 7. Extract & sanitize parameters
    var teamName = String(payload.teamName || 'Innovators').trim();
    var projectTitle = String(payload.projectTitle || 'Untitled Innovation Pitch').trim();
    var referenceCode = String(payload.referenceCode || '').trim();
    var trackTheme = String(payload.theme || '').trim();

    // 8. Generate Subject, Plain Text, and High-Deliverability HTML template
    var isApproval = notificationType === 'approved';
    var subject = isApproval
      ? 'INNOSPRINT 2026: Your Registration Has Been Approved'
      : 'INNOSPRINT 2026: Shortlist Notification';

    var plainTextBody = generatePlainText(teamName, projectTitle, referenceCode, notificationType, trackTheme);
    var htmlBody = generateHtmlEmail(teamName, projectTitle, referenceCode, trackTheme, notificationType);

    // 9. Dispatch email via MailApp with proper reply-to and recognizable sender identity
    MailApp.sendEmail({
      to: rawRecipient,
      subject: subject,
      body: plainTextBody,
      htmlBody: htmlBody,
      name: 'INNOSPRINT 2026 Organizing Committee',
      replyTo: CONFIG.SUPPORT_EMAIL
    });

    console.info('[InnoSprint Email Sender] Official notification sent to: ' + rawRecipient + ' (Team: ' + teamName + ', Type: ' + notificationType + ')');

    // 10. Return success response with updated quota
    return createJsonResponse({
      success: true,
      delivered: true,
      recipient: rawRecipient,
      teamName: teamName,
      projectTitle: projectTitle,
      notificationType: notificationType,
      subject: subject,
      quotaRemaining: MailApp.getRemainingDailyQuota(),
      timestamp: new Date().toISOString()
    }, 200);

  } catch (err) {
    console.error('[InnoSprint Email Sender Exception]', err);
    return createJsonResponse({
      success: false,
      error: 'Internal Error: ' + (err.message || 'An unexpected error occurred while dispatching email.')
    }, 500);
  }
}

/**
 * Validates email format using standard pattern
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Timing-safe string comparison to mitigate timing attacks on webhook secrets
 */
function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  var result = 0;
  for (var i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Escapes HTML characters to prevent XSS / HTML injection in dynamic email bodies
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates clean, RFC-compliant plain text matching the HTML message content
 */
function generatePlainText(teamName, projectTitle, referenceCode, notificationType, trackTheme) {
  var isApproval = notificationType === 'approved';
  var statusPhrase = isApproval
    ? 'your registration has been approved'
    : 'your project has been shortlisted for the next stage';

  var portalUrl = CONFIG.STATUS_PORTAL_URL + (referenceCode ? '?ref=' + encodeURIComponent(referenceCode) : '');

  return [
    'Dear ' + teamName + ',',
    '',
    'We are writing to confirm that ' + statusPhrase + ' of INNOSPRINT 2026.',
    '',
    'REGISTRATION AND EVENT DETAILS',
    '------------------------------------------------------------',
    'Event: INNOSPRINT 2026 National Hackathon',
    'Status: ' + (isApproval ? 'Approved' : 'Shortlisted'),
    'Project Title: ' + projectTitle,
    (referenceCode ? 'Reference Code: ' + referenceCode + '\n' : '') +
    (trackTheme ? 'Innovation Track: ' + trackTheme + '\n' : '') +
    'Event Dates: ' + CONFIG.EVENT_DATES,
    'Venue: ' + CONFIG.EVENT_VENUE,
    '------------------------------------------------------------',
    '',
    'NEXT STEPS FOR YOUR TEAM:',
    '1. Review and verify your registration dossier, team roster, and checklist on the official status portal:',
    '   ' + portalUrl,
    '2. Plan your travel to arrive at the venue on October 26, 2026 at 09:00 AM IST.',
    '3. Ensure all team members carry valid college/institution identity cards.',
    '',
    'If you have any questions or require official participation documentation, please reply directly to this email or contact our organizing desk at ' + CONFIG.SUPPORT_EMAIL + '.',
    '',
    'Best regards,',
    'INNOSPRINT 2026 Organizing Committee',
    'Vasireddy Venkatadri Institute of Technology (VVIT)',
    'Nambur, Guntur, Andhra Pradesh – 522508, India',
    'Official Portal: ' + CONFIG.WEBSITE_URL
  ].join('\n');
}

/**
 * Generates clean, professional, deliverability-optimized HTML email
 * Built with bulletproof table layout, high-contrast readable styling,
 * legitimate institutional identification, and zero spam triggers.
 */
function generateHtmlEmail(teamName, projectTitle, referenceCode, trackTheme, notificationType) {
  var safeTeam = escapeHtml(teamName);
  var safeTitle = escapeHtml(projectTitle);
  var safeRef = escapeHtml(referenceCode);
  var safeTrack = escapeHtml(trackTheme);
  var isApproval = notificationType === 'approved';
  var statusBadgeText = isApproval ? 'REGISTRATION APPROVED' : 'PROJECT SHORTLISTED';
  var statusPhrase = isApproval
    ? 'your registration has been approved'
    : 'your project has been shortlisted for the next stage';

  var portalUrl = CONFIG.STATUS_PORTAL_URL + (safeRef ? '?ref=' + encodeURIComponent(safeRef) : '');

  return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
  '<html xmlns="http://www.w3.org/1999/xhtml" lang="en">' +
  '<head>' +
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
    '<title>INNOSPRINT 2026 Notification</title>' +
    '<style type="text/css">' +
      'body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; -webkit-font-smoothing: antialiased; }' +
      'table { border-collapse: collapse; }' +
      'td { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }' +
      '.btn-primary:hover { background-color: #0369a1 !important; }' +
    '</style>' +
  '</head>' +
  '<body style="margin: 0; padding: 0; background-color: #f1f5f9;">' +
    '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 24px 0;">' +
      '<tr>' +
        '<td align="center">' +
          '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">' +
            
            '<!-- Institutional Header -->' +
            '<tr>' +
              '<td style="background-color: #0f172a; padding: 28px 32px; border-bottom: 3px solid #0284c7; text-align: left;">' +
                '<div style="color: #38bdf8; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px;">National Hackathon 2026</div>' +
                '<h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: 0.5px;">INNOSPRINT 2026</h1>' +
                '<p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">VVIT University • ' + CONFIG.EVENT_DATES + '</p>' +
              '</td>' +
            '</tr>' +

            '<!-- Status Pill Banner -->' +
            '<tr>' +
              '<td style="padding: 20px 32px 0 32px;">' +
                '<span style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 6px 14px; border-radius: 4px; text-transform: uppercase;">' +
                  '&#10003; ' + statusBadgeText +
                '</span>' +
              '</td>' +
            '</tr>' +

            '<!-- Main Content -->' +
            '<tr>' +
              '<td style="padding: 20px 32px 28px 32px; color: #1e293b; font-size: 15px; line-height: 1.6;">' +
                '<p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #0f172a;">Dear ' + safeTeam + ',</p>' +
                '<p style="margin: 0 0 20px 0; color: #334155;">' +
                  'We are pleased to inform you that <strong>' + statusPhrase + '</strong> of <strong>INNOSPRINT 2026</strong>.' +
                '</p>' +

                '<!-- Details Box -->' +
                '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 20px 0; font-size: 13px;">' +
                  '<tr>' +
                    '<td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; width: 35%; color: #64748b; font-weight: 600;">Project Title</td>' +
                    '<td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">' + safeTitle + '</td>' +
                  '</tr>' +
                  (safeRef ? (
                    '<tr>' +
                      '<td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Reference Code</td>' +
                      '<td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #0284c7; font-family: monospace; font-weight: 700;">' + safeRef + '</td>' +
                    '</tr>'
                  ) : '') +
                  (safeTrack ? (
                    '<tr>' +
                      '<td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Innovation Track</td>' +
                      '<td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #334155;">' + safeTrack + '</td>' +
                    '</tr>'
                  ) : '') +
                  '<tr>' +
                    '<td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Event Dates</td>' +
                    '<td style="padding: 12px 18px; border-bottom: 1px solid #e2e8f0; color: #334155;">' + CONFIG.EVENT_DATES + '</td>' +
                  '</tr>' +
                  '<tr>' +
                    '<td style="padding: 12px 18px; color: #64748b; font-weight: 600;">Reporting Venue</td>' +
                    '<td style="padding: 12px 18px; color: #334155;">' + CONFIG.EVENT_VENUE + '</td>' +
                  '</tr>' +
                '</table>' +

                '<!-- Next Steps -->' +
                '<h3 style="font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin: 24px 0 10px 0;">Next Steps</h3>' +
                '<ul style="margin: 0 0 24px 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6;">' +
                  '<li style="margin-bottom: 6px;">Verify your complete team roster and milestone checklist on the official status portal.</li>' +
                  '<li style="margin-bottom: 6px;">Report at the VVIT campus on <strong>October 26, 2026 at 09:00 AM IST</strong>.</li>' +
                  '<li>Bring your personal laptops and valid college identity cards for verification.</li>' +
                '</ul>' +

                '<!-- Primary Action Button -->' +
                '<div style="text-align: center; margin: 28px 0 20px 0;">' +
                  '<a href="' + portalUrl + '" class="btn-primary" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 6px; letter-spacing: 0.5px;">View Registration Dossier &rarr;</a>' +
                '</div>' +
                '<p style="text-align: center; font-size: 12px; color: #64748b; margin: 0 0 24px 0;">' +
                  'Or verify directly at: <a href="' + CONFIG.STATUS_PORTAL_URL + '" style="color: #0284c7; text-decoration: underline;">' + CONFIG.STATUS_PORTAL_URL + '</a>' +
                '</p>' +

                '<!-- Formal Closing -->' +
                '<div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px; font-size: 13px; color: #475569;">' +
                  '<p style="margin: 0 0 4px 0;">Best regards,</p>' +
                  '<p style="margin: 0; font-weight: 700; color: #0f172a;">INNOSPRINT 2026 Organizing Committee</p>' +
                  '<p style="margin: 2px 0 0 0; color: #64748b;">Vasireddy Venkatadri Institute of Technology (VVIT)</p>' +
                  '<p style="margin: 2px 0 0 0; color: #64748b;">Nambur, Guntur, Andhra Pradesh – 522508</p>' +
                '</div>' +
              '</td>' +
            '</tr>' +

            '<!-- Footer -->' +
            '<tr>' +
              '<td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">' +
                '<p style="margin: 0 0 4px 0;">This is an official transactional message sent to registered participants of INNOSPRINT 2026.</p>' +
                '<p style="margin: 0;">Have questions? Reply directly to this email or reach us at <a href="mailto:' + CONFIG.SUPPORT_EMAIL + '" style="color: #0284c7; text-decoration: none;">' + CONFIG.SUPPORT_EMAIL + '</a>.</p>' +
              '</td>' +
            '</tr>' +

          '</table>' +
        '</td>' +
      '</tr>' +
    '</table>' +
  '</body>' +
  '</html>';
}

/**
 * Helper to build JSON responses with proper headers
 */
function createJsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * ============================================================================
 * ONE-CLICK AUTHORIZATION & TELEMETRY TEST
 * ============================================================================
 * Run this function directly inside the Google Apps Script editor toolbar.
 * It forces Google to prompt for MailApp permission ("Review permissions > Allow")
 * and verifies that your Gmail account is authorized to send emails.
 */
function testEmailAuthorization() {
  var remainingQuota = MailApp.getRemainingDailyQuota();
  Logger.log('Current remaining daily email quota: ' + remainingQuota);

  var scriptProperties = PropertiesService.getScriptProperties();
  var configuredSecret = scriptProperties.getProperty('EMAIL_WEBHOOK_SECRET');
  Logger.log('EMAIL_WEBHOOK_SECRET is currently ' + (configuredSecret ? 'SET (length: ' + configuredSecret.length + ')' : 'MISSING!'));

  var testRecipient = Session.getActiveUser().getEmail() || 'rajavardhan445@gmail.com';
  Logger.log('Sending test authorization email to: ' + testRecipient);

  MailApp.sendEmail({
    to: testRecipient,
    subject: 'InnoSprint 2026 — Google Apps Script Authorization Test',
    body: 'This is an automatic confirmation verifying that your Google Apps Script has been successfully authorized to dispatch InnoSprint 2026 emails via MailApp.',
    name: 'InnoSprint 2026 Organizing Committee'
  });

  Logger.log('SUCCESS: MailApp is authorized and working! Test email dispatched to ' + testRecipient);
}

/**
 * Convenience helper to set EMAIL_WEBHOOK_SECRET via script execution
 * if you prefer not to use Project Settings manually.
 */
function setWebhookSecret(secretValue) {
  if (!secretValue) {
    Logger.log('Error: Pass a non-empty string secret.');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('EMAIL_WEBHOOK_SECRET', String(secretValue).trim());
  Logger.log('SUCCESS: EMAIL_WEBHOOK_SECRET has been saved to Script Properties.');
}

