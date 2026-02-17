import mongoose from "mongoose";

import { v4 as uuidv4 } from "uuid";

const exceptionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true
    },
    code: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    invoiceId: {
      type: String
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

export default mongoose.model("Exception", exceptionSchema);
