#!/usr/bin/env node
/**
 * frame-cost.mjs — muestreo de coste de frame a DPR 1,5 (proxy).
 *
 * HONESTIDAD DEL INSTRUMENTO: esto muestrea deltas de requestAnimationFrame en
 * reposo y durante scroll sintético. Es un PROXY del método canónico del plan
 * (60 draws con readPixels como punto de sincronía dentro del contexto GL), que
 * necesita un hook de desarrollo dentro de js/terrain.js y llegará con el primer
 * turno de shader. Sirve para detectar regresiones groseras, no para firmar G4a/G4b.
 *
 * Uso: node scripts/frame-cost.mjs [--pagina=/] [--segundos=5]
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };

function serveDist() {
  const server = http.createServer((req, res) => {
    let f = path.join(DIST, decodeURIComponent((req.url || '/').split('?')[0]));
    if ((req.url || '/').split('?')[0].endsWith('/')) f = path.join(f, 'index.html');
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(ok => server.listen(0, '127.0.0.1', () => ok(server)));
}
function args() {
  const out = {};
  for (const a of process.argv.slice(2)) { const m = a.match(/^--([^=]+)(?:=(.*))?$/); if (m) out[m[1]] = m[2] ?? true; }
  return out;
}
const stats = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return { n: s.length, media: +(s.reduce((a, b) => a + b, 0) / s.length).toFixed(2), p95: +q(0.95).toFixed(2), largos: s.filter(x => x > 16.7).length };
};

async function main() {
  const a = args();
  const segundos = parseInt(a.segundos || '5', 10);
  let pagina = String(a.pagina || '/');
  // Git Bash (MSYS) reescribe "/" como ruta de Windows: detecta y corrige.
  if (/^[A-Za-z]:[\\/]/.test(pagina)) { console.warn(`frame-cost: --pagina mutilada por MSYS ("${pagina}") — usando "/". (Tip: MSYS_NO_PATHCONV=1)`); pagina = '/'; }
  if (!pagina.startsWith('/')) pagina = '/' + pagina;
  const server = await serveDist();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ args: ['--force-device-scale-factor=1.5'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
  await page.goto(origin + pagina, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  const muestreo = (ms) => page.evaluate((dur) => new Promise((ok) => {
    const deltas = []; let prev = performance.now();
    const fin = prev + dur;
    function tick(t) { deltas.push(t - prev); prev = t; if (t < fin) requestAnimationFrame(tick); else ok(deltas.slice(1)); }
    requestAnimationFrame(tick);
  }), ms);

  const reposo = await muestreo(segundos * 1000);
  const scrollP = muestreo(segundos * 1000);
  for (let i = 0; i < segundos * 4; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(250); }
  const scroll = await scrollP;
  await browser.close(); server.close();

  const r = { pagina, dpr: 1.5, reposo: stats(reposo), scroll: stats(scroll), metodo: 'rAF-proxy (no es el readPixels de G4a/G4b)' };
  console.log(JSON.stringify(r, null, 2));
  console.log(`\nframe-cost(proxy): reposo media ${r.reposo.media} ms (p95 ${r.reposo.p95}) · scroll media ${r.scroll.media} ms (p95 ${r.scroll.p95}) · frames >16,7 ms: ${r.reposo.largos}/${r.scroll.largos}`);
}
main().catch(e => { console.error(e); process.exit(1); });
