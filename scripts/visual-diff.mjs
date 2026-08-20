#!/usr/bin/env node
/**
 * visual-diff.mjs — compara dos juegos de capturas del shoot.
 *
 * Regla del taller: una página NO tocada por el turno debe dar diff ~0.
 * Las diferencias esperadas se declaran con --esperadas=<glob simple,glob simple>.
 *
 * Uso:
 *   node scripts/visual-diff.mjs --de=shots/baseline --a=shots/<sha>
 *   node scripts/visual-diff.mjs --de=shots/baseline --a=shots/<sha> --esperadas=home-*,work*
 *   [--umbral=0.5]   % de píxeles distintos tolerado por captura (defecto 0.5)
 *
 * Salida: shots/_diff/<nombre>.png por cada captura sobre umbral + resumen JSON.
 * Exit 0 = limpio (o solo diffs esperados) · Exit 1 = diffs NO esperados.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function args() {
  const out = {};
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) out[m[1]] = m[2] ?? true;
  }
  return out;
}
const globToRe = (g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');

function main() {
  const a = args();
  if (!a.de || !a.a) { console.error('uso: visual-diff --de=<dir> --a=<dir> [--esperadas=g1,g2] [--umbral=0.5]'); process.exit(2); }
  const dirA = path.resolve(ROOT, String(a.de));
  const dirB = path.resolve(ROOT, String(a.a));
  const umbral = parseFloat(a.umbral ?? '0.5');
  const esperadas = a.esperadas ? String(a.esperadas).split(',').map(s => globToRe(s.trim())) : [];
  const outDir = path.join(ROOT, 'shots', '_diff');
  fs.mkdirSync(outDir, { recursive: true });

  const setA = new Set(fs.readdirSync(dirA).filter(f => f.endsWith('.png')));
  const setB = new Set(fs.readdirSync(dirB).filter(f => f.endsWith('.png')));
  const comunes = [...setA].filter(f => setB.has(f)).sort();
  const soloA = [...setA].filter(f => !setB.has(f));
  const soloB = [...setB].filter(f => !setA.has(f));

  const resumen = { de: path.relative(ROOT, dirA), a: path.relative(ROOT, dirB), umbralPct: umbral,
    comparadas: comunes.length, soloEnBaseline: soloA, soloEnNueva: soloB, diffs: [] };
  let inesperados = 0;

  for (const f of comunes) {
    const pa = PNG.sync.read(fs.readFileSync(path.join(dirA, f)));
    const pb = PNG.sync.read(fs.readFileSync(path.join(dirB, f)));
    if (pa.width !== pb.width || pa.height !== pb.height) {
      const esperada = esperadas.some(re => re.test(f));
      resumen.diffs.push({ file: f, pct: null, nota: `tamaño distinto ${pa.width}x${pa.height} vs ${pb.width}x${pb.height}`, esperada });
      if (!esperada) inesperados++;
      continue;
    }
    const out = new PNG({ width: pa.width, height: pa.height });
    const n = pixelmatch(pa.data, pb.data, out.data, pa.width, pa.height, { threshold: 0.1 });
    const pct = (n / (pa.width * pa.height)) * 100;
    if (pct > umbral) {
      const esperada = esperadas.some(re => re.test(f));
      fs.writeFileSync(path.join(outDir, f), PNG.sync.write(out));
      resumen.diffs.push({ file: f, pct: +pct.toFixed(3), esperada });
      if (!esperada) inesperados++;
    }
  }

  fs.writeFileSync(path.join(outDir, 'resumen.json'), JSON.stringify(resumen, null, 2));
  for (const d of resumen.diffs) {
    console.log(`  ${d.esperada ? '≈ esperada' : '✗ INESPERADA'}  ${d.file}  ${d.pct != null ? d.pct + '%' : d.nota}`);
  }
  console.log(`\nvisual-diff: ${comunes.length} comparadas · ${resumen.diffs.length} sobre umbral · ${inesperados} inesperadas → shots/_diff/`);
  if (soloA.length || soloB.length) console.log(`  (solo-baseline: ${soloA.length} · solo-nueva: ${soloB.length} — revisa el manifiesto)`);
  process.exit(inesperados > 0 ? 1 : 0);
}
main();
