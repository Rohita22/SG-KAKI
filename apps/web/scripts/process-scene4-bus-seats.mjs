import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(scriptDir, '..');
const productionProps = path.join(webDir, 'game-production/scene4/props');
const sourceDir = path.join(productionProps, 'source');
const publicProps = path.join(webDir, 'public/scenes/scene4/props');

const backgrounds = [
  ['bus-interior-entry-seats-removed-v1.png', 'bus-interior-entry.png'],
  ['bus-interior-doors-closed-seats-removed-v1.png', 'bus-interior-doors-closed.png'],
  ['bus-interior-doors-open-seats-removed-v1.png', 'bus-interior-doors-open.png'],
  ['bus-interior-moving-seats-removed-v1.png', 'bus-interior-moving.png'],
];

await fs.mkdir(publicProps, { recursive: true });

for (const [sourceName, outputName] of backgrounds) {
  const output = await sharp(path.join(sourceDir, sourceName))
    .resize(2176, 724, { fit: 'fill' })
    .png()
    .toBuffer();
  await Promise.all([
    fs.writeFile(path.join(productionProps, outputName), output),
    fs.writeFile(path.join(publicProps, outputName), output),
  ]);
}

const seat = await sharp(path.join(sourceDir, 'bus-seat-single-source-v1.png'))
  .ensureAlpha()
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ height: 512, fit: 'inside', withoutEnlargement: true })
  .png()
  .toBuffer();

await Promise.all([
  fs.writeFile(path.join(productionProps, 'bus-seat.png'), seat),
  fs.writeFile(path.join(publicProps, 'bus-seat.png'), seat),
]);

console.log('Created four layered bus backgrounds and one reusable seat sprite.');
