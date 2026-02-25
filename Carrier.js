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
    nameLower: {
      type: String
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Carrier", carrierSchema);
