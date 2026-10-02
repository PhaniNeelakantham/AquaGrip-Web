// Rules for Squeeze Pop. Grip is measured as a "level": 0 = relaxed hand,
// 1 = the player's comfortable max from the grip check.
export const TARGETS = [
  { id: "light", label: "Light", level: 0.3, tint: "sky" },
  { id: "medium", label: "Medium", level: 0.5, tint: "lavender" },
  { id: "strong", label: "Strong", level: 0.7, tint: "peach" },
];

export const RELEASE_LEVEL = 0.15; // relax below this to pop a filled bubble
export const REP_HIGH = 0.25;
export const REP_LOW = 0.12;
const SQUEEZE_SLOWDOWN = 0.25; // bubbles rise at 25% speed while you're squeezing
const CHARGED_CEILING = 0.92; // a filled bubble waits near the top for you to let go

// The MPRLS reads absolute pressure, so "relaxed" may be ~14.7 psi, not 0.
export function toLevel(psi, { restPsi, maxPsi }) {
  const span = maxPsi - restPsi;
  if (span <= 0) return 0;
  return Math.max(0, (psi - restPsi) / span);
}

// One rep = rise above `high`, then fall back below `low`. Two thresholds
// stop a shaky squeeze near the line from counting as several reps.
export function createRepCounter(high = REP_HIGH, low = REP_LOW) {
  let armed = true;
  let count = 0;
  return {
    update(level) {
      if (armed && level >= high) {
        count++;
        armed = false;
      } else if (!armed && level <= low) {
        armed = true;
      }
      return count;
    },
    get count() {
      return count;
    },
  };
}

// Advances one bubble. `b.y` runs 0 (bottom) to 1 (top). Forgiving rules:
// squeezing past the target still counts, a filled bubble never escapes,
// and bubbles slow down while you're working on them.
// Returns "popped", "escaped", or null.
export function stepBubble(b, level, dt, riseSeconds) {
  if (!b.charged && level >= b.target.level) b.charged = true;
  if (b.charged && level <= RELEASE_LEVEL) return "popped";

  const speed = level > REP_LOW ? SQUEEZE_SLOWDOWN : 1;
  b.y += (dt / riseSeconds) * speed;
  if (b.charged) {
    b.y = Math.min(b.y, CHARGED_CEILING);
    return null;
  }
  return b.y >= 1 ? "escaped" : null;
}
