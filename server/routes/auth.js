import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../db.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'pj_finance_secret';

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    email = email.toLowerCase().trim();
    const adminEmailEnv = process.env.ADMIN_EMAIL?.toLowerCase().trim();

    // 1. Find admin in DB (by gmail or username)
    // We try to match the email against the 'gmail' or 'username' column
    const [admin] = await sql`
      SELECT * FROM admin 
      WHERE LOWER(gmail) = ${email} OR LOWER(username) = ${email}
      LIMIT 1
    `;

    // 2. Fallback to hardcoded ADMIN_EMAIL if DB doesn't have it match
    if (!admin && email !== adminEmailEnv) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If we didn't find them in DB by email, just get the primary admin for password check
    let targetAdmin = admin;
    if (!targetAdmin) {
      const [firstAdmin] = await sql`SELECT * FROM admin LIMIT 1`;
      targetAdmin = firstAdmin;
    }

    if (!targetAdmin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Verify password
    const valid = await bcrypt.compare(password, targetAdmin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: targetAdmin.id, email }, SECRET, { expiresIn: '7d' });

    // Set HttpOnly cookie
    res.cookie('pj_token', token, COOKIE_OPTIONS);
    
    // Return token for frontend backup (vital for Vivo/Realme/WebView)
    res.json({ email, token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Internal server error' });
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

