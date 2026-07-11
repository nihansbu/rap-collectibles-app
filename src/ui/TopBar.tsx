import { ArrowLeft, BookOpen, Plus, Settings } from "lucide-react";
import { formatNumber } from "../format";
import { InspectableImage } from "./IconInspect";

export function TopBar({
  title,
  rp,
  canGoBack,
  onBack,
  onGrantRp,
  onOpenHandbook,
  onOpenSettings,
  handbookMode,
  settingsActive = false,
  showDevTools = false,
}: {
  title: string;
  rp: number;
  canGoBack: boolean;
  onBack: () => void;
  onGrantRp: () => void;
  onOpenHandbook: () => void;
  onOpenSettings: () => void;
  handbookMode?: "context" | "index";
  settingsActive?: boolean;
  showDevTools?: boolean;
}) {
  const handbookLabel = handbookMode === "context"
    ? "Open full Handbook"
    : handbookMode === "index"
      ? "Full Handbook open"
      : `Open ${title} guide`;

  return (
    <header className="topbar">
      <div className="title-cluster">
        {canGoBack && (
          <button className="icon-button ghost" onClick={onBack} aria-label="Back">
            <ArrowLeft size={19} />
          </button>
        )}
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <button
          className={`icon-button handbook-button ${handbookMode ? "active" : ""}`}
          onClick={onOpenHandbook}
          aria-label={handbookLabel}
          aria-pressed={handbookMode === "index"}
          title={handbookLabel}
        >
          <BookOpen size={18} />
        </button>
        <button
          className={`icon-button settings-button ${settingsActive ? "active" : ""}`}
          onClick={onOpenSettings}
          aria-label="Open settings and save tools"
          aria-pressed={settingsActive}
          title="Settings and save tools"
        >
          <Settings size={18} />
        </button>
        <div className="wallet">
          <span className="wallet-display">
            <InspectableImage className="wallet-symbol" src="./assets/icons/ui/ui-rap.webp" title="RAP" subtitle="Real Life Activity Points" />
            <span className="wallet-value">{formatNumber(rp)} RAP</span>
          </span>
          {showDevTools && (
            <button className="icon-button add" onClick={onGrantRp} aria-label="Add 10,000 RAP (developer tool)">
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
