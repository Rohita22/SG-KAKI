import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sceneDir = path.resolve(scriptDir, '../game-production/scene4');

const closedBusSource = path.join(
  sceneDir,
  'vehicles/source/service-50-closed-source.png',
);
const openBusSource = path.join(
  sceneDir,
  'vehicles/source/service-50-open-chroma.png',
);
const readerSource = path.join(
  sceneDir,
  'props/source/simplygo-reader-chroma.png',
);

function removeChromaGreen(input) {
  const rgba = Buffer.from(input);

  for (let index = 0; index < rgba.length; index += 4) {
    const red = rgba[index];
    const green = rgba[index + 1];
    const blue = rgba[index + 2];
    const strongestOtherChannel = Math.max(red, blue);
    const greenDominance = green - strongestOtherChannel;

    if (green > 105 && greenDominance > 32) {
      const alpha = Math.round(
        255 * Math.max(0, Math.min(1, (120 - greenDominance) / 88)),
      );
      rgba[index + 3] = Math.min(rgba[index + 3], alpha);

      if (alpha > 0) {
        rgba[index + 1] = Math.min(green, strongestOtherChannel + 14);
      }
    }
  }

  return rgba;
}

function foregroundBounds(data, width, height, alphaThreshold = 12) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] <= alphaThreshold) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    throw new Error('No foreground pixels found while processing Scene 4 asset');
  }

  return { minX, minY, maxX, maxY };
}

function paddedBounds(bounds, width, height, padding) {
  return {
    minX: Math.max(0, bounds.minX - padding),
    minY: Math.max(0, bounds.minY - padding),
    maxX: Math.min(width - 1, bounds.maxX + padding),
    maxY: Math.min(height - 1, bounds.maxY + padding),
  };
}

async function readRgba(inputPath, removeGreen = false) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data: removeGreen ? removeChromaGreen(data) : Buffer.from(data),
    height: info.height,
    width: info.width,
  };
}

async function writeCrop(source, bounds, outputPath) {
  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;

  await sharp(source.data, {
    raw: { width: source.width, height: source.height, channels: 4 },
  })
    .extract({ left: bounds.minX, top: bounds.minY, width, height })
    .png()
    .toFile(outputPath);

  return { width, height };
}

const closedBus = await readRgba(closedBusSource);
const openBus = await readRgba(openBusSource, true);

if (
  closedBus.width !== openBus.width ||
  closedBus.height !== openBus.height
) {
  throw new Error('Closed and open bus sources must share the same dimensions');
}

const closedBounds = foregroundBounds(
  closedBus.data,
  closedBus.width,
  closedBus.height,
);
const openBounds = foregroundBounds(openBus.data, openBus.width, openBus.height);
const sharedBusBounds = paddedBounds(
  {
    minX: Math.min(closedBounds.minX, openBounds.minX),
    minY: Math.min(closedBounds.minY, openBounds.minY),
    maxX: Math.max(closedBounds.maxX, openBounds.maxX),
    maxY: Math.max(closedBounds.maxY, openBounds.maxY),
  },
  closedBus.width,
  closedBus.height,
  18,
);

const closedOutput = path.join(sceneDir, 'vehicles/service-50-closed-v1.png');
const openOutput = path.join(sceneDir, 'vehicles/service-50-open-v1.png');
const busInfo = await writeCrop(closedBus, sharedBusBounds, closedOutput);
await writeCrop(openBus, sharedBusBounds, openOutput);

const reader = await readRgba(readerSource, true);
const readerBounds = paddedBounds(
  foregroundBounds(reader.data, reader.width, reader.height),
  reader.width,
  reader.height,
  24,
);
const readerOutput = path.join(sceneDir, 'props/simplygo-reader-v1.png');
const readerInfo = await writeCrop(reader, readerBounds, readerOutput);

console.log(
  `Created synchronized bus sprites ${busInfo.width}x${busInfo.height} and fare reader ${readerInfo.width}x${readerInfo.height}`,
);
