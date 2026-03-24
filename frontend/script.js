const output = document.getElementById("output");

function showError(message) {
  output.textContent = "Error: " + message;
}

// ---------------- REGISTER ----------------
async function registerVoter() {
  try {
    const voterAddress = document.getElementById("voterAddress").value.trim();

    // 🚫 Prevent empty input
    if (!voterAddress) {
      output.textContent = "Please enter a voter address";
      return;
    }

    if (!voterAddress.startsWith("0x") || voterAddress.length !== 42) {
      output.textContent = "Invalid Ethereum address";
      return;
    }

    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterAddress })
    });

    const data = await res.json();

    if (data.error) {
      output.textContent = "Error: " + data.error;
    } else {
      output.textContent = "Voter registered successfully ✅";
    }

  } catch (error) {
    output.textContent = "Register error: " + error.message;
  }
}

// ---------------- VOTE ----------------
async function castVote() {
  try {
    const vote = document.getElementById("vote").value;

    const res = await fetch("http://localhost:3000/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote })
    });

    const data = await res.json();

    if (data.error) {
      showError(data.error);
    } else {
      output.textContent = "You voted for " + vote + " ✅";
    }

  } catch (error) {
    showError(error.message);
  }
}

// ---------------- TOTAL VOTES ----------------
async function getTotalVotes() {
  try {
    const res = await fetch("http://localhost:3000/totalVotes");
    const data = await res.json();

    if (data.error) {
      showError(data.error);
    } else {
      output.textContent = "Total votes: " + data.total;
    }

  } catch (error) {
    showError(error.message);
  }
}