// Quaternion <-> pitch/roll/yaw, using the same axis mapping as the Python
// prototype (Prototype.py): pitch about x, roll about y, yaw about z.
const DEG = 180 / Math.PI;

export function toAngles({ qw, qx, qy, qz }) {
  const pitch = Math.atan2(2 * (qw * qx + qy * qz), 1 - 2 * (qx * qx + qy * qy)) * DEG;
  const roll = Math.asin(Math.max(-1, Math.min(1, 2 * (qw * qy - qz * qx)))) * DEG;
  const yaw = Math.atan2(2 * (qw * qz + qx * qy), 1 - 2 * (qy * qy + qz * qz)) * DEG;
  return { pitch, roll, yaw };
}

// Inverse of toAngles, used by the demo stream.
export function fromAngles({ pitch, roll, yaw }) {
  const [cx, sx] = [Math.cos(pitch / DEG / 2), Math.sin(pitch / DEG / 2)];
  const [cy, sy] = [Math.cos(roll / DEG / 2), Math.sin(roll / DEG / 2)];
  const [cz, sz] = [Math.cos(yaw / DEG / 2), Math.sin(yaw / DEG / 2)];
  return {
    qw: cx * cy * cz + sx * sy * sz,
    qx: sx * cy * cz - cx * sy * sz,
    qy: cx * sy * cz + sx * cy * sz,
    qz: cx * cy * sz - sx * sy * cz,
  };
}

// Difference between two angles, wrapped to -180..180 so crossing the
// +/-180 seam (common for yaw) doesn't jump by 360.
export function angleDelta(a, b) {
  return ((((a - b + 180) % 360) + 360) % 360) - 180;
}
