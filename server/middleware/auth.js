import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'pj_finance_secret');
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default auth;
