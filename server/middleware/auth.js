import jwt from 'jsonwebtoken';
import { store } from '../data/store.js';

export const JWT_SECRET = process.env.JWT_SECRET || "thabat_quran_revision_secret_key_2026_90days";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required. Please log in." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired session. Please log in again." });
    }

    const user = store.findOne('users', u => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    // Attach user to req (strip passwordHash)
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Administrator privileges required." });
  }
  next();
}
