import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');

/** Source directories that must never reach the deployable artifact. */
const forbiddenTopLevelEntries = new Set([
  'contact-src', 'scripts', 'node_modules', 'src', 'package.json',
  'package-lock.json', 'vite.config.js', 'tailwind.config.js',
  'postcss.config.js', 'eleventy.config.mjs'
]);

/* ---------- content-hash fingerprinting ----------
   The zone caches /js/* and /css/* for four hours under unchanging URLs, so
   every deploy used to open a mixed-version window — on 2026-08-10 a shader
   hotfix sat deployed but unreachable behind a stale cached file. Hashed
   filenames make each build's assets new URLs: the moment index.html
   refreshes (five minutes), the whole chain is a cache miss, and no deploy
   ever depends on a dashboard purge again.

   Originals are kept beside the hashed copies on purpose: HTML cached for up
   to five minutes still references the old names, and check-site's i18n scan
   reads dist/js/i18n.js by its plain name. Scope is the first-party layer;
   the vendored ogl module tree is immutable and stays un-hashed (rewriting
   cross-module ESM imports is a bundler's job, not this script's). */

const hashed = new Map(); // url path without leading slash -> hashed url path

async function fingerprintFile(relPath, rewrite) {
  const full = join(distDir, relPath);
  if (!existsSync(full)) return;
  let content = await readFile(full);
  if (rewrite) content = Buffer.from(rewrite(content.toString('utf8')), 'utf8');
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 10);
  const ext = extname(relPath);
  const hashedRel = relPath.slice(0, -ext.length) + '.' + hash + ext;
  await writeFile(join(distDir, hashedRel), content);
  if (rewrite) await writeFile(full, content); // keep the original coherent too
  hashed.set(relPath.split('\\').join('/'), hashedRel.split('\\').join('/'));
}

/** Replace every reference to a fingerprinted path (relative or absolute,
    with or without a ?v= suffix) with its hashed URL. */
function rewriteRefs(text) {
  let out = text;
  for (const [orig, target] of hashed) {
    const pattern = new RegExp(
      '(["\'\\(=])/?' + orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(\\?v=[^"\'\\)\\s>]*)?',
      'g'
    );
    out = out.replace(pattern, (match, lead) => lead + '/' + target);
  }
  return out;
}

/** A name this pass has already produced. Hashing one twice is how the
    phantom `terrain.HASH.HASH.js` files appeared, and how a second run over a
    built dist/ used to rewrite every reference to a doubled name. */
const isHashed = (name) => /\.[0-9a-f]{10}\.[^.]+$/.test(name);

/* Refuse to run on output that has already been fingerprinted. The pass is
   not idempotent by nature — it must only ever see a fresh copy-assets tree. */
for (const dir of ['css', 'js']) {
  for (const entry of await readdir(join(distDir, dir))) {
    if (isHashed(entry)) {
      throw new Error(
        `dist/${dir}/${entry} is already fingerprinted — run copy-assets first; ` +
        'this pass must never run twice over the same output.'
      );
    }
  }
}

/* Directory listings are snapshotted BEFORE any hashing, so the loops below
   iterate the originals and never discover their own output. */
const cssEntries = await readdir(join(distDir, 'css'));
const jsEntries = await readdir(join(distDir, 'js'));
const vendorEntries = await readdir(join(distDir, 'js/vendor'));
const lpJsEntries = existsSync(join(distDir, 'js/lp'))
  ? await readdir(join(distDir, 'js/lp'))
  : [];

// Leaves first: fonts, then the lazy modules, then everything the HTML loads.
await fingerprintFile('css/fonts/inter-latin-variable.woff2');
await fingerprintFile('js/terrain.js');
await fingerprintFile('js/terrain-lite.js');
for (const js of lpJsEntries) {
  if (js.endsWith('.js')) await fingerprintFile('js/lp/' + js, rewriteRefs);
}

/* CSS references its fonts relative to its own directory ('fonts/…'), which
   the absolute-path rewriter cannot see; swap those by basename first. */
const rewriteCss = (text) => {
  let out = rewriteRefs(text);
  for (const [orig, target] of hashed) {
    if (orig.startsWith('css/fonts/')) {
      out = out.split(orig.slice(4)).join(target.slice(4));
    }
  }
  return out;
};
for (const css of cssEntries) {
  if (css.endsWith('.css')) await fingerprintFile('css/' + css, rewriteCss);
}
for (const js of jsEntries) {
  if (js.endsWith('.js')) await fingerprintFile('js/' + js, rewriteRefs);
}
/* The vendored ogl tree is deliberately excluded: its modules import each
   other by relative path, and rewriting an ESM import graph is a bundler's
   job. Only the flat UMD vendors are hashed. */
for (const vendor of vendorEntries) {
  if (vendor.endsWith('.js')) await fingerprintFile('js/vendor/' + vendor);
}

async function rewriteHtmlIn(dir) {
  for (const entry of await readdir(join(distDir, dir || '.'), { withFileTypes: true })) {
    const rel = dir ? dir + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      /* admin/ is served no-store and manages its own assets. lp/ is NOT
         skipped: the paid landing page links the shared css/js, so leaving it
         unrewritten made every ad-traffic visit depend on a cache purge. */
      if (['admin', 'contact-assets'].includes(entry.name)) continue;
      await rewriteHtmlIn(rel);
    } else if (entry.name.endsWith('.html')) {
      const full = join(distDir, rel);
      await writeFile(full, rewriteRefs(await readFile(full, 'utf8')));
    }
  }
}
await rewriteHtmlIn('');

console.log(`Fingerprinted ${hashed.size} assets.`);

const distEntries = await readdir(distDir);
for (const entry of distEntries) {
  if (forbiddenTopLevelEntries.has(entry)) {
    throw new Error(`Forbidden entry leaked into dist: ${entry}`);
  }
}

console.log(`Prepared Cloudflare Pages output in ${distDir}.`);
