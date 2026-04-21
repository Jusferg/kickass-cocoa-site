/****************************************************
 * login.js — Login page only
 * - Saves loggedInUser (email, role, displayName, firstName/lastName optional)
 * - Redirects to members-area.html
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form || !window.netlifyIdentity) return;

  const emailEl = document.getElementById("loginEmail");
  const passEl = document.getElementById("loginPassword");

  const savedEmail = localStorage.getItem("kac_prefill_email");
  if (savedEmail && emailEl) {
    emailEl.value = savedEmail;
    localStorage.removeItem("kac_prefill_email");
  }

  window.netlifyIdentity.init();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (emailEl?.value || "").trim();
    const password = passEl?.value || "";

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      await window.netlifyIdentity.login(email, password);
      window.location.href = "members-area.html";
    } catch (error) {
      alert(error.message || "Login failed. Please check your email and password.");
    }
  });

  window.netlifyIdentity.on("login", () => {
    window.location.href = "members-area.html";
  });
});