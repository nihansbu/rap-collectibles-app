import { describe, expect, it } from "vitest";
import { createInitialPlayerState } from "../src/save";
import {
  processActiveTrainings,
  startSkillTraining,
  stopSkillTraining,
  TRAINING_WINDOW_HOURS,
} from "../src/training";

const HOUR_MS = 60 * 60 * 1000;

describe("skill training", () => {
  it("processes a completed job even when the player returns days later", () => {
    const player = createInitialPlayerState();
    player.rp = 10_000;
    const started = startSkillTraining(player, "agility", 1_000);

    const completed = processActiveTrainings(started, 1_000 + 72 * HOUR_MS);

    expect(completed.rp).toBeCloseTo(0, 6);
    expect(completed.skillXp.agility).toBeGreaterThan(0);
    expect(completed.activeTrainings).toHaveLength(0);
  });

  it("shares scarce RAP fairly across three concurrent skills", () => {
    let player = createInitialPlayerState();
    player.rp = 1_500;
    player = startSkillTraining(player, "agility", 5_000);
    player = startSkillTraining(player, "attack", 5_000);
    player = startSkillTraining(player, "defence", 5_000);

    const completed = processActiveTrainings(player, 5_000 + HOUR_MS);

    expect(completed.rp).toBeCloseTo(0, 6);
    expect(completed.skillXp.agility).toBeCloseTo(completed.skillXp.attack, 6);
    expect(completed.skillXp.attack).toBeCloseTo(completed.skillXp.defence, 6);
    expect(completed.activeTrainings).toHaveLength(0);
  });

  it("starts one fixed 72-hour window and never duplicates an active skill", () => {
    const player = createInitialPlayerState();
    player.rp = 1_000_000;
    const first = startSkillTraining(player, "magic", 10_000);
    const repeated = startSkillTraining(first, "magic", 10_000);

    expect(repeated.activeTrainings).toHaveLength(1);
    expect(repeated.activeTrainings[0].endsAt).toBe(10_000 + TRAINING_WINDOW_HOURS * HOUR_MS);
  });

  it("stops immediately without a penalty and keeps XP already earned", () => {
    const player = createInitialPlayerState();
    player.rp = 1_000_000;
    const started = startSkillTraining(player, "magic", 10_000);
    const stopped = stopSkillTraining(started, "magic", 10_000 + HOUR_MS);

    expect(stopped.activeTrainings).toHaveLength(0);
    expect(stopped.rp).toBeCloseTo(990_000, 6);
    expect(stopped.skillXp.magic).toBeGreaterThan(0);
  });
});
