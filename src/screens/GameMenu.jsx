import { Clock, Hand, Play } from "lucide-react";
import { GAMES } from "../data/games";
import DevicePanel from "../components/DevicePanel";

function GameCardBody({ game }) {
  const { name, desc, trains, minutes, icon: Icon, playable } = game;
  return (
    <>
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
          {playable ? (
            <span className="play-badge">
              <Play size={13} fill="currentColor" aria-hidden="true" /> Play
            </span>
          ) : (
            <span className="soon">Coming soon</span>
          )}
        </div>
      </div>
    </>
  );
}

export default function GameMenu({ sensor, demoMode, onDemoModeChange, transport, onTransportChange, onPlay }) {
  return (
    <>
      <header className="screen-header">
        <div className="eyebrow">Games</div>
        <h1 className="title">Play &amp; practice</h1>
        <p className="subtitle">Short, fun exercises for your hand and wrist.</p>
      </header>

      <DevicePanel
        sensor={sensor}
        demoMode={demoMode}
        onDemoModeChange={onDemoModeChange}
        transport={transport}
        onTransportChange={onTransportChange}
      />

      <h2 className="section-title">
        All games
        <span className="section-note">{GAMES.length} games</span>
      </h2>
      <div className="games">
        {GAMES.map((game) =>
          game.playable ? (
            <button key={game.id} className={`game-card tint-${game.tint}`} onClick={() => onPlay(game.id)}>
              <GameCardBody game={game} />
            </button>
          ) : (
            <article key={game.id} className={`game-card tint-${game.tint}`} aria-disabled="true">
              <GameCardBody game={game} />
            </article>
          )
        )}
      </div>
    </>
  );
}
