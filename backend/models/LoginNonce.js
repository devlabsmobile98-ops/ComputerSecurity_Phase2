const mongoose = require("mongoose");

const loginNonceSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    nonce: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "voter"],
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    used: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginNonce", loginNonceSchema);