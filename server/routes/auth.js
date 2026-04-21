import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'pj_finance_secret';

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,           // JS cannot access — prevents XSS theft
  secure: IS_PROD,          // HTTPS only in production
  sameSite: IS_PROD ? 'none' : 'lax', // cross-site cookie works on Vercel
  maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days in ms
  path: '/',
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    // Match against ADMIN_EMAIL env variable
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    if (email.toLowerCase().trim() !== adminEmail)
      return res.status(401).json({ error: 'Invalid credentials' });

    // Verify password against DB
    const [admin] = await sql`SELECT * FROM admin LIMIT 1`;
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, email }, SECRET, { expiresIn: '7d' });

    // Set HttpOnly cookie — browser sends it automatically on every request
    res.cookie('pj_token', token, COOKIE_OPTIONS);
    res.json({ email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('pj_token', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me — verify session is still valid
router.get('/me', auth, (req, res) => {
  res.json({ email: req.user.email });
});

// POST /api/auth/change-password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Fields required' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const [admin] = await sql`SELECT * FROM admin LIMIT 1`;
    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE admin SET password = ${hashed} WHERE id = ${admin.id}`;
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

