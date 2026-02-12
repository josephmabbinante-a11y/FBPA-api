import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import customersRouter from './customers.js';
import carriersRouter from './carriers.js';
import invoicesRouter from './invoices.js';
import exceptionsRouter from './exceptions.js';
import messagesRouter from './messages.js';
import rateLogicRouter from './rateLogic.js';
import dashboardRouter from './dashboard.js';
import reportsRouter from './reports.js';
import uploadsRouter from './uploads.js';
import invoiceImagesRouter from './invoiceImages.js';
import ediRouter from './edi.js';
import authRouter from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = (process.env.MONGODB_URI || '').trim();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
];

const envAllowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

const hasUriPlaceholders = /<[^>]+>/.test(MONGODB_URI);

if (MONGODB_URI && !hasUriPlaceholders) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  })
    .then(() => console.log('[mongodb] Connected'))
    .catch((err) => console.error('[mongodb] Connection error:', err.message));

  mongoose.connection.on('disconnected', () => {
    console.warn('[mongodb] Disconnected');
  });
} else if (hasUriPlaceholders) {
  console.warn('[mongodb] MONGODB_URI contains placeholder brackets. Update .env with real credentials.');
} else {
  console.warn('[mongodb] MONGODB_URI not set, running without database');
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// Auth routes
app.use('/auth', authRouter);

// API routes
app.use('/api/customers', customersRouter);
app.use('/api/carriers', carriersRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/exceptions', exceptionsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/rate-logic', rateLogicRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/invoice-images', invoiceImagesRouter);
app.use('/api/edi', ediRouter);

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.json({
    ok: true,
    dbStatus,
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

if (process.env.SERVE_STATIC === 'true') {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
      next();
      return;
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`FBPA API server running on http://localhost:${4000}`);
});
