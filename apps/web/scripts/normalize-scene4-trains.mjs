import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const filenames = [
  'punggol-lrt-train.png',
  'punggol-lrt-train-doors-open.png',
  'nel-train.png',
  'nel-train-doors-open.png',
  'dtl-train.png',
  'dtl-train-doors-open.png',
];

const publicDirectory = path.resolve('public/scenes/scene4/vehicles');
const productionDirectory = path.resolve('game-production/scene4/vehicles');

await mkdir(productionDirectory, { recursive: true });

for (const filename of filenames) {
  const publicPath = path.join(publicDirectory, filename);
  const metadata = await sharp(publicPath).metadata();
  let sprite = sharp(publicPath);

  if (!metadata.hasAlpha) {
    const { data, info } = await sprite.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const output = Buffer.from(data);

    // Generated checkerboards are nearly neutral and brighter than 240. Find
    // the darker train pixels in each column, then fill only that silhouette.
    for (let x = 0; x < info.width; x += 1) {
      let top = info.height;
      let bottom = -1;
      for (let y = 0; y < info.height; y += 1) {
        const offset = (y * info.width + x) * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const darkest = Math.min(r, g, b);
        const chroma = Math.max(r, g, b) - darkest;
        if (darkest < 238 || chroma > 12) {
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
        }
      }

      for (let y = 0; y < info.height; y += 1) {
        const offset = (y * info.width + x) * 4 + 3;
        output[offset] = bottom >= top && y >= top - 2 && y <= bottom + 2 ? 255 : 0;
      }
    }

    sprite = sharp(output, { raw: info });
  }

  const normalized = await sprite
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 4, bottom: 4, left: 4, right: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await writeFile(publicPath, normalized);
  await copyFile(publicPath, path.join(productionDirectory, filename));
}
