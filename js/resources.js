/****************************************************
 * resources.js — Resources page only
 * - Live search filter
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const cardsContainer = document.getElementById("resourceCards");

  if (!searchInput || !cardsContainer) return;

  const cards = cardsContainer.querySelectorAll(".card");

  searchInput.addEventListener("keyup", () => {
    const term = searchInput.value.toLowerCase();

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(term) ? "block" : "none";
    });
  });
});