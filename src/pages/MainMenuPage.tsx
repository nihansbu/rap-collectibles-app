import { Compass, Gem, Shield } from "lucide-react";
import type { CategoryId } from "../data";
import { activityRap, type ActivityOption } from "../economy";
import { formatNumber } from "../format";
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
  categoryProgress,
  totalActivityRuns,
  activeActivityCount,
  showFutureFeatures,
  onLogActivity,
  onInspectActivity,
  onOpenActivities,
  onOpenCategory,
}: {
  activities: ActivityOption[];
  categoryProgress: DashboardCategoryProgress[];
  totalActivityRuns: number;
  activeActivityCount: number;
  showFutureFeatures: boolean;
  onLogActivity: (activity: ActivityOption) => void;
  onInspectActivity: (activity: ActivityOption) => void;
  onOpenActivities: () => void;
  onOpenCategory: (id: CategoryId) => void;
}) {
  return (
    <div className="dashboard-page">
      <section className="dashboard-section" aria-label="Adventure">
        <DashboardHeading title="Adventure" meta={`${formatNumber(totalActivityRuns)} runs`} />
        <div className="dashboard-nav-grid adventure-nav-grid">
          <button className="dashboard-nav-tile adventure-entry" onClick={onOpenActivities}>
            <span className="dashboard-nav-icon">
              <Compass size={22} strokeWidth={1.8} />
            </span>
            <strong>Activities</strong>
            <small>{activeActivityCount > 0 ? `${activeActivityCount} active` : "XP and rare drops"}</small>
          </button>
          {showFutureFeatures && (
            <>
              <button className="dashboard-nav-tile future-tile" disabled>
                <span className="dashboard-nav-icon"><Shield size={22} strokeWidth={1.8} /></span>
                <strong>Arena</strong><small>Future</small>
              </button>
              <button className="dashboard-nav-tile future-tile" disabled>
                <span className="dashboard-nav-icon"><Gem size={22} strokeWidth={1.8} /></span>
                <strong>Quests</strong><small>Future</small>
              </button>
            </>
          )}
        </div>
      </section>

      <section className="dashboard-section" aria-label="Collectibles">
        <DashboardHeading title="Collectibles" />
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

      <section className="dashboard-section dashboard-log-section" aria-label="Activity log">
        <DashboardHeading title="Log Activity" meta="1 hour" />
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
      </section>
    </div>
  );
}

function DashboardHeading({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="section-heading dashboard-heading">
      <h2>{title}</h2>
      <span className="dashboard-heading-rule" aria-hidden="true" />
      {meta && <small>{meta}</small>}
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
