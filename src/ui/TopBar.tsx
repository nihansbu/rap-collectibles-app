import { ArrowLeft, BookOpen, Plus } from "lucide-react";
import { formatNumber } from "../format";

export function TopBar({
  title,
  rp,
  canGoBack,
  onBack,
  onGrantRp,
  onOpenHandbook,
  handbookMode,
}: {
  title: string;
  rp: number;
  canGoBack: boolean;
  onBack: () => void;
  onGrantRp: () => void;
  onOpenHandbook: () => void;
  handbookMode?: "context" | "index";
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
        <div className="wallet">
          <span>{formatNumber(rp)} RAP</span>
          <button className="icon-button add" onClick={onGrantRp} aria-label="Add 10,000 RAP">
            <Plus size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
