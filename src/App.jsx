import { useState } from "react";
import { useAquaGripSensor } from "./ble/useAquaGripSensor";
import BottomNav from "./components/BottomNav";
import Home from "./screens/Home";
import GameMenu from "./screens/GameMenu";
import ProgressTracker from "./screens/ProgressTracker";

function App() {
  const [tab, setTab] = useState("home");
  const [demoMode, setDemoMode] = useState(true);
  const sensor = useAquaGripSensor({ mock: demoMode });

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
          <Home onNavigate={navigate} connectionState={sensor.connectionState} demoMode={demoMode} />
        )}
        {tab === "games" && (
          <GameMenu sensor={sensor} demoMode={demoMode} onDemoModeChange={changeDemoMode} />
        )}
        {tab === "progress" && <ProgressTracker />}
      </main>
      <BottomNav tab={tab} onChange={navigate} />
    </>
  );
}

export default App;
