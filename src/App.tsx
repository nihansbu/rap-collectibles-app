import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  Check,
  Archive,
  ChevronRight,
  Compass,
  Dice5,
  Gem,
  Lock,
  Search,
  Swords,
  X,
} from "lucide-react";
import {
  activityDropChance,
  activityDropItem,
  activityRequirementsMet,
  canStartActivity,
  effectiveActivityRun,
  GAMEPLAY_ACTIVITIES,
  getActivity,
  isActivityRunning,
  processActiveActivityRuns,
  startActivityRun,
  type ActivityRunResult,
  type GameplayActivity,
  type GameplayActivityId,
} from "./activities";
import { formatBonusLabel, skillXpBonusPercent } from "./bonuses";
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
import { categories, COLLECTION_SETS, type AchievementDefinition, type CategoryId, type Collectible, type Requirement, skills, type SkillCapeDefinition, type SkillId } from "./data";
import { ACTIVITY_OPTIONS, activityRap, type ActivityLogEntry, type ActivityOption } from "./economy";
import { completionPercent, formatNumber } from "./format";
import { createHandbookContext, type HandbookContext } from "./handbook";
import { HandbookPage } from "./pages/HandbookPage";
import { MainMenuPage } from "./pages/MainMenuPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AccountBonusesPage } from "./pages/AccountBonusesPage";
import { SetsPage } from "./pages/SetsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { VaultPage } from "./pages/VaultPage";
import { SkillCapesPage } from "./pages/SkillCapesPage";
import { TopBar } from "./ui/TopBar";
import { ActivityResultPanel, ConfirmDialog, ImportDialog, UnlockNotice } from "./ui/dialogs";
import { ActivityIcon, AppIcon, GameplayActivityIcon, TileVisual } from "./ui/icons";
import { MasteryRing } from "./ui/MasteryProgress";
import { AdventureInfoPanel, type AdventureInfoPanelDetails } from "./ui/AdventureInfoPanel";
import { exportPlayerState, importPlayerState, type PlayerState } from "./save";
import { getCosmetic, reconcileUnlockedCosmetics } from "./cosmetics";
import { getAchievement } from "./achievements";
import { getSkillCape, skillCapeSummary } from "./skillCapes";
import { getSharedDropPool, sharedDropEntryChance, rollUnitsForBaseRap } from "./dropPools";
import { masteryProgress } from "./mastery";
import { getSetsForCollectible } from "./sets";
import { usePlayerPersistence } from "./hooks/usePlayerPersistence";
import {
  formatDuration,
  isSkillTraining,
  MAX_ACTIVE_TRAININGS,
  processActiveTrainings,
  remainingTrainingMs,
  startSkillTraining,
  stopSkillTraining,
  TRAINING_RAP_PER_HOUR,
  TRAINING_WINDOW_HOURS,
  trainingXpPerHour,
} from "./training";
import { MAX_LEVEL, levelFromXp, xpIntoLevel } from "./xp";
import { AchievementToast } from "./ui/AchievementToast";
import { SkillCapeToast } from "./ui/SkillCapeToast";
import { InspectableImage } from "./ui/IconInspect";

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
  | { type: "vault" }
  | { type: "sets" }
  | { type: "skill-capes" }
  | { type: "profile" }
  | { type: "achievements" }
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
  const [adventureInfoPanel, setAdventureInfoPanel] = useState<AdventureInfoPanelDetails | null>(null);
  const [recentUnlocks, setRecentUnlocks] = useState<Collectible[]>([]);
  const [achievementQueue, setAchievementQueue] = useState<AchievementDefinition[]>([]);
  const [skillCapeQueue, setSkillCapeQueue] = useState<SkillCapeDefinition[]>([]);
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
          : page.type === "vault"
            ? "Vault"
            : page.type === "sets"
              ? "Sets"
              : page.type === "skill-capes"
                ? "Skill Capes"
                : page.type === "profile"
                  ? "Profile"
                  : page.type === "achievements"
                    ? "Achievements"
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

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const latest = player.activityResults[0];
    if (!latest || latest.id === player.lastSeenActivityResultId || activityResultNotice?.id === latest.id) return;

    const droppedItem = latest.droppedCollectibleId ? getCollectibleById(latest.droppedCollectibleId) : null;

    // A completed background run is an external event that opens a one-time result dialog.
    setActivityResultNotice(latest);
    if (droppedItem) {
      setRecentUnlocks((current) => [droppedItem, ...current.filter((candidate) => candidate.id !== droppedItem.id)].slice(0, 3));
    }
  }, [activityResultNotice?.id, player.activityResults, player.lastSeenActivityResultId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!unlockNotice) return;

    const timeoutId = window.setTimeout(() => {
      setUnlockNotice(null);
    }, 3_200);

    return () => window.clearTimeout(timeoutId);
  }, [unlockNotice]);

  useEffect(() => {
    const notified = new Set(player.notifiedAchievementIds);
    const newlyCompleted = Object.keys(player.completedAchievements)
      .filter((id) => !notified.has(id))
      .map(getAchievement)
      .filter((achievement): achievement is AchievementDefinition => Boolean(achievement));
    if (newlyCompleted.length === 0) return;

    // Completion reconciliation is account state; this effect only queues its one-time presentation.
    setAchievementQueue((current) => [
      ...current,
      ...newlyCompleted.filter((achievement) => !current.some((queued) => queued.id === achievement.id)),
    ]);
    setPlayer((current) => ({
      ...current,
      notifiedAchievementIds: [...new Set([...current.notifiedAchievementIds, ...newlyCompleted.map((achievement) => achievement.id)])],
    }));
  }, [player.completedAchievements, player.notifiedAchievementIds, setPlayer]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (achievementQueue.length === 0) return;
    const timeoutId = window.setTimeout(() => {
      setAchievementQueue((current) => current.slice(1));
    }, 5_200);
    return () => window.clearTimeout(timeoutId);
  }, [achievementQueue]);

  useEffect(() => {
    const notified = new Set(player.notifiedSkillCapeIds);
    const newlyUnlocked = player.ownedSkillCapes
      .filter((id) => !notified.has(id))
      .map(getSkillCape)
      .filter((cape): cape is SkillCapeDefinition => Boolean(cape));
    if (newlyUnlocked.length === 0) return;

    // Skill Cape entitlements are persisted separately from their one-time notification presentation.
    setSkillCapeQueue((current) => [
      ...current,
      ...newlyUnlocked.filter((cape) => !current.some((queued) => queued.id === cape.id)),
    ]);
    setPlayer((current) => ({
      ...current,
      notifiedSkillCapeIds: [...new Set([...current.notifiedSkillCapeIds, ...newlyUnlocked.map((cape) => cape.id)])],
    }));
  }, [player.notifiedSkillCapeIds, player.ownedSkillCapes, setPlayer]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (skillCapeQueue.length === 0) return;
    const timeoutId = window.setTimeout(() => {
      setSkillCapeQueue((current) => current.slice(1));
    }, 5_200);
    return () => window.clearTimeout(timeoutId);
  }, [skillCapeQueue]);

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

  function toggleSkillTraining(skillId: SkillId) {
    setPlayer((current) => {
      const now = Date.now();
      const processed = processActiveTrainings(current, now);
      return isSkillTraining(processed, skillId)
        ? stopSkillTraining(processed, skillId, now)
        : startSkillTraining(processed, skillId, now);
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
  const capeProgress = useMemo(() => {
    const summary = skillCapeSummary(player.ownedSkillCapes);
    return { unlocked: summary.total, total: summary.totalCapes };
  }, [player.ownedSkillCapes]);
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
            onToggleTraining={() => toggleSkillTraining(detailView.skillId)}
          />
        ) : detailView?.type === "activity" ? (
          <ActivityDetailView
            activityId={detailView.activityId}
            player={player}
            onClose={() => setDetailView(null)}
            onRun={() => runGameplayActivity(detailView.activityId)}
            onOpenInfo={(details) => setAdventureInfoPanel(details)}
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
            onOpenVault={() => setPage({ type: "vault" })}
            onOpenProfile={() => setPage({ type: "profile" })}
            onOpenAchievements={() => setPage({ type: "achievements" })}
            achievementPoints={player.achievementPoints}
            skillCapeProgress={capeProgress}
            onOpenCategory={(id) => {
              setTypeFilter("all");
              setPage({ type: "category", id, from: "main" });
            }}
          />
        ) : page.type === "collectibles" ? (
          <CollectiblesOverviewPage
            progress={categoryProgress}
            recentUnlocks={recentUnlocks}
            capeProgress={capeProgress}
            onOpenVault={() => setPage({ type: "vault" })}
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
        ) : page.type === "vault" ? (
          <VaultPage
            player={player}
            setProgress={setProgress}
            onOpenSets={() => setPage({ type: "sets" })}
            onOpenSkillCapes={() => setPage({ type: "skill-capes" })}
          />
        ) : page.type === "sets" ? (
          <SetsPage player={player} />
        ) : page.type === "skill-capes" ? (
          <SkillCapesPage player={player} onOpenSkill={(skillId) => setDetailView({ type: "skill", skillId })} />
        ) : page.type === "profile" ? (
          <ProfilePage
            player={player}
            onSelectTheme={(themeId) => setPlayer((current) => ({ ...current, selectedCosmetics: { ...current.selectedCosmetics, themeId } }))}
            onSelectBadge={(profileBadgeId) => setPlayer((current) => ({ ...current, selectedCosmetics: { ...current.selectedCosmetics, profileBadgeId } }))}
            onSelectTitle={(titleId) => setPlayer((current) => ({ ...current, selectedCosmetics: { ...current.selectedCosmetics, titleId } }))}
          />
        ) : page.type === "achievements" ? (
          <AchievementsPage player={player} />
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
          />
        )}
      </main>

      {confirmItem && (
        <ConfirmDialog item={confirmItem} onCancel={() => setConfirmItem(null)} onConfirm={() => buyItem(confirmItem)} />
      )}
      {unlockNotice && <UnlockNotice item={unlockNotice} onClose={() => setUnlockNotice(null)} />}
      {achievementQueue[0] && <AchievementToast achievement={achievementQueue[0]} onClose={() => setAchievementQueue((current) => current.slice(1))} />}
      {skillCapeQueue[0] && <SkillCapeToast cape={skillCapeQueue[0]} onClose={() => setSkillCapeQueue((current) => current.slice(1))} />}
      {adventureInfoPanel && <AdventureInfoPanel details={adventureInfoPanel} onClose={() => setAdventureInfoPanel(null)} />}
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
  onOpenVault,
  capeProgress,
}: {
  progress: CategoryProgress[];
  recentUnlocks: Collectible[];
  onOpen: (id: CategoryId) => void;
  onOpenVault: () => void;
  capeProgress: { unlocked: number; total: number };
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
        <button className="category-tile" onClick={onOpenVault}>
          <span className="tile-icon"><Archive size={22} /></span>
          <span className="tile-text"><strong>Vault</strong><small>Sets and Skill Capes</small></span>
          <span className="tile-progress"><strong>{capeProgress.unlocked}/{capeProgress.total}</strong><small>{capeProgress.total ? Math.round((capeProgress.unlocked / capeProgress.total) * 100) : 0}%</small></span>
          <ChevronRight className="tile-chevron" size={18} />
        </button>
      </section>
      {recentUnlocks.length > 0 && (
        <section className="recent-unlocks" aria-label="Recent unlocks">
          <h2>Recent Unlocks</h2>
          <div>
            {recentUnlocks.map((item) => (
              <article key={item.id} className="recent-unlock">
                <TileVisual icon={item.icon} category={item.category} owned label={item.name} inspectSubtitle="Recent unlock" sourceType={item.source?.type} />
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

function AdventuresPage({ player, onOpenActivity }: { player: PlayerState; onOpenActivity: (activityId: GameplayActivityId) => void }) {
  return (
    <section className="adventure-grid" aria-label="Adventures">
      {GAMEPLAY_ACTIVITIES.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} player={player} onOpenActivity={onOpenActivity} />
      ))}
    </section>
  );
}

function ActivityCard({ activity, player, onOpenActivity }: { activity: GameplayActivity; player: PlayerState; onOpenActivity: (activityId: GameplayActivityId) => void }) {
  const running = isActivityRunning(player, activity.id);
  const requirementsReady = activityRequirementsMet(activity, player);
  const playable = canStartActivity(activity, player);
  const runCount = player.activityRunCounts[activity.id] ?? 0;
  const masteryPoints = player.contentMasteryPoints[activity.masteryTrackId] ?? 0;
  const mastery = masteryProgress(activity.masteryTrackId, masteryPoints);
  const primarySkill = activity.xpRewards[0]?.skillId;
  const state = running ? "running" : playable ? "playable" : requirementsReady ? "unfunded" : "locked";

  return (
    <button
      type="button"
      className={`adventure-tile ${state}`}
      aria-label={`${activity.name}. ${playable ? "Playable" : requirementsReady ? "Requirements met" : "Locked"}. Mastery ${mastery.level} of 50.`}
      onClick={() => onOpenActivity(activity.id)}
    >
      <MasteryRing trackId={activity.masteryTrackId} points={masteryPoints}>
        <span className="adventure-tile-icon-core"><GameplayActivityIcon activity={activity} /></span>
      </MasteryRing>
      <strong>{activity.name}</strong>
      <small>{primarySkill ? skillName(primarySkill) : activity.type}</small>
      <span className="adventure-tile-meta"><b>M{mastery.level}</b><small>{formatNumber(runCount)} runs</small></span>
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
}: {
  item: Collectible;
  player: PlayerState;
  onOpenDetails: (item: Collectible) => void;
}) {
  const owned = player.owned.includes(item.id);
  const status = collectibleStatus(item, player);
  const collectionSet = getSetsForCollectible(item.id)[0];

  return (
    <button
      type="button"
      className={`icon-tile ${status} ${isActivityDrop(item) ? "activity-source" : ""}`}
      aria-label={`${item.name}, ${item.type}, ${statusLabel[status]}. Open details.`}
      onClick={() => onOpenDetails(item)}
    >
      {collectionSet && <small className="set-strip" style={{ "--set-color": collectionSet.color } as CSSProperties} aria-label={`${collectionSet.name} Set`} />}
      <TileVisual icon={item.icon} category={item.category} locked={status === "locked"} owned={owned} label={item.name} inspectSubtitle={item.type} inspectable={false} sourceType={item.source?.type} />
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
              {skill.icon ? <TileVisual icon={skill.icon} category={categoryForSkill(skill.id)} label={skill.name} inspectSubtitle="Skill icon" inspectable={false} /> : <TileVisual category={categoryForSkill(skill.id)} />}
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
      <div className="detail-artwork" aria-label={`${item.name} artwork`}>
        {item.icon ? <img src={item.icon} alt={item.name} draggable="false" /> : owned ? <Check size={42} /> : status === "ready" ? <Gem size={42} /> : <Lock size={42} />}
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
  onToggleTraining,
}: {
  skillId: SkillId;
  player: PlayerState;
  onClose: () => void;
  onToggleTraining: () => void;
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
      <div className="detail-artwork" aria-label={`${skill.name} artwork`}>
        {skill.icon ? <img src={skill.icon} alt={skill.name} draggable="false" /> : <Swords size={42} />}
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
      <div className="training-actions single-action">
        <button
          className={`primary-action training-toggle ${activeTraining ? "stop" : "start"}`}
          disabled={!activeTraining && disabledReason !== null}
          onClick={onToggleTraining}
        >
          {activeTraining ? "Stop Training" : `Start ${TRAINING_WINDOW_HOURS}h Training`}
        </button>
      </div>
      <p className="action-note">
        {activeTraining
          ? "Stopping is free and keeps all XP already earned."
          : disabledReason ?? `Runs for up to ${TRAINING_WINDOW_HOURS} hours - Maximum ${MAX_ACTIVE_TRAININGS} active skills`}
      </p>
    </section>
  );
}

function ActivityDetailView({
  activityId,
  player,
  onClose,
  onRun,
  onOpenInfo,
}: {
  activityId: GameplayActivityId;
  player: PlayerState;
  onClose: () => void;
  onRun: () => void;
  onOpenInfo: (details: AdventureInfoPanelDetails) => void;
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
  const mastery = masteryProgress(activity.masteryTrackId, masteryPoints);
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
      <div className="activity-detail-hero">
        <MasteryRing trackId={activity.masteryTrackId} points={masteryPoints}>
          <span className={`activity-detail-icon-core ${requirementsReady ? "playable" : "locked"}`}><GameplayActivityIcon activity={activity} /></span>
        </MasteryRing>
        <h2>{activity.name}</h2>
        <div className="activity-mastery-label">
          <strong>Mastery Level {mastery.level} / 50</strong>
          <small>{mastery.isMaxed ? "Mastered" : `${formatNumber(mastery.points)} / ${formatNumber(mastery.nextLevelPoints)} RAP`}</small>
        </div>
      </div>
      <div className="detail-status-row">
        <span className={`status-pill ${requirementsReady ? "ready" : "locked"}`}>{requirementsReady ? "Ready" : "Locked"}</span>
        <span>{formatNumber(effective.cost)} RAP</span>
        <span>{formatDuration(effective.runtimeMs)}</span>
        <span>{formatNumber(runCount)} Runs</span>
      </div>
      <p>{activity.description}</p>
      <div className="sheet-meta">
        <span>{activity.type}</span>
        <span>{activity.xpRewards.map((reward) => skillName(reward.skillId)).join(" · ")}</span>
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
      <ActivityRequirementList requirements={activity.requirements} player={player} onOpenInfo={onOpenInfo} />
      <div className="reward-list">
        <h3>XP Rewards</h3>
        {activity.xpRewards.map((reward) => (
          <div key={reward.skillId} className="reward-row">
            <span>{skillName(reward.skillId)}</span>
            <strong>{Math.round(reward.share * 100)}%{skillXpBonusPercent(player.owned, reward.skillId) > 0 ? ` +${skillXpBonusPercent(player.owned, reward.skillId)}%` : ""}</strong>
          </div>
        ))}
      </div>
      <ActivityDropTable activity={activity} player={player} runCount={runCount} onOpenInfo={onOpenInfo} />
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

function ActivityRequirementList({
  requirements,
  player,
  onOpenInfo,
}: {
  requirements: Requirement[];
  player: PlayerState;
  onOpenInfo: (details: AdventureInfoPanelDetails) => void;
}) {
  return (
    <div className="requirement-list activity-requirements">
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
        <div className="activity-requirements-grid">
          {requirements.map((requirement) => {
          const state = getRequirementState(requirement, player);
          const key = requirement.type === "skill" ? `${requirement.skillId}-${requirement.level}` : requirement.collectibleId;
          const skill = requirement.type === "skill" ? skills.find((candidate) => candidate.id === requirement.skillId) : null;
          const currentLevel = requirement.type === "skill" ? levelFromXp(player.skillXp[requirement.skillId]) : 0;
          const label = requirement.type === "skill" ? skillName(requirement.skillId) : requirement.label;
          const detail = requirement.type === "skill" ? `${currentLevel} / ${requirement.level}` : state.current;

          const requiredCollectible = requirement.type === "collectible" ? getCollectibleById(requirement.collectibleId) : null;
          const icon = skill?.icon ?? requiredCollectible?.icon;
          return (
            <button
              key={key}
              type="button"
              className={`activity-requirement-tile ${state.met ? "met" : "needed"}`}
              onClick={() => onOpenInfo({
                kind: "requirement",
                title: label,
                icon,
                subtitle: requirement.type === "skill" ? "Skill Requirement" : "Collectible Requirement",
                value: detail,
                met: state.met,
              })}
              aria-label={`${label}. ${detail}. ${state.met ? "Met" : "Needed"}`}
            >
              <span className="activity-requirement-art">
                {icon ? <InspectableImage src={icon} title={label} subtitle="Requirement" /> : <Swords size={17} />}
                <span className="requirement-badge" aria-hidden="true">
                  {state.met ? <Check size={9} /> : <Lock size={9} />}
                </span>
              </span>
              <span className="activity-requirement-copy">
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
              <span className="requirement-state">{state.met ? "Met" : "Needed"}</span>
            </button>
          );
          })}
        </div>
      )}
    </div>
  );
}

function ActivityDropTable({
  activity,
  player,
  runCount,
  onOpenInfo,
}: {
  activity: GameplayActivity;
  player: PlayerState;
  runCount: number;
  onOpenInfo: (details: AdventureInfoPanelDetails) => void;
}) {
  const sharedPools = activity.sharedDropPoolIds.flatMap((poolId) => {
    const pool = getSharedDropPool(poolId);
    return pool ? [pool] : [];
  });
  const hasDrops = activity.drops.length > 0 || sharedPools.some((pool) => pool.entries.length > 0);
  return (
    <div className="drop-table activity-drops">
      <h3>Drops</h3>
      {!hasDrops ? (
        <p>No collectible drops yet.</p>
      ) : (
        <div className="activity-drop-grid">
        {activity.drops.map((drop) => {
          const item = activityDropItem(drop);
          const chance = activityDropChance(drop, runCount);
          const owned = item ? player.owned.includes(item.id) : false;
          const categoryName = item ? categories.find((category) => category.id === item.category)?.name ?? item.category : "Collectible";
          const chanceLabel = chance.numerator === 1 ? `1 / ${chance.denominator}` : `${chance.numerator} / ${chance.denominator}`;

          return (
            <button
              key={drop.collectibleId}
              type="button"
              className={`activity-drop-tile ${owned ? "owned" : "unowned"}`}
              onClick={() => onOpenInfo({
                kind: "drop",
                title: item?.name ?? drop.collectibleId,
                icon: item?.icon,
                subtitle: item ? `${item.rarity} ${categoryName}` : "Collectible Drop",
                chance: chanceLabel,
                baseChance: `1 / ${drop.chance}`,
                state: owned ? "owned" : "unowned",
              })}
              aria-label={`${item?.name ?? drop.collectibleId}. ${chanceLabel}. ${owned ? "Owned" : "Not collected"}`}
            >
              <span className="drop-item-icon">
                {item ? <TileVisual icon={item.icon} category={item.category} owned={owned} label={item.name} inspectSubtitle="Adventure drop" sourceType={item.source?.type} /> : <Dice5 size={20} />}
              </span>
              <span className="drop-copy">
                <strong>{item?.name ?? drop.collectibleId}</strong>
                <small>{chanceLabel}</small>
              </span>
              <span className="drop-state">{owned ? "Owned" : chance.isProtected ? "Protected" : "Unowned"}</span>
            </button>
          );
        })}
        {sharedPools.flatMap((pool) => pool.entries.map((entry) => {
          const item = getCollectibleById(entry.collectibleId);
          const owned = item ? player.owned.includes(item.id) : false;
          const accumulatedUnits = player.sharedDropPoolRollUnits[pool.id] ?? 0;
          const chance = sharedDropEntryChance(entry.denominator, accumulatedUnits, rollUnitsForBaseRap(activity.cost));
          const categoryName = item ? categories.find((category) => category.id === item.category)?.name ?? item.category : "Collectible";
          const chanceLabel = `${chance.multiplier} / ${formatNumber(entry.denominator)}`;
          return (
            <button
              key={`${pool.id}-${entry.collectibleId}`}
              type="button"
              className={`activity-drop-tile ${owned ? "owned" : "shared"}`}
              onClick={() => onOpenInfo({
                kind: "drop",
                title: item?.name ?? entry.collectibleId,
                icon: item?.icon,
                subtitle: `${pool.name} · ${item ? `${item.rarity} ${categoryName}` : "Shared Chaser"}${chance.isProtected ? " · Protected" : ""}`,
                chance: chanceLabel,
                baseChance: `1 / ${formatNumber(entry.denominator)}`,
                state: owned ? "owned" : "shared",
              })}
              aria-label={`${item?.name ?? entry.collectibleId}. ${chanceLabel}. ${owned ? "Owned" : "Shared drop"}`}
            >
              <span className="drop-item-icon">{item ? <TileVisual icon={item.icon} category={item.category} owned={owned} label={item.name} inspectSubtitle="Shared drop" sourceType={item.source?.type} /> : <Dice5 size={20} />}</span>
              <span className="drop-copy">
                <strong>{item?.name ?? entry.collectibleId}</strong>
                <small>{chanceLabel}</small>
              </span>
              <span className="drop-state">{owned ? "Owned" : chance.isProtected ? "Protected" : "Shared"}</span>
            </button>
          );
        }))}
        </div>
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
                  <InspectableImage src={skill.icon} title={skill.name} subtitle="Skill requirement" />
                ) : requiredCollectible?.icon ? (
                  <InspectableImage src={requiredCollectible.icon} title={requiredCollectible.name} subtitle="Collectible requirement" />
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
