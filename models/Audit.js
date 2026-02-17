import mongoose from "mongoose";

import { v4 as uuidv4 } from "uuid";

const auditSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true
    },
    userId: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    resource: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Audit", auditSchema);
