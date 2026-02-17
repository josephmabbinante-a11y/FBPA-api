import mongoose from "mongoose";

import { v4 as uuidv4 } from "uuid";

const carrierSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
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
    organization: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.model("Carrier", carrierSchema);
