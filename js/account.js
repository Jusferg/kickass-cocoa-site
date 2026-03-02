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
    const l = parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() : "";
    return (f + l) || f || "?";
  }

  function isLikelyImageUrl(url) {
    // basic check: must be http(s) and not empty
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function setPreviewFromUrl(url, fallbackText) {
    if (!avatarPreview) return;

    if (isLikelyImageUrl(url)) {
      avatarPreview.style.backgroundImage = `url("${url}")`;
      avatarPreview.style.backgroundSize = "cover";
      avatarPreview.style.backgroundPosition = "center";
      avatarPreview.textContent = "";
    } else {
      avatarPreview.style.backgroundImage = "";
      avatarPreview.textContent = fallbackText;
    }
  }

  // Prefill
  if (displayNameInput && user.displayName) displayNameInput.value = user.displayName;
  if (avatarUrlInput && user.avatar) avatarUrlInput.value = user.avatar;

  const fallback = initialsFromName(user.displayName || user.email || "");
  setPreviewFromUrl(user.avatar, fallback);

  // Live preview while typing/pasting
  if (avatarUrlInput) {
    avatarUrlInput.addEventListener("input", () => {
      const url = avatarUrlInput.value.trim();
      const fb = initialsFromName((displayNameInput?.value || user.displayName || user.email || ""));
      setPreviewFromUrl(url, fb);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    user.displayName = (displayNameInput?.value || "").trim();
    const url = (avatarUrlInput?.value || "").trim();

    if (url && !isLikelyImageUrl(url)) {
      status.textContent = "Please paste a valid URL that starts with https://";
      return;
    }

    user.avatar = url; // save URL (or empty string clears)
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    const fb = initialsFromName(user.displayName || user.email || "");
    setPreviewFromUrl(user.avatar, fb);

    status.textContent = "Saved.";
  });
});