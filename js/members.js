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

    // -------------------------------
  // Auto-populate Spotlight from Wins
  // -------------------------------
  const spotlightContainer = document.getElementById("spotlightContent");

  if (spotlightContainer) {
    const wins = JSON.parse(localStorage.getItem("kac_wins") || "[]");

    // Filter wins marked for spotlight
    const spotlightWins = wins.filter(w => w.spotlight);

    if (spotlightWins.length > 0) {
      // Get most recent spotlight win
      const latest = spotlightWins[spotlightWins.length - 1];

      spotlightContainer.innerHTML = `
        <p class="spotlight-win">"${latest.text}"</p>
        <p class="spotlight-meta">Shared by a sister in the community</p>
      `;
    }
  }

});

  // -------------------------------
  // Accountability Tracker (Resets Every Monday + Weekly Streak)
  // -------------------------------
  const trackerFill = document.getElementById("trackerFill");
  const trackerPct = document.getElementById("trackerPct");
  const trackerStreakEl = document.getElementById("trackerStreak");
  const trackerReset = document.getElementById("trackerReset");
  const trackerNote = document.getElementById("trackerNote");
  const checks = document.querySelectorAll('.tracker-item input[type="checkbox"]');

  if (checks.length && trackerFill && trackerPct) {
    const KEY = "kac_tracker_v3";

    const isoDate = (d) => new Date(d).toISOString().split("T")[0];

    function getMonday(date) {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      d.setHours(0, 0, 0, 0);
      return isoDate(d);
    }

    function addDays(iso, days) {
      const d = new Date(iso + "T00:00:00");
      d.setDate(d.getDate() + days);
      return isoDate(d);
    }

    function readStore() {
      try {
        return JSON.parse(localStorage.getItem(KEY) || "{}");
      } catch {
        return {};
      }
    }

    function writeStore(data) {
      localStorage.setItem(KEY, JSON.stringify(data));
    }

    function calcPct() {
      const total = checks.length;
      const done = Array.from(checks).filter(c => c.checked).length;
      return { total, done, pct: Math.round((done / total) * 100) };
    }

    function renderUI(showSaved = true) {
      const { total, done, pct } = calcPct();
      trackerFill.style.width = `${pct}%`;
      trackerPct.textContent = `${pct}%`;

      const store = readStore();
      const streak = Number(store.streak || 0);
      if (trackerStreakEl) trackerStreakEl.textContent = String(streak);

      if (trackerNote && showSaved) {
        trackerNote.textContent =
          done === total ? "All done. That’s how you lead. ✅" : "Saved automatically.";
      }
    }

    function loadState() {
      const store = readStore();
      const currentMonday = getMonday(new Date());
      const previousMonday = addDays(currentMonday, -7);

      // If week changed, reset progress; handle streak continuity
      if (!store.week || store.week !== currentMonday) {
        const lastCompleted = store.lastCompletedWeek || null;
        const prevWasCompleted = lastCompleted === previousMonday;

        // If last completed week isn't immediately previous week, streak breaks
        const nextStreak = prevWasCompleted ? Number(store.streak || 0) : 0;

        writeStore({
          week: currentMonday,
          progress: {},
          streak: nextStreak,
          lastCompletedWeek: lastCompleted
        });

        checks.forEach(cb => (cb.checked = false));
        renderUI(false);
        return;
      }

      // Load saved progress for this week
      checks.forEach(cb => {
        const id = cb.dataset.track;
        cb.checked = !!store.progress?.[id];
      });

      renderUI(false);
    }

    function saveState() {
      const store = readStore();
      const currentMonday = getMonday(new Date());

      const progress = {};
      checks.forEach(cb => {
        progress[cb.dataset.track] = cb.checked;
      });

      // Save progress
      const updated = {
        week: currentMonday,
        progress,
        streak: Number(store.streak || 0),
        lastCompletedWeek: store.lastCompletedWeek || null
      };

      // If just completed all tasks this week AND not already credited, award streak
      const { total, done } = calcPct();
      const completedThisWeek = done === total;

      if (completedThisWeek && updated.lastCompletedWeek !== currentMonday) {
        const previousMonday = addDays(currentMonday, -7);

        // If last completed was previous week, increment; otherwise start at 1
        updated.streak = (updated.lastCompletedWeek === previousMonday)
          ? (updated.streak + 1)
          : 1;

        updated.lastCompletedWeek = currentMonday;

        if (trackerNote) trackerNote.textContent = `Week completed. Streak: ${updated.streak} 🔥`;
      }

      writeStore(updated);
    }

    // Wire up events
    checks.forEach(cb => {
      cb.addEventListener("change", () => {
        saveState();
        renderUI(true);
      });
    });

    if (trackerReset) {
      trackerReset.addEventListener("click", () => {
        const currentMonday = getMonday(new Date());
        const store = readStore();

        // Reset progress for this week, keep streak + lastCompletedWeek
        writeStore({
          week: currentMonday,
          progress: {},
          streak: Number(store.streak || 0),
          lastCompletedWeek: store.lastCompletedWeek || null
        });

        checks.forEach(cb => (cb.checked = false));
        renderUI(true);
        if (trackerNote) trackerNote.textContent = "Reset. Fresh start.";
      });
    }

    loadState();
  }