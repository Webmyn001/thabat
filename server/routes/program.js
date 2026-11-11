import express from 'express';
import { store } from '../data/store.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  CANONICAL_PROGRAM, 
  ALL_SESSIONS_LIST, 
  calculateScheduleMetrics, 
  addDays,
  formatDate 
} from '../../src/utils/scheduleEngine.js';

const router = express.Router();

// GET /api/program/status
// Returns current participant's revision status, rolling state, and history
router.get('/status', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    let enrolment = store.findOne('enrolments', e => e.userId === userId);
    
    if (!enrolment) {
      enrolment = store.insert('enrolments', {
        userId,
        startDate: formatDate(new Date()),
        currentProgramDay: 1,
        currentPhase: 1,
        isCompleted: false,
        createdAt: new Date().toISOString()
      });
    }

    // Load user's sessions from store
    const userSessionLogs = store.find('sessionLogs', s => s.userId === userId);
    const sessionsMap = {};
    userSessionLogs.forEach(s => {
      sessionsMap[s.sessionId] = {
        isCompleted: s.isCompleted,
        completedAt: s.completedAt,
        completedDate: s.completedDate
      };
    });

    const todayDateStr = formatDate(new Date());
    const metrics = calculateScheduleMetrics(enrolment.startDate, sessionsMap, todayDateStr);

    res.json({
      enrolment,
      sessions: sessionsMap,
      metrics,
      todayDateStr
    });
  } catch (err) {
    console.error("Status error:", err);
    res.status(500).json({ error: "Failed to retrieve programme status." });
  }
});

// POST /api/program/complete-session
// Enforces: "users should not be able to mark for the next day today, it should only be for that day"
router.post('/complete-session', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { dayNumber, sessionType, dateOverride } = req.body;

    if (!dayNumber || !sessionType) {
      return res.status(400).json({ error: "Day number and session type are required." });
    }

    const sessionId = sessionType === 'daily' ? `d${dayNumber}_daily` : `d${dayNumber}_${sessionType}`;
    
    // Find canonical session definition
    const canonicalSession = ALL_SESSIONS_LIST.find(s => s.id === sessionId);
    if (!canonicalSession) {
      return res.status(404).json({ error: "Invalid session identifier." });
    }

    const enrolment = store.findOne('enrolments', e => e.userId === userId);

    const todayDateStr = formatDate(new Date());

    // Rule: a day's sessions unlock on that day's scheduled calendar date.
    // Day 1 is the enrolment start date, day 2 the next day, and so on.
    // This prevents marking tomorrow's task today even if today's work is done.
    const startDateStr = enrolment?.startDate || todayDateStr;
    const scheduledDate = addDays(startDateStr, Number(dayNumber) - 1);
    if (scheduledDate > todayDateStr) {
      return res.status(403).json({ 
        error: `This day is scheduled for ${scheduledDate}. You can only mark its sessions on or after that date.` 
      });
    }

    // Check if session is already completed
    const existingLog = store.findOne('sessionLogs', s => s.userId === userId && s.sessionId === sessionId);
    if (existingLog && existingLog.isCompleted) {
      return res.status(400).json({ error: "This revision session has already been marked completed." });
    }

    const now = new Date();
    // Never record a completion date in the future.
    const effectiveDate = dateOverride && dateOverride <= todayDateStr
      ? dateOverride
      : formatDate(now);

    if (existingLog) {
      store.update('sessionLogs', s => s.id === existingLog.id, {
        isCompleted: true,
        completedAt: now.toISOString(),
        completedDate: effectiveDate
      });
    } else {
      store.insert('sessionLogs', {
        userId,
        sessionId,
        programDay: dayNumber,
        sessionType,
        assignedJuz: canonicalSession.assignedJuz,
        isCompleted: true,
        completedAt: now.toISOString(),
        completedDate: effectiveDate
      });
    }

    // Recompute metrics
    const updatedLogs = store.find('sessionLogs', s => s.userId === userId);
    const updatedMap = {};
    updatedLogs.forEach(s => {
      updatedMap[s.sessionId] = {
        isCompleted: s.isCompleted,
        completedAt: s.completedAt,
        completedDate: s.completedDate
      };
    });

    const newMetrics = calculateScheduleMetrics(enrolment?.startDate, updatedMap, todayDateStr);

    // Check if entire 90-day program is finished
    if (newMetrics.isAllCompleted && !enrolment.isCompleted) {
      store.update('enrolments', e => e.id === enrolment.id, {
        isCompleted: true,
        completedAt: now.toISOString()
      });
    }

    res.json({
      message: "Session successfully confirmed.",
      sessions: updatedMap,
      metrics: newMetrics
    });
  } catch (err) {
    console.error("Complete session error:", err);
    res.status(500).json({ error: "Failed to record session completion." });
  }
});

// POST /api/program/undo-session
router.post('/undo-session', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { dayNumber, sessionType } = req.body;
    const sessionId = sessionType === 'daily' ? `d${dayNumber}_daily` : `d${dayNumber}_${sessionType}`;

    const existingLog = store.findOne('sessionLogs', s => s.userId === userId && s.sessionId === sessionId);
    if (existingLog) {
      store.delete('sessionLogs', s => s.id === existingLog.id);
    }

    const updatedLogs = store.find('sessionLogs', s => s.userId === userId);
    const updatedMap = {};
    updatedLogs.forEach(s => {
      updatedMap[s.sessionId] = {
        isCompleted: s.isCompleted,
        completedAt: s.completedAt,
        completedDate: s.completedDate
      };
    });

    const enrolment = store.findOne('enrolments', e => e.userId === userId);
    const newMetrics = calculateScheduleMetrics(enrolment?.startDate, updatedMap, formatDate(new Date()));

    res.json({
      message: "Session confirmation undone.",
      sessions: updatedMap,
      metrics: newMetrics
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to undo session confirmation." });
  }
});

// POST /api/program/update-start-date
router.post('/update-start-date', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate } = req.body;

    if (!startDate) {
      return res.status(400).json({ error: "Valid start date is required." });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return res.status(400).json({ error: "Please provide a valid programme start date." });
    }

    const today = formatDate(new Date());
    if (startDate < today) {
      return res.status(400).json({
        error: "The programme start date cannot be earlier than today."
      });
    }

    store.update('enrolments', e => e.userId === userId, { startDate });
    res.json({ message: "Programme start date successfully updated.", startDate });
  } catch (err) {
    res.status(500).json({ error: "Failed to update start date." });
  }
});

export default router;
