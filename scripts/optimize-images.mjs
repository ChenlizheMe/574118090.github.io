// Shrinks site images in place and writes a small "-sm.webp" variant for
// inline display (the full file is only fetched by the lightbox).
// Usage: npm run images   (idempotent; already-small files are left alone)
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';

sharp.cache(false);
const FULL = 1600, SMALL = 960, PROFILE = 960;
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const kb = n => `${Math.round(n / 1024)} KB`;
const webp = (input, width, quality) => sharp(input)
  .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
  .webp({ quality, effort: 6, smartSubsample: true }).toBuffer();

async function shrink(file, width, quality) {
  const src = readFileSync(file);
  const meta = await sharp(src).metadata();
  const big = Math.max(meta.width, meta.height) > width;
  if (!big && src.length < 160 * 1024) return src;
  const out = await webp(src, width, quality);
  if (!big && out.length >= src.length) return src;
  writeFileSync(file, out);
  console.log(`full  ${file}: ${kb(src.length)} -> ${kb(out.length)}`);
  return out;
}

for (const file of walk('img')) {
  if (extname(file) !== '.webp' || file.endsWith('-sm.webp')) continue;
  const isProfile = /profile\.webp$/.test(file);
  const data = await shrink(file, isProfile ? PROFILE : FULL, isProfile ? 84 : 80);
  if (isProfile) continue;
  const sm = file.replace(/\.webp$/, '-sm.webp');
  if (existsSync(sm) && statSync(sm).mtimeMs >= statSync(file).mtimeMs) continue;
  const out = await webp(data, SMALL, 74);
  writeFileSync(sm, out.length < data.length ? out : data);
  console.log(`small ${sm}: ${kb(Math.min(out.length, data.length))}`);
}

const fav = 'img/favicon.png';
if (existsSync(fav)) {
  const src = readFileSync(fav);
  if ((await sharp(src).metadata()).width > 64) {
    const out = await sharp(src).resize(64, 64).png({ compressionLevel: 9, palette: true }).toBuffer();
    writeFileSync(fav, out);
    console.log(`favicon ${kb(src.length)} -> ${kb(out.length)}`);
  }
}
