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
  const calendarTbody = document.querySelector("#calendar tbody");
  const monthYearEl = document.getElementById("monthYear");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const adminForm = document.getElementById("adminForm");

  let events = [
    { title: "Board Meeting", start: "2026-01-05", end: "2026-01-05" },
    { title: "Workshop", start: "2026-01-15", end: "2026-01-16" },
  ];

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const isAdmin = loggedInUser?.role === "admin";

  if (isAdmin) adminForm.classList.remove("hidden");

  // Start with current month
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  function generateCalendar(month = currentMonth, year = currentYear) {
    calendarTbody.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    monthYearEl.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    let row = document.createElement("tr");

    // Blank cells before first day
    for (let i = 0; i < firstDay; i++) {
      const cell = document.createElement("td");
      row.appendChild(cell);
    }

    // Fill the days
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("td");
      const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

      const today = new Date();
      if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
        cell.classList.add("today");
      }

      cell.innerHTML = `<strong>${day}</strong>`;

      // Events for this day
      events.forEach(ev => {
        if (dateStr >= ev.start && dateStr <= ev.end) {
          const evEl = document.createElement("div");
          evEl.classList.add("event");
          evEl.textContent = ev.title;

          // RSVP for members
          if (!isAdmin) {
            const rsvpBtn = document.createElement("button");
            rsvpBtn.classList.add("rsvp-btn");
            rsvpBtn.textContent = "RSVP";
            rsvpBtn.addEventListener("click", () => {
              alert(`You RSVP'd for ${ev.title} on ${dateStr}`);
            });
            evEl.appendChild(rsvpBtn);
          }

          // Delete for admin
          if (isAdmin) {
            const delBtn = document.createElement("button");
            delBtn.classList.add("rsvp-btn");
            delBtn.style.backgroundColor = "#c0392b";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", () => {
              if (confirm(`Delete event "${ev.title}"?`)) {
                events = events.filter(e => e !== ev);
                generateCalendar(currentMonth, currentYear);
              }
            });
            evEl.appendChild(delBtn);
          }

          cell.appendChild(evEl);
        }
      });

      row.appendChild(cell);

      // New row every Saturday
      if ((day + firstDay) % 7 === 0) {
        calendarTbody.appendChild(row);
        row = document.createElement("tr");
      }
    }

    if (row.children.length > 0) calendarTbody.appendChild(row);
  }

  generateCalendar();

  // Month navigation
  prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
  });

  // Admin add event - robust version
document.addEventListener("DOMContentLoaded", () => {
  const calendarTbody = document.querySelector("#calendar tbody");
  const monthYearEl = document.getElementById("monthYear");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const adminForm = document.getElementById("adminForm");

  // Sample events
  let events = [
    { title: "Board Meeting", start: "2026-01-05", end: "2026-01-05" },
    { title: "Workshop", start: "2026-01-15", end: "2026-01-16" },
  ];

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const isAdmin = loggedInUser?.role === "admin";

  if (isAdmin) adminForm.classList.remove("hidden");

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  function generateCalendar(month = currentMonth, year = currentYear) {
    calendarTbody.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    monthYearEl.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    let row = document.createElement("tr");

    // Blank cells before first day
    for (let i = 0; i < firstDay; i++) {
      const cell = document.createElement("td");
      row.appendChild(cell);
    }

    // Fill the days
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("td");
      const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

      const today = new Date();
      if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
        cell.classList.add("today");
      }

      cell.innerHTML = `<strong>${day}</strong>`;

      // Events for this day
      events.forEach(ev => {
        if (dateStr >= ev.start && dateStr <= ev.end) {
          const evEl = document.createElement("div");
          evEl.classList.add("event");
          evEl.textContent = ev.title;

          // RSVP for members
          if (!isAdmin) {
            const rsvpBtn = document.createElement("button");
            rsvpBtn.classList.add("rsvp-btn");
            rsvpBtn.textContent = "RSVP";
            rsvpBtn.addEventListener("click", () => {
              alert(`You RSVP'd for ${ev.title} on ${dateStr}`);
            });
            evEl.appendChild(rsvpBtn);
          }

          // Delete for admin
          if (isAdmin) {
            const delBtn = document.createElement("button");
            delBtn.classList.add("rsvp-btn");
            delBtn.style.backgroundColor = "#c0392b";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", () => {
              if (confirm(`Delete event "${ev.title}"?`)) {
                events = events.filter(e => e !== ev);
                generateCalendar(currentMonth, currentYear);
              }
            });
            evEl.appendChild(delBtn);
          }

          cell.appendChild(evEl);
        }
      });

      row.appendChild(cell);

      // New row every Saturday
      if ((day + firstDay) % 7 === 0) {
        calendarTbody.appendChild(row);
        row = document.createElement("tr");
      }
    }

    if (row.children.length > 0) calendarTbody.appendChild(row);
  }

  generateCalendar();

  // Month navigation
  prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
  });

  // Admin add event (robust)
  const addEventBtn = document.getElementById("addEventBtn");
  if (addEventBtn) {
    addEventBtn.addEventListener("click", () => {
      const titleEl = document.getElementById("eventTitle");
      const startEl = document.getElementById("eventStart");
      const endEl = document.getElementById("eventEnd");

      if (!titleEl || !startEl || !endEl) return;

      const title = titleEl.value.trim();
      const start = startEl.value.trim();
      const end = endEl.value.trim();

      if (!title) { alert("Please enter an event title."); return; }
      if (!start) { alert("Please select a start date."); return; }
      if (!end) { alert("Please select an end date."); return; }

      const startDate = new Date(start);
      const endDate = new Date(end);
      if (startDate > endDate) { alert("Start date cannot be after end date."); return; }

      events.push({ title, start, end });

      titleEl.value = "";
      startEl.value = "";
      endEl.value = "";

      generateCalendar(currentMonth, currentYear);
      alert(`Event "${title}" added successfully!`);
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
