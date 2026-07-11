import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  loadPlayerSnapshot,
  SAVE_KEY,
  savePlayerState,
  type PlayerState,
  type SaveSnapshot,
} from "../save";
import { reconcileAchievements } from "../achievements";
import { reconcileUnlockedSkillCapes } from "../skillCapes";

export type SaveStatus = "saved" | "saving" | "conflict" | "error";

const AUTOSAVE_DELAY_MS = 1_500;

export function usePlayerPersistence(): {
  player: PlayerState;
  setPlayer: Dispatch<SetStateAction<PlayerState>>;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  flushSave: () => void;
} {
  const [initialSnapshot] = useState<SaveSnapshot>(loadPlayerSnapshot);
  const [player, setStoredPlayer] = useState<PlayerState>(initialSnapshot.player);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialSnapshot.savedAt);
  const playerRef = useRef(player);
  const revisionRef = useRef(initialSnapshot.revision);
  const autosaveTimerRef = useRef<number | null>(null);
  const suppressNextAutosaveRef = useRef(false);
  const setPlayer = useCallback<Dispatch<SetStateAction<PlayerState>>>((action) => {
    setStoredPlayer((current) => {
      const next = typeof action === "function"
        ? (action as (value: PlayerState) => PlayerState)(current)
        : action;
      return {
        ...reconcileAchievements(next),
        ownedSkillCapes: reconcileUnlockedSkillCapes(next.ownedSkillCapes, next.skillXp),
      };
    });
  }, []);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const adoptSnapshot = useCallback((snapshot: SaveSnapshot) => {
    revisionRef.current = snapshot.revision;
    setLastSavedAt(snapshot.savedAt);
    suppressNextAutosaveRef.current = true;
    setStoredPlayer(snapshot.player);
  }, []);

  const flushSave = useCallback(() => {
    if (autosaveTimerRef.current !== null) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    setSaveStatus("saving");
    const result = savePlayerState(playerRef.current, { expectedRevision: revisionRef.current });
    if (result.ok) {
      revisionRef.current = result.revision;
      setLastSavedAt(result.savedAt);
      setSaveStatus("saved");
      return;
    }

    if (result.reason === "conflict" && result.snapshot) {
      adoptSnapshot(result.snapshot);
      setSaveStatus("conflict");
      return;
    }

    setSaveStatus("error");
  }, [adoptSnapshot]);

  useEffect(() => {
    if (suppressNextAutosaveRef.current) {
      suppressNextAutosaveRef.current = false;
      return;
    }

    setSaveStatus("saving");
    if (autosaveTimerRef.current !== null) window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = window.setTimeout(flushSave, AUTOSAVE_DELAY_MS);
    return () => {
      if (autosaveTimerRef.current !== null) window.clearTimeout(autosaveTimerRef.current);
    };
  }, [flushSave, player]);

  useEffect(() => {
    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") flushSave();
    };
    const handlePageHide = () => flushSave();
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SAVE_KEY || !event.newValue) return;
      const snapshot = loadPlayerSnapshot();
      if (snapshot.revision > revisionRef.current) adoptSnapshot(snapshot);
    };

    document.addEventListener("visibilitychange", flushWhenHidden);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("storage", handleStorage);
    return () => {
      document.removeEventListener("visibilitychange", flushWhenHidden);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("storage", handleStorage);
    };
  }, [adoptSnapshot, flushSave]);

  return { player, setPlayer, saveStatus, lastSavedAt, flushSave };
}
