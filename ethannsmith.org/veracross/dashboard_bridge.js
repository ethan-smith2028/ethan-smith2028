// Runs on your custom Veracross Grade Portal webpage
(function () {
  const api = typeof browser !== "undefined" ? browser : chrome;

  function pushDataToPage() {
    api.storage.local.get(["courses", "updates", "lastSynced"], (data) => {
      window.postMessage({
        type: "VERACROSS_SYNC_DATA",
        payload: data
      }, "*");
    });
  }

  // Push data as soon as the dashboard loads
  pushDataToPage();

  // Listen for "I Acknowledge" clicks from the dashboard
  window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data) return;

    if (event.data.type === "ACKNOWLEDGE_UPDATE") {
      const updateId = event.data.id;
      api.storage.local.get(["updates"], (data) => {
        const updatedList = (data.updates || []).map((u) =>
          u.id === updateId ? { ...u, acknowledged: true } : u
        );
        api.storage.local.set({ updates: updatedList }, pushDataToPage);
      });
    }
  });
})();