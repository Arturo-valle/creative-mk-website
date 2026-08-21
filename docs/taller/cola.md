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
| fase1.axe | Puerta G1 («axe pass both grounds»): las 10 violaciones graves del 19-ago | **registrado y fusionado** (`e377e33`, verificado 20-ago: axe limpio, verify verde, sin regresión visual). Solo falta el deploy del dueño | 1 | `dossiers/fase1.axe-v1/` |
| fase1.hotfix-visual | Acta H3–H5 + H6b + hallazgos del Juez de Uso (19-ago): fantasma bilingüe del footer; **CTAs del hero recortados 43px a 360px** (medido: `.hero__actions` 383px en viewport 360; el h1 NO recorta — sustituye al «13px» de memoria); consent tapa el CTA del hero a 1280×800 y Aceptar/Rechazar caen en tab 94–96/97; consent tapa el FAB a 360; Esc del concierge suelta el foco a BODY (debe volver al FAB); hamburguesa 28×20 (<24px WCAG 2.5.8); 3 vídeos de la LP sin `poster`; hover del cuerpo del botón del acordeón muerto por especificidad (nota: fase2.item0 lo reordena de raíz); estado PRM del hero como mitigación de H1 | pendiente (SIGUIENTE tras el merge del piloto — misma superficie, no paralelizar) | 0 | — |
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
| valve.contacto | **EN TRIBUNAL (20-ago)** — entrega `d27b946`: Inter cargada de verdad, 18 radios al set cerrado, gesto «luz de taller». Galgas reproducidas por el orquestador: axe limpio, build 0, fuente compartida sin duplicar. — spec: docs/taller/spec-valve-contacto.md · unificación visual de la isla + hallazgos del Juez de Uso (19-ago): **[ALTO] la validación nativa enfoca un input requerido invisible de 1×1px con globo del navegador en inglés** (paso crítico del funnel — validación custom visible y localizada, o validar los mirrors); inputs a 15,68px (<16px → auto-zoom iOS); título EN sobre h1 ES; **no existe `/es/contacto/` (404 en producción verificado)** — todos los CTAs desde /es/ expulsan del español | válvula, prioridad subida | 0 | — |

| fase1.caja-blanca | **[VISIBLE, alto]** El logo del hero de /contact pinta una CAJA BLANCA sólida sobre el papel: `filter:invert(1)` + `mix-blend-mode:multiply` dentro de `.contact-copy`, que es `position:sticky` y crea contexto de apilamiento, así que el multiply nunca alcanza el fondo. Verificado preexistente (está en el ANTES y en el DESPUÉS). Es el defecto más llamativo de la página | pendiente | 0 | — |
| fase1.oro-crudo | Dos restos de oro BRILLANTE hardcodeados como `rgba(232,200,64,…)`, invisibles a un grep de tokens: `.field input:focus` (halo de oro crudo sobre papel) y `.magnetic-submit::before` (alfa 0,72). El TOKEN BRIDGE afirma que nada en esa página puede ser oro brillante: o el comentario miente o son deuda | pendiente | 0 | — |
| fase1.pulse-bars | `.signal-lines i` con `pulse-bars 1.8s infinite`: PRM la mata, pero un pulso infinito por defecto no es one-shot | pendiente | 0 | — |

## Fuera-de-octubre (no entran sin decisión del dueño contra la orden de cortes)

Tailwind muerto (borrar) · lámpara de inspección · formes tipeados · CMYK-halftone ·
WebGPU port · Resurvey · case plates cinemáticos (content-gated) · sonido.
