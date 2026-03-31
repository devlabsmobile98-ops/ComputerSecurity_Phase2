const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const LoginNonce = require("../models/LoginNonce");

function makeToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h"
  });
}

function normalizeAddress(address) {
  return address.trim().toLowerCase();
}

exports.requestNonce = async (req, res) => {
  try {
    const { walletAddress, role } = req.body;

    if (!walletAddress || !role) {
      return res.status(400).json({ error: "walletAddress and role are required" });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    if (!["admin", "voter"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const normalized = normalizeAddress(walletAddress);
    const nonce = `VoteGuard login nonce: ${crypto.randomBytes(16).toString("hex")}`;

    await LoginNonce.create({
      walletAddress: normalized,
      nonce,
      role,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    res.json({
      success: true,
      walletAddress: normalized,
      nonce
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate nonce" });
  }
};

exports.verifySignature = async (req, res) => {
  try {
    const { walletAddress, role, signature } = req.body;

    if (!walletAddress || !role || !signature) {
      return res.status(400).json({
        error: "walletAddress, role, and signature are required"
      });
    }

    const normalized = normalizeAddress(walletAddress);

    const nonceRecord = await LoginNonce.findOne({
      walletAddress: normalized,
      role,
      used: false
    }).sort({ createdAt: -1 });

    if (!nonceRecord) {
      return res.status(400).json({ error: "No active nonce found" });
    }

    if (nonceRecord.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: "Nonce expired" });
    }

    const recovered = ethers.verifyMessage(nonceRecord.nonce, signature).toLowerCase();

    if (recovered !== normalized) {
      return res.status(401).json({ error: "Signature verification failed" });
    }

    if (role === "admin") {
      if (normalized !== process.env.ADMIN_ADDRESS.toLowerCase()) {
        return res.status(403).json({ error: "Wallet is not the admin wallet" });
      }
    }

    let user = await User.findOne({ walletAddress: normalized });

    if (!user) {
      user = await User.create({
        walletAddress: normalized,
        role,
        identityVerified: role === "admin"
      });
    }

    if (role === "voter" && !user.isRegistered) {
      return res.status(403).json({
        error: "Voter is not registered by admin"
      });
    }

    nonceRecord.used = true;
    await nonceRecord.save();

    const token = makeToken({
      role,
      address: normalized
    });

    await AuditLog.create({
      actorAddress: normalized,
      action: "LOGIN_SUCCESS",
      role,
      details: {}
    });

    res.json({
      success: true,
      token,
      session: {
        role,
        address: normalized
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to verify signature" });
  }
};

exports.session = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};