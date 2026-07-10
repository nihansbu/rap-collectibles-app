import { describe, expect, it } from "vitest";
import { buildSkillAcquisitionMatrix, canRetireDirectTraining } from "../src/skillAcquisition";

describe("Skill Acquisition Matrix", () => {
  it("tracks every Skill and keeps Direct Training until gameplay coverage is complete", () => {
    const matrix = buildSkillAcquisitionMatrix();
    expect(matrix).toHaveLength(30);
    expect(matrix.every((row) => row.sources.some((source) => source.kind === "direct-training"))).toBe(true);
    expect(canRetireDirectTraining()).toBe(false);
  });
});
