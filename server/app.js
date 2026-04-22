// server/app.js — Express app (no listen, used by both local server and Vercel)
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes       from './routes/auth.js';
import customerRoutes   from './routes/customers.js';
import loanRoutes       from './routes/loans.js';
import collectionRoutes from './routes/collections.js';
import settingsRoutes   from './routes/settings.js';

const app = express();

// CORS — explicit origins required for SameSite:None cookies on Android WebViews
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'https://pj-finance-theta.vercel.app',
  'http://localhost:5173',
  'http://localhost:4000',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile app / direct API calls / Postman)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // Also allow any *.vercel.app origin for preview deployments
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    // Allow Android WebView (no origin header)
    return cb(null, true); // Liberal for production stability
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));

// Health check — verify server is running
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// Routes
app.use('/api/auth',        authRoutes);
app.use('/api/customers',   customerRoutes);
app.use('/api/loans',       loanRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/settings',    settingsRoutes);

// 404 for unknown /api routes
app.use('/api/*', (_, res) => res.status(404).json({ error: 'API route not found' }));

export default app;
