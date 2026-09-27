import { useMemo, useState } from "react";
import { mockSessions } from "../data/mockSessions";
import {
  RANGE_OPTIONS,
  baselineForRange,
  summarize,
  percentChange,
  improvementScore,
} from "../data/scoring";
import StatTile from "../components/StatTile";
import LineChart from "../components/LineChart";

export default function ProgressTracker() {
  const [rangeId, setRangeId] = useState("30d");
  const range = RANGE_OPTIONS.find((r) => r.id === rangeId);

  const { current, baseline, currentSummary, baselineSummary, score } = useMemo(() => {
    const { current, baseline } = baselineForRange(mockSessions, range.days);
    const currentSummary = summarize(current);
    const baselineSummary = summarize(baseline);
    return {
      current,
      baseline,
      currentSummary,
      baselineSummary,
      score: improvementScore(currentSummary, baselineSummary),
    };
  }, [range.days]);

  const chartPoints = current.map((s) => ({
    id: s.id,
    timestamp: s.timestamp,
    value: s.avgForcePsi,
  }));

  return (
    <div style={{ padding: "16px 16px 88px" }}>
      <h1 style={{ fontSize: 24, margin: "8px 0 16px" }}>Progress</h1>

      {/* Filters: one row, above the charts, date range first. */}
      <div
        role="group"
        aria-label="Time range"
        style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}
      >
        {RANGE_OPTIONS.map((opt) => {
          const active = opt.id === rangeId;
          return (
            <button
              key={opt.id}
              onClick={() => setRangeId(opt.id)}
              aria-pressed={active}
              style={{
                border: "1px solid var(--card-border)",
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 13,
                background: active ? "var(--series-1)" : "var(--surface-1)",
                color: active ? "#fff" : "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Hero figure: the one number this screen leads with. */}
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--card-border)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Improvement score</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
          {score === null ? "—" : score}
          <span style={{ fontSize: 20, color: "var(--text-muted)" }}>/100</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {score === null
            ? "Not enough history yet to compare"
            : "vs the period before this one"}
        </div>
      </div>

      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--card-border)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8 }}>
          Average grip force per session (psi)
        </div>
        <LineChart points={chartPoints} valueLabel="Avg force (psi)" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 10,
        }}
      >
        <StatTile
          label="Avg peak force"
          value={`${currentSummary.avgPeakForce.toFixed(1)} psi`}
          delta={percentChange(currentSummary.avgPeakForce, baselineSummary.avgPeakForce)}
        />
        <StatTile
          label="Avg reps / session"
          value={currentSummary.avgReps.toFixed(1)}
          delta={percentChange(currentSummary.avgReps, baselineSummary.avgReps)}
        />
        <StatTile
          label="Avg rotation range"
          value={`${currentSummary.avgRotationRange.toFixed(0)}°`}
          delta={percentChange(currentSummary.avgRotationRange, baselineSummary.avgRotationRange)}
        />
        <StatTile label="Sessions" value={currentSummary.count} />
      </div>
    </div>
  );
}
