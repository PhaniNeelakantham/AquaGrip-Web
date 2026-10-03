import { useState } from "react";
import { Activity, Copy } from "lucide-react";

const STATUS_MEANING = {
  BOOT: "Device just started",
  MPR_OK: "Pressure sensor OK",
  BNO_OK: "Motion sensor OK",
  RETRY: "A sensor isn't responding (check wiring)",
  BNO_RESET: "Motion sensor restarted",
  BLE_CONN: "Bluetooth connected",
  BLE_DISC: "Bluetooth disconnected",
  MOCK: "Demo stream",
};

const MODE_LABEL = {
  notify: "Live updates",
  polling: "Direct reads (fallback)",
  demo: "Demo stream (sample data)",
};

const time = (ms) => new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

// Shows exactly what the website is receiving over Bluetooth, for testing
// the real device. Opens by itself when connected but no data is arriving.
export default function ConnectionDetails({ diagnostics: d, reading, status, connectionState }) {
  const [copied, setCopied] = useState(false);
  const connected = connectionState === "connected";
  const receiving = connected && d.rateHz > 0;
  if (!connected && d.log.length === 0) return null;

  const decoded = `psi ${reading.forcePsi.toFixed(2)} · qw ${reading.qw.toFixed(3)} · qx ${reading.qx.toFixed(3)} · qy ${reading.qy.toFixed(3)} · qz ${reading.qz.toFixed(3)}`;
  const statusText = status ? `${status}${STATUS_MEANING[status] ? ` (${STATUS_MEANING[status]})` : ""}` : "—";

  const rows = [
    ["Connection", connectionState],
    ["Method", MODE_LABEL[d.mode] ?? "—"],
    ["Data rate", `${d.rateHz} packets / second`],
    ["Packets received", String(d.packets)],
    ["Last packet", d.lastAgoS === null ? "none yet" : `${d.lastAgoS.toFixed(1)} s ago, ${d.lastLength ?? "?"} bytes`],
    ["Raw bytes", d.lastBytes || "—"],
    ["Decoded", d.packets ? decoded : "—"],
    ["Device status", statusText],
  ];

  const copy = async () => {
    const text = [
      ...rows.map(([k, v]) => `${k}: ${v}`),
      d.shortPackets ? `Short packets: ${d.shortPackets}` : null,
      "",
      "Log:",
      ...d.log.map((e) => `${time(e.at)}  ${e.msg}`),
    ]
      .filter((l) => l !== null)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <details className="diag" open={connected && !receiving}>
      <summary>
        <Activity size={16} aria-hidden="true" />
        <span>Connection details</span>
        <span className={`diag-badge ${receiving ? "is-ok" : "is-warn"}`}>
          {receiving ? `Receiving · ${d.rateHz}/s` : connected ? "No data yet" : "Not connected"}
        </span>
      </summary>

      <dl className="diag-grid">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd className={k === "Raw bytes" || k === "Decoded" ? "mono" : undefined}>{v}</dd>
          </div>
        ))}
      </dl>

      {connected && !receiving && (
        <p className="diag-tip">
          Connected, but no data is arriving. Give it a few seconds. If it stays this way: turn the phone's Bluetooth
          off and on, press RESET on the board, then connect again. Android can remember an old version of the
          device from before the firmware was uploaded.
        </p>
      )}

      <div className="diag-log" aria-label="Connection log">
        {d.log.length === 0 ? (
          <p>No events yet.</p>
        ) : (
          d.log.map((e, i) => (
            <p key={i}>
              <time>{time(e.at)}</time> {e.msg}
            </p>
          ))
        )}
      </div>

      <button className="btn btn-secondary diag-copy" onClick={copy}>
        <Copy size={16} aria-hidden="true" /> {copied ? "Copied!" : "Copy details"}
      </button>
    </details>
  );
}
