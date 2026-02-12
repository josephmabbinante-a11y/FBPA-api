import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// User Schema
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String },
  email: { type: String, required: true, unique: true },
  emailLower: { type: String },
  password: { type: String, required: true },
  name: { type: String },
  nameLower: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});

// Pre-save hook for password hashing and auto-populating lowercase fields
UserSchema.pre('save', async function (next) {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcryptjs.hash(this.password, 10);
  }
  
  // Auto-populate or update lowercase fields when source fields change
  if (this.email && (this.isModified('email') || !this.emailLower)) {
    this.emailLower = this.email.toLowerCase();
  }
  if (this.name && (this.isModified('name') || !this.nameLower)) {
    this.nameLower = this.name.toLowerCase();
  }
  
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

// Indexes for User
UserSchema.index({ emailLower: 1 });
UserSchema.index({ nameLower: 1 });

// Customer Schema
const CustomerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nameLower: { type: String },
  email: { type: String },
  emailLower: { type: String },
  phone: { type: String },
  company: { type: String },
  industry: { type: String },
  taxId: { type: String },
  billingAddress: { type: String },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook for auto-populating lowercase fields
CustomerSchema.pre('save', function (next) {
  if (this.name && (this.isModified('name') || !this.nameLower)) {
    this.nameLower = this.name.toLowerCase();
  }
  if (this.email && (this.isModified('email') || !this.emailLower)) {
    this.emailLower = this.email.toLowerCase();
  }
  next();
});

// Indexes for Customer
CustomerSchema.index({ nameLower: 1 });
CustomerSchema.index({ emailLower: 1 });

// Carrier Schema
const CarrierSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nameLower: { type: String },
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

// Pre-save hook for auto-populating lowercase fields
CarrierSchema.pre('save', function (next) {
  if (this.name && (this.isModified('name') || !this.nameLower)) {
    this.nameLower = this.name.toLowerCase();
  }
  next();
});

// Indexes for Carrier
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
ExceptionSchema.index({ invoiceId: 1 });
ExceptionSchema.index({ status: 1 });

// Export models
export const User = mongoose.model('User', UserSchema);
export const Customer = mongoose.model('Customer', CustomerSchema);
export const Carrier = mongoose.model('Carrier', CarrierSchema);
export const Invoice = mongoose.model('Invoice', InvoiceSchema);
export const Exception = mongoose.model('Exception', ExceptionSchema);