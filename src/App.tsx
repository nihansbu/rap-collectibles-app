import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Gem,
  Info,
  Lock,
  Plus,
  Search,
  Shield,
  Sparkles,
  Swords,
  X,
} from "lucide-react";
import { categories, collectibles, type CategoryId, type Collectible, type Requirement, skills, type SkillId } from "./data";
import { MAX_LEVEL, levelFromXp, xpIntoLevel, xpTable } from "./xp";

type Filter = "all" | "owned" | "unlockable" | "locked";
type SkillFilter = "all" | "trained" | "trainable" | "maxed";
type SortMode = "default" | "cost-asc" | "cost-desc" | "requirements-asc" | "requirements-desc";
type Page = { type: "home" } | { type: "category"; id: CategoryId };

type PlayerState = {
  rp: number;
  owned: string[];
  skillXp: Record<SkillId, number>;
};

const initialSkillXp = Object.fromEntries(skills.map((skill) => [skill.id, 0])) as Record<SkillId, number>;

const initialPlayer: PlayerState = {
  rp: 0,
  owned: [],
  skillXp: initialSkillXp,
};

const rarityClass: Record<Collectible["rarity"], string> = {
  Common: "rarity-common",
  Uncommon: "rarity-uncommon",
  Rare: "rarity-rare",
  Epic: "rarity-epic",
  Legendary: "rarity-legendary",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function skillName(skillId: SkillId) {
  return skills.find((skill) => skill.id === skillId)?.name ?? skillId;
}

function highestRequirement(item: Collectible) {
  return item.requirements.reduce((highest, requirement) => {
    if (requirement.type !== "skill") return highest;
    return Math.max(highest, requirement.level);
  }, 0);
}

function getRequirementState(requirement: Requirement, player: PlayerState) {
  if (requirement.type === "collectible") {
    return {
      label: requirement.label,
      met: player.owned.includes(requirement.collectibleId),
      current: player.owned.includes(requirement.collectibleId) ? "Owned" : "Missing",
    };
  }

  const currentLevel = levelFromXp(player.skillXp[requirement.skillId]);
  return {
    label: `${skillName(requirement.skillId)} ${requirement.level}`,
    met: currentLevel >= requirement.level,
    current: `Level ${currentLevel}`,
  };
}

function canUnlock(item: Collectible, player: PlayerState) {
  return (
    player.rp >= item.cost &&
    item.requirements.every((requirement) => getRequirementState(requirement, player).met)
  );
}

function requirementsText(item: Collectible) {
  if (item.requirements.length === 0) return "No requirements";
  return item.requirements
    .map((requirement) =>
      requirement.type === "skill" ? `${skillName(requirement.skillId)} ${requirement.level}` : requirement.label,
    )
    .join(", ");
}

function AppIcon({ category }: { category: CategoryId }) {
  const common = { size: 22, strokeWidth: 1.8 };
  if (category === "characters") return <Shield {...common} />;
  if (category === "skills") return <Swords {...common} />;
  if (category === "pets") return <Sparkles {...common} />;
  return <Gem {...common} />;
}

export function App() {
  const [player, setPlayer] = useState<PlayerState>(initialPlayer);
  const [page, setPage] = useState<Page>({ type: "home" });
  const [filter, setFilter] = useState<Filter>("all");
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("all");
  const [sort, setSort] = useState<SortMode>("default");
  const [detailItem, setDetailItem] = useState<Collectible | null>(null);
  const [confirmItem, setConfirmItem] = useState<Collectible | null>(null);

  const title = page.type === "home" ? "Collectibles" : categories.find((category) => category.id === page.id)?.name ?? "";

  function grantRp() {
    setPlayer((current) => ({ ...current, rp: current.rp + 10_000 }));
  }

  function trainSkill(skillId: SkillId) {
    setPlayer((current) => {
      const xp = current.skillXp[skillId];
      const remaining = xpTable[MAX_LEVEL] - xp;
      const spent = Math.min(10_000, current.rp, remaining);
      if (spent <= 0) return current;

      return {
        ...current,
        rp: current.rp - spent,
        skillXp: {
          ...current.skillXp,
          [skillId]: xp + spent,
        },
      };
    });
  }

  function buyItem(item: Collectible) {
    setPlayer((current) => {
      if (current.owned.includes(item.id) || !canUnlock(item, current)) return current;
      return {
        ...current,
        rp: current.rp - item.cost,
        owned: [...current.owned, item.id],
      };
    });
    setConfirmItem(null);
    setDetailItem(null);
  }

  const categoryProgress = useMemo(() => {
    return categories.map((category) => {
      if (category.id === "skills") {
        const trained = skills.filter((skill) => levelFromXp(player.skillXp[skill.id]) > 1).length;
        return { ...category, unlocked: trained, total: skills.length };
      }

      const items = collectibles.filter((item) => item.category === category.id);
      const unlocked = items.filter((item) => player.owned.includes(item.id)).length;
      return { ...category, unlocked, total: items.length };
    });
  }, [player]);

  return (
    <div className="app-shell">
      <TopBar title={title} rp={player.rp} canGoBack={page.type !== "home"} onBack={() => setPage({ type: "home" })} onGrantRp={grantRp} />

      <main className="content">
        {page.type === "home" ? (
          <HomePage progress={categoryProgress} onOpen={(id) => setPage({ type: "category", id })} />
        ) : page.id === "skills" ? (
          <SkillsPage player={player} skillFilter={skillFilter} onFilter={setSkillFilter} onTrain={trainSkill} />
        ) : (
          <CollectionPage
            category={page.id}
            player={player}
            filter={filter}
            sort={sort}
            onFilter={setFilter}
            onSort={setSort}
            onOpenDetails={setDetailItem}
            onRequestBuy={(item) => {
              if (player.owned.includes(item.id)) {
                setDetailItem(item);
              } else if (canUnlock(item, player)) {
                setConfirmItem(item);
              } else {
                setDetailItem(item);
              }
            }}
          />
        )}
      </main>

      {detailItem && (
        <DetailSheet item={detailItem} player={player} onClose={() => setDetailItem(null)} onBuy={() => setConfirmItem(detailItem)} />
      )}

      {confirmItem && (
        <ConfirmDialog item={confirmItem} onCancel={() => setConfirmItem(null)} onConfirm={() => buyItem(confirmItem)} />
      )}
    </div>
  );
}

function TopBar({
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
        <span>{formatNumber(rp)} RP</span>
        <button className="icon-button add" onClick={onGrantRp} aria-label="Add 10,000 RP">
          <Plus size={18} />
        </button>
      </div>
    </header>
  );
}

function HomePage({
  progress,
  onOpen,
}: {
  progress: Array<{ id: CategoryId; name: string; totalLabel: string; unlocked: number; total: number }>;
  onOpen: (id: CategoryId) => void;
}) {
  return (
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
            {category.unlocked}/{category.total}
          </span>
          <ChevronRight className="tile-chevron" size={18} />
        </button>
      ))}
    </section>
  );
}

function FilterBar({
  filter,
  sort,
  onFilter,
  onSort,
}: {
  filter: Filter;
  sort: SortMode;
  onFilter: (filter: Filter) => void;
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
  sort,
  onFilter,
  onSort,
  onOpenDetails,
  onRequestBuy,
}: {
  category: Exclude<CategoryId, "skills">;
  player: PlayerState;
  filter: Filter;
  sort: SortMode;
  onFilter: (filter: Filter) => void;
  onSort: (sort: SortMode) => void;
  onOpenDetails: (item: Collectible) => void;
  onRequestBuy: (item: Collectible) => void;
}) {
  const items = useMemo(() => {
    let next = collectibles.filter((item) => item.category === category);

    next = next.filter((item) => {
      const owned = player.owned.includes(item.id);
      const unlockable = canUnlock(item, player) && !owned;
      if (filter === "owned") return owned;
      if (filter === "unlockable") return unlockable;
      if (filter === "locked") return !owned && !unlockable;
      return true;
    });

    return [...next].sort((a, b) => {
      if (sort === "cost-asc") return a.cost - b.cost;
      if (sort === "cost-desc") return b.cost - a.cost;
      if (sort === "requirements-asc") return highestRequirement(a) - highestRequirement(b);
      if (sort === "requirements-desc") return highestRequirement(b) - highestRequirement(a);
      return collectibles.indexOf(a) - collectibles.indexOf(b);
    });
  }, [category, filter, player, sort]);

  return (
    <>
      <FilterBar filter={filter} sort={sort} onFilter={onFilter} onSort={onSort} />
      <section className="card-grid">
        {items.map((item) => (
          <CollectibleCard key={item.id} item={item} player={player} onOpenDetails={onOpenDetails} onRequestBuy={onRequestBuy} />
        ))}
      </section>
    </>
  );
}

function CollectibleCard({
  item,
  player,
  onOpenDetails,
  onRequestBuy,
}: {
  item: Collectible;
  player: PlayerState;
  onOpenDetails: (item: Collectible) => void;
  onRequestBuy: (item: Collectible) => void;
}) {
  const owned = player.owned.includes(item.id);
  const unlockable = canUnlock(item, player) && !owned;

  return (
    <article
      className={`item-card ${owned ? "owned" : ""} ${unlockable ? "unlockable" : ""}`}
      onClick={() => onRequestBuy(item)}
      onContextMenu={(event) => {
        event.preventDefault();
        onOpenDetails(item);
      }}
    >
      <div className="item-icon">
        {owned ? <Check size={22} /> : unlockable ? <Gem size={22} /> : <Lock size={21} />}
      </div>
      <div className="item-copy">
        <div className="item-title-row">
          <h2>{item.name}</h2>
          <button
            className="mini-info"
            onClick={(event) => {
              event.stopPropagation();
              onOpenDetails(item);
            }}
            aria-label={`Show ${item.name} details`}
          >
            <Info size={15} />
          </button>
        </div>
        <p>{item.description}</p>
        <div className="meta-row">
          <span className={rarityClass[item.rarity]}>{item.rarity}</span>
          <span>{formatNumber(item.cost)} RP</span>
        </div>
        <div className="requirement-line">{requirementsText(item)}</div>
      </div>
    </article>
  );
}

function SkillsPage({
  player,
  skillFilter,
  onFilter,
  onTrain,
}: {
  player: PlayerState;
  skillFilter: SkillFilter;
  onFilter: (filter: SkillFilter) => void;
  onTrain: (skillId: SkillId) => void;
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
          const spend = Math.min(10_000, player.rp, xpTable[MAX_LEVEL] - xp);
          return (
            <article className="skill-card" key={skill.id}>
              <div className="skill-topline">
                <div>
                  <h2>{skill.name}</h2>
                  <p>{skill.source}</p>
                </div>
                <strong>Level {levelInfo.level}</strong>
              </div>
              <div className="xp-track" aria-label={`${skill.name} XP progress`}>
                <span style={{ width: `${Math.max(3, levelInfo.progress * 100)}%` }} />
              </div>
              <div className="skill-footer">
                <span>
                  {formatNumber(xp)} XP
                  {levelInfo.level < MAX_LEVEL ? ` / ${formatNumber(levelInfo.next)} XP` : ""}
                </span>
                <button disabled={spend <= 0} onClick={() => onTrain(skill.id)}>
                  Train {formatNumber(spend)} RP
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}

function DetailSheet({
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

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <aside className="detail-sheet" role="dialog" aria-modal="true" aria-label={`${item.name} details`} onClick={(event) => event.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className="sheet-icon">
          {owned ? <Check size={32} /> : unlockable ? <Gem size={32} /> : <Lock size={32} />}
        </div>
        <h2>{item.name}</h2>
        <p>{item.description}</p>
        <div className="sheet-meta">
          <span className={rarityClass[item.rarity]}>{item.rarity}</span>
          <span>{formatNumber(item.cost)} RP</span>
        </div>
        <div className="requirement-list">
          <h3>Requirements</h3>
          {item.requirements.length === 0 ? (
            <div className="requirement-row met">
              <Check size={15} />
              <span>No requirements</span>
            </div>
          ) : (
            item.requirements.map((requirement) => {
              const state = getRequirementState(requirement, player);
              return (
                <div key={state.label} className={`requirement-row ${state.met ? "met" : ""}`}>
                  {state.met ? <Check size={15} /> : <Lock size={15} />}
                  <span>{state.label}</span>
                  <small>{state.current}</small>
                </div>
              );
            })
          )}
        </div>
        <button className="primary-action" disabled={!unlockable} onClick={onBuy}>
          {owned ? "Unlocked" : unlockable ? "Buy" : "Requirements not met"}
        </button>
      </aside>
    </div>
  );
}

function ConfirmDialog({ item, onCancel, onConfirm }: { item: Collectible; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onCancel}>
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-label="Confirm purchase" onClick={(event) => event.stopPropagation()}>
        <h2>Buy {item.name}?</h2>
        <p>This will spend {formatNumber(item.cost)} RP and unlock it in your Codex.</p>
        <div className="dialog-actions">
          <button className="secondary-action" onClick={onCancel}>
            No
          </button>
          <button className="primary-action" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </section>
    </div>
  );
}
