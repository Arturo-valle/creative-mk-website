/**
 * One-off image pipeline for images/.
 *
 * Sources live in images/_source/ and never ship: scripts/build-pages.mjs skips
 * any directory whose name starts with `_`, so dist/ only ever receives the
 * derivatives this script writes next to them.
 *
 * For each source PNG it emits:
 *   <name>-480.avif  <name>-960.avif
 *   <name>-480.webp  <name>-960.webp
 *   <name>.jpg       (720px fallback, or .png when the source has real alpha)
 *
 * Widths stop at 960 because every source in this project is at most 1024px
 * wide; a 1440 tier would only upscale.
 *
 * sharp is not a declared dependency — adding it would force a lock-file
 * regeneration, and the derivatives are committed, so the pipeline only needs
 * to run when source art changes:
 *
 *   npm i --no-save sharp && node scripts/convert-images.mjs
 */

import { readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(root, 'images', '_source');
const outputRoot = join(root, 'images');

const WIDTHS = [480, 960];
const FALLBACK_WIDTH = 720;
const AVIF = { quality: 46, effort: 5 };
const WEBP = { quality: 64, effort: 5 };
const JPEG = { quality: 74, mozjpeg: true };
const PNG = { compressionLevel: 9, palette: true, quality: 70 };

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('sharp is not installed. Run: npm i --no-save sharp');
  process.exit(1);
}

if (!existsSync(sourceDir)) {
  console.error(`Missing ${relative(root, sourceDir)}. Sources belong there, not in images/.`);
  process.exit(1);
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile() && extname(entry.name).toLowerCase() === '.png') out.push(full);
  }
  return out;
}

const sources = await walk(sourceDir);
let written = 0;
let total = 0;

for (const source of sources) {
  const rel = relative(sourceDir, source);
  const base = join(outputRoot, rel).replace(/\.png$/i, '');
  const image = sharp(source);
  const meta = await image.metadata();
  const stats = await image.stats();
  const hasAlpha = Boolean(meta.hasAlpha) && !stats.isOpaque;

  for (const width of WIDTHS) {
    if (width > meta.width) continue;
    for (const [ext, encode] of [['avif', (p) => p.avif(AVIF)], ['webp', (p) => p.webp(WEBP)]]) {
      const target = `${base}-${width}.${ext}`;
      const buffer = await encode(sharp(source).resize({ width, withoutEnlargement: true })).toBuffer();
      await writeFile(target, buffer);
      written += 1;
      total += buffer.length;
    }
  }

  // The <img> fallback. JPEG unless the artwork actually uses transparency.
  const fallbackPipeline = sharp(source).resize({ width: FALLBACK_WIDTH, withoutEnlargement: true });
  const fallback = hasAlpha
    ? { ext: 'png', buffer: await fallbackPipeline.png(PNG).toBuffer() }
    : { ext: 'jpg', buffer: await fallbackPipeline.jpeg(JPEG).toBuffer() };
  await writeFile(`${base}.${fallback.ext}`, fallback.buffer);
  written += 1;
  total += fallback.buffer.length;
}

console.log(
  `Wrote ${written} derivatives from ${sources.length} sources, ${(total / 1024 / 1024).toFixed(2)} MB total.`
);
