// server/middleware/auth.js — DISABLED AUTH (Always Allow)
const auth = (req, res, next) => {
  // Mock user for internal consistency
  req.user = { id: 1, email: 'admin@pjfinance.com' };
  next();
};

export default auth;
