document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("winForm");
  const winText = document.getElementById("winText");
  const spotlight = document.getElementById("spotlightPermission");
  const success = document.getElementById("winSuccess");

  if (!form) return;

  const KEY = "kac_wins";

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const win = winText.value.trim();
  if (!win) return;

  const wins = JSON.parse(localStorage.getItem(KEY) || "[]");

  wins.push({
    text: win,
    spotlight: spotlight.checked,
    date: new Date().toISOString()
  });

  localStorage.setItem(KEY, JSON.stringify(wins));

  // Redirect instead of inline message
  window.location.href = "win-success.html";
});

});