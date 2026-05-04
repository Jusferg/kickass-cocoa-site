// js/account.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("accountForm");
  if (!form || !window.netlifyIdentity) return;

  const displayNameInput = document.getElementById("displayName");
  const avatarUrlInput = document.getElementById("avatarUrl");
  const avatarPreview = document.getElementById("avatarPreview");
  const status = document.getElementById("accountStatus");

  function isValidHttpUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function initialsFromName(name, email = "") {
    const cleanName = (name || "").trim();

    if (cleanName) {
      const parts = cleanName.split(/\s+/);
      const first = parts[0]?.[0]?.toUpperCase() || "";
      const last = parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() : "";
      return (first + last) || first || "?";
    }

    return email ? email[0].toUpperCase() : "?";
  }

  function setPreview(user, url = "") {
    if (!avatarPreview) return;

    const meta = user.user_metadata || {};
    const displayName =
      meta.full_name ||
      [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
      user.email ||
      "";

    const fallback = initialsFromName(displayName, user.email);

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

  window.netlifyIdentity.on("init", (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const meta = user.user_metadata || {};

    const displayName =
      meta.full_name ||
      [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
      user.email ||
      "";

    if (displayNameInput) displayNameInput.value = displayName;
    if (avatarUrlInput) avatarUrlInput.value = meta.avatar_url || "";

    setPreview(user, meta.avatar_url || "");

    avatarUrlInput?.addEventListener("input", () => {
      setPreview(user, avatarUrlInput.value.trim());
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dn = (displayNameInput?.value || "").trim();
      const url = (avatarUrlInput?.value || "").trim();

      if (url && !isValidHttpUrl(url)) {
        if (status) status.textContent = "Please paste a valid image URL starting with https://";
        return;
      }

      const parts = dn.split(/\s+/).filter(Boolean);
      const firstName = parts[0] || "";
      const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

      try {
        await user.update({
          data: {
            full_name: dn,
            first_name: firstName,
            last_name: lastName,
            avatar_url: url
          }
        });

        if (status) status.textContent = "Profile updated.";

        setPreview(user, url);
        window.KAC?.renderNavAvatar?.();
      } catch (error) {
        console.error("Profile update failed:", error);
        if (status) status.textContent = "Profile update failed. Please try again.";
      }
    });
  });

  window.netlifyIdentity.init();
});