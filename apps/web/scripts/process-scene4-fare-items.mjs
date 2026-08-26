import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const propsDirectory = path.resolve(
  scriptDirectory,
  '../game-production/scene4/props',
);

const assets = [
  'fare-item-travel-card-v1',
  'fare-item-umbrella-v1',
  'fare-item-water-bottle-v1',
];

await Promise.all(
  assets.map(async (asset) => {
    const source = path.join(propsDirectory, 'source', `${asset}-source.png`);
    const output = path.join(propsDirectory, `${asset}.png`);

    await sharp(source)
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        withoutEnlargement: true,
      })
      .png()
      .toFile(output);
  }),
);
