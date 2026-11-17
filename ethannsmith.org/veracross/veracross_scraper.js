// Runs on *.veracross.com
(function () {
  const api = typeof browser !== "undefined" ? browser : chrome;

  function parseGradesFromPage() {
    const courses = [];
    const grids = document.querySelectorAll(".ae-grid");

    grids.forEach((grid) => {
      const titleEl = grid.querySelector(".course-description");
      if (!titleEl) return;

      const name = titleEl.innerText.trim();
      const teacherEl = grid.querySelector(".course-teacher .vx-subtitle");
      const letterEl = grid.querySelector(".course-letter-grade");
      const numericEl = grid.querySelector(".course-numeric-grade");
      const badgeEl = grid.querySelector(".notification-badge");
      const gradeLinkEl = grid.querySelector(".course-list-grade-link");

      const teacher = teacherEl ? teacherEl.innerText.trim() : "Instructor";
      const letter = letterEl ? letterEl.innerText.trim() : "--";
      const numericText = numericEl ? numericEl.innerText.trim() : "";
      const percentage = numericText ? parseFloat(numericText.replace("%", "")) : null;
      const unreadCount = badgeEl ? parseInt(badgeEl.innerText.trim(), 10) || 0 : 0;
      const detailUrl = gradeLinkEl ? gradeLinkEl.href : titleEl.href;

      // Extract course ID from URL if available, otherwise slugify name
      const idMatch = detailUrl && detailUrl.match(/\/classes\/(\d+)/);
      const id = idMatch ? idMatch[1] : name.toLowerCase().replace(/[^a-z0-9]/g, "_");

      courses.push({
        id,
        name,
        teacher,
        letter,
        percentage,
        unreadCount,
        detailUrl
      });
    });

    return courses;
  }

  function syncGrades() {
    const currentCourses = parseGradesFromPage();
    if (currentCourses.length === 0) return;

    api.storage.local.get(["courses", "updates"], (saved) => {
      const prevCourses = saved.courses || [];
      let updates = saved.updates || [];
      const nowStr = new Date().toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      currentCourses.forEach((curr) => {
        const prev = prevCourses.find((p) => p.id === curr.id);

        // 1. First-time sync with unread updates badge on Veracross
        if (!prev && curr.unreadCount > 0) {
          updates.unshift({
            id: `upd_${curr.id}_init_${Date.now()}`,
            course: curr.name,
            title: `${curr.unreadCount} Unread Grade Update${curr.unreadCount > 1 ? "s" : ""}`,
            score: curr.percentage !== null ? `${curr.percentage}% (${curr.letter})` : curr.letter,
            impact: "Veracross",
            timestamp: nowStr,
            acknowledged: false
          });
        }
        // 2. Course percentage changed since last visit
        else if (prev && curr.percentage !== null && prev.percentage !== curr.percentage) {
          const diff = (curr.percentage - prev.percentage).toFixed(2);
          updates.unshift({
            id: `upd_${curr.id}_${Date.now()}`,
            course: curr.name,
            title: "Course Average Changed",
            score: `${curr.percentage}% (${curr.letter})`,
            impact: `${diff > 0 ? "+" : ""}${diff}%`,
            timestamp: nowStr,
            acknowledged: false
          });
        }
        // 3. New unread notification count increased
        else if (prev && curr.unreadCount > (prev.unreadCount || 0)) {
          const added = curr.unreadCount - (prev.unreadCount || 0);
          updates.unshift({
            id: `upd_${curr.id}_notif_${Date.now()}`,
            course: curr.name,
            title: `${added} New Assignment Update${added > 1 ? "s" : ""}`,
            score: curr.percentage !== null ? `${curr.percentage}% (${curr.letter})` : curr.letter,
            impact: "New",
            timestamp: nowStr,
            acknowledged: false
          });
        }
      });

      updates = updates.slice(0, 30);

      api.storage.local.set(
        {
          courses: currentCourses,
          updates: updates,
          lastSynced: new Date().toISOString()
        },
        () => {
          console.log(`[Veracross Sync] Synced ${currentCourses.length} courses.`);
        }
      );
    });
  }

  // Run after initial load and observe dynamic updates
  setTimeout(syncGrades, 1500);
})();