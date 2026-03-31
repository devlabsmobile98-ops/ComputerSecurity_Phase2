const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const abiPath = path.join(__dirname, "../../contracts/abi.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const readContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  provider
);

function normalizeAddress(address) {
  return address.trim().toLowerCase();
}

function getAdminContractWithSigner(adminSigner) {
  return new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, adminSigner);
}

async function getVoterStatus(walletAddress) {
  const registered = await readContract.isRegistered(walletAddress);
  const voted = await readContract.hasVoted(walletAddress);
  const region = await readContract.getRegion(walletAddress);
  return { registered, voted, region };
}

async function getTotalVotes() {
  const total = await readContract.totalVotes();
  return total.toString();
}

async function isElectionOpen() {
  return await readContract.electionOpen();
}

module.exports = {
  provider,
  readContract,
  normalizeAddress,
  getAdminContractWithSigner,
  getVoterStatus,
  getTotalVotes,
  isElectionOpen
};