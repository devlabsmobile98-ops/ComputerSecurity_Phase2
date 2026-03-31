const API_BASE = "http://127.0.0.1:3000";
const CONTRACT_ADDRESS = "0x5d1a7D5A8DB1bf5d56c25aC8540e82252C7Cf82C";

async function getContractAbi() {
  const res = await fetch("./contracts/abi.json");
  return await res.json();
}

function getToken() {
  return localStorage.getItem("voteGuardToken");
}

function getSession() {
  const raw = localStorage.getItem("voteGuardSession");
  return raw ? JSON.parse(raw) : null;
}

function setAuth(token, session) {
  localStorage.setItem("voteGuardToken", token);
  localStorage.setItem("voteGuardSession", JSON.stringify(session));
}

function clearAuth() {
  localStorage.removeItem("voteGuardToken");
  localStorage.removeItem("voteGuardSession");
}

function setOutput(elementId, message, type = "info") {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `output ${type}`;
}

async function api(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is required");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  if (!accounts || !accounts.length) {
    throw new Error("No wallet account found");
  }

  return accounts[0].toLowerCase();
}

function requireRole(role) {
  const session = getSession();

  if (!session || session.role !== role) {
    window.location.href = "login.html";
    return false;
  }

  return true;
}

function updateNavSession() {
  const navSession = document.getElementById("navSession");
  const session = getSession();

  if (!navSession) return;

  if (!session) {
    navSession.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;
    return;
  }

  navSession.innerHTML = `
    <span class="nav-link">${session.role.toUpperCase()} • ${session.address.slice(0, 10)}...</span>
    <button class="nav-link" onclick="logout()">Logout</button>
  `;
}

function logout() {
  clearAuth();
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", updateNavSession);