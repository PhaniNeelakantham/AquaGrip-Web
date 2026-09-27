import { useState } from "react";
import { useAquaGripSensor } from "./ble/useAquaGripSensor";

// Proves the Bluetooth data pipeline end-to-end before any game/tracker
// UI gets built on top of it. Not the final app screen.
export default function ConnectionDemo() {
  const [mock, setMock] = useState(true);
  const { connectionState, reading, status, error, connect, disconnect } =
    useAquaGripSensor({ mock });

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 420 }}>
      <h1>AquaGrip — Bluetooth Test</h1>

      <label style={{ display: "block", marginBottom: 12 }}>
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

      <p>
        Status: <strong>{connectionState}</strong>
        {status ? ` (${status})` : ""}
      </p>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {connectionState === "connected" ? (
        <button onClick={disconnect}>Disconnect</button>
      ) : (
        <button onClick={connect} disabled={connectionState === "connecting"}>
          {mock ? "Start Mock Stream" : "Connect to AquaGrip"}
        </button>
      )}

      <table style={{ marginTop: 16, borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td>Force (psi)</td>
            <td>{reading.forcePsi.toFixed(2)}</td>
          </tr>
          <tr>
            <td>qw</td>
            <td>{reading.qw.toFixed(3)}</td>
          </tr>
          <tr>
            <td>qx</td>
            <td>{reading.qx.toFixed(3)}</td>
          </tr>
          <tr>
            <td>qy</td>
            <td>{reading.qy.toFixed(3)}</td>
          </tr>
          <tr>
            <td>qz</td>
            <td>{reading.qz.toFixed(3)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
