import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String },
  country: { type: String },
}, { timestamps: true });

export default mongoose.model("Location", locationSchema);
