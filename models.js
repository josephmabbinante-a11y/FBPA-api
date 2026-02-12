import User from './models/User.js';
import Invoice from './models/Invoice.js';
import Audit from './models/Audit.js';
import Exception from './models/Exception.js';

// Create placeholder models for Customer and Carrier since they're imported but don't have model files yet
import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const carrierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);
const Carrier = mongoose.model('Carrier', carrierSchema);

export { User, Invoice, Audit, Exception, Customer, Carrier };