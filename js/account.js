// js/account.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("accountForm");
  if (!form) return;

  const displayNameInput = document.getElementById("displayName");
  const avatarUrlInput = document.getElementById("avatarUrl");
  const avatarPreview = document.getElementById("avatarPreview");
  const status = document.getElementById("accountStatus");

  const user = window.KAC?.getUser?.() || {};

  function isValidHttpUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch { return false; }
  }

  function setPreview(url) {
    const fallback = window.KAC?.initialsFromUser?.(user) || "?";
    if (!avatarPreview) return;

    if (url && isValidHttpUrl(url)) {
      avatarPreview.style.backgroundImage = `url("${url}")`;
      avatarPreview.style.backgroundSize = "cover";
      avatarPreview.style.backgroundPosition = "center";
      avatarPreview.textContent = "";
    } else {
      avatarPreview.style.backgroundImage = "";
      avatarPreview.textContent = fallback;
    }
  }

  // Prefill
  if (displayNameInput) displayNameInput.value = user.displayName || "";
  if (avatarUrlInput) avatarUrlInput.value = user.avatar || "";
  setPreview(user.avatar || "");

  // Live preview
  avatarUrlInput?.addEventListener("input", () => setPreview(avatarUrlInput.value.trim()));

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dn = (displayNameInput?.value || "").trim();
    const url = (avatarUrlInput?.value || "").trim();

    if (url && !isValidHttpUrl(url)) {
      status.textContent = "Please paste a valid image URL starting with https://";
      return;
    }

    user.displayName = dn;
    user.avatar = url;

    window.KAC?.saveUser?.(user);

    // Update preview + nav avatar immediately
    setPreview(user.avatar);
    window.KAC?.renderNavAvatar?.();

    status.textContent = "Profile updated.";
  });
});