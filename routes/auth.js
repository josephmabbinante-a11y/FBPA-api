import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "JWT_SECRET is not configured" });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, roles: user.roles },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
