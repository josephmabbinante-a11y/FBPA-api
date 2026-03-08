import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  driverId: { type: String },
  vehicleId: { type: String },
  origin: { type: String },
  destination: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ["planned", "in-progress", "completed", "cancelled"], default: "planned" },
}, { timestamps: true });

export default mongoose.model("Trip", tripSchema);
