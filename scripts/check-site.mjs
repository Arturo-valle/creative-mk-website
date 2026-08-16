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

/**
 * Just enough entity decoding to compare rendered text against a dictionary
 * value. The templates escape through the `attr` filter and Nunjucks' own
 * autoescape, so an apostrophe or an ampersand arrives encoded on one side of
 * the comparison and raw on the other.
 */
const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ntilde: 'ñ',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', uuml: 'ü',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ',
  iquest: '¿', iexcl: '¡', mdash: '—', ndash: '–', rsquo: '’', hellip: '…',
  middot: '·'
};
const decodeEntities = (text) =>
  text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => NAMED_ENTITIES[name] ?? match);
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

  /* The static text and the dictionary must agree.
     This bug class has now shipped three times. The markup said "See the
     ledger" while the dictionary said "Start a project", so the first read
     and every read after a language round trip disagreed — both live at once,
     on the same link. Fixing the four known cases by hand left forty more,
     including the primary call to action on eleven Spanish pages. Key parity
     was already gated; the VALUES were not, and a key that resolves to the
     wrong sentence is worse than one that resolves to nothing, because
     nothing is visible.

     Only same-language pairs are compared: `data-i18n-alt` deliberately shows
     the other language, and is skipped. */
  const collapse = (text) =>
    decodeEntities(text.replace(/<[^>]+>/g, ''))
      .replace(/\s+/g, ' ')
      .trim();

  for (const file of htmlFiles) {
    const html = stripHtmlComments(await readFile(file, 'utf8'));
    const lang = html.match(/<html[^>]*\slang\s*=\s*"([^"]+)"/i)?.[1]?.slice(0, 2);
    if (lang !== 'en' && lang !== 'es') continue;
    const dict = translations[lang];
    const other = translations[lang === 'es' ? 'en' : 'es'];

    /* A gate has to know what it could not see.
       This matcher is non-greedy to the first closing tag of the same name, so
       an element wrapping a nested element of the same tag would compare a
       truncated string and pass. Six other constructs — void elements,
       self-closing tags, single-quoted attributes, a ">" inside an earlier
       attribute, a case-mismatched close — produce no match at all, and the
       old version reported success either way. Counting the openings against
       the pairs turns every one of those from a silent pass into a failure. */
    /* The counter must be blind to less than the reader, or it inherits the
       reader's blind spots and certifies them.
       Three versions of this were wrong in the same way. The first was
       tag-aware and stopped at the first ">". The second required a quote and
       was case-sensitive, so `data-i18n=nav.work` (valid HTML5) and
       `DATA-I18N="nav.work"` (HTML lowercases attribute names, so the runtime
       still swaps it) passed reader and counter together. This one accepts an
       unquoted value and matches case-insensitively, and it counts all three
       bindings — the two siblings had no counter at all, which left the same
       silent-pass hole open on 74 of them. */
    const countBinding = (attr) =>
      [...html.matchAll(new RegExp(`\\s${attr}\\s*=\\s*(?:"([^"]+)"|'([^']+)'|([^\\s>]+))`, 'gi'))]
        .map((m) => m[1] ?? m[2] ?? m[3]);

    const declared = countBinding('data-i18n(?!-)');
    const pairs = [...html.matchAll(/<(\w+)\b[^>]*\sdata-i18n\s*=\s*"([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)];
    if (declared.length !== pairs.length) {
      const seen = new Set(pairs.map((m) => m[2]));
      const missed = declared.filter((key) => !seen.has(key));
      error(
        check,
        `${rel(file)} declares ${declared.length} data-i18n bindings but only ${pairs.length} could be read` +
          (missed.length ? ` (unread: ${[...new Set(missed)].slice(0, 4).join(', ')})` : '')
      );
    }

    for (const match of pairs) {
      const [, tag, key, inner] = match;
      const expected = dict[key];
      if (typeof expected !== 'string' || !expected.trim()) continue;

      if (new RegExp(`<${tag}[\\s>]`, 'i').test(inner)) {
        error(check, `${rel(file)} nests a <${tag}> inside data-i18n="${key}", so its text cannot be verified`);
        continue;
      }

      const rendered = collapse(inner);
      if (!rendered) {
        error(check, `${rel(file)} has an empty data-i18n="${key}"; the dictionary would overwrite nothing visible`);
        continue;
      }
      if (rendered !== collapse(expected)) {
        error(
          check,
          `${rel(file)} renders "${rendered.slice(0, 48)}" for data-i18n="${key}", ` +
            `but ${lang} says "${collapse(expected).slice(0, 48)}"`
        );
        continue;
      }
      /* Text alone is not enough. collapse() strips tags from both sides, and
         setLanguage assigns innerHTML — so a dictionary value whose <a> points
         somewhere different from the markup's compares equal here and then
         silently changes where the link goes the moment anyone switches
         language. Two versions live at once on the same link is the class this
         gate exists for. */
      const hrefs = (text) => [...String(text).matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]).join(' ');
      if (hrefs(inner) !== hrefs(expected)) {
        error(
          check,
          `${rel(file)} links to "${hrefs(inner) || 'nothing'}" inside data-i18n="${key}", ` +
            `but the ${lang} dictionary links to "${hrefs(expected) || 'nothing'}"`
        );
      }
    }

    /* The other two bindings were outside the gate entirely: 74 of them, all
       correct today and nothing keeping them so. A placeholder is compared
       against the same locale; data-i18n-alt deliberately shows the OTHER
       language — that is the footer's bilingual finale — so it is compared
       against the other dictionary. */
    const placeholderPairs = [...html.matchAll(/\sdata-i18n-placeholder\s*=\s*"([^"]+)"/g)];
    if (countBinding('data-i18n-placeholder').length !== placeholderPairs.length) {
      error(check, `${rel(file)} has data-i18n-placeholder bindings this check cannot read`);
    }
    for (const match of placeholderPairs) {
      const key = match[1];
      const expected = dict[key];
      if (typeof expected !== 'string') continue;
      const tag = html.slice(html.lastIndexOf('<', match.index), match.index + 400);
      const placeholder = tag.match(/\splaceholder\s*=\s*"([^"]*)"/)?.[1];
      if (placeholder !== undefined && collapse(placeholder) !== collapse(expected)) {
        error(
          check,
          `${rel(file)} has placeholder="${placeholder}" for data-i18n-placeholder="${key}", ` +
            `but ${lang} says "${collapse(expected)}"`
        );
      }
    }

    const altPairs = [...html.matchAll(
      /<(\w+)\b[^>]*\sdata-i18n-alt\s*=\s*"([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g
    )];
    if (countBinding('data-i18n-alt').length !== altPairs.length) {
      error(check, `${rel(file)} has data-i18n-alt bindings this check cannot read`);
    }
    for (const match of altPairs) {
      const [, , key, inner] = match;
      const expected = other[key];
      if (typeof expected !== 'string' || !expected.trim()) continue;
      const rendered = collapse(inner);
      if (rendered && rendered !== collapse(expected)) {
        error(
          check,
          `${rel(file)} renders "${rendered.slice(0, 40)}" for data-i18n-alt="${key}", ` +
            `but it must show the other language: "${collapse(expected).slice(0, 40)}"`
        );
      }
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

/**
 * Whether a URL is actually served, given how Pages maps requests to files:
 * `/contact` comes from contact.html and `/work/` from work/index.html.
 */
function isServed(url, fromFile) {
  const base = resolveLocal(url, fromFile);
  if (base === null) return true;
  return existsSync(base) || existsSync(base + '.html') || existsSync(join(base, 'index.html'));
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
      if (!isServed(url, file)) {
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

  /* Media referenced through data- attributes rather than src.
     The showreel's four sources are read by js/main.js and assigned to
     video.src at runtime, so the scan above — which only knows href and src —
     never saw them. They were written relative ("video/...") and therefore
     resolved correctly on / and 404'd on /es/, where the browser asked for
     /es/video/. Nothing static caught it; it was found by opening the page.
     Anything the site loads by hand is now weighed by hand. */
  const DATA_URL_ATTRS = /\s(data-(?:src|av1|poster)-[a-z0-9]+|data-src)\s*=\s*"([^"]+)"/gi;
  for (const file of htmlFiles) {
    const html = stripHtmlComments(await readFile(file, 'utf8'));
    for (const match of html.matchAll(DATA_URL_ATTRS)) {
      if (!isServed(match[2], file)) {
        error(check, `${rel(file)} sets ${match[1]}="${match[2]}", which does not exist in dist/`);
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
  distWarn: 25 * 1024 * 1024,
  // blocking + deferred per page: catches a stack landing where it is not needed
  pageTotalWarn: 500 * 1024
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
  /* Every page is weighed, not just the homepage. The Phase 0 validation
     found this check structurally blind: it measured index.html alone, so a
     migration that gave the legal pages the homepage's whole motion stack
     passed clean. Both groups are reported — the blocking bytes that gate
     first paint, and the deferred bytes that still cost bandwidth. */
  for (const file of htmlFiles) {
    const name = rel(file);
    if (CLIENT_RENDERED.has(name)) continue;
    const html = stripHtmlComments(await readFile(file, 'utf8'));
    const blocking = new Set();
    const deferred = new Set();
    const collect = (regex, into) => {
      for (const match of html.matchAll(regex)) into.add(match[1]);
    };
    collect(/<link[^>]*\srel\s*=\s*"stylesheet"[^>]*\shref\s*=\s*"([^"]+)"/gi, blocking);
    collect(/<link[^>]*\srel\s*=\s*"preload"[^>]*\shref\s*=\s*"([^"]+)"/gi, blocking);
    for (const tag of html.matchAll(/<script[^>]*\ssrc\s*=\s*"([^"]+)"[^>]*>/gi)) {
      const isDeferred = /\s(?:defer|async)/i.test(tag[0]) || /\stype\s*=\s*"module"/i.test(tag[0]);
      (isDeferred ? deferred : blocking).add(tag[1]);
    }

    const weigh = async (set) => {
      let bytes = 0;
      for (const ref of set) {
        if (/^(https?:)?\/\//.test(ref)) continue; // third-party, not ours to weigh
        bytes += await sizeOf(join(distDir, ref.replace(/^\//, '').split('?')[0]));
      }
      return bytes;
    };

    const blockingTotal = (await sizeOf(file)) + (await weigh(blocking));
    const deferredTotal = await weigh(deferred);

    const detail = `${name} critical path is ${kb(blockingTotal)}`;
    if (blockingTotal > BUDGET.criticalPathError) {
      error(check, `${detail}, over the ${kb(BUDGET.criticalPathError)} ceiling`);
    } else if (blockingTotal > BUDGET.criticalPathWarn) {
      warn(check, `${detail}, over the ${kb(BUDGET.criticalPathWarn)} budget`);
    }
    if (blockingTotal + deferredTotal > BUDGET.pageTotalWarn) {
      warn(check, `${name} ships ${kb(blockingTotal + deferredTotal)} of first-party JS and CSS`);
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


/* ---------- 6. structured data and metadata integrity ----------
   Every defect below shipped at least once during the August rebuild and was
   caught by an audit rather than by this gate. Each is now an ERROR. */

async function checkStructuredData() {
  const check = 'schema';
  const seenTitles = new Map();
  const seenDescriptions = new Map();

  for (const file of htmlFiles) {
    const name = rel(file);
    const raw = await readFile(file, 'utf8');
    const html = stripHtmlComments(raw);

    /* Double-escaped entities. "Growth & Marketing" became &amp;amp; in every
       title and social tag on one page because two escaping passes ran. */
    const metaRegions = [
      ...[...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((m) => m[1]),
      ...[...html.matchAll(/<meta[^>]*\scontent\s*=\s*"([^"]*)"/gi)].map((m) => m[1])
    ];
    for (const region of metaRegions) {
      const doubled = region.match(/&amp;(amp|lt|gt|quot|#\d+);/i);
      if (doubled) {
        error(check, `${name} contains a double-escaped entity (&amp;${doubled[1]};) in its metadata`);
        break;
      }
    }

    /* A published case study claims "0 render-blocking scripts, site-wide".
       That is only allowed to stay on the page while it is true, so the gate
       owns it: any classic <script src> without defer/async/module fails the
       build. The claim and the check ship together. */
    for (const tag of html.matchAll(/<script[^>]*\ssrc\s*=\s*"[^"]+"[^>]*>/gi)) {
      if (/\s(?:defer|async)/i.test(tag[0])) continue;
      if (/\stype\s*=\s*"module"/i.test(tag[0])) continue;
      error(check, `${name} has a render-blocking script: ${tag[0].slice(0, 80)}`);
    }
    /* Inline classic scripts block as surely as external ones. The reveal
       bootstrap is deliberately inline and tiny; anything large is a bug. */
    for (const inline of html.matchAll(/<script(?![^>]*\ssrc)(?![^>]*type\s*=\s*"(?:module|application)[^"]*")[^>]*>([\s\S]*?)<\/script>/gi)) {
      if (inline[1].length > 4096) {
        error(check, `${name} has a ${(inline[1].length / 1024).toFixed(0)} KB inline render-blocking script`);
      }
    }

    if (CLIENT_RENDERED.has(name)) continue;

    /* Titles and descriptions must be unique: two pages sharing either are
       competing for the same query. */
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    if (title) {
      if (seenTitles.has(title)) {
        error(check, `${name} and ${seenTitles.get(title)} share the title "${title.slice(0, 50)}"`);
      } else seenTitles.set(title, name);
    }
    const description = metaContent(html, 'name', 'description');
    if (description) {
      if (seenDescriptions.has(description)) {
        error(check, `${name} and ${seenDescriptions.get(description)} share a meta description`);
      } else seenDescriptions.set(description, name);
    }

    /* Every JSON-LD block must parse, and every @id it references must be
       declared in the same document — a cross-document @id is a dangling
       pointer no consumer can follow. */
    for (const block of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      let parsed;
      try {
        parsed = JSON.parse(block[1]);
      } catch (cause) {
        error(check, `${name} has JSON-LD that does not parse: ${cause.message}`);
        continue;
      }
      const declared = new Set();
      const referenced = [];
      const walk = (node, isRef) => {
        if (Array.isArray(node)) return node.forEach((n) => walk(n, isRef));
        if (!node || typeof node !== 'object') return;
        const keys = Object.keys(node);
        if (node['@id']) {
          if (keys.length === 1) referenced.push(node['@id']);
          else declared.add(node['@id']);
        }
        for (const [key, value] of Object.entries(node)) {
          if (key !== '@id') walk(value, isRef);
        }
      };
      walk(parsed['@graph'] ?? parsed, false);
      for (const id of referenced) {
        if (!declared.has(id)) {
          error(check, `${name} references @id "${id}" that no node in the same document declares`);
        }
      }
    }
  }
}


/* ---------- 7. every shipped script must parse ---------- */

async function checkScriptsParse() {
  const check = 'syntax';
  const { Script } = await import('node:vm');
  for (const file of allFiles) {
    if (!file.endsWith('.js')) continue;
    const name = rel(file);
    // Vendored bundles are third-party and already minified; module syntax
    // needs a different parser than the classic-script one used here.
    if (name.includes('/vendor/') || name.includes('contact-assets/')) continue;
    const source = await readFile(file, 'utf8');
    /* Module scripts cannot be compiled as classic scripts. Strip the import
       and export lines and compile what is left — which is where a stray
       quote or bracket lives anyway. NL keeps a real newline out of this
       file's own source. */
    const NL = String.fromCharCode(10);
    const isImport = (line) => /^[ \t]*import[ {*'"]/.test(line);
    const sourceLines = source.split(NL);
    const isModule = sourceLines.some(
      (line) => isImport(line) || /^[ \t]*export[ {]/.test(line)
    );
    /* Drop import statements outright, but only unwrap the export keyword —
       deleting a whole "export function foo() {" line would orphan its body
       and report a brace error instead of the real one. */
    const body = isModule
      ? sourceLines
          .filter((line) => !isImport(line))
          .map((line) =>
            line.replace(/^([ \t]*)export default /, '$1').replace(/^([ \t]*)export /, '$1')
          )
          .join(NL)
      : source;
    try {
      new Script(isModule ? '(async () => {' + NL + body + NL + '})' : body);
    } catch (cause) {
      error(check, `${name} does not parse: ${cause.message}`);
    }
  }
}

/* ---------- 8. nothing links into a redirect ---------- */

/**
 * Cloudflare Pages serves `/contact` from contact.html and `/work/` from
 * work/index.html, and 308-redirects the `.html` forms. So a `.html` in an
 * internal URL is never wrong-looking — it resolves, it renders, the gate used
 * to pass — it is simply a redirect the visitor pays for. That was true of
 * every "Start a project" button on the site at once, and of the contact
 * page's own canonical, og:url and sitemap entry: three declarations of a
 * URL that answers 308.
 *
 * The same slip silently voids `_headers` rules, which match the request path
 * and not the filename, so a rule written for `/contact.html` governs nothing.
 * Cheap to state, invisible without stating it.
 */
async function checkCanonicalUrls() {
  const check = 'redirects';
  const isRedirected = (url) => /\.html($|[?#])/.test(url);

  for (const file of htmlFiles) {
    const name = rel(file);
    const html = stripHtmlComments(await readFile(file, 'utf8'));

    for (const match of html.matchAll(/\s(?:href|src)\s*=\s*"([^"]+)"/g)) {
      const url = match[1];
      if (isExternal(url) && !url.startsWith(SITE_ORIGIN)) continue;
      if (!isRedirected(url)) continue;
      error(check, `${name} links to "${url}", which Pages 308s to the extensionless URL`);
    }

    for (const [label, value] of [
      ['canonical', html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1]],
      ['og:url', metaContent(html, 'property', 'og:url')]
    ]) {
      if (value && isRedirected(value)) {
        error(check, `${name} declares ${label}="${value}", a URL that answers 308`);
      }
    }
  }

  const sitemap = join(distDir, 'sitemap.xml');
  if (existsSync(sitemap)) {
    const xml = await readFile(sitemap, 'utf8');
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      if (isRedirected(match[1])) {
        error(check, `sitemap.xml submits "${match[1]}", a URL that answers 308`);
      }
    }
  }

  /* _headers keys on the request path, so a rule naming a file that Pages
     serves under a different URL is dead configuration. */
  const headers = join(distDir, '_headers');
  if (existsSync(headers)) {
    const text = await readFile(headers, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const path = line.trim();
      if (!path.startsWith('/') || !isRedirected(path)) continue;
      error(check, `_headers has a rule for "${path}", a path no request ever carries`);
    }
  }
}

/* ---------- report ---------- */

await checkI18n();
await checkReferences();
await checkCanonicalUrls();
await checkSeo();
await checkAssets();
await checkBudget();
await checkStructuredData();
await checkScriptsParse();

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
