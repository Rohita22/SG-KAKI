import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sceneDir = path.resolve(scriptDir, '../game-production/scene4');
const publicDir = path.resolve(scriptDir, '../public/scenes/scene4');

const assets = [
  ['props/source/punggol-fare-reader-post-v4-checker.png', 'props/punggol-fare-gate-reader.png', 'checker'],
  ['props/source/punggol-fare-door-closed-v4-checker.png', 'props/punggol-fare-gate-flaps-closed.png', 'checker'],
  ['props/source/punggol-fare-door-open-v4-checker.png', 'props/punggol-fare-gate-flaps-open.png', 'checker'],
];

function isConnectedBlack(data, index) {
  return Math.max(data[index], data[index + 1], data[index + 2]) <= 18;
}

function isConnectedChecker(data, index) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  return Math.min(red, green, blue) >= 205
    && Math.max(red, green, blue) - Math.min(red, green, blue) <= 18;
}

async function exportAsset(inputPath, outputPath, backgroundMode) {
  if (!backgroundMode) {
    await sharp(inputPath).ensureAlpha().png().toFile(outputPath);
    return;
  }
  const { data, info } = await sharp(inputPath).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const pixelCount = info.width * info.height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;
  const enqueue = (x, y) => {
    const pixel = y * info.width + x;
    const index = pixel * 4;
    const isBackground = backgroundMode === 'checker'
      ? isConnectedChecker(data, index)
      : isConnectedBlack(data, index);
    if (visited[pixel] || !isBackground) return;
    visited[pixel] = 1;
    queue[tail] = pixel;
    tail += 1;
  };
  for (let x = 0; x < info.width; x += 1) {
    enqueue(x, 0);
    enqueue(x, info.height - 1);
  }
  for (let y = 1; y < info.height - 1; y += 1) {
    enqueue(0, y);
    enqueue(info.width - 1, y);
  }
  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % info.width;
    const y = Math.floor(pixel / info.width);
    if (x > 0) enqueue(x - 1, y);
    if (x + 1 < info.width) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y + 1 < info.height) enqueue(x, y + 1);
  }
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    if (visited[pixel]) data[pixel * 4 + 3] = 0;
  }
  const output = sharp(data, { raw: info });
  if (backgroundMode === 'checker') {
    await output
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath);
    return;
  }
  await output.png().toFile(outputPath);
}

for (const [sourceName, outputName, backgroundMode] of assets) {
  const sourcePath = path.join(sceneDir, sourceName);
  const productionPath = path.join(sceneDir, outputName);
  const publicPath = path.join(publicDir, outputName);
  await fs.mkdir(path.dirname(productionPath), { recursive: true });
  await fs.mkdir(path.dirname(publicPath), { recursive: true });
  await exportAsset(sourcePath, productionPath, backgroundMode);
  await fs.copyFile(productionPath, publicPath);
  console.log(`Created ${outputName}`);
}
