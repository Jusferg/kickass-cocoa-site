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
  const adminForm = document.getElementById("adminForm");

  let events = [
    { title: "Board Meeting", start: "2026-01-05", end: "2026-01-05" },
    { title: "Workshop", start: "2026-01-15", end: "2026-01-16" },
  ];

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const isAdmin = loggedInUser?.role === "admin";

  if (isAdmin) adminForm.classList.remove("hidden");

  function generateCalendar() {
    calendarTbody.innerHTML = "";
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let row = document.createElement("tr");

    // Fill blank days before first of month
    for (let i = 0; i < firstDay; i++) {
      const cell = document.createElement("td");
      row.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("td");
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      // Highlight today
      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        cell.classList.add("today");
      }

      cell.innerHTML = `<strong>${day}</strong>`;

      // Add events for this day
      events.forEach(ev => {
        if (dateStr >= ev.start && dateStr <= ev.end) {
          const evEl = document.createElement("div");
          evEl.classList.add("event");
          evEl.textContent = ev.title;

          // RSVP button for members
          if (!isAdmin) {
            const rsvpBtn = document.createElement("button");
            rsvpBtn.classList.add("rsvp-btn");
            rsvpBtn.textContent = "RSVP";
            rsvpBtn.addEventListener("click", () => {
              alert(`You RSVP'd for ${ev.title} on ${dateStr}`);
            });
            evEl.appendChild(rsvpBtn);
          }

          // Delete button for admin
          if (isAdmin) {
            const delBtn = document.createElement("button");
            delBtn.classList.add("rsvp-btn");
            delBtn.style.backgroundColor = "#c0392b";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", () => {
              if (confirm(`Delete event "${ev.title}"?`)) {
                events = events.filter(e => e !== ev);
                generateCalendar();
              }
            });
            evEl.appendChild(delBtn);
          }

          cell.appendChild(evEl);
        }
      });

      row.appendChild(cell);

      // Start a new row every Saturday
      if ((day + firstDay) % 7 === 0) {
        calendarTbody.appendChild(row);
        row = document.createElement("tr");
      }
    }

    // Append last row if not yet appended
    if (row.children.length > 0) {
      calendarTbody.appendChild(row);
    }
  }

  generateCalendar();

  // Admin add event
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
