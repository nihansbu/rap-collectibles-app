export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.floor(value));
}

export function completionPercent(unlocked: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((unlocked / total) * 100));
}

export function formatSavedTime(date: Date | null) {
  if (!date) return "Not saved yet";
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
