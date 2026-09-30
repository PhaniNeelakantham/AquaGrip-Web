import { useMemo, useState } from "react";
import { CalendarCheck, Hand, Info, Repeat, RotateCw, Sparkles } from "lucide-react";
import { mockSessions } from "../data/mockSessions";
import {
  RANGE_OPTIONS,
  baselineForRange,
  improvementScore,
  percentChange,
  summarize,
} from "../data/scoring";
import { comparisonLabel, friendlyDate, scoreBand } from "../data/insights";
import LineChart from "../components/LineChart";
import ScoreRing from "../components/ScoreRing";
import StatTile from "../components/StatTile";

export default function ProgressTracker() {
  const [rangeId, setRangeId] = useState("30d");
  const range = RANGE_OPTIONS.find((r) => r.id === rangeId);

  const data = useMemo(() => {
    const { current, baseline } = baselineForRange(mockSessions, range.days);
    const now = summarize(current);
    const before = summarize(baseline);
    return { current, now, before, score: improvementScore(now, before) };
  }, [range.days]);

  const band = scoreBand(data.score);
  const compare = comparisonLabel(range);
  const recent = data.current.slice(-4).reverse();

  return (
    <>
      <header className="screen-header">
        <div className="eyebrow">Progress</div>
        <h1 className="title">How you're doing</h1>
      </header>

      <div className="segmented" role="group" aria-label="Time range">
        {RANGE_OPTIONS.map((opt) => (
          <button key={opt.id} aria-pressed={opt.id === rangeId} onClick={() => setRangeId(opt.id)}>
            {opt.label}
          </button>
        ))}
      </div>

      <section className="card" style={{ marginTop: 16 }} aria-label="Improvement score">
        <div className="score-row">
          <ScoreRing value={data.score ?? 0}>
            <div className="ring-value">{data.score ?? "–"}</div>
            <div className="ring-sub">out of 100</div>
          </ScoreRing>
          <div className="score-text">
            <span className={`pill pill--${band.tone}`}>
              <Sparkles size={15} aria-hidden="true" /> {band.label}
            </span>
            <p className="score-message">{band.message}</p>
          </div>
        </div>
        <details className="explain">
          <summary>
            <Info size={16} aria-hidden="true" /> How is this score worked out?
          </summary>
          <p>
            We compare this period with the one before it. A stronger grip, more squeezes, and a wider wrist turn
            all raise your score. A score of 50 means about the same as before.
          </p>
        </details>
      </section>

      <h2 className="section-title">Grip strength over time</h2>
      <section className="card">
        <p className="card-sub">Your average squeeze in each session</p>
        <LineChart
          points={data.current.map((s) => ({ id: s.id, timestamp: s.timestamp, value: s.avgForcePsi }))}
          valueLabel="Average squeeze"
          unit="psi"
        />
      </section>

      <h2 className="section-title">
        At a glance
        <span className="section-note">{compare}</span>
      </h2>
      <div className="stats">
        <StatTile
          icon={Hand}
          tint="sky"
          label="Grip strength"
          value={data.now.avgPeakForce.toFixed(1)}
          unit="psi"
          delta={percentChange(data.now.avgPeakForce, data.before.avgPeakForce)}
        />
        <StatTile
          icon={Repeat}
          tint="mint"
          label="Squeezes per session"
          value={Math.round(data.now.avgReps)}
          delta={percentChange(data.now.avgReps, data.before.avgReps)}
        />
        <StatTile
          icon={RotateCw}
          tint="lavender"
          label="Wrist motion"
          value={Math.round(data.now.avgRotationRange)}
          unit="°"
          delta={percentChange(data.now.avgRotationRange, data.before.avgRotationRange)}
        />
        <StatTile icon={CalendarCheck} tint="peach" label="Sessions" value={data.now.count} />
      </div>

      {recent.length > 0 && (
        <>
          <h2 className="section-title">Recent sessions</h2>
          <section className="card" style={{ paddingBlock: 8 }}>
            {recent.map((s) => (
              <div key={s.id} className="list-row tint-sky">
                <div className="list-icon">
                  <Hand size={20} aria-hidden="true" />
                </div>
                <div className="list-main">
                  <div className="list-title">{friendlyDate(s.timestamp)}</div>
                  <div className="list-sub">
                    {s.reps} squeezes · {Math.round(s.durationS / 60) || 1} min
                  </div>
                </div>
                <div className="list-value">
                  {s.peakForcePsi.toFixed(1)}
                  <small>best psi</small>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </>
  );
}
