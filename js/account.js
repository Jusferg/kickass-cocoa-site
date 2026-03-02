document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("accountForm");
  if (!form) return;

  const displayNameInput = document.getElementById("displayName");
  const avatarUrlInput = document.getElementById("avatarUrl");
  const avatarPreview = document.getElementById("avatarPreview");
  const status = document.getElementById("accountStatus");

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

  function initialsFromName(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const f = parts[0]?.[0]?.toUpperCase() || "";
    const l = parts.length > 1 ? parts[parts.length - 1][0]?.toUpperCase() : "";
    return (f + l) || f || "?";
  }

  function isLikelyImageUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function setPreviewFromUrl(url, fallbackText) {
    if (!avatarPreview) return;

    if (url && isLikelyImageUrl(url)) {
      avatarPreview.style.backgroundImage = `url("${url}")`;
      avatarPreview.style.backgroundSize = "cover";
      avatarPreview.style.backgroundPosition = "center";
      avatarPreview.textContent = "";
    } else {
      avatarPreview.style.backgroundImage = "";
      avatarPreview.textContent = fallbackText;
    }
  }

  function getFallback() {
    return initialsFromName((displayNameInput?.value || user.displayName || user.email || "").trim());
  }

  // Prefill
  if (displayNameInput && user.displayName) displayNameInput.value = user.displayName;
  if (avatarUrlInput && user.avatar) avatarUrlInput.value = user.avatar;

  // Initial render
  setPreviewFromUrl(user.avatar, getFallback());

  // Live preview while typing/pasting
  if (avatarUrlInput) {
    avatarUrlInput.addEventListener("input", () => {
      setPreviewFromUrl(avatarUrlInput.value.trim(), getFallback());
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    user.displayName = (displayNameInput?.value || "").trim();
    const url = (avatarUrlInput?.value || "").trim();

    if (url && !isLikelyImageUrl(url)) {
      if (status) status.textContent = "Please paste a valid URL that starts with https://";
      return;
    }

    user.avatar = url; // save URL (or empty string clears)
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    // ✅ Update instantly
    setPreviewFromUrl(user.avatar, getFallback());
    if (status) status.textContent = "Profile updated.";
  });
});