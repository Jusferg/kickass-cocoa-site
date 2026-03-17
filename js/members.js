/****************************************************
 * members.js — Members pages only
 * - Auth guard (simple localStorage user)
 * - Welcome text
 * - “Step Into The Room” statement save/clear
 * - Spotlight from wins
 * - Accountability tracker (weekly reset + streak)
 ****************************************************/

function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("loggedInUser") || "null");
  } catch {
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

  /* ----------------------------
     Welcome text
  ---------------------------- */
  const welcomeEl = document.getElementById("welcomeUser");

  function titleCaseWords(str) {
    return (str || "")
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function bestName(u) {
  if (!u) return "";

  // 1️⃣ Use first name if it exists
  if (u.firstName) {
    return titleCaseWords(u.firstName);
  }

  // 2️⃣ Use display name and take first word
  if (u.displayName) {
    return titleCaseWords(u.displayName.split(" ")[0]);
  }

  // 3️⃣ Fallback to email before @
  if (u.email) {
    const local = u.email.split("@")[0];
    const name = local.replace(/[._-]/g, " ");
    return titleCaseWords(name.split(" ")[0]);
  }

  return "";
}

  if (welcomeEl) {
    const greeting = getGreeting();
    const name = bestName(user);
    welcomeEl.textContent = name ? `${greeting}, ${name} 👋` : `${greeting} 👋`;
  }

  /* ----------------------------
     Step Into The Room (Statement)
  ---------------------------- */
  const statementEl = document.getElementById("memberStatement");
  const saveBtn = document.getElementById("saveStatement");
  const clearBtn = document.getElementById("clearStatement");
  const statusEl = document.getElementById("statementStatus");

  if (statementEl && saveBtn && clearBtn) {
    const KEY = "kac_member_statement";

    const saved = localStorage.getItem(KEY);
    if (saved) {
      statementEl.value = saved;
      if (statusEl) statusEl.textContent = "Saved. We see you.";
    }

    saveBtn.addEventListener("click", () => {
      const text = statementEl.value.trim();
      if (!text) {
        if (statusEl) statusEl.textContent = 'Write something real — then hit “I’m Here.”';
        return;
      }
      localStorage.setItem(KEY, text);
      if (statusEl) statusEl.textContent = "Saved. We see you.";
    });

    clearBtn.addEventListener("click", () => {
      localStorage.removeItem(KEY);
      statementEl.value = "";
      if (statusEl) statusEl.textContent = "Cleared.";
    });
  }

  /* ----------------------------
     Spotlight from Wins
  ---------------------------- */
  const spotlightContainer = document.getElementById("spotlightContent");
  if (spotlightContainer) {
    const wins = JSON.parse(localStorage.getItem("kac_wins") || "[]");
    const spotlightWins = wins.filter((w) => w.spotlight);

    if (spotlightWins.length > 0) {
      const latest = spotlightWins[spotlightWins.length - 1];
      spotlightContainer.innerHTML = `
        <p class="spotlight-win">"${latest.text}"</p>
        <p class="spotlight-meta">Shared by a sister in the community</p>
      `;
    }
  }

  /* ----------------------------
     Accountability Tracker (weekly reset + streak)
  ---------------------------- */
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
      const done = Array.from(checks).filter((c) => c.checked).length;
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

      // New week? Reset progress
      if (!store.week || store.week !== currentMonday) {
        const lastCompleted = store.lastCompletedWeek || null;
        const prevWasCompleted = lastCompleted === previousMonday;
        const nextStreak = prevWasCompleted ? Number(store.streak || 0) : 0;

        writeStore({
          week: currentMonday,
          progress: {},
          streak: nextStreak,
          lastCompletedWeek: lastCompleted,
        });

        checks.forEach((cb) => (cb.checked = false));
        renderUI(false);
        return;
      }

      // Load saved progress
      checks.forEach((cb) => {
        const id = cb.dataset.track;
        cb.checked = !!store.progress?.[id];
      });

      renderUI(false);
    }

    function saveState() {
      const store = readStore();
      const currentMonday = getMonday(new Date());

      const progress = {};
      checks.forEach((cb) => {
        progress[cb.dataset.track] = cb.checked;
      });

      const updated = {
        week: currentMonday,
        progress,
        streak: Number(store.streak || 0),
        lastCompletedWeek: store.lastCompletedWeek || null,
      };

      const { total, done } = calcPct();
      const completedThisWeek = done === total;

      if (completedThisWeek && updated.lastCompletedWeek !== currentMonday) {
        const previousMonday = addDays(currentMonday, -7);

        updated.streak =
          updated.lastCompletedWeek === previousMonday ? updated.streak + 1 : 1;

        updated.lastCompletedWeek = currentMonday;

        if (trackerNote) trackerNote.textContent = `Week completed. Streak: ${updated.streak} 🔥`;
      }

      writeStore(updated);
    }

    checks.forEach((cb) => {
      cb.addEventListener("change", () => {
        saveState();
        renderUI(true);
      });
    });

    if (trackerReset) {
      trackerReset.addEventListener("click", () => {
        const currentMonday = getMonday(new Date());
        const store = readStore();

        writeStore({
          week: currentMonday,
          progress: {},
          streak: Number(store.streak || 0),
          lastCompletedWeek: store.lastCompletedWeek || null,
        });

        checks.forEach((cb) => (cb.checked = false));
        renderUI(true);
        if (trackerNote) trackerNote.textContent = "Reset. Fresh start.";
      });
    }

    loadState();
  }

  // If you update user avatar/name on account page, call:
  // window.KAC?.renderNavAvatar?.();
});