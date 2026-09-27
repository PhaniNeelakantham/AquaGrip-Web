import { useState } from "react";
import { useAquaGripSensor } from "../ble/useAquaGripSensor";

const PLACEHOLDER_GAMES = [
  { name: "Squeeze Pop", desc: "Grip force pops bubbles" },
  { name: "Tilt Maze", desc: "Wrist rotation steers a ball" },
  { name: "Hold Steady", desc: "Endurance: keep force in a target band" },
];

export default function GameMenu() {
  const [mock, setMock] = useState(true);
  const { connectionState, reading, status, error, connect, disconnect } =
    useAquaGripSensor({ mock });

  return (
    <div style={{ padding: "16px 16px 88px" }}>
      <h1 style={{ fontSize: 24, margin: "8px 0 16px" }}>Games</h1>

      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--card-border)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {connectionState === "connected" ? "Connected" : "Not connected"}
              {status ? ` (${status})` : ""}
            </div>
            <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={mock}
                onChange={(e) => {
                  disconnect();
                  setMock(e.target.checked);
                }}
              />{" "}
              Use fake data (no hardware needed)
            </label>
          </div>
          {connectionState === "connected" ? (
            <button onClick={disconnect}>Disconnect</button>
          ) : (
            <button onClick={connect} disabled={connectionState === "connecting"}>
              {mock ? "Start Mock" : "Connect"}
            </button>
          )}
        </div>
        {error && <p style={{ color: "var(--delta-bad)", fontSize: 13 }}>{error}</p>}
        {connectionState === "connected" && (
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
            Force {reading.forcePsi.toFixed(2)} psi · qw {reading.qw.toFixed(2)} · qy {reading.qy.toFixed(2)}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {PLACEHOLDER_GAMES.map((g) => (
          <div
            key={g.name}
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--card-border)",
              borderRadius: 12,
              padding: 14,
              opacity: 0.6,
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{g.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{g.desc}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Coming soon</div>
          </div>
        ))}
      </div>
    </div>
  );
}
