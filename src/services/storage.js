const EVENTS_KEY = "mirage_events";
const HISTORY_KEY = "mirage_history";

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function getEvents() {
  return readList(EVENTS_KEY);
}

export function saveEvent(event) {
  const events = [event, ...getEvents()];
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  return events;
}

export function getHistory() {
  return readList(HISTORY_KEY);
}

export function recordActivity(action) {
  const history = getHistory();
  history.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    date: new Date().toISOString()
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 200)));
  return getHistory();
}
