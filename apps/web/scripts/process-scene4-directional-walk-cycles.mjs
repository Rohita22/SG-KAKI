import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const charactersDir = path.resolve(scriptDir, '../game-production/scene4/characters');
const publicCharactersDir = path.resolve(scriptDir, '../public/scenes/scene4/characters');
const sheets = [
  ['source/player-walk-front-v2-checker.png', 'player-walk-front.png'],
  ['source/player-walk-back-v1-checker.png', 'player-walk-back.png'],
];

const WIDTH = 2048;
const HEIGHT = 768;

function isBackgroundPixel(data, index) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const brightest = Math.max(red, green, blue);
  const darkest = Math.min(red, green, blue);
  return darkest >= 225 && brightest - darkest <= 14;
}

async function removeConnectedCheckerboard(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.width !== WIDTH || info.height !== HEIGHT || info.channels !== 4) {
    throw new Error(`Unexpected sprite dimensions ${info.width}x${info.height}x${info.channels}`);
  }

  const visited = new Uint8Array(WIDTH * HEIGHT);
  const queue = new Int32Array(WIDTH * HEIGHT);
  let head = 0;
  let tail = 0;

  const enqueue = (x, y) => {
    const pixel = y * WIDTH + x;
    if (visited[pixel] || !isBackgroundPixel(data, pixel * 4)) return;
    visited[pixel] = 1;
    queue[tail] = pixel;
    tail += 1;
  };

  for (let x = 0; x < WIDTH; x += 1) {
    enqueue(x, 0);
    enqueue(x, HEIGHT - 1);
  }
  for (let y = 1; y < HEIGHT - 1; y += 1) {
    enqueue(0, y);
    enqueue(WIDTH - 1, y);
  }

  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % WIDTH;
    const y = Math.floor(pixel / WIDTH);
    if (x > 0) enqueue(x - 1, y);
    if (x + 1 < WIDTH) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y + 1 < HEIGHT) enqueue(x, y + 1);
  }

  for (let pixel = 0; pixel < visited.length; pixel += 1) {
    if (visited[pixel]) data[pixel * 4 + 3] = 0;
  }

  await sharp(data, { raw: info }).png().toFile(outputPath);
}

await fs.mkdir(publicCharactersDir, { recursive: true });
for (const [sourceName, outputName] of sheets) {
  const sourcePath = path.join(charactersDir, sourceName);
  const productionPath = path.join(charactersDir, outputName);
  const publicPath = path.join(publicCharactersDir, outputName);
  await removeConnectedCheckerboard(sourcePath, productionPath);
  await fs.copyFile(productionPath, publicPath);
  console.log(`Created ${outputName} (${WIDTH}x${HEIGHT}, 4 RGBA frames)`);
}
