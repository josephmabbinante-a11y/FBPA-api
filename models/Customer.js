import mongoose from "mongoose";

import { v4 as uuidv4 } from "uuid";

const customerSchema = new mongoose.Schema(
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
    email: {
      type: String
    },
    emailLower: {
      type: String
    },
    phone: {
      type: String
    },
    company: {
      type: String
    },
    billingAddress: {
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

export default mongoose.model("Customer", customerSchema);
