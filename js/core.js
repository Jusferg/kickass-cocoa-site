/****************************************************
 * core.js — runs on every page
 * - Navbar burger + dropdown
 * - Logout button (if present)
 ****************************************************/
console.log("core.js loaded");
document.addEventListener("DOMContentLoaded", () => {
  // ---------- NAV ----------
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
  }

  if (drop && dropBtn) {
    dropBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = drop.classList.toggle("is-open");
      dropBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (drop.contains(e.target)) return;
      drop.classList.remove("is-open");
      dropBtn.setAttribute("aria-expanded", "false");
    });

    if (dropMenu) {
      dropMenu.addEventListener("click", (e) => e.stopPropagation());
    }
  }

  // ---------- LOGOUT ----------
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("kac_member_statement");
      window.location.href = "login.html";
    });
  }
});