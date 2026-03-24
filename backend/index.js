const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors());

// 🔗 Ganache connection
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

// 🔑 Private key (Ganache)
const privateKey = "0xc1e6a444d262bc71eabb5d931322f9a331c44bb0a7a253949bfb12977bc1c338";
const wallet = new ethers.Wallet(privateKey, provider);

// 📍 NEW contract address (Nuha's deployed contract)
const contractAddress = "0x3075e562680Fe38A60308f6c0933C3dC467b7BbE";

// 📄 ABI
const abi = [
  "function registerVoter(address _voter)",
  "function vote(bytes32 voteHash)",
  "function totalVotes() view returns (uint256)",
  "function isRegistered(address _voter) view returns (bool)",
  "function hasVoted(address _voter) view returns (bool)"
];

const contract = new ethers.Contract(contractAddress, abi, wallet);

// ---------------- ROUTES ----------------

// test
app.get("/", (req, res) => {
  res.send("Backend working 🚀");
});

app.post("/register", async (req, res) => {
  try {
    const { voterAddress } = req.body;

    if (!voterAddress) {
      return res.status(400).json({ error: "Voter address required" });
    }

    const registered = await contract.isRegistered(voterAddress);

    if (registered) {
      return res.status(400).json({ error: "Voter already registered" });
    }

    const tx = await contract.registerVoter(voterAddress);
    await tx.wait();

    res.json({ success: true, message: "Voter registered" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// ✅ vote (HASH + blockchain)
app.post("/vote", async (req, res) => {
  try {
    const { vote } = req.body;

    if (!vote) {
      return res.status(400).json({ error: "Vote required" });
    }

    const registered = await contract.isRegistered(wallet.address);
    const voted = await contract.hasVoted(wallet.address);

    if (!registered) {
      return res.status(400).json({ error: "Not registered" });
    }

    if (voted) {
      return res.status(400).json({ error: "Already voted" });
    }

    // 🔐 SHA-256 → convert to bytes32
    const hash = crypto.createHash("sha256").update(vote).digest("hex");
    const voteHash = "0x" + hash;

    console.log("Vote:", vote);
    console.log("Hash:", voteHash);

    const tx = await contract.vote(voteHash);
    await tx.wait();

    res.json({
      success: true,
      vote,
      hash: voteHash,
      txHash: tx.hash
    });

  } catch (err) {
    res.status(500).json({ error: "Vote failed" });
  }
});

// ✅ total votes
app.get("/totalVotes", async (req, res) => {
  try {
    const total = await contract.totalVotes();
    res.json({ total: total.toString() });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch total votes" });
  }
});

// ---------------- SERVER ----------------

app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
});
