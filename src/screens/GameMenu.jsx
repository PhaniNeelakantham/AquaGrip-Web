import { Clock, Hand } from "lucide-react";
import { GAMES } from "../data/games";
import DevicePanel from "../components/DevicePanel";

export default function GameMenu({ sensor, demoMode, onDemoModeChange }) {
  return (
    <>
      <header className="screen-header">
        <div className="eyebrow">Games</div>
        <h1 className="title">Play &amp; practice</h1>
        <p className="subtitle">Short, fun exercises for your hand and wrist.</p>
      </header>

      <DevicePanel sensor={sensor} demoMode={demoMode} onDemoModeChange={onDemoModeChange} />

      <h2 className="section-title">
        All games
        <span className="section-note">{GAMES.length} games</span>
      </h2>
      <div className="games">
        {GAMES.map(({ id, name, desc, trains, minutes, tint, icon: Icon }) => (
          <article key={id} className={`game-card tint-${tint}`} aria-disabled="true">
            <div className="game-art">
              <Icon size={34} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="game-body">
              <h3 className="game-name">{name}</h3>
              <p className="game-desc">{desc}</p>
              <div className="game-meta">
                <span className="chip">
                  <Hand size={14} aria-hidden="true" /> {trains}
                </span>
                <span className="chip">
                  <Clock size={14} aria-hidden="true" /> {minutes} min
                </span>
                <span className="soon">Coming soon</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
