import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = join(root, '.contact-build');
const rootHtml = join(root, 'contact.html');
const targetAssets = join(root, 'contact-assets');

const htmlCandidates = [
  join(buildDir, 'contact-src', 'index.html'),
  join(buildDir, 'index.html')
];

const htmlPath = htmlCandidates.find((candidate) => existsSync(candidate));
if (!htmlPath) {
  throw new Error('Could not find the built contact HTML file.');
}

await mkdir(root, { recursive: true });
if (existsSync(targetAssets)) {
  await rm(targetAssets, { recursive: true, force: true });
}
await cp(join(buildDir, 'assets'), targetAssets, { recursive: true });

let html = await readFile(htmlPath, 'utf8');
const scriptMatch = html.match(/<script[^>]+src="(?:\.\.\/|\.\/)?assets\/([^"]+\.js)"[^>]*><\/script>/);
const styleMatch = html.match(/<link[^>]+rel="stylesheet"[^>]+href="(?:\.\.\/|\.\/)?assets\/([^"]+\.css)"[^>]*>/);

if (!scriptMatch || !styleMatch) {
  throw new Error('Could not find built contact JS/CSS assets to inline.');
}

/* The bundle ships as an external module, not inlined. It used to be a
   214 KB classic <script> at the top of <body>, blocking the first paint of
   the page every CTA on the site points at — while the identical file sat in
   contact-assets/ referenced by nothing. A module script defers by
   definition. */
const scriptSrc = '/contact-assets/' + scriptMatch[1];
const styles = await readFile(join(buildDir, 'assets', styleMatch[1]), 'utf8');

html = html
  .replace(styleMatch[0], () => `<style>\n${styles}\n</style>`)
  .replace(scriptMatch[0], '')
  .replace(/(["'])\.{0,2}\/?assets\//g, '$1./contact-assets/')
  .replace('</body>', () => `  <script type="module" src="${scriptSrc}"></script>
  </body>`)
  .replace(/^[ \t]+$/gm, '');

await writeFile(rootHtml, html, 'utf8');

console.log('Published standalone contact.html and contact-assets/.');
