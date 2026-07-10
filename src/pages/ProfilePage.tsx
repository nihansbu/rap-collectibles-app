import { BadgeCheck, Lock, Palette } from "lucide-react";
import type { ReactNode } from "react";
import { COSMETICS } from "../data";
import type { PlayerState } from "../save";

export function ProfilePage({ player, onSelectTheme, onSelectBadge }: {
  player: PlayerState;
  onSelectTheme: (id: string | null) => void;
  onSelectBadge: (id: string | null) => void;
}) {
  const themes = COSMETICS.filter((cosmetic) => cosmetic.kind === "theme");
  const badges = COSMETICS.filter((cosmetic) => cosmetic.kind === "profile-badge");
  return <div className="profile-page">
    <section className="profile-preview"><span className="profile-avatar"><BadgeCheck size={28} /></span><span><small>Account Profile</small><h2>Idle Life Adventurer</h2><p>Profile rewards are account-wide and never create separate Hero progression.</p></span></section>
    <CosmeticSection title="Themes" icon={<Palette size={18} />} items={themes} unlocked={player.unlockedCosmetics} selected={player.selectedCosmetics.themeId} onSelect={onSelectTheme} />
    <CosmeticSection title="Profile Badges" icon={<BadgeCheck size={18} />} items={badges} unlocked={player.unlockedCosmetics} selected={player.selectedCosmetics.profileBadgeId} onSelect={onSelectBadge} />
  </div>;
}

function CosmeticSection({ title, icon, items, unlocked, selected, onSelect }: {
  title: string;
  icon: ReactNode;
  items: typeof COSMETICS;
  unlocked: string[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return <section className="cosmetic-section"><header>{icon}<h2>{title}</h2></header><button className={!selected ? "selected" : ""} onClick={() => onSelect(null)}><span className="cosmetic-swatch default" /><span><strong>Default</strong><small>Original Codex appearance</small></span>{!selected && <BadgeCheck size={16} />}</button>{items.map((item) => {
    const isUnlocked = unlocked.includes(item.id);
    const isSelected = selected === item.id;
    return <button key={item.id} disabled={!isUnlocked} className={isSelected ? "selected" : ""} onClick={() => onSelect(item.id)}><span className="cosmetic-swatch" style={{ background: item.theme?.accent ?? "#75827a" }} /> <span><strong>{item.name}</strong><small>{isUnlocked ? item.description : "Locked"}</small></span>{isSelected ? <BadgeCheck size={16} /> : !isUnlocked ? <Lock size={15} /> : null}</button>;
  })}</section>;
}
