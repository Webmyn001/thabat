/**
 * THABĀT — Email Service via Resend
 * Sends branded, bilingual 6-digit verification codes to participants.
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

let resendClient = null;
if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
}

/**
 * Sends a 6-digit OTP email to participant
 * @param {Object} options
 * @param {string} options.toEmail
 * @param {string} options.fullName
 * @param {string} options.otpCode
 * @param {string} [options.language='en']
 */
export async function sendVerificationOtpEmail({ toEmail, fullName, otpCode, language = 'en' }) {
  const isAr = language === 'ar';
  const cleanEmail = toEmail.trim().toLowerCase();
  const cleanName = fullName ? fullName.trim() : 'Hafidh';

  // Sender address: Use custom domain or Resend testing default
  const fromEmail = process.env.EMAIL_FROM || 'THABĀT | ثبات <onboarding@resend.dev>';

  const subject = isAr 
    ? `رمز التحقق الخاص بك لمنصة ثبات: ${otpCode}` 
    : `Your THABĀT Verification Code: ${otpCode}`;

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
                90-Day Qur'an Revision Programme
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
                ${isAr 
                  ? 'أدخل رمز التحقق التالي لتأكيد بريدك الإلكتروني والبدء في برنامج المراجعة وتثبيت الحفظ (18 ختمة كاملة عبر 180 ورداً):' 
                  : 'Enter the following 6-digit verification code to confirm your email and access your 90-day Qur’an revision trajectory (18 full Khatmahs across 180 sessions):'}
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

  // Always log to console for development verification
  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH] To: ${cleanEmail}`);
  console.log(`[EMAIL DISPATCH] Subject: ${subject}`);
  console.log(`[EMAIL DISPATCH] OTP Code: ${otpCode}`);
  console.log(`======================================================\n`);

  // If Resend API Key is configured, send the real email!
  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: fromEmail,
        to: cleanEmail,
        subject,
        html: htmlContent
      });

      console.log(`✔ [Resend] Email successfully sent to ${cleanEmail}. Message ID:`, response.data?.id || response);
      return { success: true, id: response.data?.id };
    } catch (err) {
      console.error(`✖ [Resend Error] Failed to send email to ${cleanEmail}:`, err.message || err);
      // Return simulated success so development / onboarding flow is never halted
      return { success: false, error: err.message, fallbackCode: otpCode };
    }
  } else {
    console.log(`ℹ [Resend] No RESEND_API_KEY found in .env. Code displayed above for instant testing.`);
    return { success: true, simulated: true, fallbackCode: otpCode };
  }
}
