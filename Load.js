import mongoose from "mongoose";

const loadSchema = new mongoose.Schema({
  tripId: { type: String },
  origin: { type: String },
  destination: { type: String },
  status: { type: String, enum: ["pending", "in-transit", "delivered", "cancelled"], default: "pending" },
  weight: { type: Number },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model("Load", loadSchema);
