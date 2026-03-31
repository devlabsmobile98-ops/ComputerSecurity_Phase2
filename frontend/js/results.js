if (requireRole("admin")) {
  loadResults();
}

document.getElementById("refreshResultsBtn").addEventListener("click", loadResults);

async function loadResults() {
  try {
    setOutput("resultsOutput", "Fetching total votes...", "loading");

    const data = await api("/admin/results");

    document.getElementById("resultsTotal").textContent = data.totalVotes;

    setOutput(
      "resultsOutput",
      `Total votes recorded on-chain: ${data.totalVotes}`,
      "success"
    );
  } catch (err) {
    setOutput("resultsOutput", err.message, "error");
  }
}