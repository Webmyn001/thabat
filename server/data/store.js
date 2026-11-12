import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { INITIAL_INSPIRATIONS } from './initialInspirations.js';
import { User } from '../models/User.js';
import { Enrolment } from '../models/Enrolment.js';
import { SessionLog } from '../models/SessionLog.js';
import { Inspiration } from '../models/Inspiration.js';
import { Certificate } from '../models/Certificate.js';
import { Setting } from '../models/Setting.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

let isMongoConnected = false;

// In-memory cache synced with db.json and MongoDB
let database = {
  users: [],
  enrolments: [],
  sessionLogs: [],
  inspirations: [],
  certificates: [],
  verificationCodes: [],
  settings: {
    appNameEn: "THABĀT",
    appNameAr: "ثبات",
    taglineEn: "Strengthening Hifz Through Consistency.",
    taglineAr: "تثبيت الحفظ بدوام المداومة",
    descriptorEn: "90-Day Qur'an Revision Programme",
    descriptorAr: "برنامج مراجعة القرآن الكريم في 90 يوماً",
    directorNameEn: "Bello Muhyideen",
    directorNameAr: "بَلُّو محي الدين",
    signatureTitleEn: "Programme Director & Founder",
    signatureTitleAr: "مدير البرنامج والمؤسس",
    signatureImage: "",
    minCompletionScorePercent: 85
  },
  auditLogs: []
};

// Initialize store (db.json + MongoDB Atlas if configured)
export async function initStore() {
  try {
    // 1. Initial local load from db.json
    if (!fs.existsSync(path.dirname(DB_FILE))) {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      if (data.trim()) {
        const parsed = JSON.parse(data);
        database = { ...database, ...parsed };
      }
    } else {
      seedDefaultData();
      saveStore();
    }

    if (!database.inspirations || database.inspirations.length < 180) {
      database.inspirations = [...INITIAL_INSPIRATIONS];
      saveStore();
    }

    // Seed the administrator account(s) from environment variables, never from
    // hard-coded credentials in source control.
    ensureAdminFromEnv();

    // 2. Connect to MongoDB Atlas if URI is present
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://'))) {
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
        isMongoConnected = true;
        console.log(`✔ [Database] Successfully connected to MongoDB Atlas`);

        // Sync from MongoDB Atlas into memory
        await syncFromMongo();

        // Re-apply the environment administrator seed in case Mongo was empty
        // or did not yet contain the configured administrator.
        ensureAdminFromEnv();
      } catch (mongoErr) {
        console.warn(`⚠ [Database] MongoDB connection failed (${mongoErr.message}). Using local store fallback.`);
      }
    }

    normalizeLegacyCertificateData();
  } catch (err) {
    console.error("Error initializing store:", err);
    seedDefaultData();
    saveStore();
  }
}

async function syncFromMongo() {
  try {
    const mongoUsers = await User.find().lean();
    if (mongoUsers.length > 0) {
      database.users = mongoUsers.map(u => ({ ...u, id: u.id || u._id.toString() }));
    } else if (database.users.length > 0) {
      // Seed initial users into Mongo
      for (const u of database.users) {
        await User.findOneAndUpdate({ email: u.email }, u, { upsert: true });
      }
    }

    const mongoEnrolments = await Enrolment.find().lean();
    if (mongoEnrolments.length > 0) {
      database.enrolments = mongoEnrolments;
    } else if (database.enrolments.length > 0) {
      for (const e of database.enrolments) {
        await Enrolment.findOneAndUpdate({ userId: e.userId }, e, { upsert: true });
      }
    }

    const mongoLogs = await SessionLog.find().lean();
    if (mongoLogs.length > 0) {
      database.sessionLogs = mongoLogs;
    } else if (database.sessionLogs.length > 0) {
      for (const s of database.sessionLogs) {
        await SessionLog.findOneAndUpdate({ userId: s.userId, sessionId: s.sessionId }, s, { upsert: true });
      }
    }

    const mongoInspirations = await Inspiration.find().lean();
    if (mongoInspirations.length > 0) {
      database.inspirations = mongoInspirations;
    } else if (database.inspirations.length > 0) {
      for (const i of database.inspirations) {
        await Inspiration.findOneAndUpdate({ day: i.day }, i, { upsert: true });
      }
    }

    const mongoCerts = await Certificate.find().lean();
    if (mongoCerts.length > 0) {
      database.certificates = mongoCerts;
    } else if (database.certificates.length > 0) {
      for (const c of database.certificates) {
        await Certificate.findOneAndUpdate({ certificateNumber: c.certificateNumber }, c, { upsert: true });
      }
    }

    const mongoSetting = await Setting.findOne().lean();
    if (mongoSetting) {
      database.settings = { ...database.settings, ...mongoSetting };
    } else if (database.settings) {
      await Setting.findOneAndUpdate({}, database.settings, { upsert: true });
    }

    console.log(`✔ [Database] Synced collections with MongoDB Atlas (Users: ${database.users.length}, Enrolments: ${database.enrolments.length})`);
  } catch (err) {
    console.error("Error syncing with MongoDB:", err.message);
  }
}

/**
 * Repairs records written by older versions:
 *  - corrects the director's Arabic name spelling,
 *  - backfills the programme start / completion dates that new certificate
 *    templates display (issue date alone does not show the programme period).
 */
function normalizeLegacyCertificateData() {
  const LEGACY_DIRECTOR_AR = "بيلو محي الدين";
  const CORRECT_DIRECTOR_AR = "بَلُّو محي الدين";
  let changed = false;

  if (database.settings?.directorNameAr === LEGACY_DIRECTOR_AR) {
    database.settings.directorNameAr = CORRECT_DIRECTOR_AR;
    changed = true;

    if (isMongoConnected) {
      Setting.findOneAndUpdate({}, { directorNameAr: CORRECT_DIRECTOR_AR }).catch(() => {});
    }
  }

  (database.certificates || []).forEach(certificate => {
    const updates = {};

    if (certificate.directorNameAr === LEGACY_DIRECTOR_AR) {
      updates.directorNameAr = CORRECT_DIRECTOR_AR;
    }

    if (!certificate.startDate) {
      const enrolment = database.enrolments.find(e => e.userId === certificate.userId);
      if (enrolment?.startDate) {
        updates.startDate = enrolment.startDate;
      }
    }

    if (!certificate.completionDate) {
      const completedDates = database.sessionLogs
        .filter(s => s.userId === certificate.userId && s.isCompleted && s.completedDate)
        .map(s => s.completedDate)
        .sort();

      updates.completionDate = completedDates[completedDates.length - 1] || certificate.issueDate;
    }

    if (Object.keys(updates).length > 0) {
      store.update(
        'certificates',
        c => c.id === certificate.id || c.certificateNumber === certificate.certificateNumber,
        updates
      );
      changed = true;
    }
  });

  if (changed) {
    saveStore();
  }
}

function seedDefaultData() {
  // Start with an empty participant directory. Administrator accounts are
  // bootstrapped from environment variables by ensureAdminFromEnv().
  database.users = [];
  database.inspirations = [...INITIAL_INSPIRATIONS];
}

/**
 * Returns the administrator bootstrap configuration from the environment.
 * Supported variables (server/.env):
 *   ADMIN_EMAILS   Comma-separated administrator email addresses
 *   ADMIN_EMAIL    Single administrator email (fallback)
 *   ADMIN_PASSWORD Initial password used only when creating an account
 *   ADMIN_NAME     Display name for newly created administrators
 *   ADMIN_PHONE    Optional phone number
 */
function getAdminSeedConfig() {
  const rawEmails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';
  const emails = rawEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);

  return {
    emails,
    password: process.env.ADMIN_PASSWORD || '',
    name: (process.env.ADMIN_NAME || 'Administrator').trim(),
    phone: (process.env.ADMIN_PHONE || '').trim()
  };
}

/**
 * Creates/promotes administrator accounts from environment configuration.
 * Credentials are stored in the database (hashed) and are never hard-coded.
 */
function ensureAdminFromEnv() {
  const { emails, password, name, phone } = getAdminSeedConfig();

  if (emails.length === 0) {
    console.warn('⚠ [Admin Seed] No ADMIN_EMAILS/ADMIN_EMAIL configured. Set an administrator in server/.env to bootstrap an admin account.');
    return;
  }

  let storeUpdated = false;

  emails.forEach((email, idx) => {
    const existing = database.users.find(u => u.email === email);

    if (!existing) {
      if (!password) {
        console.warn(`⚠ [Admin Seed] Cannot create ${email}: ADMIN_PASSWORD is not set.`);
        return;
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const newAdmin = {
        id: `admin_${Date.now()}_${idx}`,
        fullName: name,
        email,
        phone,
        passwordHash,
        role: "admin",
        isEmailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
        hifzDeclarationAccepted: true,
        hifzDeclarationAcceptedAt: new Date().toISOString(),
        preferredLanguage: "en",
        mustChangePassword: true,
        createdAt: new Date().toISOString()
      };

      database.users.push(newAdmin);
      storeUpdated = true;

      if (isMongoConnected) {
        User.findOneAndUpdate({ email }, newAdmin, { upsert: true }).catch(() => {});
      }

      console.log(`✔ [Admin Seed] Created administrator account for ${email}`);
      return;
    }

    let changed = false;
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      changed = true;
    }
    if (!existing.isEmailVerified) {
      existing.isEmailVerified = true;
      existing.emailVerifiedAt = existing.emailVerifiedAt || new Date().toISOString();
      changed = true;
    }
    if (phone && !existing.phone) {
      existing.phone = phone;
      changed = true;
    }
    if (!existing.passwordHash && password) {
      existing.passwordHash = bcrypt.hashSync(password, 10);
      existing.mustChangePassword = true;
      existing.passwordUpdatedAt = new Date().toISOString();
      changed = true;
      console.log(`✔ [Admin Seed] Added a password to existing administrator ${email}`);
    }

    if (changed) {
      storeUpdated = true;
      if (isMongoConnected) {
        User.findOneAndUpdate({ email }, existing, { upsert: true }).catch(() => {});
      }
    }
  });

  if (storeUpdated) {
    saveStore();
  }
}

export function saveStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving database to file:", err);
  }
}

// Store accessor methods (Synchronous in-memory + async MongoDB persistence)
export const store = {
  get: (collection) => database[collection] || [],
  
  findOne: (collection, predicate) => {
    const list = database[collection] || [];
    return list.find(predicate) || null;
  },

  find: (collection, predicate) => {
    const list = database[collection] || [];
    if (!predicate) return list;
    return list.filter(predicate);
  },

  insert: (collection, item) => {
    if (!database[collection]) database[collection] = [];
    const newItem = { id: item.id || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, ...item };
    database[collection].push(newItem);
    saveStore();

    // Async MongoDB persistence
    if (isMongoConnected) {
      if (collection === 'users') {
        User.findOneAndUpdate({ email: newItem.email.toLowerCase() }, newItem, { upsert: true }).catch(() => {});
      } else if (collection === 'enrolments') {
        Enrolment.findOneAndUpdate({ userId: newItem.userId }, newItem, { upsert: true }).catch(() => {});
      } else if (collection === 'sessionLogs') {
        SessionLog.findOneAndUpdate({ userId: newItem.userId, sessionId: newItem.sessionId }, newItem, { upsert: true }).catch(() => {});
      } else if (collection === 'certificates') {
        Certificate.findOneAndUpdate({ certificateNumber: newItem.certificateNumber }, newItem, { upsert: true }).catch(() => {});
      }
    }

    return newItem;
  },

  update: (collection, predicate, updates) => {
    const list = database[collection] || [];
    const index = list.findIndex(predicate);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
      saveStore();

      // Async MongoDB persistence
      if (isMongoConnected) {
        const item = list[index];
        if (collection === 'users' && item.email) {
          User.findOneAndUpdate({ email: item.email.toLowerCase() }, item, { upsert: true }).catch(() => {});
        } else if (collection === 'enrolments' && item.userId) {
          Enrolment.findOneAndUpdate({ userId: item.userId }, item, { upsert: true }).catch(() => {});
        } else if (collection === 'sessionLogs' && item.sessionId) {
          SessionLog.findOneAndUpdate({ userId: item.userId, sessionId: item.sessionId }, item, { upsert: true }).catch(() => {});
        } else if (collection === 'certificates' && item.certificateNumber) {
          Certificate.findOneAndUpdate({ certificateNumber: item.certificateNumber }, item, { upsert: true }).catch(() => {});
        }
      }

      return list[index];
    }
    return null;
  },

  delete: (collection, predicate) => {
    const list = database[collection] || [];
    const removed = list.filter(predicate);
    if (removed.length === 0) return false;

    database[collection] = list.filter(item => !predicate(item));
    saveStore();

    // Keep MongoDB in sync when a record is removed.
    if (isMongoConnected) {
      removed.forEach(item => {
        if (collection === 'users') {
          User.deleteOne({ $or: [{ id: item.id }, { email: item.email }] }).catch(() => {});
        } else if (collection === 'enrolments') {
          Enrolment.deleteMany({ userId: item.userId }).catch(() => {});
        } else if (collection === 'sessionLogs') {
          SessionLog.deleteMany({ userId: item.userId }).catch(() => {});
        } else if (collection === 'certificates') {
          Certificate.deleteMany({ userId: item.userId }).catch(() => {});
        }
      });
    }

    return true;
  },

  getSettings: () => database.settings,
  updateSettings: (newSettings) => {
    database.settings = { ...database.settings, ...newSettings };
    saveStore();
    if (isMongoConnected) {
      Setting.findOneAndUpdate({}, database.settings, { upsert: true }).catch(() => {});
    }
    return database.settings;
  },

  logAudit: (actorId, action, details) => {
    if (!database.auditLogs) database.auditLogs = [];
    database.auditLogs.push({
      id: `audit_${Date.now()}`,
      actorId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
    saveStore();
  }
};
