import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  emailLower: { type: String, lowercase: true },
  password: { type: String, required: true },
  name: { type: String },
  nameLower: { type: String, lowercase: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

// Pre-save hook for password hashing
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

// Indexes for User
UserSchema.index({ id: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ emailLower: 1 });

// Customer Schema
const CustomerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nameLower: { type: String, lowercase: true },
  email: { type: String },
  emailLower: { type: String, lowercase: true },
  phone: { type: String },
  company: { type: String },
  industry: { type: String },
  taxId: { type: String },
  billingAddress: { type: String },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for Customer
CustomerSchema.index({ id: 1 }, { unique: true });
CustomerSchema.index({ nameLower: 1 });
CustomerSchema.index({ emailLower: 1 });

// Carrier Schema
const CarrierSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nameLower: { type: String, lowercase: true },
  mcNumber: { type: String },
  mcNumberNormalized: { type: String },
  email: { type: String },
  phone: { type: String },
  paymentTerms: { type: String },
  insuranceExpiry: { type: Date },
  taxId: { type: String },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for Carrier
CarrierSchema.index({ id: 1 }, { unique: true });
CarrierSchema.index({ nameLower: 1 });
CarrierSchema.index({ mcNumberNormalized: 1 });

// Invoice Schema
const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['AR', 'AP'], required: true },
  customerId: { type: String },
  carrierId: { type: String },
  customerName: { type: String },
  carrierName: { type: String },
  carrier: { type: String },
  invoiceNumber: { type: String, required: true },
  amount: { type: Number, default: 0 },
  accessorials: { type: Number, default: 0 },
  fuelSurcharge: { type: Number, default: 0 },
  contractRate: { type: Number, default: 0 },
  status: { type: String, default: 'Pending' },
  dueDate: { type: Date },
  issueDate: { type: Date, default: Date.now },
  paymentTerms: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for Invoice
InvoiceSchema.index({ id: 1 }, { unique: true });
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ carrierId: 1 });
InvoiceSchema.index({ type: 1 });

// Exception Schema
const ExceptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  invoiceId: { type: String },
  invoiceNumber: { type: String },
  customerId: { type: String },
  customer: { type: String },
  carrierId: { type: String },
  carrier: { type: String },
  amount: { type: Number, default: 0 },
  type: { type: String },
  reason: { type: String },
  description: { type: String },
  severity: { type: String, default: 'Medium' },
  status: { type: String, default: 'Open' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for Exception
ExceptionSchema.index({ id: 1 }, { unique: true });
ExceptionSchema.index({ invoiceId: 1 });
ExceptionSchema.index({ status: 1 });

// Export models
export const User = mongoose.model('User', UserSchema);
export const Customer = mongoose.model('Customer', CustomerSchema);
export const Carrier = mongoose.model('Carrier', CarrierSchema);
export const Invoice = mongoose.model('Invoice', InvoiceSchema);
export const Exception = mongoose.model('Exception', ExceptionSchema);