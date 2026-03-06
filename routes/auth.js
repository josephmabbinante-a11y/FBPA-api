import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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
    console.log(`[LOGIN DEBUG] Attempting login for email: '${email}' (searching for: '${searchEmail}')`);

    const user = await User.findOne({ email: searchEmail });
    console.log(`[LOGIN DEBUG] Query result:`, user);
    if (!user) {
      console.log(`[LOGIN DEBUG] No user found for email: '${searchEmail}'`);
      return res.status(401).json({ error: "No account found for this email address." });
    }
    console.log(`[LOGIN DEBUG] User found:`, user.email, user.id, user);
    console.log(`[LOGIN DEBUG] Stored passwordHash:`, user.passwordHash);

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    console.log(`[LOGIN DEBUG] Submitted password: '${password}'`);
    console.log(`[LOGIN DEBUG] Password match result:`, passwordMatches);
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
    console.error('[LOGIN DEBUG] Error during login:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
