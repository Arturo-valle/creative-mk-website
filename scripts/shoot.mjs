#!/usr/bin/env node
/**
 * shoot.mjs — la matriz determinista de capturas del taller.
 *
 * Sirve dist/ en un puerto efímero y captura páginas × viewports × modos:
 *   - modo "prm":    prefers-reduced-motion emulado → captura de página COMPLETA.
 *                    Es el contrato del plan §7.1: todo efecto asienta a su estado
 *                    final, así que la página entera es evidencia de layout.
 *   - modo "motion": sin PRM → captura del VIEWPORT tras js-arrival-done.
 *                    Evidencia de la coreografía de llegada, no del layout.
 *
 * Determinismo: networkidle + document.fonts.ready + (motion) js-arrival-done,
 * DPR fijo 1, viewports fijos. El preview que no composita no sirve de juez;
 * esto corre en Chromium real (lección documentada dos veces en este repo).
 *
 * Uso:
 *   node scripts/shoot.mjs                     # matriz por defecto → shots/<sha>/
 *   node scripts/shoot.mjs --paginas=/,/es/    # subconjunto
 *   node scripts/shoot.mjs --baseline          # además sella shots/baseline/
 *   node scripts/shoot.mjs --out=shots/x       # destino explícito
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.xml': 'application/xml', '.webmanifest': 'application/manifest+json',
};

const VIEWPORTS = [
  { name: 'm360',  width: 360,  height: 800 },
  { name: 't768',  width: 768,  height: 1024 },
  { name: 'd1280', width: 1280, height: 800 },
  { name: 'd1920', width: 1920, height: 1080 },
];

function args() {
  const out = {};
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) out[m[1]] = m[2] ?? true;
  }
  return out;
}

function resolveDistFile(urlPath) {
  const clean = urlPath.split('?')[0];
  let p = path.join(DIST, decodeURIComponent(clean));
  if (clean.endsWith('/')) p = path.join(p, 'index.html');
  if (!fs.existsSync(p) && fs.existsSync(p + '.html')) p = p + '.html';
  return p;
}

function serveDist() {
  const server = http.createServer((req, res) => {
    const file = resolveDistFile(req.url || '/');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404, { 'content-type': 'text/plain' }); res.end('404'); return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

function discoverDefaults() {
  const wanted = ['/', '/es/', '/work/', '/es/trabajo/', '/contact.html', '/404.html', '/lp/sitios-web/'];
  // un servicio EN y su hermano ES, descubiertos
  for (const [dir, prefix] of [['services', '/services/'], [path.join('es', 'servicios'), '/es/servicios/']]) {
    const base = path.join(DIST, dir);
    if (fs.existsSync(base)) {
      const first = fs.readdirSync(base, { withFileTypes: true })
        .filter(d => d.isDirectory() && fs.existsSync(path.join(base, d.name, 'index.html')))
        .map(d => d.name).sort()[0];
      if (first) wanted.push(`${prefix}${first}/`);
    }
  }
  return wanted.filter(p => fs.existsSync(resolveDistFile(p)));
}

function slugify(p) {
  if (p === '/') return 'home-en';
  if (p === '/es/') return 'home-es';
  return p.replace(/\.html$/, '').replace(/^\/|\/$/g, '').replace(/[\/]+/g, '_') || 'root';
}

async function settle(page, mode) {
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.evaluate(() => document.fonts ? document.fonts.ready : null).catch(() => {});
  if (mode === 'motion') {
    await page.waitForFunction(
      () => document.documentElement.classList.contains('js-arrival-done')
         || !document.documentElement.classList.contains('js-arrival'),
      null, { timeout: 5000 },
    ).catch(() => {});
    await page.waitForTimeout(400);
  } else {
    await page.waitForTimeout(300);
  }
}

async function main() {
  const a = args();
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('shoot: dist/ no existe o está vacío — corre `npm run build` primero.');
    process.exit(2);
  }
  let sha = 'sin-git';
  try { sha = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch {}
  const outDir = path.resolve(ROOT, a.out || path.join('shots', sha));
  fs.mkdirSync(outDir, { recursive: true });

  let pages = a.paginas ? String(a.paginas).split(',').map(s => s.trim()).filter(Boolean) : discoverDefaults();
  // Git Bash (MSYS) reescribe tokens tipo "/" como rutas de Windows: detecta y avisa.
  const mutiladas = pages.filter(p => /^[A-Za-z]:[\\/]/.test(p));
  if (mutiladas.length) {
    console.warn(`shoot: --paginas mutilada por MSYS (${mutiladas.join(' ')}) — se ignoran. Tip: MSYS_NO_PATHCONV=1 o usa npm run shoot.`);
    pages = pages.filter(p => !mutiladas.includes(p));
    if (!pages.length) pages = discoverDefaults();
  }
  pages = pages.map(p => (p.startsWith('/') ? p : '/' + p));
  const missing = pages.filter(p => !fs.existsSync(resolveDistFile(p)));
  if (missing.length) console.warn('shoot: no existen en dist y se omiten →', missing.join(' '));
  const live = pages.filter(p => !missing.includes(p));

  const server = await serveDist();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const manifest = { commit: sha, fecha: new Date().toISOString(), origin: 'dist/', capturas: [] };
  const t0 = Date.now();

  for (const mode of ['prm', 'motion']) {
    const ctx = await browser.newContext({
      deviceScaleFactor: 1,
      reducedMotion: mode === 'prm' ? 'reduce' : 'no-preference',
      viewport: VIEWPORTS[2],
    });
    const page = await ctx.newPage();
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const p of live) {
        // motion solo en los dos extremos de la matriz para no duplicar coste:
        if (mode === 'motion' && vp.name !== 'm360' && vp.name !== 'd1920') continue;
        const url = origin + p;
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await settle(page, mode);
          const file = `${slugify(p)}--${vp.name}--${mode}.png`;
          await page.screenshot({
            path: path.join(outDir, file),
            fullPage: mode === 'prm',
            animations: 'disabled',
          });
          const bytes = fs.statSync(path.join(outDir, file)).size;
          manifest.capturas.push({ file, pagina: p, viewport: vp.name, modo: mode, bytes });
          process.stdout.write(`  ✓ ${file}\n`);
        } catch (e) {
          manifest.capturas.push({ file: null, pagina: p, viewport: vp.name, modo: mode, error: String(e).slice(0, 200) });
          process.stdout.write(`  ✗ ${p} ${vp.name} ${mode}: ${String(e).slice(0, 120)}\n`);
        }
      }
    }
    await ctx.close();
  }
  await browser.close();
  server.close();

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const ok = manifest.capturas.filter(c => c.file).length;
  const bad = manifest.capturas.length - ok;
  console.log(`\nshoot: ${ok} capturas (${bad} errores) en ${((Date.now() - t0) / 1000).toFixed(1)}s → ${path.relative(ROOT, outDir)}`);

  if (a.baseline) {
    const base = path.join(ROOT, 'shots', 'baseline');
    fs.rmSync(base, { recursive: true, force: true });
    fs.mkdirSync(base, { recursive: true });
    for (const f of fs.readdirSync(outDir)) fs.copyFileSync(path.join(outDir, f), path.join(base, f));
    console.log(`shoot: baseline sellado → shots/baseline (${ok} capturas)`);
  }
  process.exit(bad > 0 && ok === 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
