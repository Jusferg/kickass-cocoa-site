// Toggle mobile menu
function toggleMenu() {
  const publicNav = document.getElementById("publicNav");
  const memberNav = document.getElementById("memberNav");

  if (publicNav) publicNav.classList.toggle("active");
  if (memberNav) memberNav.classList.toggle("active");
}

// Logout function
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    });
  }
});

// Auth guard for member pages
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("memberNav")) { // Only for member pages
    const authUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!authUser) {
      window.location.href = "login.html";
    }
  }
});

// Mobile menu toggle
function toggleMenu() {
  const publicNav = document.getElementById("publicNav");
  const memberNav = document.getElementById("memberNav");

  if (publicNav) publicNav.classList.toggle("active");
  if (memberNav) memberNav.classList.toggle("active");
}

// Logout function
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    });
  }
});

// Admin adds event
document.addEventListener("DOMContentLoaded", () => {
  const authUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!authUser) return;

  // Admin add event form
  const addEventForm = document.getElementById('addEventForm');
  if (addEventForm && authUser.role === 'admin') {
    addEventForm.addEventListener('submit', e => {
      e.preventDefault();
      const title = document.getElementById('eventTitle').value;
      const start = document.getElementById('startDate').value;
      const end = document.getElementById('endDate').value;
      const desc = document.getElementById('eventDescription').value;

      // Save event to localStorage (simplified)
      let events = JSON.parse(localStorage.getItem('events')) || [];
      events.push({ title, start, end, desc });
      localStorage.setItem('events', JSON.stringify(events));

      alert('Event added successfully!');
      addEventForm.reset();
      renderCalendar();
    });
  }

  // Render calendar function
  function renderCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    calendar.innerHTML = '';

    const events = JSON.parse(localStorage.getItem('events')) || [];
    const today = new Date().toISOString().split('T')[0];

    events.forEach((ev, index) => {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day';
      if (ev.start <= today && ev.end >= today) {
      dayDiv.classList.add('today');
    }

    dayDiv.innerHTML = `
      <strong>${ev.title}</strong><br>
      ${ev.start} - ${ev.end}<br>
      ${ev.desc}<br>
      <button class="rsvp-btn" data-event-index="${index}">RSVP</button>`;

  calendar.appendChild(dayDiv);
});

  }

  renderCalendar();
});

// RSVP functionality
document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('rsvp-btn')) {
    const index = e.target.getAttribute('data-event-index');
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const event = events[index];
    const authUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!authUser) {
      alert("You must be logged in to RSVP.");
      return;
    }

    // Store RSVP locally
    let rsvps = JSON.parse(localStorage.getItem('rsvps')) || [];
    rsvps.push({ email: authUser.email, eventTitle: event.title });
    localStorage.setItem('rsvps', JSON.stringify(rsvps));

    // Send email via EmailJS
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
      member_email: authUser.email,
      event_title: event.title,
      event_start: event.start,
      event_end: event.end
    })
    .then(() => {
      alert(`RSVP confirmed! A confirmation email was sent to ${authUser.email}`);
    }, (err) => {
      console.error('EmailJS error:', err);
      alert('RSVP saved, but email could not be sent.');
    });
  }
});



