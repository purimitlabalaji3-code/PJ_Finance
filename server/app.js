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

// Open CORS for all origins — frontend and API are same domain on Vercel anyway
app.use(cors({
  origin: true,
  credentials: true,
}));

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
