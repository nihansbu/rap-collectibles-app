import { Award, BadgeCheck, Lock, Palette, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { COSMETICS } from "../data";
import { getCosmetic } from "../cosmetics";
import { formatNumber } from "../format";
import type { PlayerState } from "../save";

export function ProfilePage({ player, onSelectTheme, onSelectBadge, onSelectTitle }: {
  player: PlayerState;
  onSelectTheme: (id: string | null) => void;
  onSelectBadge: (id: string | null) => void;
  onSelectTitle: (id: string | null) => void;
}) {
  const themes = COSMETICS.filter((cosmetic) => cosmetic.kind === "theme");
  const badges = COSMETICS.filter((cosmetic) => cosmetic.kind === "profile-badge");
  const titles = COSMETICS.filter((cosmetic) => cosmetic.kind === "title");
  const selectedTitle = player.selectedCosmetics.titleId ? getCosmetic(player.selectedCosmetics.titleId) : null;
  return <div className="profile-page">
    <section className="profile-preview"><span className="profile-avatar"><BadgeCheck size={28} /></span><span><small>Account Profile</small><h2>Idle Life Adventurer</h2>{selectedTitle && <strong className="profile-selected-title">{selectedTitle.name}</strong>}<p>Profile rewards are account-wide and never create separate Hero progression.</p><span className="profile-achievement-stat"><Trophy size={13} /> {formatNumber(player.achievementPoints)} Achievement Points</span></span></section>
    <CosmeticSection title="Titles" icon={<Award size={18} />} items={titles} unlocked={player.unlockedCosmetics} selected={player.selectedCosmetics.titleId} onSelect={onSelectTitle} defaultName="No title" defaultDescription="Show only the account name" />
    <CosmeticSection title="Themes" icon={<Palette size={18} />} items={themes} unlocked={player.unlockedCosmetics} selected={player.selectedCosmetics.themeId} onSelect={onSelectTheme} />
    <CosmeticSection title="Profile Badges" icon={<BadgeCheck size={18} />} items={badges} unlocked={player.unlockedCosmetics} selected={player.selectedCosmetics.profileBadgeId} onSelect={onSelectBadge} />
  </div>;
}

function CosmeticSection({ title, icon, items, unlocked, selected, onSelect, defaultName = "Default", defaultDescription = "Original Codex appearance" }: {
  title: string;
  icon: ReactNode;
  items: typeof COSMETICS;
  unlocked: string[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  defaultName?: string;
  defaultDescription?: string;
}) {
  const isTitleSection = items.some((item) => item.kind === "title");
  return <section className="cosmetic-section"><header>{icon}<h2>{title}</h2></header><button className={!selected ? "selected" : ""} onClick={() => onSelect(null)}><span className={`cosmetic-swatch ${isTitleSection ? "title" : "default"}`}>{isTitleSection && <Award size={17} />}</span><span><strong>{defaultName}</strong><small>{defaultDescription}</small></span>{!selected && <BadgeCheck size={16} />}</button>{items.map((item) => {
    const isUnlocked = unlocked.includes(item.id);
    const isSelected = selected === item.id;
    return <button key={item.id} disabled={!isUnlocked} className={isSelected ? "selected" : ""} onClick={() => onSelect(item.id)}><span className={`cosmetic-swatch ${item.kind === "title" ? "title" : ""}`} style={{ background: item.theme?.accent }}>{item.kind === "title" && <Award size={17} />}</span> <span><strong>{item.name}</strong><small>{isUnlocked ? item.description : "Locked"}</small></span>{isSelected ? <BadgeCheck size={16} /> : !isUnlocked ? <Lock size={15} /> : null}</button>;
  })}</section>;
}
