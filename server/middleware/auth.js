import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Read from HttpOnly cookie (primary) or Authorization header (fallback)
  const token = req.cookies?.pj_token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'pj_finance_secret');
    next();
  } catch (err) {
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
    return res.status(401).json({ error: 'Invalid or expired token', code });
  }
};

export default auth;
