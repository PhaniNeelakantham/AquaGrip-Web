import { useMemo } from "react";
import { ArrowUpRight, Droplet, Gamepad2, Hand, RotateCw, TrendingUp } from "lucide-react";
import { baselineForRange, improvementScore, percentChange, summarize } from "../data/scoring";
import { WEEKLY_GOAL, currentStreak, greeting, scoreBand, statusText, weekOverview } from "../data/insights";
import { GAMES } from "../data/games";
import DemoBanner from "../components/DemoBanner";
import ScoreRing from "../components/ScoreRing";
import StatTile from "../components/StatTile";
import WeekStreak from "../components/WeekStreak";

export default function Home({ sessions, onNavigate, connectionState, demoMode }) {
  const data = useMemo(() => {
    const { days, sessionsThisWeek } = weekOverview(sessions);
    const { current, baseline } = baselineForRange(sessions, 30);
    const now = summarize(current);
    const before = summarize(baseline);
    return {
      days,
      sessionsThisWeek,
      streak: currentStreak(sessions),
      now,
      before,
      score: improvementScore(now, before),
    };
  }, [sessions]);

  const hasMonth = data.now.count > 0;
  const hasBaseline = data.before.count > 0;
  const deltaFor = (a, b) => (hasMonth && hasBaseline ? percentChange(a, b) : null);

  const remaining = Math.max(0, WEEKLY_GOAL - data.sessionsThisWeek);
  const band = scoreBand(data.score);
  const connected = connectionState === "connected";

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Droplet size={20} strokeWidth={2.4} aria-hidden="true" />
          </span>
          AquaGrip
        </div>
        <button className="status-chip" onClick={() => onNavigate("games")}>
          <span className={`status-dot${connected ? " is-on" : ""}`} aria-hidden="true" />
          {statusText(connectionState, demoMode)}
        </button>
      </div>

      {demoMode && <DemoBanner onNavigate={onNavigate} />}

      <header className="screen-header">
        <div className="eyebrow">{greeting()}</div>
        <h1 className="title">Welcome back</h1>
      </header>

      <section className="hero" aria-label="This week">
        <div className="hero-text">
          <div className="hero-label">This week</div>
          <div className="hero-value">
            {data.sessionsThisWeek} of {WEEKLY_GOAL} sessions
          </div>
          <p className="hero-note">
            {remaining === 0
              ? "Weekly goal reached. Nice work!"
              : `${remaining} more to reach your weekly goal.`}
          </p>
        </div>
        <ScoreRing
          value={Math.min(data.sessionsThisWeek, WEEKLY_GOAL)}
          max={WEEKLY_GOAL}
          size={96}
          stroke={10}
          color="var(--teal-bright)"
          trackColor="rgba(255,255,255,0.18)"
        >
          <div className="ring-value" style={{ fontSize: 26 }}>
            {Math.round((Math.min(data.sessionsThisWeek, WEEKLY_GOAL) / WEEKLY_GOAL) * 100)}%
          </div>
        </ScoreRing>
      </section>

      <div className="tiles">
        <button className="tile tile--games" onClick={() => onNavigate("games")}>
          <div className="tile-top">
            <span className="tile-icon">
              <Gamepad2 size={24} aria-hidden="true" />
            </span>
            <ArrowUpRight size={22} aria-hidden="true" />
          </div>
          <div>
            <div className="tile-title">Play games</div>
            <div className="tile-sub">{GAMES.length} fun exercises</div>
          </div>
        </button>
        <button className="tile tile--progress" onClick={() => onNavigate("progress")}>
          <div className="tile-top">
            <span className="tile-icon">
              <TrendingUp size={24} aria-hidden="true" />
            </span>
            <ArrowUpRight size={22} aria-hidden="true" />
          </div>
          <div>
            <div className="tile-title">My progress</div>
            <div className="tile-sub">
              {data.score === null ? "See your trends" : band.label}
            </div>
          </div>
        </button>
      </div>

      <h2 className="section-title">Your week</h2>
      <WeekStreak days={data.days} streak={data.streak} />

      <h2 className="section-title">
        This month
        <span className="section-note">vs previous 30 days</span>
      </h2>
      <div className="stats">
        <StatTile
          icon={Hand}
          tint="sky"
          label="Grip strength"
          value={hasMonth ? data.now.avgPeakForce.toFixed(1) : "—"}
          unit={hasMonth ? "psi" : undefined}
          delta={deltaFor(data.now.avgPeakForce, data.before.avgPeakForce)}
        />
        <StatTile
          icon={RotateCw}
          tint="lavender"
          label="Wrist motion"
          value={hasMonth ? Math.round(data.now.avgRotationRange) : "—"}
          unit={hasMonth ? "°" : undefined}
          delta={deltaFor(data.now.avgRotationRange, data.before.avgRotationRange)}
        />
      </div>
    </>
  );
}
