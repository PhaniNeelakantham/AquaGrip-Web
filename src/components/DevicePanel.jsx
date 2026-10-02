import { useState } from "react";
import { Bluetooth, Crosshair } from "lucide-react";
import { angleDelta, toAngles } from "../ble/orientation";

const MAX_METER_PSI = 12;
const AXIS_RANGE_DEG = 90;

const AXES = [
  { key: "pitch", label: "Tilt", hint: "up / down" },
  { key: "roll", label: "Roll", hint: "palm turn" },
  { key: "yaw", label: "Twist", hint: "side to side" },
];

// Vertical slider: knob sits in the middle at 0°, moves up for positive.
function AxisBar({ label, hint, degrees }) {
  const clamped = Math.max(-AXIS_RANGE_DEG, Math.min(AXIS_RANGE_DEG, degrees));
  const pct = 50 + (clamped / AXIS_RANGE_DEG) * 50;
  return (
    <div className="axis" role="meter" aria-label={`${label} ${Math.round(degrees)} degrees`}
      aria-valuemin={-AXIS_RANGE_DEG} aria-valuemax={AXIS_RANGE_DEG} aria-valuenow={Math.round(clamped)}>
      <strong className="axis-value">{Math.round(degrees)}°</strong>
      <div className="axis-track">
        <div className="axis-center" />
        <div className="axis-fill" style={{ bottom: `${Math.min(pct, 50)}%`, top: `${100 - Math.max(pct, 50)}%` }} />
        <div className="axis-knob" style={{ bottom: `${pct}%` }} />
      </div>
      <div className="axis-label">{label}</div>
      <div className="axis-hint">{hint}</div>
    </div>
  );
}

function LiveMeters({ reading }) {
  const [center, setCenter] = useState({ pitch: 0, roll: 0, yaw: 0 });
  const squeezePct = Math.min(1, Math.max(0, reading.forcePsi / MAX_METER_PSI)) * 100;
  const angles = toAngles(reading);

  return (
    <div className="meters">
      <div>
        <div className="meter-head">
          <span>Squeeze</span>
          <strong>{reading.forcePsi.toFixed(1)} psi</strong>
        </div>
        <div className="meter-track">
          <div className="meter-fill" style={{ width: `${squeezePct}%` }} />
        </div>
      </div>
      <div>
        <div className="meter-head">
          <span>Wrist movement</span>
          <button className="link-btn" onClick={() => setCenter(angles)}>
            <Crosshair size={14} aria-hidden="true" /> Set as center
          </button>
        </div>
        <div className="axes">
          {AXES.map(({ key, label, hint }) => (
            <AxisBar key={key} label={label} hint={hint} degrees={angleDelta(angles[key], center[key])} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DevicePanel({ sensor, demoMode, onDemoModeChange }) {
  const { connectionState, reading, error, connect, disconnect } = sensor;
  const connected = connectionState === "connected";

  const title = connected
    ? demoMode
      ? "Demo mode is on"
      : "AquaGrip connected"
    : connectionState === "connecting"
      ? "Connecting…"
      : "No device connected";

  const sub = connected
    ? demoMode
      ? "Showing sample movement so you can explore."
      : "Squeeze and turn your wrist. The meters will follow."
    : demoMode
      ? "Try everything with sample data. No device needed."
      : "Turn on your AquaGrip, then tap Connect.";

  return (
    <section className="card" aria-live="polite">
      <div className="device-head">
        <div className={`device-badge${connected ? " is-on" : ""}`}>
          <Bluetooth size={24} aria-hidden="true" />
        </div>
        <div>
          <div className="device-title">{title}</div>
          <div className="device-sub">{sub}</div>
        </div>
      </div>

      {connected && <LiveMeters reading={reading} />}
      {error && <p className="device-error">{error}</p>}

      <div className="device-actions">
        {connected ? (
          <button className="btn btn-secondary" onClick={disconnect}>
            {demoMode ? "Stop demo" : "Disconnect"}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={connect}
            disabled={connectionState === "connecting"}
          >
            {demoMode ? "Start demo" : "Connect"}
          </button>
        )}
        <label className="switch-row">
          Demo mode
          <button
            className="switch"
            role="switch"
            aria-checked={demoMode}
            onClick={() => onDemoModeChange(!demoMode)}
          />
        </label>
      </div>
    </section>
  );
}
