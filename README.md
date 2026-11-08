# THABĀT | ثبات

> **90-Day Qur'an Revision Programme | برنامج مراجعة القرآن الكريم في 90 يوماً**  
> *Strengthening Hifz Through Consistency | تثبيت الحفظ بدوام المداومة*  
> **100% Free Public Service (برنامج مجاني لوجه الله تعالى)**

---

## 📖 Overview

**THABĀT (ثبات)** is a public, bilingual (English & Arabic) Qur'an revision platform engineered specifically for Huffadh (memorizers of the Noble Qur'an). It guides participants through a structured, 90-day trajectory encompassing **180 sessions** (morning and evening) culminating in **18 complete readings of the entire Qur'an (18 ختمة كاملة)**.

---

## 🗓 The 5-Phase Programme Structure (18 Complete Khatmahs)

| Phase | Days | Daily Morning Session | Daily Evening Session | Total Sessions | Khatmahs Completed |
|---|---|---|---|---|---|
| **Phase 1** | Days 1–15 | 3 Juz Muroja'ah (Juz 1–15) | 3 Juz Tikrar (Same 3 Juz) | 30 sessions | 3 Khatmahs of First Half |
| **Phase 2** | Days 16–30 | 3 Juz Muroja'ah (Juz 16–30) | 3 Juz Tikrar (Same 3 Juz) | 30 sessions | 3 Khatmahs of Second Half → **6 Full Khatmahs** |
| **Phase 3** | Days 31–45 | 3 Juz Muroja'ah (Juz 1–15) | 3 Juz Tikrar (Same 3 Juz) | 30 sessions | 3 Khatmahs of First Half |
| **Phase 4** | Days 46–60 | 3 Juz Muroja'ah (Juz 16–30) | 3 Juz Tikrar (Same 3 Juz) | 30 sessions | 3 Khatmahs of Second Half → **12 Cumulative Khatmahs** |
| **Phase 5** | Days 61–90 | 5 Juz Reading | 1 Juz Offhand (*عن ظهر قلب* from pure memory) | 60 sessions | 6 Additional Khatmahs → **18 Full Khatmahs Total** |

- **Total Program Sessions:** 180 sessions (90 days × 2 sessions/day)
- **Total Khatmahs:** 18 complete Qur'an completions (ثمانية عشر ختمة كاملة)

---

## 🔒 Passwordless Authentication & Verified Email Identity

To remove barriers and enhance participant security:
- **No passwords required.**
- Participants identify themselves with **Full Name** and **Email Address**.
- A secure 6-digit verification code (OTP) is sent to their email to authenticate and verify their identity.
- Full RTL and Arabic support with solemn Hifz declaration upon registration.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy the template files:
```bash
# Frontend
cp .env.example .env

# Backend
cp server/.env.example server/.env
```

### 4. Running the Application
Start the frontend and backend servers:
```bash
# Run backend API server (port 5000)
npm run server

# In another terminal, run frontend Vite development server (port 5173)
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄 Database & MongoDB Migration

THABĀT includes an out-of-the-box JSON datastore located at `server/data/db.json` so you can test and run immediately without needing a local database daemon.

### Migrating to MongoDB:
When you are ready to connect to a production MongoDB cluster or local MongoDB instance:
1. Ensure your MongoDB connection string is set in `server/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/thabat
   ```
2. Run the migration command:
   ```bash
   npm run migrate:mongo
   ```
All users, enrolments, session logs, 180 daily inspirations, and certificates will be migrated into MongoDB collections.

---

## 📜 Key Features

- **Dynamic Rolling Schedule:** If a participant misses a day, assignments smoothly roll forward without doubling tomorrow's load.
- **Bilingual & RTL:** Seamless switching between Arabic (with Quranic typography) and English.
- **Opening Verse Anchors:** Displays the exact opening ayah incipit for each assigned Juz.
- **180 Verified Daily Reminders:** Sourced authentic Hadiths, Qur'anic verses, and classical scholar quotes.
- **Formal Certificate of Completion:** High-resolution printable certificate with cryptographic verification ID, consistency score, and distinction honour.

---

## 📄 License
This project is dedicated for the sake of Allah for the benefit of the Muslim Ummah and all Huffadh worldwide.
