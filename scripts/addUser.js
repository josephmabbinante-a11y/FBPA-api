// Usage: node scripts/addUser.js <email> <password> <name>
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/Users.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function addUser(email, password, name = '') {
  if (!MONGODB_URI) {
    console.error('[ERROR] MONGODB_URI environment variable is not set. Create a .env file or set the variable.');
    process.exit(1);
  }
  try {
    console.log('[DEBUG] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[DEBUG] Connected to MongoDB');
    const existing = await User.findOne({ email: email.toLowerCase() });
    console.log('[DEBUG] Existing user lookup result:', existing);
    if (existing) {
      console.log('User already exists:', email);
      process.exit(1);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('[DEBUG] Password hashed');
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
