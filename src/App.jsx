import { useState } from "react";
import { useAquaGripSensor } from "./ble/useAquaGripSensor";
import { mockSessions } from "./data/mockSessions";
import { useSavedSessions } from "./data/sessionStore";
import BottomNav from "./components/BottomNav";
import Home from "./screens/Home";
import GameMenu from "./screens/GameMenu";
import ProgressTracker from "./screens/ProgressTracker";

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
          <GameMenu sensor={sensor} demoMode={demoMode} onDemoModeChange={changeDemoMode} />
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
