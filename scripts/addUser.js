// Usage: node scripts/addUser.js <email> <password> <name>
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://josephmabbinante_db_user:tEkZDundjpXeSa2G@cluster0.fvycshx.mongodb.net/fbpa-db?appName=Cluster0';
const User = require('../models/User');

async function addUser(email, password, name = '') {
  try {
    console.log('[DEBUG] Connecting to MongoDB:', MONGODB_URI);
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
