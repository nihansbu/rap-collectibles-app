import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  Check,
  ChevronRight,
  Compass,
  Dice5,
  Gem,
  Lock,
  Layers3,
  Search,
  Swords,
  X,
} from "lucide-react";
import {
  activityDropChance,
  activityDropItem,
  activityRequirementsMet,
  activitySkillAdvantage,
  canStartActivity,
  effectiveActivityRun,
  formatDropChance,
  GAMEPLAY_ACTIVITIES,
  getActivity,
  isActivityRunning,
  processActiveActivityRuns,
  startActivityRun,
  type ActivityRunResult,
  type GameplayActivity,
  type GameplayActivityId,
} from "./activities";
import { collectAccountBonuses, formatBonusLabel, skillXpBonusPercent } from "./bonuses";
import {
  canUnlock,
  collectibleActionLabel,
  collectibleSortIndex,
  collectibleStatus,
  collectibleStatusRank,
  categoryForSkill,
  getCollectibleById,
  getCollectiblesByCategory,
  getRequirementState,
  highestRequirement,
  isActivityDrop,
  rarityClass,
  requirementsMet,
  skillName,
  skillNameFontSize,
  sourceActivityFor,
  statusLabel,
} from "./catalog";
import { categories, COLLECTION_SETS, type CategoryId, type Collectible, type Requirement, skills, type SkillId } from "./data";
import { ACTIVITY_OPTIONS, activityRap, type ActivityLogEntry, type ActivityOption } from "./economy";
import { completionPercent, formatNumber } from "./format";
import { createHandbookContext, type HandbookContext } from "./handbook";
import { HandbookPage } from "./pages/HandbookPage";
import { MainMenuPage } from "./pages/MainMenuPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AccountBonusesPage } from "./pages/AccountBonusesPage";
import { SetsPage } from "./pages/SetsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TopBar } from "./ui/TopBar";
import { ActivityResultPanel, ConfirmDialog, ImportDialog, UnlockNotice } from "./ui/dialogs";
import { ActivityIcon, AppIcon, GameplayActivityIcon, TileVisual } from "./ui/icons";
import { useLongPress } from "./ui/useLongPress";
import { MasteryProgress } from "./ui/MasteryProgress";
import { exportPlayerState, importPlayerState, type PlayerState } from "./save";
import { getCosmetic, reconcileUnlockedCosmetics } from "./cosmetics";
import { getSharedDropPool, sharedDropEntryChance, rollUnitsForBaseRap } from "./dropPools";
import { masteryEconomicModifiers } from "./mastery";
import { getSetsForCollectible } from "./sets";
import { usePlayerPersistence } from "./hooks/usePlayerPersistence";
import {
  formatDuration,
  isSkillTraining,
  MAX_ACTIVE_TRAININGS,
  processActiveTrainings,
  remainingTrainingMs,
  startSkillTraining,
  TRAINING_DURATIONS,
  TRAINING_RAP_PER_HOUR,
  trainingXpPerHour,
} from "./training";
import { MAX_LEVEL, levelFromXp, xpIntoLevel } from "./xp";

type Filter = "all" | "owned" | "unlockable" | "locked";
type SkillFilter = "all" | "trained" | "trainable" | "maxed";
type SortMode = "default" | "cost-asc" | "cost-desc" | "requirements-asc" | "requirements-desc";
type DetailView =
  | { type: "collectible"; item: Collectible }
  | { type: "skill"; skillId: SkillId }
  | { type: "activity"; activityId: GameplayActivityId }
  | { type: "manual-activity"; activity: ActivityOption };
type ContentPage =
  | { type: "main" }
  | { type: "collectibles" }
  | { type: "world" }
  | { type: "settings" }
  | { type: "bonuses" }
  | { type: "sets" }
  | { type: "profile" }
  | { type: "adventures"; from?: "main" | "world" }
  | { type: "category"; id: CategoryId; from?: "main" | "collectibles" };
type Page = ContentPage | {
  type: "handbook";
  mode: "context" | "index";
  context: HandbookContext;
  origin: ContentPage;
  originDetail: DetailView | null;
};
type CategoryProgress = {
  id: CategoryId;
  name: string;
  totalLabel: string;
  unlocked: number;
  total: number;
  percent: number;
};

type NavigationSnapshot = { page: Page; detailView: DetailView | null };

function handbookContextFor(page: ContentPage, detailView: DetailView | null) {
  if (detailView?.type === "collectible") {
    return createHandbookContext("collectible-detail", {
      title: detailView.item.name,
      intro: `This page explains ${detailView.item.name}, its ${detailView.item.type} classification, unlock state, source, cost, and requirements.`,
    });
  }

  if (detailView?.type === "skill") {
    const name = skillName(detailView.skillId);
    return createHandbookContext("skill-detail", {
      title: name,
      intro: `This page shows ${name} progression, XP toward the next level, current training state, and the timed training sessions available.`,
    });
  }

  if (detailView?.type === "activity") {
    const activity = getActivity(detailView.activityId);
    return createHandbookContext("activity-detail", {
      title: activity?.name ?? "Adventure Details",
      intro: activity
        ? `This page explains ${activity.name}, including its requirements, effective RAP cost, runtime, XP rewards, Skill Advantage, and Drop Table.`
        : undefined,
    });
  }

  if (detailView?.type === "manual-activity") {
    return createHandbookContext("manual-activity-detail", {
      title: detailView.activity.name,
      intro: `This page confirms a one-hour ${detailView.activity.name} entry and the RAP it adds to the account.`,
    });
  }

  if (page.type === "category") return createHandbookContext(`category:${page.id}`);
  return createHandbookContext(page.type);
}

export function App() {
  const { player, setPlayer, saveStatus, lastSavedAt, flushSave } = usePlayerPersistence();
  const [page, setPage] = useState<Page>({ type: "main" });
  const [filter, setFilter] = useState<Filter>("all");
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState<SortMode>("default");
  const [detailView, setDetailView] = useState<DetailView | null>(null);
  const [confirmItem, setConfirmItem] = useState<Collectible | null>(null);
  const [unlockNotice, setUnlockNotice] = useState<Collectible | null>(null);
  const [activityResultNotice, setActivityResultNotice] = useState<ActivityRunResult | null>(null);
  const [recentUnlocks, setRecentUnlocks] = useState<Collectible[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [importValue, setImportValue] = useState("");
  const showDevTools = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  const navigationReadyRef = useRef(false);
  const restoringHistoryRef = useRef(false);

  const title = page.type === "main"
    ? "Menu"
    : page.type === "collectibles"
      ? "Collectibles"
      : page.type === "settings"
        ? "Settings"
      : page.type === "world"
        ? "World"
        : page.type === "bonuses"
          ? "Account Bonuses"
          : page.type === "sets"
            ? "Sets"
            : page.type === "profile"
              ? "Profile"
        : page.type === "handbook"
          ? "Handbook"
          : page.type === "adventures"
            ? "Adventures"
            : categories.find((category) => category.id === page.id)?.name ?? "";

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const snapshot = (event.state as { idleLife?: NavigationSnapshot } | null)?.idleLife;
      if (!snapshot) return;
      restoringHistoryRef.current = true;
      setPage(snapshot.page);
      setDetailView(snapshot.detailView);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const snapshot: NavigationSnapshot = { page, detailView };
    if (!navigationReadyRef.current) {
      window.history.replaceState({ ...window.history.state, idleLife: snapshot }, "");
      navigationReadyRef.current = true;
      return;
    }
    if (restoringHistoryRef.current) {
      restoringHistoryRef.current = false;
      return;
    }
    window.history.pushState({ ...window.history.state, idleLife: snapshot }, "");
  }, [detailView, page]);
  useEffect(() => {
    if (player.activeTrainings.length === 0 && player.activeActivityRuns.length === 0) return;

    const intervalId = window.setInterval(() => {
      setPlayer((current) => processActiveActivityRuns(processActiveTrainings(current)));
    }, 5_000);

    return () => window.clearInterval(intervalId);
  }, [player.activeActivityRuns.length, player.activeTrainings.length, setPlayer]);

  useEffect(() => {
    const latest = player.activityResults[0];
    if (!latest || latest.id === player.lastSeenActivityResultId || activityResultNotice?.id === latest.id) return;

    const droppedItem = latest.droppedCollectibleId ? getCollectibleById(latest.droppedCollectibleId) : null;

    // A completed background run is an external event that opens a one-time result dialog.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActivityResultNotice(latest);
    if (droppedItem) {
      setRecentUnlocks((current) => [droppedItem, ...current.filter((candidate) => candidate.id !== droppedItem.id)].slice(0, 3));
    }
  }, [activityResultNotice?.id, player.activityResults, player.lastSeenActivityResultId]);

  useEffect(() => {
    if (!unlockNotice) return;

    const timeoutId = window.setTimeout(() => {
      setUnlockNotice(null);
    }, 3_200);

    return () => window.clearTimeout(timeoutId);
  }, [unlockNotice]);

  function grantRp() {
    setPlayer((current) => ({ ...current, rp: current.rp + 10_000, lifetimeRap: current.lifetimeRap + 10_000 }));
  }

  function logActivity(activity: ActivityOption) {
    const hours = 1;
    const rap = activityRap(activity, hours);
    const loggedAt = Date.now();
    const entry: ActivityLogEntry = {
      id: `${activity.id}-${loggedAt}`,
      activityId: activity.id,
      name: activity.name,
      hours,
      rap,
      loggedAt,
    };

    setPlayer((current) => ({
      ...current,
      rp: current.rp + rap,
      lifetimeRap: current.lifetimeRap + rap,
      activityLog: [entry, ...current.activityLog].slice(0, 8),
    }));
  }

  function trainSkill(skillId: SkillId, hours: number) {
    setPlayer((current) => {
      if (current.rp <= 0) return current;
      return startSkillTraining(current, skillId, hours);
    });
  }

  function runGameplayActivity(activityId: GameplayActivityId) {
    setPlayer((current) => startActivityRun(current, activityId));
  }

  function buyItem(item: Collectible) {
    if (player.owned.includes(item.id) || !canUnlock(item, player)) {
      setConfirmItem(null);
      return;
    }

    setPlayer((current) => {
      if (current.owned.includes(item.id) || !canUnlock(item, current)) return current;
      const owned = [...current.owned, item.id];
      return {
        ...current,
        rp: current.rp - item.cost,
        owned,
        unlockedCosmetics: reconcileUnlockedCosmetics(current.unlockedCosmetics, owned, current.contentMasteryPoints),
      };
    });
    setUnlockNotice(item);
    setRecentUnlocks((current) => [item, ...current.filter((candidate) => candidate.id !== item.id)].slice(0, 3));
    setConfirmItem(null);
    setDetailView(null);
  }

  function handleCollectiblePrimaryAction(item: Collectible) {
    if (canUnlock(item, player)) {
      setConfirmItem(item);
      return;
    }

    setDetailView({ type: "collectible", item });
  }

  function handleGameplayActivityPrimaryAction(activityId: GameplayActivityId) {
    const activity = getActivity(activityId);
    if (activity && canStartActivity(activity, player)) {
      runGameplayActivity(activityId);
      return;
    }

    setDetailView({ type: "activity", activityId });
  }

  function openHandbook() {
    if (page.type === "handbook") {
      if (page.mode === "context") setPage({ ...page, mode: "index" });
      return;
    }

    const context = handbookContextFor(page, detailView);
    setPage({
      type: "handbook",
      mode: "context",
      context,
      origin: page,
      originDetail: detailView,
    });
    setDetailView(null);
  }

  function exportSave() {
    flushSave();
    const blob = new Blob([exportPlayerState(player)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `idle-life-save-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importSave() {
    const imported = importPlayerState(importValue);
    if (!imported) return;
    setPlayer(imported);
    setImportValue("");
    setImportOpen(false);
  }

  const categoryProgress = useMemo(() => {
    return categories.map((category) => {
      if (category.id === "skills") {
        const totalLevel = skills.reduce((total, skill) => total + levelFromXp(player.skillXp[skill.id]), 0);
        const total = skills.length * MAX_LEVEL;
        return { ...category, unlocked: totalLevel, total, percent: completionPercent(totalLevel, total) };
      }

      const items = getCollectiblesByCategory(category.id);
      const unlocked = items.filter((item) => player.owned.includes(item.id)).length;
      return { ...category, unlocked, total: items.length, percent: completionPercent(unlocked, items.length) };
    });
  }, [player]);
  const totalActivityRuns = useMemo(() => Object.values(player.activityRunCounts).reduce((total, runs) => total + runs, 0), [player.activityRunCounts]);
  const setProgress = useMemo(() => ({
    completed: COLLECTION_SETS.filter((set) => set.collectibleIds.every((id) => player.owned.includes(id))).length,
    total: COLLECTION_SETS.length,
  }), [player.owned]);
  const selectedTheme = player.selectedCosmetics.themeId ? getCosmetic(player.selectedCosmetics.themeId)?.theme : undefined;
  const appThemeStyle = selectedTheme ? {
    "--color-canvas": selectedTheme.canvas,
    "--color-panel": selectedTheme.panel,
    "--color-gold": selectedTheme.accent,
    "--color-success": selectedTheme.success,
    "--color-danger": selectedTheme.danger,
  } as CSSProperties : undefined;

  return (
    <div className="app-shell" style={appThemeStyle}>
      <TopBar
        title={title}
        rp={player.rp}
        canGoBack={page.type !== "main" || detailView !== null}
        onBack={() => {
          window.history.back();
        }}
        onGrantRp={grantRp}
        onOpenHandbook={openHandbook}
        onOpenSettings={() => {
          setDetailView(null);
          setPage({ type: "settings" });
        }}
        handbookMode={page.type === "handbook" ? page.mode : undefined}
        settingsActive={page.type === "settings"}
        showDevTools={showDevTools}
      />

      <main className="content">
        {detailView?.type === "collectible" ? (
          <CollectibleDetailView
            item={detailView.item}
            player={player}
            onClose={() => setDetailView(null)}
            onBuy={() => setConfirmItem(detailView.item)}
          />
        ) : detailView?.type === "skill" ? (
          <SkillDetailView
            skillId={detailView.skillId}
            player={player}
            onClose={() => setDetailView(null)}
            onTrain={(hours) => trainSkill(detailView.skillId, hours)}
          />
        ) : detailView?.type === "activity" ? (
          <ActivityDetailView
            activityId={detailView.activityId}
            player={player}
            onClose={() => setDetailView(null)}
            onRun={() => runGameplayActivity(detailView.activityId)}
          />
        ) : detailView?.type === "manual-activity" ? (
          <ManualActivityDetailView
            activity={detailView.activity}
            onClose={() => setDetailView(null)}
            onLog={() => {
              logActivity(detailView.activity);
              setDetailView(null);
            }}
          />
        ) : page.type === "main" ? (
          <MainMenuPage
            activities={ACTIVITY_OPTIONS}
            categoryProgress={categoryProgress}
            totalActivityRuns={totalActivityRuns}
            activeActivityCount={player.activeActivityRuns.length}
            showFutureFeatures={showDevTools}
            onLogActivity={logActivity}
            onInspectActivity={(activity) => setDetailView({ type: "manual-activity", activity })}
            onOpenActivities={() => setPage({ type: "adventures", from: "main" })}
            onOpenBonuses={() => setPage({ type: "bonuses" })}
            onOpenSets={() => setPage({ type: "sets" })}
            onOpenProfile={() => setPage({ type: "profile" })}
            setProgress={setProgress}
            onOpenCategory={(id) => {
              setTypeFilter("all");
              setPage({ type: "category", id, from: "main" });
            }}
          />
        ) : page.type === "collectibles" ? (
          <CollectiblesOverviewPage
            progress={categoryProgress}
            recentUnlocks={recentUnlocks}
            setProgress={setProgress}
            onOpenSets={() => setPage({ type: "sets" })}
            onOpen={(id) => {
              setTypeFilter("all");
              setPage({ type: "category", id, from: "collectibles" });
            }}
          />
        ) : page.type === "settings" ? (
          <SettingsPage
            saveStatus={saveStatus}
            lastSavedAt={lastSavedAt}
            onSaveNow={flushSave}
            onExport={exportSave}
            onImport={() => setImportOpen(true)}
          />
        ) : page.type === "bonuses" ? (
          <AccountBonusesPage player={player} />
        ) : page.type === "sets" ? (
          <SetsPage player={player} />
        ) : page.type === "profile" ? (
          <ProfilePage
            player={player}
            onSelectTheme={(themeId) => setPlayer((current) => ({ ...current, selectedCosmetics: { ...current.selectedCosmetics, themeId } }))}
            onSelectBadge={(profileBadgeId) => setPlayer((current) => ({ ...current, selectedCosmetics: { ...current.selectedCosmetics, profileBadgeId } }))}
          />
        ) : page.type === "world" ? (
          <WorldPage
            player={player}
            onOpenActivities={() => setPage({ type: "adventures", from: "world" })}
          />
        ) : page.type === "handbook" ? (
          <HandbookPage
            key={`${page.context.id}:${page.mode}`}
            context={page.context}
            mode={page.mode}
            onOpenIndex={() => setPage({ ...page, mode: "index" })}
            onOpenContext={() => setPage({ ...page, mode: "context" })}
          />
        ) : page.type === "adventures" ? (
          <AdventuresPage
            player={player}
            onOpenActivity={(activityId) => setDetailView({ type: "activity", activityId })}
            onRunActivity={handleGameplayActivityPrimaryAction}
          />
        ) : page.id === "skills" ? (
          <SkillsPage player={player} skillFilter={skillFilter} onFilter={setSkillFilter} onOpenSkill={(skillId) => setDetailView({ type: "skill", skillId })} />
        ) : (
          <CollectionPage
            category={page.id}
            player={player}
            filter={filter}
            typeFilter={typeFilter}
            sort={sort}
            onFilter={setFilter}
            onTypeFilter={setTypeFilter}
            onSort={setSort}
            onOpenDetails={(item) => setDetailView({ type: "collectible", item })}
            onPrimaryAction={handleCollectiblePrimaryAction}
          />
        )}
      </main>

      {confirmItem && (
        <ConfirmDialog item={confirmItem} onCancel={() => setConfirmItem(null)} onConfirm={() => buyItem(confirmItem)} />
      )}
      {unlockNotice && <UnlockNotice item={unlockNotice} onClose={() => setUnlockNotice(null)} />}
      {activityResultNotice && (
        <ActivityResultPanel
          result={activityResultNotice}
          onClose={() => {
            const resultId = activityResultNotice.id;
            setActivityResultNotice(null);
            setPlayer((current) => ({ ...current, lastSeenActivityResultId: resultId }));
          }}
        />
      )}
      {importOpen && (
        <ImportDialog
          value={importValue}
          onChange={setImportValue}
          onCancel={() => {
            setImportOpen(false);
            setImportValue("");
          }}
          onImport={importSave}
        />
      )}
    </div>
  );
}

function CollectiblesOverviewPage({
  progress,
  recentUnlocks,
  onOpen,
  onOpenSets,
  setProgress,
}: {
  progress: CategoryProgress[];
  recentUnlocks: Collectible[];
  onOpen: (id: CategoryId) => void;
  onOpenSets: () => void;
  setProgress: { completed: number; total: number };
}) {
  return (
    <>
      <section className="tile-grid">
        {progress.map((category) => (
          <button key={category.id} className="category-tile" onClick={() => onOpen(category.id)}>
            <span className="tile-icon">
              <AppIcon category={category.id} />
            </span>
            <span className="tile-text">
              <strong>{category.name}</strong>
              <small>{category.totalLabel}</small>
            </span>
            <span className="tile-progress">
              <strong>{category.unlocked}/{category.total}</strong>
              <small>{category.percent}%</small>
            </span>
            <ChevronRight className="tile-chevron" size={18} />
            <span className="category-progress-track" aria-hidden="true">
              <span style={{ width: `${category.percent}%` }} />
            </span>
          </button>
        ))}
        <button className="category-tile" onClick={onOpenSets}>
          <span className="tile-icon"><Layers3 size={22} /></span>
          <span className="tile-text"><strong>Sets</strong><small>Cross-category collections</small></span>
          <span className="tile-progress"><strong>{setProgress.completed}/{setProgress.total}</strong><small>{setProgress.total ? Math.round((setProgress.completed / setProgress.total) * 100) : 0}%</small></span>
          <ChevronRight className="tile-chevron" size={18} />
        </button>
      </section>
      {recentUnlocks.length > 0 && (
        <section className="recent-unlocks" aria-label="Recent unlocks">
          <h2>Recent Unlocks</h2>
          <div>
            {recentUnlocks.map((item) => (
              <article key={item.id} className="recent-unlock">
                <TileVisual icon={item.icon} category={item.category} owned sourceType={item.source?.type} />
                <span>
                  <strong>{item.name}</strong>
                  <small>{categories.find((category) => category.id === item.category)?.name ?? item.type}</small>
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function WorldPage({
  player,
  onOpenActivities,
}: {
  player: PlayerState;
  onOpenActivities: () => void;
}) {
  const totalRuns = Object.values(player.activityRunCounts).reduce((total, runs) => total + runs, 0);
  const activeRuns = player.activeActivityRuns.length;

  return (
    <section className="tile-grid">
      <button className="category-tile adventure-entry" onClick={onOpenActivities}>
        <span className="tile-icon">
          <Compass size={23} strokeWidth={1.8} />
        </span>
        <span className="tile-text">
          <strong>Adventures</strong>
          <small>Repeatable journeys with XP, Mastery, and rare drops</small>
        </span>
        <span className="tile-progress">
          <strong>{formatNumber(totalRuns)}</strong>
          <small>{activeRuns > 0 ? `${activeRuns} active` : "runs"}</small>
        </span>
        <ChevronRight className="tile-chevron" size={18} />
      </button>
    </section>
  );
}

function ManualActivityDetailView({
  activity,
  onClose,
  onLog,
}: {
  activity: ActivityOption;
  onClose: () => void;
  onLog: () => void;
}) {
  return (
    <section className="detail-view manual-activity-detail" aria-label={`${activity.name} details`}>
      <button className="detail-close" onClick={onClose} aria-label="Close details">
        <X size={18} />
      </button>
      <div className="sheet-icon manual-activity-sheet-icon">
        <ActivityIcon activityId={activity.id} />
      </div>
      <div className="detail-status-row">
        <span className="status-pill ready">Manual Log</span>
        <span>1 hour</span>
        <span>+{formatNumber(activityRap(activity, 1))} RAP</span>
      </div>
      <h2>{activity.name}</h2>
      <p>Log one hour of real-life activity and add RAP to your account immediately.</p>
      <div className="purchase-panel">
        <div>
          <strong>Log Activity</strong>
          <span>This prototype uses fixed one-hour entries until real tracking is added later.</span>
        </div>
        <button className="primary-action detail-action" onClick={onLog}>
          Log 1 Hour
        </button>
      </div>
    </section>
  );
}

function AdventuresPage({
  player,
  onOpenActivity,
  onRunActivity,
}: {
  player: PlayerState;
  onOpenActivity: (activityId: GameplayActivityId) => void;
  onRunActivity: (activityId: GameplayActivityId) => void;
}) {
  return (
    <section className="activity-card-list">
      {GAMEPLAY_ACTIVITIES.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          player={player}
          onOpenActivity={onOpenActivity}
          onRunActivity={onRunActivity}
        />
      ))}
    </section>
  );
}

function ActivityCard({
  activity,
  player,
  onOpenActivity,
  onRunActivity,
}: {
  activity: GameplayActivity;
  player: PlayerState;
  onOpenActivity: (activityId: GameplayActivityId) => void;
  onRunActivity: (activityId: GameplayActivityId) => void;
}) {
  const running = isActivityRunning(player, activity.id);
  const requirementsReady = activityRequirementsMet(activity, player);
  const runCount = player.activityRunCounts[activity.id] ?? 0;
  const effective = effectiveActivityRun(activity, player);
  const masteryPoints = player.contentMasteryPoints[activity.masteryTrackId] ?? 0;
  const bestDrop = activity.drops.length > 0
    ? activity.drops.reduce((best, drop) => (drop.chance > best.chance ? drop : best), activity.drops[0])
    : null;
  const longPress = useLongPress({
    onPress: () => onRunActivity(activity.id),
    onLongPress: () => onOpenActivity(activity.id),
  });

  return (
    <button
      type="button"
      className={`activity-card ${running ? "running" : ""} ${requirementsReady ? "ready" : "locked"}`}
      aria-label={`${activity.name}. ${running ? "Running" : requirementsReady ? "Ready" : "Locked"}. Press to run; hold or open the context menu for details.`}
      {...longPress}
    >
      <span className="activity-card-icon">
        <GameplayActivityIcon activity={activity} />
      </span>
      <span className="activity-card-copy">
        <strong>{activity.name}</strong>
        <small>{activity.type}</small>
      </span>
      <span className="activity-card-stats">
        <strong>{formatNumber(effective.cost)} RAP</strong>
        <small>{runCount} Runs</small>
      </span>
      <MasteryProgress trackId={activity.masteryTrackId} points={masteryPoints} compact />
      {bestDrop && (
        <span className="source-strip activity-source-strip">
          Rare drop {formatDropChance(bestDrop, runCount)}
        </span>
      )}
    </button>
  );
}

function FilterBar({
  filter,
  typeFilter,
  types,
  sort,
  onFilter,
  onTypeFilter,
  onSort,
}: {
  filter: Filter;
  typeFilter: string;
  types: string[];
  sort: SortMode;
  onFilter: (filter: Filter) => void;
  onTypeFilter: (type: string) => void;
  onSort: (sort: SortMode) => void;
}) {
  return (
    <div className="filter-panel">
      <div className="segmented">
        {(["all", "owned", "unlockable", "locked"] as Filter[]).map((option) => (
          <button key={option} className={filter === option ? "active" : ""} onClick={() => onFilter(option)}>
            {option[0].toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
      {types.length > 1 && (
        <div className="type-filter" aria-label="Type filter">
          <button className={typeFilter === "all" ? "active" : ""} onClick={() => onTypeFilter("all")}>
            All Types
          </button>
          {types.map((type) => (
            <button key={type} className={typeFilter === type ? "active" : ""} onClick={() => onTypeFilter(type)}>
              {type}
            </button>
          ))}
        </div>
      )}
      <label className="select-row">
        <Search size={16} />
        <select value={sort} onChange={(event) => onSort(event.target.value as SortMode)}>
          <option value="default">Default order</option>
          <option value="cost-asc">Lowest cost</option>
          <option value="cost-desc">Highest cost</option>
          <option value="requirements-asc">Lowest requirements</option>
          <option value="requirements-desc">Highest requirements</option>
        </select>
      </label>
    </div>
  );
}

function CollectionPage({
  category,
  player,
  filter,
  typeFilter,
  sort,
  onFilter,
  onTypeFilter,
  onSort,
  onOpenDetails,
  onPrimaryAction,
}: {
  category: Exclude<CategoryId, "skills">;
  player: PlayerState;
  filter: Filter;
  typeFilter: string;
  sort: SortMode;
  onFilter: (filter: Filter) => void;
  onTypeFilter: (type: string) => void;
  onSort: (sort: SortMode) => void;
  onOpenDetails: (item: Collectible) => void;
  onPrimaryAction: (item: Collectible) => void;
}) {
  const categoryItems = useMemo(() => getCollectiblesByCategory(category), [category]);
  const types = useMemo(() => [...new Set(categoryItems.map((item) => item.type))].sort(), [categoryItems]);

  const items = useMemo(() => {
    let next = categoryItems;

    next = next.filter((item) => {
      const owned = player.owned.includes(item.id);
      const unlockable = canUnlock(item, player) && !owned;
      const locked = !owned && (isActivityDrop(item) || !requirementsMet(item, player));
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (filter === "owned") return owned;
      if (filter === "unlockable") return unlockable;
      if (filter === "locked") return locked;
      return true;
    });

    return [...next].sort((a, b) => {
      const statusDifference = collectibleStatusRank(a, player) - collectibleStatusRank(b, player);
      if (statusDifference !== 0) return statusDifference;
      if (sort === "cost-asc") return a.cost - b.cost;
      if (sort === "cost-desc") return b.cost - a.cost;
      if (sort === "requirements-asc") return highestRequirement(a) - highestRequirement(b);
      if (sort === "requirements-desc") return highestRequirement(b) - highestRequirement(a);
      return collectibleSortIndex(a) - collectibleSortIndex(b);
    });
  }, [categoryItems, filter, player, sort, typeFilter]);

  return (
    <>
      <FilterBar
        filter={filter}
        typeFilter={typeFilter}
        types={types}
        sort={sort}
        onFilter={onFilter}
        onTypeFilter={onTypeFilter}
        onSort={onSort}
      />
      <section className="card-grid">
        {items.map((item) => (
          <CollectibleCard
            key={item.id}
            item={item}
            player={player}
            onOpenDetails={onOpenDetails}
            onPrimaryAction={onPrimaryAction}
          />
        ))}
      </section>
    </>
  );
}

function CollectibleCard({
  item,
  player,
  onOpenDetails,
  onPrimaryAction,
}: {
  item: Collectible;
  player: PlayerState;
  onOpenDetails: (item: Collectible) => void;
  onPrimaryAction: (item: Collectible) => void;
}) {
  const owned = player.owned.includes(item.id);
  const status = collectibleStatus(item, player);
  const collectionSet = getSetsForCollectible(item.id)[0];
  const longPress = useLongPress({
    onPress: () => onPrimaryAction(item),
    onLongPress: () => onOpenDetails(item),
  });

  return (
    <button
      type="button"
      className={`icon-tile ${status} ${isActivityDrop(item) ? "activity-source" : ""}`}
      aria-label={`${item.name}, ${item.type}, ${statusLabel[status]}. Press for the primary action; hold or open the context menu for details.`}
      {...longPress}
    >
      {collectionSet && <small className="set-strip" style={{ "--set-color": collectionSet.color } as CSSProperties} aria-label={`${collectionSet.name} Set`} />}
      <TileVisual icon={item.icon} category={item.category} locked={status === "locked"} owned={owned} sourceType={item.source?.type} />
      <h2>{item.name}</h2>
      <span>{item.type}</span>
      {item.source?.type === "activity" && <small className="source-strip">Adventure Drop</small>}
    </button>
  );
}

function SkillsPage({
  player,
  skillFilter,
  onFilter,
  onOpenSkill,
}: {
  player: PlayerState;
  skillFilter: SkillFilter;
  onFilter: (filter: SkillFilter) => void;
  onOpenSkill: (skillId: SkillId) => void;
}) {
  const visibleSkills = skills.filter((skill) => {
    const level = levelFromXp(player.skillXp[skill.id]);
    if (skillFilter === "trained") return level > 1;
    if (skillFilter === "trainable") return player.rp > 0 && level < MAX_LEVEL;
    if (skillFilter === "maxed") return level >= MAX_LEVEL;
    return true;
  });

  return (
    <>
      <div className="filter-panel">
        <div className="segmented skill-tabs">
          {(["all", "trained", "trainable", "maxed"] as SkillFilter[]).map((option) => (
            <button key={option} className={skillFilter === option ? "active" : ""} onClick={() => onFilter(option)}>
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <section className="skill-list">
        {visibleSkills.map((skill) => {
          const xp = player.skillXp[skill.id];
          const levelInfo = xpIntoLevel(xp);
          const training = isSkillTraining(player, skill.id);
          return (
            <button type="button" className={`icon-tile skill-tile ${training ? "training" : ""}`} key={skill.id} onClick={() => onOpenSkill(skill.id)}>
              <TileVisual icon={skill.icon} category={categoryForSkill(skill.id)} />
              <h2 style={{ fontSize: skillNameFontSize(skill.name) }}>{skill.name}</h2>
              <span>Lv. {levelInfo.level}</span>
            </button>
          );
        })}
      </section>
    </>
  );
}

function CollectibleDetailView({
  item,
  player,
  onClose,
  onBuy,
}: {
  item: Collectible;
  player: PlayerState;
  onClose: () => void;
  onBuy: () => void;
}) {
  const owned = player.owned.includes(item.id);
  const unlockable = canUnlock(item, player) && !owned;
  const status = collectibleStatus(item, player);
  const sourceActivity = sourceActivityFor(item);
  const purchaseNote = owned
    ? "Already added to your Codex."
    : sourceActivity
      ? `This collectible drops from ${sourceActivity.name}.`
    : status === "locked"
      ? "Meet the requirements before unlocking."
      : player.rp < item.cost
        ? "Requirements met. Earn more RAP to unlock."
        : "Ready to unlock.";

  return (
    <section className={`detail-view collectible-detail ${status}`} aria-label={`${item.name} details`}>
      <button className="detail-close" onClick={onClose} aria-label="Close details">
        <X size={18} />
      </button>
      <div className="sheet-icon">
        {item.icon ? <img src={item.icon} alt="" draggable="false" /> : owned ? <Check size={32} /> : status === "ready" ? <Gem size={32} /> : <Lock size={32} />}
      </div>
      <div className="detail-status-row">
        <span className={`status-pill ${sourceActivity && owned ? "activity" : status}`}>{sourceActivity && owned ? "Adventure Drop" : statusLabel[status]}</span>
        <span>{sourceActivity ? sourceActivity.name : `${formatNumber(item.cost)} RAP`}</span>
      </div>
      <h2>{item.name}</h2>
      <p>{item.description}</p>
      <div className="sheet-meta">
        <span className={rarityClass[item.rarity]}>{item.rarity}</span>
        <span>{item.type}</span>
        {sourceActivity && <span className="source-meta">Source: {sourceActivity.name}</span>}
      </div>
      <RequirementList item={item} player={player} />
      {item.bonuses && item.bonuses.length > 0 && <CollectibleBonusList item={item} />}
      <div className="purchase-panel">
        <div>
          <strong>{sourceActivity ? "Source" : "Unlock"}</strong>
          <span>{purchaseNote}</span>
        </div>
        <button className="primary-action detail-action" disabled={!unlockable || !!sourceActivity} onClick={onBuy}>
          {collectibleActionLabel(item, player)}
        </button>
      </div>
    </section>
  );
}

function CollectibleBonusList({ item }: { item: Collectible }) {
  if (!item.bonuses || item.bonuses.length === 0) return null;

  return (
    <div className="activity-bonus-panel">
      <h3>Account Bonuses</h3>
      {item.bonuses.map((bonus, index) => (
        <div key={`${item.id}-${bonus.type}-${index}`} className="bonus-row">
          <span>Permanent</span>
          <strong>{formatBonusLabel(bonus)}</strong>
        </div>
      ))}
    </div>
  );
}

function SkillDetailView({
  skillId,
  player,
  onClose,
  onTrain,
}: {
  skillId: SkillId;
  player: PlayerState;
  onClose: () => void;
  onTrain: (hours: number) => void;
}) {
  const skill = skills.find((candidate) => candidate.id === skillId)!;
  const xp = player.skillXp[skillId];
  const levelInfo = xpIntoLevel(xp);
  const nextLevel = Math.min(levelInfo.level + 1, MAX_LEVEL);
  const activeTraining = player.activeTrainings.find((training) => training.skillId === skillId);
  const isMaxed = levelInfo.level >= MAX_LEVEL;
  const canStartNewTraining = activeTraining || player.activeTrainings.length < MAX_ACTIVE_TRAININGS;
  const disabledReason = isMaxed
    ? "Maximum level reached"
    : player.rp <= 0
      ? "No RAP available"
      : !canStartNewTraining
        ? "Maximum 3 active skills"
        : null;

  return (
    <section className={`detail-view ${activeTraining ? "training" : ""}`} aria-label={`${skill.name} details`}>
      <button className="detail-close" onClick={onClose} aria-label="Close details">
        <X size={18} />
      </button>
      <div className="sheet-icon">
        {skill.icon ? <img src={skill.icon} alt="" draggable="false" /> : <Swords size={32} />}
      </div>
      <h2>{skill.name}</h2>
      <p>
        Train this skill with RAP to unlock collectibles that require {skill.name} levels.
      </p>
      <div className="sheet-meta">
        <span>{skill.source}</span>
        <span>Level {levelInfo.level}</span>
        <span>{formatNumber(trainingXpPerHour(levelInfo.level))} XP/h</span>
        <span>{formatNumber(TRAINING_RAP_PER_HOUR)} RAP/h</span>
      </div>
      {activeTraining && (
        <div className="active-training-panel" aria-label={`${skill.name} training status`}>
          <strong>Training active</strong>
          <span>{formatDuration(remainingTrainingMs(activeTraining))} remaining</span>
        </div>
      )}
      <div className="skill-detail-track">
        <div className="xp-track" aria-label={`${skill.name} XP progress`}>
          <span style={{ width: `${Math.max(3, levelInfo.progress * 100)}%` }} />
        </div>
        <div className="skill-detail-stats">
          <span>{formatNumber(xp)} XP</span>
          <span>
            {levelInfo.level >= MAX_LEVEL
              ? "Maximum level"
              : `${formatNumber(levelInfo.next - xp)} XP to Level ${nextLevel}`}
          </span>
        </div>
      </div>
      <div className="training-actions">
        {TRAINING_DURATIONS.map((duration) => (
          <button
            key={duration.hours}
            className="primary-action"
            disabled={disabledReason !== null}
            onClick={() => onTrain(duration.hours)}
          >
            {duration.label}
          </button>
        ))}
      </div>
      {disabledReason && <p className="action-note">{disabledReason}</p>}
    </section>
  );
}

function ActivityDetailView({
  activityId,
  player,
  onClose,
  onRun,
}: {
  activityId: GameplayActivityId;
  player: PlayerState;
  onClose: () => void;
  onRun: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!player.activeActivityRuns.some((run) => run.activityId === activityId)) return;
    const intervalId = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(intervalId);
  }, [activityId, player.activeActivityRuns]);

  const activity = getActivity(activityId)!;
  const activeRun = player.activeActivityRuns.find((run) => run.activityId === activityId);
  const requirementsReady = activityRequirementsMet(activity, player);
  const runCount = player.activityRunCounts[activityId] ?? 0;
  const effective = effectiveActivityRun(activity, player);
  const masteryPoints = player.contentMasteryPoints[activity.masteryTrackId] ?? 0;
  const advantage = activitySkillAdvantage(activity, player);
  const activeBonuses = collectAccountBonuses(player.owned).filter((bonus) => {
    if (bonus.type === "skill-xp") return activity.xpRewards.some((reward) => reward.skillId === bonus.skillId);
    return bonus.type !== "resistance";
  });
  const canRun = canStartActivity(activity, player);
  const runProgress = activeRun
    ? Math.min(100, Math.max(3, ((now - activeRun.startedAt) / (activeRun.endsAt - activeRun.startedAt)) * 100))
    : 0;
  const disabledReason = activeRun
    ? "Adventure already running"
    : !requirementsReady
      ? "Requirements not met"
      : player.rp < effective.cost
        ? "Not enough RAP"
        : null;

  return (
    <section className={`detail-view activity-detail ${activeRun ? "training" : ""}`} aria-label={`${activity.name} details`}>
      <button className="detail-close" onClick={onClose} aria-label="Close details">
        <X size={18} />
      </button>
      <div className="sheet-icon activity-sheet-icon">
        <GameplayActivityIcon activity={activity} />
      </div>
      <div className="detail-status-row">
        <span className={`status-pill ${requirementsReady ? "ready" : "locked"}`}>{requirementsReady ? "Ready" : "Locked"}</span>
        <span>{formatNumber(effective.cost)} RAP</span>
        <span>{formatDuration(effective.runtimeMs)}</span>
      </div>
      <h2>{activity.name}</h2>
      <p>{activity.description}</p>
      <div className="sheet-meta">
        <span>{activity.type}</span>
        <span>{formatNumber(runCount)} Runs</span>
        <span>100% XP efficiency</span>
      </div>
      <MasteryProgress trackId={activity.masteryTrackId} points={masteryPoints} />
      <div className="activity-bonus-panel">
        <h3>Bonuses</h3>
        <div className="bonus-row">
          <span>Skill Advantage</span>
          <strong>
            +{advantage.xpBonusPercent.toFixed(1)}% XP, -{advantage.costReductionPercent.toFixed(1)}% RAP, -{advantage.runtimeReductionPercent.toFixed(1)}% runtime
          </strong>
        </div>
        <div className="bonus-row">
          <span>Content Mastery</span>
          <strong>{formatMasteryModifiers(effective.mastery)}</strong>
        </div>
        {activeBonuses.length === 0 ? (
          <div className="bonus-row muted">
            <span>Account Bonuses</span>
            <strong>None active</strong>
          </div>
        ) : (
          activeBonuses.map((bonus) => (
            <div key={`${bonus.collectibleId}-${bonus.type}`} className="bonus-row">
              <span>{bonus.collectibleName}</span>
              <strong>{formatBonusLabel(bonus)}</strong>
            </div>
          ))
        )}
      </div>
      {activeRun && (
        <div className="active-training-panel" aria-label={`${activity.name} run status`}>
          <strong>Adventure running</strong>
          <span>{formatDuration(Math.max(0, activeRun.endsAt - now))} remaining</span>
        </div>
      )}
      {activeRun && (
        <div className="skill-detail-track">
          <div className="xp-track activity-run-track" aria-label={`${activity.name} run progress`}>
            <span style={{ width: `${runProgress}%` }} />
          </div>
        </div>
      )}
      <ActivityRequirementList requirements={activity.requirements} player={player} />
      <div className="reward-list">
        <h3>XP Rewards</h3>
        {activity.xpRewards.map((reward) => (
          <div key={reward.skillId} className="reward-row">
            <span>{skillName(reward.skillId)}</span>
            <strong>{Math.round(reward.share * 100)}%{skillXpBonusPercent(player.owned, reward.skillId) > 0 ? ` +${skillXpBonusPercent(player.owned, reward.skillId)}%` : ""}</strong>
          </div>
        ))}
      </div>
      <ActivityDropTable activity={activity} player={player} runCount={runCount} />
      <div className="purchase-panel">
        <div>
          <strong>Run Adventure</strong>
          <span>Spend RAP now. XP and drops are awarded when the run finishes.</span>
        </div>
        <button className="primary-action detail-action" disabled={!canRun} onClick={onRun}>
          Start Adventure
        </button>
      </div>
      {disabledReason && <p className="action-note">{disabledReason}</p>}
    </section>
  );
}

function formatMasteryModifiers(modifiers: ReturnType<typeof masteryEconomicModifiers>) {
  const values = [
    modifiers.xpBonusPercent > 0 ? `+${modifiers.xpBonusPercent}% XP` : null,
    modifiers.costReductionPercent > 0 ? `-${modifiers.costReductionPercent}% RAP` : null,
    modifiers.runtimeReductionPercent > 0 ? `-${modifiers.runtimeReductionPercent}% runtime` : null,
    modifiers.additionalRollChancePercent > 0 ? `+${modifiers.additionalRollChancePercent}% roll` : null,
  ].filter(Boolean);
  return values.join(", ") || "No passive bonus yet";
}

function ActivityRequirementList({ requirements, player }: { requirements: Requirement[]; player: PlayerState }) {
  return (
    <div className="requirement-list">
      <h3>Requirements</h3>
      {requirements.length === 0 ? (
        <div className="requirement-row met">
          <span className="requirement-icon">
            <Check size={14} />
          </span>
          <span className="requirement-copy">
            <strong>No requirements</strong>
            <small>Ready by default</small>
          </span>
          <span className="requirement-state">Met</span>
        </div>
      ) : (
        requirements.map((requirement) => {
          const state = getRequirementState(requirement, player);
          const key = requirement.type === "skill" ? `${requirement.skillId}-${requirement.level}` : requirement.collectibleId;
          const skill = requirement.type === "skill" ? skills.find((candidate) => candidate.id === requirement.skillId) : null;
          const currentLevel = requirement.type === "skill" ? levelFromXp(player.skillXp[requirement.skillId]) : 0;
          const label = requirement.type === "skill" ? skillName(requirement.skillId) : requirement.label;
          const detail = requirement.type === "skill" ? `Level ${currentLevel} / ${requirement.level}` : state.current;

          return (
            <div key={key} className={`requirement-row ${state.met ? "met" : ""}`}>
              <span className="requirement-icon">
                {skill?.icon ? <img src={skill.icon} alt="" draggable="false" /> : <Swords size={15} />}
                <span className="requirement-badge" aria-hidden="true">
                  {state.met ? <Check size={9} /> : <Lock size={9} />}
                </span>
              </span>
              <span className="requirement-copy">
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
              <span className="requirement-state">{state.met ? "Met" : "Needed"}</span>
            </div>
          );
        })
      )}
    </div>
  );
}

function ActivityDropTable({
  activity,
  player,
  runCount,
}: {
  activity: GameplayActivity;
  player: PlayerState;
  runCount: number;
}) {
  const sharedPools = activity.sharedDropPoolIds.flatMap((poolId) => {
    const pool = getSharedDropPool(poolId);
    return pool ? [pool] : [];
  });
  const hasDrops = activity.drops.length > 0 || sharedPools.some((pool) => pool.entries.length > 0);
  return (
    <div className="drop-table">
      <h3>Drop Table</h3>
      {!hasDrops ? (
        <p>No collectible drops yet.</p>
      ) : (
        <>
        {activity.drops.map((drop) => {
          const item = activityDropItem(drop);
          const chance = activityDropChance(drop, runCount);
          const owned = item ? player.owned.includes(item.id) : false;
          const categoryName = item ? categories.find((category) => category.id === item.category)?.name ?? item.category : "Collectible";

          return (
            <div key={drop.collectibleId} className={`drop-row ${owned ? "owned" : ""}`}>
              <span className="drop-item-icon">
                {item ? <TileVisual icon={item.icon} category={item.category} owned={owned} sourceType={item.source?.type} /> : <Dice5 size={20} />}
              </span>
              <span className="drop-copy">
                <strong>{item?.name ?? drop.collectibleId}</strong>
                <small>{item ? `${item.rarity} ${categoryName}` : "Collectible Drop"}</small>
                <small>Base 1 / {drop.chance} - Current {formatDropChance(drop, runCount)}</small>
              </span>
              <span className="drop-state">{owned ? "Owned" : chance.isProtected ? "Protected" : "Unowned"}</span>
            </div>
          );
        })}
        {sharedPools.flatMap((pool) => pool.entries.map((entry) => {
          const item = getCollectibleById(entry.collectibleId);
          const owned = item ? player.owned.includes(item.id) : false;
          const accumulatedUnits = player.sharedDropPoolRollUnits[pool.id] ?? 0;
          const chance = sharedDropEntryChance(entry.denominator, accumulatedUnits, rollUnitsForBaseRap(activity.cost));
          const categoryName = item ? categories.find((category) => category.id === item.category)?.name ?? item.category : "Collectible";
          return (
            <div key={`${pool.id}-${entry.collectibleId}`} className={`drop-row shared ${owned ? "owned" : ""}`}>
              <span className="drop-item-icon">{item ? <TileVisual icon={item.icon} category={item.category} owned={owned} sourceType={item.source?.type} /> : <Dice5 size={20} />}</span>
              <span className="drop-copy">
                <strong>{item?.name ?? entry.collectibleId}</strong>
                <small>{pool.name} · {item ? `${item.rarity} ${categoryName}` : "Shared Chaser"}</small>
                <small>Base 1 / {formatNumber(entry.denominator)} · Current {chance.multiplier} / {formatNumber(entry.denominator)} · {formatNumber(accumulatedUnits)} Roll Units</small>
              </span>
              <span className="drop-state">{owned ? "Owned" : chance.isProtected ? "Protected" : "Shared"}</span>
            </div>
          );
        }))}
        </>
      )}
    </div>
  );
}

function RequirementList({ item, player }: { item: Collectible; player: PlayerState }) {
  return (
    <div className="requirement-list">
      <h3>Requirements</h3>
      {item.requirements.length === 0 ? (
        <div className="requirement-row met">
          <span className="requirement-icon">
            <Check size={14} />
          </span>
          <span className="requirement-copy">
            <strong>No requirements</strong>
            <small>Ready by default</small>
          </span>
          <span className="requirement-state">Met</span>
        </div>
      ) : (
        item.requirements.map((requirement) => {
          const state = getRequirementState(requirement, player);
          const key = requirement.type === "skill" ? `${requirement.skillId}-${requirement.level}` : requirement.collectibleId;
          const skill = requirement.type === "skill" ? skills.find((candidate) => candidate.id === requirement.skillId) : null;
          const requiredCollectible = requirement.type === "collectible" ? getCollectibleById(requirement.collectibleId) : null;
          const currentLevel = requirement.type === "skill" ? levelFromXp(player.skillXp[requirement.skillId]) : 0;
          const label = requirement.type === "skill" ? skillName(requirement.skillId) : requirement.label;
          const detail = requirement.type === "skill"
            ? `Level ${currentLevel} / ${requirement.level}`
            : state.current;

          return (
            <div key={key} className={`requirement-row ${state.met ? "met" : ""}`}>
              <span className="requirement-icon">
                {skill?.icon ? (
                  <img src={skill.icon} alt="" draggable="false" />
                ) : requiredCollectible?.icon ? (
                  <img src={requiredCollectible.icon} alt="" draggable="false" />
                ) : requirement.type === "skill" ? (
                  <Swords size={15} />
                ) : (
                  <AppIcon category={requiredCollectible?.category ?? item.category} />
                )}
                <span className="requirement-badge" aria-hidden="true">
                  {state.met ? <Check size={9} /> : <Lock size={9} />}
                </span>
              </span>
              <span className="requirement-copy">
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
              <span className="requirement-state">{state.met ? "Met" : "Needed"}</span>
            </div>
          );
        })
      )}
    </div>
  );
}
