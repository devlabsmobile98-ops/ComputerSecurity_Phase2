if (requireRole("voter")) {
  loadStatus();
}

document.getElementById("refreshStatusBtn").addEventListener("click", loadStatus);

async function loadStatus() {
  try {
    const data = await api("/voter/status");

    document.getElementById("roleValue").textContent = "VOTER";
    document.getElementById("registeredValue").textContent = data.registered ? "YES" : "NO";
    document.getElementById("votedValue").textContent = data.voted ? "VOTED ✓" : "NOT YET";

    setOutput(
      "statusOutput",
      `Address: ${data.walletAddress}\nRegistered: ${data.registered}\nAlready voted: ${data.voted}\nRegion: ${data.region}`,
      data.registered ? "success" : "error"
    );
  } catch (err) {
    setOutput("statusOutput", err.message, "error");
  }
}
