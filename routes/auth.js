import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { loginValidators, validate } from "../middleware/validators.js";

const router = express.Router();

function resolveJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== "production") return "dev_secret_change_me";
  return null;
}

function signAccessToken(payload) {
  const jwtSecret = resolveJwtSecret();
  if (!jwtSecret) return null;
  return jwt.sign(payload, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
}

function tryDevFallbackLogin(email, password) {
  if (process.env.NODE_ENV === "production") return null;

  const devEmail = (process.env.DEV_LOGIN_EMAIL || "dev@opscale.local").toLowerCase();
  const devPassword = process.env.DEV_LOGIN_PASSWORD || "dev12345";

  if (email.toLowerCase() !== devEmail || password !== devPassword) {
    return null;
  }

  const accessToken = signAccessToken({
    sub: "dev-user",
    email: devEmail,
    roles: ["admin", "user"]
  });

  if (!accessToken) return null;

  return {
    accessToken,
    token: accessToken,
    user: {
      id: "dev-user",
      email: devEmail,
      name: "Dev User",
      roles: ["admin", "user"]
    },
    mode: "dev-fallback"
  };
}


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
      id: user._id,
      email: user.email,
      name: user.name,
      roles: user.roles
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reusable login function
async function loginUser({ email, password }) {
  if (mongoose.connection.readyState !== 1) {
    const fallback = tryDevFallbackLogin(email, password);
    if (fallback) return { status: 200, data: fallback };
    return { status: 503, data: { error: "Database unavailable" } };
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const fallback = tryDevFallbackLogin(email, password);
    if (fallback) return { status: 200, data: fallback };
    return { status: 401, data: { error: "Invalid credentials" } };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    const fallback = tryDevFallbackLogin(email, password);
    if (fallback) return { status: 200, data: fallback };
    return { status: 401, data: { error: "Invalid credentials" } };
  }

  const accessToken = signAccessToken({ sub: user._id, email: user.email, roles: user.roles });
  if (!accessToken) {
    return { status: 500, data: { error: "JWT_SECRET is not configured" } };
  }

  return {
    status: 200,
    data: {
      accessToken,
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    }
  };
}


router.post("/login", loginValidators, validate, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    return res.status(result.status).json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

