const { ethers } = require("ethers");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const {
  provider,
  normalizeAddress,
  getTotalVotes,
  getVoterStatus,
  isElectionOpen
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
        region: region || status.region || "Ottawa",
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
    const electionOpen = await isElectionOpen();

    return res.json({
      success: true,
      totalVotes,
      totalRegistered,
      totalVoters,
      electionOpen
    });
  } catch (error) {
    next(error);
  }
};

exports.getResults = async (req, res, next) => {
  try {
    const totalVotes = await getTotalVotes();
    const electionOpen = await isElectionOpen();

    return res.json({
      success: true,
      totalVotes,
      electionOpen
    });
  } catch (error) {
    next(error);
  }
};

exports.getRegionStats = async (req, res, next) => {
  try {
    const regionCounts = await User.aggregate([
      {
        $match: {
          role: "voter",
          isRegistered: true
        }
      },
      {
        $group: {
          _id: "$region",
          registeredVoters: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          region: "$_id",
          registeredVoters: 1
        }
      },
      {
        $sort: { region: 1 }
      }
    ]);

    return res.json({
      success: true,
      regions: regionCounts
    });
  } catch (error) {
    next(error);
  }
};

exports.openElection = async (req, res, next) => {
  try {
    const { adminTxHash } = req.body;

    if (!adminTxHash) {
      return res.status(400).json({ error: "adminTxHash is required" });
    }

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

    const electionOpen = await isElectionOpen();

    if (!electionOpen) {
      return res.status(400).json({
        error: "Election was not opened on-chain"
      });
    }

    await AuditLog.create({
      actorAddress: req.user.address,
      action: "OPEN_ELECTION",
      role: "admin",
      details: { adminTxHash }
    });

    return res.json({
      success: true,
      electionOpen: true
    });
  } catch (error) {
    next(error);
  }
};

exports.closeElection = async (req, res, next) => {
  try {
    const { adminTxHash } = req.body;

    if (!adminTxHash) {
      return res.status(400).json({ error: "adminTxHash is required" });
    }

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

    const electionOpen = await isElectionOpen();

    if (electionOpen) {
      return res.status(400).json({
        error: "Election was not closed on-chain"
      });
    }

    await AuditLog.create({
      actorAddress: req.user.address,
      action: "CLOSE_ELECTION",
      role: "admin",
      details: { adminTxHash }
    });

    return res.json({
      success: true,
      electionOpen: false
    });
  } catch (error) {
    next(error);
  }
};
