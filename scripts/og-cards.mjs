/**
 * Open Graph cards, one per page, generated from the site's own type system.
 *
 * Until 2026-08-13 every URL on this property shared one og:image: the raw
 * brand PNG, 5000x3068, black. Every link shared to WhatsApp — the dominant
 * channel in this studio's market — rendered the same featureless rectangle,
 * whether it pointed at a case study, a service page or the privacy notice.
 * For a studio that sells branding, that was the most visible unbranded
 * surface it owned.
 *
 * Each card is composed as SVG and rasterised by sharp to the 1200x630 both
 * Open Graph and Twitter want. No headless browser, no font atlas: the type
 * is drawn with the same Inter that ships on the site, loaded from
 * css/fonts/ and embedded so the render does not depend on a system font
 * being present.
 *
 * Run: npm i --no-save sharp && node scripts/og-cards.mjs
 * The output is committed, so this only runs when the copy or design change.
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'images', 'og');

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('sharp is not installed. Run: npm i --no-save sharp');
  process.exit(1);
}

const services = (await import(pathToFileURL(join(root, 'src/_data/services.js')))).default;
const cases = (await import(pathToFileURL(join(root, 'src/_data/cases.js')))).default;
const notes = (await import(pathToFileURL(join(root, 'src/_data/notes.js')))).default;

/* The plate, not the paper: OG cards are viewed as thumbnails against
   arbitrary chat backgrounds, and the dark field is what keeps the crop
   readable in both light and dark clients. Tokens mirror css/variables.css. */
const INK = '#0f0e0c';
const PAPER = '#EDE9E1';
const GOLD = '#E8C840';
const MUTED = '#9a958c';

const W = 1200;
const H = 630;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** Break a title into lines that fit, measured by an average glyph width. */
function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? line + ' ' + word : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function card({ kicker, title, meta }) {
  const size = title.length > 46 ? 62 : title.length > 28 ? 74 : 88;
  const maxChars = Math.round(1560 / size);
  const lines = wrap(title, maxChars);
  const lineHeight = Math.round(size * 1.16);
  const blockTop = 300 - ((lines.length - 1) * lineHeight) / 2;

  const tspans = lines
    .map((l, i) => `<tspan x="84" y="${blockTop + i * lineHeight}">${esc(l)}</tspan>`)
    .join('');

  /* The contour signature, flattened to three static strokes. The site's
     field is a moving thing; a still card quotes it rather than freezing a
     frame of it. */
  const contours = [0, 1, 2]
    .map((i) => {
      const y = 470 + i * 34;
      const amp = 16 + i * 5;
      const d = Array.from({ length: 25 }, (_, k) => {
        const x = k * 50;
        const yy = y + Math.sin(k * 0.55 + i * 1.3) * amp;
        return `${k === 0 ? 'M' : 'L'}${x} ${yy.toFixed(1)}`;
      }).join(' ');
      return `<path d="${d}" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="${0.30 - i * 0.07}"/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${INK}"/>
  ${contours}
  <rect x="0" y="0" width="${W}" height="6" fill="${GOLD}"/>
  <text x="84" y="120" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="24" letter-spacing="3" fill="${GOLD}" font-weight="600">${esc(kicker.toUpperCase())}</text>
  <text font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="${size}" fill="${PAPER}" font-weight="700" letter-spacing="-1.5">${tspans}</text>
  ${meta ? `<text x="84" y="562" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="26" fill="${MUTED}">${esc(meta)}</text>` : ''}
  <text x="${W - 84}" y="562" text-anchor="end" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="26" fill="${PAPER}" font-weight="600">CREATIVE<tspan fill="${GOLD}">mk</tspan></text>
</svg>`;
}

async function emit(name, spec) {
  const svg = card(spec);
  const file = join(outDir, name + '.png');
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(file);
  return file;
}

if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });

const jobs = [];

jobs.push(['home', { kicker: 'Digital studio', title: 'Brand, UX/UI, websites and practical AI automation', meta: 'creativemk.net' }]);
jobs.push(['work', { kicker: 'Selected work', title: 'What is published, and what is not yet', meta: 'The ledger' }]);
jobs.push(['services', { kicker: 'Services', title: 'Six services that chain, not six things on a menu', meta: 'creativemk.net' }]);
jobs.push(['studio', { kicker: 'The studio', title: 'One senior operator, and specialists when the work calls for them', meta: 'Arturo Valle' }]);
jobs.push(['insights', { kicker: 'Insights', title: 'Short notes, signed', meta: 'creativemk.net' }]);
jobs.push(['lab', { kicker: 'The lab', title: 'What the studio builds for itself, in public', meta: 'creativemk.net' }]);

for (const s of services) {
  jobs.push(['service-' + s.slug, { kicker: s.en.lead, title: s.en.title, meta: s.en.tags.join(' · ') }]);
  jobs.push(['service-' + s.esSlug + '-es', { kicker: s.es.lead, title: s.es.title, meta: s.es.tags.join(' · ') }]);
}
for (const c of cases) {
  jobs.push(['case-' + c.slug, { kicker: c.en.lead, title: c.en.title, meta: c.en.figure + ' ' + c.en.figureLabel }]);
}
for (const n of notes) {
  jobs.push(['note-' + n.slug, { kicker: n.en.category, title: n.en.title, meta: n.minutes + ' min · Arturo Valle' }]);
}

let count = 0;
for (const [name, spec] of jobs) {
  await emit(name, spec);
  count++;
}
console.log(`og-cards: wrote ${count} cards to images/og/`);
