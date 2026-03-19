import express from "express";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import { loginValidators, validate } from "../middleware/validators.js";

const router = express.Router();

function getJwtSecret() {
  return process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : '';
}

// Strict rate limiter for auth endpoints — 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

// Register endpoint
router.post("/register", authLimiter, loginValidators, validate, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database unavailable" });
    }

    const { email, password, name } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      name: name || "",
      roles: ["user"]
    });
    await user.save();

    const secret = getJwtSecret();
    if (!secret) {
      console.error('[REGISTER] JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error.' });
    }
    const accessToken = jwt.sign({ id: user.id, email: user.email, roles: user.roles }, secret, { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

    res.status(201).json({
      token: accessToken,
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, roles: user.roles },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", authLimiter, loginValidators, validate, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database unavailable" });
    }

    const { email, password } = req.body;
    const searchEmail = email.toLowerCase();

    const user = await User.findOne({ email: searchEmail });
    if (!user) {
        return res.status(401).json({ success: false, message: "No account found for this email address." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        return res.status(401).json({ success: false, message: "Incorrect password. Please try again or reset your password." });
      }

      const secret = getJwtSecret();
      if (!secret) {
        console.error('[LOGIN] JWT_SECRET is not configured');
        return res.status(500).json({ success: false, message: 'Server configuration error.' });
      }
      const token = jwt.sign({ id: user.id, email: user.email, roles: user.roles }, secret, { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

      res.json({ success: true, message: "Login successful", token, accessToken: token, user: { id: user.id, email: user.email, name: user.name, roles: user.roles } });
  } catch (error) {
    console.error('[LOGIN] Error during login:', error);
      res.status(500).json({ success: false, message: error.message });
  }
});

// Token refresh endpoint — exchange a still-valid access token for a new one.
// Tokens issued more than one expiry window ago are rejected to prevent indefinite refresh.
router.post("/refresh", async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  const secret = getJwtSecret();
  if (!secret) {
    console.error('[REFRESH] JWT_SECRET is not configured');
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });

    // Reject tokens issued more than one expiry window ago to prevent indefinite refresh.
    const expiresInStr = process.env.JWT_EXPIRES_IN || '8h';
    const match = /^(\d+)([smhd])$/.exec(expiresInStr);
    if (match) {
      const units = { s: 1, m: 60, h: 3600, d: 86400 };
      const maxAgeSeconds = parseInt(match[1], 10) * (units[match[2]] || 3600);
      if (Date.now() / 1000 - decoded.iat > maxAgeSeconds) {
        return res.status(401).json({ success: false, message: 'Token too old to refresh. Please log in again.' });
      }
    }

    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, roles: decoded.roles },
      secret,
      { algorithm: 'HS256', expiresIn: expiresInStr }
    );
    res.json({ success: true, token: newToken, accessToken: newToken });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

export default router;
