// Simple client-side auth helpers for dev/testing.
// NOTE: This is not secure and is only intended as a friendly dev placeholder.
// Replace with real auth (Auth0, Netlify Identity, Firebase, or your backend) when ready.

document.addEventListener("DOMContentLoaded", () => {
  // Quick login flow: sets a session in localStorage and redirects to members.
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      if (!email) {
        showLoginError("Please enter your email.");
        return;
      }

      // Create a simple session object
      const session = {
        email,
        role: "member",
        loggedAt: new Date().toISOString()
      };

      localStorage.setItem("loggedInUser", JSON.stringify(session));

      // Redirect to members area
      window.location.href = "members-area.html";
    });
  }

  // Register form: save a local record (so login/testing works)
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", () => {
      // Let Netlify do the actual submit — but also save a local copy for dev/testing
      try {
        const regEmail = document.getElementById("regEmail")?.value?.trim();
        const firstName = document.getElementById("firstName")?.value?.trim() || "";
        const lastName = document.getElementById("lastName")?.value?.trim() || "";

        if (regEmail) {
          const users = JSON.parse(localStorage.getItem("kac_registered") || "[]");
          users.push({
            email: regEmail,
            firstName,
            lastName,
            createdAt: new Date().toISOString()
          });
          localStorage.setItem("kac_registered", JSON.stringify(users));
        }
      } catch (err) {
        // fail silently — registration will still post to Netlify
        console.warn("Could not save local registered user", err);
      }

      // DO NOT preventDefault — allow Netlify to handle submission
    });
  }

  // small helper
  function showLoginError(msg) {
    const el = document.getElementById("loginError");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    setTimeout(() => (el.style.display = "none"), 4000);
  }
});