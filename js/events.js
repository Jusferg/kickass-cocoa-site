/****************************************************
 * events.js — Events page only
 * - Calendar render
 * - Admin can add/delete events
 * - Members can RSVP
 * - Persists in localStorage
 ****************************************************/

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("loggedInUser"));
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Only run if the calendar exists on this page
  const calendarTbody = document.querySelector("#calendar tbody");
  const monthYearEl = document.getElementById("monthYear");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const adminForm = document.getElementById("adminForm");
  const addEventBtn = document.getElementById("addEventBtn");

  if (!calendarTbody || !monthYearEl || !prevMonthBtn || !nextMonthBtn) return;

  console.log("events.js loaded ✅");

  // Load events
  let events = JSON.parse(localStorage.getItem("events")) || [];

  // User
  const user = getLoggedInUser();
  const userIsAdmin = user?.role === "admin";
  const userIsMember = user?.role === "member";

  // Show admin form if admin
  if (userIsAdmin && adminForm) adminForm.classList.remove("hidden");

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  function saveEvents() {
    localStorage.setItem("events", JSON.stringify(events));
  }

  function generateCalendar(month = currentMonth, year = currentYear) {
    calendarTbody.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYearEl.textContent = new Date(year, month).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    let row = document.createElement("tr");

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      row.appendChild(document.createElement("td"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("td");
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      // Highlight today
      const today = new Date();
      if (
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year
      ) {
        cell.classList.add("today");
      }

      cell.innerHTML = `<strong>${day}</strong>`;

      // Add events for this day
      events.forEach((ev) => {
        if (dateStr >= ev.start && dateStr <= ev.end) {
          const evEl = document.createElement("div");
          evEl.classList.add("event");
          evEl.textContent = ev.title;

          // Admin: delete
          if (userIsAdmin) {
            const delBtn = document.createElement("button");
            delBtn.classList.add("rsvp-btn");
            delBtn.style.backgroundColor = "#c0392b";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", () => {
              events = events.filter((e) => e !== ev);
              saveEvents();
              generateCalendar(currentMonth, currentYear);
            });
            evEl.appendChild(delBtn);
          }

          // Member: RSVP
          if (userIsMember && user?.email) {
            const rsvpBtn = document.createElement("button");
            rsvpBtn.classList.add("rsvp-btn");

            ev.rsvps = ev.rsvps || [];
            const hasRSVPed = ev.rsvps.includes(user.email);

            rsvpBtn.textContent = hasRSVPed ? "RSVPed" : "RSVP";
            rsvpBtn.disabled = hasRSVPed;

            rsvpBtn.addEventListener("click", () => {
              ev.rsvps.push(user.email);
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

      // new row each Saturday
      if ((day + firstDay) % 7 === 0) {
        calendarTbody.appendChild(row);
        row = document.createElement("tr");
      }
    }

    if (row.children.length > 0) calendarTbody.appendChild(row);
  }

  // Initial render
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

  // Admin add event
  if (userIsAdmin && addEventBtn) {
    addEventBtn.addEventListener("click", () => {
      const titleEl = document.getElementById("eventTitle");
      const startEl = document.getElementById("eventStart");
      const endEl = document.getElementById("eventEnd");

      const title = titleEl?.value.trim();
      const start = startEl?.value.trim();
      const end = endEl?.value.trim();

      if (!title || !start || !end) {
        alert("Please fill out all fields.");
        return;
      }

      const startDate = new Date(start);
      const endDate = new Date(end);
      if (startDate > endDate) {
        alert("Start date cannot be after end date.");
        return;
      }

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