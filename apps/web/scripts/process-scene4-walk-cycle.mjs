import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sceneDir = path.resolve(scriptDir, '../game-production/scene4/characters');
const inputPath = path.join(sceneDir, 'source/player-walk-right-v1-chroma.png');
const outputPath = path.join(sceneDir, 'player-walk-right.png');
const publicPath = path.resolve(scriptDir, '../public/scenes/scene4/characters/player-walk-right.png');

const FRAME_WIDTH = 512;
const FRAME_HEIGHT = 768;
const FEET_BASELINE = 742;
const SOURCE_SEGMENTS = [
  [0, 480],
  [480, 770],
  [770, 1225],
  [1225, 1536],
];

const { data: sourceData, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

if (info.width !== 1536 || info.height !== 1024 || info.channels !== 4) {
  throw new Error(
    `Unexpected source dimensions ${info.width}x${info.height}x${info.channels}; expected 1536x1024 RGBA`,
  );
}

const rgba = Buffer.from(sourceData);

// Convert the deliberately generated chroma-green plate to alpha. The smooth
// falloff retains inked antialiasing while suppressing green spill at edges.
for (let i = 0; i < rgba.length; i += 4) {
  const red = rgba[i];
  const green = rgba[i + 1];
  const blue = rgba[i + 2];
  const strongestOtherChannel = Math.max(red, blue);
  const greenDominance = green - strongestOtherChannel;

  if (green > 120 && greenDominance > 38) {
    const alpha = Math.round(255 * Math.max(0, Math.min(1, (185 - greenDominance) / 147)));
    rgba[i + 3] = Math.min(rgba[i + 3], alpha);

    if (alpha > 0) {
      rgba[i + 1] = Math.min(green, strongestOtherChannel + 20);
    }
  }
}

function alphaAt(x, y) {
  return rgba[(y * info.width + x) * 4 + 3];
}

function findBounds(startX, endX) {
  let minX = endX;
  let minY = info.height;
  let maxX = startX;
  let maxY = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      if (alphaAt(x, y) <= 12) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (minX > maxX || minY > maxY) {
    throw new Error(`No foreground pixels found in source segment ${startX}-${endX}`);
  }

  return { minX, minY, maxX, maxY };
}

function findHeadCenter(bounds) {
  const headBottom = Math.min(bounds.maxY, bounds.minY + 175);
  let weightedX = 0;
  let weight = 0;

  for (let y = bounds.minY; y <= headBottom; y += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const alpha = alphaAt(x, y);
      if (alpha <= 24) continue;
      weightedX += x * alpha;
      weight += alpha;
    }
  }

  return weight > 0 ? weightedX / weight : (bounds.minX + bounds.maxX) / 2;
}

function extractRaw(bounds) {
  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;
  const output = Buffer.alloc(width * height * 4);

  for (let row = 0; row < height; row += 1) {
    const sourceStart = ((bounds.minY + row) * info.width + bounds.minX) * 4;
    const destinationStart = row * width * 4;
    rgba.copy(output, destinationStart, sourceStart, sourceStart + width * 4);
  }

  return { data: output, width, height };
}

const frameBuffers = [];
for (const [startX, endX] of SOURCE_SEGMENTS) {
  const bounds = findBounds(startX, endX);
  const headCenter = findHeadCenter(bounds);
  const crop = extractRaw(bounds);
  const left = Math.round(FRAME_WIDTH / 2 - (headCenter - bounds.minX));
  const top = Math.round(FEET_BASELINE - (bounds.maxY - bounds.minY));

  if (left < 0 || left + crop.width > FRAME_WIDTH || top < 0 || top + crop.height > FRAME_HEIGHT) {
    throw new Error(`Frame does not fit ${FRAME_WIDTH}x${FRAME_HEIGHT}: ${JSON.stringify({ bounds, left, top })}`);
  }

  frameBuffers.push(
    await sharp({
      create: {
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: crop.data,
          raw: { width: crop.width, height: crop.height, channels: 4 },
          left,
          top,
        },
      ])
      .png()
      .toBuffer(),
  );
}

await sharp({
  create: {
    width: FRAME_WIDTH * frameBuffers.length,
    height: FRAME_HEIGHT,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(
    frameBuffers.map((input, index) => ({
      input,
      left: index * FRAME_WIDTH,
      top: 0,
    })),
  )
  .png()
  .toFile(outputPath);

await fs.copyFile(outputPath, publicPath);

console.log(`Created ${outputPath} (${FRAME_WIDTH * frameBuffers.length}x${FRAME_HEIGHT}, 4 frames)`);
