---
name: turno
description: Ejecuta un ítem del plan con el muro completo — cajista en worktree, galgas, tres jueces, veredicto al registro. Argumento: el id del ítem (p. ej. fase2.item0).
---

# /turno <item> — de spec a veredicto

0. Lee docs/taller/cola.md: el ítem debe estar `pendiente` y su fase abierta; sus
   dependencias owner-gated resueltas. Si no, repórtalo y detente.
1. Extrae la spec del ítem de docs/awards-build-plan.md (lectura). Declara la
   SUPERFICIE AUTORIZADA (archivos) y las páginas afectadas. Marca `en-turno` en la cola.
2. **Composición**: lanza el agente `cajista` con `isolation: worktree`, pegándole la
   spec completa + superficie + (si es 2.ª vuelta) las refutaciones anteriores.
3. **Galgas**: en el worktree, `npm run verify` + `node scripts/shoot.mjs
   --paginas=<afectadas> --out=shots/turno-<item>`. Rojo → devuelve al cajista (cuenta
   como vuelta). Verde → `node scripts/judge-pack.mjs --item=<item>
   --antes=shots/baseline --despues=shots/turno-<item> --capturas=<globs>`.
4. **Tribunal** (en paralelo, cada juez ve SOLO el dossier):
   - `juez-registro` con la ruta del dossier
   - `juez-gusto` con dossiers/<item>/antes + despues
   - `juez-uso` operando el build del worktree (preview_start name:dist apuntado al
     dist del worktree, o sirviendo ese dist)
   - `inspector` solo si el ítem toca WebGL/materia.
5. **Veredicto**: 0 refutaciones → anota línea en docs/taller/registro.md, deja el
   worktree/branch listo para merge del dueño y marca `registrado`. Refutaciones →
   vuelta 2 con ellas pegadas al cajista. Segunda refutación → expediente en
   docs/taller/apelaciones.md, estado `refutado-2`, se detiene.

Leyes: máx. 2 vueltas · los números se agregan en código, no en agentes · el merge a
`next` y todo deploy son del dueño · jamás edites galgas ni constitución.
