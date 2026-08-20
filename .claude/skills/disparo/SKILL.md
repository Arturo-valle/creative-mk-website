---
name: disparo
description: Corre la matriz de capturas del taller (shoot) y el visual-diff contra baseline. Úsalo antes de juzgar cualquier cambio visual o para re-sellar el baseline tras un registro aprobado.
---

# /disparo — la matriz de capturas

1. Si `dist/` no existe o el repo cambió desde el último build: `npm run build`.
2. `node scripts/shoot.mjs` → escribe `shots/<sha>/` + `manifest.json`.
3. Si existe `shots/baseline/`: `node scripts/visual-diff.mjs --de=shots/baseline --a=shots/<sha>`
   — pasa `--esperadas=<globs>` con las páginas que el turno actual declaró tocar.
4. Reporta: nº de capturas, errores del manifiesto, diffs esperados e INESPERADOS.
5. Solo tras un registro aprobado (veredicto en docs/taller/registro.md):
   `node scripts/shoot.mjs --baseline` para re-sellar.

Reglas: jamás edites scripts/shoot.mjs ni visual-diff.mjs para «hacer pasar» un diff —
si crees que el instrumento miente, escribe en docs/taller/apelaciones.md y detente.
