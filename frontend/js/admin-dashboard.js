if (requireRole("admin")) {
  loadOverview();
}

document.getElementById("refreshOverviewBtn").addEventListener("click", loadOverview);

async function loadOverview() {
  try {
    const data = await api("/admin/overview");

    document.getElementById("totalVotes").textContent = data.totalVotes;
    document.getElementById("totalRegistered").textContent = data.totalRegistered;
    document.getElementById("totalVoters").textContent = data.totalVoters;

    setOutput(
      "overviewOutput",
      `Total votes: ${data.totalVotes}\nTotal registered voters: ${data.totalRegistered}\nTotal voter records: ${data.totalVoters}`,
      "success"
    );
  } catch (err) {
    setOutput("overviewOutput", err.message, "error");
  }
}