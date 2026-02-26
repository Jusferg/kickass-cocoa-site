/****************************************************
 * members.js — Members Area only
 * - Auth guard (simple localStorage user)
 * - Optional welcome text
 * - “Step Into The Room” statement (save/clear, persists until logout)
 ****************************************************/

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("loggedInUser"));
  } catch (err) {
    return null;
  }
}

function requireAuth() {
  const user = getLoggedInUser();
  if (!user) window.location.href = "login.html";
  return user;
}

document.addEventListener("DOMContentLoaded", () => {
  // Only run on members pages
  if (!document.body.classList.contains("members-page")) return;

  const user = requireAuth();

  // Optional welcome (only if you have an element with id="welcomeUser")
  const welcomeEl = document.getElementById("welcomeUser");
  if (welcomeEl && user?.email) {
    welcomeEl.textContent = `Welcome, ${user.email}`;
  }

  // Member statement (persist until logout via core.js)
  const statementEl = document.getElementById("memberStatement");
  const saveBtn = document.getElementById("saveStatement");
  const clearBtn = document.getElementById("clearStatement");
  const statusEl = document.getElementById("statementStatus");

  // If the statement UI isn't on this page yet, do nothing.
  if (!statementEl || !saveBtn || !clearBtn) return;

  const KEY = "kac_member_statement";

  // Load saved statement
  const saved = localStorage.getItem(KEY);
  if (saved) {
    statementEl.value = saved;
    if (statusEl) statusEl.textContent = "Saved. We see you.";
  }

  // Save statement
  saveBtn.addEventListener("click", () => {
    const text = statementEl.value.trim();
    if (!text) {
      if (statusEl) statusEl.textContent = 'Write something real — then hit “I’m Here.”';
      return;
    }
    localStorage.setItem(KEY, text);
    if (statusEl) statusEl.textContent = "Saved. We see you.";
  });

  // Clear statement
  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(KEY);
    statementEl.value = "";
    if (statusEl) statusEl.textContent = "Cleared.";
  });
});