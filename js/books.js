/****************************************************
 * books.js — Books page only
 * - Star ratings saved in localStorage
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const ratings = document.querySelectorAll(".rating");
  if (!ratings.length) return;

  function safeRead(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function updateDisplay(data, stars, text) {

  if (data.count === 0) {
    text.textContent = "(No community ratings yet)";
    stars.forEach(s => s.classList.remove("active"));
    return;
  }

  const avg = (data.total / data.count).toFixed(1);

  text.textContent = `★ ${avg} (${data.count} community ratings)`;

  stars.forEach(star => {
    star.classList.toggle(
      "active",
      Number(star.dataset.value) <= Math.round(avg)
    );
  });

}

  ratings.forEach((ratingEl) => {
    const bookId = ratingEl.dataset.book;
    const stars = ratingEl.querySelectorAll(".star");
    const text = ratingEl.querySelector(".rating-text");
    if (!bookId || !stars.length || !text) return;

    const key = `rating-${bookId}`;
    let data = safeRead(key) || { total: 0, count: 0 };

    updateDisplay(data, stars, text);

    stars.forEach((star) => {
      star.addEventListener("click", (e) => {
        e.preventDefault();

        const value = Number(star.dataset.value);
        if (!value) return;

        data.total += value;
        data.count += 1;

        localStorage.setItem(key, JSON.stringify(data));
        updateDisplay(data, stars, text);
      });
    });
  });
});

// ---- "More" toggle for Why We Recommend ----
document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".rec-toggle");
  if (!toggles.length) return;

  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const text = document.getElementById(targetId);

      if (!text) {
        console.warn("No element found for data-target:", targetId);
        return;
      }

      const isCollapsed = text.classList.contains("rec-collapsed");

      if (isCollapsed) {
        text.classList.remove("rec-collapsed");
        btn.textContent = "Less";
        btn.setAttribute("aria-expanded", "true");
      } else {
        text.classList.add("rec-collapsed");
        btn.textContent = "More";
        btn.setAttribute("aria-expanded", "false");
      }
    });
  });
});

/* ===============================
   COMMUNITY FAVORITE BOOK
================================ */

const bookMeta = {
  "emotional-intelligence": {
    title: "Emotional Intelligence",
    author: "Daniel Goleman"
  },
  "talk-like-ted": {
    title: "Talk Like TED",
    author: "Carmine Gallo"
  },
  "storytelling": {
    title: "Unleash the Power of Storytelling",
    author: "Rob Biesenbach"
  },
  "articulate-executive": {
    title: "The Articulate Executive",
    author: "Granville N. Toogood"
  },
  "crucial-conversations": {
    title: "Crucial Conversations",
    author: "Kerry Patterson"
  }
};

function getCommunityFavorite(){

  let bestBook = null;
  let bestRating = 0;

  Object.keys(bookMeta).forEach(bookId => {

    const key = `rating-${bookId}`;
    const data = JSON.parse(localStorage.getItem(key));

    if(!data || data.count === 0) return;

    const avg = data.total / data.count;

    if(avg > bestRating){
      bestRating = avg;
      bestBook = {
        id: bookId,
        avg,
        count: data.count
      };
    }

  });

  if(!bestBook) return;

  const section = document.getElementById("communityFavorite");
  const title = document.getElementById("favoriteTitle");
  const author = document.getElementById("favoriteAuthor");
  const rating = document.getElementById("favoriteRating");
  const count = document.getElementById("favoriteCount");

  const meta = bookMeta[bestBook.id];

  title.textContent = meta.title;
  author.textContent = `by ${meta.author}`;
  rating.textContent = bestBook.avg.toFixed(1);
  count.textContent = `(${bestBook.count} ratings)`;

  section.style.display = "block";
}

getCommunityFavorite();

// Expand / Collapse recommendation text

const moreButtons = document.querySelectorAll(".read-more-btn");

moreButtons.forEach(btn => {

  btn.addEventListener("click", () => {

    const card = btn.closest(".recommendation");

    card.classList.toggle("expanded");

    if(card.classList.contains("expanded")){
      btn.textContent = "Show Less";
    } else {
      btn.textContent = "Read More";
    }

  });

});