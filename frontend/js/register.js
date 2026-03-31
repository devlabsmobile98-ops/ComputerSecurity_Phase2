if (requireRole("admin")) {
  document.getElementById("adminAddressText").textContent = getSession().address;
}

document.getElementById("registerBtn").addEventListener("click", async () => {
  try {
    const voterAddress = document.getElementById("voterAddress").value.trim();
    const region = document.getElementById("region").value.trim() || "default";

    if (!voterAddress) {
      setOutput("registerOutput", "Voter address required.", "error");
      return;
    }

    setOutput("registerOutput", "Connecting MetaMask...", "loading");

    if (!window.ethereum) {
      throw new Error("MetaMask is required");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const abi = await getContractAbi();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    setOutput("registerOutput", "Please confirm voter registration in MetaMask...", "loading");

    const tx = await contract.registerVoter(voterAddress, region);
    const receipt = await tx.wait();

    const data = await api("/admin/register", {
      method: "POST",
      body: JSON.stringify({
        voterAddress,
        region,
        adminTxHash: receipt.hash
      })
    });

    setOutput(
      "registerOutput",
      `Registered: ${data.voter.walletAddress}\nRegion: ${data.voter.region}\nStatus: ${data.voter.isRegistered ? "REGISTERED" : "NOT REGISTERED"}`,
      "success"
    );
  } catch (err) {
    setOutput("registerOutput", err.message, "error");
  }
});