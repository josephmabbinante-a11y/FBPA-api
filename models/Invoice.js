import mongoose from "mongoose";

import { v4 as uuidv4 } from "uuid";

const invoiceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue", "cancelled"],
      default: "pending"
    },
    date: {
      type: Date,
      default: Date.now
    },
    customerId: {
      type: String
    },
    carrierId: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
