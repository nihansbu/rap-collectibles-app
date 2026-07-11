import { Crown, X } from "lucide-react";
import type { SkillCapeDefinition } from "../data";
import { skillCapeTierLabel } from "../skillCapes";
import { InspectableImage } from "./IconInspect";

export function SkillCapeToast({ cape, onClose }: { cape: SkillCapeDefinition; onClose: () => void }) {
  return <aside className="skill-cape-toast" role="status" aria-live="polite">
    <button onClick={onClose} aria-label="Dismiss Skill Cape notification"><X size={14} /></button>
    <span className="skill-cape-toast-art"><InspectableImage src={`./${cape.icon}`} title={cape.name} subtitle={skillCapeTierLabel(cape.tier)} /></span>
    <span className="skill-cape-toast-copy"><small>Skill Cape unlocked</small><strong>{cape.name}</strong><span>{skillCapeTierLabel(cape.tier)} milestone reached</span></span>
    <Crown className="skill-cape-toast-crown" size={16} />
  </aside>;
}
