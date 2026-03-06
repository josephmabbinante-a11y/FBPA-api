import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
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
    }
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
