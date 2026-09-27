// Fake reading stream so the game/tracker UI can be built and tested
// without the ESP32 plugged in. Not physically accurate -- just smooth,
// bounded motion so it's obvious on screen that data is "flowing."
export function startMockReadings(onReading, intervalMs = 20) {
  let t = 0;
  const id = setInterval(() => {
    t += intervalMs / 1000;
    const forcePsi = Math.max(0, 3 + 3 * Math.sin(t * 1.3));
    const angle = 0.4 * Math.sin(t * 0.8); // gentle wrist-rotation wobble
    onReading({
      forcePsi,
      qw: Math.cos(angle / 2),
      qx: 0,
      qy: Math.sin(angle / 2),
      qz: 0,
    });
  }, intervalMs);
  return () => clearInterval(id);
}
