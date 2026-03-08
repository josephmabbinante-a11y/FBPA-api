// Usage: node scripts/addUser.js <email> <password> <name>

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/Users.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Environment variable MONGODB_URI is not set. Please set it before running this script.');
  process.exit(1);
}

async function addUser(email, password, name = '') {
  try {
    await mongoose.connect(MONGODB_URI);
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('User already exists:', email);
      process.exit(1);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      name,
      roles: ['user']
    });
    await user.save();
    console.log('User created:', user.email);
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Failed to add user:', err);
    process.exit(2);
  }
}

const [,, email, password, name] = process.argv;
if (!email || !password) {
  console.log('Usage: node scripts/addUser.js <email> <password> <name>');
  process.exit(1);
}
addUser(email, password, name);
