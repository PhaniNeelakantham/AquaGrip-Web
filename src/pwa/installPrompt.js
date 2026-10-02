import { useSyncExternalStore } from "react";

// Chrome/Edge fire `beforeinstallprompt` once, often before any screen has
// mounted, so it's captured at startup and handed to the UI when asked.
let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

const isInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault(); // show our own button instead of the browser's mini-bar
  deferredPrompt = e;
  notify();
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  notify();
});

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

// True when the browser is ready to install the app and it isn't installed yet.
export function useCanInstall() {
  return useSyncExternalStore(subscribe, () => deferredPrompt !== null && !isInstalled());
}

export async function promptInstall() {
  if (!deferredPrompt) return false;
  const prompt = deferredPrompt;
  deferredPrompt = null;
  notify();
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  return outcome === "accepted";
}
