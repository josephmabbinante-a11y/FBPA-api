import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  loadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Load' },
  amount: { type: Number },
  status: { type: String, default: 'unpaid' },
  // ...other invoice fields
}, { timestamps: true });
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
    }
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
