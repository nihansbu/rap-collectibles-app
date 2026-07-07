import {
  Anchor,
  BookOpen,
  Briefcase,
  Check,
  Compass,
  Dice5,
  Dumbbell,
  Footprints,
  Gem,
  Hammer,
  Headphones,
  Lock,
  Music,
  Shield,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import type { GameplayActivity } from "../activities";
import type { CategoryId, Collectible } from "../data";
import type { ActivityOption } from "../economy";

export function AppIcon({ category }: { category: CategoryId }) {
  const common = { size: 22, strokeWidth: 1.8 };
  if (category === "characters") return <Shield {...common} />;
  if (category === "classes") return <BookOpen {...common} />;
  if (category === "races") return <Users {...common} />;
  if (category === "skills") return <Swords {...common} />;
  if (category === "tools") return <Hammer {...common} />;
  if (category === "pets") return <Sparkles {...common} />;
  return <Gem {...common} />;
}

export function ActivityIcon({ activityId }: { activityId: ActivityOption["id"] }) {
  const common = { size: 18, strokeWidth: 1.9 };
  if (activityId === "walking") return <Footprints {...common} />;
  if (activityId === "reading") return <BookOpen {...common} />;
  if (activityId === "podcast") return <Headphones {...common} />;
  if (activityId === "gym") return <Dumbbell {...common} />;
  if (activityId === "work") return <Briefcase {...common} />;
  return <Music {...common} />;
}

export function GameplayActivityIcon({ activity }: { activity: GameplayActivity }) {
  const common = { size: 28, strokeWidth: 1.75 };
  if (activity.type === "Fishing") return <Anchor {...common} />;
  if (activity.type === "Ritual") return <Sparkles {...common} />;
  if (activity.type === "Crafting") return <Gem {...common} />;
  if (activity.type === "Gathering") return <Compass {...common} />;
  return <Dice5 {...common} />;
}

export function TileVisual({
  icon,
  category,
  locked = false,
  owned = false,
  sourceType,
}: {
  icon?: string;
  category: CategoryId;
  locked?: boolean;
  owned?: boolean;
  sourceType?: Collectible["source"] extends infer Source ? Source extends { type: infer Type } ? Type : never : never;
}) {
  return (
    <div className={`tile-art ${locked ? "locked" : ""} ${owned ? "owned" : ""} ${sourceType === "activity" ? "activity-source" : ""}`}>
      {icon ? <img src={icon} alt="" draggable="false" /> : <AppIcon category={category} />}
      {locked && (
        <span className="tile-lock" aria-hidden="true">
          <Lock size={12} />
        </span>
      )}
      {owned && (
        <span className="tile-owned" aria-hidden="true">
          <Check size={12} />
        </span>
      )}
    </div>
  );
}
