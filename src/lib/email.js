// INNOSPRINT Email Service Integration Helper

export async function sendEmailNotification({ to, subject, template, data }) {
  console.log(`[INNOSPRINT Email Service] Dispatching email to: ${to} | Subject: ${subject}`);
  
  const resendKey = import.meta.env.VITE_RESEND_API_KEY;
  const sender = import.meta.env.VITE_SENDER_EMAIL || 'noreply@vvit.ac.in';

  if (!resendKey) {
    console.info('[Email Fallback] No email API key configured. Email payload:', {
      to,
      subject,
      template,
      data
    });
    return {
      success: true,
      delivered: false,
      message: 'Email service credential missing. Notification logged in fallback mode.'
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
  switch (template) {
    case 'registration_confirmation':
      return `
        <div style="font-family: Arial, sans-serif; background-color: #030712; color: #f3f4f6; padding: 24px; border-radius: 8px;">
          <h2 style="color: #38bdf8;">INNOSPRINT 2026 - Registration Received</h2>
          <p>Hello <strong>${data.name || 'Participant'}</strong>,</p>
          <p>Thank you for registering for INNOSPRINT (October 26–28, 2026) at VVITU!</p>
          <div style="background-color: #0f172a; padding: 16px; border: 1px solid #0284c7; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0; color: #fbbf24;"><strong>Registration Reference:</strong> ${data.referenceCode}</p>
            <p style="margin: 8px 0 0 0;"><strong>Track/Theme:</strong> ${data.theme}</p>
            <p style="margin: 8px 0 0 0;"><strong>Participation:</strong> ${data.participationType}</p>
          </div>
          <p>You can track your registration status on your participant dashboard or via our status portal.</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">INNOSPRINT Organizing Committee • VVITU, Guntur, AP</p>
        </div>
      `;
    case 'contact_acknowledgement':
      return `
        <div style="font-family: Arial, sans-serif; background-color: #030712; color: #f3f4f6; padding: 24px;">
          <h2 style="color: #38bdf8;">We Received Your Message</h2>
          <p>Hi ${data.name},</p>
          <p>Thank you for reaching out to the INNOSPRINT team. Your message reference is <strong>${data.referenceCode}</strong>.</p>
          <p>Our team will review your query and respond shortly.</p>
        </div>
      `;
    default:
      return `<p>${data.message || 'Notification from INNOSPRINT Organizers'}</p>`;
  }
}
