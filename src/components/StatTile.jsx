// Stat tile contract (dataviz skill): label + value + optional signed delta,
// delta color = direction x whether up is good for that metric.
export default function StatTile({ label, value, delta, deltaGoodDirection = "up" }) {
  const hasDelta = delta !== undefined && delta !== null && Number.isFinite(delta);
  const isUp = delta > 0;
  const isGood = hasDelta && (deltaGoodDirection === "up" ? isUp : !isUp) && delta !== 0;
  const isBad = hasDelta && !isGood && delta !== 0;

  return (
    <div
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--card-border)",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{label}</div>
      <div style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 600, marginTop: 2 }}>
        {value}
      </div>
      {hasDelta && (
        <div
          style={{
            fontSize: 13,
            marginTop: 2,
            color: isGood ? "var(--delta-good)" : isBad ? "var(--delta-bad)" : "var(--text-muted)",
          }}
        >
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)}% vs prior period
        </div>
      )}
    </div>
  );
}
