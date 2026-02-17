const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/login
router.post('/', async (req, res) => {
  const { email, password } = req.body;
  console.log('[LOGIN] Attempt:', { email });
  if (!email || !password) {
    console.warn('[LOGIN] Missing email or password');
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await User.findOne({ email });
    console.log('[LOGIN] User found:', !!user, user && user.email);
    if (!user) {
      console.warn('[LOGIN] No user found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('[LOGIN] Password match:', isMatch);
    if (!isMatch) {
      console.warn('[LOGIN] Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );
    console.log('[LOGIN] Login successful for:', email);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('[LOGIN] Server error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
