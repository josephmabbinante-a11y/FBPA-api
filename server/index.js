// --- Imports ---
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Environment Setup ---
dotenv.config();

// --- App Setup ---
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tms';

// --- Global Middleware ---
app.use(cors());
app.use(express.json());

// --- Tenant Guard Middleware Example ---
const tenantGuard = (req, res, next) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return res.status(403).json({ error: 'Tenant context missing' });
  req.tenantId = tenantId;
  next();
};

// --- Feature Routes ---
import customersRouter from './routes/customers.js';
import loadsRouter from './routes/loads.js';
import authRouter from './routes/auth.js';
// Add other routers as needed

app.use('/api/customers', customersRouter);
app.use('/api/loads', tenantGuard, loadsRouter);
app.use('/api/auth', authRouter);

// --- Static Serving ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// --- Catch-All Route ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// --- Database & Start ---
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
