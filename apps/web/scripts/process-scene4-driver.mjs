import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sceneDir = path.resolve(scriptDir, '../game-production/scene4');
const inputPath = path.join(sceneDir, 'characters/source/bus-driver-chroma.png');
const outputPath = path.join(sceneDir, 'characters/bus-driver-v1.png');

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const rgba = Buffer.from(data);

for (let index = 0; index < rgba.length; index += 4) {
  const red = rgba[index];
  const green = rgba[index + 1];
  const blue = rgba[index + 2];
  const strongestOther = Math.max(red, blue);
  const dominance = green - strongestOther;

  if (green > 96 && dominance > 24) {
    const alpha = Math.round(
      255 * Math.max(0, Math.min(1, (104 - dominance) / 78)),
    );
    rgba[index + 3] = Math.min(rgba[index + 3], alpha);
    if (alpha > 0) rgba[index + 1] = Math.min(green, strongestOther + 10);
  }
}

let minX = info.width;
let minY = info.height;
let maxX = -1;
let maxY = -1;
for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    if (rgba[(y * info.width + x) * 4 + 3] <= 12) continue;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
}

const padding = 20;
const left = Math.max(0, minX - padding);
const top = Math.max(0, minY - padding);
const width = Math.min(info.width - 1, maxX + padding) - left + 1;
const height = Math.min(info.height - 1, maxY + padding) - top + 1;

await sharp(rgba, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .extract({ left, top, width, height })
  .png()
  .toFile(outputPath);

console.log(`Created bus driver sprite ${width}x${height}`);
