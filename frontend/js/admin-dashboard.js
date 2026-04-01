if (requireRole("admin")) {
  loadOverview();
}

document.getElementById("refreshOverviewBtn").addEventListener("click", loadOverview);

async function loadOverview() {
  try {
    const data = await api("/admin/overview");

    document.getElementById("totalVotes").textContent = data.totalVotes;
    document.getElementById("totalRegistered").textContent = data.totalRegistered;
    document.getElementById("electionStatus").textContent = data.electionOpen ? "OPEN" : "CLOSED";

    setOutput(
      "overviewOutput",
      `Total votes: ${data.totalVotes}\nRegistered voters: ${data.totalRegistered}\nTotal voter records: ${data.totalVoters}\nElection open: ${data.electionOpen}`,
      "success"
    );
  } catch (err) {
    setOutput("overviewOutput", err.message, "error");
  }
}
