import express from "express";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/Users.js";
import { loginValidators, validate } from "../middleware/validators.js";

const router = express.Router();

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

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles
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

      res.json({ success: true, message: "Login successful", user: { id: user.id, email: user.email, name: user.name, roles: user.roles } });
  } catch (error) {
    console.error('[LOGIN] Error during login:', error);
      res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
