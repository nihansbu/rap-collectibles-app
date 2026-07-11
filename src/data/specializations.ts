import type { SkillId } from "./types";
import type { SpecializationDefinition } from "./contentTypes";

type SpecializationUnlockLevel = 30 | 60 | 90;

function defineSpecialization<const Id extends string>(
  id: Id,
  parentSkillId: SkillId,
  name: string,
  description: string,
  unlockLevel: SpecializationUnlockLevel,
): SpecializationDefinition & { id: Id } {
  return {
    id,
    parentSkillId,
    name,
    description,
    unlockLevel,
    icon: `assets/icons/skills/${parentSkillId}.webp`,
  };
}

export const SPECIALIZATIONS = [
  defineSpecialization("agility-trailblazing", "agility", "Trailblazing", "Fast movement across wilderness routes, rough ground, and long overland courses.", 30),
  defineSpecialization("agility-acrobatics", "agility", "Acrobatics", "Controlled leaps, balance, climbing, and movement through vertical spaces.", 60),
  defineSpecialization("agility-hazard-running", "agility", "Hazard Running", "Survival-focused movement through traps, collapsing terrain, and lethal obstacles.", 90),

  defineSpecialization("archaeology-field-excavation", "archaeology", "Field Excavation", "Surveying sites and recovering buried finds without damaging their context.", 30),
  defineSpecialization("archaeology-relic-conservation", "archaeology", "Relic Conservation", "Restoring fragile artifacts and preserving their hidden properties.", 60),
  defineSpecialization("archaeology-ancient-mysteries", "archaeology", "Ancient Mysteries", "Interpreting lost cultures, sealed ruins, and dangerous historical secrets.", 90),

  defineSpecialization("attack-weapon-mastery", "attack", "Weapon Mastery", "Fluent use of varied melee weapons and their distinct fighting patterns.", 30),
  defineSpecialization("attack-precision-striking", "attack", "Precision Striking", "Timing and placement focused on openings, weak points, and decisive blows.", 60),
  defineSpecialization("attack-duelcraft", "attack", "Duelcraft", "Advanced offensive technique for reading and overcoming skilled opponents.", 90),

  defineSpecialization("construction-homesteading", "construction", "Homesteading", "Building useful homes, workshops, storage, and everyday comforts.", 30),
  defineSpecialization("construction-fortification", "construction", "Fortification", "Creating walls, defenses, siegeworks, and resilient frontier structures.", 60),
  defineSpecialization("construction-arcane-architecture", "construction", "Arcane Architecture", "Designing magical chambers, impossible spaces, and empowered monuments.", 90),

  defineSpecialization("cooking-hearth-cuisine", "cooking", "Hearth Cuisine", "Reliable meals, preserved provisions, and nourishing travel food.", 30),
  defineSpecialization("cooking-banqueting", "cooking", "Banqueting", "Complex feasts prepared for companies, courts, and major celebrations.", 60),
  defineSpecialization("cooking-exotic-gastronomy", "cooking", "Exotic Gastronomy", "Rare ingredients, magical dishes, and demanding culinary traditions.", 90),

  defineSpecialization("crafting-artisanry", "crafting", "Artisanry", "Practical work in leather, cloth, glass, and other everyday materials.", 30),
  defineSpecialization("crafting-finework", "crafting", "Finework", "Precious materials, intricate detailing, and high-value decorative pieces.", 60),
  defineSpecialization("crafting-enchanted-crafting", "crafting", "Enchanted Crafting", "Shaping supernatural materials into objects that retain magical properties.", 90),

  defineSpecialization("defence-shieldwork", "defence", "Shieldwork", "Blocking, bracing, and protecting allies through disciplined guard technique.", 30),
  defineSpecialization("defence-evasion", "defence", "Evasion", "Avoiding harm through footwork, anticipation, and controlled disengagement.", 60),
  defineSpecialization("defence-wardkeeping", "defence", "Wardkeeping", "Resisting magical, spiritual, and otherwise unnatural threats.", 90),

  defineSpecialization("divination-wispweaving", "divination", "Wispweaving", "Gathering and shaping wandering memories and ambient divine energy.", 30),
  defineSpecialization("divination-fate-reading", "divination", "Fate Reading", "Tracing possible outcomes through omens, echoes, and hidden patterns.", 60),
  defineSpecialization("divination-anima-channeling", "divination", "Anima Channeling", "Directing deep world energy into powerful and lasting transformations.", 90),

  defineSpecialization("dungeoneering-delving", "dungeoneering", "Delving", "Exploring unknown chambers while managing routes, supplies, and risk.", 30),
  defineSpecialization("dungeoneering-trapcraft", "dungeoneering", "Trapcraft", "Detecting, disarming, and repurposing mechanical or magical hazards.", 60),
  defineSpecialization("dungeoneering-expedition-command", "dungeoneering", "Expedition Command", "Leading complex descents where many threats and disciplines intersect.", 90),

  defineSpecialization("farming-cropkeeping", "farming", "Cropkeeping", "Cultivating dependable fields, orchards, and seasonal harvests.", 30),
  defineSpecialization("farming-horticulture", "farming", "Horticulture", "Raising delicate herbs, flowers, and carefully bred plant varieties.", 60),
  defineSpecialization("farming-magical-husbandry", "farming", "Magical Husbandry", "Nurturing supernatural flora and unusual living resources.", 90),

  defineSpecialization("firemaking-campcraft", "firemaking", "Campcraft", "Building efficient fires for travel, survival, and harsh environments.", 30),
  defineSpecialization("firemaking-pyromancy", "firemaking", "Pyromancy", "Controlling intense flame as a precise and adaptable force.", 60),
  defineSpecialization("firemaking-eternal-flame", "firemaking", "Eternal Flame", "Creating supernatural fires that endure, empower, or transform their surroundings.", 90),

  defineSpecialization("maritime-fishing", "fishing", "Maritime Fishing", "Specialized fishing across open seas, trawlers, and dangerous offshore waters.", 30),
  defineSpecialization("fishing-master-angling", "fishing", "Master Angling", "Reading waters and pursuing elusive fish with specialized tackle and technique.", 60),
  defineSpecialization("fishing-abyssal-fishing", "fishing", "Abyssal Fishing", "Harvesting creatures from supernatural depths and hostile waters.", 90),

  defineSpecialization("fletching-bowyery", "fletching", "Bowyery", "Shaping dependable bows, crossbows, stocks, and flexible weapon frames.", 30),
  defineSpecialization("fletching-ammunition-craft", "fletching", "Ammunition Craft", "Producing specialized arrows, bolts, darts, and thrown projectiles.", 60),
  defineSpecialization("fletching-siege-fletching", "fletching", "Siege Fletching", "Constructing oversized and empowered projectiles for the greatest ranged weapons.", 90),

  defineSpecialization("herblore-apothecary", "herblore", "Apothecary", "Preparing restorative remedies, tonics, and dependable field mixtures.", 30),
  defineSpecialization("herblore-toxicology", "herblore", "Toxicology", "Understanding venoms, poisons, antidotes, and dangerous reagents.", 60),
  defineSpecialization("herblore-elixircraft", "herblore", "Elixircraft", "Brewing rare compounds with powerful, unusual, or lasting effects.", 90),

  defineSpecialization("hitpoints-vitality", "hitpoints", "Vitality", "Building a deeper reserve of health for prolonged and punishing challenges.", 30),
  defineSpecialization("hitpoints-recovery", "hitpoints", "Recovery", "Regaining strength efficiently after wounds, strain, and exhaustion.", 60),
  defineSpecialization("hitpoints-last-stand", "hitpoints", "Last Stand", "Remaining effective at the edge of defeat and surviving otherwise fatal pressure.", 90),

  defineSpecialization("hunter-tracking", "hunter", "Tracking", "Reading signs, following trails, and locating elusive creatures.", 30),
  defineSpecialization("hunter-trapping", "hunter", "Trapping", "Selecting terrain and devices to capture prey safely and efficiently.", 60),
  defineSpecialization("hunter-beast-handling", "hunter", "Beast Handling", "Managing dangerous, intelligent, and supernatural quarry.", 90),

  defineSpecialization("invention-gadgetry", "invention", "Gadgetry", "Assembling practical devices from mechanisms, components, and discovered principles.", 30),
  defineSpecialization("invention-augmentation", "invention", "Augmentation", "Improving existing tools and equipment with engineered enhancements.", 60),
  defineSpecialization("invention-automata", "invention", "Automata", "Creating complex self-operating machines and artificial helpers.", 90),

  defineSpecialization("magic-elementalism", "magic", "Elementalism", "Commanding elemental forces through focused and adaptable spellwork.", 30),
  defineSpecialization("magic-enchantment", "magic", "Enchantment", "Binding magical effects into creatures, objects, and places.", 60),
  defineSpecialization("magic-high-sorcery", "magic", "High Sorcery", "Wielding difficult magic that reshapes encounters and bends ordinary rules.", 90),

  defineSpecialization("mining-prospecting", "mining", "Prospecting", "Finding promising deposits and identifying valuable material before extraction.", 30),
  defineSpecialization("mining-deep-mining", "mining", "Deep Mining", "Working rich seams under pressure, darkness, and unstable ground.", 60),
  defineSpecialization("mining-crystal-extraction", "mining", "Crystal Extraction", "Recovering rare, magical, and dangerously reactive minerals.", 90),

  defineSpecialization("necromancy-soul-communion", "necromancy", "Soul Communion", "Contacting lingering spirits and understanding the memories of the dead.", 30),
  defineSpecialization("necromancy-gravebinding", "necromancy", "Gravebinding", "Calling and controlling physical undead through disciplined rites.", 60),
  defineSpecialization("necromancy-lichcraft", "necromancy", "Lichcraft", "Mastering forbidden transformations and enduring powers beyond death.", 90),

  defineSpecialization("prayer-devotion", "prayer", "Devotion", "Sustaining personal blessings through discipline, faith, and sacrifice.", 30),
  defineSpecialization("prayer-consecration", "prayer", "Consecration", "Purifying ground, relics, and allies against corrupting forces.", 60),
  defineSpecialization("prayer-divine-intercession", "prayer", "Divine Intercession", "Calling upon greater powers for extraordinary protection and judgment.", 90),

  defineSpecialization("ranged-marksmanship", "ranged", "Marksmanship", "Accurate ranged attacks built on patience, control, and target reading.", 30),
  defineSpecialization("ranged-skirmishing", "ranged", "Skirmishing", "Mobile ranged combat using spacing, repositioning, and rapid pressure.", 60),
  defineSpecialization("ranged-artillery", "ranged", "Artillery", "Heavy ranged weapons and overwhelming attacks across extreme distances.", 90),

  defineSpecialization("rune-crafting-rune-etching", "rune-crafting", "Rune Etching", "Inscribing stable magical symbols into prepared materials and objects.", 30),
  defineSpecialization("rune-crafting-altar-attunement", "rune-crafting", "Altar Attunement", "Aligning with distant altars and converting essence efficiently.", 60),
  defineSpecialization("rune-crafting-abyssal-weaving", "rune-crafting", "Abyssal Weaving", "Working volatile runic energy drawn through dangerous planar paths.", 90),

  defineSpecialization("sailing-navigation", "sailing", "Navigation", "Charting safe routes through weather, currents, and unfamiliar waters.", 30),
  defineSpecialization("sailing-shiphandling", "sailing", "Shiphandling", "Controlling vessels through difficult maneuvers, hazards, and pursuit.", 60),
  defineSpecialization("sailing-ocean-command", "sailing", "Ocean Command", "Leading major voyages and crews across the most hostile seas.", 90),

  defineSpecialization("slayer-monster-lore", "slayer", "Monster Lore", "Studying unusual creatures to expose their habits, defenses, and weaknesses.", 30),
  defineSpecialization("slayer-contract-hunting", "slayer", "Contract Hunting", "Pursuing assigned threats efficiently across varied regions and conditions.", 60),
  defineSpecialization("slayer-apex-slayer", "slayer", "Apex Slayer", "Confronting the rarest and most dangerous creatures at the height of their power.", 90),

  defineSpecialization("smithing-forging", "smithing", "Forging", "Producing reliable metal tools, weapons, fittings, and practical components.", 30),
  defineSpecialization("smithing-armorsmithing", "smithing", "Armorsmithing", "Creating protective equipment that balances resilience, fit, and movement.", 60),
  defineSpecialization("smithing-masterwork", "smithing", "Masterwork", "Shaping exceptional alloys into singular pieces of legendary quality.", 90),

  defineSpecialization("strength-prowess", "strength", "Prowess", "Applying raw power efficiently in sustained combat and physical trials.", 30),
  defineSpecialization("strength-grappling", "strength", "Grappling", "Controlling position through holds, throws, leverage, and close pressure.", 60),
  defineSpecialization("strength-titans-might", "strength", "Titan's Might", "Performing feats of force beyond the limits of ordinary warriors.", 90),

  defineSpecialization("summoning-familiar-binding", "summoning", "Familiar Binding", "Calling dependable companions and maintaining stable magical bonds.", 30),
  defineSpecialization("summoning-spirit-pacts", "summoning", "Spirit Pacts", "Negotiating stronger relationships with intelligent otherworldly beings.", 60),
  defineSpecialization("summoning-legendary-invocation", "summoning", "Legendary Invocation", "Manifesting rare entities whose presence can transform an entire encounter.", 90),

  defineSpecialization("thieving-infiltration", "thieving", "Infiltration", "Entering guarded spaces through stealth, timing, and careful observation.", 30),
  defineSpecialization("thieving-deception", "thieving", "Deception", "Using disguises, misdirection, and social manipulation to bypass resistance.", 60),
  defineSpecialization("thieving-grand-heists", "thieving", "Grand Heists", "Planning elaborate thefts against layered security and exceptional targets.", 90),

  defineSpecialization("woodcutting-forestry", "woodcutting", "Forestry", "Managing living woodland while gathering dependable natural resources.", 30),
  defineSpecialization("woodcutting-timbercraft", "woodcutting", "Timbercraft", "Selecting and harvesting difficult timber for demanding construction and craft.", 60),
  defineSpecialization("woodcutting-ancient-groves", "woodcutting", "Ancient Groves", "Working among magical forests, colossal trees, and awakened woodland.", 90),
] satisfies SpecializationDefinition[];

export type SpecializationId = (typeof SPECIALIZATIONS)[number]["id"];
