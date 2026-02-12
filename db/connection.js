import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/fbpa-api";

    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });

    console.log("✓ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.warn("⚠ MongoDB connection failed:", error.message);
    console.warn("⚠ Continuing in mock-data mode without database persistence");
    return false;
  }
};

export default connectDB;
