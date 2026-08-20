# Cola del taller

El ORDEN viene de `docs/awards-build-plan.md`; esta cola solo registra estado.
Estados: `pendiente` · `bloqueado(razón)` · `en-turno` · `refutado-1` · `registrado`.
Regla: un ítem refutado dos veces no compra tercera vuelta — va a `apelaciones.md`
con expediente y lo decide el dueño.

## Owner-gated (ningún agente puede; bloquean lo de abajo)

| Qué | Estado | Nota |
|---|---|---|
| Deploy del fix de consentimiento + purga | **URGENTE** | El píxel corre sin consent en producción (verificado 2026-08-19, `check-live` lo vigila) |
| Rotar los 2 tokens de Cloudflare | pendiente | Pegados en transcripts (auditoría agosto) |
| Compra de Fit (§2.1, 50 USD) | **bloqueante** | Confirmar ñ á é í ó ú ü ¿ ¡ en Glyphs; sin esto no hay voz display |
| Android clase Moto-G (§8) | antes del 8-sep | Sin número móvil no hay claim móvil |
| Decisión analytics (§10) | antes del 15-oct | Ejecutar o declinar explícitamente en el deploy del 26-oct |
| Contradicción editorial H7 (acta 19-ago) | pendiente | /trabajo jura «sin muestras de capacidad»; la LP las vende — decidir copy o LP |

**Registro vigente: 5,79** (acta 2026-08-19; reemplaza el 5,3 del 10-ago). Techo sin
casos reales ≈7,3 — los dos casos no son opcionales para la banda 7,65.
**Triaje H6: CERRADO (19-ago)** — artefacto de instrumento, no bug: producción sirve
`image/avif` correcto; fallaban el shoot sin scroll-prime (arreglado, v2) y el mime del
http-server local (reemplazado por `scripts/serve.mjs`). Baseline re-sellado.

## Turnos

| Ítem | Spec | Estado | Vueltas | Dossier |
|---|---|---|---|---|
| fase1.axe | Puerta G1 («axe pass both grounds»): 10 violaciones graves medidas 2026-08-19 — color-contrast en /, /es/, /work/, /es/trabajo/; link-in-text-block; nested-interactive ×6 en home; label crítico en contact. Detalle: docs/taller/axe-ultimo.json | en-turno (piloto) | 0 | — |
| fase1.hotfix-visual | Acta 2026-08-19 H3–H5 + H6b: fantasma bilingüe del footer colisiona; hero móvil corta palabras a 360px; banner de consent tapa contenido (360px y también sobre el hero desktop de la LP); **3 vídeos de la LP sin `poster`** (caja negra en estado asentado/PRM); estado asentado PRM del hero home como mitigación de H1 hasta fase2.item1 | pendiente | 0 | — |
| fase2.item0 | Plan §3.0 — tres voces tipográficas + muerte de glassmorphism/chips/sombras | pendiente | 0 | — |
| fase2.item1 | §3.1 — coreografía de llegada (H1 asienta, nav se escribe, cruz estampa) | pendiente | 0 | — |
| fase2.item2 | §3.2 — scribe-lines con `view()` one-shot | pendiente | 0 | — |
| fase2.item3 | §3.3 — cifras en registro (tinta + fantasma, caps 4px/400ms) | pendiente | 0 | — |
| fase2.item4 | §3.4 — ledger maquinado + guilloche (gate: impresión 1:1) | pendiente | 0 | — |
| fase2.item5 | §3.5 — re-autoría del scramble (diacríticos, sin monospace) | pendiente | 0 | — |
| fase2.item6 | §3.6 — press-cycle loader (cut #2) | pendiente | 0 | — |
| fase2.item7 | §3.7 — borrado del cursor (lista completa en spec) | pendiente | 0 | — |
| fase3.teatro | §4 — In Register (≤1,3s, timeboxed, cut #1) | bloqueado(fase2) | 0 | — |
| fase4.s1–s4 | §5 — Pull a Proof por semanas; G4a 11-oct decide | bloqueado(fase3) | 0 | — |
| valve.contacto | §2.3 — unificación visual de la isla de contacto | válvula (tardes sueltas) | 0 | — |

## Fuera-de-octubre (no entran sin decisión del dueño contra la orden de cortes)

Tailwind muerto (borrar) · lámpara de inspección · formes tipeados · CMYK-halftone ·
WebGPU port · Resurvey · case plates cinemáticos (content-gated) · sonido.
