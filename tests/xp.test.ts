import { describe, expect, it } from "vitest";
import { levelFromXp, xpForLevel, xpIntoLevel } from "../src/xp";

describe("RuneScape XP curve", () => {
  it("matches canonical milestone totals", () => {
    expect(xpForLevel(2)).toBe(83);
    expect(xpForLevel(99)).toBe(13_034_431);
    expect(xpForLevel(120)).toBe(104_273_167);
  });

  it("derives levels and progress at boundaries", () => {
    expect(levelFromXp(82)).toBe(1);
    expect(levelFromXp(83)).toBe(2);
    expect(xpIntoLevel(83)).toMatchObject({ level: 2, current: 83 });
  });
});
