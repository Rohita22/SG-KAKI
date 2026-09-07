import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sceneDir = path.resolve(scriptDir, '../game-production/scene4');
const inputPath = path.join(sceneDir, 'characters/source/mrt-staff-walk-right-v1-checker.png');
const productionPath = path.join(sceneDir, 'characters/mrt-staff-walk-right.png');
const publicPath = path.resolve(scriptDir, '../public/scenes/scene4/characters/mrt-staff-walk-right.png');

const { data, info } = await sharp(inputPath).ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
const pixelCount = info.width * info.height;
const visited = new Uint8Array(pixelCount);
const queue = new Int32Array(pixelCount);
let head = 0;
let tail = 0;

const isChecker = (index) => {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  return Math.min(red, green, blue) >= 205
    && Math.max(red, green, blue) - Math.min(red, green, blue) <= 18;
};
const enqueue = (x, y) => {
  const pixel = y * info.width + x;
  if (visited[pixel] || !isChecker(pixel * 4)) return;
  visited[pixel] = 1;
  queue[tail++] = pixel;
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
  const pixel = queue[head++];
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

await sharp(data, { raw: info })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 6, bottom: 6, left: 6, right: 6, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(productionPath);
await fs.copyFile(productionPath, publicPath);
console.log('Created transparent MRT staff character.');
