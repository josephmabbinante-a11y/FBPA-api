import mongoose from 'mongoose';

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
  status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
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

export default mongoose.model('Invoice', InvoiceSchema);
