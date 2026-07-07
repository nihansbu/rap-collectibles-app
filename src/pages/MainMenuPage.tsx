import { BookOpen, ChevronRight, Compass, Download, Gem, Upload } from "lucide-react";
import { activityRap, type ActivityLogEntry, type ActivityOption } from "../economy";
import { formatNumber, formatSavedTime } from "../format";
import { ActivityIcon } from "../ui/icons";

export function MainMenuPage({
  activities,
  activityLog,
  lifetimeRap,
  lastSavedAt,
  saveMessage,
  onLogActivity,
  onExportSave,
  onImportSave,
  onOpenCollectibles,
  onOpenAdventure,
  onOpenHandbook,
}: {
  activities: ActivityOption[];
  activityLog: ActivityLogEntry[];
  lifetimeRap: number;
  lastSavedAt: Date | null;
  saveMessage: string;
  onLogActivity: (activity: ActivityOption) => void;
  onExportSave: () => void;
  onImportSave: () => void;
  onOpenCollectibles: () => void;
  onOpenAdventure: () => void;
  onOpenHandbook: () => void;
}) {
  return (
    <>
      <section className="tile-grid main-menu-grid">
        <button className="category-tile main-menu-tile" onClick={onOpenCollectibles}>
          <span className="tile-icon">
            <Gem size={23} strokeWidth={1.8} />
          </span>
          <span className="tile-text">
            <strong>Collectibles</strong>
            <small>Codex, skills, pets, mounts, classes, races</small>
          </span>
          <ChevronRight className="tile-chevron" size={18} />
        </button>
        <button className="category-tile main-menu-tile adventure-entry" onClick={onOpenAdventure}>
          <span className="tile-icon">
            <Compass size={23} strokeWidth={1.8} />
          </span>
          <span className="tile-text">
            <strong>Adventure</strong>
            <small>Activities and future gameplay systems</small>
          </span>
          <ChevronRight className="tile-chevron" size={18} />
        </button>
        <button className="category-tile main-menu-tile handbook-entry" onClick={onOpenHandbook}>
          <span className="tile-icon">
            <BookOpen size={23} strokeWidth={1.8} />
          </span>
          <span className="tile-text">
            <strong>Handbook</strong>
            <small>Rules, progression, drops, and Codex states</small>
          </span>
          <ChevronRight className="tile-chevron" size={18} />
        </button>
      </section>
      <section className="activity-panel" aria-label="Activity log">
        <div className="section-heading">
          <h2>Log Activity</h2>
          <span>1 hour</span>
        </div>
        <div className="activity-grid">
          {activities.map((activity) => (
            <button key={activity.id} className="activity-action" onClick={() => onLogActivity(activity)}>
              <span>
                <ActivityIcon activityId={activity.id} />
              </span>
              <strong>{activity.name}</strong>
              <small>+{formatNumber(activity.rapPerHour)} RAP</small>
            </button>
          ))}
        </div>
        {activityLog.length > 0 && (
          <div className="activity-history" aria-label="Recent activity history">
            {activityLog.slice(0, 3).map((entry) => (
              <span key={entry.id}>
                <strong>{entry.name}</strong>
                <small>+{formatNumber(entry.rap)} RAP</small>
              </span>
            ))}
          </div>
        )}
      </section>
      <section className="save-tools" aria-label="Save tools">
        <div className="save-status">
          <strong>Save Status</strong>
          <span>Autosaved {formatSavedTime(lastSavedAt)}</span>
          <small>{formatNumber(lifetimeRap)} lifetime RAP earned</small>
        </div>
        <button className="tool-action" onClick={onExportSave}>
          <Download size={16} />
          <span>Export Save</span>
        </button>
        <button className="tool-action" onClick={onImportSave}>
          <Upload size={16} />
          <span>Import Save</span>
        </button>
        {saveMessage && <p>{saveMessage}</p>}
      </section>
    </>
  );
}
