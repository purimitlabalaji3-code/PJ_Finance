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
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json({ limit: '5mb' })); // Allow base64 image uploads

// Routes
app.use('/api/auth',        authRoutes);
app.use('/api/customers',   customerRoutes);
app.use('/api/loans',       loanRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/settings',    settingsRoutes);

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

app.listen(PORT, () => console.log(`✅ PJ Finance API running on http://localhost:${PORT}`));
