#!/usr/bin/env node
/**
 * check-live.mjs — el detector de deriva repo↔producción (el drift ya ocurrió dos veces).
 *
 * Compara, por página: los assets fingerprinteados que referencia el HTML vivo
 * contra los que referencia el HTML de dist/, y señales clave (consent.js,
 * meta-pixel, cursor). No despliega ni purga nada: solo informa.
 *
 * Uso: node scripts/check-live.mjs [--origen=https://creativemk.net] [--paginas=/,/es/]
 * Exit 0 = paridad · Exit 2 = deriva detectada (informativo, no rompe builds).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

function args() {
  const out = {};
  for (const a of process.argv.slice(2)) { const m = a.match(/^--([^=]+)(?:=(.*))?$/); if (m) out[m[1]] = m[2] ?? true; }
  return out;
}
const ASSET_RE = /(?:href|src)="\/((?:css|js)\/[^"]+?\.[0-9a-f]{8,12}\.(?:css|js))"/g;
const SIGNALS = [
  ['consent.js', /js\/consent(?:\.[0-9a-f]+)?\.js/],
  ['meta-pixel', /js\/meta-pixel(?:\.[0-9a-f]+)?\.js|connect\.facebook\.net/],
  ['cursor.js', /js\/cursor(?:\.[0-9a-f]+)?\.js/],
];

function extract(html) {
  const assets = new Set();
  let m; while ((m = ASSET_RE.exec(html))) assets.add(m[1]);
  const señales = Object.fromEntries(SIGNALS.map(([n, re]) => [n, re.test(html)]));
  return { assets, señales };
}
function localHtml(p) {
  let f = path.join(DIST, p);
  if (p.endsWith('/')) f = path.join(f, 'index.html');
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
}

async function main() {
  const a = args();
  const origen = String(a.origen || 'https://creativemk.net').replace(/\/$/, '');
  const pages = a.paginas ? String(a.paginas).split(',') : ['/', '/es/', '/work/'];
  let deriva = false;
  console.log(`check-live: ${origen}  vs  dist/ local\n`);

  for (const p of pages) {
    const local = localHtml(p);
    if (!local) { console.log(`  ? ${p} — no existe en dist/ (¿build?)`); continue; }
    let vivo;
    try {
      const r = await fetch(origen + p, { headers: { 'user-agent': 'check-live/1.0' }, redirect: 'follow' });
      if (!r.ok) { console.log(`  ✗ ${p} — producción devuelve ${r.status}`); deriva = true; continue; }
      vivo = await r.text();
    } catch (e) { console.log(`  ? ${p} — sin red o error: ${String(e).slice(0, 80)}`); continue; }

    const L = extract(local), V = extract(vivo);
    const soloLocal = [...L.assets].filter(x => !V.assets.has(x));
    const soloVivo = [...V.assets].filter(x => !L.assets.has(x));
    const señalesDiff = SIGNALS.map(([n]) => n).filter(n => L.señales[n] !== V.señales[n]);
    const igual = !soloLocal.length && !soloVivo.length && !señalesDiff.length;
    if (!igual) deriva = true;

    console.log(`  ${igual ? '✓ paridad' : '✗ DERIVA'}  ${p}`);
    for (const s of señalesDiff) console.log(`      señal «${s}»: dist=${L.señales[s]} · vivo=${V.señales[s]}`);
    if (soloLocal.length) console.log(`      pendiente de publicar: ${soloLocal.slice(0, 6).join(', ')}${soloLocal.length > 6 ? '…' : ''}`);
    if (soloVivo.length) console.log(`      solo en producción:    ${soloVivo.slice(0, 6).join(', ')}${soloVivo.length > 6 ? '…' : ''}`);
  }

  console.log(`\ncheck-live: ${deriva ? 'DERIVA DETECTADA — producción ≠ dist/. El deploy es del dueño: whoami → deploy → purga.' : 'producción en paridad con dist/.'}`);
  process.exit(deriva ? 2 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
