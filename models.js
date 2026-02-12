import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

// Pre-save hook for password hashing
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const CustomerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: String,
  phone: String,
  company: String,
  billingAddress: String,
  nameLower: String,
  emailLower: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CarrierSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  mcNumber: String,
  mcNumberNormalized: String,
  email: String,
  phone: String,
  paymentTerms: String,
  insuranceExpiry: Date,
  taxId: String,
  nameLower: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: String,
  customerId: String,
  carrierId: String,
  customerName: String,
  carrierName: String,
  carrier: String,
  invoiceNumber: String,
  amount: Number,
  accessorials: Number,
  fuelSurcharge: Number,
  contractRate: Number,
  status: String,
  dueDate: Date,
  issueDate: Date,
  paymentTerms: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ExceptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  invoiceId: String,
  invoiceNumber: String,
  customerId: String,
  customer: String,
  carrierId: String,
  carrier: String,
  amount: Number,
  type: String,
  reason: String,
  description: String,
  severity: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', UserSchema);
export const Customer = mongoose.model('Customer', CustomerSchema);
export const Carrier = mongoose.model('Carrier', CarrierSchema);
export const Invoice = mongoose.model('Invoice', InvoiceSchema);
export const Exception = mongoose.model('Exception', ExceptionSchema);