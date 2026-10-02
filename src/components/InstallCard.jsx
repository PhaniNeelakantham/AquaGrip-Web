import { useState } from "react";
import { Download, X } from "lucide-react";
import { promptInstall, useCanInstall } from "../pwa/installPrompt";

const DISMISS_KEY = "aquagrip.installDismissed";

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export default function InstallCard() {
  const canInstall = useCanInstall();
  const [dismissed, setDismissed] = useState(wasDismissed);
  if (!canInstall || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Storage blocked: it just reappears next visit.
    }
  };

  return (
    <section className="install-card tint-sky" aria-label="Install AquaGrip">
      <div className="install-icon">
        <Download size={22} aria-hidden="true" />
      </div>
      <div className="install-text">
        <strong>Install AquaGrip</strong>
        <span>Opens full-screen like an app and works offline.</span>
      </div>
      <button className="btn btn-primary install-btn" onClick={promptInstall}>
        Install
      </button>
      <button className="install-close" onClick={dismiss} aria-label="Not now">
        <X size={18} aria-hidden="true" />
      </button>
    </section>
  );
}
