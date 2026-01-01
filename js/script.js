/****************************************************
 * SCRIPT.JS - Kick A$$ Cocoa
 * Unified JS for all pages
 ****************************************************/


/* ------------------ AUTH ------------------ */
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

function requireAuth() {
  if (!loggedInUser) {
    window.location.href = "login.html";
  }
}

function isAdmin() {
  return loggedInUser && loggedInUser.role === "admin";
}

/* ------------------ LOGOUT ------------------ */
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "logoutBtn") {
    e.preventDefault();
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  }
});

/* ------------------ NAV TOGGLE ------------------ */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

/* ------------------ MEMBERS AREA ------------------ */
if (document.body.classList.contains("members-page")) {
  requireAuth();
  const welcomeEl = document.getElementById("welcomeUser");
  if (welcomeEl && loggedInUser) {
    welcomeEl.textContent = `Welcome, ${loggedInUser.email}`;
  }
}

// ==============================
// EVENTS CALENDAR
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const calendarEl = document.getElementById("calendar");
  const adminForm = document.getElementById("adminForm");

  // Example events array
  let events = [
    { title: "Board Meeting", start: "2026-01-05", end: "2026-01-05" },
    { title: "Workshop", start: "2026-01-15", end: "2026-01-16" },
  ];

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const isAdmin = loggedInUser?.role === "admin";

  // Show admin form if admin
  if (isAdmin) adminForm.classList.remove("hidden");

  // Generate calendar for current month
  function generateCalendar() {
    calendarEl.innerHTML = "";
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill in blank days for first week
    for (let i = 0; i < firstDay; i++) {
      const blankDay = document.createElement("div");
      blankDay.classList.add("calendar-day");
      calendarEl.appendChild(blankDay);
    }

    // Create days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEl = document.createElement("div");
      dayEl.classList.add("calendar-day");

      // Highlight today
      if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
        dayEl.classList.add("today");
      }

      dayEl.innerHTML = `<strong>${day}</strong>`;

      // Add events to this day
      events.forEach(ev => {
        if (dateStr >= ev.start && dateStr <= ev.end) {
          const evEl = document.createElement("div");
          evEl.classList.add("event");
          evEl.textContent = ev.title;

          // Add RSVP button for members
          if (!isAdmin) {
            const rsvpBtn = document.createElement("button");
            rsvpBtn.classList.add("rsvp-btn");
            rsvpBtn.textContent = "RSVP";
            rsvpBtn.addEventListener("click", () => {
              alert(`You RSVP'd for ${ev.title} on ${dateStr}`);
            });
            evEl.appendChild(rsvpBtn);
          }

          // Add delete button for admin
          if (isAdmin) {
            const delBtn = document.createElement("button");
            delBtn.classList.add("rsvp-btn");
            delBtn.textContent = "Delete";
            delBtn.style.backgroundColor = "#c0392b";
            delBtn.addEventListener("click", () => {
              if (confirm(`Delete event "${ev.title}"?`)) {
                events = events.filter(e => e !== ev);
                generateCalendar();
              }
            });
            evEl.appendChild(delBtn);
          }

          dayEl.appendChild(evEl);
        }
      });

      calendarEl.appendChild(dayEl);
    }
  }

  generateCalendar();

  // Admin adds event
  const addEventBtn = document.getElementById("addEventBtn");
  if (addEventBtn) {
    addEventBtn.addEventListener("click", () => {
      const title = document.getElementById("eventTitle").value;
      const start = document.getElementById("eventStart").value;
      const end = document.getElementById("eventEnd").value;

      if (title && start && end) {
        events.push({ title, start, end });
        generateCalendar();
        document.getElementById("eventTitle").value = "";
        document.getElementById("eventStart").value = "";
        document.getElementById("eventEnd").value = "";
      } else {
        alert("Please fill out all fields.");
      }
    });
  }
});


/* ------------------ RESOURCE SEARCH ------------------ */
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
