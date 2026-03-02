/****************************************************
 * auth-real.js
 * Client-side “realistic” auth for static sites
 * - Register saves user record (hashed password)
 * - Login verifies password
 * - Session stored as loggedInUser
 *
 * NOTE: This is NOT production security. It’s realism for a static prototype.
 ****************************************************/

/* ---------- Storage keys ---------- */
const USERS_KEY = "kac_users";
const SESSION_KEY = "loggedInUser";

/* ---------- Helpers ---------- */
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function showMsg(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const bytes = Array.from(new Uint8Array(buf));
  return bytes.map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- Seed an admin (optional) ---------- */
function ensureAdminSeed() {
  const users = getUsers();
  const adminEmail = "admin@kickasscocoa.com"; // change if you want

  const exists = users.some(u => u.email === adminEmail);
  if (exists) return;

  // Default admin password: KickAssCocoa! (change after testing)
  // This is for LOCAL testing only.
  sha256("KickAssCocoa!").then((hash) => {
    users.push({
      email: adminEmail,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      passwordHash: hash,
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  });
}

/* ---------- Register ---------- */
async function handleRegister(form) {
  const statusEl = document.getElementById("registerStatus");

  const firstName = document.getElementById("firstName")?.value?.trim() || "";
  const lastName = document.getElementById("lastName")?.value?.trim() || "";
  const email = normalizeEmail(document.getElementById("regEmail")?.value);
  const password = document.getElementById("password")?.value || "";
  const confirm = document.getElementById("passwordConfirm")?.value || "";

  if (!email) {
    showMsg(statusEl, "Please enter a valid email.");
    return false;
  }

  if (password.length < 8) {
    showMsg(statusEl, "Password must be at least 8 characters.");
    return false;
  }

  if (password !== confirm) {
    showMsg(statusEl, "Passwords do not match.");
    return false;
  }

  const users = getUsers();
  const exists = users.some(u => u.email === email);
  if (exists) {
    showMsg(statusEl, "That email is already registered. Try logging in.");
    return false;
  }

  const passwordHash = await sha256(password);

  users.push({
    email,
    firstName,
    lastName,
    role: "member",
    passwordHash,
    createdAt: new Date().toISOString()
  });

  saveUsers(users);

  // store last registered email (helps auto-login after success page, optional)
  localStorage.setItem("kac_last_registered_email", email);

  showMsg(statusEl, "Saved. Submitting your registration…");
  return true; // allow Netlify submit to proceed
}

/* ---------- Login ---------- */
async function handleLogin(form) {
  const errorEl = document.getElementById("loginError");

  const email = normalizeEmail(document.getElementById("loginEmail")?.value);
  const password = document.getElementById("loginPassword")?.value || "";

  if (!email || !password) {
    showMsg(errorEl, "Enter your email and password.");
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    showMsg(errorEl, "No account found. Create an account first.");
    return;
  }

  const hash = await sha256(password);
  if (hash !== user.passwordHash) {
    showMsg(errorEl, "Incorrect password.");
    return;
  }

  // session
  setSession({
    email: user.email,
    role: user.role || "member",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    loggedAt: new Date().toISOString()
  });

  window.location.href = "members-area.html";
}

/* ---------- Wire up forms ---------- */
document.addEventListener("DOMContentLoaded", () => {
  ensureAdminSeed();

  // Register page
  const registerForm = document.querySelector('form[name="kac-register"]');
  if (registerForm) {
    // Add a small status placeholder if you don’t already have one
    if (!document.getElementById("registerStatus")) {
      const p = document.createElement("p");
      p.id = "registerStatus";
      p.className = "auth-meta";
      p.style.display = "none";
      registerForm.appendChild(p);
    }

    registerForm.addEventListener("submit", async (e) => {
      // validate & save user locally first
      e.preventDefault();
      const ok = await handleRegister(registerForm);
      if (ok) registerForm.submit(); // proceed with Netlify submission
    });
  }

  // Login page
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleLogin(loginForm);
    });
  }
});