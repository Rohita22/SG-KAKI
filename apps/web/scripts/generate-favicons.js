import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(__filename, '..', '..');
const input = path.join(root, 'public', 'images', 'ChatGPT Image Aug 5, 2026, 04_48_01 PM.png');
const out32 = path.join(root, 'public', 'images', 'favicon-32.png');
const out64 = path.join(root, 'public', 'images', 'favicon-64.png');
const out128 = path.join(root, 'public', 'images', 'favicon-128.png');
const out180 = path.join(root, 'public', 'images', 'favicon-180.png');

if (!fs.existsSync(input)) {
  console.error('Input image not found:', input);
  process.exit(1);
}

(async () => {
  try {
    await sharp(input).resize(32, 32, {fit: 'cover'}).png().toFile(out32);
    console.log('Wrote', out32);
    await sharp(input).resize(64, 64, {fit: 'cover'}).png().toFile(out64);
    console.log('Wrote', out64);
    await sharp(input).resize(128, 128, {fit: 'cover'}).png().toFile(out128);
    console.log('Wrote', out128);
    await sharp(input).resize(180, 180, {fit: 'cover'}).png().toFile(out180);
    console.log('Wrote', out180);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
