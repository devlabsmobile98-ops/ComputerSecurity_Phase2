if (requireRole("voter")) {
  loadSessionStatus();
}

document.getElementById("statusBtn").addEventListener("click", loadSessionStatus);

document.getElementById("voteBtn").addEventListener("click", async () => {
  try {
    const candidate = document.getElementById("vote").value;

    if (!candidate) {
      setOutput("voteOutput", "Please choose a candidate.", "error");
      return;
    }

    const status = await api("/voter/status");

    if (!status.registered) {
      setOutput("voteOutput", "You are not registered to vote.", "error");
      return;
    }

    if (status.voted) {
      setOutput("voteOutput", "You have already voted. A second vote is not allowed.", "error");
      return;
    }

    setOutput("voteOutput", "Preparing vote...", "loading");

    if (!window.ethereum) {
      throw new Error("MetaMask is required");
    }

    const encoder = new TextEncoder();
    const voteBytes = encoder.encode(candidate);
    const voteHash = ethers.keccak256(voteBytes);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const abi = await getContractAbi();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    setOutput("voteOutput", "Please confirm the vote transaction in MetaMask...", "loading");

    const tx = await contract.vote(voteHash);
    const receipt = await tx.wait();

    await api("/voter/receipt", {
      method: "POST",
      body: JSON.stringify({
        txHash: receipt.hash,
        voteHash
      })
    });

    setOutput(
      "voteOutput",
      `Vote submitted successfully.\nVote Hash: ${voteHash}\nTransaction: ${receipt.hash}`,
      "success"
    );

    await loadSessionStatus();
  } catch (err) {
    console.error("Vote error:", err);

    const message = (err?.message || "").toLowerCase();

    if (
      message.includes("already voted") ||
      message.includes("call_exception") ||
      message.includes("missing revert data")
    ) {
      setOutput("voteOutput", "You have already voted. A second vote is not allowed.", "error");
      return;
    }

    if (message.includes("user rejected")) {
      setOutput("voteOutput", "Transaction was cancelled in MetaMask.", "error");
      return;
    }

    if (message.includes("election is closed")) {
      setOutput("voteOutput", "Voting is currently closed.", "error");
      return;
    }

    setOutput("voteOutput", err.message || "Vote submission failed.", "error");
  }
});

async function loadSessionStatus() {
  try {
    const session = getSession();

    if (!session) {
      setOutput("sessionOutput", "No active voter session.", "error");
      return;
    }

    const data = await api("/voter/status");

    setOutput(
      "sessionOutput",
      `Logged in as: ${session.address}\nRegistered: ${data.registered}\nAlready voted: ${data.voted}\nRegion: ${data.region}`,
      data.registered ? "success" : "error"
    );
  } catch (err) {
    setOutput("sessionOutput", err.message, "error");
  }
}