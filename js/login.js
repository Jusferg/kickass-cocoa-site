/****************************************************
 * login.js — Login page only
 * Uses Netlify Identity modal login
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  if (!window.netlifyIdentity) {
    console.error("Netlify Identity widget is not loaded.");
    return;
  }

  window.netlifyIdentity.init();

  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("Login form not found.");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    window.netlifyIdentity.open("login");
  });

  window.netlifyIdentity.on("login", () => {
    window.location.href = "members-area.html";
  });
});