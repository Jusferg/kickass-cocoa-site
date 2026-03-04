/****************************************************
 * login.js — Login page only
 * - Saves loggedInUser (email, role, displayName, firstName/lastName optional)
 * - Redirects to members-area.html
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailEl = document.getElementById("loginEmail");
  const passEl = document.getElementById("loginPassword");

  // Prefill email (your existing behavior)
  const savedEmail = localStorage.getItem("kac_prefill_email");
  if (savedEmail && emailEl) {
    emailEl.value = savedEmail;
    localStorage.removeItem("kac_prefill_email");
  }

  function nameFromEmail(email) {
    if (!email) return "";
    const local = email.split("@")[0] || "";
    // Turn "tia.ferguson" or "tia_ferguson" into "Tia Ferguson"
    return local
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = (emailEl?.value || "").trim().toLowerCase();
    const password = (passEl?.value || "").trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    // Simple role rule (customize anytime)
    const role = email === "admin@kickasscocoa.com" ? "admin" : "member";

    const user = {
      email,
      role,
      displayName: nameFromEmail(email), // prevents “undefined” in welcome
      loggedAt: new Date().toISOString(),
    };

    localStorage.setItem("loggedInUser", JSON.stringify(user));

    // go to dashboard
    window.location.href = "members-area.html";
  });
});