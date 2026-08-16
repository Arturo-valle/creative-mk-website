/**
 * Content and SEO audit for CREATIVE MK.
 *
 * `check-site.mjs` answers "is anything broken?" — a pass/fail gate on
 * invariants. This answers a different question: "is any of it good?" It scores
 * every page that is trying to rank, ranks the gaps by what they cost, and
 * refuses to average away a bad page inside a good site.
 *
 * The method is lifted from three open-source SEO tools and adapted to run
 * with no network and no API keys, which is the only way an audit can be part
 * of the build:
 *
 *   - sharozdawa/content-optimizer — the 7-category, 100-point content score
 *     (keyword usage 20, word count 15, headings 15, readability 15, entities
 *     15, depth 10, structure 10). Kept verbatim as a rubric.
 *   - every-app/open-seo — the technical site audit: hreflang reciprocity,
 *     orphans, click depth, anchor quality, metadata and schema coverage.
 *   - hilmanski/contentswift — entity/topic gap analysis. The original scrapes
 *     the SERP to find what competitors cover that you do not. There is no
 *     SERP here, so the same idea is turned inward: the site declares a
 *     vocabulary in src/_data, and a page is measured against the entities its
 *     own type promises to cover.
 *
 * Two substitutions are made honestly rather than faked:
 *
 *   1. content-optimizer benchmarks word count against the live SERP average.
 *      Without SerpApi there is no SERP average, so each page is benchmarked
 *      against a per-type floor and target declared in TYPE_SPEC below. These
 *      are editorial decisions, written down where they can be argued with —
 *      not measurements pretending to be one.
 *   2. contentswift's competitor entities become the site's own controlled
 *      vocabulary, read from src/_data at runtime so the audit cannot drift
 *      from the content it audits.
 *
 * Usage:
 *   node scripts/audit.mjs              full report
 *   node scripts/audit.mjs --json       machine-readable, for the arbiter
 *   node scripts/audit.mjs --min 70     exit 1 if any commercial page scores under 70
 *   node scripts/audit.mjs --page /work/intake-agent/   one page, verbose
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');

const args = process.argv.slice(2);
const asJson = args.includes('--json');
/* --emit writes the same payload --json prints, so scripts/colophon.mjs can
   stamp each page with its own measurements without ever re-implementing a
   measurement. One definition of "words on this page", or the number in the
   margin and the number in the report will disagree the first time either
   changes. */
const emitPath = args.includes('--emit') ? args[args.indexOf('--emit') + 1] : null;
const minScore = Number(args[args.indexOf('--min') + 1]) || 0;
const onlyPage = args.includes('--page') ? args[args.indexOf('--page') + 1] : null;

if (!existsSync(distDir)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * 1. Editorial expectations, per page type.
 *
 * `floor` is the length below which a page of this type is thin no matter
 * how well written. `target` is where it stops being the reason the page
 * loses. Both are judgements about this site's market, not universals: a
 * service page competes with agency service pages that run long, a work
 * index competes with other work indexes that are mostly images.
 * ------------------------------------------------------------------ */

const TYPE_SPEC = {
  /* Restored to the original 450/900 after an adversarial review. It had been
     lowered to 350/600 with a rationalisation about the homepage being a
     trailer by design — which is true, and was still a threshold moved by the
     same hand it was scoring, after seeing the number. The homepage is under
     target. That is a true statement and the report should keep making it. */
  home: { floor: 450, target: 900, minH2: 4, commercial: true },
  service: { floor: 700, target: 1100, minH2: 4, commercial: true },
  'service-index': { floor: 250, target: 550, minH2: 3, commercial: true },
  case: { floor: 550, target: 900, minH2: 4, commercial: true },
  'work-index': { floor: 200, target: 450, minH2: 2, commercial: true },
  note: { floor: 700, target: 1200, minH2: 3, commercial: true },
  'note-index': { floor: 150, target: 350, minH2: 2, commercial: true },
  studio: { floor: 400, target: 750, minH2: 3, commercial: true },
  lab: { floor: 250, target: 500, minH2: 2, commercial: true },
  /* Restored to 300 after review. It had been lowered to 120 — a number whose
     only property is that it sits just under /privacidad/'s 156 words. Legal
     pages carry no score weight, so the change bought nothing but a quieter
     report, which is the worst reason to move a threshold. */
  legal: { floor: 300, target: 900, minH2: 3, commercial: false },
  utility: { floor: 0, target: 0, minH2: 0, commercial: false }
};

/** Anchors that describe the click instead of the destination. */
const GENERIC_ANCHORS = new Set([
  'read more', 'learn more', 'click here', 'more', 'here', 'this', 'link',
  'see more', 'view', 'go', 'continue', 'details', 'read',
  'leer más', 'leer mas', 'ver más', 'ver mas', 'más', 'mas', 'aquí', 'aqui',
  'clic aquí', 'haz clic', 'saber más', 'saber mas', 'ver', 'continuar', 'detalles'
]);

/* ------------------------------------------------------------------ *
 * 2. Reading dist/
 * ------------------------------------------------------------------ */

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
const rel = (f) => relative(distDir, f).split('\\').join('/');

/** The URL Cloudflare Pages serves a file at: work/index.html -> /work/ */
function urlOf(file) {
  const path = rel(file);
  if (path === 'index.html') return '/';
  if (path.endsWith('/index.html')) return '/' + path.slice(0, -'index.html'.length);
  return '/' + path.replace(/\.html$/, '');
}

/* ------------------------------------------------------------------ *
 * 3. HTML -> a structured page record.
 *
 * Deliberately regex-based and tolerant, matching check-site.mjs: adding a
 * DOM parser would make this the only script in the repo with a dependency,
 * and every construct it needs to read is generated by our own templates.
 * ------------------------------------------------------------------ */

const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—',
  ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  eacute: 'é', aacute: 'á', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ',
  uuml: 'ü', iquest: '¿', iexcl: '¡', deg: '°', middot: '·', times: '×'
};

function decode(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name] ?? match);
}

/** Visible text of an HTML fragment, with non-content regions removed. */
function textOf(html) {
  return decode(
    html
      /* The colophon publishes this audit's own measurements at the foot of
         the page. Counting it as content would let the audit inflate the
         numbers it is reporting — every page would gain words and links for
         carrying its own score. It is marked and skipped. */
      .replace(/<aside\b[^>]*\bdata-audit-ignore\b[\s\S]*?<\/aside>/gi, ' ')
      .replace(/<(script|style|svg|template|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      // Navigation inside <main> — breadcrumbs, sibling links, related rails.
      // It is chrome that happens to sit in the content well, not content.
      .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function metaContent(html, attr, value) {
  const a = new RegExp(`<meta[^>]*\\s${attr}\\s*=\\s*"${value}"[^>]*\\scontent\\s*=\\s*"([^"]*)"`, 'i');
  const b = new RegExp(`<meta[^>]*\\scontent\\s*=\\s*"([^"]*)"[^>]*\\s${attr}\\s*=\\s*"${value}"`, 'i');
  return html.match(a)?.[1] ?? html.match(b)?.[1] ?? null;
}

function readPage(file, raw) {
  const html = stripComments(raw);
  /* Stripped here, not only inside textOf, because links, paragraphs and list
     items are counted straight off this string. The colophon carries an
     internal link and a definition list; leaving it in would credit every
     page with both. */
  const main = (html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '').replace(
    /<aside\b[^>]*\bdata-audit-ignore\b[\s\S]*?<\/aside>/gi,
    ' '
  );

  const headings = [...html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    level: Number(m[1][1]),
    text: textOf(m[2])
  }));
  const mainHeadings = [...main.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    level: Number(m[1][1]),
    text: textOf(m[2])
  }));

  const links = [...main.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((m) => ({
    href: m[1].match(/\shref\s*=\s*"([^"]*)"/i)?.[1] ?? '',
    text: textOf(m[2]),
    label: m[1].match(/\saria-label\s*=\s*"([^"]*)"/i)?.[1] ?? ''
  }));

  const alternates = [...html.matchAll(/<link[^>]*\srel\s*=\s*"alternate"[^>]*>/gi)].map((m) => ({
    lang: m[0].match(/\shreflang\s*=\s*"([^"]*)"/i)?.[1] ?? '',
    href: m[0].match(/\shref\s*=\s*"([^"]*)"/i)?.[1] ?? ''
  }));

  const schemas = [];
  for (const block of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      schemas.push(JSON.parse(block[1]));
    } catch {
      /* check-site.mjs already fails the build on unparseable JSON-LD. */
    }
  }
  const schemaTypes = new Set();
  const collectTypes = (node) => {
    if (Array.isArray(node)) return node.forEach(collectTypes);
    if (!node || typeof node !== 'object') return;
    const t = node['@type'];
    if (typeof t === 'string') schemaTypes.add(t);
    else if (Array.isArray(t)) t.forEach((x) => schemaTypes.add(x));
    for (const value of Object.values(node)) collectTypes(value);
  };
  schemas.forEach((s) => collectTypes(s['@graph'] ?? s));

  const url = urlOf(file);
  return {
    file,
    path: rel(file),
    url,
    lang: html.match(/<html[^>]*\slang\s*=\s*"([^"]+)"/i)?.[1]?.slice(0, 2) ?? 'en',
    title: decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? ''),
    description: decode(metaContent(html, 'name', 'description') ?? ''),
    canonical: html.match(/<link[^>]*\srel\s*=\s*"canonical"[^>]*\shref\s*=\s*"([^"]*)"/i)?.[1] ?? '',
    ogType: metaContent(html, 'property', 'og:type'),
    ogLocale: metaContent(html, 'property', 'og:locale'),
    ogSiteName: metaContent(html, 'property', 'og:site_name'),
    twitterCard: metaContent(html, 'name', 'twitter:card'),
    noindex: /<meta[^>]*\sname\s*=\s*"robots"[^>]*\scontent\s*=\s*"[^"]*noindex/i.test(html),
    headings,
    mainHeadings,
    links,
    alternates,
    schemaTypes,
    images: [...main.matchAll(/<img\b[^>]*>/gi)].map((m) => ({
      alt: m[0].match(/\salt\s*=\s*"([^"]*)"/i)?.[1] ?? null
    })),
    text: textOf(main),
    /* Readability is measured on prose only.
       Running it over the whole content well produced nonsense: a ledger's
       <dt>/<dd> cells carry no terminal punctuation, so "See the ledger",
       "Where things actually stand", "Team", "1", "plus specialists per
       project" concatenated into one 46-word "sentence" and the page was
       told to break it up. A definition list has no reading ease. Splitting
       on every block boundary instead would bias the other way, filling the
       average with two-word cells. Paragraphs are the thing a person reads. */
    prose: [...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => textOf(m[1]))
      .filter(Boolean)
      .join(' '),
    /* Values presented AS figures — a ledger cell, a stat tile, a proof row.
       The unit-bearing regex in scoreDepth cannot see these, because the
       whole point of the pattern is that the number stands alone in its own
       element and the label sits in a sibling. */
    figureCells: [
      ...main.matchAll(/<(?:strong|dd)\b[^>]*>([\s\S]*?)<\/(?:strong|dd)>/gi),
      ...main.matchAll(/<[a-z]+\b[^>]*class="[^"]*(?:figure|digit|proof__value|stat)[^"]*"[^>]*>([\s\S]*?)<\//gi)
    ]
      .map((m) => textOf(m[1]))
      .filter((value) => /^[^\p{L}]*\d[\d.,\s]*[^\p{L}]*$/u.test(value) && value.trim()),
    listItems: [...main.matchAll(/<li\b/gi)].length,
    paragraphs: [...main.matchAll(/<p\b/gi)].length,
    type: null // assigned below
  };
}

/* ------------------------------------------------------------------ *
 * 4. Language-aware text metrics.
 * ------------------------------------------------------------------ */

const words = (text) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'’-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);

const sentences = (text) =>
  text
    .split(/(?<=[.!?…])\s+(?=[¿¡"“(]?[A-ZÁÉÍÓÚÑ0-9])/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);

/** English syllable estimate — the standard vowel-group heuristic. */
function syllablesEn(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const trimmed = w
    .replace(/(?:[^laeiouy]es|[^laeiouy]ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '');
  return (trimmed.match(/[aeiouy]{1,2}/g) || ['x']).length;
}

/**
 * Spanish syllable estimate. Vowel groups are one syllable unless the group
 * holds two strong vowels (a, e, o) or an accented weak vowel, which break
 * the diphthong — the rule that separates "línea" (3) from "tiene" (2).
 */
function syllablesEs(word) {
  const w = word.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
  if (!w) return 0;
  const groups = w.match(/[aeiouáéíóúü]+/g) || [];
  let count = 0;
  for (const group of groups) {
    count += 1;
    for (let i = 1; i < group.length; i += 1) {
      const prev = group[i - 1];
      const cur = group[i];
      const strong = (c) => 'aeoáéó'.includes(c);
      const accentedWeak = (c) => 'íú'.includes(c);
      if ((strong(prev) && strong(cur)) || accentedWeak(prev) || accentedWeak(cur)) count += 1;
    }
  }
  return Math.max(1, count);
}

/**
 * Reading ease, 0-100, higher is easier.
 * English: Flesch. Spanish: Fernández-Huerta, the standard Spanish adaptation
 * — using Flesch's English constants on Spanish reports every text as harder
 * than it is, because Spanish words simply carry more syllables.
 */
function readingEase(text, lang) {
  const ws = words(text);
  const ss = sentences(text);
  if (ws.length < 30 || ss.length === 0) return null;
  const syl = lang === 'es' ? syllablesEs : syllablesEn;
  const syllablesPerWord = ws.reduce((sum, w) => sum + syl(w), 0) / ws.length;
  const wordsPerSentence = ws.length / ss.length;
  const score =
    lang === 'es'
      ? 206.84 - 60 * syllablesPerWord - 1.02 * wordsPerSentence
      : 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const clamped = Math.max(0, Math.min(100, score));
  return { score: clamped, band: easeBand(clamped, lang), wordsPerSentence, syllablesPerWord, sentences: ss };
}

/**
 * The one reading-ease band table.
 *
 * There were two: this scale, and a second one inside scripts/colophon.mjs
 * with different cut points, so the report called the homepage "demanding"
 * while the homepage itself printed "hard" about the same number. The colophon
 * now reads the band out of the payload. Two tables for one scale is the same
 * defect as two implementations of a word count, which the colophon was built
 * to avoid.
 *
 * Note that the two languages are scored by different formulas — Flesch for
 * English, Fernández-Huerta for Spanish — and Spanish reads roughly four
 * points higher on identical prose. The bands are shared anyway, because the
 * alternative is two vocabularies for one label.
 */
function easeBand(score, lang) {
  const bands =
    lang === 'es'
      ? [[80, 'muy fácil'], [65, 'fácil'], [50, 'normal'], [35, 'exigente'], [0, 'difícil']]
      : [[80, 'very easy'], [65, 'easy'], [50, 'plain'], [35, 'demanding'], [0, 'hard']];
  return bands.find(([floor]) => score >= floor)[1];
}

const normalise = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/* ------------------------------------------------------------------ *
 * 5. Page typing and the target term.
 * ------------------------------------------------------------------ */

const BRAND = 'CREATIVE MK';

function typeOf(url) {
  if (url === '/' || url === '/es/') return 'home';
  if (/^\/(es\/)?(servicios|services)\/$/.test(url)) return 'service-index';
  if (/^\/(es\/)?(servicios|services)\/[^/]+\/$/.test(url)) return 'service';
  if (/^\/(es\/)?(trabajo|work)\/$/.test(url)) return 'work-index';
  if (/^\/(es\/)?(trabajo|work)\/[^/]+\/$/.test(url)) return 'case';
  if (/^\/(es\/)?(notas|insights)\/$/.test(url)) return 'note-index';
  if (/^\/(es\/)?(notas|insights)\/[^/]+\/$/.test(url)) return 'note';
  if (/^\/(es\/)?(estudio|studio)\/$/.test(url)) return 'studio';
  if (/^\/(es\/)?lab\/$/.test(url)) return 'lab';
  if (/^\/(es\/)?(privacy|privacidad|terms|terminos)\/$/.test(url)) return 'legal';
  return 'utility';
}

/**
 * The term a page is trying to own, inferred from its own URL and H1 rather
 * than declared in a config — a page whose slug and heading disagree about
 * its subject has a problem worth reporting, and a hand-written target list
 * would hide exactly that.
 */
function targetTerm(page) {
  const slug = page.url.replace(/\/$/, '').split('/').filter(Boolean).pop() ?? '';
  const fromSlug = slug.replace(/-/g, ' ').trim();
  const h1 = page.mainHeadings.find((h) => h.level === 1)?.text ?? '';
  /* A homepage has no slug to infer from, and taking the first words of its H1
     produced a phantom: the site was told to "lead the title with digital
     experiences for brands" because that is how the headline happens to open.
     A homepage ranks for the brand and its category set. The brand is the
     term; the categories are already what Entity coverage measures. */
  if (page.type === 'home') return normalise(BRAND);
  if (!fromSlug) return normalise(h1).split(' ').slice(0, 4).join(' ') || normalise(BRAND);
  return normalise(fromSlug);
}

/** Every occurrence of a multi-word term, counted on normalised text. */
function countTerm(text, term) {
  if (!term) return 0;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (normalise(text).match(new RegExp(`\\b${escaped}\\b`, 'g')) || []).length;
}

/**
 * Function words carry no ranking signal and should not be able to fail a
 * coverage test. Without this, the slug `ia-para-negocios-de-servicio`
 * demanded the word "para" in the H1 — four characters long, so the length
 * filter let it through, and no headline will ever be written around it.
 */
const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'your', 'our',
  'para', 'por', 'con', 'los', 'las', 'una', 'uno', 'del', 'que', 'como', 'sin'
]);

/** Partial credit: how many of the term's content words appear at all. */
function termCoverage(text, term) {
  const parts = term.split(' ').filter((w) => w.length > 2 && !STOPWORDS.has(w));
  if (!parts.length) return 0;
  const body = normalise(text);
  const hit = parts.filter((p) => new RegExp(`\\b${p}`).test(body)).length;
  return hit / parts.length;
}

/* ------------------------------------------------------------------ *
 * 6. The controlled vocabulary — contentswift's entity gap, turned inward.
 *
 * Read from src/_data so the audit tracks the content instead of a copy of
 * it. Each page type declares which sets it is expected to cover.
 * ------------------------------------------------------------------ */

async function loadVocabulary() {
  const load = async (name) => {
    const url = new URL(`../src/_data/${name}`, import.meta.url).href;
    return (await import(url)).default;
  };
  const services = await load('services.js');
  const cases = await load('cases.js');

  const byLang = (lang) => ({
    services: services.map((s) => s[lang].title),
    serviceSlugs: services.map((s) => (lang === 'es' ? s.esSlug : s.slug)),
    cases: cases.map((c) => c[lang].title),
    /* Deliverables and stack are the concrete nouns a buyer searches for and
       a jury reads as evidence. A service page that never names its own
       deliverables is a brochure. */
    deliverables: services.flatMap((s) => s[lang].deliverables.map((d) => d.name)),
    stack: [...new Set(cases.flatMap((c) => c[lang].stack))],
    engagements: services.flatMap((s) => s[lang].engagements.map((e) => e.name))
  });

  return { en: byLang('en'), es: byLang('es'), services, cases };
}

const vocabulary = await loadVocabulary();

/**
 * Which vocabulary sets each page type is expected to touch, and how.
 *
 * `mode: 'ratio'` means the page should cover most of the set — a services
 * index that names two of six services is incomplete. `mode: 'any'` means one
 * is enough: a note is about its own subject, and demanding it name all six
 * services would be asking for keyword stuffing in an essay. Getting this
 * wrong in the first version produced exactly that reading — a 1,200-word note
 * on AI intake marked down for not mentioning Branding.
 */
const ENTITY_EXPECTATION = {
  home: { sets: ['services', 'cases'], mode: 'ratio' },
  'service-index': { sets: ['services'], mode: 'ratio' },
  service: { sets: ['deliverables', 'engagements'], mode: 'ratio' },
  'work-index': { sets: ['cases'], mode: 'ratio' },
  case: { sets: ['stack'], mode: 'ratio' },
  'note-index': { sets: [], mode: 'ratio' },
  /* `atLeast` scores proportionally up to a floor instead of demanding most of
     the set. A note is about its own subject and should not be asked to name
     all six services — but the first version of this exemption awarded a full
     15/15 for naming one of six, which stopped measuring anything. Two is the
     number: an argument worth publishing touches at least a couple of the
     things the studio sells, or it is not an argument this studio should be
     making. */
  note: { sets: ['services'], mode: 'atLeast', atLeast: 2 },
  studio: { sets: ['services'], mode: 'ratio' },
  lab: { sets: [], mode: 'ratio' },
  legal: { sets: [], mode: 'ratio' },
  utility: { sets: [], mode: 'ratio' }
};

/* ------------------------------------------------------------------ *
 * 7. Load every page and build the link graph.
 * ------------------------------------------------------------------ */

const pages = [];
for (const file of htmlFiles) {
  const raw = await readFile(file, 'utf8');
  const page = readPage(file, raw);
  page.type = typeOf(page.url);
  page.target = targetTerm(page);
  pages.push(page);
}

const byUrl = new Map(pages.map((p) => [p.url, p]));

/** Resolve an href to a URL this site serves, or null. */
function internalUrl(href, from) {
  if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//') || href.startsWith('#')) {
    return null;
  }
  const clean = href.split('#')[0].split('?')[0];
  if (!clean) return null;
  const url = clean.startsWith('/')
    ? clean
    : new URL(clean, `https://x${from.url}`).pathname;
  /* Both forms, because Pages serves /work/ from work/index.html and /contact
     from contact.html. Appending a slash unconditionally — which this did —
     turned /contact into /contact/, which matches nothing, so every body link
     to the contact page was silently dropped from the graph. Twenty-six of
     thirty-seven scored pages link to it, and none of those links were being
     counted in their outbound total or its inbound one. */
  if (byUrl.has(url)) return url;
  const slashed = url.endsWith('/') ? url : url + '/';
  if (byUrl.has(slashed)) return slashed;
  const bare = url.replace(/\/$/, '');
  return byUrl.has(bare) ? bare : null;
}

const inbound = new Map(pages.map((p) => [p.url, new Set()]));
const outbound = new Map(pages.map((p) => [p.url, new Set()]));
for (const page of pages) {
  /* The header, footer and breadcrumbs link everything to everything. Counting
     them would make every page look well-linked and hide the real question:
     does the body of one page ever recommend another? Only <main> links,
     minus the <nav> blocks textOf() already drops, are counted. */
  for (const link of page.links) {
    const target = internalUrl(link.href, page);
    if (!target || target === page.url) continue;
    outbound.get(page.url).add(target);
    inbound.get(target).add(page.url);
  }
}

/* Click depth from the homepage, over every link including chrome — depth is
   a crawl question, and a crawler follows the header too. */
const depth = new Map();
{
  const chromeLinks = new Map();
  for (const page of pages) {
    const raw = await readFile(page.file, 'utf8');
    const all = [...stripComments(raw).matchAll(/<a\b[^>]*\shref\s*=\s*"([^"]*)"/gi)].map((m) => m[1]);
    chromeLinks.set(
      page.url,
      new Set(all.map((h) => internalUrl(h, page)).filter(Boolean))
    );
  }
  const queue = [['/', 0]];
  depth.set('/', 0);
  while (queue.length) {
    const [url, d] = queue.shift();
    for (const next of chromeLinks.get(url) ?? []) {
      if (!depth.has(next)) {
        depth.set(next, d + 1);
        queue.push([next, d + 1]);
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * 8. The seven scorers. Each returns { points, max, notes[] }.
 *    A note is { severity, message, fix }.
 * ------------------------------------------------------------------ */

const note = (severity, message, fix) => ({ severity, message, fix });

/* --- 8.1 Keyword usage — 20 --- */
function scoreKeyword(page) {
  const notes = [];
  const term = page.target;
  const body = page.text;
  const wordCount = words(body).length;
  let points = 0;

  const inTitle = countTerm(page.title, term) > 0 || termCoverage(page.title, term) >= 0.6;
  const h1 = page.mainHeadings.find((h) => h.level === 1)?.text ?? '';
  const inH1 = countTerm(h1, term) > 0 || termCoverage(h1, term) >= 0.6;
  const inDescription = countTerm(page.description, term) > 0 || termCoverage(page.description, term) >= 0.6;
  const opening = words(body).slice(0, 100).join(' ');
  const inOpening = countTerm(opening, term) > 0 || termCoverage(opening, term) >= 0.6;
  const h2s = page.mainHeadings.filter((h) => h.level === 2).map((h) => h.text).join(' ');
  const inH2 = countTerm(h2s, term) > 0 || termCoverage(h2s, term) >= 0.6;

  if (inTitle) points += 5;
  else notes.push(note('high', `the title never states "${term}"`, 'lead the title with the term the page is trying to own'));

  /* The homepage used to be exempted here, on the argument that an H1 is a
     positioning line rather than a keyword slot. The argument is defensible
     and the exemption was still self-granted, stacked on top of already
     redefining the homepage's target term, which together made homepage
     keyword usage close to unfailable. If the finding is wrong it belongs in
     the write-up as a disagreement, not in the scorer as a silent pass. */
  if (inH1) points += 4;
  else notes.push(note('high', `the H1 never states "${term}"`, 'the H1 and the URL should agree about the subject'));

  if (inDescription) points += 3;
  else notes.push(note('medium', `the meta description never states "${term}"`, 'the description is the SERP snippet; it should repeat the term the searcher typed'));

  if (inOpening) points += 4;
  else notes.push(note('medium', `"${term}" is absent from the first 100 words`, 'name the subject in the opening paragraph'));

  if (inH2) points += 2;
  else notes.push(note('low', `no H2 mentions "${term}"`, 'one subheading should carry the term'));

  const occurrences = countTerm(body, term);
  const density = wordCount ? (occurrences / wordCount) * 100 : 0;
  if (density > 3) {
    notes.push(note('high', `keyword density is ${density.toFixed(1)}% — that reads as stuffing`, 'cut repetitions; use the term where it earns its place'));
  } else if (density >= 0.4) {
    points += 2;
  } else if (wordCount > 200) {
    notes.push(note('low', `"${term}" appears ${occurrences}× in ${wordCount} words (${density.toFixed(2)}%)`, 'a body that never repeats its subject reads as off-topic to a crawler'));
  }

  return { points, max: 20, notes, detail: { term, occurrences, density } };
}

/* --- 8.2 Word count — 15 --- */
function scoreLength(page) {
  const spec = TYPE_SPEC[page.type];
  const count = words(page.text).length;
  const notes = [];
  let points;

  if (!spec.target) return { points: 15, max: 15, notes, detail: { count } };

  if (count >= spec.target) points = 15;
  else if (count >= spec.floor) {
    points = 8 + Math.round((7 * (count - spec.floor)) / (spec.target - spec.floor));
    notes.push(note('low', `${count} words, under the ${spec.target} target for a ${page.type} page`, 'the page is publishable but not yet the most complete answer on the subject'));
  } else {
    points = Math.max(0, Math.round((8 * count) / spec.floor));
    notes.push(note('high', `${count} words, under the ${spec.floor} floor for a ${page.type} page`, 'this is a thin page; it will lose to any competitor that answers properly'));
  }
  return { points, max: 15, notes, detail: { count, floor: spec.floor, target: spec.target } };
}

/* --- 8.3 Heading structure — 15 --- */
function scoreHeadings(page) {
  const notes = [];
  const spec = TYPE_SPEC[page.type];
  let points = 15;

  const h1s = page.mainHeadings.filter((h) => h.level === 1);
  if (h1s.length !== 1) {
    points -= 5;
    notes.push(note('high', `${h1s.length} H1 elements in <main>`, 'exactly one H1 states what the document is'));
  }

  const h2s = page.mainHeadings.filter((h) => h.level === 2);
  if (spec.minH2 && h2s.length < spec.minH2) {
    points -= 4;
    notes.push(note('medium', `${h2s.length} H2 sections, under the ${spec.minH2} expected for a ${page.type} page`, 'break the page into sections a skimmer can navigate'));
  }

  /* A skipped level is a broken outline: assistive technology reads the
     hierarchy literally, and so does a crawler building the page's shape. */
  let previous = 0;
  for (const heading of page.mainHeadings) {
    if (previous && heading.level > previous + 1) {
      points -= 3;
      notes.push(note('medium', `heading level jumps H${previous} → H${heading.level} at "${heading.text.slice(0, 40)}"`, 'never skip a level; style with CSS instead'));
      break;
    }
    previous = heading.level;
  }

  /* Restored to every sub-heading after review. Narrowing this to H2 was
     defended as "an H3 in a numbered step is legitimately one word", which is
     true of the homepage's process grid and was still a rule narrowed to
     dismiss a live finding. */
  const vague = page.mainHeadings.filter((h) => h.level > 1 && words(h.text).length < 2 && h.text.length < 12);
  if (vague.length > 2) {
    points -= 3;
    notes.push(note('low', `${vague.length} headings are one short word`, 'a subheading is a promise about the section; single words rarely make one'));
  }

  return { points: Math.max(0, points), max: 15, notes, detail: { h1: h1s.length, h2: h2s.length } };
}

/* --- 8.4 Readability — 15 --- */
function scoreReadability(page) {
  const notes = [];
  const reading = readingEase(page.prose || page.text, page.lang);
  if (!reading) return { points: 15, max: 15, notes, detail: null };

  let points = 15;
  /* 50-70 is the band that reads as considered but not dumbed down. This is a
     studio selling judgement; below 40 the prose is doing the client's work
     for them and above 80 it stops sounding like an expert. */
  if (reading.score < 30) {
    points -= 7;
    notes.push(note('high', `reading ease ${reading.score.toFixed(0)} — ${reading.band}`, 'shorten sentences; the argument is being lost in the syntax'));
  } else if (reading.score < 45) {
    points -= 3;
    notes.push(note('low', `reading ease ${reading.score.toFixed(0)} — ${reading.band}`, 'acceptable for a technical case, costly on a page that has to sell'));
  } else if (reading.score > 85) {
    points -= 3;
    notes.push(note('low', `reading ease ${reading.score.toFixed(0)} — ${reading.band}`, 'the prose may be under-selling the expertise'));
  }

  if (reading.wordsPerSentence > 26) {
    points -= 4;
    notes.push(note('medium', `${reading.wordsPerSentence.toFixed(0)} words per sentence on average`, 'break the longest sentences; 15-22 is the readable band'));
  }

  const monsters = reading.sentences.filter((s) => words(s).length > 45);
  if (monsters.length) {
    points -= 2;
    notes.push(note('low', `${monsters.length} sentence(s) over 45 words`, `longest starts: "${monsters[0].slice(0, 60)}…"`));
  }

  return {
    points: Math.max(0, points),
    max: 15,
    notes,
    detail: { ease: reading.score, band: reading.band, wordsPerSentence: reading.wordsPerSentence }
  };
}

/* --- 8.5 Entity coverage — 15 --- */
function scoreEntities(page) {
  const notes = [];
  const { sets: expected, mode, atLeast = 1 } = ENTITY_EXPECTATION[page.type] ?? { sets: [], mode: 'ratio' };
  if (!expected.length) return { points: 15, max: 15, notes, detail: null };

  const vocab = vocabulary[page.lang] ?? vocabulary.en;
  const body = normalise(`${page.text} ${page.title} ${page.description}`);
  const missing = [];
  let covered = 0;
  let total = 0;

  /* A case is measured against its OWN stack, not the union of every case's.
     The union asked the WebGL case to name Durable Objects and D1, and the
     agent case to name GLSL and Lenis — two pages penalised for not being
     each other. The set is only meaningful per document. */
  const own = { ...vocab };
  const slug = page.url.replace(/\/$/, '').split('/').pop();
  if (page.type === 'case') {
    const match = vocabulary.cases.find((c) => c.slug === slug || c.esSlug === slug);
    own.stack = match ? match[page.lang]?.stack ?? match.en.stack : [];
  }
  /* Same correction for services: a service page was being measured against
     the union of all six services' deliverables, so the AI Automation page
     was marked down for never mentioning "Positioning brief" — a deliverable
     of Branding. Sixteen of fifty-four is a meaningless denominator. */
  if (page.type === 'service') {
    const match = vocabulary.services.find((s) => s.slug === slug || s.esSlug === slug);
    const locale = match ? match[page.lang] ?? match.en : null;
    own.deliverables = locale ? locale.deliverables.map((d) => d.name) : [];
    own.engagements = locale ? locale.engagements.map((e) => e.name) : [];
  }

  for (const set of expected) {
    for (const entity of own[set] ?? []) {
      total += 1;
      /* Match on the entity's distinctive words rather than the exact string:
         "Positioning brief" is covered by a sentence that says "the brief that
         states the positioning". Requiring the literal phrase would reward
         keyword lists over prose. */
      const parts = normalise(entity).split(' ').filter((w) => w.length > 3);
      const hit = parts.length
        ? parts.every((p) => body.includes(p))
        : body.includes(normalise(entity));
      if (hit) covered += 1;
      else missing.push(entity);
    }
  }

  if (mode === 'atLeast') {
    const points = Math.round(15 * Math.min(1, covered / atLeast));
    if (covered < atLeast) {
      notes.push(
        note(
          covered === 0 ? 'medium' : 'low',
          `names ${covered} of the ${total} services, against a floor of ${atLeast}`,
          'a note should connect its argument to more than one of the things the studio actually sells'
        )
      );
    }
    return { points, max: 15, notes, detail: { covered, total, atLeast, missing } };
  }

  const ratio = total ? covered / total : 1;
  const points = Math.round(15 * Math.min(1, ratio / 0.75)); // 75% coverage earns full marks
  if (missing.length) {
    notes.push(
      note(
        ratio < 0.4 ? 'high' : 'low',
        `covers ${covered}/${total} of the entities a ${page.type} page should name`,
        `missing: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? `, +${missing.length - 6} more` : ''}`
      )
    );
  }
  return { points, max: 15, notes, detail: { covered, total, missing } };
}

/* --- 8.6 Content depth — 10 --- */
function scoreDepth(page) {
  const notes = [];
  const spec = TYPE_SPEC[page.type];
  if (!spec.target) return { points: 10, max: 10, notes, detail: null };

  let points = 0;
  const wordCount = words(page.text).length;

  if (page.paragraphs >= 6) points += 3;
  else if (page.paragraphs >= 3) points += 2;
  else notes.push(note('medium', `${page.paragraphs} paragraphs`, 'the page is a list of assertions, not an argument'));

  if (page.listItems >= 4) points += 2;
  else notes.push(note('low', 'no substantial list', 'a scannable list gives the skimmer something to land on'));

  /* Specific figures are the difference between "we make sites fast" and
     "31 KB of renderer replacing 184 KB". Juries and buyers both read for
     them, and a page with none is a page making claims it never checks. */
  const figures =
    (page.text.match(/\b\d[\d.,]*\s?(%|KB|MB|ms|s\b|weeks?|semanas?|days?|días?|×|x\b)/gi) || []).length +
    page.figureCells.length;
  if (figures >= 4) points += 3;
  else if (figures >= 1) points += 2;
  else notes.push(note('medium', 'no concrete figures anywhere in the body', 'name a number: a duration, a size, a count — something checkable'));

  if (wordCount > 0 && page.paragraphs > 0) {
    const perParagraph = wordCount / page.paragraphs;
    if (perParagraph > 120) {
      notes.push(note('low', `${perParagraph.toFixed(0)} words per paragraph`, 'dense blocks lose mobile readers; split at the turns in the argument'));
    } else points += 2;
  }

  return { points: Math.min(10, points), max: 10, notes, detail: { figures, paragraphs: page.paragraphs } };
}

/* --- 8.7 Internal structure — 10 --- */
function scoreStructure(page) {
  const notes = [];
  const spec = TYPE_SPEC[page.type];
  if (!spec.target) return { points: 10, max: 10, notes, detail: null };

  let points = 0;
  const out = outbound.get(page.url) ?? new Set();
  const inn = inbound.get(page.url) ?? new Set();

  if (out.size >= 3) points += 3;
  else if (out.size >= 1) points += 2;
  else notes.push(note('high', 'the body links nowhere', 'a page that recommends no other page is a dead end for a reader and a crawler'));

  /* A homepage is what other pages are reached from, not recommended by. The
     technical layer already carries this exemption; the scorer did not, so
     both language roots were being marked down for being roots. */
  if (page.type === 'home' || inn.size >= 2) points += 3;
  else if (inn.size === 1) points += 2;
  else notes.push(note('high', 'no other page links to this one from its body', 'orphaned in the body graph: only chrome points here, so nothing signals it matters'));

  const generic = page.links.filter((l) => GENERIC_ANCHORS.has(normalise(l.text)) && !l.label);
  if (generic.length) {
    notes.push(note('medium', `${generic.length} link(s) with generic anchor text`, 'anchor text should name the destination, not the gesture'));
  } else points += 2;

  const d = depth.get(page.url);
  if (d === undefined) {
    notes.push(note('high', 'unreachable from the homepage by any link', 'nothing crawls to this page'));
  } else if (d > 3) {
    notes.push(note('medium', `${d} clicks from the homepage`, 'deep pages accumulate less authority; promote it into a hub'));
  } else points += 2;

  return { points: Math.min(10, points), max: 10, notes, detail: { out: out.size, in: inn.size, depth: d } };
}

/* ------------------------------------------------------------------ *
 * 9. The technical layer (open-seo): site-wide, not per-page score.
 * ------------------------------------------------------------------ */

const technical = [];
const tech = (severity, area, message, fix) => technical.push({ severity, area, message, fix });

async function auditTechnical() {
  const indexable = pages.filter((p) => !p.noindex && p.type !== 'utility');

  /* --- hreflang reciprocity. A one-way alternate is ignored outright by
     Google, so a half-declared pair is the same as none — and this site's
     whole Spanish strategy rides on it. --- */
  for (const page of pages) {
    if (!page.alternates.length) {
      if (page.type !== 'utility' && !page.noindex) {
        tech('medium', 'hreflang', `${page.url} declares no hreflang alternates`, 'a bilingual site should declare the pair on both halves, plus x-default');
      }
      continue;
    }
    const self = page.alternates.find((a) => a.href.replace(/^https?:\/\/[^/]+/, '') === page.url);
    if (!self) {
      tech('medium', 'hreflang', `${page.url} lists alternates but not itself`, 'each page in the set must list every member including itself');
    }
    if (!page.alternates.some((a) => a.lang === 'x-default')) {
      tech('low', 'hreflang', `${page.url} has no x-default alternate`, 'x-default tells Google what to serve an unmatched locale');
    }
    for (const alt of page.alternates) {
      if (alt.lang === 'x-default') continue;
      const target = byUrl.get(alt.href.replace(/^https?:\/\/[^/]+/, ''));
      if (!target) continue;
      const backs = target.alternates.some(
        (a) => a.href.replace(/^https?:\/\/[^/]+/, '') === page.url
      );
      if (!backs) {
        tech('high', 'hreflang', `${page.url} points at ${target.url} but ${target.url} does not point back`, 'non-reciprocal hreflang is discarded entirely');
      }
    }
  }

  /* --- scent: the title is the promise a searcher clicks, the H1 is what
     they land on. If the two share no content word, the visitor has to
     re-orient in the first second and some of them simply leave. This is the
     check that replaced a phantom: inferring a homepage's target term from
     the opening words of its H1 reported the same situation as a keyword
     failure, which it is not — the homepage ranks for the brand. --- */
  for (const page of indexable) {
    const h1 = page.mainHeadings.find((h) => h.level === 1)?.text;
    if (!h1) continue;
    /* Crude stemming, deliberately. "Branding" in the title and "brands" in
       the H1 carry the same scent for a reader, and a check that fires on
       morphology reports style as a defect. Suffix-stripping is enough for
       both languages here; a real stemmer would be a dependency for one
       check. */
    const stem = (w) =>
      w.replace(/(ing|ings|iones|ciones|mente|ment|ed|es|s)$/u, '').slice(0, 8);
    const contentWords = (text) =>
      new Set(
        normalise(text)
          .split(' ')
          .filter((w) => w.length > 3 && !STOPWORDS.has(w) && !normalise(BRAND).includes(w))
          .map(stem)
          .filter((w) => w.length > 2)
      );
    const titleWords = contentWords(page.title);
    const h1Words = contentWords(h1);
    if (!titleWords.size || !h1Words.size) continue;
    const shared = [...titleWords].filter((w) => h1Words.has(w));
    if (!shared.length) {
      tech('medium', 'scent', `${page.url} title and H1 share no content word`, `"${page.title.slice(0, 45)}" then "${h1.slice(0, 45)}" — the click and the landing describe different pages`);
    }
  }
  /* --- the document's declared language against the language it is written
     in. /privacy/ and /terms/ each declare lang="en" and carry a full Spanish
     section below the English one, so a screen reader pronounces half of each
     with the wrong phonemes and a crawler indexes one document for two
     languages.

     Detection is per BLOCK, and what it looks for is a contiguous RUN. The
     first version compared whole-body function-word frequency against a 45%
     threshold; the two pages sit at 37% and 47%, so the check reported
     whichever had been edited last, and adding a single English paragraph to
     /privacy/ silenced it there while the Spanish half it was built to find
     stayed exactly where it was. A ratio cannot see a section. A run of blocks
     is what a section is. --- */
  const MARKERS = {
    es: [' que ', ' de ', ' los ', ' las ', ' para ', ' con ', ' del ', ' una ', ' por ', ' se ', ' es ', ' en '],
    en: [' the ', ' of ', ' and ', ' to ', ' with ', ' for ', ' that ', ' your ', ' we ', ' is ', ' are ', ' from ']
  };
  const blockLanguage = (text) => {
    const haystack = ` ${text.toLowerCase()} `;
    const count = (list) => list.reduce((sum, marker) => sum + (haystack.split(marker).length - 1), 0);
    const es = count(MARKERS.es);
    const en = count(MARKERS.en);
    if (es + en < 4 || es === en) return null; // too short, or genuinely ambiguous
    return es > en ? 'es' : 'en';
  };

  for (const page of indexable) {
    const raw = stripComments(await readFile(page.file, 'utf8'));
    const main = (raw.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '').replace(
      /<aside\b[^>]*\bdata-audit-ignore\b[\s\S]*?<\/aside>/gi,
      ' '
    );
    const blocks = [...main.matchAll(/<(p|li|h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map((m) => textOf(m[2]))
      .filter((text) => words(text).length >= 8);
    if (blocks.length < 6) continue;

    const other = page.lang === 'es' ? 'en' : 'es';
    let run = 0;
    let longest = 0;
    let foreign = 0;
    for (const block of blocks) {
      const detected = blockLanguage(block);
      if (detected === other) {
        foreign += 1;
        run += 1;
        longest = Math.max(longest, run);
      } else if (detected !== null) {
        run = 0;
      }
    }

    /* Three consecutive blocks is a section, not a quotation. One borrowed
       term or a bilingual heading must never trip this. */
    if (longest >= 3) {
      tech(
        'high',
        'language',
        `${page.url} declares lang="${page.lang}" and carries a run of ${longest} consecutive blocks in ${other} (${foreign} of ${blocks.length})`,
        'one document per language: split it, or fix the lang attribute'
      );
    }
  }


  /* --- canonical self-reference --- */
  for (const page of indexable) {
    const canonicalPath = page.canonical.replace(/^https?:\/\/[^/]+/, '');
    if (canonicalPath && canonicalPath !== page.url) {
      tech('high', 'canonical', `${page.url} canonicalises to ${canonicalPath}`, 'a page that points its canonical elsewhere is asking not to be indexed');
    }
  }

  /* --- social and structured-data completeness --- */
  for (const page of indexable) {
    if (!page.ogType) tech('low', 'social', `${page.url} has no og:type`, 'declare article for notes and cases, website for the rest');
    if (!page.ogLocale) tech('low', 'social', `${page.url} has no og:locale`, 'without it a Spanish page is shared as English');
    if (!page.twitterCard) tech('low', 'social', `${page.url} has no twitter:card`, 'summary_large_image is what makes the card render at full width');

    const expected = {
      service: 'Service',
      case: 'CreativeWork',
      note: 'Article',
      home: 'Organization',
      studio: 'Organization',
      'service-index': 'ItemList',
      'work-index': 'ItemList',
      'note-index': 'ItemList'
    }[page.type];
    /* schema.org types are a hierarchy, and a subtype satisfies its parent: a
       page declaring ProfessionalService has declared an Organization, and
       demanding the literal string would push the site to ship a weaker,
       redundant type purely to satisfy this check. Only the ancestors this
       site actually uses are listed — an audit that silently accepted every
       type would report nothing. */
    const SATISFIES = {
      Organization: ['ProfessionalService', 'LocalBusiness', 'Corporation'],
      CreativeWork: ['Article', 'BlogPosting', 'WebPage', 'SoftwareApplication'],
      Article: ['BlogPosting', 'NewsArticle', 'TechArticle']
    };
    const satisfied =
      expected &&
      (page.schemaTypes.has(expected) ||
        (SATISFIES[expected] ?? []).some((sub) => page.schemaTypes.has(sub)));
    if (expected && !satisfied) {
      const present = [...page.schemaTypes].slice(0, 4).join(', ') || 'none';
      tech('medium', 'schema', `${page.url} declares no ${expected} (has: ${present})`, `a ${page.type} page should describe itself as ${expected}`);
    }
    if (!page.schemaTypes.has('BreadcrumbList') && page.type !== 'home' && (depth.get(page.url) ?? 0) > 1) {
      tech('low', 'schema', `${page.url} has no BreadcrumbList`, 'breadcrumbs render the hierarchy in the SERP instead of a bare URL');
    }
  }

  /* --- orphans and depth --- */
  for (const page of indexable) {
    if (!depth.has(page.url)) {
      tech('high', 'crawl', `${page.url} is unreachable from the homepage`, 'link it from a hub or drop it');
    }
    /* A homepage is the thing other pages are reached *from*; nobody
       recommends it in body copy, and both language roots are homepages. */
    if ((inbound.get(page.url)?.size ?? 0) === 0 && page.type !== 'home') {
      tech('medium', 'crawl', `${page.url} has no in-body inbound links`, 'only navigation points here, so nothing distinguishes it from every other page in the menu');
    }
  }

  /* --- sitemap parity --- */
  const sitemapPath = join(distDir, 'sitemap.xml');
  if (existsSync(sitemapPath)) {
    const xml = await readFile(sitemapPath, 'utf8');
    const locs = new Set(
      [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''))
    );
    for (const page of indexable) {
      if (!locs.has(page.url)) {
        tech('high', 'sitemap', `${page.url} is indexable but absent from sitemap.xml`, 'the sitemap is the site telling Google what it considers canonical; a gap contradicts it');
      }
    }
    for (const loc of locs) {
      const target = byUrl.get(loc);
      if (target?.noindex) {
        tech('high', 'sitemap', `sitemap.xml submits ${loc}, which is noindex`, 'submitting a noindex URL is a direct contradiction');
      }
    }
  }

  /* --- image alt quality: check-site catches a missing alt, not an empty or
     duplicated one, and an alt that repeats the filename is worse than none
     because it defeats the fallback --- */
  for (const page of indexable) {
    const empties = page.images.filter((i) => i.alt !== null && i.alt.trim() === '').length;
    if (empties) {
      tech('low', 'a11y', `${page.url} has ${empties} content image(s) with an empty alt`, 'empty alt is correct only for decoration; inside <main> it usually is not');
    }
  }

  /* --- near-duplicate bodies. Templated pages that differ only in a noun are
     the single most common way a well-built site cannibalises itself. --- */
  const shingles = (text) => {
    const w = normalise(text).split(' ').filter(Boolean);
    const set = new Set();
    for (let i = 0; i + 5 <= w.length; i += 1) set.add(w.slice(i, i + 5).join(' '));
    return set;
  };
  const sig = new Map(indexable.map((p) => [p.url, shingles(p.text)]));
  for (let i = 0; i < indexable.length; i += 1) {
    for (let j = i + 1; j < indexable.length; j += 1) {
      const a = indexable[i];
      const b = indexable[j];
      if (a.lang !== b.lang) continue; // EN/ES pairs are supposed to be twins
      const sa = sig.get(a.url);
      const sb = sig.get(b.url);
      if (sa.size < 40 || sb.size < 40) continue;
      let shared = 0;
      for (const s of sa) if (sb.has(s)) shared += 1;
      const jaccard = shared / (sa.size + sb.size - shared);
      if (jaccard > 0.5) {
        tech('high', 'duplication', `${a.url} and ${b.url} share ${(jaccard * 100).toFixed(0)}% of their phrasing`, 'two pages competing for one query; differentiate or consolidate');
      }
    }
  }
}

await auditTechnical();

/* ------------------------------------------------------------------ *
 * 10. Score every page.
 * ------------------------------------------------------------------ */

const CATEGORIES = [
  ['Keyword usage', scoreKeyword],
  ['Word count', scoreLength],
  ['Heading structure', scoreHeadings],
  ['Readability', scoreReadability],
  ['Entity coverage', scoreEntities],
  ['Content depth', scoreDepth],
  ['Internal structure', scoreStructure]
];

const results = [];
for (const page of pages) {
  if (page.noindex || page.type === 'utility') continue;
  const categories = {};
  let total = 0;
  for (const [name, fn] of CATEGORIES) {
    const result = fn(page);
    categories[name] = result;
    total += result.points;
  }
  results.push({
    url: page.url,
    lang: page.lang,
    type: page.type,
    target: page.target,
    score: total,
    commercial: TYPE_SPEC[page.type].commercial,
    categories
  });
}

results.sort((a, b) => a.score - b.score);

const commercial = results.filter((r) => r.commercial);
const siteScore = commercial.length
  ? commercial.reduce((sum, r) => sum + r.score, 0) / commercial.length
  : 0;

/* ------------------------------------------------------------------ *
 * 11. Report.
 * ------------------------------------------------------------------ */

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

const payload = () =>
  JSON.stringify(
    { siteScore: Number(siteScore.toFixed(1)), pages: results, technical },
    (key, value) => (value instanceof Set ? [...value] : value),
    2
  );

if (emitPath) {
  const { writeFile } = await import('node:fs/promises');
  await writeFile(resolve(root, emitPath), payload(), 'utf8');
  if (!asJson) console.log(`Audit written to ${emitPath} — site score ${siteScore.toFixed(1)}.`);
}

if (asJson) {
  console.log(payload());
  process.exit(0);
}

/* --emit used to exit here, so `npm run build` printed a score and swallowed
   every finding behind it — including two HIGH technical ones. A gate whose
   output you have to remember to go and look at is not a gate. The summary
   below always prints; --quiet restores the old behaviour for callers that
   only want the file. */
if (emitPath && args.includes('--quiet')) process.exit(0);

const bar = (score) => {
  const filled = Math.round(score / 5);
  return '█'.repeat(filled) + '·'.repeat(20 - filled);
};

if (onlyPage) {
  const one = results.find((r) => r.url === onlyPage);
  if (!one) {
    console.error(`No scored page at ${onlyPage}. Known: ${results.map((r) => r.url).join(', ')}`);
    process.exit(1);
  }
  console.log(`\n${one.url}  —  ${one.score}/100   [${one.type}, ${one.lang}]`);
  console.log(`target term: "${one.target}"\n`);
  for (const [name, result] of Object.entries(one.categories)) {
    console.log(`  ${name.padEnd(20)} ${String(result.points).padStart(2)}/${result.max}`);
    for (const n of result.notes.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])) {
      console.log(`      [${n.severity}] ${n.message}`);
      console.log(`             → ${n.fix}`);
    }
  }
  process.exit(0);
}

console.log('\n══ CREATIVE MK — content and SEO audit ══\n');
console.log(`Site content score: ${siteScore.toFixed(1)}/100  (mean of ${commercial.length} commercial pages)\n`);

console.log('PAGES, worst first\n');
for (const result of results) {
  const flag = result.commercial ? ' ' : '·';
  console.log(`${flag} ${String(result.score).padStart(3)}  ${bar(result.score)}  ${result.url}`);
}

/* Which category is costing the site the most, summed across pages. It is the
   only view that tells you what to fix first when everything is mid. */
console.log('\nWHERE THE POINTS ARE LOST (commercial pages, total forgone)\n');
const lost = new Map();
for (const result of commercial) {
  for (const [name, r] of Object.entries(result.categories)) {
    lost.set(name, (lost.get(name) ?? 0) + (r.max - r.points));
  }
}
for (const [name, points] of [...lost].sort((a, b) => b[1] - a[1])) {
  const perPage = commercial[0]?.categories[name]?.max ?? 0;
  const ceiling = commercial.length * perPage;
  const share = ceiling ? ((points / ceiling) * 100).toFixed(0) : '0';
  console.log(`  ${name.padEnd(20)} −${String(points).padStart(4)}  of ${ceiling} available  (${share}% lost)`);
}

console.log('\nCONTENT FINDINGS, by severity\n');
const findings = [];
for (const result of results) {
  for (const [name, r] of Object.entries(result.categories)) {
    for (const n of r.notes) findings.push({ ...n, url: result.url, category: name });
  }
}
findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
for (const severity of ['high', 'medium', 'low']) {
  const group = findings.filter((f) => f.severity === severity);
  if (!group.length) continue;
  console.log(`  ${severity.toUpperCase()} — ${group.length}`);
  for (const f of group.slice(0, 40)) {
    console.log(`    ${f.url}  [${f.category}]`);
    console.log(`      ${f.message}`);
    console.log(`      → ${f.fix}`);
  }
  if (group.length > 40) console.log(`    … +${group.length - 40} more`);
  console.log('');
}

console.log('TECHNICAL FINDINGS, by severity\n');
technical.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
for (const severity of ['high', 'medium', 'low']) {
  const group = technical.filter((f) => f.severity === severity);
  if (!group.length) continue;
  console.log(`  ${severity.toUpperCase()} — ${group.length}`);
  const byArea = new Map();
  for (const f of group) {
    if (!byArea.has(f.area)) byArea.set(f.area, []);
    byArea.get(f.area).push(f);
  }
  for (const [area, items] of byArea) {
    console.log(`    [${area}] ${items.length}`);
    for (const f of items.slice(0, 12)) console.log(`      ${f.message}`);
    if (items.length > 12) console.log(`      … +${items.length - 12} more`);
  }
  console.log('');
}

const failing = commercial.filter((r) => r.score < minScore);
console.log(
  `Scored ${results.length} indexable pages. ` +
    `${findings.filter((f) => f.severity === 'high').length} high content findings, ` +
    `${technical.filter((f) => f.severity === 'high').length} high technical findings.`
);
if (minScore && failing.length) {
  console.log(`\n${failing.length} page(s) under the ${minScore} threshold:`);
  for (const f of failing) console.log(`  ${f.score}  ${f.url}`);
  process.exit(1);
}
