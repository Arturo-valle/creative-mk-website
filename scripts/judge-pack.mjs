#!/usr/bin/env node
/**
 * judge-pack.mjs — ensambla el dossier de evidencia de una entrega.
 *
 * El muro hecho herramienta: lo que no está en el dossier, el juez no lo conoce.
 * Contenido: extracto de spec (del plan, por fase), capturas antes/después,
 * números de las galgas, y un índice dossier.md.
 *
 * Uso:
 *   node scripts/judge-pack.mjs --item=fase2.item0 --antes=shots/baseline --despues=shots/<sha> \
 *        [--capturas=home-en*,work*] [--out=dossiers/fase2.item0-v1]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLAN = path.join(ROOT, 'docs', 'awards-build-plan.md');

function args() {
  const out = {};
  for (const a of process.argv.slice(2)) { const m = a.match(/^--([^=]+)(?:=(.*))?$/); if (m) out[m[1]] = m[2] ?? true; }
  return out;
}
const globToRe = (g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*'));

// fase2 → "## 3. Phase 2" (fase N vive bajo "Phase N" del plan)
function extractSpec(item) {
  const md = fs.readFileSync(PLAN, 'utf8');
  const fase = (item.match(/fase(\d+)/) || [])[1];
  if (!fase) return `(item «${item}» sin fase reconocible — pega la spec a mano)`;
  const re = new RegExp(`^##\\s+\\d+\\.\\s+Phase\\s+${fase}\\b[\\s\\S]*?(?=^##\\s+\\d+\\.|\\Z)`, 'm');
  const m = md.match(re);
  return m ? m[0].trim() : `(no se encontró "Phase ${fase}" en el plan)`;
}

function copyShots(fromDir, toDir, patterns) {
  if (!fs.existsSync(fromDir)) return [];
  fs.mkdirSync(toDir, { recursive: true });
  const res = patterns.length ? patterns.map(globToRe) : [/.*/];
  const files = fs.readdirSync(fromDir).filter(f => f.endsWith('.png') && res.some(r => r.test(f)));
  for (const f of files) fs.copyFileSync(path.join(fromDir, f), path.join(toDir, f));
  return files;
}

function main() {
  const a = args();
  if (!a.item || !a.despues) { console.error('uso: judge-pack --item=faseN.itemM --despues=<dir> [--antes=<dir>] [--capturas=g1,g2] [--out=dir]'); process.exit(2); }
  const item = String(a.item);
  const outDir = path.resolve(ROOT, String(a.out || path.join('dossiers', `${item}-v1`)));
  fs.mkdirSync(outDir, { recursive: true });
  const patterns = a.capturas ? String(a.capturas).split(',').map(s => s.trim()) : [];

  const antes = a.antes ? copyShots(path.resolve(ROOT, String(a.antes)), path.join(outDir, 'antes'), patterns) : [];
  const despues = copyShots(path.resolve(ROOT, String(a.despues)), path.join(outDir, 'despues'), patterns);

  // números de galgas: resumen del .audit.json si existe (solo agregados, no las 103 KB)
  let numeros = '(sin .audit.json — corre npm run build)';
  const auditPath = path.join(ROOT, '.audit.json');
  if (fs.existsSync(auditPath)) {
    try {
      const j = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
      numeros = JSON.stringify({ siteScore: j.siteScore ?? j.score ?? null, paginas: Array.isArray(j.pages) ? j.pages.length : null }, null, 2);
    } catch { numeros = '(audit.json ilegible)'; }
  }

  const dossier = `# Dossier — ${item}

Generado: ${new Date().toISOString()}
Regla: esto es TODO lo que un juez ve. Si falta evidencia aquí, la cláusula está sin evidenciar.

## Especificación (extracto del plan)

${extractSpec(item)}

## Evidencia

- Capturas ANTES: ${antes.length} en \`antes/\`
- Capturas DESPUÉS: ${despues.length} en \`despues/\`
- Números de galgas:

\`\`\`json
${numeros}
\`\`\`

## Criterios §7 del plan (el juez de registro los recorre uno a uno)

1. PRM asienta · 2. EN→ES→EN · 3. sin JS es contenido · 4. claim móvil = número móvil ·
5. presupuesto de frame · 6. presupuesto de bytes
`;
  fs.writeFileSync(path.join(outDir, 'dossier.md'), dossier);
  console.log(`judge-pack: dossier listo → ${path.relative(ROOT, outDir)} (antes:${antes.length} después:${despues.length})`);
}
main();
