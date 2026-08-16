/**
 * Stamp each built page's colophon with that page's own measurements.
 *
 * Runs after eleventy and after `audit.mjs --emit`, in the same post-build
 * position as fingerprint.mjs. It re-measures nothing: every figure printed
 * here is read out of the audit payload, because two implementations of
 * "how many words are on this page" is two numbers that disagree the first
 * time either one changes. That failure has a name in this repository — the
 * "6 min read" label sitting over ninety words — and the fix was the same
 * one: derive it, never type it.
 *
 * If a page has no entry in the payload (a utility page, a noindex page), its
 * colophon body is left empty and CSS hides the whole block. The shell is
 * never removed here: markup belongs in templates.
 *
 * Usage: node scripts/colophon.mjs
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const auditPath = join(root, '.audit.json');

if (!existsSync(auditPath)) {
  console.error('.audit.json not found. Run `node scripts/audit.mjs --emit .audit.json` first.');
  process.exit(1);
}

const audit = JSON.parse(await readFile(auditPath, 'utf8'));
const byUrl = new Map(audit.pages.map((p) => [p.url, p]));

/*
 * There is no band table here any more. There were two — this file's and
 * scripts/audit.mjs's — with different cut points, so the report called the
 * homepage "demanding" while the homepage printed "hard" about the same
 * number. The band now arrives in the payload with the score it describes,
 * for the same reason the word count does: one definition, or two numbers
 * that disagree the first time either changes.
 */

const COPY = {
  en: {
    words: 'Words',
    ease: 'Reading ease',
    easeValue: (score, band) => `${score} of 100 — ${band}`,
    links: 'Links to other pages here',
    built: 'Measured on',
    note:
      'These are measured from this page at build time, not typed. The method, and why a number without a source is decoration, is in',
    noteLink: '/insights/premium-website-trust/',
    noteLinkText: 'the note on what makes a site trustworthy'
  },
  es: {
    words: 'Palabras',
    ease: 'Facilidad de lectura',
    easeValue: (score, band) => `${score} de 100 — ${band}`,
    links: 'Enlaces a otras páginas de aquí',
    built: 'Medido el',
    note:
      'Estas cifras se miden en esta página al construir el sitio, no se escriben a mano. El método, y por qué un número sin fuente es decoración, está en',
    noteLink: '/es/notas/confianza-en-sitios-premium/',
    noteLinkText: 'la nota sobre qué hace que un sitio genere confianza'
  }
};

const escape = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The build date, taken from the environment rather than the clock, so a
 * rebuild of the same commit produces the same bytes. SOURCE_DATE_EPOCH is
 * the reproducible-builds convention; without it this falls back to today.
 */
const buildDate = new Date(
  process.env.SOURCE_DATE_EPOCH ? Number(process.env.SOURCE_DATE_EPOCH) * 1000 : Date.now()
);
const isoDate = buildDate.toISOString().slice(0, 10);

function row(term, value) {
  return `<div class="colophon__row"><dt>${escape(term)}</dt><dd>${escape(value)}</dd></div>`;
}

function bodyFor(page) {
  const t = COPY[page.lang] ?? COPY.en;
  const wordCount = page.categories['Word count']?.detail?.count ?? 0;
  const ease = page.categories.Readability?.detail?.ease;
  const band = page.categories.Readability?.detail?.band;
  const linksOut = page.categories['Internal structure']?.detail?.out ?? 0;

  /* No reading-time row. The colophon measures the rendered page; the badge
     on a note measures the article. Both are honest and they differ by about
     a minute, which put two reading times on one document — the precise
     contradiction this block exists to prevent. Word count and reading ease
     carry the same information without claiming to be the other number. */
  const rows = [
    row(t.words, wordCount.toLocaleString(page.lang === 'es' ? 'es-ES' : 'en-US')),
    ease === undefined || ease === null
      ? ''
      : row(t.ease, t.easeValue(Math.round(ease), band)),
    row(t.links, String(linksOut)),
    row(t.built, isoDate)
  ].join('');

  return (
    `<dl class="colophon__figures">${rows}</dl>` +
    `<p class="colophon__note">${escape(t.note)} ` +
    `<a href="${t.noteLink}">${escape(t.noteLinkText)}</a>.</p>`
  );
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const PLACEHOLDER = /(<div class="colophon__body" data-colophon-body>)(<\/div>)/;

let stamped = 0;
let skipped = 0;
for (const file of await walk(distDir)) {
  const html = await readFile(file, 'utf8');
  if (!PLACEHOLDER.test(html)) continue;

  const path = relative(distDir, file).split('\\').join('/');
  const url = path === 'index.html' ? '/' : '/' + path.replace(/index\.html$/, '').replace(/\.html$/, '');
  const page = byUrl.get(url);

  if (!page) {
    skipped += 1;
    continue;
  }

  await writeFile(file, html.replace(PLACEHOLDER, `$1${bodyFor(page)}$2`), 'utf8');
  stamped += 1;
}

console.log(`Colophon stamped on ${stamped} page(s); ${skipped} left empty (not scored).`);
