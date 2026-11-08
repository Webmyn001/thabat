import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { INITIAL_INSPIRATIONS } from './initialInspirations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// In-memory cache synced with db.json
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

// Initialize or load db.json
export function initStore() {
  try {
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

    // Ensure inspirations are seeded if empty
    if (!database.inspirations || database.inspirations.length < 180) {
      database.inspirations = [...INITIAL_INSPIRATIONS];
      saveStore();
    }

    // Ensure initial admin exists
    ensureAdminUser();
  } catch (err) {
    console.error("Error initializing store:", err);
    seedDefaultData();
    saveStore();
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
      phone: "+1234567890",
      passwordHash: adminPasswordHash,
      role: "admin",
      hifzDeclarationAccepted: true,
      hifzDeclarationAcceptedAt: new Date().toISOString(),
      preferredLanguage: "en",
      createdAt: new Date().toISOString()
    }
  ];

  database.inspirations = [...INITIAL_INSPIRATIONS];
}

function ensureAdminUser() {
  const hasAdmin = database.users.some(u => u.role === 'admin' || u.email === 'admin@thabat.org');
  if (!hasAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync("Admin123!", salt);
    database.users.push({
      id: `admin_${Date.now()}`,
      fullName: "Bello Muhyideen",
      email: "admin@thabat.org",
      phone: "+1234567890",
      passwordHash: adminPasswordHash,
      role: "admin",
      hifzDeclarationAccepted: true,
      hifzDeclarationAcceptedAt: new Date().toISOString(),
      preferredLanguage: "en",
      createdAt: new Date().toISOString()
    });
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

// Store accessor methods
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
    return newItem;
  },

  update: (collection, predicate, updates) => {
    const list = database[collection] || [];
    const index = list.findIndex(predicate);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
      saveStore();
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
