import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'pj_finance_secret';

const auth = (req, res, next) => {
  // 1. Get from Cookie
  let token = req.cookies?.pj_token;

  // 2. Fallback to Authorization Header (for mobile apps/webviews)
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export default auth;
