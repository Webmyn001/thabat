import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store } from '../data/store.js';
import { JWT_SECRET, authenticateToken, requireAdmin } from '../middleware/auth.js';
import { sendVerificationOtpEmail, sendPasswordResetOtpEmail } from '../utils/emailService.js';

const router = express.Router();

const OTP_TTL_MS = 15 * 60 * 1000;
const OTP_PURPOSE_LOGIN = 'login';
const OTP_PURPOSE_ADMIN_RESET = 'admin_password_reset';
const MIN_PASSWORD_LENGTH = 8;

// Helper: generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function todayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Sends an OTP email and throws a 502 error if the email provider rejects it.
 * We never return the code to the client: the participant must receive it by
 * email, so a delivery failure is surfaced instead of silently showing a
 * development-only code.
 */
async function deliverOtpEmail({ toEmail, fullName, otpCode, language, purpose = 'verification' }) {
  const result = purpose === 'password_reset'
    ? await sendPasswordResetOtpEmail({ toEmail, fullName, otpCode, language })
    : await sendVerificationOtpEmail({ toEmail, fullName, otpCode, language });

  if (!result || !result.success) {
    const reason = result?.error || 'Unknown email provider error';
    console.error(`[OTP Email] Delivery failed for ${toEmail}: ${reason}`);
    const error = new Error(
      "We could not send the verification email right now. Please try again in a moment."
    );
    error.statusCode = 502;
    error.isEmailError = true;
    throw error;
  }

  return result;
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH;
}

function safeUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function issueToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '90d' }
  );
}

function createOtp(email, purpose = OTP_PURPOSE_LOGIN) {
  const otp = generateOtp();
  store.insert('verificationCodes', {
    email,
    code: otp,
    purpose,
    used: false,
    expiresAt: Date.now() + OTP_TTL_MS,
    createdAt: new Date().toISOString()
  });
  return otp;
}

function findValidOtp(email, code, purpose) {
  const codes = store.find(
    'verificationCodes',
    c => c.email === email && !c.used && (c.purpose || OTP_PURPOSE_LOGIN) === purpose
  );
  return codes.reverse().find(c => c.code === code && c.expiresAt > Date.now()) || null;
}

function consumeOtp(entry) {
  if (entry) {
    store.update('verificationCodes', c => c.id === entry.id, { used: true, usedAt: new Date().toISOString() });
  }
}

function consumeAllOtps(email, purpose) {
  store.find(
    'verificationCodes',
    c => c.email === email && !c.used && (c.purpose || OTP_PURPOSE_LOGIN) === purpose
  ).forEach(entry => consumeOtp(entry));
}

// POST /api/auth/register
// Participants register with Full Name, Email, Phone, Start Date, and Hifz declaration.
// A 6-digit OTP is sent to their email to verify identity. No password is used.
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, hifzDeclarationAccepted, preferredLanguage, startDate } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: "Full Name and Email are required." });
    }

    if (!hifzDeclarationAccepted) {
      return res.status(400).json({
        error: "You must accept the testimony confirming you have memorised the entire Qur'an."
      });
    }

    if (startDate) {
      const isValidDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(startDate);
      if (!isValidDateFormat) {
        return res.status(400).json({ error: "Please provide a valid programme start date." });
      }
      if (startDate < todayDateString()) {
        return res.status(400).json({
          error: "The programme start date cannot be earlier than today."
        });
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    // Check if user already exists
    let user = store.findOne('users', u => u.email === cleanEmail);

    if (user && user.role === 'admin') {
      return res.status(403).json({
        error: "This email belongs to an administrator. Please use the Administrator Portal."
      });
    }

    if (user && user.isEmailVerified) {
      // Existing verified participant: issue a login OTP instead.
      const otp = createOtp(cleanEmail, OTP_PURPOSE_LOGIN);

      await deliverOtpEmail({
        toEmail: cleanEmail,
        fullName: user.fullName,
        otpCode: otp,
        language: user.preferredLanguage || preferredLanguage || 'en'
      });

      return res.json({
        message: "You already have a verified account. A verification code has been sent to your email to log in.",
        email: cleanEmail,
        requiresOtp: true,
        isExisting: true
      });
    }

    if (!user) {
      user = store.insert('users', {
        fullName: cleanName,
        email: cleanEmail,
        phone: phone ? phone.trim() : "",
        role: "participant",
        isEmailVerified: false,
        hifzDeclarationAccepted: true,
        hifzDeclarationAcceptedAt: new Date().toISOString(),
        preferredLanguage: preferredLanguage === 'ar' ? 'ar' : 'en',
        createdAt: new Date().toISOString()
      });

      // Create initial enrolment
      const effectiveStartDate = startDate || todayDateString();
      store.insert('enrolments', {
        userId: user.id,
        startDate: effectiveStartDate,
        currentProgramDay: 1,
        currentPhase: 1,
        isCompleted: false,
        createdAt: new Date().toISOString()
      });
    } else {
      // Update details if pending
      store.update('users', u => u.id === user.id, {
        fullName: cleanName,
        phone: phone ? phone.trim() : user.phone,
        preferredLanguage: preferredLanguage === 'ar' ? 'ar' : 'en'
      });
    }

    // Generate 6-digit OTP code
    const otp = createOtp(cleanEmail, OTP_PURPOSE_LOGIN);

    await deliverOtpEmail({
      toEmail: cleanEmail,
      fullName: cleanName,
      otpCode: otp,
      language: preferredLanguage || 'en'
    });

    return res.status(200).json({
      message: "Registration initiated! Please enter the 6-digit verification code sent to your email.",
      email: cleanEmail,
      requiresOtp: true
    });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error during registration." });
  }
});

// POST /api/auth/login
// Participant-only passwordless login. Administrators must use /admin/login.
router.post('/login', async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email address is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = store.findOne('users', u => u.email === cleanEmail);

    if (!user) {
      return res.status(404).json({
        error: "No participant account found with this email. Please register to begin your 90-day journey."
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        error: "Administrator accounts must sign in through the Administrator Portal."
      });
    }

    // Update Full Name if provided and non-empty
    if (fullName && fullName.trim()) {
      store.update('users', u => u.id === user.id, { fullName: fullName.trim() });
    }

    // Generate 6-digit OTP
    const otp = createOtp(cleanEmail, OTP_PURPOSE_LOGIN);

    await deliverOtpEmail({
      toEmail: cleanEmail,
      fullName: user.fullName,
      otpCode: otp,
      language: user.preferredLanguage || 'en'
    });

    return res.json({
      message: "Verification code sent to your email.",
      email: cleanEmail,
      requiresOtp: true
    });
  } catch (err) {
    console.error("Login error:", err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error during login." });
  }
});

// POST /api/auth/verify-otp
// Verifies a participant's 6-digit OTP and returns an authenticated session token.
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and verification code are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const user = store.findOne('users', u => u.email === cleanEmail);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        error: "Administrator accounts must sign in through the Administrator Portal."
      });
    }

    // Optional development-only bypass, explicitly enabled via environment.
    const isMasterBypass =
      !isProduction() &&
      process.env.ALLOW_DEV_OTP_BYPASS === 'true' &&
      cleanOtp === '777888';

    const validEntry = findValidOtp(cleanEmail, cleanOtp, OTP_PURPOSE_LOGIN);

    if (!validEntry && !isMasterBypass) {
      return res.status(400).json({ error: "Invalid or expired verification code. Please request a new one." });
    }

    consumeOtp(validEntry);

    // Mark email verified
    const verifiedUser = store.update('users', u => u.id === user.id, {
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    });

    // Ensure enrolment exists
    let enrolment = store.findOne('enrolments', e => e.userId === verifiedUser.id);
    if (!enrolment) {
      enrolment = store.insert('enrolments', {
        userId: verifiedUser.id,
        startDate: new Date().toISOString().split('T')[0],
        currentProgramDay: 1,
        currentPhase: 1,
        isCompleted: false,
        createdAt: new Date().toISOString()
      });
    }

    const token = issueToken(verifiedUser);

    return res.json({
      message: "Email verified successfully. Welcome to Thabāt!",
      token,
      user: safeUser(verifiedUser)
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ error: "Internal server error during verification." });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email address is required." });

    const cleanEmail = email.trim().toLowerCase();
    const user = store.findOne('users', u => u.email === cleanEmail);
    if (!user) return res.status(404).json({ error: "No account found with this email." });

    if (user.role === 'admin') {
      return res.status(403).json({
        error: "Administrator accounts must use the Administrator Portal password reset."
      });
    }

    const otp = createOtp(cleanEmail, OTP_PURPOSE_LOGIN);

    await deliverOtpEmail({
      toEmail: cleanEmail,
      fullName: user.fullName,
      otpCode: otp,
      language: user.preferredLanguage || 'en'
    });

    return res.json({
      message: "A new verification code has been generated and sent to your email.",
      email: cleanEmail
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: "Failed to resend verification code." });
  }
});

// POST /api/auth/admin/login
// Dedicated administrator sign-in using email + password.
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Administrator email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = store.findOne('users', u => u.email === cleanEmail);

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: "Invalid administrator credentials." });
    }

    if (!user.passwordHash) {
      return res.status(403).json({
        error: "This administrator has no password yet. Use 'Forgot password?' to set one via email OTP."
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid administrator credentials." });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: "This administrator email is not verified. Use 'Forgot password?' to verify it via OTP."
      });
    }

    const updated = store.update('users', u => u.id === user.id, {
      lastLoginAt: new Date().toISOString()
    });

    store.logAudit(user.id, "ADMIN_LOGIN", "Administrator signed in through the administrator portal");

    return res.json({
      message: "Administrator authenticated successfully.",
      token: issueToken(updated),
      user: safeUser(updated)
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ error: "Internal server error during administrator login." });
  }
});

// POST /api/auth/admin/request-password-reset
// Sends a one-time code to an administrator email. Used both for "forgot password"
// and for changing a password from inside the admin console.
router.post('/admin/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Administrator email is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = store.findOne('users', u => u.email === cleanEmail);

    // Always return a generic response so administrator emails cannot be enumerated.
    const genericResponse = {
      message: "If this email belongs to an administrator, a password reset code has been sent."
    };

    if (!user || user.role !== 'admin') {
      return res.json(genericResponse);
    }

    const otp = createOtp(cleanEmail, OTP_PURPOSE_ADMIN_RESET);

    await deliverOtpEmail({
      toEmail: cleanEmail,
      fullName: user.fullName,
      otpCode: otp,
      language: user.preferredLanguage || 'en',
      purpose: 'password_reset'
    });

    return res.json({
      ...genericResponse,
      email: cleanEmail,
      requiresOtp: true
    });
  } catch (err) {
    console.error("Admin password reset request error:", err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: "Failed to send administrator password reset code." });
  }
});

// POST /api/auth/admin/reset-password
// Completes a forgotten-password reset using the emailed OTP.
router.post('/admin/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, verification code, and new password are required." });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();
    const user = store.findOne('users', u => u.email === cleanEmail);

    if (!user || user.role !== 'admin') {
      return res.status(400).json({ error: "Invalid administrator password reset request." });
    }

    const validEntry = findValidOtp(cleanEmail, cleanOtp, OTP_PURPOSE_ADMIN_RESET);
    if (!validEntry) {
      return res.status(400).json({ error: "Invalid or expired reset code. Please request a new one." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    store.update('users', u => u.id === user.id, {
      passwordHash,
      passwordUpdatedAt: new Date().toISOString(),
      mustChangePassword: false,
      isEmailVerified: true,
      emailVerifiedAt: user.emailVerifiedAt || new Date().toISOString()
    });

    consumeAllOtps(cleanEmail, OTP_PURPOSE_ADMIN_RESET);
    store.logAudit(user.id, "ADMIN_PASSWORD_RESET", "Administrator password reset via email OTP");

    return res.json({
      message: "Administrator password updated successfully. You can now sign in with your new password."
    });
  } catch (err) {
    console.error("Admin password reset error:", err);
    return res.status(500).json({ error: "Failed to reset administrator password." });
  }
});

// POST /api/auth/admin/change-password
// Authenticated administrator password change. Accepts either the current
// password or an emailed OTP (requested via /admin/request-password-reset).
router.post('/admin/change-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { currentPassword, otp, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required." });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
      });
    }

    const user = store.findOne('users', u => u.id === req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ error: "Administrator account not found." });
    }

    let authorized = false;

    if (currentPassword) {
      authorized = !!user.passwordHash && await bcrypt.compare(currentPassword, user.passwordHash);
    } else if (otp) {
      const validEntry = findValidOtp(user.email, otp.toString().trim(), OTP_PURPOSE_ADMIN_RESET);
      authorized = !!validEntry;
      consumeOtp(validEntry);
    }

    if (!authorized) {
      return res.status(401).json({
        error: "Password change could not be authorized. Provide your current password or a valid email OTP."
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    store.update('users', u => u.id === user.id, {
      passwordHash,
      passwordUpdatedAt: new Date().toISOString(),
      mustChangePassword: false
    });

    consumeAllOtps(user.email, OTP_PURPOSE_ADMIN_RESET);
    store.logAudit(user.id, "ADMIN_PASSWORD_CHANGED", "Administrator changed password from the admin console");

    return res.json({ message: "Administrator password changed successfully." });
  } catch (err) {
    console.error("Admin change password error:", err);
    return res.status(500).json({ error: "Failed to change administrator password." });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const enrolment = store.findOne('enrolments', e => e.userId === req.user.id);
  res.json({
    user: req.user,
    enrolment: enrolment || null
  });
});

// POST /api/auth/update-profile
router.post('/update-profile', authenticateToken, (req, res) => {
  try {
    const { preferredLanguage, phone, fullName } = req.body;
    const updates = {};
    if (preferredLanguage) updates.preferredLanguage = preferredLanguage;
    if (phone !== undefined) updates.phone = phone.trim();
    if (fullName) updates.fullName = fullName.trim();

    const updated = store.update('users', u => u.id === req.user.id, updates);
    res.json({ user: safeUser(updated) });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

export default router;
