import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { X } from "lucide-react";
import type { ActivityRunResult } from "../activities";
import { getCollectibleById, skillName } from "../catalog";
import { categories, type Collectible } from "../data";
import { formatNumber } from "../format";
import { formatDuration } from "../training";
import { TileVisual } from "./icons";

function useDialogFocus(onClose: () => void) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const firstControl = dialog?.querySelector<HTMLElement>("button:not(:disabled), textarea, input, select, [tabindex]:not([tabindex='-1'])");
    (firstControl ?? dialog)?.focus();
    return () => previousFocus?.focus();
  }, []);

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), textarea, input, select, [tabindex]:not([tabindex='-1'])") ?? [])];
    if (controls.length === 0) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return { ref: dialogRef, tabIndex: -1, onKeyDown };
}

export function UnlockNotice({ item, onClose }: { item: Collectible; onClose: () => void }) {
  const dialog = useDialogFocus(onClose);
  const categoryName = categories.find((category) => category.id === item.category)?.name ?? "Collectibles";

  return (
    <div className="sheet-backdrop unlock-backdrop" role="presentation" onClick={onClose}>
      <section {...dialog} className="unlock-notice" role="dialog" aria-modal="true" aria-label={`${item.name} unlocked`} onClick={(event) => event.stopPropagation()}>
        <div className="unlock-burst">
          <TileVisual icon={item.icon} category={item.category} owned />
        </div>
        <span className="unlock-kicker">Unlocked</span>
        <h2>{item.name}</h2>
        <p>Added to your {categoryName} Codex.</p>
        <button className="primary-action" onClick={onClose}>
          Continue
        </button>
      </section>
    </div>
  );
}

export function ActivityResultPanel({ result, onClose }: { result: ActivityRunResult; onClose: () => void }) {
  const dialog = useDialogFocus(onClose);
  const droppedItem = result.droppedCollectibleId ? getCollectibleById(result.droppedCollectibleId) : null;

  return (
    <div className="sheet-backdrop result-backdrop" role="presentation" onClick={onClose}>
      <section {...dialog} className="result-panel" role="dialog" aria-modal="true" aria-label={`${result.activityName} result`} onClick={(event) => event.stopPropagation()}>
        <button className="detail-close" onClick={onClose} aria-label="Close result">
          <X size={18} />
        </button>
        <span className="unlock-kicker">Adventure Complete</span>
        <h2>{result.activityName}</h2>
        <div className="result-summary">
          <span>
            <small>Run</small>
            <strong>{formatNumber(result.runCount)}</strong>
          </span>
          <span>
            <small>RAP Spent</small>
            <strong>{formatNumber(result.rapSpent)}</strong>
          </span>
          <span>
            <small>Runtime</small>
            <strong>{formatDuration(result.runtimeMs)}</strong>
          </span>
        </div>
        <div className="result-section">
          <h3>Mastery</h3>
          <div className="result-row">
            <span>Base RAP invested</span>
            <strong>+{formatNumber(result.masteryPointsGained)} Mastery</strong>
          </div>
          <div className="result-row">
            <span>Current Mastery</span>
            <strong>Level {result.masteryLevel} / 10</strong>
          </div>
        </div>
        <div className="result-section">
          <h3>XP</h3>
          {result.xp.length === 0 ? (
            <p>No XP gained.</p>
          ) : (
            result.xp.map((entry) => (
              <div key={entry.skillId} className="result-row">
                <span>{skillName(entry.skillId)}</span>
                <strong>
                  +{formatNumber(entry.amount)} XP{entry.bonusPercent > 0 ? ` (+${entry.bonusPercent.toFixed(1)}%)` : ""}
                </strong>
              </div>
            ))
          )}
        </div>
        <div className="result-section">
          <h3>Rolls</h3>
          {result.rolls.map((roll) => {
            const item = roll.droppedCollectibleId ? getCollectibleById(roll.droppedCollectibleId) : null;
            return (
              <div key={roll.label} className={`result-row ${roll.triggered ? "" : "muted"}`}>
                <span>{roll.label}</span>
                <strong>{!roll.triggered ? "Not triggered" : item ? item.name : "No drop"}</strong>
              </div>
            );
          })}
          {result.additionalRollChancePercent > 0 && (
            <p>{result.additionalRollChancePercent.toFixed(1)}% Additional Roll chance was active.</p>
          )}
        </div>
        <div className={`result-drop ${droppedItem ? "hit" : ""}`}>
          {droppedItem ? (
            <>
              <TileVisual icon={droppedItem.icon} category={droppedItem.category} owned sourceType={droppedItem.source?.type} />
              <span>
                <strong>{droppedItem.name}</strong>
                <small>Added to Codex</small>
              </span>
            </>
          ) : (
            <span>
              <strong>No collectible drop</strong>
              <small>Try another run.</small>
            </span>
          )}
        </div>
        <button className="primary-action" onClick={onClose}>
          Continue
        </button>
      </section>
    </div>
  );
}

export function ConfirmDialog({ item, onCancel, onConfirm }: { item: Collectible; onCancel: () => void; onConfirm: () => void }) {
  const dialog = useDialogFocus(onCancel);
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onCancel}>
      <section {...dialog} className="confirm-dialog" role="dialog" aria-modal="true" aria-label="Confirm purchase" onClick={(event) => event.stopPropagation()}>
        <h2>Buy {item.name}?</h2>
        <p>This will spend {formatNumber(item.cost)} RAP and unlock it in your Codex.</p>
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

export function ImportDialog({
  value,
  onChange,
  onCancel,
  onImport,
}: {
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onImport: () => void;
}) {
  const dialog = useDialogFocus(onCancel);
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onCancel}>
      <section {...dialog} className="confirm-dialog import-dialog" role="dialog" aria-modal="true" aria-label="Import save" onClick={(event) => event.stopPropagation()}>
        <h2>Import Save</h2>
        <p>Paste a RAP save JSON file. Importing replaces the current local progress.</p>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste save JSON"
          aria-label="Save JSON"
        />
        <div className="dialog-actions">
          <button className="secondary-action" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-action" disabled={value.trim().length === 0} onClick={onImport}>
            Import
          </button>
        </div>
      </section>
    </div>
  );
}
