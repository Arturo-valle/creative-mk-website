/**
 * Site invariants for CREATIVE MK.
 *
 * Runs against the built `dist/` output, because that is what actually ships.
 * Zero dependencies on purpose: this must stay fast enough to run on every PR.
 *
 * Two severities:
 *   ERROR — fails CI. Objectively broken.
 *   WARN  — reported, does not fail. Things to fix, not things to block on.
 *
 * Usage: node scripts/check-site.mjs [--strict]
 *   --strict promotes warnings to errors.
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const strict = process.argv.includes('--strict');

const SITE_ORIGIN = 'https://creativemk.net';

/**
 * Paths served at runtime by the Cloudflare Worker (see cloudflare/agent/wrangler.jsonc),
 * not by static files in dist/. Referencing them is correct; they just do not exist on disk.
 */
const RUNTIME_ROUTES = ['/admin/api/', '/agents/'];

/**
 * Pages whose body is rendered client-side, so their static HTML legitimately
 * has no headings or content to inspect.
 */
const CLIENT_RENDERED = new Set(['contact.html']);

const errors = [];
const warnings = [];

const error = (check, message) => errors.push({ check, message });
const warn = (check, message) => warnings.push({ check, message });

if (!existsSync(distDir)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

/* ---------- helpers ---------- */

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const allFiles = await walk(distDir);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
const cssFiles = allFiles.filter((f) => f.endsWith('.css'));
const rel = (f) => relative(distDir, f).split('\\').join('/');

/** Strip comments so we never lint commented-out markup. */
const stripHtmlComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');
const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/* ---------- 1. i18n parity ---------- */

async function checkI18n() {
  const check = 'i18n';
  const i18nPath = join(distDir, 'js/i18n.js');
  if (!existsSync(i18nPath)) {
    error(check, 'js/i18n.js is missing from dist/');
    return;
  }

  const source = await readFile(i18nPath, 'utf8');
  const start = source.indexOf('const translations = {');
  if (start === -1) {
    error(check, 'could not locate the `translations` object in js/i18n.js');
    return;
  }

  // Walk braces from the opening `{` to find the matching close.
  const open = source.indexOf('{', start);
  let depth = 0;
  let end = -1;
  let inString = null;
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    if (inString) {
      if (ch === '\\') i += 1;
      else if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') inString = ch;
    else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) {
    error(check, '`translations` object in js/i18n.js is unbalanced');
    return;
  }

  let translations;
  try {
    translations = new Function(`return ${source.slice(open, end + 1)};`)();
  } catch (cause) {
    error(check, `could not evaluate the translations object: ${cause.message}`);
    return;
  }

  const langs = Object.keys(translations);
  if (!langs.includes('en') || !langs.includes('es')) {
    error(check, `expected 'en' and 'es' locales, found: ${langs.join(', ') || 'none'}`);
    return;
  }

  const en = new Set(Object.keys(translations.en));
  const es = new Set(Object.keys(translations.es));

  for (const key of en) {
    if (!es.has(key)) error(check, `key "${key}" exists in en but is missing in es`);
  }
  for (const key of es) {
    if (!en.has(key)) error(check, `key "${key}" exists in es but is missing in en`);
  }

  // Every key referenced from markup must resolve in both locales.
  for (const file of htmlFiles) {
    const html = stripHtmlComments(await readFile(file, 'utf8'));
    const referenced = new Set(
      [...html.matchAll(/\sdata-i18n(?:-[a-z]+)?\s*=\s*"([^"]+)"/g)].map((m) => m[1])
    );
    for (const key of referenced) {
      if (!en.has(key)) error(check, `${rel(file)} references data-i18n="${key}" with no en translation`);
      else if (!es.has(key)) error(check, `${rel(file)} references data-i18n="${key}" with no es translation`);
    }
  }

  // Empty values are almost always an unfinished translation.
  for (const lang of ['en', 'es']) {
    for (const [key, value] of Object.entries(translations[lang])) {
      if (typeof value === 'string' && value.trim() === '') {
        warn(check, `${lang}."${key}" is an empty string`);
      }
    }
  }
}

/* ---------- 2. local references resolve ---------- */

function isExternal(url) {
  return (
    /^[a-z][a-z0-9+.-]*:/i.test(url) || // http:, https:, mailto:, tel:, data:
    url.startsWith('//') ||
    url.startsWith('#')
  );
}

/** Resolve a URL found in `fromFile` to a path inside dist/, or null if not local. */
function resolveLocal(url, fromFile) {
  if (!url || isExternal(url)) return null;
  if (RUNTIME_ROUTES.some((prefix) => url.startsWith(prefix))) return null;
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return null;
  const base = clean.startsWith('/')
    ? join(distDir, clean)
    : join(dirname(fromFile), clean);
  return base;
}

async function checkReferences() {
  const check = 'references';

  for (const file of htmlFiles) {
    const html = stripHtmlComments(await readFile(file, 'utf8'));
    const urls = [
      ...[...html.matchAll(/\s(?:href|src)\s*=\s*"([^"]*)"/g)].map((m) => m[1]),
      ...[...html.matchAll(/\s(?:href|src)\s*=\s*'([^']*)'/g)].map((m) => m[1])
    ];
    for (const url of urls) {
      const target = resolveLocal(url, file);
      if (target && !existsSync(target)) {
        error(check, `${rel(file)} references "${url}" which does not exist in dist/`);
      }
    }
  }

  for (const file of cssFiles) {
    const css = stripCssComments(await readFile(file, 'utf8'));
    for (const match of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      // Fragment refs (url(#f) / url(%23f)) target SVG filters, not files, and
      // a url() inside an inline data: URI is content, not a reference.
      if (/^(data:|#|%23)/.test(match[1])) continue;
      const target = resolveLocal(match[1], file);
      if (target && !existsSync(target)) {
        error(check, `${rel(file)} references url("${match[1]}") which does not exist in dist/`);
      }
    }
  }

  // In-page anchors must point at a real id.
  for (const file of htmlFiles) {
    const html = stripHtmlComments(await readFile(file, 'utf8'));
    const ids = new Set([...html.matchAll(/\sid\s*=\s*"([^"]+)"/g)].map((m) => m[1]));
    for (const match of html.matchAll(/\shref\s*=\s*"#([^"]+)"/g)) {
      if (!ids.has(match[1])) {
        error(check, `${rel(file)} links to #${match[1]} but no element has that id`);
      }
    }
  }
}

/* ---------- 3. SEO invariants ---------- */

function metaContent(html, attr, value) {
  const pattern = new RegExp(
    `<meta[^>]*\\s${attr}\\s*=\\s*"${value}"[^>]*\\scontent\\s*=\\s*"([^"]*)"`,
    'i'
  );
  const alt = new RegExp(
    `<meta[^>]*\\scontent\\s*=\\s*"([^"]*)"[^>]*\\s${attr}\\s*=\\s*"${value}"`,
    'i'
  );
  return html.match(pattern)?.[1] ?? html.match(alt)?.[1] ?? null;
}

async function checkSeo() {
  const check = 'seo';

  for (const file of htmlFiles) {
    const name = rel(file);
    const html = stripHtmlComments(await readFile(file, 'utf8'));

    if (!/<html[^>]*\slang\s*=\s*"[^"]+"/i.test(html)) {
      error(check, `${name} has no lang attribute on <html>`);
    }

    // Pages excluded from search engines have nothing to optimise for them.
    if (/<meta[^>]*\sname\s*=\s*"robots"[^>]*\scontent\s*=\s*"[^"]*noindex/i.test(html)) {
      continue;
    }

    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    if (!title) error(check, `${name} has no <title>`);
    else if (title.length > 60) warn(check, `${name} title is ${title.length} chars (>60 gets truncated in SERPs)`);

    const description = metaContent(html, 'name', 'description');
    if (!description) error(check, `${name} has no meta description`);
    else if (description.length > 160) {
      warn(check, `${name} meta description is ${description.length} chars (>160 gets truncated)`);
    }

    const canonical = html.match(/<link[^>]*\srel\s*=\s*"canonical"[^>]*\shref\s*=\s*"([^"]*)"/i)?.[1];
    if (!canonical) error(check, `${name} has no <link rel="canonical">`);
    else if (!canonical.startsWith('http')) {
      error(check, `${name} canonical "${canonical}" must be an absolute URL`);
    }

    // Social scrapers do not resolve relative image paths.
    for (const [attr, value] of [['property', 'og:image'], ['name', 'twitter:image']]) {
      const image = metaContent(html, attr, value);
      if (!image) error(check, `${name} has no ${value}`);
      else if (!image.startsWith('http')) {
        error(check, `${name} ${value}="${image}" must be an absolute URL or scrapers will drop it`);
      }
    }

    if (!CLIENT_RENDERED.has(name)) {
      const h1Count = [...html.matchAll(/<h1[\s>]/gi)].length;
      if (h1Count === 0) error(check, `${name} has no <h1>`);
      else if (h1Count > 1) warn(check, `${name} has ${h1Count} <h1> elements; exactly one is expected`);
    }

    if (!/<script[^>]*type\s*=\s*"application\/ld\+json"/i.test(html)) {
      warn(check, `${name} has no JSON-LD structured data`);
    }
  }
}

/* ---------- 4. accessibility and performance basics ---------- */

async function checkAssets() {
  const a11y = 'a11y';
  const perf = 'perf';

  for (const file of htmlFiles) {
    const name = rel(file);
    const html = stripHtmlComments(await readFile(file, 'utf8'));

    const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
    for (const img of imgs) {
      if (!/\salt\s*=/.test(img)) {
        error(a11y, `${name} has an <img> without alt: ${img.slice(0, 90)}`);
      }
    }

    // Below-the-fold images should not block the initial render.
    const eager = imgs.filter((img) => !/\sloading\s*=\s*"(lazy|eager)"/.test(img));
    if (eager.length) {
      warn(perf, `${name} has ${eager.length} <img> without an explicit loading attribute`);
    }

    // Each render-blocking stylesheet is a round trip before first paint.
    const sheets = [...html.matchAll(/<link[^>]*\srel\s*=\s*"stylesheet"[^>]*>/gi)].length;
    if (sheets > 6) {
      warn(perf, `${name} loads ${sheets} render-blocking stylesheets; consider bundling them`);
    }

    // Manual cache-busting is a symptom of unversioned assets.
    for (const match of html.matchAll(/\s(?:href|src)\s*=\s*"([^"]*\?v=[^"]*)"/g)) {
      warn(perf, `${name} uses manual cache-busting on "${match[1]}"`);
    }
  }

  // Oversized media is the most common cause of a bad LCP on this kind of site.
  for (const file of allFiles) {
    if (!/\.(png|jpe?g|webp|avif|gif)$/i.test(file)) continue;
    const { size } = await stat(file);
    if (size > 500 * 1024) {
      warn(perf, `${rel(file)} is ${(size / 1024 / 1024).toFixed(2)} MB; compress or serve a modern format`);
    }
  }
}

/* ---------- 5. performance budget ---------- */

/**
 * The budget the homepage is designed against.
 *
 * These are uncompressed bytes on disk, not transfer size. They are deliberately
 * measured that way: it is the only number this script can know without a
 * network, and the ratio to the compressed size is stable enough that a
 * regression here is a regression there.
 *
 * The ceilings sit above today's numbers on purpose. They are not a target to
 * grow into — they are the point at which a change stops being free and has to
 * be argued for.
 */
const BUDGET = {
  // index.html + render-blocking CSS + classic scripts + preloaded fonts.
  // Everything a first-time visitor pays for before the page is usable.
  criticalPathWarn: 300 * 1024,
  criticalPathError: 400 * 1024,
  videoWarn: 6 * 1024 * 1024,
  videoError: 10 * 1024 * 1024,
  distWarn: 25 * 1024 * 1024
};

/**
 * Libraries heavy enough that loading them eagerly is a measurable regression,
 * not a style preference. three.js reaches the homepage only through the
 * dynamic import in js/main.js, behind a reduced-motion / viewport / hardware
 * gate. CI once measured 22s of blocking time when this scene rasterised on
 * SwiftShader; a plain <script src> would put that back for everyone.
 */
const LAZY_ONLY = [/three(\.|\/)/i, /hero-3d\.js/i];

async function checkBudget() {
  const check = 'budget';
  const sizeOf = async (file) => (existsSync(file) ? (await stat(file)).size : 0);
  const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

  /* ---- critical path on the homepage ---- */
  const indexPath = join(distDir, 'index.html');
  if (existsSync(indexPath)) {
    const html = stripHtmlComments(await readFile(indexPath, 'utf8'));
    const refs = new Set();
    const collect = (regex) => {
      for (const match of html.matchAll(regex)) refs.add(match[1]);
    };
    collect(/<link[^>]*\srel\s*=\s*"stylesheet"[^>]*\shref\s*=\s*"([^"]+)"/gi);
    collect(/<link[^>]*\srel\s*=\s*"preload"[^>]*\shref\s*=\s*"([^"]+)"/gi);
    // Only classic scripts block; type="module" and defer/async do not.
    for (const tag of html.matchAll(/<script\b[^>]*\ssrc\s*=\s*"([^"]+)"[^>]*>/gi)) {
      if (/\s(?:defer|async)\b/i.test(tag[0])) continue;
      if (/\stype\s*=\s*"module"/i.test(tag[0])) continue;
      refs.add(tag[1]);
    }

    let total = await sizeOf(indexPath);
    for (const ref of refs) {
      if (/^(https?:)?\/\//.test(ref)) continue; // third-party, not ours to weigh
      total += await sizeOf(join(distDir, ref.replace(/^\//, '').split('?')[0]));
    }

    const detail = `index.html critical path is ${kb(total)}`;
    if (total > BUDGET.criticalPathError) {
      error(check, `${detail}, over the ${kb(BUDGET.criticalPathError)} ceiling`);
    } else if (total > BUDGET.criticalPathWarn) {
      warn(check, `${detail}, over the ${kb(BUDGET.criticalPathWarn)} budget`);
    }
  }

  /* ---- heavy libraries must stay behind a dynamic import ---- */
  for (const file of htmlFiles) {
    const html = stripHtmlComments(await readFile(file, 'utf8'));
    for (const tag of html.matchAll(/<script\b[^>]*\ssrc\s*=\s*"([^"]+)"[^>]*>/gi)) {
      const pattern = LAZY_ONLY.find((candidate) => candidate.test(tag[1]));
      if (pattern) {
        error(
          check,
          `${rel(file)} loads "${tag[1]}" with a <script> tag; it must stay behind the gated dynamic import in js/main.js`
        );
      }
    }
  }

  /* ---- the global reduced-motion kill switch ---- */
  let hasReducedMotion = false;
  for (const file of cssFiles) {
    const css = await readFile(file, 'utf8');
    if (/@media[^{]*prefers-reduced-motion\s*:\s*reduce/i.test(css)) hasReducedMotion = true;
  }
  if (cssFiles.length && !hasReducedMotion) {
    error(check, 'no @media (prefers-reduced-motion: reduce) block ships; every animation becomes unskippable');
  }

  /* ---- media ceilings ---- */
  for (const file of allFiles) {
    if (!/\.(mp4|webm|mov)$/i.test(file)) continue;
    const size = await stat(file);
    const mb = (size.size / 1024 / 1024).toFixed(2);
    if (size.size > BUDGET.videoError) {
      error(check, `${rel(file)} is ${mb} MB, over the ${BUDGET.videoError / 1024 / 1024} MB ceiling`);
    } else if (size.size > BUDGET.videoWarn) {
      warn(check, `${rel(file)} is ${mb} MB, over the ${BUDGET.videoWarn / 1024 / 1024} MB budget`);
    }
  }

  let distTotal = 0;
  for (const file of allFiles) distTotal += (await stat(file)).size;
  if (distTotal > BUDGET.distWarn) {
    warn(
      check,
      `dist/ is ${(distTotal / 1024 / 1024).toFixed(1)} MB, over the ${BUDGET.distWarn / 1024 / 1024} MB budget`
    );
  }
}

/* ---------- report ---------- */

await checkI18n();
await checkReferences();
await checkSeo();
await checkAssets();
await checkBudget();

const group = (items) => {
  const byCheck = new Map();
  for (const item of items) {
    if (!byCheck.has(item.check)) byCheck.set(item.check, []);
    byCheck.get(item.check).push(item.message);
  }
  return byCheck;
};

if (warnings.length) {
  console.log(`\n${strict ? 'WARNINGS (strict: treated as errors)' : 'WARNINGS'} — ${warnings.length}`);
  for (const [check, messages] of group(warnings)) {
    console.log(`\n  [${check}]`);
    for (const message of messages) console.log(`    - ${message}`);
  }
}

if (errors.length) {
  console.log(`\nERRORS — ${errors.length}`);
  for (const [check, messages] of group(errors)) {
    console.log(`\n  [${check}]`);
    for (const message of messages) console.log(`    - ${message}`);
  }
}

const failed = errors.length + (strict ? warnings.length : 0);
console.log(
  `\nChecked ${htmlFiles.length} HTML and ${cssFiles.length} CSS files in dist/: ` +
    `${errors.length} error(s), ${warnings.length} warning(s).`
);
process.exit(failed > 0 ? 1 : 0);
