import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String },
  make: { type: String },
  model: { type: String },
  year: { type: Number },
  licensePlate: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("Vehicle", vehicleSchema);
