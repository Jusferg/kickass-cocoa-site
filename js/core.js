/****************************************************
 * core.js — runs on every page
 * - Navbar burger + dropdown
 * - Logout button (if present)
 * - Avatar render + dropdown
 * - Login handler (if #loginForm exists)
 ****************************************************/

function getUser() {
  try { return JSON.parse(localStorage.getItem("loggedInUser") || "null"); }
  catch { return null; }
}

function saveUser(user) {
  localStorage.setItem("loggedInUser", JSON.stringify(user));
}

function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem("kac_profiles") || "{}");
  } catch {
    return {};
  }
}

function saveProfiles(profiles) {
  localStorage.setItem("kac_profiles", JSON.stringify(profiles));
}

function getProfileByEmail(email) {
  if (!email) return null;
  const profiles = getProfiles();
  return profiles[email.toLowerCase()] || null;
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
  const u = getUser();
  const btn = document.getElementById("memberAvatarBtn");
  const initialsSpan = document.getElementById("memberInitials");

  if (!btn) return;

  const fallback = initialsFromUser(u);

  if (u?.avatar) {
    btn.innerHTML = `
      <img src="${u.avatar}" alt="Profile"
           style="width:100%;height:100%;object-fit:cover;border-radius:12px;"
           onerror="this.remove(); this.parentElement.textContent='${fallback}';" />
    `;
  } else {
    if (initialsSpan) initialsSpan.textContent = fallback;
    else btn.textContent = fallback;
  }
}

document.addEventListener("DOMContentLoaded", () => {
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
  // Logout (one ID only!)
  // =========================
  document.addEventListener("click", (e) => {
    const el = e.target.closest("#logoutBtn");
    if (!el) return;
    e.preventDefault();
    localStorage.removeItem("loggedInUser");
    // Optional: also clear other “session-ish” things if you want
    // localStorage.removeItem("kac_member_statement");
    window.location.href = "login.html";
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

  // =========================
  // LOGIN (only runs on login.html where #loginForm exists)
  // =========================
  const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailEl = document.getElementById("loginEmail");
    const passEl = document.getElementById("loginPassword");

    const email = (emailEl?.value || "").trim().toLowerCase();
    if (!email) return;

    const role = (email === "admin@kickasscocoa.com") ? "admin" : "member";

    const savedProfile = getProfileByEmail(email) || {};

    const user = {
      email,
      role,
      displayName: savedProfile.displayName || "",
      firstName: savedProfile.firstName || "",
      lastName: savedProfile.lastName || "",
      avatar: savedProfile.avatar || "",
      loggedAt: new Date().toISOString()
    };

    saveUser(user);

    if (passEl) passEl.value = "";
    window.location.href = "members-area.html";
  });
}
  // Render avatar (if present on page)
  renderNavAvatar();
});

// Expose for other files to call after updates
window.KAC = { getUser, saveUser, renderNavAvatar, initialsFromUser };