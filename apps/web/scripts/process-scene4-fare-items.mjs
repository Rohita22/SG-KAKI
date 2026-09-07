import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const propsDirectory = path.resolve(
  scriptDirectory,
  '../game-production/scene4/props',
);
const publicPropsDirectory = path.resolve(
  scriptDirectory,
  '../public/scenes/scene4/props',
);

const assets = [
  ['fare-item-travel-card-v1-source.png', 'fare-item-travel-card.png'],
  ['fare-item-umbrella-v1-source.png', 'fare-item-umbrella.png'],
  ['fare-item-water-bottle-v1-source.png', 'fare-item-water-bottle.png'],
];

await fs.mkdir(publicPropsDirectory, { recursive: true });
await Promise.all(
  assets.map(async ([sourceName, outputName]) => {
    const source = path.join(propsDirectory, 'source', sourceName);
    const output = path.join(propsDirectory, outputName);

    await sharp(source)
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        withoutEnlargement: true,
      })
      .png()
      .toFile(output);
    await fs.copyFile(output, path.join(publicPropsDirectory, outputName));
  }),
);
