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
    directorNameAr: "بيلو محي الدين",
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

    ensureAdminUser();

    // 2. Connect to MongoDB Atlas if URI is present
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://'))) {
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
        isMongoConnected = true;
        console.log(`✔ [Database] Successfully connected to MongoDB Atlas`);

        // Sync from MongoDB Atlas into memory
        await syncFromMongo();
      } catch (mongoErr) {
        console.warn(`⚠ [Database] MongoDB connection failed (${mongoErr.message}). Using local store fallback.`);
      }
    }
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

function seedDefaultData() {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync("Admin123!", salt);

  database.users = [
    {
      id: "admin_1",
      fullName: "Bello Muhyideen",
      email: "admin@thabat.org",
      phone: "+2349164028709",
      passwordHash: adminPasswordHash,
      role: "admin",
      isEmailVerified: true,
      hifzDeclarationAccepted: true,
      hifzDeclarationAcceptedAt: new Date().toISOString(),
      preferredLanguage: "en",
      createdAt: new Date().toISOString()
    },
    {
      id: "admin_2",
      fullName: "Bello Muhyideen",
      email: "bellomuhyideen0001@gmail.com",
      phone: "+2349164028709",
      passwordHash: adminPasswordHash,
      role: "admin",
      isEmailVerified: true,
      hifzDeclarationAccepted: true,
      hifzDeclarationAcceptedAt: new Date().toISOString(),
      preferredLanguage: "en",
      createdAt: new Date().toISOString()
    }
  ];

  database.inspirations = [...INITIAL_INSPIRATIONS];
}

function ensureAdminUser() {
  const admins = [
    { email: "admin@thabat.org", fullName: "Bello Muhyideen", phone: "+2349164028709" },
    { email: "bellomuhyideen0001@gmail.com", fullName: "Bello Muhyideen", phone: "+2349164028709" }
  ];

  let storeUpdated = false;
  admins.forEach((adm, idx) => {
    let existing = database.users.find(u => u.email === adm.email);
    if (!existing) {
      const salt = bcrypt.genSaltSync(10);
      const adminPasswordHash = bcrypt.hashSync("Admin123!", salt);
      database.users.push({
        id: `admin_${idx + 1}`,
        fullName: adm.fullName,
        email: adm.email,
        phone: adm.phone,
        passwordHash: adminPasswordHash,
        role: "admin",
        isEmailVerified: true,
        hifzDeclarationAccepted: true,
        hifzDeclarationAcceptedAt: new Date().toISOString(),
        preferredLanguage: "en",
        createdAt: new Date().toISOString()
      });
      storeUpdated = true;
    } else {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        storeUpdated = true;
      }
      if (existing.phone !== adm.phone) {
        existing.phone = adm.phone;
        storeUpdated = true;
      }
      if (!existing.isEmailVerified) {
        existing.isEmailVerified = true;
        storeUpdated = true;
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
        }
      }

      return list[index];
    }
    return null;
  },

  delete: (collection, predicate) => {
    const list = database[collection] || [];
    const initialLen = list.length;
    database[collection] = list.filter(item => !predicate(item));
    const deleted = initialLen !== database[collection].length;
    if (deleted) saveStore();
    return deleted;
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
