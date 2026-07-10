import { Check, Download, HardDrive, RefreshCw, TriangleAlert, Upload } from "lucide-react";
import type { SaveStatus } from "../hooks/usePlayerPersistence";

export function SettingsPage({
  saveStatus,
  lastSavedAt,
  onSaveNow,
  onExport,
  onImport,
}: {
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  onSaveNow: () => void;
  onExport: () => void;
  onImport: () => void;
}) {
  const statusCopy = saveStatus === "saving"
    ? "Saving locally"
    : saveStatus === "conflict"
      ? "Newer progress loaded from another tab"
      : saveStatus === "error"
        ? "Local save failed"
        : "Progress saved locally";
  const StatusIcon = saveStatus === "error" ? TriangleAlert : saveStatus === "saving" ? RefreshCw : Check;

  return (
    <section className="settings-page" aria-label="Settings and save tools">
      <header className="settings-intro">
        <span className="settings-icon"><HardDrive size={24} /></span>
        <div>
          <h2>Save &amp; Backup</h2>
          <p>Your progress is stored only in this browser. Export a backup before changing devices or clearing browser data.</p>
        </div>
      </header>

      <div className={`save-status-card ${saveStatus}`} role="status" aria-live="polite">
        <StatusIcon size={19} className={saveStatus === "saving" ? "spin" : ""} />
        <span>
          <strong>{statusCopy}</strong>
          <small>{lastSavedAt ? `Last save: ${new Date(lastSavedAt).toLocaleString()}` : "No saved session yet"}</small>
        </span>
      </div>

      <button className="settings-action" onClick={onSaveNow}>
        <RefreshCw size={18} />
        <span><strong>Save Now</strong><small>Write current progress to this browser</small></span>
      </button>
      <button className="settings-action" onClick={onExport}>
        <Download size={18} />
        <span><strong>Export Backup</strong><small>Download a portable JSON save file</small></span>
      </button>
      <button className="settings-action" onClick={onImport}>
        <Upload size={18} />
        <span><strong>Import Backup</strong><small>Replace local progress from a JSON save</small></span>
      </button>
    </section>
  );
}
