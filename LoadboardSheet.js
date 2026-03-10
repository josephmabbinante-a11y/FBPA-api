import mongoose from "mongoose";

const loadboardSheetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  uploadedBy: { type: String },
  fileName: { type: String },
  rows: { type: Array, default: [] }, // Store parsed rows
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("LoadboardSheet", loadboardSheetSchema);
