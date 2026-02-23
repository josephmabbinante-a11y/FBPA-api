import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from './models.js';

const router = express.Router();

async function registerHandler(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with passwordHash
    const newUser = new User({
      email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();

    res.status(201).json({ user: { id: newUser.id, email: newUser.email } });
  } catch (err) {
    console.error('[auth/signup] Error:', err);
    res.status(500).json({ error: err.message });
  }
}

// GET /auth/register - Friendly message for browser access
router.get('/register', (req, res) => {
  res.status(405).json({ error: 'Method Not Allowed', message: 'Please use POST request to register' });
});

// POST /auth/register
router.post('/register', registerHandler);

// Backward-compatible alias
router.get('/signup', (req, res) => {
  res.status(405).json({ error: 'Method Not Allowed', message: 'Please use POST request to register' });
});
router.post('/signup', registerHandler);

// GET /api/auth/login - Friendly message for browser access
router.get('/login', (req, res) => {
  res.status(405).json({ error: 'Method Not Allowed', message: 'Please use POST request to log in' });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('[auth/login] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
