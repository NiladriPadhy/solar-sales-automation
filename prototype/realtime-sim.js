(function createRealtimeSimulation() {
  const channelName = "surya-sai-sales-events";
  const storageKey = `${channelName}:latest`;
  const listeners = new Set();
  const channel = "BroadcastChannel" in window ? new BroadcastChannel(channelName) : null;

  function notify(event) {
    listeners.forEach((listener) => listener(event));
  }

  function publish(type, payload) {
    const event = {
      eventId: crypto.randomUUID?.() || `evt_${Date.now()}`,
      type,
      payload,
      occurredAt: new Date().toISOString(),
    };
    channel?.postMessage(event);
    try {
      localStorage.setItem(storageKey, JSON.stringify(event));
    } catch {
      // The current page still receives its direct UI update when storage is unavailable.
    }
    return event;
  }

  channel?.addEventListener("message", ({ data }) => notify(data));
  window.addEventListener("storage", (storageEvent) => {
    if (storageEvent.key !== storageKey || !storageEvent.newValue) return;
    try {
      notify(JSON.parse(storageEvent.newValue));
    } catch {
      // Ignore malformed simulation events.
    }
  });

  window.salesRealtime = {
    publish,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
})();
