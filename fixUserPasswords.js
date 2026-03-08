// Script to update all users with plain passwordHash to bcrypt hashes
// Usage: node fixUserPasswords.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fbpa';
const PLAINTEXT_PASSWORDS = process.env.PLAINTEXT_PASSWORDS
  ? process.env.PLAINTEXT_PASSWORDS.split(',').map(p => p.trim()).filter(Boolean)
  : process.argv.slice(2);

async function fixPasswords() {
  if (!PLAINTEXT_PASSWORDS.length) {
    console.error('No plaintext passwords provided. Set PLAINTEXT_PASSWORDS env var or pass them as CLI arguments.');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  const users = await User.find({ passwordHash: { $in: PLAINTEXT_PASSWORDS } });
  for (const user of users) {
    const hash = await bcrypt.hash(user.passwordHash, 10);
    user.passwordHash = hash;
    await user.save();
    console.log(`Updated user ${user.email}`);
  }
  await mongoose.disconnect();
  console.log('Password hashes updated!');
}

fixPasswords().catch(console.error);
