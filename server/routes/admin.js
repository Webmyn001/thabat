import express from 'express';
import { store } from '../data/store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { calculateScheduleMetrics, calculateCertificateScore, formatDate, TOTAL_PROGRAM_SESSIONS } from '../../src/utils/scheduleEngine.js';

const router = express.Router();

// Apply auth + requireAdmin to all admin endpoints
router.use(authenticateToken, requireAdmin);

// GET /api/admin/overview
router.get('/overview', (req, res) => {
  try {
    const users = store.find('users', u => u.role !== 'admin');
    const enrolments = store.get('enrolments');
    const sessionLogs = store.find('sessionLogs', s => s.isCompleted);
    const certificates = store.get('certificates');

    let completedParticipants = 0;
    let inProgressParticipants = 0;
    let totalMissedDays = 0;

    users.forEach(u => {
      const enrolment = enrolments.find(e => e.userId === u.id);
      const userLogs = sessionLogs.filter(s => s.userId === u.id);
      const map = {};
      userLogs.forEach(s => { map[s.sessionId] = { isCompleted: true, completedDate: s.completedDate }; });
      const m = calculateScheduleMetrics(enrolment?.startDate, map, formatDate(new Date()));
      
      if (m.isAllCompleted) {
        completedParticipants++;
      } else if (m.totalSessionsCompleted > 0) {
        inProgressParticipants++;
      }
      totalMissedDays += m.missedDaysCount;
    });

    const totalCertDownloads = certificates.reduce((acc, c) => acc + (c.downloadCount || 0), 0);

    res.json({
      totalParticipants: users.length,
      activeParticipants: inProgressParticipants,
      completedParticipants,
      totalCompletedSessions: sessionLogs.length,
      totalMissedDays,
      certificatesIssued: certificates.length,
      certificateDownloads: totalCertDownloads
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to compile admin overview." });
  }
});

// GET /api/admin/participants
router.get('/participants', (req, res) => {
  try {
    const { search } = req.query;
    let users = store.find('users', u => u.role !== 'admin');
    const enrolments = store.get('enrolments');
    const sessionLogs = store.find('sessionLogs', s => s.isCompleted);

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      users = users.filter(u => 
        u.fullName.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) || 
        (u.phone && u.phone.includes(q))
      );
    }

    const participantsData = users.map(u => {
      const enrolment = enrolments.find(e => e.userId === u.id);
      const userLogs = sessionLogs.filter(s => s.userId === u.id);
      const map = {};
      userLogs.forEach(s => { map[s.sessionId] = { isCompleted: true, completedDate: s.completedDate }; });
      const m = calculateScheduleMetrics(enrolment?.startDate, map, formatDate(new Date()));

      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        preferredLanguage: u.preferredLanguage,
        createdAt: u.createdAt,
        startDate: enrolment?.startDate || "",
        currentProgramDay: m.activeDay ? m.activeDay.dayNumber : 1,
        currentPhase: m.activeDay ? m.activeDay.phase : 1,
        totalSessionsCompleted: m.totalSessionsCompleted,
        totalSessionsTarget: TOTAL_PROGRAM_SESSIONS,
        overallPercentage: m.overallPercentage,
        missedDaysCount: m.missedDaysCount,
        currentStreak: m.currentStreak,
        isCompleted: m.isAllCompleted,
        revisedDeadline: m.revisedDeadline
      };
    });

    res.json({ participants: participantsData });
  } catch (err) {
    res.status(500).json({ error: "Failed to load participants." });
  }
});

// GET /api/admin/participants/:id
router.get('/participants/:id', (req, res) => {
  try {
    const user = store.findOne('users', u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "Participant not found." });

    const enrolment = store.findOne('enrolments', e => e.userId === user.id);
    const sessionLogs = store.find('sessionLogs', s => s.userId === user.id);
    const certificate = store.findOne('certificates', c => c.userId === user.id);

    const map = {};
    sessionLogs.forEach(s => {
      map[s.sessionId] = { isCompleted: s.isCompleted, completedAt: s.completedAt, completedDate: s.completedDate };
    });

    const metrics = calculateScheduleMetrics(enrolment?.startDate, map, formatDate(new Date()));
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      user: safeUser,
      enrolment,
      metrics,
      sessions: map,
      certificate: certificate || null
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch participant details." });
  }
});

// DELETE /api/admin/participants/:id
// Permanently removes a participant and all associated progress records.
// The UI must present an explicit Yes/No confirmation before calling this.
router.delete('/participants/:id', (req, res) => {
  try {
    const user = store.findOne('users', u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Participant not found." });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        error: "Administrator accounts cannot be deleted from the participant directory."
      });
    }

    const deletedEmail = user.email;

    // Cascade delete: progress, logs, certificates, and outstanding OTP codes.
    store.delete('enrolments', e => e.userId === user.id);
    store.delete('sessionLogs', s => s.userId === user.id);
    store.delete('certificates', c => c.userId === user.id);
    store.delete('verificationCodes', c => c.email === deletedEmail);
    store.delete('users', u => u.id === user.id);

    store.logAudit(
      req.user.id,
      "DELETE_PARTICIPANT",
      `Deleted participant ${user.fullName} <${deletedEmail}> and all associated records`
    );

    res.json({
      message: `${user.fullName} has been permanently deleted.`,
      deletedUserId: user.id
    });
  } catch (err) {
    console.error("Delete participant error:", err);
    res.status(500).json({ error: "Failed to delete participant." });
  }
});

// GET /api/admin/certificate-preview
// Administrators can preview the certificate template from day one. This is
// generated on the fly and is never stored in the certificate registry.
router.get('/certificate-preview', (req, res) => {
  try {
    const settings = store.getSettings();
    const admin = store.findOne('users', u => u.id === req.user.id);
    const scoreInfo = calculateCertificateScore(TOTAL_PROGRAM_SESSIONS, 0);

    const adminEnrolment = store.findOne('enrolments', e => e.userId === req.user.id);
    const today = formatDate(new Date());
    const previewStartDate = adminEnrolment?.startDate
      || formatDate(new Date(Date.now() - 89 * 24 * 60 * 60 * 1000));

    const previewCertificate = {
      id: "admin_preview",
      certificateNumber: `THB-PREVIEW-${new Date().getFullYear()}`,
      userId: req.user.id,
      participantName: admin?.fullName || req.user.fullName,
      issueDate: today,
      startDate: previewStartDate,
      completionDate: today,
      totalSessionsCompleted: TOTAL_PROGRAM_SESSIONS,
      missedDaysCount: 0,
      scorePercent: scoreInfo.scorePercent,
      gradeTitleEn: scoreInfo.gradeTitleEn,
      gradeTitleAr: scoreInfo.gradeTitleAr,
      directorNameEn: settings.directorNameEn,
      directorNameAr: settings.directorNameAr,
      signatureTitleEn: settings.signatureTitleEn,
      signatureTitleAr: settings.signatureTitleAr,
      signatureImage: settings.signatureImage || "",
      downloadCount: 0,
      isPreview: true,
      createdAt: new Date().toISOString()
    };

    res.json({
      certificate: previewCertificate,
      isPreview: true,
      message: "Administrator certificate preview. This is not a real certificate."
    });
  } catch (err) {
    console.error("Certificate preview error:", err);
    res.status(500).json({ error: "Failed to generate certificate preview." });
  }
});

// GET /api/admin/certificates
router.get('/certificates', (req, res) => {
  try {
    const certificates = store.get('certificates');
    res.json({ certificates });
  } catch (err) {
    res.status(500).json({ error: "Failed to load certificates registry." });
  }
});

// GET /api/admin/settings
router.get('/settings', (req, res) => {
  try {
    const settings = store.getSettings();
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: "Failed to load settings." });
  }
});

// POST /api/admin/settings
router.post('/settings', (req, res) => {
  try {
    const updates = req.body;
    const updated = store.updateSettings(updates);
    store.logAudit(req.user.id, "UPDATE_SETTINGS", "Updated system and director settings");
    res.json({ message: "Settings successfully updated.", settings: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings." });
  }
});

export default router;
