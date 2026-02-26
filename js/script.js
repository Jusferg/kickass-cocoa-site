/****************************************************
 * SCRIPT.JS - Kick A$$ Cocoa
 * Unified JS for all pages
 ****************************************************/
console.log("Carousel JS loaded");





  // Dropdown toggle for About (desktop + mobile)
  if (drop && dropBtn) {
    dropBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const open = drop.classList.toggle("is-open");
      dropBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Close dropdown if clicking outside (desktop + mobile)
  document.addEventListener("click", (e) => {
    if (!drop || !dropBtn) return;
    const clickedInside = drop.contains(e.target);
    if (clickedInside) return;

    drop.classList.remove("is-open");
    dropBtn.setAttribute("aria-expanded", "false");
  });

  // Close menu when clicking a link (mobile)
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

  // Prevent clicks inside dropdown menu from closing immediately
  if (dropMenu) {
    dropMenu.addEventListener("click", (e) => e.stopPropagation());
  }










