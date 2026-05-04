document.addEventListener("DOMContentLoaded", () => {
  const toolkitKey = window.KACToolkitKey;
  if (!toolkitKey) return;

  const checklist = document.getElementById("toolkitChecklist");
  const progressFill = document.getElementById("toolkitProgressFill");
  const progressText = document.getElementById("toolkitProgressText");
  const journal = document.getElementById("toolkitJournal");

  const storageKeys = {
    checks: `kac-toolkit-${toolkitKey}-checks`,
    journal: `kac-toolkit-${toolkitKey}-journal`
  };

  const checkboxes = checklist
    ? Array.from(checklist.querySelectorAll('input[type="checkbox"]'))
    : [];

  function loadChecklist() {
    const saved = localStorage.getItem(storageKeys.checks);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      checkboxes.forEach((checkbox, index) => {
        checkbox.checked = Boolean(parsed[index]);
      });
    } catch (error) {
      console.warn("Could not load toolkit checklist progress.", error);
    }
  }

  function saveChecklist() {
    const values = checkboxes.map((checkbox) => checkbox.checked);
    localStorage.setItem(storageKeys.checks, JSON.stringify(values));
  }

  function loadJournal() {
    if (!journal) return;
    const saved = localStorage.getItem(storageKeys.journal);
    if (saved !== null) {
      journal.value = saved;
    }
  }

  function saveJournal() {
    if (!journal) return;
    localStorage.setItem(storageKeys.journal, journal.value);
  }

  function updateProgress() {
    const totalTasks = checkboxes.length;
    const checkedTasks = checkboxes.filter((checkbox) => checkbox.checked).length;

    let percent = 0;
    if (totalTasks > 0) {
      percent = Math.round((checkedTasks / totalTasks) * 100);
    }

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (progressText) {
      progressText.textContent = `Progress ${percent}%`;
    }
  }

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      saveChecklist();
      updateProgress();
    });
  });

  if (journal) {
    journal.addEventListener("input", saveJournal);
  }

  loadChecklist();
  loadJournal();
  updateProgress();
});

/* ----------------------------
   Toolkit Hub Status
---------------------------- */
function initToolkitHubStatus() {
  const statusEls = document.querySelectorAll("[data-toolkit-status]");
  if (!statusEls.length) return;

  statusEls.forEach((el) => {
    const key = el.dataset.toolkitStatus;

    const raw = localStorage.getItem(`kac-toolkit-${key}-checks`);
    if (!raw) {
      el.textContent = "Not Started";
      el.className = "toolkit-status status-not-started";
      return;
    }

    let checks = [];
    try {
      checks = JSON.parse(raw);
    } catch {
      el.textContent = "Not Started";
      el.className = "toolkit-status status-not-started";
      return;
    }

    const total = checks.length;
    const completed = checks.filter(Boolean).length;

    if (completed === 0) {
      el.textContent = "Not Started";
      el.className = "toolkit-status status-not-started";
    } else if (completed < total) {
      el.textContent = "In Progress";
      el.className = "toolkit-status status-in-progress";
    } else {
      el.textContent = "Complete";
      el.className = "toolkit-status status-complete";
    }
  });
}

// Run it
initToolkitHubStatus();