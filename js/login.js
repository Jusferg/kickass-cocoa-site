/****************************************************
 * login.js — Login page only
 * Uses Netlify Identity modal login
 * Redirects logged-in users to members area
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  if (!window.netlifyIdentity) {
    console.error("Netlify Identity widget is not loaded.");
    return;
  }

  window.netlifyIdentity.on("init", (user) => {
    // If user is already logged in, send them to dashboard
    if (user) {
      const title = document.querySelector(".auth-title");
      const subtitle = document.querySelector(".auth-subtitle");

    if (title) title.textContent = "You're confirmed 🎉";
    if (subtitle) {
      subtitle.textContent = "Your email is confirmed. Redirecting you to your member dashboard...";
  }

    setTimeout(() => {
      window.location.href = "members-area.html";
    }, 1800);
   }
  });

  window.netlifyIdentity.init();

  const form = document.getElementById("loginForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      window.netlifyIdentity.open("login");
    });
  }

  window.netlifyIdentity.on("login", () => {
    window.location.href = "members-area.html";
  });
});