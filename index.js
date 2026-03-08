import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
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
import locationsRouter from './locations.js';
import tripsRouter from './trips.js';
import driversRouter from './drivers.js';
import vehiclesRouter from './vehicles.js';
import loadsRouter from './loads.js';

dotenv.config();
const PORT = process.env.PORT || 4000;

// Load environment variables from .env (already loaded above)
const mongoUriEnvKeys = ['MONGODB_URI', 'MONGODB_URL', 'MONGO_URL', 'MONGO_URI', 'DATABASE_URL'];
const mongoUriEnvKey = mongoUriEnvKeys.find((key) => {
  const value = process.env[key];
  return typeof value === 'string' && value.trim().length > 0;
});
const MONGODB_URI = (mongoUriEnvKey ? process.env[mongoUriEnvKey] : '').trim();
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '';
const SERVE_STATIC = process.env.SERVE_STATIC === 'true';
const app = express();
// ...existing code...
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Allow only Vercel frontend and custom domains for CORS
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'https://express-git-fbpa-josephmabbinante-a11ys-projects.vercel.app',
  'https://www.hdhtransport.com',
  'https://hdhtransport.com',
  'https://fbpa-f073sj7mi-josephmabbinante-a11ys-projects.vercel.app',
  'https://fbpa-qh4fmw9tg-josephmabbinante-a11ys-projects.vercel.app',
  'https://vercel.com/josephmabbinante-a11ys-projects/fbpa-ui'
  , 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ''
  // Add any custom production domains here
];
// ...existing code...

const envAllowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, '').toLowerCase())
  .filter(Boolean);

const allowedOrigins = new Set(
  [...defaultAllowedOrigins, ...envAllowedOrigins]
    .map((origin) => origin.trim().replace(/\/+$/, '').toLowerCase())
);

const hasUriPlaceholders = /<[^>]+>/.test(MONGODB_URI);

if (MONGODB_URI && !hasUriPlaceholders) {
  if (mongoUriEnvKey !== 'MONGODB_URI') {
    console.warn(`[mongodb] Using ${mongoUriEnvKey} (preferred key is MONGODB_URI).`);
  }
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
  console.warn(`[mongodb] No Mongo URI found. Checked keys: ${mongoUriEnvKeys.join(', ')}. Running without database.`);
}

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = origin.trim().replace(/\/+$/, '').toLowerCase();
    if (allowedOrigins.has(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
}));

app.use((req, res, next) => {
  const startedAt = Date.now();
  const origin = req.headers.origin || '-';
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    console.log(`[http] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms origin=${origin} ip=${ip}`);
  });

  next();
});


// Add JSON parse error handler for body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const contentType = req.headers['content-type'] || '';
    console.error(`[bad-json] ${err.message} content-type=${contentType}`);
    return res.status(400).json({
      ok: false,
      error: 'Invalid JSON in request body.',
      hint: 'Send valid JSON like {"email":"name@example.com","password":"..."} with Content-Type: application/json',
    });
  }
  next(err);
});

// API routes
app.use('/auth', authRouter);
app.use('/api/auth', authRouter);
// Backward compatibility for older frontend bundles still calling v1 paths.
app.use('/api/v1/auth', authRouter);
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
app.use('/api/locations', locationsRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/loads', loadsRouter);

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

// Root route for friendly message
app.get('/', (req, res) => {
  res.send('API server is running!');
});

app.use((err, req, res, next) => {
  if (err && typeof err.message === 'string' && err.message.startsWith('CORS origin not allowed:')) {
    return res.status(403).json({ error: err.message });
  }

  return next(err);
});

app.listen(PORT, () => {
  console.log(`FBPA API server running on http://localhost:${PORT}`);
});
