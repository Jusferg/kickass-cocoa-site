/****************************************************
 * events.js — Events page only
 * - Calendar render
 * - Admin can add/delete events
 * - Members can RSVP
 * - Persists in localStorage
 *
 * Requirements:
 * - Table: #calendar with <tbody>
 * - Month controls: #prevMonth, #nextMonth, #monthYear
 * - Admin form wrapper: #adminForm (can be hidden by default)
 * - Admin inputs: #eventTitle, #eventStart, #eventEnd
 * - Admin button: #addEventBtn
 ****************************************************/

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("loggedInUser") || "null");
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Only run if calendar exists
  const calendarTbody = document.querySelector("#calendar tbody");
  const monthYearEl = document.getElementById("monthYear");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const adminForm = document.getElementById("adminForm");
  const addEventBtn = document.getElementById("addEventBtn");

  if (!calendarTbody || !monthYearEl || !prevMonthBtn || !nextMonthBtn) return;

  console.log("events.js loaded ✅");

  // Load events from localStorage
  let events = [];
  try {
    events = JSON.parse(localStorage.getItem("events")) || [];
    if (!Array.isArray(events)) events = [];
  } catch {
    events = [];
  }

  // Determine user role
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

  function isoToday() {
    return new Date().toISOString().split("T")[0];
  }

  function isValidISODate(s) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s);
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

    // Fill days
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("td");
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      // Highlight today
      const today = new Date();
      if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
        cell.classList.add("today");
      }

      cell.innerHTML = `<strong>${day}</strong>`;

      // Add events for this date
      events.forEach((ev) => {
        if (!ev || !ev.title || !ev.start || !ev.end) return;
        if (!isValidISODate(ev.start) || !isValidISODate(ev.end)) return;

        if (dateStr >= ev.start && dateStr <= ev.end) {
          cell.classList.add("has-event"); // ⭐ upgrade: highlight day

          const evEl = document.createElement("div");
          evEl.classList.add("event");

          const titleEl = document.createElement("div");
          titleEl.textContent = ev.title;
          evEl.appendChild(titleEl);

          // Ensure RSVPs array exists
          ev.rsvps = Array.isArray(ev.rsvps) ? ev.rsvps : [];

          // ⭐ upgrade: RSVP count
          const rsvpCount = document.createElement("span");
          rsvpCount.classList.add("rsvp-count");
          rsvpCount.textContent = `${ev.rsvps.length} going`;
          evEl.appendChild(rsvpCount);

          // Admin: delete button
          if (userIsAdmin) {
            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.classList.add("rsvp-btn");
            delBtn.style.backgroundColor = "#c0392b";
            delBtn.textContent = "Delete";

            delBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              events = events.filter((e2) => e2 !== ev);
              saveEvents();
              generateCalendar(currentMonth, currentYear);
            });

            evEl.appendChild(delBtn);
          }

          // Member: RSVP button
          if (userIsMember && user?.email) {
            const rsvpBtn = document.createElement("button");
            rsvpBtn.type = "button";
            rsvpBtn.classList.add("rsvp-btn");

            const hasRSVPed = ev.rsvps.includes(user.email);
            rsvpBtn.textContent = hasRSVPed ? "RSVPed" : "RSVP";
            rsvpBtn.disabled = hasRSVPed;

            // ⭐ upgrade: close RSVP for past days
            const todayISO = isoToday();
            if (dateStr < todayISO) {
              rsvpBtn.disabled = true;
              rsvpBtn.textContent = "Closed";
            }

            rsvpBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              if (!user?.email) return;

              // Prevent duplicates
              if (!ev.rsvps.includes(user.email)) {
                ev.rsvps.push(user.email);
                saveEvents();
                generateCalendar(currentMonth, currentYear);
                alert(`You RSVP'd for ${ev.title} on ${dateStr}`);
              }
            });

            evEl.appendChild(rsvpBtn);
          }

          cell.appendChild(evEl);
        }
      });

      row.appendChild(cell);

      // New row each Saturday
      if ((day + firstDay) % 7 === 0) {
        calendarTbody.appendChild(row);
        row = document.createElement("tr");
      }
    }

    // Append leftover row
    if (row.children.length > 0) calendarTbody.appendChild(row);
  }

  // Initial render
  generateCalendar();

  // Month nav
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

  // Admin: add event
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

      if (!isValidISODate(start) || !isValidISODate(end)) {
        alert("Please use valid dates.");
        return;
      }

      const startDate = new Date(start);
      const endDate = new Date(end);

      if (startDate > endDate) {
        alert("Start date cannot be after end date.");
        return;
      }

      events.push({
        title,
        start,
        end,
        rsvps: [],
      });

      saveEvents();

      // Clear inputs
      if (titleEl) titleEl.value = "";
      if (startEl) startEl.value = "";
      if (endEl) endEl.value = "";

      generateCalendar(currentMonth, currentYear);
      alert(`Event "${title}" added successfully!`);
    });
  }
});