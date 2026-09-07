import sharp from 'sharp';
import { join } from 'node:path';

const root = process.cwd();
const environment = join(root, 'public', 'scenes', 'scene4', 'environments');
const vehicles = join(root, 'public', 'scenes', 'scene4', 'vehicles');
const output = join(root, 'game-production', 'scene4', 'exports', 'browser-tests');

const fit = (path, width, height) => sharp(path).resize(width, height).png().toBuffer();

const nelBackground = await fit(join(environment, 'punggol-nel-platform-base.png'), 2176, 724);
const nelTrain = await fit(join(vehicles, 'nel-train-doors-open.png'), 1850, 230);
const nelDoors = await fit(join(environment, 'punggol-nel-platform-doors-open.png'), 2176, 724);
const nelTrackMask = Buffer.from(`
  <svg width="2176" height="724" xmlns="http://www.w3.org/2000/svg">
    <rect x="1570" y="245" width="390" height="245" fill="white"/>
  </svg>
`);
const nelTrainLayer = await sharp({
  create: { width: 2176, height: 724, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([
    { input: nelTrain, left: 875, top: 255 },
    { input: nelTrackMask, blend: 'dest-in' },
  ])
  .png()
  .toBuffer();
await sharp(nelBackground)
  .composite([
    { input: nelTrainLayer, left: 0, top: 0 },
    { input: nelDoors, left: 0, top: 0 },
  ])
  .png()
  .toFile(join(output, 'punggol-nel-runtime-layering-v2.png'));

const dtlBackground = await fit(join(environment, 'little-india-dtl-platform-base.png'), 2176, 724);
const fullDtlTrain = await fit(join(vehicles, 'dtl-train-doors-open.png'), 1960, 184);
const expoTrain = await sharp(fullDtlTrain)
  .extract({ left: 480, top: 0, width: 736, height: 184 })
  .png()
  .toBuffer();
const bukitPanjangTrain = await sharp(fullDtlTrain)
  .flop()
  .extract({ left: 920, top: 0, width: 660, height: 184 })
  .png()
  .toBuffer();
const dtlDoors = await fit(join(environment, 'little-india-dtl-platform-doors-open.png'), 2176, 724);
await sharp(dtlBackground)
  .composite([
    { input: bukitPanjangTrain, left: 40, top: 296 },
    { input: expoTrain, left: 1400, top: 296 },
    { input: dtlDoors, left: 0, top: 0 },
  ])
  .png()
  .toFile(join(output, 'little-india-dtl-runtime-layering-v1.png'));
