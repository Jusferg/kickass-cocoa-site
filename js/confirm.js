document.addEventListener("DOMContentLoaded", () => {
  const hasToken = window.location.hash.includes("confirmation_token");

  const title = document.getElementById("confirmTitle");
  const message = document.getElementById("confirmMessage");
  const actions = document.getElementById("confirmActions");

  if (hasToken) {
    if (title) title.textContent = "You're all set 🎉";
    if (message) {
      message.textContent =
        "Your email has been confirmed. You can now log in and access your dashboard.";
    }
    if (actions) actions.style.display = "block";

    // Clean URL so it doesn't retrigger anything
    history.replaceState(null, "", window.location.pathname);
  }
});