import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
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
    // Email verification fields
    emailVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null,
      index: { expireAfterSeconds: 86400 } // Auto-delete after 24 hours
    },
    // Password reset fields
    resetPasswordToken: {
      type: String,
      default: null,
      index: { expireAfterSeconds: 3600 } // Auto-delete after 1 hour
    },
    // Refresh token blacklist for logout
    refreshTokenBlacklist: {
      type: [String],
      default: []
    },
    // Account lockout after failed attempts
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    },
    // Last login tracking
    lastLogin: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Helper method to check if account is locked
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > new Date();
};

// Helper method to increment failed attempts
userSchema.methods.incFailedAttempts = async function() {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1, lockUntil: null }
    });
  }

  // Increment attempts, lock after 5 failed attempts for 15 minutes
  const updates = { $inc: { failedLoginAttempts: 1 } };
  if (this.failedLoginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: new Date(Date.now() + 15 * 60 * 1000) };
  }
  return this.updateOne(updates);
};

// Helper method to reset login attempts on successful login
userSchema.methods.resetFailedAttempts = async function() {
  return this.updateOne({
    $set: { failedLoginAttempts: 0, lockUntil: null, lastLogin: new Date() }
  });
};

export default mongoose.model("Users", userSchema);
