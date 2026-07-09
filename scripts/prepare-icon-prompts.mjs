import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const collectibleDataDir = path.join(root, "src", "data", "collectibles");
const outputDir = path.join(root, "tmp", "icon-pipeline");
const outputPath = path.join(outputDir, "missing-icons.jsonl");

const collectibleObjects = [];

function literalValue(node) {
  if (!node) return undefined;
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  return undefined;
}

function objectProperty(objectLiteral, propertyName) {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = ts.isIdentifier(property.name) || ts.isStringLiteralLike(property.name) ? property.name.text : undefined;
    if (name === propertyName) return property.initializer;
  }

  return undefined;
}

function visit(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "collectibles" && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
    collectObjectsFromArray(node.initializer);
  }

  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text.endsWith("Collectibles") && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
    collectObjectsFromArray(node.initializer);
  }

  ts.forEachChild(node, visit);
}

function collectObjectsFromArray(arrayLiteral) {
  for (const element of arrayLiteral.elements) {
    if (!ts.isObjectLiteralExpression(element)) continue;
    const id = literalValue(objectProperty(element, "id"));
    const category = literalValue(objectProperty(element, "category"));
    const name = literalValue(objectProperty(element, "name"));
    const type = literalValue(objectProperty(element, "type"));
    const description = literalValue(objectProperty(element, "description"));
    const icon = literalValue(objectProperty(element, "icon"));
    if (id && category && name && type) {
      collectibleObjects.push({ id, category, name, type, description, icon });
    }
  }
}

for (const entry of fs.readdirSync(collectibleDataDir)) {
  if (!entry.endsWith(".ts")) continue;
  const dataPath = path.join(collectibleDataDir, entry);
  const sourceText = fs.readFileSync(dataPath, "utf8");
  const sourceFile = ts.createSourceFile(dataPath, sourceText, ts.ScriptTarget.Latest, true);
  visit(sourceFile);
}

fs.mkdirSync(outputDir, { recursive: true });

const missing = collectibleObjects
  .map((item) => {
    const iconPath = item.icon ?? `assets/icons/${item.category}/${item.id}.webp`;
    const absoluteIconPath = path.join(root, "public", iconPath.replace(/^assets\//, "assets/"));
    return { ...item, iconPath, absoluteIconPath };
  })
  .filter((item) => !fs.existsSync(item.absoluteIconPath));

const singularCategory = {
  characters: "character",
  classes: "class",
  races: "race",
  pets: "pet",
  mounts: "mount",
  tools: "tool",
};

const visualDirections = [
  "Use an unexpected silhouette and a distinct palette. Avoid a standard helmeted armored bust; consider a hood, veil, bare head, mask, crown, ritual paint, or a strong carried prop.",
  "Push the shape language away from generic fantasy portraits. Use a different pose, asymmetry, costume profile, and color pairing than neighboring icons.",
  "Make the subject immediately recognizable from its outline alone. Vary headwear, shoulder shape, materials, and focal accessory; do not default to a centered iron helmet.",
  "Use a bold but restrained color identity with one memorable visual hook. Prefer a distinct silhouette over extra surface detail and avoid repeating the same bust composition.",
  "Give the icon a strong cultural or occupational identity through clothing, tools, ornament, or posture. It may be robed, masked, hooded, bare-headed, mechanical, spectral, or heavily asymmetric.",
  "Design this as one member of a large collection: it must read differently at a glance from the previous icons. Change the pose, outline, palette, and dominant material rather than adding generic decoration.",
];

function directionFor(id) {
  const hash = [...id].reduce((total, character) => total + character.charCodeAt(0), 0);
  return visualDirections[hash % visualDirections.length];
}

function categoryGuidance(item) {
  if (item.category === "mounts") {
    return "Mount variety rule: vary anatomy, stance, head shape, movement, tack, and dominant material. Do not make every mount a side-profile horse or a generic animal head.";
  }

  if (item.category === "pets") {
    return "Pet variety rule: vary species, scale, pose, eye shape, texture, and silhouette. Small charms, insects, birds, amphibians, constructs, and strange familiars are welcome when they fit the description.";
  }

  if (item.category === "tools") {
    return "Tool variety rule: vary angle, construction, material, wear, handle shape, and functional silhouette. Make the object readable without relying on a generic sword or glowing fantasy prop.";
  }

  if (item.category === "classes") {
    return "Class variety rule: communicate the role through a distinct emblem, weapon, garment, or equipment silhouette. Do not repeat the same centered shield or weapon composition.";
  }

  if (item.category === "characters" || item.category === "races") {
    return "People variety rule: vary body shape, pose, headwear, costume, skin/material palette, and cultural signature. Helmets are optional, not a default.";
  }

  return "General variety rule: make the icon immediately distinguishable from neighboring entries through silhouette, palette, pose, material, or one memorable detail.";
}

const lines = missing.map((item) => {
  const keyColor = item.category === "races" && ["Orc", "Goblin", "Troll"].includes(item.type) ? "#ff00ff" : "#00ff00";
  const categoryLabel = singularCategory[item.category] ?? "collectible";
  const prompt = [
    "Use case: stylized-concept",
    "Asset type: mobile game collectible icon",
    `Primary request: ${item.name}, ${item.type} ${categoryLabel} icon`,
    "Style/medium: gritty old-school MMORPG inventory icon, low-detail matte painted asset, rough hand-painted edges, readable at 54px",
    "Composition/framing: single centered subject, three-quarter view where useful, generous padding, no crop",
    `Subject: ${item.description ?? item.name}`,
    `Visual variety direction: ${directionFor(item.id)}`,
    categoryGuidance(item),
    "Collection rule: maximize variety across a large icon set. Do not make every item a similar centered armored bust; distinct colors, silhouettes, poses, costume shapes, and signature props are preferred over uniformity.",
    `Scene/backdrop: perfectly flat solid ${keyColor} chroma-key background for background removal`,
    "Constraints: no frame, no border, no tile, no card, no UI, no text, no watermark, no cast shadow, no contact shadow, no floor plane",
    `Avoid: high gloss, cute children's-book style, cinematic lighting, scene background, gradients, smoke, sparkles, use of ${keyColor} in the subject`,
  ].join("\\n");

  return JSON.stringify({
    id: item.id,
    category: item.category,
    name: item.name,
    type: item.type,
    keyColor,
    prompt,
    sourcePath: `tmp/icon-pipeline/source/${item.id}.png`,
    outputPath: item.iconPath,
  });
});

fs.writeFileSync(outputPath, `${lines.join("\n")}${lines.length > 0 ? "\n" : ""}`);

console.log(`Collectibles: ${collectibleObjects.length}`);
console.log(`Missing icons: ${missing.length}`);
console.log(`Wrote ${path.relative(root, outputPath)}`);
