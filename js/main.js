/****************************************************
 * SCRIPT.JS - Kick A$$ Cocoa
 * Unified JS for all pages
 ****************************************************/

console.log("SCRIPT.JS ACTIVE");

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

/* ------------------ EVENTS CALENDAR ------------------ */
const calendarEl = document.getElementById("calendar");
const adminEventSection = document.getElementById("adminEventSection");
const eventForm = document.getElementById("eventForm");
let events = JSON.parse(localStorage.getItem("events")) || [];

if (adminEventSection && isAdmin()) {
  adminEventSection.classList.remove("hidden");
}

if (eventForm && isAdmin()) {
  eventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("eventTitle").value;
    const description = document.getElementById("eventDescription").value;
    const startDate = document.getElementById("eventStart").value;
    const endDate = document.getElementById("eventEnd").value;

    const newEvent = {
      id: Date.now(),
      title,
      description,
      startDate,
      endDate,
      rsvps: []
    };

    events.push(newEvent);
    localStorage.setItem("events", JSON.stringify(events));
    eventForm.reset();
    renderCalendar();
  });
}

function renderCalendar() {
  if (!calendarEl) return;
  calendarEl.innerHTML = "";
  const today = new Date().toISOString().split("T")[0];

  events.forEach(event => {
    const day = document.createElement("div");
    day.className = "calendar-day";
    if (event.startDate <= today && event.endDate >= today) {
      day.classList.add("today");
    }
    day.innerHTML = `
      <h3>${event.title}</h3>
      <p>${event.description}</p>
      <small>${event.startDate} → ${event.endDate}</small>
      <button class="rsvp-btn" data-id="${event.id}">RSVP</button>
      ${isAdmin() ? `<button class="delete-btn" data-id="${event.id}">Delete</button>` : ""}
    `;
    calendarEl.appendChild(day);
  });

  attachEventButtons();
}

function attachEventButtons() {
  document.querySelectorAll(".rsvp-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const eventId = btn.dataset.id;
      const event = events.find(e => e.id == eventId);
      if (!event.rsvps.includes(loggedInUser.email)) {
        event.rsvps.push(loggedInUser.email);
        localStorage.setItem("events", JSON.stringify(events));
        alert("RSVP confirmed!");
      }
    });
  });

  if (isAdmin()) {
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const eventId = btn.dataset.id;
        events = events.filter(e => e.id != eventId);
        localStorage.setItem("events", JSON.stringify(events));
        renderCalendar();
      });
    });
  }
}

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
