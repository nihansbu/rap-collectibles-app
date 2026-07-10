import { describe, expect, it } from "vitest";
import { createInitialPlayerState } from "../src/save";
import { processActiveTrainings, startSkillTraining } from "../src/training";

const HOUR_MS = 60 * 60 * 1000;

describe("skill training", () => {
  it("processes a completed job even when the player returns days later", () => {
    const player = createInitialPlayerState();
    player.rp = 10_000;
    const started = startSkillTraining(player, "agility", 1, 1_000);

    const completed = processActiveTrainings(started, 1_000 + 72 * HOUR_MS);

    expect(completed.rp).toBeCloseTo(0, 6);
    expect(completed.skillXp.agility).toBeGreaterThan(0);
    expect(completed.activeTrainings).toHaveLength(0);
  });

  it("shares scarce RAP fairly across three concurrent skills", () => {
    let player = createInitialPlayerState();
    player.rp = 1_500;
    player = startSkillTraining(player, "agility", 1, 5_000);
    player = startSkillTraining(player, "attack", 1, 5_000);
    player = startSkillTraining(player, "defence", 1, 5_000);

    const completed = processActiveTrainings(player, 5_000 + HOUR_MS);

    expect(completed.rp).toBeCloseTo(0, 6);
    expect(completed.skillXp.agility).toBeCloseTo(completed.skillXp.attack, 6);
    expect(completed.skillXp.attack).toBeCloseTo(completed.skillXp.defence, 6);
    expect(completed.activeTrainings).toHaveLength(0);
  });

  it("extends an existing job instead of creating a duplicate", () => {
    const player = createInitialPlayerState();
    const first = startSkillTraining(player, "magic", 1, 10_000);
    const extended = startSkillTraining(first, "magic", 2, 10_000);

    expect(extended.activeTrainings).toHaveLength(1);
    expect(extended.activeTrainings[0].endsAt).toBe(10_000 + 3 * HOUR_MS);
  });
});
