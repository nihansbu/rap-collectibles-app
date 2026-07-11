import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { skills } from "../src/data/skills";

type Palette = { fabric: string; accent: string };

const paletteBySkill: Record<string, Palette> = {
  agility: { fabric: "#3d8c8b", accent: "#9be2d0" },
  archaeology: { fabric: "#8f6b45", accent: "#f0cb7a" },
  attack: { fabric: "#8d3039", accent: "#ff9b7f" },
  construction: { fabric: "#a45739", accent: "#f1bd76" },
  cooking: { fabric: "#a8632f", accent: "#ffe09a" },
  crafting: { fabric: "#7b4a6f", accent: "#e6b5d8" },
  defence: { fabric: "#3f607b", accent: "#a8d3e8" },
  divination: { fabric: "#356b77", accent: "#86e5dc" },
  dungeoneering: { fabric: "#4f3f75", accent: "#c9b4ff" },
  farming: { fabric: "#4d7844", accent: "#c2e687" },
  firemaking: { fabric: "#9a3d2c", accent: "#ffd07c" },
  fishing: { fabric: "#236a78", accent: "#8bd8d4" },
  fletching: { fabric: "#587449", accent: "#e4c88c" },
  herblore: { fabric: "#3e7a55", accent: "#b4e18a" },
  hitpoints: { fabric: "#8f3446", accent: "#ffb1ac" },
  hunter: { fabric: "#586845", accent: "#d4dc9a" },
  invention: { fabric: "#3d6882", accent: "#a5e8ff" },
  magic: { fabric: "#514074", accent: "#c6b4ff" },
  mining: { fabric: "#53616c", accent: "#d8e4e2" },
  necromancy: { fabric: "#4a3e58", accent: "#d3a6df" },
  prayer: { fabric: "#8b774a", accent: "#fff0ad" },
  ranged: { fabric: "#4d693f", accent: "#d4e18b" },
  "rune-crafting": { fabric: "#4b4f8a", accent: "#b4baff" },
  sailing: { fabric: "#2e5f78", accent: "#9bdbef" },
  slayer: { fabric: "#5d303e", accent: "#f0a0a7" },
  smithing: { fabric: "#684a3d", accent: "#ffc176" },
  strength: { fabric: "#883b2f", accent: "#ffbe81" },
  summoning: { fabric: "#3d5578", accent: "#b2d5ff" },
  thieving: { fabric: "#684269", accent: "#e0a8e8" },
  woodcutting: { fabric: "#496347", accent: "#d3df8c" },
};

const [, , base99Argument, base120Argument, outputArgument] = process.argv;
const base99Path = resolve(base99Argument ?? "scripts/assets/skill-capes/skill-cape-99-base.png");
const base120Path = resolve(base120Argument ?? "scripts/assets/skill-capes/skill-cape-120-base.png");
const outputDir = resolve(outputArgument ?? "public/assets/icons/skill-capes");
const startIndex = Math.max(0, Number(process.argv[5] ?? 0));
const endIndex = Math.min(skills.length, Number(process.argv[6] ?? skills.length));

await mkdir(outputDir, { recursive: true });

for (const skill of skills.slice(startIndex, endIndex)) {
  const palette = paletteBySkill[skill.id];
  if (!palette) throw new Error(`Missing Skill Cape palette for ${skill.id}`);

  for (const tier of [99, 120] as const) {
    const basePath = tier === 99 ? base99Path : base120Path;
    const iconSize = tier === 99 ? 66 : 72;
    const icon = await sharp(resolve("public", skill.icon))
      .resize(iconSize, iconSize, { fit: "contain" })
      .modulate({ saturation: 1.18, brightness: 1.35 })
      .png()
      .toBuffer();
    const tintedBase = await sharp(basePath)
      .resize(256, 256, { fit: "contain" })
      .tint(palette.fabric)
      .modulate({ saturation: 0.82, brightness: tier === 99 ? 0.96 : 1.02 })
      .png()
      .toBuffer();
    const left = Math.round((256 - iconSize) / 2);
    const top = tier === 99 ? 76 : 82;

    await sharp(tintedBase)
      .composite([{ input: icon, left, top, blend: "over" }])
      .webp({ quality: 92, effort: 6 })
      .toFile(resolve(outputDir, `skill-cape-${skill.id}-${tier}.webp`));
  }
}

console.log(`Generated ${(endIndex - startIndex) * 2} Skill Cape icons in ${outputDir} (skills ${startIndex}-${endIndex - 1})`);
