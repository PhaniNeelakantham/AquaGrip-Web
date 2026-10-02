// The player's grip range from the Squeeze Pop grip check: relaxed reading
// and comfortable max, in psi. Real calibration is saved in this browser;
// demo calibration lives in memory only, since demo data is never saved.
const STORAGE_KEY = "aquagrip.gripCalibration.v1";
let demoCalibration = null;
let saved; // undefined = not loaded yet

const isValid = (c) =>
  c && Number.isFinite(c.restPsi) && Number.isFinite(c.maxPsi) && c.maxPsi > c.restPsi;

export function getCalibration(demoMode) {
  if (demoMode) return demoCalibration;
  if (saved === undefined) {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      saved = isValid(parsed) ? parsed : null;
    } catch {
      saved = null;
    }
  }
  return saved;
}

export function saveCalibration(demoMode, calibration) {
  if (demoMode) {
    demoCalibration = calibration;
    return;
  }
  saved = calibration;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calibration));
  } catch {
    // Storage blocked -- keep it for this visit only.
  }
}
