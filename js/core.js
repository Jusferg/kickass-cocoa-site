/****************************************************
 * core.js — runs on every page
 * - Navbar burger + dropdown
 * - Avatar render + dropdown
 * - Logout button via Netlify Identity
 ****************************************************/

function getNetlifyUser() {
  if (!window.netlifyIdentity) return null;
  return window.netlifyIdentity.currentUser();
}

function getUserProfile() {
  const user = getNetlifyUser();
  if (!user) return null;

  const meta = user.user_metadata || {};
  const fullName =
    meta.full_name ||
    [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
    user.email ||
    "";

  return {
    email: user.email || "",
    displayName: fullName,
    firstName: meta.first_name || "",
    lastName: meta.last_name || "",
    avatar: meta.avatar_url || "",
    role: (user.app_metadata && user.app_metadata.roles && user.app_metadata.roles[0]) || "member"
  };
}

function initialsFromUser(u) {
  const name = (u?.displayName || `${u?.firstName || ""} ${u?.lastName || ""}`).trim();
  if (name) {
    const parts = name.split(/\s+/);
    const f = parts[0]?.[0]?.toUpperCase() || "";
    const l = parts.length > 1 ? parts[parts.length - 1][0].toUpperCase() : "";
    return (f + l) || f || "?";
  }

  const email = (u?.email || "").trim();
  return email ? email[0].toUpperCase() : "?";
}

function renderNavAvatar() {
  const u = getUserProfile();
  const btn = document.getElementById("memberAvatarBtn");
  const initialsSpan = document.getElementById("memberInitials");
  if (!btn) return;

  const fallback = initialsFromUser(u);

  if (u?.avatar) {
    btn.innerHTML = `<img src="${u.avatar}" alt="${u.displayName || "Member"}" class="member-avatar-img">`;
  } else if (initialsSpan) {
    initialsSpan.textContent = fallback;
  } else {
    btn.textContent = fallback;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Netlify Identity init
  // =========================
  if (window.netlifyIdentity) {
    window.netlifyIdentity.init();

    window.netlifyIdentity.on("login", () => {
      renderNavAvatar();
    });

    window.netlifyIdentity.on("logout", () => {
      window.location.href = "login.html";
    });
  }

  // =========================
  // NAV burger + About dropdown
  // =========================
  const burger = document.querySelector(".kac-burger");
  const menu = document.querySelector(".kac-menu");
  const drop = document.querySelector(".kac-dropdown");
  const dropBtn = document.querySelector(".kac-dropbtn");
  const dropMenu = document.querySelector(".kac-dropmenu");

  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");

      if (!open) {
        drop?.classList.remove("is-open");
        dropBtn?.setAttribute("aria-expanded", "false");
      }
    });

    if (drop && dropBtn) {
      dropBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = drop.classList.toggle("is-open");
        dropBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.addEventListener("click", (e) => {
      if (!drop || !dropBtn) return;
      if (drop.contains(e.target)) return;
      drop.classList.remove("is-open");
      dropBtn.setAttribute("aria-expanded", "false");
    });

    menu.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;

      if (window.innerWidth < 900) {
        menu.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        drop?.classList.remove("is-open");
        dropBtn?.setAttribute("aria-expanded", "false");
      }
    });

    dropMenu?.addEventListener("click", (e) => e.stopPropagation());
  }

  // =========================
  // Logout
  // =========================
  document.addEventListener("click", async (e) => {
    const el = e.target.closest("#logoutBtn");
    if (!el) return;

    e.preventDefault();

    try {
      if (window.netlifyIdentity) {
        await window.netlifyIdentity.logout();
      } else {
        window.location.href = "login.html";
      }
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = "login.html";
    }
  });

  // =========================
  // Avatar dropdown
  // =========================
  const avatarBtn = document.getElementById("memberAvatarBtn");
  const dropdown = document.getElementById("memberDropdown");

  if (avatarBtn && dropdown) {
    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => dropdown.classList.remove("show"));
  }

  renderNavAvatar();
});

window.KAC = {
  getUserProfile,
  renderNavAvatar,
  initialsFromUser
};