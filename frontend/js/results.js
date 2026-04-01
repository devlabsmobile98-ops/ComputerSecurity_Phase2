let regionStatsMap = {};

if (requireRole("admin")) {
  loadResults();
  setupRegionHover();
}

document.getElementById("refreshResultsBtn").addEventListener("click", loadResults);
document.getElementById("openElectionBtn").addEventListener("click", openElection);
document.getElementById("closeElectionBtn").addEventListener("click", closeElection);

async function openElection() {
  try {
    setOutput("resultsOutput", "Connecting MetaMask…", "loading");

    if (!window.ethereum) {
      throw new Error("MetaMask is required");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const abi = await getContractAbi();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    setOutput("resultsOutput", "Please confirm openElection() in MetaMask…", "loading");

    const tx = await contract.openElection();
    const receipt = await tx.wait();

    await api("/admin/open-election", {
      method: "POST",
      body: JSON.stringify({ adminTxHash: receipt.hash })
    });

    setOutput("resultsOutput", "Election opened successfully. Voters can now submit ballots.", "success");

    await loadResults();
  } catch (err) {
    const message = (err?.message || "").toLowerCase();

    if (message.includes("user rejected")) {
      setOutput("resultsOutput", "Open election transaction was cancelled in MetaMask.", "error");
      return;
    }

    if (message.includes("only admin")) {
      setOutput("resultsOutput", "Only the admin wallet can open the election.", "error");
      return;
    }

    if (message.includes("already open") || message.includes("election is open")) {
      setOutput("resultsOutput", "The election is already open.", "error");
      return;
    }

    setOutput("resultsOutput", err.message || "Failed to open election.", "error");
  }
}

async function closeElection() {
  try {
    setOutput("resultsOutput", "Connecting MetaMask…", "loading");

    if (!window.ethereum) {
      throw new Error("MetaMask is required");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const abi = await getContractAbi();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    setOutput("resultsOutput", "Please confirm closeElection() in MetaMask…", "loading");

    const tx = await contract.closeElection();
    const receipt = await tx.wait();

    await api("/admin/close-election", {
      method: "POST",
      body: JSON.stringify({ adminTxHash: receipt.hash })
    });

    setOutput("resultsOutput", "Election closed successfully. Voting is now locked on-chain.", "success");

    await loadResults();
  } catch (err) {
    const message = (err?.message || "").toLowerCase();

    if (message.includes("user rejected")) {
      setOutput("resultsOutput", "Election close transaction was cancelled in MetaMask.", "error");
      return;
    }

    if (message.includes("only admin")) {
      setOutput("resultsOutput", "Only the admin wallet can close the election.", "error");
      return;
    }

    setOutput("resultsOutput", err.message || "Failed to close election.", "error");
  }
}

async function loadResults() {
  try {
    const [resultsData, regionData] = await Promise.all([
      api("/admin/results"),
      api("/admin/region-stats")
    ]);

    document.getElementById("resultsTotal").textContent = resultsData.totalVotes;
    document.getElementById("resultsElectionStatus").textContent = resultsData.electionOpen ? "OPEN" : "CLOSED";
    document.getElementById("regionCount").textContent = regionData.regions.length;

    // Disable whichever button matches the current on-chain state
    const isOpen = resultsData.electionOpen;
    document.getElementById("openElectionBtn").disabled = isOpen;
    document.getElementById("closeElectionBtn").disabled = !isOpen;

    regionStatsMap = {};
    for (const item of regionData.regions) {
      regionStatsMap[(item.region || "default").toLowerCase()] = item.registeredVoters;
    }

    renderRegionLegend(regionData.regions);

    setOutput(
      "resultsOutput",
      `Election open: ${resultsData.electionOpen}\nTotal recorded votes: ${resultsData.totalVotes}\nRegions loaded: ${regionData.regions.length}`,
      "success"
    );
  } catch (err) {
    setOutput("resultsOutput", err.message, "error");
  }
}

function renderRegionLegend(regions) {
  const legend = document.getElementById("regionLegend");

  if (!regions.length) {
    legend.innerHTML = `<div class="account-item">No region data found yet.</div>`;
    return;
  }

  legend.innerHTML = regions
    .map(
      (item) => `
        <div class="account-item">
          <strong>${item.region}</strong>
          <span class="badge lime">Registered Voters: ${item.registeredVoters}</span>
        </div>
      `
    )
    .join("");
}

function setupRegionHover() {
  const tooltip = document.getElementById("mapTooltip");
  const shapes = document.querySelectorAll(".region-shape");

  shapes.forEach((shape) => {
    shape.addEventListener("mousemove", (event) => {
      const region = shape.dataset.region || "Ottawa";
      const count = regionStatsMap[region.toLowerCase()] || 0;

      tooltip.style.display = "block";
      tooltip.style.left = `${event.pageX - 140}px`;
      tooltip.style.top = `${event.pageY - 110}px`;
      tooltip.textContent = `${region}: ${count} registered voter${count !== 1 ? "s" : ""}`;
    });

    shape.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  });
}
