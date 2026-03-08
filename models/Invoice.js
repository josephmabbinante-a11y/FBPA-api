import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Load' },
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
    }
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
