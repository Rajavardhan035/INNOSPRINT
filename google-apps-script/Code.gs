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
  SUPPORT_EMAIL: 'support@innosprint.vvit.net'
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

    // 4. Validate notification type (strictly accept only 'shortlisted')
    var notificationType = String(payload.notificationType || '').trim().toLowerCase();
    if (notificationType !== CONFIG.NOTIFICATION_TYPE) {
      return createJsonResponse({
        success: false,
        error: "Invalid Request: Only notificationType '" + CONFIG.NOTIFICATION_TYPE + "' is supported by this endpoint."
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

    // 8. Generate Subject, Plain Text, and HTML template
    var subject = 'Congratulations! Your Team Has Been Shortlisted — InnoSprint 2026';
    var plainTextBody = generatePlainText(teamName, projectTitle, referenceCode);
    var htmlBody = generateHtmlEmail(teamName, projectTitle, referenceCode, trackTheme);

    // 9. Dispatch email via MailApp
    MailApp.sendEmail({
      to: rawRecipient,
      subject: subject,
      body: plainTextBody,
      htmlBody: htmlBody,
      name: 'InnoSprint 2026 Organizing Committee'
    });

    console.info('[InnoSprint Email Sender] Shortlist notification successfully sent to: ' + rawRecipient + ' (Team: ' + teamName + ')');

    // 10. Return success response with updated quota
    return createJsonResponse({
      success: true,
      delivered: true,
      recipient: rawRecipient,
      teamName: teamName,
      projectTitle: projectTitle,
      notificationType: CONFIG.NOTIFICATION_TYPE,
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
 * Generates plain-text alternative matching the exact requested prompt template
 */
function generatePlainText(teamName, projectTitle, referenceCode) {
  return [
    'Dear ' + teamName + ',',
    '',
    'Congratulations! Your project, ' + projectTitle + ', has been shortlisted for the next stage of InnoSprint 2026.',
    '',
    (referenceCode ? 'Reference Code: ' + referenceCode + '\n' : '') +
    'Please check the official hackathon website and your registered email for further instructions and important event updates.',
    '',
    'Official Website: ' + CONFIG.WEBSITE_URL,
    'Status Verification: ' + CONFIG.STATUS_PORTAL_URL,
    '',
    'Event Dates: ' + CONFIG.EVENT_DATES,
    'Venue: ' + CONFIG.EVENT_VENUE,
    '',
    'Best regards,',
    '',
    'InnoSprint 2026 Organizing Committee'
  ].join('\n');
}

/**
 * Generates modern, responsive, cyber-themed InnoSprint HTML email
 */
function generateHtmlEmail(teamName, projectTitle, referenceCode, trackTheme) {
  var safeTeam = escapeHtml(teamName);
  var safeTitle = escapeHtml(projectTitle);
  var safeRef = escapeHtml(referenceCode);
  var safeTrack = escapeHtml(trackTheme);

  return '<!DOCTYPE html>' +
  '<html lang="en">' +
  '<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>InnoSprint 2026 Shortlist Notification</title>' +
    '<style>' +
      'body { margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; }' +
      '.container { max-width: 600px; margin: 0 auto; background-color: #0a101f; border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 16px; overflow: hidden; margin-top: 24px; margin-bottom: 24px; }' +
      '.header-bar { height: 4px; background: linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #f59e0b 100%); }' +
      '.hero-header { padding: 32px 32px 20px 32px; text-align: center; background: radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.15), transparent 70%); }' +
      '.brand-badge { display: inline-block; font-family: monospace; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #38bdf8; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; }' +
      '.main-title { font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #ffffff; margin: 0 0 6px 0; text-transform: uppercase; }' +
      '.subtitle { font-size: 13px; color: #94a3b8; margin: 0; }' +
      '.status-pill { display: inline-block; margin: 16px 0 0 0; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 9999px; }' +
      '.content-body { padding: 24px 32px 32px 32px; line-height: 1.6; }' +
      '.greeting { font-size: 16px; font-weight: bold; color: #f8fafc; margin-bottom: 16px; }' +
      '.lead-text { font-size: 15px; color: #e2e8f0; margin-bottom: 20px; }' +
      '.project-card { background-color: #070c18; border: 1px solid rgba(255, 255, 255, 0.1); border-left: 4px solid #22d3ee; border-radius: 12px; padding: 18px 20px; margin: 24px 0; }' +
      '.card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-family: monospace; color: #38bdf8; margin-bottom: 4px; font-weight: bold; }' +
      '.card-value { font-size: 16px; font-weight: bold; color: #ffffff; margin: 0 0 10px 0; }' +
      '.meta-row { display: table; width: 100%; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 10px; margin-top: 6px; }' +
      '.meta-col { display: table-cell; font-size: 12px; color: #94a3b8; font-family: monospace; }' +
      '.meta-col strong { color: #f1f5f9; }' +
      '.instructions-box { background-color: rgba(30, 41, 59, 0.6); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 12px; padding: 16px 20px; margin: 24px 0; font-size: 13px; color: #cbd5e1; }' +
      '.instructions-title { color: #f59e0b; font-weight: bold; margin-bottom: 6px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }' +
      '.cta-container { text-align: center; margin: 30px 0 20px 0; }' +
      '.cta-button { display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%); color: #040711 !important; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; padding: 13px 28px; border-radius: 10px; box-shadow: 0 4px 20px rgba(34, 211, 238, 0.35); }' +
      '.closing-block { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; color: #94a3b8; }' +
      '.closing-block strong { color: #e2e8f0; display: block; margin-top: 4px; }' +
      '.footer { padding: 24px 32px; background-color: #050811; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #64748b; line-height: 1.5; }' +
      '.footer-link { color: #38bdf8; text-decoration: none; }' +
    '</style>' +
  '</head>' +
  '<body>' +
    '<div class="container">' +
      '<div class="header-bar"></div>' +
      
      '<div class="hero-header">' +
        '<div class="brand-badge">NATIONAL HACKATHON 2026</div>' +
        '<h1 class="main-title">INNOSPRINT 2026</h1>' +
        '<p class="subtitle">VVIT University • ' + CONFIG.EVENT_DATES + '</p>' +
        '<div><span class="status-pill">★ PROJECT SHORTLISTED ★</span></div>' +
      '</div>' +

      '<div class="content-body">' +
        '<p class="greeting">Dear ' + safeTeam + ',</p>' +
        
        '<p class="lead-text">' +
          'Congratulations! Your project, <strong style="color: #22d3ee;">' + safeTitle + '</strong>, has been shortlisted for the next stage of <strong>InnoSprint 2026</strong>.' +
        '</p>' +

        '<div class="project-card">' +
          '<div class="card-label">Shortlisted Innovation Project</div>' +
          '<div class="card-value">' + safeTitle + '</div>' +
          '<div class="meta-row">' +
            (safeRef ? '<div class="meta-col">REF: <strong>' + safeRef + '</strong></div>' : '') +
            (safeTrack ? '<div class="meta-col" style="text-align: right;">TRACK: <strong>' + safeTrack + '</strong></div>' : '') +
          '</div>' +
        '</div>' +

        '<div class="instructions-box">' +
          '<div class="instructions-title">Important Next Steps</div>' +
          '<p style="margin: 0 0 8px 0;">Please check the official hackathon website and your registered email for further instructions, sprint milestone checklists, and reporting times.</p>' +
          '<p style="margin: 0; font-size: 12px; color: #94a3b8;"><strong>Reporting Venue:</strong> ' + CONFIG.EVENT_VENUE + '<br><strong>Reporting Date:</strong> October 26, 2026 at 09:00 AM IST</p>' +
        '</div>' +

        '<div class="cta-container">' +
          '<a href="' + CONFIG.STATUS_PORTAL_URL + '" class="cta-button" target="_blank">Verify Status Online &rarr;</a>' +
        '</div>' +

        '<div class="closing-block">' +
          'Best regards,' +
          '<strong>InnoSprint 2026 Organizing Committee</strong>' +
          '<span>VVIT University, Guntur, Andhra Pradesh</span>' +
        '</div>' +
      '</div>' +

      '<div class="footer">' +
        '<p style="margin: 0 0 6px 0;">You received this official notification because your team registered for InnoSprint 2026.</p>' +
        '<p style="margin: 0;">Visit: <a href="' + CONFIG.WEBSITE_URL + '" class="footer-link">' + CONFIG.WEBSITE_URL + '</a></p>' +
      '</div>' +
    '</div>' +
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
