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
| valve.contacto | **REGISTRADO — APROBADO en vuelta 2** (`28315a9`). Registro: cumple (0,87), sus 3 refutaciones cerradas. Gusto: lectura «diseñado», sus 3 refutaciones RETIRADAS («el gesto sobrevive al recorte que lo mataba»; «yo culpé a la sombra y el culpable era la esquina»). Uso: no convocado — turno de pintura CSS sin cambios de interacción; el orquestador verificó foco y tipografía a mano | 2 | `dossiers/valve.contacto-v2/` |

| fase1.caja-blanca | **[VISIBLE, alto]** El logo del hero de /contact pinta una CAJA BLANCA sólida sobre el papel: `filter:invert(1)` + `mix-blend-mode:multiply` dentro de `.contact-copy`, que es `position:sticky` y crea contexto de apilamiento, así que el multiply nunca alcanza el fondo. Verificado preexistente (está en el ANTES y en el DESPUÉS). Es el defecto más llamativo de la página | pendiente | 0 | — |
| fase1.oro-crudo | Dos restos de oro BRILLANTE hardcodeados como `rgba(232,200,64,…)`, invisibles a un grep de tokens: `.field input:focus` (halo de oro crudo sobre papel) y `.magnetic-submit::before` (alfa 0,72). El TOKEN BRIDGE afirma que nada en esa página puede ser oro brillante: o el comentario miente o son deuda | pendiente | 0 | — |
| fase1.pulse-bars | `.signal-lines i` con `pulse-bars 1.8s infinite`: PRM la mata, pero un pulso infinito por defecto no es one-shot | pendiente | 0 | — |

| fase1.foco-oro | **[del Juez de Registro, 20-ago]** El anillo de foco de los inputs de contacto es `rgba(232,200,64,.2)` — oro BRILLANTE sobre papel, donde direction.md §5.4.1 lo declara ilegal (1,36:1). Distinto del glow del submit, que vive sobre campo oscuro y sí es legal. La spec del turno afirmaba que el repaint «eliminó el resplandor dorado»: solo es cierto del panel | pendiente | 0 | — |

| fase1.rag-chips | **[del Juez de Gusto, v2]** Regresión de ritmo MEDIDA y de causa conocida: al cargar Inter de verdad los chips pasan de 114,2 a 117,9 px de media y Presupuesto rompe de 3 filas a 4 (d1280, EN y ES), con dos huérfanas. No es reversible sin deshacer el fix tipográfico. Territorio natural: `fase2.item0` (chips y voces) | pendiente | 0 | — |
| fase1.registro-canto | **[del Juez de Gusto, v2]** El canto izquierdo del pliego, ahora el vertical dominante, cae ~20 px fuera de la guía impresa que la propia página dibuja detrás. El desfase era latente; hacerlo visible lo delató. «O entra en registro o se separa un módulo entero» | pendiente | 0 | — |
| fase1.foco-dos-caras | **[del Juez de Gusto, v2]** El foco de contacto está documentado solo sobre papel: falta probarlo sobre el panel negro y sobre el botón negro. El contrato de dos caras (--gold-aged en papel / --gold en plancha) sigue sin acreditarse en esta página | pendiente | 0 | — |

| fase1.foco-invisible | **[CRÍTICO — hallazgo del orquestador, 20-ago]** Los campos de `/contact` **matan su foco nativo y no ponen nada en su lugar**. La regla `.field input:focus` matchea y declara `outline: none` + halo dorado + `border-color: var(--gold-dark)` + `translateY(-1px)`, pero en el computed solo sobrevive `outline: none`: el borde sigue en `rgba(20,18,14,.14)` y la sombra resuelve a `rgba(0,0,0,0) 0 0 0 0`. Medido con Tab real y con `:focus` forzado por CDP; `:focus-visible` = true y cero indicador. **Preexistente** (CSS idéntico antes y después del turno) y **axe no lo detecta**. Viola WCAG 2.4.7 en el paso de conversión. Los chips SÍ tienen foco correcto (`2px solid #7A5C12`), así que el arreglo es alinear los campos con ellos | pendiente | 0 | — |

## Fuera-de-octubre (no entran sin decisión del dueño contra la orden de cortes)

Tailwind muerto (borrar) · lámpara de inspección · formes tipeados · CMYK-halftone ·
WebGPU port · Resurvey · case plates cinemáticos (content-gated) · sonido.
