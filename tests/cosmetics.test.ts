import { describe, expect, it } from "vitest";
import { deriveUnlockedCosmetics, reconcileUnlockedCosmetics } from "../src/cosmetics";
import { collectionSetProgress, getSetsForCollectible } from "../src/sets";

describe("Cosmetic progression", () => {
  it("derives Mastery milestone Cosmetics from raw points", () => {
    expect(deriveUnlockedCosmetics([], { "mastery-fishers-trawler": 799_999 })).toEqual([]);
    expect(deriveUnlockedCosmetics([], { "mastery-fishers-trawler": 800_000 })).toContain("badge-trawler-hand");
    expect(deriveUnlockedCosmetics([], { "mastery-fishers-trawler": 5_000_000 })).toEqual(["badge-trawler-hand"]);
  });

  it("makes every current Theme available without progression", () => {
    expect(reconcileUnlockedCosmetics([], [], {})).toEqual(expect.arrayContaining([
      "theme-storm-weaver",
      "theme-verdant-warden",
      "theme-ember-forge",
      "theme-moonlit-archive",
      "theme-sunken-meridian",
    ]));
  });

  it("derives Set rewards without creating a second inventory", () => {
    const firstTwo = ["pet-trawler-gull", "tool-dragon-harpoon"];
    expect(reconcileUnlockedCosmetics([], firstTwo, {})).toContain("badge-trawler-hand");
    expect(collectionSetProgress("set-trawlers-wake", firstTwo)).toMatchObject({ owned: 2, total: 4, percent: 50, complete: false });
    expect(getSetsForCollectible("pet-trawler-gull").map((set) => set.id)).toContain("set-trawlers-wake");
  });
});
