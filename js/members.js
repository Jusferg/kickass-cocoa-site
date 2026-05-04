/****************************************************
 * members.js — Members pages only
 * - Auth guard via Netlify Identity
 * - Welcome text
 * - “Step Into The Room” statement save/clear
 * - Spotlight from wins
 * - Accountability tracker (weekly reset + streak)
 ****************************************************/

/****************************************************
 * members.js — Members pages only
 * Netlify Identity auth guard + dashboard behavior
 ****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("members-page")) return;

  if (!window.netlifyIdentity) {
    window.location.href = "login.html";
    return;
  }

  window.netlifyIdentity.on("init", (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    document.body.classList.remove("auth-checking");

    const meta = user.user_metadata || {};
    const displayName =
      meta.full_name ||
      [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim() ||
      user.email ||
      "Member";

    const memberName = document.getElementById("memberName");
    const memberEmail = document.getElementById("memberEmail");
    const memberRole = document.getElementById("memberRole");
    const welcomeEl = document.getElementById("welcomeUser");

    if (memberName) memberName.textContent = displayName;
    if (memberEmail) memberEmail.textContent = user.email || "—";
    if (memberRole) memberRole.textContent = "Member";

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

    function bestNameFromUser() {
      if (meta.first_name) return titleCaseWords(meta.first_name);
      if (meta.full_name) return titleCaseWords(meta.full_name.split(" ")[0]);

      if (user.email) {
        const local = user.email.split("@")[0];
        return titleCaseWords(local.split(/[._-]+/)[0]);
      }

      return "";
    }

    if (welcomeEl) {
      const greeting = getGreeting();
      const name = bestNameFromUser();
      welcomeEl.textContent = name ? `${greeting}, ${name}` : greeting;
    }

    initStatement();
    initSpotlight();
    initTracker();
    initPodcast();
  });

  window.netlifyIdentity.init();
});

/* ----------------------------
   Step Into The Room Statement
---------------------------- */
function initStatement() {
  const statementEl = document.getElementById("memberStatement");
  const saveBtn = document.getElementById("saveStatement");
  const clearBtn = document.getElementById("clearStatement");
  const statusEl = document.getElementById("statementStatus");

  if (!statementEl || !saveBtn || !clearBtn) return;

  const KEY = "kac_member_statement";
  const saved = localStorage.getItem(KEY);

  if (saved) {
    statementEl.value = saved;
    if (statusEl) statusEl.textContent = "Saved. We see you.";
  }

  saveBtn.addEventListener("click", () => {
    const text = statementEl.value.trim();

    if (!text) {
      if (statusEl) statusEl.textContent = "Write something real — then hit 'I'm Here.'";
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
function initSpotlight() {
  const spotlightContainer = document.getElementById("spotlightContent");
  if (!spotlightContainer) return;

  const wins = JSON.parse(localStorage.getItem("kac_wins") || "[]");
  const spotlightWins = wins.filter((w) => w.spotlight);

  if (spotlightWins.length > 0) {
    const latest = spotlightWins[spotlightWins.length - 1];
    spotlightContainer.innerHTML = `
      <blockquote>"${latest.text}"</blockquote>
      <p>Shared by a sister in the community</p>
    `;
  }
}

/* ----------------------------
   Accountability Tracker
---------------------------- */
function initTracker() {
  const trackerFill = document.getElementById("trackerFill");
  const trackerPct = document.getElementById("trackerPct");
  const trackerStreakEl = document.getElementById("trackerStreak");
  const trackerReset = document.getElementById("trackerReset");
  const trackerNote = document.getElementById("trackerNote");
  const checks = document.querySelectorAll('.tracker-item input[type="checkbox"]');

  if (!checks.length || !trackerFill || !trackerPct) return;

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
    const d = new Date(`${iso}T00:00:00`);
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

    if (!store.week || store.week !== currentMonday) {
      const lastCompleted = store.lastCompletedWeek || null;
      const prevWasCompleted = lastCompleted === previousMonday;
      const nextStreak = prevWasCompleted ? Number(store.streak || 0) : 0;

      writeStore({
        week: currentMonday,
        progress: {},
        streak: nextStreak,
        lastCompletedWeek: lastCompleted
      });

      checks.forEach((cb) => (cb.checked = false));
      renderUI(false);
      return;
    }

    checks.forEach((cb) => {
      const id = cb.dataset.track;
      cb.checked = Boolean(store.progress?.[id]);
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
      lastCompletedWeek: store.lastCompletedWeek || null
    };

    const { total, done } = calcPct();
    const completedThisWeek = done === total;

    if (completedThisWeek && updated.lastCompletedWeek !== currentMonday) {
      const previousMonday = addDays(currentMonday, -7);

      updated.streak =
        updated.lastCompletedWeek === previousMonday ? updated.streak + 1 : 1;

      updated.lastCompletedWeek = currentMonday;

      if (trackerNote) {
        trackerNote.textContent = `Week completed. Streak: ${updated.streak}`;
      }
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
        lastCompletedWeek: store.lastCompletedWeek || null
      });

      checks.forEach((cb) => (cb.checked = false));
      renderUI(true);

      if (trackerNote) trackerNote.textContent = "Reset. Fresh start.";
    });
  }

  loadState();
}

/* ----------------------------
   Podcast of the Week
---------------------------- */
function initPodcast() {
  const podcastTitle = document.getElementById("podcastTitle");
  const podcastMeta = document.getElementById("podcastMeta");
  const podcastDescription = document.getElementById("podcastDescription");
  const podcastLink = document.getElementById("podcastLink");
  const podcastImage = document.getElementById("podcastImage");

  if (!podcastTitle || !podcastMeta || !podcastDescription || !podcastLink || !podcastImage) {
    return;
  }

  const podcasts = [
    {
      title: "Side Hustle Pro",
      meta: "Entrepreneurship • Career Growth",
      description: "Stories and strategies from Black women entrepreneurs building profitable businesses and bold careers.",
      link: "https://podcasts.apple.com/us/podcast/side-hustle-pro/id1183877070",
      image: "images/podcasts/side-hustle-pro.jpg"
    },
    {
      title: "Balanced Black Girl",
      meta: "Wellness • Mindset",
      description: "Thoughtful conversations on personal growth, mental wellness, and living with intention.",
      link: "https://podcasts.apple.com/us/podcast/balanced-black-girl/id1485657560",
      image: "images/podcasts/balanced-black-girl.jpg"
    },
    {
      title: "Brown Ambition",
      meta: "Money • Career",
      description: "Honest conversations about finances, career growth, and building wealth unapologetically.",
      link: "https://podcasts.apple.com/us/podcast/brown-ambition/id1050292155",
      image: "images/podcasts/brown-ambition.jpg"
    },
    {
      title: "Slay Girl Slay",
      meta: "Confidence • Empowerment",
      description: "Encouraging conversations about healing, growth, and becoming the most confident version of yourself.",
      link: "https://podcasts.apple.com/us/podcast/slay-girl-slay/id1222580011",
      image: "images/podcasts/slay-girl-slay.jpg"
    },
    {
      title: "Therapy for Black Girls",
      meta: "Mental Health • Healing",
      description: "A space dedicated to mental health, boundaries, relationships, and emotional wellness.",
      link: "https://podcasts.apple.com/us/podcast/therapy-for-black-girls/id1339882526",
      image: "images/podcasts/therapy-for-black-girls.jpg"
    }
  ];

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - start) / 86400000);
  const weekNumber = Math.floor(days / 7);
  const featured = podcasts[weekNumber % podcasts.length];

  podcastTitle.textContent = featured.title;
  podcastMeta.textContent = featured.meta;
  podcastDescription.textContent = featured.description;
  podcastLink.href = featured.link;
  podcastImage.src = featured.image;
  podcastImage.alt = featured.title;
}