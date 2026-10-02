import { useSyncExternalStore } from "react";

// Real session history, saved in this browser only (localStorage).
// Demo/sample sessions are never written here.
const STORAGE_KEY = "aquagrip.sessions.v1";
const listeners = new Set();
let cache = null;

const isValidSession = (s) =>
  s &&
  Number.isFinite(s.timestamp) &&
  Number.isFinite(s.peakForcePsi) &&
  Number.isFinite(s.avgForcePsi) &&
  Number.isFinite(s.reps) &&
  Number.isFinite(s.rotationRangeDeg) &&
  Number.isFinite(s.durationS);

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter(isValidSession).sort((a, b) => a.timestamp - b.timestamp)
      : [];
  } catch {
    return [];
  }
}

function write(sessions) {
  cache = sessions;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Storage blocked or full -- keep the in-memory copy for this visit.
  }
  listeners.forEach((fn) => fn());
}

function getSnapshot() {
  if (cache === null) cache = read();
  return cache;
}

function subscribe(fn) {
  listeners.add(fn);
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) {
      cache = read();
      fn();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

// Games call this when a session ends. `session` needs: timestamp,
// durationS, peakForcePsi, avgForcePsi, reps, rotationRangeDeg.
export function addSession(session) {
  const current = getSnapshot();
  const id = current.reduce((max, s) => Math.max(max, s.id ?? 0), 0) + 1;
  write([...current, { ...session, id }].sort((a, b) => a.timestamp - b.timestamp));
}

export function clearSessions() {
  write([]);
}

export function useSavedSessions() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
