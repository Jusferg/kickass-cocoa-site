document.addEventListener("DOMContentLoaded", () => {
  if (!window.netlifyIdentity) return;

  const title = document.getElementById("confirmTitle");
  const message = document.getElementById("confirmMessage");
  const actions = document.getElementById("confirmActions");

  window.netlifyIdentity.on("init", (user) => {
    const hasToken =
      window.location.hash.includes("confirmation_token");

    if (hasToken) {
      window.netlifyIdentity.open();
    }

    if (user) {
      title.textContent = "You're all set 🎉";
      message.textContent =
        "Your email has been confirmed. You can now access your dashboard.";
      actions.style.display = "block";
    }
  });

  window.netlifyIdentity.init();
});