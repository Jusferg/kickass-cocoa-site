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

  const loginBtn = document.getElementById("openLogin");

  window.netlifyIdentity.on("init", (user) => {
    if (user) {
      const title = document.querySelector(".auth-title");
      const subtitle = document.querySelector(".auth-subtitle");

      if (title) title.textContent = "You're confirmed 🎉";
      if (subtitle) {
        subtitle.textContent = "Redirecting you to your member dashboard...";
      }

      setTimeout(() => {
        window.location.href = "members-area.html";
      }, 1200);
    }
  });

  window.netlifyIdentity.init();

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.netlifyIdentity.open("login");
    });
  }

  window.netlifyIdentity.on("login", () => {
    window.location.href = "members-area.html";
  });
});