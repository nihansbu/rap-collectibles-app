export type ActivityId = "walking" | "reading" | "podcast" | "gym" | "work" | "music";

export type ActivityOption = {
  id: ActivityId;
  name: string;
  rapPerHour: number;
};

export type ActivityLogEntry = {
  id: string;
  activityId: ActivityId;
  name: string;
  hours: number;
  rap: number;
  loggedAt: number;
};

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  { id: "walking", name: "Walking", rapPerHour: 20_000 },
  { id: "reading", name: "Reading", rapPerHour: 15_000 },
  { id: "podcast", name: "Podcast", rapPerHour: 15_000 },
  { id: "gym", name: "Gym", rapPerHour: 45_000 },
  { id: "work", name: "Work", rapPerHour: 10_000 },
  { id: "music", name: "Music Practice", rapPerHour: 20_000 },
];

export const RARITY_COST_BANDS = [
  { rarity: "Common", min: 8_000, max: 20_000 },
  { rarity: "Uncommon", min: 18_000, max: 40_000 },
  { rarity: "Rare", min: 40_000, max: 85_000 },
  { rarity: "Epic", min: 75_000, max: 160_000 },
  { rarity: "Legendary", min: 150_000, max: 350_000 },
] as const;

export function activityRap(activity: ActivityOption, hours: number) {
  return Math.round(activity.rapPerHour * hours);
}

