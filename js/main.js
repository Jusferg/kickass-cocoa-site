// ===============================
// MAIN.JS
// ===============================

// ===============================
// AUTHENTICATION & USERS
// ===============================

// Default system users for testing/admin
const systemUsers = {
  "admin@wgc.com": { password: "admin123", role: "admin" },
  "leader@wgc.com": { password: "leader123", role: "leader" }
};

// Login function
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  let users = JSON.parse(localStorage.getItem("users")) || {};
  const user = users[email] || systemUsers[email];

  if (!user || user.password !== password) {
    alert("Invalid email or password");
    return;
  }

  localStorage.setItem("authenticated", "true");
  localStorage.setItem("email", email);
  localStorage.setItem("role", user.role);

  window.location.href = "members-area.html";
}

// Register function
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please complete all fields");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[email]) {
    alert("An account with this email already exists.");
    return;
  }

  users[email] = { password: password, role: "member" };
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registration successful. You may now log in.");
  window.location.href = "login.html";
}

// Check authentication for members-only pages
function checkAuth() {
  if (localStorage.getItem("authenticated") !== "true") {
    window.location.href = "login.html";
  }
}

// Logout function
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ===============================
// DYNAMIC NAVIGATION
// ===============================

function updateNav() {
  const role = localStorage.getItem("role");
  const navMenu = document.getElementById("navMenu");
  if (!navMenu) return;

  const links = navMenu.querySelectorAll("a");

  links.forEach(link => {
    const text = link.textContent.toLowerCase();
    if (role) {
      // Logged in: hide login/join
      if (text === "login" || text === "join") link.style.display = "none";
      if (text === "members area" || text === "dashboard") link.style.display = "inline";
    } else {
      // Logged out: hide members area/logout
      if (text === "members area" || text === "dashboard" || text === "logout") link.style.display = "none";
      if (text === "login" || text === "join") link.style.display = "inline";
    }
  });
}

// ===============================
// COLLAPSIBLE NAVIGATION
// ===============================

function toggleMenu() {
  const menu = document.getElementById("navMenu");
  if (!menu) return;
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

// ===============================
// MEMBERS ONLINE TRACKING
// ===============================

const ACTIVE_WINDOW = 5 * 60 * 1000; // 5 minutes

// Update current member activity
function updateActivity() {
  const email = localStorage.getItem("email");
  if (!email) return;

  let activity = JSON.parse(localStorage.getItem("activity")) || {};
  activity[email] = Date.now();
  localStorage.setItem("activity", JSON.stringify(activity));
}

// Display members active recently
function displayActiveMembers() {
  let activity = JSON.parse(localStorage.getItem("activity")) || {};
  const now = Date.now();
  const list = document.getElementById("onlineMembers");
  if (!list) return;

  list.innerHTML = "";
  Object.keys(activity).forEach(email => {
    if (now - activity[email] <= ACTIVE_WINDOW) {
      const li = document.createElement("li");
      li.textContent = email.split("@")[0]; // show only name part
      list.appendChild(li);
    }
  });

  if (!list.hasChildNodes()) {
    list.innerHTML = "<li>No active members right now</li>";
  }
}

// ===============================
// EVENTS CALENDAR WITH RSVP, EDIT, DELETE
// ===============================

// Current date for calendar display
let currentDate = new Date();

// Load events from localStorage or empty
let events = JSON.parse(localStorage.getItem("events")) || {};

// Render calendar for current month
function renderCalendar() {
  const monthYear = document.getElementById("monthYear");
  const daysContainer = document.getElementById("calendarDays");
  if (!monthYear || !daysContainer) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  daysContainer.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty slots for first week
  for (let i = 0; i < firstDay; i++) {
    daysContainer.innerHTML += `<div></div>`;
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasEvent = events[dateKey];

    const dayDiv = document.createElement("div");
    dayDiv.className = "calendar-day" + (hasEvent ? " has-event" : "");
    dayDiv.textContent = day;
    dayDiv.onclick = () => showEvents(dateKey);
    daysContainer.appendChild(dayDiv);
  }
}

// Show events for selected day
function showEvents(dateKey) {
  const eventDetails = document.getElementById("eventDetails");
  if (!eventDetails) return;

  const dayEvents = events[dateKey];
  if (!dayEvents) {
    eventDetails.innerHTML = "<p>No events scheduled.</p>";
    return;
  }

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  eventDetails.innerHTML = `
    <h4>Events</h4>
    <ul>
      ${dayEvents.map((e, idx) => `
        <li>
          <strong>${e.title}</strong><br>
          <small>${e.description || ""}</small><br>
          <small>RSVPs: ${e.rsvps.length}</small><br>
          <button onclick="rsvpEvent('${dateKey}', ${idx})">
            ${e.rsvps.includes(email) ? "Cancel RSVP" : "RSVP"}
          </button>
          ${role === "admin" ? `
            <button onclick="editEvent('${dateKey}', ${idx})">Edit</button>
            <button onclick="deleteEvent('${dateKey}', ${idx})">Delete</button>
          ` : ""}
        </li>
      `).join("")}
    </ul>
  `;
}

// RSVP or cancel RSVP for event
function rsvpEvent(dateKey, index) {
  const email = localStorage.getItem("email");
  if (!email) return;

  const dayEvent = events[dateKey][index];

  if (!dayEvent.rsvps.includes(email)) {
    dayEvent.rsvps.push(email);
  } else {
    dayEvent.rsvps = dayEvent.rsvps.filter(e => e !== email);
  }

  localStorage.setItem("events", JSON.stringify(events));
  showEvents(dateKey);
}

// Admin adds new event
