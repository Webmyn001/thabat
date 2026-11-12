/**
 * THABĀT — Email Service (Brevo API + SMTP + Resend fallback)
 * Sends branded, bilingual 6-digit verification codes to participants.
 *
 * Render's free web services block outbound SMTP ports 25/465/587, so the
 * Brevo HTTPS API is preferred whenever BREVO_API_KEY is configured.
 */

import '../config/env.js';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const SENDER_NAME = 'THABĀT | ثبات';
const HOSTED_ON_RENDER = !!process.env.RENDER;

function extractEmailAddress(value) {
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim();
}

// 1. Initialize Brevo transactional API client
const brevoApiKey = process.env.BREVO_API_KEY;
if (brevoApiKey) {
  console.log('✔ [Email Service] Initialized Brevo HTTPS API');
}

// 2. Initialize Brevo / SMTP Transporter
let smtpTransporter = null;
const brevoKey = process.env.BREVO_SMTP_KEY || process.env.SMTP_PASS;
const brevoUser = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;

if (brevoKey && brevoUser) {
  const host = process.env.BREVO_SMTP_HOST || process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = parseInt(process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || '587', 10);
  
  smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 (STARTTLS)
    auth: {
      user: brevoUser,
      pass: brevoKey,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });

  if (HOSTED_ON_RENDER) {
    console.warn('⚠ [Email Service] SMTP is skipped on Render (outbound SMTP ports are blocked). Set BREVO_API_KEY.');
  } else {
    console.log(`✔ [Email Service] Initialized Brevo SMTP via ${host}:${port} (${brevoUser})`);
  }
}

// 3. Initialize Resend Client (optional fallback)
let resendClient = null;
if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
  console.log('✔ [Email Service] Initialized Resend fallback client');
}

/**
 * Sends a 6-digit OTP email. Also used for administrator password resets.
 * @param {Object} options
 * @param {string} options.toEmail
 * @param {string} options.fullName
 * @param {string} options.otpCode
 * @param {string} [options.language='en']
 * @param {'verification'|'password_reset'} [options.purpose='verification']
 */
export async function sendVerificationOtpEmail({ toEmail, fullName, otpCode, language = 'en', purpose = 'verification' }) {
  const isAr = language === 'ar';
  const isPasswordReset = purpose === 'password_reset';
  const cleanEmail = toEmail.trim().toLowerCase();
  const cleanName = fullName ? fullName.trim() : 'Hafidh';

  // Sender address: Matches verified Brevo email or default
  const defaultFrom = brevoUser 
    ? `THABĀT | ثبات <${brevoUser}>` 
    : 'THABĀT | ثبات <onboarding@resend.dev>';
  const fromEmail = process.env.EMAIL_FROM || defaultFrom;

  const subject = isPasswordReset
    ? (isAr
        ? `رمز إعادة تعيين كلمة مرور الإدارة في ثبات: ${otpCode}`
        : `Your THABĀT Admin Password Reset Code: ${otpCode}`)
    : (isAr
        ? `رمز التحقق الخاص بك لمنصة ثبات: ${otpCode}`
        : `Your THABĀT Verification Code: ${otpCode}`);

  const htmlContent = `
<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #064e3b 0%, #042f2e 100%); padding: 36px 30px; text-align: center; color: #ffffff;">
              <div style="font-size: 26px; font-weight: 900; letter-spacing: 1px; color: #ffffff; margin-bottom: 4px;">
                THABĀT | ثبات
              </div>
              <div style="font-size: 13px; color: #6ee7b7; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                ${isPasswordReset
                  ? (isAr ? 'إعادة تعيين كلمة مرور الإدارة' : 'Administrator Password Reset')
                  : '90-Day Qur\'an Revision Programme'}
              </div>
              <div style="margin-top: 14px; font-size: 15px; color: #a7f3d0; font-family: 'Amiri', 'Traditional Arabic', serif;">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="font-size: 16px; margin: 0 0 16px; color: #0f172a; font-weight: 600;">
                ${isAr ? `السلام عليكم ورحمة الله وبركاته، أخي الحافظ ${cleanName}،` : `Assalamu alaykum wa rahmatullah, ${cleanName},`}
              </p>
              
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
                ${isPasswordReset
                  ? (isAr
                      ? 'استخدم رمز التحقق التالي لإعادة تعيين كلمة مرور حساب الإدارة الخاص بك. لا تشارك هذا الرمز مع أي شخص:'
                      : 'Use the following 6-digit code to reset your administrator account password. Do not share this code with anyone:')
                  : (isAr
                      ? 'أدخل رمز التحقق التالي لتأكيد بريدك الإلكتروني والبدء في برنامج المراجعة وتثبيت الحفظ (18 ختمة كاملة عبر 180 ورداً):'
                      : 'Enter the following 6-digit verification code to confirm your email and access your 90-day Qur’an revision trajectory (18 full Khatmahs across 180 sessions):')}
              </p>

              <!-- OTP Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 16px; padding: 18px 36px; text-align: center;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #065f46;">
                        ${otpCode}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Single Verification Notice (Option B) -->
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin: 24px 0 16px;">
                <p style="font-size: 12px; color: #334155; margin: 0 0 6px; font-weight: 600;">
                  ⏳ ${isAr ? 'الرمز صالح لمدة 15 دقيقة فقط.' : 'This code is valid for 15 minutes only.'}
                </p>
                <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.4;">
                  ✨ ${isAr 
                    ? 'بمجرد التحقق، سيبقى جهازك مسجلاً ومحفوظاً طوال مدة البرنامج الـ 90 يوماً بلا حاجة لإعادة إدخال الرمز يومياً.' 
                    : 'Once verified, your device will remain logged in for the full 90-day programme without needing daily OTP codes.'}
                </p>
              </div>

              <p style="font-size: 12px; color: #94a3b8; margin: 24px 0 0; line-height: 1.5;">
                ${isAr 
                  ? 'إذا لم تكن قد طلبت هذا الرمز، يُرجى تجاهل هذه الرسالة.' 
                  : 'If you did not request this verification code, you can safely ignore this email.'}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
              <p style="font-size: 12px; font-weight: bold; color: #047857; margin: 0 0 4px;">
                ${isAr ? 'تثبيت الحفظ بدوام المداومة' : 'Strengthening Hifz Through Consistency.'}
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                THABĀT — 100% Free Public Qur'an Revision Platform
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Log the dispatch without exposing the OTP code (the subject contains it).
  console.log(`\n[EMAIL DISPATCH] To: ${cleanEmail} | Purpose: ${purpose}\n`);

  const senderAddress = extractEmailAddress(fromEmail);
  const canUseSmtp = !HOSTED_ON_RENDER;

  // 1. Try the Brevo HTTPS API first (required on Render).
  if (brevoApiKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: SENDER_NAME, email: senderAddress },
          replyTo: { email: senderAddress },
          to: [{ email: cleanEmail, name: cleanName }],
          subject,
          htmlContent
        }),
        signal: AbortSignal.timeout(20000)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Brevo API responded with HTTP ${res.status}`);
      }

      console.log(`✔ [Brevo API] Email successfully dispatched to ${cleanEmail}. Message ID: ${data.messageId || 'n/a'}`);
      return { success: true, id: data.messageId, provider: 'brevo-api' };
    } catch (err) {
      console.error(`✖ [Brevo API Error] Failed to send email to ${cleanEmail}:`, err.message || err);
      if (!smtpTransporter && !resendClient) {
        return { success: false, error: err.message || 'Brevo API delivery failed' };
      }
    }
  }

  // 2. Try Brevo SMTP (local development; blocked on Render free services).
  if (smtpTransporter && canUseSmtp) {
    try {
      const info = await smtpTransporter.sendMail({
        from: fromEmail,
        replyTo: fromEmail,
        to: cleanEmail,
        subject,
        html: htmlContent
      });

      console.log(`✔ [Brevo SMTP] Email successfully dispatched to ${cleanEmail}. Message ID: ${info.messageId}`);
      return { success: true, id: info.messageId, provider: 'brevo' };
    } catch (err) {
      console.error(`✖ [Brevo SMTP Error] Failed to send email to ${cleanEmail}:`, err.message || err);
      // If Resend is also available, try fallback; otherwise report the failure.
      if (!resendClient) {
        return { success: false, error: err.message || 'Brevo SMTP delivery failed' };
      }
    }
  }

  // 3. Try Resend if configured
  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: fromEmail,
        to: cleanEmail,
        subject,
        html: htmlContent
      });

      if (response?.error) {
        console.error(`✖ [Resend Error] Failed to send email to ${cleanEmail}:`, response.error);
        return { success: false, error: response.error.message || 'Resend delivery failed' };
      }

      console.log(`✔ [Resend] Email successfully sent to ${cleanEmail}. Message ID:`, response.data?.id || response);
      return { success: true, id: response.data?.id, provider: 'resend' };
    } catch (err) {
      console.error(`✖ [Resend Error] Failed to send email to ${cleanEmail}:`, err.message || err);
      return { success: false, error: err.message || 'Resend delivery failed' };
    }
  }

  // 4. No usable provider: this is a configuration error, not a success.
  if (HOSTED_ON_RENDER && smtpTransporter) {
    console.error('✖ [Email Service] SMTP is blocked on Render. Add BREVO_API_KEY to the backend environment.');
    return {
      success: false,
      error: 'Email delivery is not configured for production. Add BREVO_API_KEY to the backend environment.'
    };
  }

  console.error('✖ [Email Service] No live SMTP, Brevo API, or Resend credentials configured. Cannot deliver OTP email.');
  return {
    success: false,
    error: 'No email provider is configured. Set BREVO_API_KEY, BREVO_SMTP_*, or RESEND_API_KEY.'
  };
}

/**
 * Sends an administrator password-reset OTP.
 */
export async function sendPasswordResetOtpEmail({ toEmail, fullName, otpCode, language = 'en' }) {
  return sendVerificationOtpEmail({
    toEmail,
    fullName,
    otpCode,
    language,
    purpose: 'password_reset'
  });
}
