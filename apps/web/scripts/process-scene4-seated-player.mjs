import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(scriptDir, '..');
const sourcePath = path.join(
  webDir,
  'game-production/scene4/characters/source/player-seated-front-source.png',
);
const productionPath = path.join(
  webDir,
  'game-production/scene4/characters/player-seated-front.png',
);
const publicPath = path.join(
  webDir,
  'public/scenes/scene4/characters/player-seated-front.png',
);

const { data, info } = await sharp(sourcePath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const rgba = Buffer.from(data);
const visited = new Uint8Array(info.width * info.height);
const queue = new Int32Array(info.width * info.height);
let head = 0;
let tail = 0;

function isCheckerBackground(pixel) {
  const offset = pixel * 4;
  const red = rgba[offset];
  const green = rgba[offset + 1];
  const blue = rgba[offset + 2];
  return Math.min(red, green, blue) >= 214 && Math.max(red, green, blue) - Math.min(red, green, blue) <= 14;
}

function enqueue(x, y) {
  if (x < 0 || y < 0 || x >= info.width || y >= info.height) return;
  const pixel = y * info.width + x;
  if (visited[pixel] || !isCheckerBackground(pixel)) return;
  visited[pixel] = 1;
  queue[tail++] = pixel;
}

for (let x = 0; x < info.width; x += 1) {
  enqueue(x, 0);
  enqueue(x, info.height - 1);
}
for (let y = 0; y < info.height; y += 1) {
  enqueue(0, y);
  enqueue(info.width - 1, y);
}
// The seated legs enclose a pocket of the generated checkerboard, so it is
// disconnected from the outer background. Seed inside that exact pocket; the
// horizontal centre falls on the right trouser leg and therefore left the
// large white wedge visible in the exported sprite.
enqueue(Math.floor(info.width * 0.45), Math.floor(info.height * 0.65));

while (head < tail) {
  const pixel = queue[head++];
  const x = pixel % info.width;
  const y = Math.floor(pixel / info.width);
  rgba[pixel * 4 + 3] = 0;
  enqueue(x - 1, y);
  enqueue(x + 1, y);
  enqueue(x, y - 1);
  enqueue(x, y + 1);
}

const output = await sharp(rgba, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ height: 768, fit: 'inside', withoutEnlargement: true })
  .png()
  .toBuffer();

await fs.mkdir(path.dirname(publicPath), { recursive: true });
await Promise.all([
  fs.writeFile(productionPath, output),
  fs.writeFile(publicPath, output),
]);

console.log('Created transparent seated player sprite.');
