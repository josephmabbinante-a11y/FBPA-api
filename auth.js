import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models.js';

const router = express.Router();

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const isDatabaseConnected = () => mongoose.connection.readyState === 1;

// Simple in-memory rate limiter for reset-password (max 5 attempts per email per minute)
const resetAttempts = new Map();
function checkResetRateLimit(email) {
  const now = Date.now();
  const key = email.toLowerCase();
  const record = resetAttempts.get(key) || { count: 0, windowStart: now };

  if (now - record.windowStart > 60_000) {
    record.count = 0;
    record.windowStart = now;
  }

  record.count += 1;
  resetAttempts.set(key, record);
  return record.count <= 5;
}

async function registerHandler(req, res) {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const { email, password, name } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: normalizedEmail,
      name: typeof name === 'string' ? name.trim() : '',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();
    return res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        roles: newUser.roles,
      },
    });
  } catch (err) {
    console.error('[auth/register] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}

router.get('/register', (req, res) => {
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: 'Please use POST request to register',
  });
});

router.post('/register', registerHandler);

router.get('/signup', (req, res) => {
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: 'Please use POST request to register',
  });
});

router.post('/signup', registerHandler);

router.get('/login', (req, res) => {
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: 'Please use POST request to log in',
  });
});

router.post('/login', async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    });
  } catch (err) {
    console.error('[auth/login] Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Password reset endpoint — requires current password for authorization
router.post('/reset-password', async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const { email, currentPassword, newPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof currentPassword !== 'string' || currentPassword.trim() === '' ||
        typeof newPassword !== 'string' || newPassword.trim() === '') {
      return res.status(400).json({ error: 'Email, current password, and new password are required.' });
    }

    if (!checkResetRateLimit(normalizedEmail)) {
      return res.status(429).json({ error: 'Too many reset attempts. Please try again later.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const currentPasswordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentPasswordMatches) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('[auth/reset-password] Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
