const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { getVoterStatus, normalizeAddress } = require("../services/blockchainService");

exports.getStatus = async (req, res) => {
  try {
    const walletAddress = normalizeAddress(req.user.address);
    const status = await getVoterStatus(walletAddress);
    const user = await User.findOne({ walletAddress });

    res.json({
      success: true,
      walletAddress,
      registered: status.registered,
      voted: status.voted,
      region: user?.region || status.region || "Ottawa"
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to load voter status" });
  }
};

exports.recordVoteReceipt = async (req, res) => {
  try {
    const walletAddress = normalizeAddress(req.user.address);
    const { txHash, voteHash } = req.body;

    if (!txHash || !voteHash) {
      return res.status(400).json({ error: "txHash and voteHash are required" });
    }

    const status = await getVoterStatus(walletAddress);

    if (!status.voted) {
      return res.status(400).json({
        error: "Vote is not confirmed on-chain"
      });
    }

    const existing = await AuditLog.findOne({
      action: "CAST_VOTE",
      "details.txHash": txHash
    });

    if (!existing) {
      await AuditLog.create({
        actorAddress: walletAddress,
        action: "CAST_VOTE",
        role: "voter",
        details: {
          txHash,
          voteHash
        }
      });
    }

    await User.findOneAndUpdate(
      { walletAddress },
      { hasVoted: true },
      { new: true }
    );

    res.json({
      success: true,
      message: "Vote receipt recorded",
      walletAddress,
      txHash,
      voteHash
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to record vote receipt" });
  }
};