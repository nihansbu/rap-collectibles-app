export const CONTENT_MASTERY_MAX_LEVEL = 50;

// Cumulative share of each track's configurable target RAP.
export const CONTENT_MASTERY_LEVEL_RATIOS = Array.from(
  { length: CONTENT_MASTERY_MAX_LEVEL + 1 },
  (_, level) => level / CONTENT_MASTERY_MAX_LEVEL,
);

export const DEFAULT_CONTENT_MASTERY_TARGET_RAP = 2_500_000;
