const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["admin", "voter"],
      default: "voter"
    },
    region: {
      type: String,
      default: "Ottawa"
    },
    isRegistered: {
      type: Boolean,
      default: false
    },
    hasVoted: {
      type: Boolean,
      default: false
    },
    identityVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);