import { Check, Lock, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { InspectableImage } from "./IconInspect";

export type AdventureInfoPanelDetails =
  | {
    kind: "requirement";
    title: string;
    icon?: string;
    subtitle: "Skill Requirement" | "Collectible Requirement";
    value: string;
    met: boolean;
  }
  | {
    kind: "drop";
    title: string;
    icon?: string;
    subtitle: string;
    chance: string;
    baseChance?: string;
    state: "owned" | "unowned" | "shared";
  };

export function AdventureInfoPanel({ details, onClose }: { details: AdventureInfoPanelDetails; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  const isRequirement = details.kind === "requirement";
  const statusClass = isRequirement ? (details.met ? "met" : "needed") : details.state;
  const statusLabel = isRequirement
    ? details.met ? "Met" : "Needed"
    : details.state === "owned" ? "Owned" : details.state === "shared" ? "Shared" : "Not collected";

  return (
    <div className="adventure-info-backdrop" role="presentation" onClick={onClose}>
      <section className="adventure-info-panel" role="dialog" aria-modal="true" aria-label={`${details.title} information`} onClick={(event) => event.stopPropagation()}>
        <button ref={closeRef} className="detail-close" onClick={onClose} aria-label="Close information panel">
          <X size={18} />
        </button>
        <div className="adventure-info-art">
          {details.icon ? <InspectableImage src={details.icon} title={details.title} subtitle={details.subtitle} /> : <span aria-hidden="true" />}
        </div>
        <h2>{details.title}</h2>
        <small>{details.subtitle}</small>
        <div className={`adventure-info-status ${statusClass}`}>
          {statusClass === "met" || statusClass === "owned" ? <Check size={16} /> : statusClass === "needed" ? <Lock size={16} /> : <span className="adventure-info-status-dot" />}
          <strong>{statusLabel}</strong>
        </div>
        {isRequirement ? (
          <div className={`adventure-info-value ${details.met ? "met" : "needed"}`}>{details.value}</div>
        ) : (
          <div className="adventure-info-drop-data">
            <strong>{details.chance}</strong>
            {details.baseChance && <small>(base {details.baseChance})</small>}
          </div>
        )}
        <button className="secondary-action adventure-info-close" onClick={onClose}>Close</button>
      </section>
    </div>
  );
}
