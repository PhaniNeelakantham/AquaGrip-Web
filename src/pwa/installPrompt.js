import { useSyncExternalStore } from "react";

// Chrome/Edge fire `beforeinstallprompt` once, often before any screen has
// mounted, so it's captured at startup and handed to the UI when asked.
let deferredPrompt = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

const standaloneQuery = window.matchMedia("(display-mode: standalone)");
const isInstalled = () => standaloneQuery.matches || window.navigator.standalone === true;
standaloneQuery.addEventListener("change", () => notify());

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

// "installed" (running as the app), "ready" (one-click install available),
// or "manual" (browser needs its own menu, e.g. iPhone Safari).
export function useInstallState() {
  return useSyncExternalStore(subscribe, () =>
    isInstalled() ? "installed" : deferredPrompt ? "ready" : "manual"
  );
}

export const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export async function promptInstall() {
  if (!deferredPrompt) return false;
  const prompt = deferredPrompt;
  deferredPrompt = null;
  notify();
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  return outcome === "accepted";
}
