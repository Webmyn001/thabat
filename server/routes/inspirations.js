import express from 'express';
import { store } from '../data/store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { formatDate } from '../../src/utils/scheduleEngine.js';

const router = express.Router();

// GET /api/inspirations/daily
// Deterministic daily selection based on calendar date (consistent across all users, devices, and refreshes)
router.get('/daily', (req, res) => {
  try {
    const inspirations = store.find('inspirations', i => i.isPublished !== false);
    if (!inspirations || inspirations.length === 0) {
      return res.status(404).json({ error: "No inspiration reminders found." });
    }

    const todayStr = formatDate(new Date());
    let charSum = 0;
    for (let i = 0; i < todayStr.length; i++) {
      charSum += todayStr.charCodeAt(i);
    }

    const index = charSum % inspirations.length;
    const selectedReminder = inspirations[index];

    res.json({
      date: todayStr,
      reminder: selectedReminder,
      totalInLibrary: inspirations.length
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load daily reminder." });
  }
});

// GET /api/inspirations/archive
router.get('/archive', (req, res) => {
  try {
    const { category, search } = req.query;
    let list = store.find('inspirations', i => i.isPublished !== false);

    if (category && category !== 'all') {
      list = list.filter(i => i.category === category);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(i => 
        i.englishText.toLowerCase().includes(q) ||
        i.arabicText.includes(q) ||
        (i.sourceReference && i.sourceReference.toLowerCase().includes(q))
      );
    }

    res.json({ reminders: list });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch archive." });
  }
});

// ADMIN: POST /api/inspirations
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { category, arabicText, englishText, sourceReference, attribution, isPublished } = req.body;
    if (!arabicText || !englishText || !category) {
      return res.status(400).json({ error: "Arabic text, English text, and category are required." });
    }

    const all = store.get('inspirations');
    const newEntry = store.insert('inspirations', {
      dayIndex: all.length + 1,
      category,
      arabicText,
      englishText,
      sourceReference: sourceReference || "",
      attribution: attribution || "",
      isPublished: isPublished !== false,
      createdAt: new Date().toISOString()
    });

    store.logAudit(req.user.id, "CREATE_INSPIRATION", `Created reminder ID ${newEntry.id}`);
    res.status(201).json({ message: "Reminder successfully added.", entry: newEntry });
  } catch (err) {
    res.status(500).json({ error: "Failed to create inspiration entry." });
  }
});

// ADMIN: PUT /api/inspirations/:id
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const updated = store.update('inspirations', i => i.id == id || i.dayIndex == id, updates);

    if (!updated) {
      return res.status(404).json({ error: "Inspiration entry not found." });
    }

    store.logAudit(req.user.id, "UPDATE_INSPIRATION", `Updated reminder ID ${id}`);
    res.json({ message: "Reminder updated.", entry: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update inspiration entry." });
  }
});

// ADMIN: DELETE /api/inspirations/:id
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const id = req.params.id;
    store.delete('inspirations', i => i.id == id || i.dayIndex == id);
    store.logAudit(req.user.id, "DELETE_INSPIRATION", `Deleted reminder ID ${id}`);
    res.json({ message: "Reminder deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete inspiration entry." });
  }
});

export default router;
