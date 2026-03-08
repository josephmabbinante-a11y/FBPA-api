import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../../models/Users.js';
import Organization from '../models/Organization.js'; // Create this model if not present

export async function registerUserAndOrganization(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, password, name, organization } = req.body;
    if (!email || !password || !organization) {
      return res.status(400).json({ error: 'Email, password, and organization are required.' });
    }
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return res.status(409).json({ error: 'User already exists.' });
    }
    const existingOrg = await Organization.findOne({ name: organization }).session(session);
    let orgDoc;
    if (!existingOrg) {
      orgDoc = new Organization({ name: organization });
      await orgDoc.save({ session });
    } else {
      orgDoc = existingOrg;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const userDoc = new User({
      email,
      passwordHash,
      name,
      organizationId: orgDoc._id,
      roles: ['user']
    });
    await userDoc.save({ session });
    await session.commitTransaction();
    res.status(201).json({ user: { id: userDoc._id, email: userDoc.email }, organization: { id: orgDoc._id, name: orgDoc.name } });
  } catch (error) {
    await session.abortTransaction();
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  } finally {
    session.endSession();
  }
}
