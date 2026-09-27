import { useState } from "react";
import GameMenu from "./screens/GameMenu";
import ProgressTracker from "./screens/ProgressTracker";

const TABS = [
  { id: "games", label: "Games", icon: "🎮" },
  { id: "progress", label: "Progress", icon: "📈" },
];

function App() {
  const [tab, setTab] = useState("games");

  return (
    <>
      {tab === "games" ? <GameMenu /> : <ProgressTracker />}

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          display: "flex",
          borderTop: "1px solid var(--card-border)",
          background: "var(--surface-1)",
        }}
      >
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                border: "none",
                background: "none",
                padding: "10px 0 14px",
                cursor: "pointer",
                color: active ? "var(--series-1)" : "var(--text-muted)",
                fontWeight: active ? 600 : 400,
              }}
            >
              <div style={{ fontSize: 20 }}>{t.icon}</div>
              <div style={{ fontSize: 12 }}>{t.label}</div>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default App;
