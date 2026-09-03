import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/Users.js';

/**
 * In-memory token blacklist for logout/revocation.
 * In production, use Redis for distributed systems.
 */
const tokenBlacklist = new Set();

export function addToBlacklist(token) {
  tokenBlacklist.add(token);
  // Auto-cleanup after token expiry (default 1h = 3600s)
  setTimeout(() => tokenBlacklist.delete(token), 3600 * 1000);
}

export function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  // Check if token is blacklisted (logged out)
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ success: false, message: 'Token has been revoked. Please log in again.' });
  }

  const secret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : '';
  if (!secret) {
    console.error('[AUTH] JWT_SECRET is not configured');
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    req.user = decoded;
    req.token = token; // Store token for potential blacklisting on logout
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
}

export function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, error: 'Database unavailable. Please try again later.' });
  }
  next();
}

/**
 * Check if user account is locked due to failed login attempts
 */
export async function checkAccountLock(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return next();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next();

    if (user.isLocked()) {
      const minutesRemaining = Math.ceil((user.lockUntil - new Date()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Account locked due to too many failed login attempts. Try again in ${minutesRemaining} minutes.`
      });
    }

    next();
  } catch (err) {
    console.error('[ACCOUNT_LOCK] Error checking account lock:', err.message);
    next();
  }
}
