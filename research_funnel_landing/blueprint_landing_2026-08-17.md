# BLUEPRINT — Landing de campaña `/lp/sitios-web/` — CreativeMk

Fecha: 2026-08-17. Fuentes: dossier de 7 agentes (auditoría de la LP, destilado de investigación previa, inventario de activos, benchmark de 11 landings, evidencia CRO 2024-2026, escaneo de 12 competidores hispanohablantes, auditoría técnica/producción). Decisiones de dirección vinculantes: `docs/direction.md`, deploy manual con wrangler + purga, `npm run verify` como única puerta, vanilla+GSAP (sin React ni three.js en páginas), dials 8/7/3.

---

## 1. Diagnóstico en una página

**Lo que la landing YA tiene (y no hay que rehacer):**

- Ingeniería de conversión por encima de lo que aparenta: formulario de 2 campos obligatorios conectado de punta a punta al Worker `creative-mk-concierge` vía ruta same-origin (`creativemk.net/agents/*`), con upsert en D1, scoring 0-100, tarea de follow-up a 4h/24h, cola de enriquecimiento y evento server-side (`cloudflare/agent/src/index.ts:3508-3707`, `js/lp/main.js:229-303`).
- Rendimiento ejemplar: ruta crítica ~73 KB, cero scripts bloqueantes, poster AVIF de 10 KB como LCP, video con `preload=none` en idle, reel WebGL tras compuertas de hardware con autodestrucción por coste de frame (`js/lp/main.js:19-46`, `js/lp/reel.js:176-208`). La receta anti-LCP que la evidencia CRO recomienda ya está implementada.
- Promesa temporal sistematizada sin contradicciones en sus 7 apariciones: 4-8 semanas / respuesta en 1 día hábil (title, meta, hero, plazos, form, FAQ, footer, mensaje de éxito).
- La mejor sección de venta ya escrita: el proceso semana a semana con entregables verificables (`lp/sitios-web/index.html:129-165`) — infrautilizada en posición 3, detrás de ~2100px de galería pineada.
- Dentro del pipeline y de las puertas: `copy-assets.mjs:13` la copia, `fingerprint.mjs` la reescribe, `check-site.mjs` la valida. No es una página huérfana.

**Lo que le falta (en orden de daño):**

1. **Medición cero**: ni píxel, ni analítica, ni evento `page-view` al Worker. Se registran leads (numerador) sin visitas (denominador): la conversión de cualquier campaña es incalculable (`js/lp/main.js:306-308` es un no-op garantizado; el Worker acepta `page-view` en su whitelist, `index.ts:3880`, y nadie lo emite).
2. **Prueba social cero, y además equivocada**: 5 imágenes etiquetadas "Muestra de capacidad" (`lp/sitios-web/index.html:88-120`) — la etiqueta que el sitio principal prohibió (`src/work/index.html:92`: "No borrowed logos, no capability showcases, no stock") — mientras los 2 casos reales con cifras verificables que SÍ existen (`src/_data/cases.js`) no se enlazan ni se mencionan.
3. **Datos de cualificación rotos**: los chips "En qué punto estás" envían el label crudo como `budget_slug`, contaminan D1 y "Explorando" puntúa +14 igual que "Presupuesto aprobado" (`index.ts:2835`, `:542-547`).
4. **Titular genérico**: "Tu sitio web, hecho a medida" lo enuncian literalmente La Teva Web, PANCA y BierzoSEO; la frase que de verdad vende (4-8 semanas, 1 día hábil) está degradada al lede.
5. **Sin defensa anti-spam activa** (el honeypot `_gotcha` del Worker existe y la LP no lo incluye), **consentimiento hardcodeado** (`js/lp/main.js:282`), **og:image inservible** (logo PNG 5000×3068 con `summary_large_image`), **sin anclaje de precio**, **sin thank-you page**.
6. **Deriva de deploy en el sitio principal**: los commits del 2026-08-16 nunca se desplegaron; `https://creativemk.net/es/` devuelve 404 y el hreflang publicado es de un build anterior. La LP en vivo sí es byte-idéntica al dist local.

**La frase que resume por qué no convierte más:**

> La landing es un embudo de ingeniería excelente al que nadie le puede medir la boca, cuyo escaparate enseña muestras genéricas teniendo casos reales con cifras en el mismo repo, y cuyo titular repite la promesa más copiada del sector mientras esconde en letra pequeña la única que es suya.

---

## 2. La tesis de la landing

### Posicionamiento elegido

El escaneo de competencia encontró tres huecos reales y uno bloqueado:

- **Hueco 1 (elegido como eje): diseño de autor vendido en español.** Basement y Aerolab (talento LATAM de banda alta) venden solo en inglés; quien vende en español (Dobuss, La Teva, PANCA) hace web corporativa sin trabajo de autor. Nadie ocupa "calibre de premio, en tu idioma, con proceso y plazo por escrito". Conecta directo con la dirección cinemática y el bid de Awwwards ya documentados (memoria `creativemk-awards-bid`).
- **Hueco 2 (soporte): el sitio bilingüe ES/EN como producto**, no como rasgo del proveedor. Nadie del panorama lo vende, y CreativeMk es el único cuyo propio sitio lo demuestra — es un claim verificable HOY sin necesitar clientes.
- **Hueco 3 (soporte): transparencia de precio en el segmento a medida.** Correlación perfecta en los 12 competidores: quien publica precio vende plantilla; quien vende a medida oculta el precio. "A medida, con *desde* publicado y desglose de qué compra cada semana" no tiene dueño. Evidencia CRO: transparencia de precio es la petición nº1 de compradores B2B cuatro años seguidos (TrustRadius, vía https://www.emarketer.com/content/b2b-tech-buyers-crave-pricing-transparency) y solo el 12% de agencias publica rangos.
- **Bloqueado**: competir por prueba social cuantificada (Kreatik: 4.9/+36 reseñas, +800 webs, casos con +35%/+45/+60%). CreativeMk tiene 0 clientes publicados; ese frente no se pelea todavía, se sustituye por transparencia radical (ver §3, sección B).

La tesis en una línea: **"El sitio que ves es la prueba"** — el estudio vende exactamente lo que su propia web demuestra (rendimiento medible, bilingüe real, agente de IA vivo que cualquiera puede tocar), con plazo, proceso y precio *desde* por escrito, firmado por una persona con nombre.

### Tres opciones de H1 + subtítulo

La evidencia manda: titulares con número concreto +15% sobre genéricos, beneficio sobre característica +27% (Wynter 2026, vía https://www.digitalapplied.com/blog/landing-page-statistics-2026-conversion-data-points). El 80% solo lee titular y primera frase. Los números que ya existen y son sostenibles: 4-8 semanas, 1-2 semanas (landing), 1 día hábil.

**Opción A — resultado + plazo (la formula con más evidencia):**
> **H1:** Tu sitio web publicado en 4 a 8 semanas. Con cada semana por escrito.
> **Sub:** Diseño y desarrollo completos, en español e inglés, por un estudio que te enseña qué recibes cada semana antes de empezar. Respuesta en 1 día hábil.
> *Razón:* sube al H1 el número que hoy vive en el lede (el dossier: "el lede sí trabaja... es la frase que realmente vende") y convierte el plazo — hoy debilidad frente al express de 4-7 días (Muselab, Kreatik) — en argumento de control, que es lo que el proceso semanal ya respalda. Patrón: Halo Lab publica plazo ("2-3mo kickoff to launch") sin publicar cifra.

**Opción B — bilingüe como producto (hueco 2, claim verificable sin clientes):**
> **H1:** Un sitio que vende en español y en inglés. Nativo en los dos, en 4 a 8 semanas.
> **Sub:** No traducción de relleno: copy, SEO y estructura en ambos idiomas desde el día uno — como este mismo sitio. Alcance y precio por escrito en 1 día hábil.
> *Razón:* ningún competidor de los 12 vende este producto (VigoStudio y HacemosSuWeb usan "bilingüe" como rasgo, no como entregable). Riesgo: acota la audiencia; ideal como variante de campaña segmentada, no como default, hasta poder A/B (que exige medición primero).

**Opción C — segunda persona + división de trabajo (patrón Huemor, el único hero en 2ª persona del benchmark):**
> **H1:** Tú diriges tu negocio. Tu web, la firmo yo — lista en 4 a 8 semanas.
> **Sub:** Diseño, desarrollo, textos y medición en un solo interlocutor. Cada semana sabes qué recibes. Respuesta en 1 día hábil, de Arturo, no de un bot.
> *Razón:* Huemor ("You Focus On Shaping The Future, We'll Handle The Website") es el titular más orientado a resultado del benchmark; y la firma personal ya es el ancla de credibilidad de la LP (aparece 2 veces). Encaja con la nota del fundador (ConversionLab usa foto del fundador como palanca, teardown Unbounce) y con `profile.jpg`, hoy sin uso en ninguna página.

**Recomendación: A como default de campaña genérica** (máxima evidencia, mínimo riesgo), C para audiencias frías donde la desconfianza en agencias es la objeción, B para campañas segmentadas a exportadores/turismo. Regla común: CTA en primera persona y con resultado — "Recibir mi propuesta en 1 día hábil" en vez de "Enviar" (+31% CTA que nombra resultado, +9% clarificador bajo el botón, Unbounce vía Digital Applied).

---

## 3. Anatomía sección por sección

Esqueleto convergente de los convertidores 2025-2026 (síntesis Fuente 4): hero con resultado → banda de confianza en posición 2 → casos con métrica → proceso/servicios → precios o FAQ de precio → CTA final de baja fricción. Adaptado a los activos REALES del inventario:

**A. Hero** (reemplaza el actual `lp/sitios-web/index.html:56-78`)
- Qué va: H1 opción A + sub, CTA único "Recibir mi propuesta en 1 día hábil" con clarificador ("Sin compromiso. Te respondo yo."), micro-línea de credibilidad.
- Activo real: poster `images/lp/hero-poster-1280-v1.avif` (10,5 KB) + `video/hero-clean-1280-v1.mp4`/`-720` con la carga en idle YA implementada. Evaluar `creative-mk-hero-mobile-av1.mp4` (1080×1350 vertical, sin uso) para el hero móvil.
- Patrón: receta poster-como-LCP del caso Mintec (https://mintec.co/blog/video-lcp-hero-performance-2026/) — ya cumplida; titulares de Huemor/Halo Lab (audiencia+resultado, no identidad).

**B. Banda de confianza — "prueba invertida"** (NUEVA, posición 2; hoy esa posición la ocupa la galería pineada de ~2100px)
- Qué va: una franja corta de cifras **de ingeniería propias, checkeables en el repo** + el ledger honesto reencuadrado como promesa: "0 proyectos de cliente publicados. 2 firmados en producción. Se publican con nombre y cifra acordada, o no se publican." Cifras disponibles: 7.500 líneas de Worker con typecheck, 36 KB de renderer frente a 183 KB de three.js, 0 scripts bloqueantes en todo el sitio, respuesta en 1 día hábil firmada.
- Activo real: `src/work/index.html:59-92` (ledger), `src/_data/cases.js` (cifras con base de medición nombrada). NO se inventan logos ni contadores.
- Patrón: la posición ("banda de confianza siempre en posición 2-3, nunca al final", síntesis Fuente 4). El contenido es la adaptación honesta: donde Halo Lab pone "Trusted by 300+ clients", CreativeMk pone transparencia radical — el único formato de prueba que puede sostener hoy y que "ningún competidor puede copiar sin asumir el costo" (Fuente 3).

**C. Los 2 casos reales con cifras** (reemplaza las 5 "Muestras de capacidad", `lp/sitios-web/index.html:84-122`)
- Qué va: dos tarjetas — **Agente de recepción** (el que responde en este sitio: 7.500 líneas, 3 migraciones D1, 2 Durable Objects, 3 Workflows; "pruébalo tú mismo") y **Campo de contornos** (el sistema gráfico de este sitio: 36 KB vs 183 KB, 2 dialectos de shader, y los 2 fallos publicados). Cada una enlaza a `/es/trabajo/agente-de-recepcion/` y `/es/trabajo/campo-de-contornos/`. Etiqueta "Proyecto propio, en producción en este sitio" — nunca más "Muestra de capacidad".
- Activo real: `src/_data/cases.js:20-199` (bilingües, con `businessFrame` ya escrito), imágenes portfolio AVIF existentes.
- Patrón: Rejouice — la métrica comparte pantalla con la pieza; Kreatik — el único competidor hispano con cifras por caso, y el que mejor convierte del panorama. La pista pineada de 2100px se elimina o se degrada a fila simple: en una LP de campaña, la posición 2 no puede ser el contenido más débil (hallazgo [medio] Fuente 1).

**D. Mini-auditoría en vivo — el lead magnet que ya existe** (NUEVA)
- Qué va: "Pega la URL de tu web y te digo en segundos qué le falta para vender" → llama a `audit-url` del Worker (título, H1, CTAs, clarityScore, conversionScore, diagnóstico + servicio recomendado, 1 por sesión). Resultado con `reportUrl` compartible que el visitante se lleva. CTA de continuidad hacia el formulario con el diagnóstico precargado en `message`.
- Activo real: `cloudflare/agent/src/index.ts:3278-3438` — ya construido, en producción, sin usar en ninguna landing. Cero backend nuevo (respeta "no añadir funnel software", memoria `creativemk-funnel-initiative`).
- Patrón: quizzes/diagnósticos convierten 42,2% start-to-lead en servicios vs <0,9% de ebooks (Interact, https://www.tryinteract.com/blog/quiz-conversion-rate-report/); Webistry usa el audit gratuito como CTA único (teardown Unbounce); KlientBoost "breadcrumb technique" — empezar por una pregunta fácil sobre el problema, no por datos personales.

**E. Proceso semana a semana** (la sección actual `:129-165`, promovida y con una corrección)
- Qué va: tal cual está — es la mejor sección de venta escrita ("Sabes qué tienes cada semana") — con la tabla de plazos. Corrección obligada: la semana 8 promete "medición puesta"; la propia LP debe cumplirlo antes de que un cliente técnico detecte la incoherencia (hallazgo Fuente 1).
- Patrón: hueco 3 de competencia — "nadie del panorama explica qué compran las semanas extra" frente al express de 4 días; Phenomenon empaqueta por etapa del cliente. Este desglose ES la defensa del plazo 4-8 frente a Muselab/Kreatik.

**F. Precio "desde" + FAQ ampliada** (amplía `:176-181`)
- Qué va: una horquilla orientativa por tipo de proyecto (decisión de cifra: owner), junto a la tabla de plazos. FAQ añade las 4 objeciones que faltan: qué pasa si no me gusta (revisiones/aprobaciones semanales ya implícitas en el proceso), qué incluye y qué no, cuánto cuesta aproximadamente, qué necesitas de mí.
- Activo real: `BUDGETS` de 6 bandas ya existe en el Worker (`index.ts:315-322`) — el sistema ya piensa en bandas; la LP solo tiene que mostrarlas.
- Patrón: Huemor publica $50k-$100k y plazos en FAQ y convierte con ello; solo el 12% de agencias publica rangos (Digital Marketing Institute 2024) — publicarlo es en sí un diferenciador; los anclajes del comprador mexicano ya existen ($12,900-$20,000 MXN vía ListoWeb) y sin señal propia compiten solos.

**G. Formulario + canal dual** (arregla `:186-210`)
- Qué va: los mismos 2 campos obligatorios (no tocar: es lo más sólido de la página), con: (1) chips reparados — el estado viaja como dimensión `stage` propia o mapeado a slugs reales, nunca el label crudo; (2) un select/chips de banda de presupuesto real usando `BUDGETS` (Phenomenon incluye select de presupuesto: cualifica sin llamada, y el scoring del Worker ya lo puntúa); (3) input honeypot `_gotcha` oculto (una línea, activa la defensa ya escrita en el servidor, `index.ts:3513-3515`); (4) checkbox de consentimiento real en lugar de `consent: true` hardcodeado; (5) **botón de WhatsApp junto al formulario** con `wa.me` + mensaje preescrito + parámetro de sesión para no perder atribución en D1.
- Patrón: 8 de 12 competidores hispanos usan WhatsApp como CTA primario; WhatsApp Flows 72% de completado vs 35% formularios web (Meta vía https://www.aurorainbox.com/en/2026/03/01/whatsapp-business-2025-statistics/). El formulario corto con select de presupuesto es el cierre canónico de la síntesis Fuente 4.

**H. Nota del fundador** (NUEVA, entre formulario y telón)
- Qué va: 3-4 líneas en primera persona + `Logos/profile.jpg` (147 KB, hoy sin uso en NINGUNA página pese a que "Lo firmo yo — Arturo Valle" es el ancla de credibilidad) + la firma existente.
- Patrón: "nota del fundador — clave para estudio de una persona" (doctrina de 10 secciones, `research_funnel_landing/findings_estructura_copy.md`); ConversionLab usa la foto del fundador para conexión personal (teardown Unbounce).

**I. Telón/footer** (se mantiene `:214-227`)
- El email gigante en oro ya funciona como segundo CTA. Pendiente: decidir si desactivar Email Obfuscation de Cloudflare, que hoy muestra "[email protected]" sin JS en la vía de rescate del formulario (Fuente 7).

**Post-envío**: thank-you page ligera (URL de conversión para cuando haya píxel + siguiente paso: "mientras respondo, prueba la mini-auditoría con tu web actual" o enlace a los 2 casos). Hoy tras enviar "el visitante no tiene nada que hacer" (Fuente 1).

---

## 4. Lo que NO se puede construir todavía

**Content-gated (bloqueado por permisos/terceros, no por código):**

| Bloqueado | Por qué | Plan mínimo de desbloqueo |
|---|---|---|
| Casos de cliente con nombre y cifra | 2 firmados esperan "nombre del cliente + una cifra acordada, o no se publican" (`src/work/index.html`, `docs/direction.md` 6) | Al cierre de cada proyecto firmado: pedir por escrito (a) uso del nombre, (b) UNA métrica acordada, (c) una reseña Google. La retirada de la redaction bar ES el anuncio (`docs/immersive-plan.md`). Desbloquea en cascada: Flip plates, muro de logos (`css/logo-wall.css` existe sin uso), about shelf. |
| Testimonios con nombre/cargo/foto | Cero existen; es trabajo del owner con clientes | Mismo pipeline: la reseña Google pedida arriba se cita con permiso. Ubicación futura: bajo el CTA (lift hasta 68% por ubicación, research previo). No inventar NUNCA — la regla del ledger es el posicionamiento. |
| Reseñas Google con conteo | El precio de entrada del mercado (hasta DWM tiene 5.0/17) | Se acumula sola con el pipeline anterior; 3-5 reseñas bastan para una banda "5.0 en Google (n reseñas)" honesta. |
| A/B testing (GrowthBook) y formulario multi-paso | Condicionados a tener medición y tráfico (research previo, Fase 4) | Primero medición (§5), luego tráfico de pago, luego experimentos — empezando por el titular. |
| Cifra exacta de la horquilla de precio | Decisión de negocio del owner | Sesión de 1 hora del owner: fijar "desde X" por tipo usando las bandas `BUDGETS` y los anclajes de mercado (ListoWeb MXN, Kreatik EUR, PANCA COP) como referencia. |
| Versión EN de la LP | La página promete "Español e inglés" (`:70,179,225`) y hardcodea `lang:'es'` | Solo si la campaña toca audiencia EN; seguir el patrón bilingüe build-time de `docs/direction.md` 3.3. No es bloqueante para campaña ES. |
| Pieza WebGL de autor (/lab/) | Bid de Awwwards, deadline real fin de octubre 2026 | Vía independiente del funnel; la LP no la espera. |

**Regla transversal:** ningún sustituto fabricado. El activo de CreativeMk es que su transparencia es verificable; un solo testimonio inventado la quema entera.

---

## 5. Plan de ejecución priorizado

Restricciones respetadas: deploy manual `npx wrangler whoami` → `npm run verify` → `npx wrangler pages deploy dist --project-name=creative-mk-website --branch=main` → purga de caché de zona (dashboard); nunca pedir una URL antes del deploy (TTL 4h envenena, `docs/direction.md` 1.1); vanilla+GSAP, sin frameworks nuevos; dirección cinemática intacta (la degradación técnica actual no se toca).

| # | Tarea | Tipo | Esfuerzo | Impacto | Notas |
|---|---|---|---|---|---|
| 0 | **Desplegar el build actual** (la portada en vivo es de un build viejo, `/es/` da 404, hreflang ausente) | Deploy | XS | Alto | Nada de lo demás importa si el trabajo no llega a producción. Es el modo de fallo documentado exacto. |
| 1 | Honeypot `_gotcha` en el form de la LP | Fix HTML | XS (1 línea) | Medio | Activa la defensa ya escrita en el Worker antes de comprar tráfico (los bots siguen los anuncios). |
| 2 | **Beacon `page-view` al Worker** (`sendBeacon` al endpoint de eventos ya whitelisteado) + evento `capture-open` | Medición | S | **Crítico** | Cierra el denominador del funnel con infraestructura propia, sin terceros y sin esperar la decisión de analítica del owner. Prerequisito de todo. |
| 3 | Arreglar chips: estado → dimensión `stage` (o slugs propios), añadir chips de banda `BUDGETS` real | Fix HTML+JS (+Worker si `stage` es campo nuevo) | S | Alto | Repara la señal de intención destruida y cualifica sin llamada. |
| 4 | Consent checkbox real (quitar `consent: true` hardcodeado) | Fix HTML+JS | XS | Medio | Riesgo RGPD moderado con tráfico UE; el rastro `consent_events` hoy audita algo que el usuario nunca marcó. |
| 5 | og:image 1200×630 desde el poster del hero (exportar a JPG/PNG) | Fix asset | XS | Bajo-Medio | La LP se comparte por email/chat en conversaciones de venta. |
| 6 | Decisión de analítica del owner + instalación (píxel Meta y/o Cloudflare Web Analytics; CSP ya lo permite, `_headers:6`) | Medición | S | **Crítico** | Decisión deliberadamente pendiente en `docs/direction.md` 6.1 — esta es la semana de tomarla. Recordar la trampa: no comprobar la URL del snippet antes del deploy. |
| 7 | Thank-you page + `creativeMkTrackLead` apuntando a ella | Medición | S | Medio | URL de conversión para campañas + siguiente paso post-envío. |
| 8 | **Swap de galería**: 5 "Muestras de capacidad" → 2 casos reales con cifras, eliminar/degradar el pin de 2100px | Trabajo nuevo (HTML+CSS, motion existente) | M | **Alto** | El cambio de contenido más rentable: sustituye el contenido más débil en la posición de más atención por el único activo de prueba real. |
| 9 | Nuevo hero (H1 opción A, CTA call-to-value) + banda de confianza/ledger en posición 2 | Trabajo nuevo (copy+HTML) | M | Alto | Con medición ya puesta (#2/#6), este cambio será el primero cuyo efecto se pueda ver. |
| 10 | FAQ ampliada + horquilla "desde" (cifra: owner) | Trabajo nuevo (copy) | S | Alto | Requiere la sesión de precio del §4. |
| 11 | CTA dual WhatsApp con atribución de sesión | Trabajo nuevo | S | Alto (LATAM) | `wa.me` con mensaje preescrito + session id; sin software nuevo. |
| 12 | Widget de mini-auditoría `audit-url` en la LP | Trabajo nuevo (JS vanilla contra endpoint existente) | M-L | Alto | El lead magnet con mejor evidencia (42,2%) y cero backend nuevo. Hacerlo DESPUÉS de medir el baseline del funnel simple, para poder atribuirle su lift. |
| 13 | Nota del fundador con `profile.jpg` | Trabajo nuevo | XS | Medio | Activo listo, sin uso. |
| 14 | Acuse de recibo automático inmediato del Worker (email entrante ya soportado, `handler email()`) | Trabajo nuevo (Worker) | M | Medio | "1 día hábil" se mantiene como piso visible; el lift real está en responder en minutos (66,7% vs 30% de reuniones, Chili Piper). |
| 15 | Enseñar a `rewriteRefs` el literal `import('/js/lp/reel.js')` | Fix build | XS | Bajo | Higiene de cacheo; riesgo real bajo. |

**Orden de ejecución:** 0 → (1-5 en un solo pase sobre el HTML existente, un deploy) → 6-7 → medir baseline 1-2 semanas de campaña pequeña → 8-11 (la landing v2) → 12-14. Cada deploy pasa por `npm run verify` y termina con purga de caché.

---

## 6. Riesgos y contradicciones

1. **`isRealClient:false` — el contexto del proyecto está desactualizado.** El brief y varios docs (`docs/direction.md:360`, `research_report.md:20`) siguen afirmando que el portafolio lleva ese flag; el inventario verificó que se eliminó el 2026-08-10 y hoy hay 2 casos `kind:"self"` con cifras + ledger. **Resolución:** la Fuente 3 manda (verificó código actual); actualizar los docs que lo citan. El hueco real ya no es "portafolio fabricado" sino "cero clientes publicados" — matiz que cambia la estrategia de la sección C.

2. **La LP contradice la regla del propio sitio.** `src/work/index.html:92` declara "no capability showcases" y la LP etiqueta 5 piezas "Muestra de capacidad". No es una contradicción entre agentes sino entre el producto y su doctrina. **Resolución:** la doctrina gana (es el posicionamiento); tarea #8.

3. **"Analítica = decisión deliberadamente pendiente del owner" (direction.md 6.1) vs "la medición es prerequisito de todo" (3 fuentes).** **Resolución:** dividir. El beacon `page-view` first-party al Worker NO es la decisión pendiente (no añade terceros, usa la whitelist existente) — se hace ya (#2). La decisión pendiente es el píxel/analítica de terceros (#6), y este blueprint la escala como bloqueante de campaña, no la toma por el owner.

4. **"1 día hábil": ¿activo o pasivo?** Fuente 1 lo celebra (coherente en 7 apariciones, sustituto parcial de prueba social); Fuente 6 lo declara "la promesa de velocidad más lenta del panorama medido" (2h HacemosSuWeb, 24h VigoStudio); Fuente 5 aporta el arbitraje: mejor que el 63,5% del mercado que nunca responde, peor que la expectativa de <4h del 46%. **Resolución:** mantener "1 día hábil" como promesa firmada (creíble, cumplible) y añadir el acuse instantáneo del Worker (#14) para competir en velocidad real sin inflar la promesa.

5. **Precio: "defendible no publicarlo" (Fuente 1) vs "publicar horquilla es diferenciador" (Fuentes 5 y 6).** **Resolución:** a favor de publicar "desde". La evidencia primaria (TrustRadius/Gartner) es sólida; el patrón competitivo (nadie del segmento custom hispano lo hace) convierte el coste en ventaja; y los chips rotos demuestran que la cualificación económica actual no funciona. **Dudoso:** las cifras de Brixon Group (ciclos -37%, +31% SQL) son de segunda mano y no verificadas en sus fuentes primarias — usar como dirección, jamás citarlas en copy o decisiones cuantitativas.

6. **Video en hero: dirección cinemática vs evidencia CRO ("el video no convierte por sí mismo y es la causa nº1 de fallos de LCP").** **Resolución:** no hay conflicto real — la LP ya implementa la receta completa de neutralización (poster AVIF como LCP, `<video>` nativo, `preload=none`, idle). El video se paga por calidad percibida, que en el posicionamiento "el sitio es la prueba" es argumento, no adorno. Se mantiene; la única condición de la evidencia (CTA visible sobre el hero) ya se cumple.

7. **WhatsApp: cifras de conversión trasladadas de otro sector.** Las tasas 35-55% de conversión de conversaciones son de ecommerce/retail, no de servicios de ticket alto — la propia Fuente 5 lo advierte. **Resolución:** adoptar el canal por el diferencial de fricción y adopción (72% completado, 78% adopción MX), no proyectar esas tasas; medir las propias (posible gracias a #2/#6).

8. **Fricción del concierge vs fricción mínima.** Fuente 6 nota que el funnel concierge es "diferenciador real que nadie tiene, pero invisible y de mayor fricción aparente que un botón de WhatsApp". La doctrina destilada pide attention ratio 1:1 y CTA único; este blueprint propone form + WhatsApp + mini-auditoría. **Resolución:** jerarquía estricta — un solo CTA primario por pantalla (el formulario); WhatsApp como alternativa adyacente en la misma sección (patrón dominante del mercado hispano, no un segundo objetivo); la mini-auditoría como paso intermedio que desemboca en el mismo formulario. Se mide (#12 va después del baseline) y si canibaliza sin sumar, se corta.

9. **Discrepancias menores del dossier a registrar:** (a) el score del motor de contenido aparece como 87.6 en la memoria y 87.2 en Fuente 2 — irrelevante para la LP, pero no citar ninguno sin re-medir; (b) UX Studio quick-uplift, citado como el patrón más cercano, devuelve 404 — era campaña temporal: patrón utilizable, referencia viva no; (c) las dos páginas de privacidad ES divergentes (`/privacidad/` vs `/privacy/`) siguen siendo decisión legal del owner abierta — la LP enlaza `/privacidad/` y no debe tocarse hasta que se resuelva; (d) el título de pestaña "El reel sigue aquí" se muestra incluso donde el reel nunca se montó — detalle a limpiar en el pase #1-5.

10. **El riesgo de fondo (no técnico):** el hueco de posicionamiento elegido (autor en español) tiene riesgo de **demanda**, no de competencia — la Fuente 6 lo dice explícitamente ("cuántas empresas hispanohablantes pagan ese calibre"). Por eso el plan pone la medición antes que la reescritura: la primera campaña pequeña con el funnel instrumentado es el test de esa demanda, y sin #2/#6 ese test es imposible de leer.