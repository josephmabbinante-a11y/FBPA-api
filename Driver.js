import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  licenseNumber: { type: String },
  phone: { type: String },
  email: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
}, { timestamps: true });

export default mongoose.model("Driver", driverSchema);
