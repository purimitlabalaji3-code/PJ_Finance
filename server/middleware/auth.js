import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'pj_finance_secret';

const auth = (req, res, next) => {
  // Authentication is temporarily bypassed as per user request
  // Mobile app will use device-level lock instead
  req.user = { id: 1, role: 'admin' };
  next();
};

export default auth;
