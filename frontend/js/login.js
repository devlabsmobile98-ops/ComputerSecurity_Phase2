// role is now read from the hidden input (toggled by the card UI in login.html)
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
  try {
    const role = document.getElementById("role").value;

    setOutput("loginOutput", "Connecting wallet…", "loading");

    const walletAddress = await connectWallet();

    const nonceData = await api("/auth/nonce", {
      method: "POST",
      body: JSON.stringify({ walletAddress, role })
    });

    setOutput("loginOutput", "Please sign the login message in MetaMask…", "loading");

    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [nonceData.nonce, walletAddress]
    });

    const verifyData = await api("/auth/verify", {
      method: "POST",
      body: JSON.stringify({
        walletAddress,
        role,
        signature
      })
    });

    setAuth(verifyData.token, verifyData.session);
    setOutput("loginOutput", "Login successful! Redirecting…", "success");

    if (verifyData.session.role === "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "voter-dashboard.html";
    }
  } catch (err) {
    setOutput("loginOutput", err.message, "error");
  }
});
