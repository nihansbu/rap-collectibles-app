import sharp from "sharp";

const source = "public/assets/icons/ui/ui-rap.webp";

for (const size of [192, 512]) {
  const symbolSize = Math.round(size * 0.7);
  const symbol = await sharp(source).resize(symbolSize, symbolSize, { fit: "contain" }).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: "#111614" },
  })
    .composite([{ input: symbol, gravity: "center" }])
    .png()
    .toFile(`public/assets/icons/ui/app-${size}.png`);
}

console.log("Generated PWA icons: 192px and 512px");
