import { ArrowLeft, Plus } from "lucide-react";
import { formatNumber } from "../format";

export function TopBar({
  title,
  rp,
  canGoBack,
  onBack,
  onGrantRp,
}: {
  title: string;
  rp: number;
  canGoBack: boolean;
  onBack: () => void;
  onGrantRp: () => void;
}) {
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
      <div className="wallet">
        <span>{formatNumber(rp)} RAP</span>
        <button className="icon-button add" onClick={onGrantRp} aria-label="Add 10,000 RAP">
          <Plus size={18} />
        </button>
      </div>
    </header>
  );
}
