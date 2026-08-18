# Plan de implementación — Landing `/lp/sitios-web/` v2

Escrito 2026-08-17, contra el árbol de trabajo en `next` (limpio). Ejecuta el
blueprint `research_funnel_landing/blueprint_landing_2026-08-17.md`; este
documento es el **cómo**, aquel es el **porqué**. Cada afirmación de código de
este plan fue verificada hoy contra el archivo citado, no heredada del dossier.

Restricciones vinculantes (de `docs/direction.md` y memoria de sesión):

- Deploy manual: `npx wrangler whoami` → `npm run verify` → `npx wrangler pages
  deploy dist --project-name=creative-mk-website --branch=main` → purga de caché
  de zona en el dashboard. **Nunca** pedir una URL de producción antes del
  deploy: el TTL de 4h envenena la caché con la versión vieja.
- Vanilla + GSAP; sin frameworks nuevos; sin CDNs (CSP `script-src 'self'`).
- Cambios visuales se verifican en el Chrome real del usuario
  (claude-in-chrome), no en el Browser pane, que no compone WebGL/animación.
- Toda pasada termina en `npm run verify` en verde antes de desplegar. Las
  puertas i18n/bilingüe **no** cubren `lp/` (verificado: ni
  `test-i18n-gate.mjs` ni `measure-bilingual.mjs` lo mencionan), así que los
  cambios de esta LP no pueden romperlas; `copy-assets.mjs:13` copia `lp/`,
  `fingerprint.mjs:83-92` huella `js/lp/*.js` y reescribe refs dentro de `lp/`.

Decisiones que solo Arturo puede tomar (bloquean tareas marcadas ⚑):

| # | Decisión | Bloquea | Default propuesto |
|---|---|---|---|
| D1 | H1 definitivo (opciones A/B/C del blueprint §2) | F3.T9 | Opción A (resultado + plazo) |
| D2 | Cifras "desde" por tipo de proyecto | F3.T10 | Sesión de 1h con las bandas `BUDGETS` y los anclajes de mercado del dossier |
| D3 | Analítica de terceros (píxel Meta con ID real y/o Cloudflare Web Analytics) | F2.T6 | Ambos; la CSP ya permite los dos dominios (`_headers:6`) |
| D4 | Número de WhatsApp Business | F3.T11 | — |
| D5 | Divergencia `/privacidad/` vs `/privacy/` | nada de este plan (la LP enlaza `/privacidad/` y no se toca) | pendiente legal, fuera de alcance |

---

## Fase 0 — Desplegar el build actual (hoy, 15 min)

**Por qué primero:** la portada en vivo es de un build viejo;
`https://creativemk.net/es/` devuelve 404 y el hreflang publicado es anterior.
Es exactamente el modo de fallo documentado del proyecto (direct upload: los
commits no publican nada).

Pasos:

1. `npx wrangler whoami` — confirmar la cuenta `2a432f7e8d56266c9dd713199ecf5b47`.
   Ojo con el `CLOUDFLARE_API_TOKEN` ambiental del shell (advertencia en
   `docs/direction.md`): si `whoami` muestra otra identidad, limpiar la variable
   antes de seguir.
2. `npm run verify` — build completo + gates. No desplegar con verify en rojo.
3. `npx wrangler pages deploy dist --project-name=creative-mk-website --branch=main`
4. Purga de caché de la zona `creativemk.net` (dashboard → Caching → Purge Everything).
5. **Solo después de la purga**, comprobar: `/es/` responde 200, la portada trae
   el hreflang nuevo, `/lp/sitios-web/` sigue íntegra.

**Hecho cuando:** `/es/` da 200 en producción y el HTML publicado coincide con
`dist/`.

---

## Fase 1 — Un solo pase sobre el HTML existente (T1-T5, ~medio día, un deploy)

Cinco arreglos quirúrgicos a `lp/sitios-web/index.html` + `js/lp/main.js`.
Ningún cambio visual de calado; no requiere verificación en Chrome salvo el
punto 1.5.

### T1 · Honeypot `_gotcha` (1 línea de HTML)

El Worker ya lo comprueba: `cloudflare/agent/src/index.ts:3513-3515` — si
`_gotcha` llega con contenido, responde `{status:"ignored"}` con 200 (éxito
falso para el bot). La LP no lo envía; activarlo es añadir dentro del `<form>`
(`lp/sitios-web/index.html:186`):

```html
<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true"
       style="position:absolute;left:-9999px;height:0;width:0" >
```

`FormData` lo incluye vacío para humanos (cadena vacía → `clean()` lo descarta)
y relleno para bots. No hace falta tocar `main.js`.

**Hecho cuando:** un POST manual con `_gotcha:"x"` devuelve
`{"status":"ignored"}` y un envío normal sigue creando lead.

### T2 · Chips reparados: etapa fuera de `budget_slug`, bandas reales dentro

**El bug, verificado:** `js/lp/main.js:282` envía `budget_slug: punto` donde
`punto` es el label crudo del chip ("Explorando", …). El Worker lo acepta tal
cual (`index.ts:2835`: `clean(body.budget_slug, 80)` sin validar contra
`BUDGETS`) y el scoring da +14 a cualquier valor ≠ `not-sure`
(`index.ts:542-547`): "Explorando" puntúa igual que "Presupuesto aprobado".

**Arreglo sin tocar el Worker** (la vía con Worker se descarta: no hay campo
`stage` en `Profile` y añadirlo es una migración que esta fase no necesita):

1. Los chips de etapa dejan de mapear a presupuesto. En `main.js`, `punto`
   pasa a enviarse como `project_notes`, que `profileFromLeadBody`
   (`index.ts:2837`) ya agrega al mensaje del perfil y llega a D1 en notas:

   ```js
   // en el payload (main.js:280-283), sustituir budget_slug: punto por:
   project_notes: punto ? `Etapa: ${punto}` : '',
   budget_slug: banda,          // ver punto 2
   ```

2. Segunda fila de chips con las bandas reales. `BUDGETS` existe en
   `index.ts:315-322` con slugs `not-sure | under-1000 | 1000-3000 | 3000-7500
   | 7500-15000 | 15000-plus` y labels ES ya escritos. En el HTML, tras el
   grupo actual (`index.html:200-205`):

   ```html
   <p class="mini" id="lab-banda" style="margin-top:1.25rem">¿Rango de inversión? <span class="mini">(opcional)</span></p>
   <div class="chips" role="group" aria-labelledby="lab-banda">
     <button class="chip chip--banda" type="button" data-slug="1000-3000"   aria-pressed="false">$1,000–$3,000</button>
     <button class="chip chip--banda" type="button" data-slug="3000-7500"   aria-pressed="false">$3,000–$7,500</button>
     <button class="chip chip--banda" type="button" data-slug="7500-15000"  aria-pressed="false">$7,500–$15,000</button>
     <button class="chip chip--banda" type="button" data-slug="15000-plus"  aria-pressed="false">$15,000+</button>
   </div>
   ```

   En `main.js`, un segundo estado `banda` (leyendo `dataset.slug`) con el mismo
   patrón de listener que los chips actuales — cuidando que cada grupo solo
   des-selecciona a sus hermanos, no al otro grupo (hoy el selector
   `document.querySelectorAll('.chip')` es global; separar por clase).

**Hecho cuando:** un envío con banda seleccionada persiste `budget_slug`
válido de la lista `BUDGETS` en D1, la etapa aparece en las notas del lead, y
"Explorando" sin banda ya no infla el score (+14→0 por presupuesto).

### T3 · Consentimiento real (quitar el hardcode)

`main.js:281` envía `consent: true` incondicional; el Worker lo audita en
`consent_events` como si el usuario hubiera marcado algo que nunca vio, y
devuelve 400 si falta (`index.ts:3547-3556`), así que el checkbox debe ser
`required` para no romper envíos.

HTML (antes del botón de enviar, `index.html:207`):

```html
<label class="mini consent">
  <input type="checkbox" name="consent" required>
  Acepto que uses estos datos para responderme. <a href="/privacidad/">Privacidad</a>.
</label>
```

JS: en el payload, `consent: form.elements.consent.checked` (no confiar en el
`"on"` de FormData; `boolValue` del Worker no está verificado contra ese
literal). `checkValidity()` ya bloquea el envío sin marcar. Estilo del checkbox:
reutilizar `.mini`; una regla nueva en `css/lp.css` si hace falta alinear.

**Hecho cuando:** el envío sin marcar no sale del navegador; el payload lleva
`consent:true` solo si el usuario marcó.

### T4 · og:image real (1200×630)

Hoy `og:image` y `twitter:image` apuntan a `Logos/logo-dark.png` (5000×3068)
con `summary_large_image` (`index.html:16-21`): al compartir por email/chat se
ve un recorte ilegible del logo.

1. Generar desde el póster del hero:
   ```bash
   npx sharp-cli -i images/lp/hero-poster-1280-v1.avif -o images/lp/og-lp-sitios-web-v1.jpg resize 1200 630 --fit cover
   ```
   (o cualquier herramienta equivalente; JPG < 300 KB; el sufijo `-v1` importa:
   `/images/*` puede cachearse largo). Si el póster recortado a 630 pierde el
   sujeto, componer en un editor: póster + claim "4-8 semanas" en Inter.
2. Actualizar las cuatro metas (`og:image`, `twitter:image`) a
   `https://creativemk.net/images/lp/og-lp-sitios-web-v1.jpg`.

**Hecho cuando:** el validador de cards (o un GET al archivo publicado)
muestra 1200×630 real.

### T5 · Micro-limpiezas del mismo pase

- **Título de pestaña mentiroso** (`main.js:211`): "← El reel sigue aquí" se
  muestra aunque el reel nunca se montara (móvil, reduced-motion, sin WebGL2).
  Guardar un flag cuando `iniciarShow()` monta el reel de verdad y solo
  entonces cambiar el título; si no, "← Tu propuesta en 1 día hábil — CREATIVE MK".
- **CTA con resultado** (adelanto barato de F3 que no depende de D1): el botón
  `index.html:207` "Enviar el mensaje" → "Recibir mi propuesta en 1 día hábil",
  y bajo el botón un clarificador `mini`: "Sin compromiso. Te respondo yo.".
  (+31% los CTA que nombran resultado; evidencia en blueprint §2.)

**Cierre de fase:** `npm run verify` → deploy → purga → comprobar en el Chrome
real: chips en dos grupos operables, checkbox visible, envío de prueba llega a
D1 (verificar vía dashboard admin del Worker o consulta D1).

---

## Fase 2 — Medición (T6-T8, ~1 día, prerequisito de todo lo que sigue)

### T6 · Beacon first-party `page-view` + `capture-open` al Worker

No es la decisión de analítica pendiente (D3): usa infraestructura propia ya
desplegada. El endpoint de eventos existe (`index.ts:3874-3900`, acción
`events` en la misma base que `lead-capture`), whitelist incluye `page-view` y
`capture-open` (`index.ts:3880`), límite 80 eventos/sesión (`index.ts:208`) —
de sobra para 2 eventos por visita.

En `main.js`, nueva función (usa el `endpoint()` existente cambiando el último
segmento):

```js
function beacon(eventType, metadata) {
  const url = endpoint().replace(/lead-capture$/, 'events');
  const body = JSON.stringify({ eventType, lang: 'es', metadata });
  // fetch keepalive, no sendBeacon: el fallback a workers.dev es cross-origin
  // y un Blob application/json no es CORS-safelisted para sendBeacon.
  fetch(url, {
    method: 'POST', keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body
  }).catch(() => {});
}
```

Disparos:

- `page-view`: una vez en `iniciar()`, con `metadata: { page: 'lp-sitios-web',
  referrer: atribucion().referrer, utm_source, utm_campaign }` (reutilizar
  `atribucion()`; el Worker aplica su allowlist de metadata — si descarta
  claves, no es error).
- `capture-open`: la primera vez que el formulario entra en viewport
  (IntersectionObserver sobre `#empezar`, threshold 0.4, `once`) **o** el
  primer `focusin` en el form — lo que ocurra antes. Un solo disparo.

Con esto el embudo mínimo queda medible en D1 con los rollups diarios que el
Worker ya calcula: `page-view` → `capture-open` → lead (el propio
`handleLeadCapture` registra el evento `lead-capture` del lado servidor; el
cliente no lo duplica).

**Hecho cuando:** una visita de prueba en producción genera 1 `page-view` y 1
`capture-open` en D1, y el rollup diario muestra denominador > 0.

### T7 · Decisión D3 + instalación de analítica de terceros ⚑

Cuando Arturo decida (D3). La CSP actual ya permite ambos sin tocar `_headers`
(verificado en `_headers:6`: `connect.facebook.net` y
`static.cloudflareinsights.com` en `script-src` y `connect-src`):

- **Píxel Meta:** poner el ID real en `js/meta-pixel.js:4` e incluir el script
  en la LP (hoy la LP no lo carga; decidir si solo LP o todo el sitio). El
  plumbing posterior ya existe: `atribucion()` lee `_fbp`/`_fbc`
  (`main.js:246-251`) y `creativeMkTrackLead` dispara `fbq('track','Lead')`
  (`main.js:306-308`). Requisito de campaña Meta: `/privacidad/` publicada —
  ya existe y la LP la enlaza.
- **Cloudflare Web Analytics:** snippet en el `<head>`; gratis, sin cookies,
  da el denominador de visitas sin decisión de privacidad compleja.

Trampa documentada: **no** visitar la URL del snippet en producción antes del
deploy (envenena caché 4h).

### T8 · Thank-you page + redirección

1. Crear `lp/sitios-web/gracias/index.html`: misma cabeza mínima (fuente, CSS
   `lp.css`, `noindex`), mensaje "Recibido. Te respondo en 1 día hábil." +
   siguiente paso ("mientras tanto, mira los dos proyectos en producción" →
   enlaces a los casos; cuando exista el widget de F4, el siguiente paso pasa a
   ser la mini-auditoría). `copy-assets.mjs` copia `lp/` recursivo — sin
   cambios de build.
2. En `main.js`, en el `try` de éxito: sustituir el mensaje inline por
   `location.assign('/lp/sitios-web/gracias/')`. Mantener el mensaje inline
   como fallback si `creativeMkTrackLead` necesita ejecutarse antes (orden:
   track → assign).
3. La URL `/lp/sitios-web/gracias/` es el objetivo de conversión de cualquier
   campaña (Meta/Google) — sin ella la plataforma optimiza a ciegas.

**Cierre de fase:** deploy + purga. Desde aquí, **1-2 semanas de campaña
pequeña para baseline** antes de tocar el contenido: cada cambio de F3 debe
poder leerse contra estos números.

---

## Fase 3 — Landing v2 (T9-T12, ~3-4 días, después del baseline)

El orden interno importa: primero el swap de contenido (T9), luego hero/copy
(T10), porque T9 no depende de ninguna decisión ⚑ y es el cambio más rentable.

### T9 · Swap de galería: 5 "muestras" → 2 casos reales; pin degradado

**Qué muere:** las 5 `article.pieza` con etiqueta "Muestra de capacidad"
(`index.html:84-122`) — etiqueta que `src/work/index.html:92` prohíbe en el
propio sitio — y el pin horizontal de ~2100px que las pasea
(`main.js:140-158`).

**Qué entra:** sección `casos` estática (grid de 2 tarjetas, sin pin):

- **Agente de recepción** — "El formulario de esta página lo atiende él":
  7.500 líneas TypeScript, D1 + Durable Objects + Workflows, en producción en
  este sitio. Enlace a `/es/trabajo/agente-de-recepcion/`.
- **Campo de contornos** — el sistema gráfico del sitio: 36 KB de renderer
  propio frente a 183 KB de three.js. Enlace a `/es/trabajo/campo-de-contornos/`.
- Etiqueta de ambas: **"Proyecto propio, en producción en este sitio"**. Cifras
  y copy: tomar de `src/_data/cases.js` (campo `businessFrame`, bilingüe, ya
  escrito) — no redactar cifras nuevas. **Verificar al implementar** que los
  dos slugs coinciden con los de `cases.js` (el dossier los cita; los enlaces
  rotos aquí serían el peor bug posible de la sección de credibilidad).

**Cambios de código:**

1. `index.html`: sustituir `<section class="pista">…` completa por la nueva
   sección (imágenes: los AVIF de portfolio existentes del caso, `loading="lazy"`).
2. `main.js`: eliminar el bloque del carril (`main.js:140-158`) y el comentario
   del bug del pin (ya no aplica); las tarjetas nuevas usan el revelado
   `data-rev="2"` existente — cero animación nueva.
3. `css/lp.css`: estilos `.casos` (grid 2 col / 1 col móvil); borrar las reglas
   `.pista/.pieza` muertas.
4. **FAQ coherente:** la entrada "¿El trabajo que muestras es de clientes?"
   (`index.html:180`) cambia a la posición del ledger: "Son dos proyectos del
   estudio, en producción en este mismo sitio, con cifras verificables. Los
   proyectos de cliente se publican con nombre y cifra acordada, o no se
   publican."

**Hecho cuando:** en el Chrome real: la página ya no tiene pin horizontal, las
2 tarjetas enlazan a casos que cargan, y ninguna aparición de "Muestra de
capacidad" queda en `lp/` (grep).

### T10 · Hero v2 + banda de confianza ⚑ (D1)

1. **H1** (`index.html:62`): opción A por defecto —
   "Tu sitio web publicado en 4 a 8 semanas. Con cada semana por escrito." —
   sub (`:63`): "Diseño y desarrollo completos, en español e inglés, por un
   estudio que te enseña qué recibes cada semana antes de empezar."
   SplitText anima líneas, funciona con cualquier texto (verificado
   `main.js:119-122`); revisar en Chrome real que el corte de líneas del nuevo
   H1 no deja viudas en 900-1280px.
2. **Coherencia de metas:** `<title>`, `og:title`, `twitter:title` y el
   `description` acompañan al H1 nuevo (mismo claim, no clones literales).
3. **Banda de confianza** (nueva sección, posición 2, donde estaba la pista;
   si T9 ya puso ahí los casos, la banda va entre hero y casos como franja
   compacta): 3-4 cifras de ingeniería checkeables (0 scripts bloqueantes,
   36 KB vs 183 KB, 7.500 líneas typecheckeadas, respuesta en 1 día hábil
   firmada) + la línea del ledger: "0 proyectos de cliente publicados. 2
   proyectos propios en producción. Los de cliente se publican con nombre y
   cifra, o no se publican." Formato: una fila `mini` con separadores, no un
   muro de logos falso.
4. El eyebrow "Estudio digital · ES / EN" y las señales del hero
   (`index.html:59,68-71`) se revisan para no duplicar lo que el H1 nuevo ya
   dice (hoy "4 a 8 semanas" quedaría dos veces: H1 y lede — el lede pasa a
   llevar la promesa de control, no el plazo).

**Hecho cuando:** captura en Chrome real aprobada por Arturo (la lección de
las cinco versiones rechazadas: nada de diseñar a ciegas) y verify en verde.

### T11 · FAQ ampliada + precio "desde" ⚑ (D2)

En la columna izquierda del formulario (`index.html:176-181`):

- Añadir 3 entradas: **¿Cuánto cuesta?** (la horquilla D2, formato "Un sitio
  completo, desde $X. Una landing, desde $Y. El alcance exacto, por escrito en
  1 día hábil."), **¿Qué pasa si no me gusta?** (aprobación semanal: la portada
  se aprueba antes de codificar — reusar el copy del proceso), **¿Qué necesitas
  de mí?** (contenidos, accesos, 1 llamada semanal).
- La tabla `plazos` (`index.html:159-163`) gana una columna "desde" con las
  mismas cifras — plazo y precio juntos anclan mejor que separados.
- Los chips de banda de T2 y estas cifras deben ser consistentes entre sí
  (no prometer "desde $1,000" si la banda mínima mostrada es otra).

### T12 · CTA dual WhatsApp ⚑ (D4)

Junto al botón de enviar (no compitiendo con él — jerarquía del blueprint §6.8:
un primario por pantalla):

```html
<p class="mini" style="margin-top:1rem">
  <a class="wa" id="wa-link" href="#" rel="noopener">o escríbeme por WhatsApp →</a>
</p>
```

En `main.js`: construir el href al cargar —
`https://wa.me/<D4>?text=` + `encodeURIComponent('Hola Arturo, vengo de la página de sitios web. Mi proyecto: ')`
— y en el click disparar `beacon('form-click', { channel: 'whatsapp' })`
(`form-click` está en la whitelist, `index.ts:3880`) para no perder la
atribución aunque la conversación siga fuera del sitio. El session id NO va en
el texto del mensaje (ruido para el usuario); la correlación queda en D1 vía
el evento.

**Cierre de fase:** deploy + purga + verificación visual completa en Chrome
real (desktop + móvil real o emulado) + envío de prueba de punta a punta.
Comparar 2 semanas de métricas contra el baseline de F2.

---

## Fase 4 — Después de leer los números (T13-T16)

Estas tareas se disparan **solo con baseline medido**, para poder atribuirles
su efecto.

### T13 · Widget de mini-auditoría (`audit-url`)

El endpoint existe y está en producción (`index.ts:3117`, acción `audit-url`,
misma base de sesión; Turnstile en modo permisivo mientras no haya
`TURNSTILE_SECRET_KEY`, `index.ts:1021-1027`). Sección nueva entre casos y
proceso: input de URL + botón "Dime qué le falta a mi web" → render de
`clarityScore`/`conversionScore`/diagnóstico + CTA que precarga el textarea del
formulario con el diagnóstico (`message`) y hace scroll a `#empezar`. Límite de
auditorías por sesión: el Worker lo impone; el widget muestra el error del
Worker tal cual (ya viene en ES). JS vanilla, ~80 líneas, sin dependencias.

### T14 · Nota del fundador

Entre formulario y telón: 3-4 líneas en primera persona + `Logos/profile.jpg`
(hoy sin uso en ninguna página). Optimizar antes de usar: exportar a AVIF
~400px (`images/lp/arturo-400-v1.avif`); 147 KB de JPG original no entran en
el presupuesto de peso de la página.

### T15 · Acuse de recibo instantáneo (Worker)

El handler `email()` del Worker ya recibe correo entrante; añadir el envío
saliente de acuse al capturar lead (o vía Email Routing). "1 día hábil" se
mantiene como promesa visible; el acuse compite en velocidad real sin inflarla.
Esfuerzo M; tocar `cloudflare/agent/` implica `npm run typecheck` y deploy del
Worker por separado (no viaja con el deploy de Pages).

### T16 · Higiene: `rewriteRefs` y el import dinámico

`fingerprint.mjs` huella `js/lp/*.js` pero el literal
`import('/js/lp/reel.js')` (`main.js:93`) debe quedar reescrito al nombre
huelleado — verificar en `dist/` tras el build; si no lo reescribe, enseñar el
patrón a `rewriteRefs`. Riesgo bajo (caché de assets versionada por `-v1` en
media, pero el JS huelleado sí importa).

---

## Ritual de cada deploy (todas las fases)

```bash
npx wrangler whoami
npm run verify
npx wrangler pages deploy dist --project-name=creative-mk-website --branch=main
```

Después: purga de caché en dashboard → recién entonces abrir URLs de
producción. Cambios en `cloudflare/agent/` se despliegan aparte (wrangler
deploy del Worker), nunca asumir que viajan con Pages.

## Registro de ejecución — 2026-08-17

**F1+F2 ejecutadas y probadas** (T1, T2, T3, T4, T5, T6, T8; T7 espera D3).
Detalle de lo que difiere del plan escrito:

- **T6, corrección durante pruebas:** el IntersectionObserver de `capture-open`
  observaba `#empezar` con umbral 0.35 — la sección mide ~2360px, así que en
  viewports < ~830px el ratio máximo visible nunca alcanza el umbral y el
  evento no dispara jamás por scroll. Corregido: observa `#form` (~1120px) con
  umbral 0.25. El fallback por `focusin` se mantiene.
- **T16, verificado benigno:** `fingerprint.mjs` publica también las copias sin
  huella (`dist/js/lp/reel.js` existe), así que el literal
  `import('/js/lp/reel.js')` resuelve. Solo pierde el beneficio de caché
  inmutable; queda como higiene pendiente, no como fallo.
- **T4:** og:image compuesta con Sharp usando la Inter real del repo
  (woff2→ttf vía wawoff2 en scratchpad). 1200×630, 51 KB, en
  `images/lp/og-lp-sitios-web-v1.jpg`.

Pruebas ejecutadas (todas en verde):

| Prueba | Método | Resultado |
|---|---|---|
| Honeypot `_gotcha` | POST directo al Worker | `{"status":"ignored"}` — bot recibe éxito falso |
| Evento `page-view` | POST directo + carga real en preview con espía pre-script | `accepted:true`; en página dispara a los 331ms con status 200 |
| Evento `capture-open` | POST directo al Worker | `accepted:true` |
| Lead completo | POST con `budget_slug:"3000-7500"` + `project_notes:"Etapa: …"` | capturado, señal `budget` activa en scoring (score 68, warm) |
| Chips 2 grupos | Click en preview local | selección independiente + toggle de des-selección |
| Consent bloquea | `requestSubmit()` sin marcar | ningún fetch sale; `checkValidity` false |
| E2E envío | Formulario real en preview → Worker → redirect | lead capturado y navegación a `/lp/sitios-web/gracias/` |
| Página gracias | read_page del preview | título, enlaces a ambos casos y firma correctos |
| `npm run verify` | build + gates completos | verde (baseline y post-cambios) |

Leads de prueba en D1, identificables para limpiar/ignorar: sesión
`mk-test-plan-f1f2-20260817` (curl) y el e2e con email
`arturo.ordonezv+lp-e2e@gmail.com`.

**Deploy pendiente de ti (F0):** las credenciales de wrangler en esta máquina
(token ambiental Y login OAuth) pertenecen a `zyz.investments@gmail.com` — la
cuenta equivocada. Publicar requiere tu token de la cuenta
`2a432f7e8d56266c9dd713199ecf5b47`, pasado inline como el 2026-08-13, y purga
de caché en dashboard después.

## Métricas que declaran el éxito

Con F2 desplegada, el embudo mínimo en D1 es: `page-view` → `capture-open` →
lead (+ `form-click`/whatsapp desde F3). Objetivos de lectura, no de vanidad:

1. **Baseline (F2, 1-2 semanas):** ratio capture-open/page-view (¿la gente
   llega al formulario?) y lead/capture-open (¿el formulario convierte?).
2. **F3 se juzga contra ese baseline**, cambio por cambio (por eso T9 y T10
   van en deploys separados si el tráfico lo permite).
3. La primera campaña pequeña instrumentada es también el test de demanda del
   posicionamiento (riesgo de fondo del blueprint §6.10) — si `page-view`
   cualificado no aparece, el problema es de oferta/tráfico, no de la página.
