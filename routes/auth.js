import express from "express";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import { loginValidators, validate } from "../middleware/validators.js";

const router = express.Router();

// Register endpoint
router.post("/register", loginValidators, validate, async (req, res) => {
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

router.post("/login", loginValidators, validate, async (req, res) => {
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

      const rawJwtSecret = process.env.JWT_SECRET;
      const jwtSecret = typeof rawJwtSecret === 'string' ? rawJwtSecret.trim() : '';
      if (!jwtSecret || jwtSecret.length < 32) {
        console.error('[LOGIN] Invalid JWT_SECRET configuration: must be at least 32 non-whitespace characters');
        return res.status(500).json({ success: false, message: "Server configuration error. Please contact support." });
      }
      const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
      const token = jwt.sign(
        { id: user.id, email: user.email, roles: user.roles },
        jwtSecret,
        { expiresIn }
      );

      res.json({ success: true, message: "Login successful", token, user: { id: user.id, email: user.email, name: user.name, roles: user.roles } });
  } catch (error) {
    console.error('[LOGIN] Error during login:', error);
      res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
