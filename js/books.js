/****************************************************
 * books.js — Books page only
 * - Star ratings saved in localStorage
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const ratings = document.querySelectorAll(".rating");
  if (!ratings.length) return;

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

  ratings.forEach((ratingEl) => {
    const bookId = ratingEl.dataset.book;
    const stars = ratingEl.querySelectorAll(".star");
    const text = ratingEl.querySelector(".rating-text");
    if (!bookId || !stars.length || !text) return;

    const key = `rating-${bookId}`;

    let data = JSON.parse(localStorage.getItem(key)) || { total: 0, count: 0 };
    updateDisplay(data, stars, text);

    stars.forEach((star) => {
      star.addEventListener("click", () => {
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