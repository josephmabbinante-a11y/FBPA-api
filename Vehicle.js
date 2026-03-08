import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  type: { type: String },
  make: { type: String },
  model: { type: String },
  year: { type: Number },
  licensePlate: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

export default mongoose.model("Vehicle", vehicleSchema);
