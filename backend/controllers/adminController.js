const { ethers } = require("ethers");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const {
  provider,
  normalizeAddress,
  getTotalVotes,
  getVoterStatus
} = require("../services/blockchainService");

exports.registerVoter = async (req, res, next) => {
  try {
    const { voterAddress, region, adminTxHash } = req.body;

    if (!voterAddress || !adminTxHash) {
      return res.status(400).json({
        error: "voterAddress and adminTxHash are required"
      });
    }

    if (!ethers.isAddress(voterAddress)) {
      return res.status(400).json({ error: "Invalid voter address" });
    }

    const normalized = normalizeAddress(voterAddress);

    const receipt = await provider.getTransactionReceipt(adminTxHash);

    if (!receipt || receipt.status !== 1) {
      return res.status(400).json({
        error: "Admin transaction not found or failed"
      });
    }

    const tx = await provider.getTransaction(adminTxHash);

    if (!tx || normalizeAddress(tx.from) !== normalizeAddress(req.user.address)) {
      return res.status(403).json({
        error: "Transaction was not sent by authenticated admin"
      });
    }

    const status = await getVoterStatus(normalized);

    if (!status.registered) {
      return res.status(400).json({
        error: "Voter was not registered on-chain"
      });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: normalized },
      {
        walletAddress: normalized,
        role: "voter",
        region: region || status.region || "default",
        isRegistered: true,
        hasVoted: status.voted,
        identityVerified: true
      },
      { upsert: true, new: true }
    );

    await AuditLog.create({
      actorAddress: req.user.address,
      action: "REGISTER_VOTER",
      role: "admin",
      details: {
        voterAddress: normalized,
        adminTxHash
      }
    });

    return res.json({
      success: true,
      voter: user
    });
  } catch (error) {
    next(error);
  }
};

exports.getOverview = async (req, res, next) => {
  try {
    const totalVotes = await getTotalVotes();
    const totalRegistered = await User.countDocuments({ isRegistered: true });
    const totalVoters = await User.countDocuments({ role: "voter" });

    return res.json({
      success: true,
      totalVotes,
      totalRegistered,
      totalVoters
    });
  } catch (error) {
    next(error);
  }
};

exports.getResults = async (req, res, next) => {
  try {
    const totalVotes = await getTotalVotes();

    return res.json({
      success: true,
      totalVotes
    });
  } catch (error) {
    next(error);
  }
};