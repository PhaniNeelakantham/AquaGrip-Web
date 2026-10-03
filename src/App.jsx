import { memo, useCallback, useState } from "react";
import { useAquaGripSensor } from "./ble/useAquaGripSensor";
import { mockSessions } from "./data/mockSessions";
import { useSavedSessions } from "./data/sessionStore";
import BottomNav from "./components/BottomNav";
import Home from "./screens/Home";
import GameMenu from "./screens/GameMenu";
import ProgressTracker from "./screens/ProgressTracker";
import TiltMaze from "./games/tiltMaze/TiltMaze";
import SqueezePop from "./games/squeezePop/SqueezePop";

// Memoized so the sensor's ~50 updates per second don't re-render a game;
// games read live data from `readingRef` inside their own frame loop.
const GAME_SCREENS = {
  "tilt-maze": memo(TiltMaze),
  "squeeze-pop": memo(SqueezePop),
};

function App() {
  const [tab, setTab] = useState("home");
  // Always starts off: real device + this browser's saved history.
  const [demoMode, setDemoMode] = useState(false);
  const sensor = useAquaGripSensor({ mock: demoMode });
  const savedSessions = useSavedSessions();
  const sessions = demoMode ? mockSessions : savedSessions;

  const navigate = (next) => {
    setTab(next);
    window.scrollTo({ top: 0 });
  };

  const changeDemoMode = (next) => {
    sensor.disconnect();
    setDemoMode(next);
  };

  const [playing, setPlaying] = useState(null);
  const leaveGame = useCallback(() => {
    setPlaying(null);
    setTab("games");
    window.scrollTo({ top: 0 });
  }, []);

  const Game = GAME_SCREENS[playing];
  if (Game) {
    return (
      <main className="screen screen--game">
        <Game
          connectionState={sensor.connectionState}
          readingRef={sensor.readingRef}
          lastDataAtRef={sensor.lastDataAtRef}
          demoMode={demoMode}
          onExit={leaveGame}
          onReconnect={sensor.connect}
        />
      </main>
    );
  }

  return (
    <>
      <main key={tab} className="screen">
        {tab === "home" && (
          <Home
            sessions={sessions}
            onNavigate={navigate}
            connectionState={sensor.connectionState}
            demoMode={demoMode}
          />
        )}
        {tab === "games" && (
          <GameMenu
            sensor={sensor}
            demoMode={demoMode}
            onDemoModeChange={changeDemoMode}
            onPlay={(id) => {
              setPlaying(id);
              window.scrollTo({ top: 0 });
            }}
          />
        )}
        {tab === "progress" && (
          <ProgressTracker sessions={sessions} demoMode={demoMode} onNavigate={navigate} />
        )}
      </main>
      <BottomNav tab={tab} onChange={navigate} />
    </>
  );
}

export default App;
