import { Bluetooth } from "lucide-react";

const MAX_METER_PSI = 12;

function tiltDegrees({ qw, qx, qy, qz }) {
  const sinPitch = 2 * (qw * qy - qz * qx);
  return (Math.asin(Math.max(-1, Math.min(1, sinPitch))) * 180) / Math.PI;
}

function LiveMeters({ reading }) {
  const squeezePct = Math.min(1, Math.max(0, reading.forcePsi / MAX_METER_PSI)) * 100;
  const tilt = tiltDegrees(reading);
  const tiltPct = 50 + Math.max(-45, Math.min(45, tilt)) * (50 / 45);

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
          <span>Wrist tilt</span>
          <strong>{Math.round(tilt)}°</strong>
        </div>
        <div className="tilt-track">
          <div className="tilt-center" />
          <div className="tilt-knob" style={{ left: `${tiltPct}%` }} />
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
