/****************************************************
 * register.js — Register page only
 * Uses Netlify Identity modal signup
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  if (!window.netlifyIdentity) {
    console.error("Netlify Identity widget is not loaded.");
    return;
  }

  window.netlifyIdentity.init();

  const form = document.querySelector('form[name="kac-register"]');

  if (!form) {
    console.error("Register form not found.");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    window.netlifyIdentity.open("signup");
  });

  window.netlifyIdentity.on("signup", () => {
    alert("Account created. Please check your email to confirm your account.");
    window.location.href = "login.html";
  });
});