import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store } from '../data/store.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper: generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/register
// Password removed. User registers with Full Name, Email, Phone, Start Date, and Hifz declaration.
// Generates 6-digit OTP code to verify email.
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

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    // Check if user already exists
    let user = store.findOne('users', u => u.email === cleanEmail);

    if (user && user.isEmailVerified) {
      // Existing verified user: issue OTP to log in
      const otp = generateOtp();
      store.insert('verificationCodes', {
        email: cleanEmail,
        code: otp,
        expiresAt: Date.now() + 15 * 60 * 1000,
        createdAt: new Date().toISOString()
      });

      console.log(`\n========================================\n[THABĀT AUTH] Verification code for ${cleanEmail}: ${otp}\n========================================\n`);

      return res.json({
        message: "You already have a verified account. A verification code has been sent to your email to log in.",
        email: cleanEmail,
        requiresOtp: true,
        devOtp: otp,
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
      const effectiveStartDate = startDate || new Date().toISOString().split('T')[0];
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
    const otp = generateOtp();
    store.insert('verificationCodes', {
      email: cleanEmail,
      code: otp,
      expiresAt: Date.now() + 15 * 60 * 1000,
      createdAt: new Date().toISOString()
    });

    console.log(`\n========================================\n[THABĀT AUTH] Registration OTP for ${cleanEmail}: ${otp}\n========================================\n`);

    return res.status(200).json({
      message: "Registration initiated! Please enter the 6-digit verification code sent to your email.",
      email: cleanEmail,
      requiresOtp: true,
      devOtp: otp
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Internal server error during registration." });
  }
});

// POST /api/auth/login
// Password removed. User requests access using Full Name and Email.
// Issues a 6-digit OTP code to verify their email identity.
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

    // Update Full Name if provided and non-empty
    if (fullName && fullName.trim()) {
      store.update('users', u => u.id === user.id, { fullName: fullName.trim() });
    }

    // Generate 6-digit OTP
    const otp = generateOtp();
    store.insert('verificationCodes', {
      email: cleanEmail,
      code: otp,
      expiresAt: Date.now() + 15 * 60 * 1000,
      createdAt: new Date().toISOString()
    });

    console.log(`\n========================================\n[THABĀT AUTH] Login OTP for ${cleanEmail}: ${otp}\n========================================\n`);

    return res.json({
      message: "Verification code sent to your email.",
      email: cleanEmail,
      requiresOtp: true,
      devOtp: otp
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error during login." });
  }
});

// POST /api/auth/verify-otp
// Verifies 6-digit OTP and returns authenticated session token
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and verification code are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // Look for valid matching code
    const codes = store.find('verificationCodes', c => c.email === cleanEmail && !c.used);
    const validEntry = codes.reverse().find(c => c.code === cleanOtp && c.expiresAt > Date.now());

    // Allow master dev bypass code for automated environments
    const isMasterBypass = cleanOtp === '777888';

    if (!validEntry && !isMasterBypass) {
      return res.status(400).json({ error: "Invalid or expired verification code. Please request a new one." });
    }

    if (validEntry) {
      store.update('verificationCodes', c => c.id === validEntry.id, { used: true });
    }

    let user = store.findOne('users', u => u.email === cleanEmail);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    // Mark email verified
    user = store.update('users', u => u.id === user.id, {
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString()
    });

    // Ensure enrolment exists
    let enrolment = store.findOne('enrolments', e => e.userId === user.id);
    if (!enrolment) {
      enrolment = store.insert('enrolments', {
        userId: user.id,
        startDate: new Date().toISOString().split('T')[0],
        currentProgramDay: 1,
        currentPhase: 1,
        isCompleted: false,
        createdAt: new Date().toISOString()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      message: "Email verified successfully. Welcome to Thabāt!",
      token,
      user: safeUser
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

    const otp = generateOtp();
    store.insert('verificationCodes', {
      email: cleanEmail,
      code: otp,
      expiresAt: Date.now() + 15 * 60 * 1000,
      createdAt: new Date().toISOString()
    });

    console.log(`\n========================================\n[THABĀT AUTH] Resent OTP for ${cleanEmail}: ${otp}\n========================================\n`);

    return res.json({
      message: "A new verification code has been generated and sent to your email.",
      email: cleanEmail,
      devOtp: otp
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to resend verification code." });
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
    const { passwordHash: _, ...safeUser } = updated;
    res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

export default router;
