import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models.js';

const router = express.Router();

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const isDatabaseConnected = () => mongoose.connection.readyState === 1;

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
      email,
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

    const passwordMatches = await bcrypt.compare(password, user.passwordHash || '');
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

      // Debug logging for password comparison
      console.log('[auth/login] Submitted password:', password);
      console.log('[auth/login] Stored hash:', user.passwordHash);
      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      console.log('[auth/login] Password match result:', passwordMatches);
      if (!passwordMatches) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('[auth/login] Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const { email, newPassword } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || typeof newPassword !== 'string' || newPassword.trim() === '') {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
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
