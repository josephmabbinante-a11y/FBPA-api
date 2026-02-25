import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User model (unified with auth.js)
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};
export const User = mongoose.model('User', UserSchema);

// Invoice model
import InvoiceModel from './Invoice.js';
export const Invoice = InvoiceModel;

// Exception model
import ExceptionModel from './Exception.js';
export const Exception = ExceptionModel;

// Audit model
import AuditModel from './Audit.js';
export const Audit = AuditModel;

// Customer model
import CustomerModel from './Customer.js';
export const Customer = CustomerModel;

// Carrier model (if exists)
let CarrierModel;
try {
  CarrierModel = (await import('./Carrier.js')).default;
} catch (e) {
  CarrierModel = null;
}
export const Carrier = CarrierModel;