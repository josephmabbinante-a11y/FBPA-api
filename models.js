import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User model
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
});
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
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

// Carrier model (if exists)
let CarrierModel;
try {
  CarrierModel = (await import('./Carrier.js')).default;
} catch (e) {
  CarrierModel = null;
}
export const Carrier = CarrierModel;