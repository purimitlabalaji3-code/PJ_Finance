import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../db.js';
import auth from '../middleware/auth.js';

/**
 * AUTH SERVICE ROUTER (V2 Refactored Style)
 * Optimized for secure sessions and mobile cross-platform access.
 */
const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'pj_finance_secret';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 1 Week
};

/**
 * 🛠️ Helpers
 */
const createToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
};

/**
 * 🔐 POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Credentials are required for console access' 
    });
  }

  try {
    const sanitizedEmail = email.toLowerCase().trim();
    const adminEmailEnv = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    
    // 1. Precise Admin Identity Retrieval
    // We search across multiple identifiers (gmail, username) to support flexible login
    let [adminUser] = await sql`
      SELECT id, gmail, username, password 
      FROM admin 
      WHERE LOWER(gmail) = ${sanitizedEmail} OR LOWER(username) = ${sanitizedEmail}
      LIMIT 1
    `;

    // 2. Fallback to Primary Admin by ENV or First Row
    if (!adminUser) {
      // If the email matches the ENV, we allow the primary admin row to be used
      if (sanitizedEmail === adminEmailEnv) {
        [adminUser] = await sql`SELECT id, gmail, username, password FROM admin ORDER BY id ASC LIMIT 1`;
      }
    }

    // 3. Authentication Verification
    if (!adminUser) {
      return res.status(401).json({ success: false, error: 'Identity not recognized' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Secure key mismatch' });
    }

    // 3. Payload Construction (Session Metadata)
    const sessionPayload = {
      id: adminUser.id,
      email: adminUser.gmail || adminUser.username,
      iat: Math.floor(Date.now() / 1000)
    };

    const token = createToken(sessionPayload);

    // 4. Multi-Carrier Session Injection
    // Cookie for browsers, JSON token for Mobile WebViews (Vivo/Realme/Oppo)
    res.cookie('pj_token', token, COOKIE_OPTIONS);
    
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      session: {
        email: sessionPayload.email,
        token: token // Mobile fallback
      }
    });

  } catch (error) {
    console.error(' [AUTH_FATAL]:', error);
    return res.status(500).json({ success: false, error: 'Authorization engine failure' });
  }
});

/**
 * 🚪 POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.clearCookie('pj_token', { ...COOKIE_OPTIONS, maxAge: 0 });
  return res.json({ success: true, message: 'Session terminated' });
});

/**
 * 👤 GET /api/auth/me
 */
router.get('/me', auth, (req, res) => {
  return res.json({ 
    success: true, 
    user: { 
      id: req.user.id,
      email: req.user.email 
    } 
  });
});

/**
 * 🔑 POST /api/auth/change-password
 */
router.post('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'All security fields are mandatory' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Security key must be at least 8 characters' });
  }

  try {
    const [activeAdmin] = await sql`SELECT id, password FROM admin WHERE id = ${req.user.id}`;
    
    if (!activeAdmin) return res.status(404).json({ error: 'Admin record not found' });

    const isValid = await bcrypt.compare(currentPassword, activeAdmin.password);
    if (!isValid) return res.status(401).json({ error: 'Current security key is invalid' });

    const newHashedKey = await bcrypt.hash(newPassword, 12); // Slightly higher rounds for "Premium"
    await sql`UPDATE admin SET password = ${newHashedKey} WHERE id = ${activeAdmin.id}`;

    return res.json({ success: true, message: 'Security key updated successfully' });

  } catch (error) {
    console.error(' [PASS_UPDATE_FAIL]:', error);
    return res.status(500).json({ error: 'Failed to update credentials' });
  }
});

export default router;
