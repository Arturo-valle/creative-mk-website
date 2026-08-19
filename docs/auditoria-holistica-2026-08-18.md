# Auditoría holística — las doce aristas

**Fecha:** 2026-08-18 · **Rama:** `next` @ `6f7d236` · **Informe diseñado:** https://claude.ai/code/artifact/b4e46471-7513-4150-9bc9-92c773e46859

Investigación de cómo auditar creativemk.net en todas sus aristas: qué instrumento
cubre ya cada dimensión, cuáles están desnudas, y el plan de instrumentación hasta
la submission del 27 de octubre. Dos agentes de exploración recorrieron el
repositorio completo; los estándares externos (CWV, Awwwards, WCAG 2.2) se
contrastaron contra fuentes vigentes.

La tesis: **el sitio tiene uno de los sistemas de auto-auditoría de contenido más
serios que puede tener un estudio — y cero instrumentos en las dimensiones que
pesan el 70% del criterio del jurado (Design 40 + Usability 30) y en todo lo que
toca dinero y riesgo.**

## El libro mayor

| Nº | Arista | Estado | Instrumento hoy | Hueco principal |
|----|--------|--------|-----------------|-----------------|
| 01 | Contenido editorial | en registro | `audit.mjs` · 87.7/100 | sin histórico versionado → **cerrado 2026-08-18** (`audit-history.csv`) |
| 02 | SEO on-page y técnico | en registro | `audit.mjs` + `check-site.mjs` | enlaces externos jamás verificados |
| 03 | Bilingüe / i18n | en registro | 3 puertas + 16 fixtures | `/terms/` sin hermano ES (owner-gated) |
| 04 | Peso y presupuesto | en registro | `check-site.mjs` (bytes) | dist > 25 MB por el vídeo; solo bytes, no tiempos |
| 05 | Datos estructurados | en registro | `check-site.mjs` §8 | — |
| 06 | Craft / jurado Awwwards | prueba única | panel de 8 agentes, 1 vez | el 5.3 es del 10-ago, **caducado** — re-puntuar antes de asumir |
| 07 | Accesibilidad | sin instrumento | solo `alt` + PRM | contraste jamás computado → **puerta `contrast` añadida 2026-08-18** |
| 08 | Rendimiento real (CWV) | sin instrumento | — | LCP/INP/CLS jamás medidos |
| 09 | Seguridad y supply chain | sin instrumento | — | tokens sin rotar; CSP sin validar → **puertas `csp` + `audit:deps` añadidas 2026-08-18** |
| 10 | Medición y analítica | sin instrumento | pipeline first-party solo en LP | embudo sin denominador; `/contact` ciego |
| 11 | Privacidad y legal | sin instrumento | sentinel runtime (parcial) | `/privacy/` contradice el código |
| 12 | UX medida y operación | sin instrumento | — | 30% del score sin medidor; sin CI; deploy drift |

Umbrales de referencia (verificados 2026-08-18): CWV en p75 — LCP < 2.5 s,
INP < 200 ms, CLS < 0.1 (INP es métrica de campo; en lab el proxy es TBT).
Awwwards: Design 40 / Usability 30 / Creativity 20 / Content 10, banda de
entrada ~7.65. WCAG 2.2 AA: 4.5:1 texto, 3:1 UI (SC 1.4.11), target 24 px
(SC 2.5.8). axe-core atrapa ~57% de los problemas; el pase manual no es opcional.

## Hallazgos confirmados durante la investigación

1. **[CRÍTICO] Promesa de privacidad falsa en producción.** `src/privacy/index.html:45`
   afirma "No advertising pixels run on this site" mientras esa misma página carga
   `js/meta-pixel.js` (39 de 43 páginas lo cargan), que escribe `_fbp` sin
   consentimiento. No hay banner en ninguna página. → decisión de dueño, ver abajo.
2. **[CRÍTICO] Dos tokens de Cloudflare sin rotar**, pegados en transcripts de chat.
   → rotar hoy; es la acción de mejor ratio urgencia/esfuerzo del documento.
3. **[CRÍTICO] Medición rota en el punto de conversión.** `/contact` no carga el
   pixel; `window.creativeMkTrackLead` solo se define en `js/lp/main.js:376`, así
   que el evento Lead es imposible en el sitio principal. El beacon `page-view`
   solo existe en la LP: el embudo tiene numerador (leads en D1) sin denominador.
4. **[MEDIO] Worker expuesto en `workers.dev`** sin las cabeceras de `_headers`,
   con Turnstile cableado pero apagado (`TURNSTILE_REQUIRED: "false"`) y rate
   limiting comentado — y es el fallback explícito del JS.
5. **[MEDIO] Caché incoherente con el fingerprint** → **cerrado 2026-08-18**:
   `fingerprint.mjs` ahora emite reglas `immutable` por archivo hasheado.
6. **[MEDIO] dist/ 26 MB sobre presupuesto de 25** — 17 MB en 6 MP4 de héroe de
   los que cada visita usa 2; más 25 MB de PNG fuente versionados en `images/_source/`.
7. **[MEDIO] CSP con permisos muertos** → **cerrado 2026-08-18**: Google Fonts y
   cloudflareinsights eliminados de la CSP; la puerta `csp` impide la reincidencia.
   `'unsafe-inline'` en script-src queda pendiente (el bootstrap inline lo necesita;
   salida limpia = nonces o hashes, no urgente).
8. **[MENOR] Consent hardcodeado a `true`** en newsletter (`js/main.js:257`) y
   concierge (`js/ai-concierge.js:567`).

## Lo instrumentado hoy (2026-08-18)

- **Puerta `contrast` en `check-site.mjs` (§10):** recomputa los 12 pares de
  contraste que `variables.css` publica en sus comentarios (el set cerrado los
  hace computables) y falla el build si un ratio cae bajo el suelo WCAG de su rol
  o si el número publicado deja de coincidir con el medido — el contrato de
  `measure-bilingual` aplicado al color.
- **Puerta `csp` en `check-site.mjs` (§11):** valida en ambas direcciones que la
  CSP de `_headers` coincide con lo que las páginas construidas realmente cargan.
  `challenges.cloudflare.com` está en la lista dormida documentada (Turnstile
  espera solo la site key).
- **CSP depurada en `_headers`:** fuera `fonts.googleapis.com`, `fonts.gstatic.com`
  y `static.cloudflareinsights.com`.
- **`fingerprint.mjs` emite reglas de caché por archivo:** los nombres hasheados
  llevan `max-age=31536000, immutable`; los originales conservan la hora corta
  porque el HTML cacheado ≤5 min aún los referencia. La última regla que coincide
  gana; el tope de la plataforma son 100 reglas y este paso emite ~30.
- **`audit:deps` en `verify`:** `npm audit --audit-level=high`. Al instalarlo se
  corrigieron 14 de 15 vulnerabilidades (todas de la cadena de build, nada que se
  sirva al navegador); queda 1 low en esbuild (solo dev-server, fix es major).
  Nota: este paso necesita red — es el único de `verify` que la usa, y por eso va
  al final de la cadena.
- **`audit-history.mjs` en el build:** una línea por build en
  `docs/audit-history.csv` (fecha, commit, siteScore, páginas, findings por
  severidad), deduplicada. La serie temporal que `.audit.json` gitignored nunca dio.

## Plan de instrumentación restante

- **Capa 0 — riesgo (esta semana):** rotar los dos tokens CF · decisión
  pixel↔privacy · encender Turnstile · resolver el flanco `workers.dev`.
- **Capa 2 — navegador (semanas 2–3):** Playwright + axe-core sobre `dist/`
  servido en local (0 critical/serious) · Lighthouse CI con budgets versionados
  (LCP ≤ 2.5 s, TBT ≤ 200 ms, CLS ≤ 0.1) en 5 páginas · ~6 smoke tests ·
  GitHub Actions corriendo `verify` en cada push (el deploy sigue manual; la
  verificación no) · **re-puntuar el panel de jurado de 8 agentes** antes de
  Make-Ready.
- **Capa 3 — campo (semanas 3–4):** beacon `page-view` en todo el sitio + tipo
  `vitals` en el Worker (web-vitals → D1: RUM first-party sin vendors) ·
  `creativeMkTrackLead` global coherente con la decisión legal · pase de
  dispositivo real (Moto G, gates G4a/G4b) · `check-live.mjs` (colofón vivo vs
  `dist/`, el detector del deploy drift que ya ocurrió) · rellenar las 7 casillas
  de §8 de awards-build-plan.md antes del 15-oct.
- **Continuo:** panel + Lighthouse + axe en cada gate (G2/G3/G4) · score de
  registro el 20-oct antes de la submission del 27-oct ($65 solo si ≥ 7.0) ·
  enlaces externos semanal (script con red, fuera de `verify`).

## Decisiones que solo el dueño puede tomar

1. **Pixel ↔ `/privacy/`** (bloqueante para medición de terceros): (a) quitar el
   pixel hasta tener consentimiento — la promesa publicada vuelve a ser verdad
   hoy; o (b) mantenerlo con banner y aviso reescrito — necesario si la campaña
   de la LP escala.
2. **Rotar los dos tokens de Cloudflare.**
3. **Turnstile:** crear la site key y poner `TURNSTILE_REQUIRED=true`.
4. **`workers.dev`:** apagar `workers_dev` (y quitar el fallback del JS) o
   replicar las cabeceras en el Worker.
5. **Vídeo:** recortar los 17 MB o subir el presupuesto de dist con justificación
   escrita.

## Guardarraíles

No reconstruir el motor de contenido (owner-gated, no instrumento). No añadir
software de funnel ni analytics de terceros — todo hueco de medición se cierra
extendiendo el pipeline first-party existente. No tocar umbrales del scorer para
subir el número (las 4 reversiones documentadas son el precedente). No asumir el
5.3 ni el 87.2: los valores de registro son 87.7 vivo y un score de jurado
pendiente de re-medición.
