import mongoose from "mongoose";


import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: ""
    },
    roles: {
      type: [String],
      default: ["user"]
    },
    organization: {
      type: String,
      default: ""
    }
  },
  { timestamps: true, _id: false }
);

export default mongoose.model("User", userSchema);
