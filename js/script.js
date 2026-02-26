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







// ==============================
// EVENTS CALENDAR
// ==============================


document.addEventListener("DOMContentLoaded", () => {
  console.log("Events JS loaded");

  // DOM elements
  const calendarTbody = document.querySelector("#calendar tbody");
  const monthYearEl = document.getElementById("monthYear");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const adminForm = document.getElementById("adminForm");
  const addEventBtn = document.getElementById("addEventBtn");

  // Load events from localStorage or initialize
  let events = JSON.parse(localStorage.getItem("events")) || [];

  // Detect logged-in user
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const isAdmin = loggedInUser?.role === "admin";
  const isMember = loggedInUser?.role === "member";

  // Show admin form if admin
  if (isAdmin && adminForm) adminForm.classList.remove("hidden");

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // Save events to localStorage
  function saveEvents() {
    localStorage.setItem("events", JSON.stringify(events));
  }

  // Generate calendar
  function generateCalendar(month = currentMonth, year = currentYear) {
    calendarTbody.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    monthYearEl.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    let row = document.createElement("tr");

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const cell = document.createElement("td");
      row.appendChild(cell);
    }

    // Fill in the days
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("td");
      const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

      const today = new Date();
      if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
        cell.classList.add("today");
      }

      cell.innerHTML = `<strong>${day}</strong>`;

      // Add events for this day
      events.forEach(ev => {
        if (dateStr >= ev.start && dateStr <= ev.end) {
          const evEl = document.createElement("div");
          evEl.classList.add("event");
          evEl.textContent = ev.title;

          // Admin: delete button
          if (isAdmin) {
            const delBtn = document.createElement("button");
            delBtn.classList.add("rsvp-btn");
            delBtn.style.backgroundColor = "#c0392b";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", () => {
              events = events.filter(e => e !== ev);
              saveEvents();
              generateCalendar(currentMonth, currentYear);
            });
            evEl.appendChild(delBtn);
          }

          // Member: RSVP button
          if (isMember) {
            const rsvpBtn = document.createElement("button");
            rsvpBtn.classList.add("rsvp-btn");

            // Check if already RSVP'd
            ev.rsvps = ev.rsvps || [];
            const hasRSVPed = ev.rsvps.includes(loggedInUser.email);
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

      // Start new row every Saturday
      if ((day + firstDay) % 7 === 0) {
        calendarTbody.appendChild(row);
        row = document.createElement("tr");
      }
    }

    // Append leftover row
    if (row.children.length > 0) calendarTbody.appendChild(row);
  }

  // Initial calendar render
  generateCalendar();

  // Month navigation
  prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    generateCalendar(currentMonth, currentYear);
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    generateCalendar(currentMonth, currentYear);
  });

  // Admin add event
  if (isAdmin && addEventBtn) {
    addEventBtn.addEventListener("click", () => {
      const titleEl = document.getElementById("eventTitle");
      const startEl = document.getElementById("eventStart");
      const endEl = document.getElementById("eventEnd");

      const title = titleEl.value.trim();
      const start = startEl.value.trim();
      const end = endEl.value.trim();

      if (!title || !start || !end) { alert("Please fill out all fields."); return; }

      const startDate = new Date(start);
      const endDate = new Date(end);
      if (startDate > endDate) { alert("Start date cannot be after end date."); return; }

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




/* ===============================
   BOOK RATINGS
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const ratings = document.querySelectorAll(".rating");

  ratings.forEach(ratingEl => {
    const bookId = ratingEl.dataset.book;
    const stars = ratingEl.querySelectorAll(".star");
    const text = ratingEl.querySelector(".rating-text");

    // Load existing ratings
    let data = JSON.parse(localStorage.getItem(`rating-${bookId}`)) || {
      total: 0,
      count: 0
    };

    updateDisplay(data, stars, text);

    stars.forEach(star => {
      star.addEventListener("click", () => {
        const value = Number(star.dataset.value);

        data.total += value;
        data.count += 1;

        localStorage.setItem(`rating-${bookId}`, JSON.stringify(data));
        updateDisplay(data, stars, text);
      });
    });
  });
});

function updateDisplay(data, stars, text) {
  if (data.count === 0) {
    text.textContent = "(No ratings yet)";
    stars.forEach(s => s.classList.remove("active"));
    return;
  }

  const avg = (data.total / data.count).toFixed(1);
  text.textContent = `${avg} ★ (${data.count})`;

  stars.forEach(star => {
    star.classList.toggle(
      "active",
      Number(star.dataset.value) <= Math.round(avg)
    );
  });
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
