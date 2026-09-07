import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sceneDir = path.resolve(scriptDir, '../game-production/scene4');
const publicPropsDir = path.resolve(scriptDir, '../public/scenes/scene4/props');

const assets = [
  ['kadaloor-shelter-source.png', 'kadaloor-shelter.png', 24],
  ['kadaloor-bench-source.png', 'kadaloor-bench.png', 20],
  ['kadaloor-bollard-source.png', 'kadaloor-bollard.png', 18],
  ['kadaloor-stop-pole-source.png', 'kadaloor-stop-pole.png', 20],
];

function removeChromaGreen(input) {
  const rgba = Buffer.from(input);

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

      if (alpha > 0) {
        rgba[index + 1] = Math.min(green, strongestOther + 10);
      }
    }
  }

  return rgba;
}

function foregroundBounds(data, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] <= 12) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error('No foreground pixels found');
  }

  return { minX, minY, maxX, maxY };
}

async function processAsset(sourceName, outputName, padding) {
  const inputPath = path.join(sceneDir, 'props/source', sourceName);
  const outputPath = path.join(sceneDir, 'props', outputName);
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = removeChromaGreen(data);
  const bounds = foregroundBounds(rgba, info.width, info.height);
  const left = Math.max(0, bounds.minX - padding);
  const top = Math.max(0, bounds.minY - padding);
  const right = Math.min(info.width - 1, bounds.maxX + padding);
  const bottom = Math.min(info.height - 1, bounds.maxY + padding);
  const width = right - left + 1;
  const height = bottom - top + 1;

  await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract({ left, top, width, height })
    .png()
    .toFile(outputPath);

  await fs.mkdir(publicPropsDir, { recursive: true });
  await fs.copyFile(outputPath, path.join(publicPropsDir, outputName));

  return `${outputName} ${width}x${height}`;
}

const results = [];
for (const asset of assets) {
  results.push(await processAsset(...asset));
}

console.log(`Created exterior props:\n${results.join('\n')}`);
