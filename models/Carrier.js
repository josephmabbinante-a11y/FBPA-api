import mongoose from "mongoose";

const carrierSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    nameLower: {
      type: String
    },
    mcNumber: {
      type: String
    },
    mcNumberNormalized: {
      type: String
    },
    email: {
      type: String
    },
    phone: {
      type: String
    },
    paymentTerms: {
      type: String
    },
    insuranceExpiry: {
      type: Date
    },
    taxId: {
      type: String
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Carrier", carrierSchema);
