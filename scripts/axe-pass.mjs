#!/usr/bin/env node
/**
 * axe-pass.mjs — axe-core sobre dist/ servido en local.
 * Puerta de la Capa 2 de la auditoría holística: 0 critical / 0 serious o falla.
 * axe atrapa ~57 % — el Juez de Uso cubre a mano lo que esto no ve.
 *
 * Uso: node scripts/axe-pass.mjs [--paginas=/,/es/] [--informe=docs/taller/axe.json]
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.ico': 'image/x-icon' };

function args() {
  const out = {};
  for (const a of process.argv.slice(2)) { const m = a.match(/^--([^=]+)(?:=(.*))?$/); if (m) out[m[1]] = m[2] ?? true; }
  return out;
}
function resolveDistFile(urlPath) {
  const clean = urlPath.split('?')[0];
  let p = path.join(DIST, decodeURIComponent(clean));
  if (clean.endsWith('/')) p = path.join(p, 'index.html');
  return p;
}
function serveDist() {
  const server = http.createServer((req, res) => {
    const file = resolveDistFile(req.url || '/');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('404'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

async function main() {
  const a = args();
  let pages = a.paginas ? String(a.paginas).split(',').map(s => s.trim()) :
    ['/', '/es/', '/work/', '/es/trabajo/', '/contact.html', '/lp/sitios-web/'].filter(p => fs.existsSync(resolveDistFile(p)));
  pages = pages.filter(p => !/^[A-Za-z]:[\\/]/.test(p)).map(p => (p.startsWith('/') ? p : '/' + p));
  if (!pages.length) { console.error('axe-pass: --paginas quedó vacía (¿MSYS reescribió las rutas? usa MSYS_NO_PATHCONV=1)'); process.exit(2); }
  const server = await serveDist();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext();   // @axe-core/playwright exige contexto explícito
  const page = await ctx.newPage();
  const informe = { fecha: new Date().toISOString(), paginas: {} };
  let graves = 0;

  for (const p of pages) {
    await page.goto(origin + p, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(600);
    const res = await new AxeBuilder({ page }).analyze();
    const v = res.violations.map(x => ({ id: x.id, impact: x.impact, nodos: x.nodes.length, ayuda: x.help }));
    const cs = v.filter(x => x.impact === 'critical' || x.impact === 'serious');
    graves += cs.length;
    informe.paginas[p] = { violaciones: v, gravesCount: cs.length };
    console.log(`  ${cs.length ? '✗' : '✓'} ${p}  (${v.length} violaciones, ${cs.length} graves)`);
    for (const x of cs) console.log(`      [${x.impact}] ${x.id} ×${x.nodos} — ${x.ayuda}`);
  }
  await ctx.close(); await browser.close(); server.close();
  const dest = path.resolve(ROOT, String(a.informe || 'docs/taller/axe-ultimo.json'));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(informe, null, 2));
  console.log(`\naxe-pass: ${graves === 0 ? 'LIMPIO (0 critical/serious)' : graves + ' violaciones graves'} → ${path.relative(ROOT, dest)}`);
  process.exit(graves ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
