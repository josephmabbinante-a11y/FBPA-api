import mongoose from "mongoose";

const loadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carrierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carrier' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  origin: { type: String },
  destination: { type: String },
  status: { type: String, default: 'pending' },
  // ...other load fields
}, { timestamps: true });

export default mongoose.model("Load", loadSchema);
