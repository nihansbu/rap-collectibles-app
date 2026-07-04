export const MAX_LEVEL = 120;

export function xpForLevel(level: number) {
  if (level <= 1) return 0;

  let points = 0;
  for (let i = 1; i < level; i += 1) {
    points += Math.floor(i + 300 * Math.pow(2, i / 7));
  }

  return Math.floor(points / 4);
}

export const xpTable = Array.from({ length: MAX_LEVEL + 1 }, (_, level) => xpForLevel(level));

export function levelFromXp(xp: number) {
  for (let level = MAX_LEVEL; level >= 1; level -= 1) {
    if (xp >= xpTable[level]) return level;
  }

  return 1;
}

export function xpIntoLevel(xp: number) {
  const level = levelFromXp(xp);
  const current = xpTable[level];
  const next = xpTable[Math.min(level + 1, MAX_LEVEL)];
  return {
    level,
    current,
    next,
    progress: level >= MAX_LEVEL ? 1 : (xp - current) / (next - current),
  };
}
