// server/app.js — Express app (no listen, used by both local server and Vercel)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes       from './routes/auth.js';
import customerRoutes   from './routes/customers.js';
import loanRoutes       from './routes/loans.js';
import collectionRoutes from './routes/collections.js';
import settingsRoutes   from './routes/settings.js';

const app = express();

// Allow both local dev origins and any Vercel deploy
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  /\.vercel\.app$/,
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser requests
    const ok = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    cb(ok ? null : new Error('CORS not allowed'), ok);
  },
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));

// Routes
app.use('/api/auth',        authRoutes);
app.use('/api/customers',   customerRoutes);
app.use('/api/loans',       loanRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/settings',    settingsRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

export default app;
