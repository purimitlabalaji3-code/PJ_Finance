import express from 'express';
import sql from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/settings
router.get('/', auth, async (req, res) => {
  try {
    const rows = await sql`SELECT key, value FROM settings`;
    // Convert array to object for easy use
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/settings
router.put('/', auth, async (req, res) => {
  try {
    const entries = Object.entries(req.body);
    for (const [key, value] of entries) {
      await sql`
        INSERT INTO settings (key, value) VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
      `;
    }
    res.json({ message: 'Settings saved' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
