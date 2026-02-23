/****************************************************
 * SCRIPT.JS - Kick A$$ Cocoa
 * Unified JS for all pages
 ****************************************************/
console.log("Carousel JS loaded");

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

document.addEventListener("DOMContentLoaded", () => {
  // Hamburger toggle
  const menuToggleBtn = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (menuToggleBtn && navMenu) {
    menuToggleBtn.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });
  }

  // Mobile dropdown toggle
  const dropdownToggles = document.querySelectorAll(".nav-dropdown > a");

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        toggle.parentElement.classList.toggle("active");
      }
    });
  });

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    });
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

/* ===============================
   CONTACT FORM SUCCESS MESSAGE
================================ */

const contactForm = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

if (contactForm && formSuccess) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Simulate successful submission
    contactForm.reset();

    // Show success message
    formSuccess.classList.add("show");
  });
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


document.addEventListener("DOMContentLoaded", () => {
  console.log("Carousel JS loaded");

  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slider-dots .dot");
  const hero = document.querySelector(".hero-slider");

  // Rotating headline word
  const words = ["Leadership", "Growth", "Community", "Action"];
  const rotatingWord = document.querySelector(".rotating-word");

  if (!slides.length) {
    console.warn("No slides found");
    return;
  }

  let currentIndex = 0;
  let carouselInterval;

  function showSlide(index) {
  slides.forEach((slide) => slide.classList.remove("active"));
  slides[index].classList.add("active");

  if (dots.length) {
    dots.forEach((dot) => dot.classList.remove("active"));
    if (dots[index]) dots[index].classList.add("active");
  }

  // Rotating word: update immediately, animate via class
  if (rotatingWord) {
    rotatingWord.classList.add("is-fading");
    rotatingWord.textContent = words[index] || words[0];
    requestAnimationFrame(() => {
      rotatingWord.classList.remove("is-fading");
    });
  }
}

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  function startCarousel() {
    stopCarousel();
    carouselInterval = setInterval(nextSlide, 4000);
  }

  function stopCarousel() {
    if (carouselInterval) clearInterval(carouselInterval);
  }

  // Initialize
  showSlide(currentIndex);
  startCarousel();

  // Pause on hover (desktop)
  if (hero) {
    hero.addEventListener("mouseenter", stopCarousel);
    hero.addEventListener("mouseleave", startCarousel);
  }

  // Clickable dots (optional)
  if (dots.length) {
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentIndex = index;
        showSlide(currentIndex);
        startCarousel(); // reset timer so it feels responsive
      });
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
