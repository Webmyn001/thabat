import express from 'express';
import { store } from '../data/store.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  calculateScheduleMetrics, 
  calculateCertificateScore, 
  TOTAL_PROGRAM_SESSIONS, 
  formatDate 
} from '../../src/utils/scheduleEngine.js';

const router = express.Router();

// GET /api/certificates/eligibility
router.get('/eligibility', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const enrolment = store.findOne('enrolments', e => e.userId === userId);
    const userSessionLogs = store.find('sessionLogs', s => s.userId === userId);

    const sessionsMap = {};
    userSessionLogs.forEach(s => {
      sessionsMap[s.sessionId] = {
        isCompleted: s.isCompleted,
        completedAt: s.completedAt,
        completedDate: s.completedDate
      };
    });

    const metrics = calculateScheduleMetrics(enrolment?.startDate, sessionsMap, formatDate(new Date()));
    const scoreInfo = calculateCertificateScore(metrics.totalSessionsCompleted, metrics.missedDaysCount);

    const existingCert = store.findOne('certificates', c => c.userId === userId);

    res.json({
      isEligible: scoreInfo.isEligible,
      totalSessionsCompleted: metrics.totalSessionsCompleted,
      requiredSessions: TOTAL_PROGRAM_SESSIONS,
      missedDaysCount: metrics.missedDaysCount,
      scorePercent: scoreInfo.scorePercent,
      gradeTitleEn: scoreInfo.gradeTitleEn,
      gradeTitleAr: scoreInfo.gradeTitleAr,
      certificate: existingCert || null
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to evaluate certificate eligibility." });
  }
});

// POST /api/certificates/generate
router.post('/generate', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const user = store.findOne('users', u => u.id === userId);
    const enrolment = store.findOne('enrolments', e => e.userId === userId);
    const userSessionLogs = store.find('sessionLogs', s => s.userId === userId);

    const sessionsMap = {};
    userSessionLogs.forEach(s => {
      sessionsMap[s.sessionId] = {
        isCompleted: s.isCompleted,
        completedAt: s.completedAt,
        completedDate: s.completedDate
      };
    });

    const metrics = calculateScheduleMetrics(enrolment?.startDate, sessionsMap, formatDate(new Date()));
    const scoreInfo = calculateCertificateScore(metrics.totalSessionsCompleted, metrics.missedDaysCount);

    if (!scoreInfo.isEligible) {
      return res.status(403).json({ 
        error: `Ineligible for certificate. You have completed ${metrics.totalSessionsCompleted} of ${TOTAL_PROGRAM_SESSIONS} required sessions.` 
      });
    }

    // Check if certificate already exists
    let certificate = store.findOne('certificates', c => c.userId === userId);
    const settings = store.getSettings();

    if (!certificate) {
      const year = new Date().getFullYear();
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const certNumber = `THB-${year}-${randomSuffix}`;

      certificate = store.insert('certificates', {
        certificateNumber: certNumber,
        userId: user.id,
        participantName: user.fullName,
        issueDate: formatDate(new Date()),
        totalSessionsCompleted: metrics.totalSessionsCompleted,
        missedDaysCount: metrics.missedDaysCount,
        scorePercent: scoreInfo.scorePercent,
        gradeTitleEn: scoreInfo.gradeTitleEn,
        gradeTitleAr: scoreInfo.gradeTitleAr,
        directorNameEn: settings.directorNameEn,
        directorNameAr: settings.directorNameAr,
        signatureTitleEn: settings.signatureTitleEn,
        signatureTitleAr: settings.signatureTitleAr,
        signatureImage: settings.signatureImage || "",
        downloadCount: 0,
        createdAt: new Date().toISOString()
      });

      store.logAudit(userId, "GENERATE_CERTIFICATE", `Generated certificate ${certNumber} for ${user.fullName}`);
    }

    res.json({
      message: "Certificate generated successfully.",
      certificate
    });
  } catch (err) {
    console.error("Certificate generation error:", err);
    res.status(500).json({ error: "Failed to generate certificate." });
  }
});

// POST /api/certificates/:id/track-download
router.post('/:id/track-download', authenticateToken, (req, res) => {
  try {
    const id = req.params.id;
    const cert = store.findOne('certificates', c => c.id == id || c.certificateNumber == id);
    if (cert) {
      store.update('certificates', c => c.id === cert.id, {
        downloadCount: (cert.downloadCount || 0) + 1,
        lastDownloadedAt: new Date().toISOString()
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to record download." });
  }
});

// GET /api/certificates/verify/:certNumber (Public verification endpoint)
router.get('/verify/:certNumber', (req, res) => {
  try {
    const certNumber = req.params.certNumber.trim().toUpperCase();
    const cert = store.findOne('certificates', c => c.certificateNumber.toUpperCase() === certNumber);

    if (!cert) {
      return res.status(404).json({ 
        isValid: false, 
        message: "No certificate found matching this verification code." 
      });
    }

    res.json({
      isValid: true,
      certificate: {
        certificateNumber: cert.certificateNumber,
        participantName: cert.participantName,
        issueDate: cert.issueDate,
        scorePercent: cert.scorePercent,
        gradeTitleEn: cert.gradeTitleEn,
        gradeTitleAr: cert.gradeTitleAr,
        directorNameEn: cert.directorNameEn,
        directorNameAr: cert.directorNameAr
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to verify certificate." });
  }
});

export default router;
