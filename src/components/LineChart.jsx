import { useMemo, useRef, useState } from "react";

const VIEW_W = 600;
const VIEW_H = 220;
const PAD = { top: 16, right: 16, bottom: 24, left: 40 };

function niceTicks(min, max, count = 4) {
  if (min === max) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

// Single-series trend line: 2px line, 8px end marker with a surface ring,
// direct end-label, hairline gridlines, crosshair + tooltip on hover, and
// a table-view toggle so every value is reachable without hovering.
export default function LineChart({ points, valueLabel, valueFormat = (v) => v.toFixed(1) }) {
  const svgRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const { path, scaledPoints, yTicks, minY, maxY } = useMemo(() => {
    if (points.length === 0) {
      return { path: "", scaledPoints: [], yTicks: [], minY: 0, maxY: 0 };
    }
    const values = points.map((p) => p.value);
    const times = points.map((p) => p.timestamp);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const spread = rawMax - rawMin || 1;
    const minY = Math.max(0, rawMin - spread * 0.15);
    const maxY = rawMax + spread * 0.15;
    const minT = Math.min(...times);
    const maxT = Math.max(...times);
    const spreadT = maxT - minT || 1;

    const innerW = VIEW_W - PAD.left - PAD.right;
    const innerH = VIEW_H - PAD.top - PAD.bottom;

    const scaledPoints = points.map((p) => ({
      ...p,
      x: PAD.left + ((p.timestamp - minT) / spreadT) * innerW,
      y: PAD.top + innerH - ((p.value - minY) / (maxY - minY)) * innerH,
    }));

    const path = scaledPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

    return { path, scaledPoints, yTicks: niceTicks(minY, maxY), minY, maxY };
  }, [points]);

  const handlePointerMove = (e) => {
    if (scaledPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const localX = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    let nearest = 0;
    let bestDist = Infinity;
    scaledPoints.forEach((p, i) => {
      const d = Math.abs(p.x - localX);
      if (d < bestDist) {
        bestDist = d;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  if (points.length === 0) {
    return <p style={{ color: "var(--text-secondary)" }}>No sessions in this range yet.</p>;
  }

  const last = scaledPoints[scaledPoints.length - 1];
  const hovered = hoverIndex !== null ? scaledPoints[hoverIndex] : null;

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ width: "100%", height: "auto", touchAction: "none" }}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label={`${valueLabel} trend over the selected period`}
      >
        {yTicks.map((t, i) => {
          const y = PAD.top + (VIEW_H - PAD.top - PAD.bottom) * (1 - (t - minY) / (maxY - minY || 1));
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={VIEW_W - PAD.right}
                y1={y}
                y2={y}
                stroke="var(--gridline)"
                strokeWidth={1}
              />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize={11} fill="var(--text-muted)">
                {valueFormat(t)}
              </text>
            </g>
          );
        })}

        <path d={path} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* end marker: 8px dot with a 2px surface ring */}
        <circle cx={last.x} cy={last.y} r={6} fill="var(--surface-1)" />
        <circle cx={last.x} cy={last.y} r={4} fill="var(--series-1)" />
        <text x={last.x} y={last.y - 12} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--text-primary)">
          {valueFormat(last.value)}
        </text>

        {hovered && (
          <>
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD.top}
              y2={VIEW_H - PAD.bottom}
              stroke="var(--baseline)"
              strokeWidth={1}
            />
            <circle cx={hovered.x} cy={hovered.y} r={6} fill="var(--surface-1)" />
            <circle cx={hovered.x} cy={hovered.y} r={4} fill="var(--series-1)" />
          </>
        )}
      </svg>

      {hovered && (
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          <strong style={{ color: "var(--text-primary)" }}>{valueFormat(hovered.value)}</strong>{" "}
          on {new Date(hovered.timestamp).toLocaleDateString()}
        </div>
      )}

      <button
        onClick={() => setShowTable((v) => !v)}
        style={{
          marginTop: 8,
          fontSize: 12,
          background: "none",
          border: "1px solid var(--card-border)",
          borderRadius: 6,
          padding: "4px 8px",
          color: "var(--text-secondary)",
          cursor: "pointer",
        }}
      >
        {showTable ? "Hide" : "View"} as table
      </button>

      {showTable && (
        <table style={{ width: "100%", marginTop: 8, borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", color: "var(--text-secondary)", borderBottom: "1px solid var(--gridline)" }}>
                Date
              </th>
              <th style={{ textAlign: "right", color: "var(--text-secondary)", borderBottom: "1px solid var(--gridline)" }}>
                {valueLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.id}>
                <td style={{ color: "var(--text-primary)", padding: "2px 0" }}>
                  {new Date(p.timestamp).toLocaleDateString()}
                </td>
                <td style={{ color: "var(--text-primary)", textAlign: "right" }}>{valueFormat(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
