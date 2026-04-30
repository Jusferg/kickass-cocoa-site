/****************************************************
 * register.js — Register page only
 * Uses Netlify Identity modal signup
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  if (!window.netlifyIdentity) {
    console.error("Netlify Identity not loaded");
    return;
  }

  const signupBtn = document.getElementById("openSignup");

  window.netlifyIdentity.on("init", (user) => {
    if (user) {
      window.location.href = "members-area.html";
    }
  });

  window.netlifyIdentity.init();

  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      window.netlifyIdentity.open("signup");
    });
  }

  window.netlifyIdentity.on("signup", () => {
    window.location.href = "members-area.html";
  });

  window.netlifyIdentity.on("login", () => {
    window.location.href = "members-area.html";
  });
});