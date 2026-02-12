import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Customer Schema
const customerSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: String,
  company: String,
  industry: String,
  taxId: String,
  billingAddress: String,
  nameLower: String,
  emailLower: String,
  status: { type: String, enum: ['Active', 'Inactive', 'Pending'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Carrier Schema
const carrierSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  mcNumber: { type: String, unique: true, sparse: true },
  dotNumber: String,
  email: String,
  phone: String,
  paymentTerms: String,
  insuranceExpiry: Date,
  taxId: String,
  status: { type: String, enum: ['Active', 'Inactive', 'Alert'], default: 'Active' },
  nameLower: String,
  mcNumberNormalized: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  type: { type: String, enum: ['AR', 'AP'], required: true },
  customerId: String,
  carrierId: String,
  customerName: String,
  carrierName: String,
  carrier: String,
  invoiceNumber: String,
  amount: Number,
  accessorials: { type: Number, default: 0 },
  fuelSurcharge: { type: Number, default: 0 },
  contractRate: { type: Number, default: 0 },
  status: { type: String, default: 'Pending' },
  dueDate: Date,
  issueDate: Date,
  paymentTerms: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Exception Schema
const exceptionSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  invoiceId: String,
  invoiceNumber: String,
  customerId: String,
  customer: String,
  carrierId: String,
  carrier: String,
  amount: Number,
  type: { type: String, enum: ['financial', 'compliance'], default: 'financial' },
  reason: String,
  description: String,
  severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'manager'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const Customer = mongoose.model('Customer', customerSchema);
export const Carrier = mongoose.model('Carrier', carrierSchema);
export const Invoice = mongoose.model('Invoice', invoiceSchema);
export const Exception = mongoose.model('Exception', exceptionSchema);
export const User = mongoose.model('User', userSchema);