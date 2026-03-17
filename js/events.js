/****************************************************
 * events.js — Events page only
 * - Calendar render
 * - Admin can add/edit/delete events
 * - Members can RSVP
 * - Persists in localStorage
 * - Click event to show details below calendar
 ****************************************************/

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("loggedInUser") || "null");
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const calendarTbody = document.querySelector("#calendar tbody");
  const monthYearEl = document.getElementById("monthYear");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const adminForm = document.getElementById("adminForm");
  const addEventBtn = document.getElementById("addEventBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  if (!calendarTbody || !monthYearEl || !prevMonthBtn || !nextMonthBtn) return;

  let events = [];
  try {
    events = JSON.parse(localStorage.getItem("events")) || [];
    if (!Array.isArray(events)) events = [];
  } catch {
    events = [];
  }

  let editingEventId = null;

  const user = getLoggedInUser();
  const userIsAdmin = user?.role === "admin";
  const userIsMember = user?.role === "member";

  if (userIsAdmin && adminForm) {
    adminForm.classList.remove("hidden");
  }

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

  function formatPrettyName(email) {
    const local = (email || "").split("@")[0];
    const first = local.split(/[._-]+/)[0] || "";
    return first.charAt(0).toUpperCase() + first.slice(1);
  }

  function resetEventForm() {
    const titleEl = document.getElementById("eventTitle");
    const startEl = document.getElementById("eventStart");
    const endEl = document.getElementById("eventEnd");

    if (titleEl) titleEl.value = "";
    if (startEl) startEl.value = "";
    if (endEl) endEl.value = "";

    editingEventId = null;

    if (addEventBtn) addEventBtn.textContent = "Add Event";
    if (cancelEditBtn) cancelEditBtn.classList.add("hidden");
  }

  function showEventDetails(ev) {
    const card = document.getElementById("eventDetailsCard");
    const title = document.getElementById("detailTitle");
    const date = document.getElementById("detailDate");
    const count = document.getElementById("detailCount");
    const list = document.getElementById("detailRsvpList");

    if (!card || !title || !date || !count || !list) return;

    ev.rsvps = Array.isArray(ev.rsvps) ? ev.rsvps : [];

    title.textContent = ev.title;
    date.textContent = ev.start === ev.end ? ev.start : `${ev.start} to ${ev.end}`;
    count.textContent = ev.rsvps.length;

    list.innerHTML = "";

    if (ev.rsvps.length === 0) {
      const empty = document.createElement("div");
      empty.className = "detail-rsvp-name";
      empty.textContent = "No RSVPs yet.";
      list.appendChild(empty);
    } else {
      ev.rsvps.forEach((email) => {
        const item = document.createElement("div");
        item.className = "detail-rsvp-name";
        item.textContent = userIsAdmin ? email : formatPrettyName(email);
        list.appendChild(item);
      });
    }

    card.style.display = "block";
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

    for (let i = 0; i < firstDay; i++) {
      row.appendChild(document.createElement("td"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("td");
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const today = new Date();
      if (
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year
      ) {
        cell.classList.add("today");
      }

      cell.innerHTML = `<strong>${day}</strong>`;

      events.forEach((ev) => {
        if (!ev || !ev.title || !ev.start || !ev.end) return;
        if (!isValidISODate(ev.start) || !isValidISODate(ev.end)) return;

        if (dateStr >= ev.start && dateStr <= ev.end) {
          cell.classList.add("has-event");

          const evEl = document.createElement("div");
          evEl.classList.add("event");

          const titleEl = document.createElement("div");
          titleEl.textContent = ev.title;
          evEl.appendChild(titleEl);

          ev.rsvps = Array.isArray(ev.rsvps) ? ev.rsvps : [];

          const rsvpCount = document.createElement("span");
          rsvpCount.classList.add("rsvp-count");
          rsvpCount.textContent = `${ev.rsvps.length} going`;
          evEl.appendChild(rsvpCount);

          evEl.addEventListener("click", (e) => {
            if (e.target.closest("button")) return;
            showEventDetails(ev);
          });

          if (userIsAdmin) {
            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.classList.add("rsvp-btn");
            editBtn.textContent = "Edit";

            editBtn.addEventListener("click", (e) => {
              e.stopPropagation();

              const titleInput = document.getElementById("eventTitle");
              const startInput = document.getElementById("eventStart");
              const endInput = document.getElementById("eventEnd");

              if (!titleInput || !startInput || !endInput) return;

              titleInput.value = ev.title;
              startInput.value = ev.start;
              endInput.value = ev.end;

              editingEventId = ev.id;

              if (addEventBtn) addEventBtn.textContent = "Update Event";
              if (cancelEditBtn) cancelEditBtn.classList.remove("hidden");
            });

            evEl.appendChild(editBtn);

            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.classList.add("rsvp-btn");
            delBtn.style.backgroundColor = "#c0392b";
            delBtn.textContent = "Delete";

            delBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              events = events.filter((e2) => e2.id !== ev.id);
              saveEvents();

              if (editingEventId === ev.id) {
                resetEventForm();
              }

              generateCalendar(currentMonth, currentYear);
            });

            evEl.appendChild(delBtn);
          }

          if (userIsMember && user?.email) {
            const rsvpBtn = document.createElement("button");
            rsvpBtn.type = "button";
            rsvpBtn.classList.add("rsvp-btn");

            const hasRSVPed = ev.rsvps.includes(user.email);
            rsvpBtn.textContent = hasRSVPed ? "RSVPed" : "RSVP";
            rsvpBtn.disabled = hasRSVPed;

            const todayISO = isoToday();
            if (dateStr < todayISO) {
              rsvpBtn.disabled = true;
              rsvpBtn.textContent = "Closed";
            }

            rsvpBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              if (!user?.email) return;

              if (!ev.rsvps.includes(user.email)) {
                ev.rsvps.push(user.email);
                saveEvents();
                generateCalendar(currentMonth, currentYear);
                showEventDetails(ev);
                alert(`You RSVP'd for ${ev.title} on ${dateStr}`);
              }
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

    if (row.children.length > 0) {
      calendarTbody.appendChild(row);
    }
  }

  generateCalendar();

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

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
      resetEventForm();
    });
  }

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

      if (editingEventId) {
        events = events.map((ev) =>
          ev.id === editingEventId
            ? { ...ev, title, start, end }
            : ev
        );

        alert(`Event "${title}" updated successfully!`);
      } else {
        events.push({
          id: Date.now(),
          title,
          start,
          end,
          rsvps: [],
        });

        alert(`Event "${title}" added successfully!`);
      }

      saveEvents();
      resetEventForm();
      generateCalendar(currentMonth, currentYear);
    });
  }
});