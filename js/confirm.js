document.addEventListener("DOMContentLoaded", () => {
  if (!window.netlifyIdentity) return;

  const params = new URLSearchParams(window.location.search);
  const queryToken = params.get("confirmation_token");

  if (queryToken && !window.location.hash.includes("confirmation_token")) {
    window.location.href = `confirm.html#confirmation_token=${queryToken}`;
    return;
  }

  window.netlifyIdentity.on("init", () => {
    if (window.location.hash.includes("confirmation_token")) {
      window.netlifyIdentity.open();
    }
  });

  window.netlifyIdentity.init();
});
