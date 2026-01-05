/****************************************************
 * SCRIPT.JS - Kick A$$ Cocoa
 * Unified JS for all pages
 ****************************************************/

console.log("Unified JS loaded");

/* ==========================
   AUTH & LOGOUT
========================== */
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

function requireAuth() {
  if (!loggedInUser) {
    window.location.href = "login.html";
  }
}

// Logout
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "logoutBtn") {
    e.preventDefault();
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  }
});

/* ==========================
   NAVIGATION
========================== */
// Hamburger toggle
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });
  }

  // Optional: close menu when clicking a link (mobile)
  navMenu?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("show");
    });
  });
});


// Mobile dropdowns
const dropdowns = document.querySelectorAll(".nav-dropdown > a");
dropdowns.forEach(drop => {
  drop.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      drop.parentElement.classList.toggle("active");
    }
  });
});

/* ==========================
   MEMBERS AREA
========================== */
if (document.body.classList.contains("members-page")) {
  requireAuth();
  const welcomeEl = document.getElementById("welcomeUser");
  if (welcomeEl && loggedInUser) {
    welcomeEl.textContent = `Welcome, ${loggedInUser.email}`;
  }
}

/* ==========================
   CONTACT FORM SUCCESS
========================== */
const contactForm = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

if (contactForm && formSuccess) {
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();
    contactForm.reset();
    formSuccess.classList.add("show");
    setTimeout(() => formSuccess.classList.remove("show"), 4000);
  });
}

/* ==========================
   RESOURCE SEARCH
========================== */
const searchInput = document.getElementById("searchInput");
const resourceCards = document.querySelectorAll("#resourceCards .card");

if (searchInput) {
  searchInput.addEventListener("keyup", () => {
    const term = searchInput.value.toLowerCase();
    resourceCards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(term) ? "block" : "none";
    });
  });
}

/* ==========================
   HERO CAROUSEL
========================== */
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  if (slides.length > 0) {
    let currentIndex = 0;

    function showSlide(index) {
      slides.forEach(slide => slide.classList.remove("active"));
      slides[index].classList.add("active");
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }

    showSlide(currentIndex);
    setInterval(nextSlide, 5000);
  }
});

/* ==========================
   EVENTS CALENDAR
========================== */
document.addEventListener("DOMContentLoaded", () => {
  const calendarTbody = document.querySelector("#calendar tbody");
  const monthYearEl = document.getElementById("monthYear");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const adminForm = document.getElementById("adminForm");
  const addEventBtn = document.getElementById("addEventBtn");

  if (!calendarTbody) return; // Exit if calendar not on page

  let events = JSON.parse(localStorage.getItem("events")) || [];
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const isAdmin = loggedInUser?.role === "admin";
  const isMember = loggedInUser?.role === "member";

  if (isAdmin && adminForm) adminForm.classList.remove("hidden");

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  function saveEvents() {
    localStorage.setItem("events", JSON.stringify(events));
  }

  function generateCalendar(month = currentMonth, year = currentYear) {
    calendarTbody.innerHTML = "";
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    monthYearEl.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    let row = document.createElement("tr");

    for (let i = 0; i < firstDay; i++) {
      row.appendChild(document.createElement("td"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("td");
      const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

      if (new Date().toDateString() === new Date(year, month, day).toDateString()) {
        cell.classList.add("today");
      }

      cell.innerHTML = `<strong>${day}</strong>`;

      events.forEach(ev => {
        if (dateStr >= ev.start && dateStr <= ev.end) {
          const evEl = document.createElement("div");
          evEl.classList.add("event");
          evEl.textContent = ev.title;

          // Tooltip
          const tooltip = document.createElement("span");
          tooltip.classList.add("tooltip");
          tooltip.textContent = `Dates: ${ev.start} → ${ev.end} | RSVPs: ${ev.rsvps ? ev.rsvps.length : 0}`;
          evEl.appendChild(tooltip);

          // Admin delete
          if (isAdmin) {
            const delBtn = document.createElement("button");
            delBtn.className = "rsvp-btn admin";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", () => {
              events = events.filter(e => e !== ev);
              saveEvents();
              generateCalendar(currentMonth, currentYear);
            });
            evEl.appendChild(delBtn);
          }

          // Member RSVP
          if (isMember) {
            ev.rsvps = ev.rsvps || [];
            const hasRSVPed = ev.rsvps.includes(loggedInUser.email);
            const rsvpBtn = document.createElement("button");
            rsvpBtn.className = "rsvp-btn member";
            rsvpBtn.textContent = hasRSVPed ? "RSVPed" : "RSVP";
            rsvpBtn.disabled = hasRSVPed;

            rsvpBtn.addEventListener("click", () => {
              ev.rsvps.push(loggedInUser.email);
              saveEvents();
              generateCalendar(currentMonth, currentYear);
              alert(`You RSVP'd for ${ev.title} on ${dateStr}`);
            });

            evEl.appendChild(rsvpBtn);
          }

          cell.appendChild(evEl);
        }
      });

      row.appendChild(cell);
      if ((day + firstDay) % 7 === 0) {
        calendarTbody.appendChild(row);
        row = document.createElement("tr");
      }
    }

    if (row.children.length > 0) calendarTbody.appendChild(row);
  }

  generateCalendar();

  if (prevMonthBtn) prevMonthBtn.addEventListener("click", () => {
    currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    generateCalendar(currentMonth, currentYear);
  });

  if (nextMonthBtn) nextMonthBtn.addEventListener("click", () => {
    currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    generateCalendar(currentMonth, currentYear);
  });

  if (isAdmin && addEventBtn) {
    addEventBtn.addEventListener("click", () => {
      const titleEl = document.getElementById("eventTitle");
      const startEl = document.getElementById("eventStart");
      const endEl = document.getElementById("eventEnd");

      const title = titleEl.value.trim();
      const start = startEl.value.trim();
      const end = endEl.value.trim();

      if (!title || !start || !end) { alert("Please fill out all fields."); return; }
      if (new Date(start) > new Date(end)) { alert("Start date cannot be after end date."); return; }

      events.push({ title, start, end, rsvps: [] });
      saveEvents();

      titleEl.value = "";
      startEl.value = "";
      endEl.value = "";

      generateCalendar(currentMonth, currentYear);
      alert(`Event "${title}" added successfully!`);
    });
  }
});
