import { Compass, Download, Gem, Shield, Upload } from "lucide-react";
import type { CategoryId } from "../data";
import { activityRap, type ActivityLogEntry, type ActivityOption } from "../economy";
import { formatNumber, formatSavedTime } from "../format";
import { ActivityIcon, AppIcon } from "../ui/icons";
import { useLongPress } from "../ui/useLongPress";

type DashboardCategoryProgress = {
  id: CategoryId;
  name: string;
  unlocked: number;
  total: number;
  percent: number;
};

export function MainMenuPage({
  activities,
  activityLog,
  categoryProgress,
  totalActivityRuns,
  activeActivityCount,
  lifetimeRap,
  lastSavedAt,
  saveMessage,
  onLogActivity,
  onInspectActivity,
  onExportSave,
  onImportSave,
  onOpenActivities,
  onOpenCategory,
  onOpenHandbook,
}: {
  activities: ActivityOption[];
  activityLog: ActivityLogEntry[];
  categoryProgress: DashboardCategoryProgress[];
  totalActivityRuns: number;
  activeActivityCount: number;
  lifetimeRap: number;
  lastSavedAt: Date | null;
  saveMessage: string;
  onLogActivity: (activity: ActivityOption) => void;
  onInspectActivity: (activity: ActivityOption) => void;
  onExportSave: () => void;
  onImportSave: () => void;
  onOpenActivities: () => void;
  onOpenCategory: (id: CategoryId) => void;
  onOpenHandbook: () => void;
}) {
  const latestActivity = activityLog[0];

  return (
    <div className="dashboard-page">
      <section className="dashboard-section" aria-label="Adventure">
        <div className="section-heading compact-heading">
          <h2>Adventure</h2>
          <span>{formatNumber(totalActivityRuns)} runs</span>
        </div>
        <div className="dashboard-nav-grid adventure-nav-grid">
          <button className="dashboard-nav-tile adventure-entry" onClick={onOpenActivities}>
            <span className="dashboard-nav-icon">
              <Compass size={22} strokeWidth={1.8} />
            </span>
            <strong>Activities</strong>
            <small>{activeActivityCount > 0 ? `${activeActivityCount} active` : "XP and rare drops"}</small>
          </button>
          <button className="dashboard-nav-tile future-tile" disabled>
            <span className="dashboard-nav-icon">
              <Shield size={22} strokeWidth={1.8} />
            </span>
            <strong>Arena</strong>
            <small>Future</small>
          </button>
          <button className="dashboard-nav-tile future-tile" disabled>
            <span className="dashboard-nav-icon">
              <Gem size={22} strokeWidth={1.8} />
            </span>
            <strong>Quests</strong>
            <small>Future</small>
          </button>
        </div>
      </section>

      <section className="dashboard-section" aria-label="Collectibles">
        <div className="section-heading compact-heading">
          <h2>Collectibles</h2>
          <button className="inline-link" onClick={onOpenHandbook}>Handbook</button>
        </div>
        <div className="dashboard-collection-grid">
          {categoryProgress.map((category) => (
            <button key={category.id} className="dashboard-collection-tile" onClick={() => onOpenCategory(category.id)}>
              <span className="dashboard-nav-icon">
                <AppIcon category={category.id} />
              </span>
              <strong>{category.name}</strong>
              <small>{category.unlocked}/{category.total}</small>
              <span className="mini-progress-track" aria-hidden="true">
                <span style={{ width: `${category.percent}%` }} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="activity-panel dashboard-log-panel" aria-label="Activity log">
        <div className="section-heading compact-heading">
          <h2>Log Activity</h2>
          <span>1 hour</span>
        </div>
        <div className="activity-grid dashboard-activity-grid">
          {activities.map((activity) => (
            <LogActivityTile
              key={activity.id}
              activity={activity}
              onLog={() => onLogActivity(activity)}
              onInspect={() => onInspectActivity(activity)}
            />
          ))}
        </div>
        {latestActivity && (
          <div className="activity-history compact-history" aria-label="Latest activity">
            <span>
              <strong>Last: {latestActivity.name}</strong>
              <small>+{formatNumber(latestActivity.rap)} RAP</small>
            </span>
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
    </div>
  );
}

function LogActivityTile({
  activity,
  onLog,
  onInspect,
}: {
  activity: ActivityOption;
  onLog: () => void;
  onInspect: () => void;
}) {
  const longPress = useLongPress({ onPress: onLog, onLongPress: onInspect });

  return (
    <button className="activity-action" {...longPress}>
      <span>
        <ActivityIcon activityId={activity.id} />
      </span>
      <strong>{activity.name}</strong>
      <small>+{formatNumber(activityRap(activity, 1))} RAP</small>
    </button>
  );
}
