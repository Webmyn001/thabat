/**
 * THABĀT — MongoDB Migration Script
 * Migrates local db.json records into MongoDB using Mongoose.
 * 
 * Usage:
 *   node server/scripts/migrateToMongo.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { User } from '../models/User.js';
import { Enrolment } from '../models/Enrolment.js';
import { SessionLog } from '../models/SessionLog.js';
import { Inspiration } from '../models/Inspiration.js';
import { Certificate } from '../models/Certificate.js';
import { Setting } from '../models/Setting.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_FILE = path.join(__dirname, '../data/db.json');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thabat';

async function migrate() {
  console.log(`\n========================================`);
  console.log(`[THABĀT] Starting MongoDB Migration`);
  console.log(`Connecting to: ${MONGODB_URI}`);
  console.log(`Reading source file: ${DB_FILE}`);
  console.log(`========================================\n`);

  if (!fs.existsSync(DB_FILE)) {
    console.error(`[Error] Database file not found at: ${DB_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(DB_FILE, 'utf8');
  const dbData = JSON.parse(rawData);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✔ Connected to MongoDB successfully.\n`);

    // 1. Migrate Users
    if (dbData.users && dbData.users.length > 0) {
      console.log(`Migrating ${dbData.users.length} users...`);
      for (const u of dbData.users) {
        await User.findOneAndUpdate(
          { email: u.email.toLowerCase() },
          { ...u, updatedAt: new Date() },
          { upsert: true, new: true }
        );
      }
      console.log(`✔ Users migrated.`);
    }

    // 2. Migrate Enrolments
    if (dbData.enrolments && dbData.enrolments.length > 0) {
      console.log(`Migrating ${dbData.enrolments.length} enrolments...`);
      for (const e of dbData.enrolments) {
        await Enrolment.findOneAndUpdate(
          { userId: e.userId },
          { ...e, updatedAt: new Date() },
          { upsert: true, new: true }
        );
      }
      console.log(`✔ Enrolments migrated.`);
    }

    // 3. Migrate Session Logs
    if (dbData.sessionLogs && dbData.sessionLogs.length > 0) {
      console.log(`Migrating ${dbData.sessionLogs.length} session logs...`);
      for (const s of dbData.sessionLogs) {
        await SessionLog.findOneAndUpdate(
          { userId: s.userId, sessionId: s.sessionId },
          { ...s, updatedAt: new Date() },
          { upsert: true, new: true }
        );
      }
      console.log(`✔ Session logs migrated.`);
    }

    // 4. Migrate Inspirations (180 daily reminders)
    if (dbData.inspirations && dbData.inspirations.length > 0) {
      console.log(`Migrating ${dbData.inspirations.length} inspirations...`);
      for (const insp of dbData.inspirations) {
        await Inspiration.findOneAndUpdate(
          { day: insp.day },
          insp,
          { upsert: true, new: true }
        );
      }
      console.log(`✔ Inspirations migrated.`);
    }

    // 5. Migrate Certificates
    if (dbData.certificates && dbData.certificates.length > 0) {
      console.log(`Migrating ${dbData.certificates.length} certificates...`);
      for (const cert of dbData.certificates) {
        await Certificate.findOneAndUpdate(
          { certificateNumber: cert.certificateNumber },
          cert,
          { upsert: true, new: true }
        );
      }
      console.log(`✔ Certificates migrated.`);
    }

    // 6. Migrate Settings
    if (dbData.settings) {
      console.log(`Migrating application settings...`);
      await Setting.findOneAndUpdate({}, dbData.settings, { upsert: true, new: true });
      console.log(`✔ Settings migrated.`);
    }

    console.log(`\n========================================`);
    console.log(`✔ ALL DATA SUCCESSFULLY MIGRATED TO MONGODB!`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB. Migration complete.");
  }
}

migrate();
