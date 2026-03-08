import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import User from "../models/Users.js";
import { loginValidators, validate } from "../middleware/validators.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many reset attempts. Please try again later." },
});

// Register endpoint
router.post("/register", loginValidators, validate, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database unavailable" });
    }

    const { email, password, name } = req.body;
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required and must be strings.' });
    }
    if (password.trim() === '') {
      return res.status(400).json({ error: 'Password cannot be empty.' });
    }
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

router.post("/login", loginLimiter, loginValidators, validate, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database unavailable" });
    }

    const { email, password } = req.body;
    const searchEmail = email.toLowerCase();

    const user = await User.findOne({ email: searchEmail });
    if (!user) {
      return res.status(401).json({ error: "No account found for this email address." });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Incorrect password. Please try again or reset your password." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, roles: user.roles } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Password reset endpoint — requires current password for authorization
router.post("/reset-password", resetPasswordLimiter, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "Database unavailable" });
    }

    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "Email, current password, and new password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const currentPasswordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentPasswordMatches) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
