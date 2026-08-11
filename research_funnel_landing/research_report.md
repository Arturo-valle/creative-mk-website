# Funnel de venta y landing page para CREATIVE MK

Informe de investigación. 2026-08-09.
Fuentes: 56 repositorios de GitHub verificados uno a uno contra la API (estrellas, licencia, último push, estado de archivado), tres investigaciones web documentadas en este mismo directorio, y una auditoría del código real del sitio.

Documentos de apoyo en esta carpeta:
- `findings_estructura_copy.md` — anatomía y copywriting de landing pages
- `findings_cro_tecnico.md` — rendimiento, formularios, A/B testing, benchmarks
- `research_plan.md` — plan de la investigación

---

## 1. Respuesta corta

**No necesitas un constructor de funnels.** Ya construiste uno, y es mejor que la mayoría de lo que hay en GitHub: el Worker `creative-mk-concierge` en producción tiene base de datos D1 con sesiones de lead, atribución UTM, scoring, diagnósticos, briefs, tareas de seguimiento, rollups diarios con tasa de conversión y registro de consentimiento. Instalar Mautic o ClickFunnels encima sería duplicar lo que ya funciona.

Lo que falta no es software de funnel. Faltan tres cosas, en este orden:

1. **Medición.** Hoy el sitio no mide nada. El Meta Pixel está instalado con el ID vacío (`js/meta-pixel.js:4` → `const META_PIXEL_ID = ''`), así que carga y se apaga solo. No hay PostHog, ni GA, ni Plausible, ni Umami. Tienes un funnel sin instrumentar: el Worker registra lo que pasa *dentro* del concierge, pero nadie sabe cuánta gente llega a la landing, cuánta baja hasta el CTA y cuánta se cae en el camino.
2. **Prueba social real.** No hay ni un testimonio, ni un logo de cliente, ni una cifra verificable en toda la landing. Las doce entradas del portafolio llevan `isRealClient: false` y se renderizan con la etiqueta "Capability showcase". Tu propio `docs/direction.md` §6 ya lo identificó como lo que más mueve la aguja, y la investigación lo confirma: los testimonios suben la conversión alrededor de un 34%.
3. **Un mensaje que diga qué vendes.** El H1 actual —"Digital experiences for brands ready to grow with clarity"— no nombra un servicio, ni un cliente, ni un resultado. Ningún competidor podría afirmar lo contrario, y eso es la definición de un titular que no comunica nada.

Los repositorios de abajo sirven para tapar el hueco 1 y para acelerar el 3. El hueco 2 no se resuelve con código.

---

## 2. Repositorios de GitHub, por etapa del funnel

56 repos verificados. Estrellas, licencia y fecha de último push comprobados con la API de GitHub el 2026-08-09/10, no de memoria.

### 2.1 La pila mínima que yo instalaría para tu caso

| Repo | ★ | Licencia | Para qué, aquí |
|---|---|---|---|
| [PostHog/posthog](https://github.com/PostHog/posthog) | 37.588 | MIT + `ee/` comercial | Embudos nativos, session replay, mapas de calor y A/B en un solo script. **Usa la nube gratuita**, no lo autoalojes: el self-hosted pide ClickHouse + Kafka + Postgres. |
| [markmead/hyperui](https://github.com/markmead/hyperui) | 12.191 | MIT | Bloques de Tailwind en **HTML plano** para copiar y pegar: heroes, testimonios, precios, FAQ, CTAs. Encaja perfecto con tu sitio vanilla; no hay build ni framework que adoptar. |
| [surveyjs/survey-library](https://github.com/surveyjs/survey-library) | 4.834 | MIT | Formularios multi-paso con lógica condicional en JavaScript plano. Es la vía para partir el brief de 9 campos en pasos sin meter más React. |
| [knadh/listmonk](https://github.com/knadh/listmonk) | 22.690 | AGPL-3.0 | Newsletter y secuencias de nurturing. Un solo binario + Postgres en un VPS barato; el sitio le habla por API desde un Worker. |
| [maizzle/framework](https://github.com/maizzle/framework) | 1.598 | MIT | Maqueta los correos de la secuencia con Tailwind. Es build-time, no runtime: no añade peso al sitio y mantiene plantillas gemelas ES/EN. |

Alternativa a PostHog si prefieres licencia limpia y menos producto: **[umami-software/umami](https://github.com/umami-software/umami)** (38.127 ★, MIT puro, embudos nativos gratis en el self-hosted, script de ~2 KB). Es el repo con más estrellas de toda la lista y el de licencia más simple. Contra: necesita un Next.js y una base de datos permanentes, que Cloudflare Pages no aloja.

### 2.2 Analítica de embudo — comparativa

La distinción que importa: **cuáles hacen análisis de embudo de verdad** y cuáles solo cuentan visitas.

| Repo | ★ | Licencia | ¿Embudo nativo? | Nota |
|---|---|---|---|---|
| [PostHog/posthog](https://github.com/PostHog/posthog) | 37.588 | MIT + `ee/` cerrado | **Sí**, es su función estrella | Self-hosted pesado; usa la nube |
| [umami-software/umami](https://github.com/umami-software/umami) | 38.127 | MIT | **Sí**, gratis en self-hosted | El mejor equilibrio potencia/licencia |
| [rybbit-io/rybbit](https://github.com/rybbit-io/rybbit) | 12.597 | AGPL-3.0 | **Sí**, + session replay y Web Vitals | "PostHog para quien no quiere operar PostHog" |
| [Openpanel-dev/openpanel](https://github.com/Openpanel-dev/openpanel) | 6.443 | AGPL-3.0 | **Sí**, por propiedades de evento | Ritmo de desarrollo más lento |
| [openreplay/openreplay](https://github.com/openreplay/openreplay) | 12.470 | Mixta (MIT/AGPL/`ee/`) | **Sí**, con salto a la grabación | Diagnostica el *porqué*; backend pesadísimo |
| [matomo-org/matomo](https://github.com/matomo-org/matomo) | 21.750 | GPL-3.0 | Sí, con plugin | PHP + MySQL |
| [plausible/analytics](https://github.com/plausible/analytics) | 28.450 | AGPL-3.0 + `extra/` propietario | **No en el self-hosted** | Hallazgo importante: el código de embudos vive en `extra/`, cuyo `COPYING.txt` no concede derechos de uso. No es legal activarlo autoalojado. |
| [benvinegar/counterscale](https://github.com/benvinegar/counterscale) | 2.112 | MIT | **No**, solo pageviews | El único que vive dentro de Cloudflare (Workers + Analytics Engine), coste ~0. Sin actividad desde 2025-12. |

Para experimentación: [growthbook/growthbook](https://github.com/growthbook/growthbook) (8.108 ★) tiene un SDK que evalúa flags en el edge de Cloudflare Workers, justo donde ya estás. **Pero no lo instales todavía**: con el tráfico actual un A/B test tarda semanas en alcanzar significancia. Primero mide, luego experimenta.

### 2.3 Plantillas y bloques para la landing

| Repo | ★ | Licencia | Encaje |
|---|---|---|---|
| [markmead/hyperui](https://github.com/markmead/hyperui) | 12.191 | MIT | **El mejor**: HTML plano, copiar y pegar, sin build |
| [arthelokyo/astrowind](https://github.com/arthelokyo/astrowind) | 5.869 | MIT | La plantilla Astro de marketing más popular. Aunque no adoptes Astro, la estructura de secciones es portable |
| [PaulleDemon/awesome-landing-pages](https://github.com/PaulleDemon/awesome-landing-pages) | 1.019 | MIT | Swipe file con visor web para comparar patrones |
| [eibrahim/landing-pages-resources](https://github.com/eibrahim/landing-pages-resources) | 368 | **Sin licencia** | Su `landing-page-review-checklist.md` es lo más accionable. Sin licencia = todos los derechos reservados: léelo, no lo republiques |
| [tailwindtoolbox/Landing-Page](https://github.com/tailwindtoolbox/Landing-Page) | 1.451 | MIT | Un solo `index.html`, mismo tipo de proyecto que el tuyo. **Sin mantenimiento desde abril 2024**, Tailwind v3 |

### 2.4 Captura de leads

| Repo | ★ | Licencia | Nota |
|---|---|---|---|
| [surveyjs/survey-library](https://github.com/surveyjs/survey-library) | 4.834 | MIT | Multi-paso en JS plano. Ojo: el editor visual `survey-creator` es de licencia comercial; escribir el JSON a mano evita ese coste |
| [formbricks/formbricks](https://github.com/formbricks/formbricks) | 12.750 | AGPL + `ee/` | Encuestas y pop-ups condicionados; los SDK que se incrustan sí son MIT |
| [baptisteArno/typebot.io](https://github.com/baptisteArno/typebot.io) | 10.248 | **FSL-1.1, no OSI** | Funnels conversacionales. La licencia prohíbe competir con Typebot. Además tú ya tienes concierge propio |
| [BohdanPetryshyn/formzero](https://github.com/BohdanPetryshyn/formzero) | 75 | MIT | Backend de formularios que corre en tu propia cuenta de Cloudflare. Sustituto de Formspree. **Un solo autor, 37 commits**: haz fork y audítalo antes de ponerlo ante leads reales |
| [calcom/cal.diy](https://github.com/calcom/cal.diy) | 47.385 | MIT | Agendamiento. Su README avisa: la edición comunitaria es para uso personal, **no de producción** |
| [formsmd/formsmd](https://github.com/formsmd/formsmd) | 775 | Apache-2.0 | Formularios tipo Typeform en Markdown. **Abandonado**: 15 meses sin push |

### 2.5 Nurturing por email

| Repo | ★ | Licencia | Nota |
|---|---|---|---|
| [knadh/listmonk](https://github.com/knadh/listmonk) | 22.690 | AGPL-3.0 | Mejor relación potencia/esfuerzo: un binario. Plantillas multilingües, útil por ser bilingüe |
| [pentacent/keila](https://github.com/pentacent/keila) | 2.181 | AGPL-3.0 | Un contenedor Docker, doble opt-in, enfoque RGPD |
| [mautic/mautic](https://github.com/mautic/mautic) | 10.310 | GPL-3.0 | El clásico de automatización. Pesado (PHP+MySQL) y desproporcionado para un estudio |
| [maizzle/framework](https://github.com/maizzle/framework) | 1.598 | MIT | Maquetación de correos con Tailwind, build-time |
| [resend/react-email](https://github.com/resend/react-email) | 19.582 | MIT | Más respaldo, pero obliga a meter React solo para los correos |
| [dittofeed/dittofeed](https://github.com/dittofeed/dittofeed) | 2.890 | MIT | Sin push desde 2026-03 |

### 2.6 Cierre: CRM, propuestas, cobro

Aquí es donde más se solapa con lo que ya tienes. Tus tablas `leads`, `lead_diagnostics`, `lead_tasks` y `lead_briefs` en D1 **ya son un CRM**, y tienes panel en `/admin/`. Adoptar uno externo solo tiene sentido si quieres dejar de mantener el tuyo.

| Repo | ★ | Licencia | Nota |
|---|---|---|---|
| [marmelab/atomic-crm](https://github.com/marmelab/atomic-crm) | 1.195 | MIT | El mejor encaje: frontend estático desplegable en Cloudflare Pages, backend en Supabase. Comunidad pequeña |
| [twentyhq/twenty](https://github.com/twentyhq/twenty) | 54.620 | AGPL + archivos Enterprise | El más popular, pero AGPL copyleft y exige Node + PostgreSQL |
| [espocrm/espocrm](https://github.com/espocrm/espocrm) | 3.209 | AGPL-3.0 | Maduro, PHP |
| [documenso/documenso](https://github.com/documenso/documenso) | 14.315 | AGPL-3.0 | Firma de propuestas y contratos |
| [docusealco/docuseal](https://github.com/docusealco/docuseal) | 18.228 | AGPL-3.0 | Alternativa a Documenso, más estrellas |
| [polarsource/polar](https://github.com/polarsource/polar) | 10.177 | Apache-2.0 | Cobro y facturación, licencia limpia |
| [chatwoot/chatwoot](https://github.com/chatwoot/chatwoot) | 35.668 | MIT + `enterprise/` | Chat en vivo. Redundante con tu concierge |

### 2.7 Constructores visuales — probablemente no los necesitas

Los evaluamos porque son la respuesta obvia a "funnel builder", pero para tu caso son herramientas para *construir un producto de page builder*, no para hacer tu landing:

- [GrapesJS/grapesjs](https://github.com/GrapesJS/grapesjs) — 26.110 ★, BSD-3-Clause. El estándar del sector, salida HTML/CSS puro.
- [givanz/VvvebJs](https://github.com/givanz/VvvebJs) — 8.583 ★, Apache-2.0. **El único sin fricción de licencia ni de infraestructura**: JS vanilla, cero dependencias, cero build. Si algún día quieres dar a un cliente un editor visual, empieza aquí.
- [puckeditor/puck](https://github.com/puckeditor/puck) — 13.100 ★, MIT. Requiere React.
- [webstudio-is/webstudio](https://github.com/webstudio-is/webstudio) — 8.815 ★, AGPL-3.0.
- [silexlabs/Silex](https://github.com/silexlabs/Silex) — 2.923 ★, AGPL-3.0. Genera sitios estáticos; si lo alojas para clientes, la AGPL te obliga a publicar tus modificaciones.
- [prevwong/craft.js](https://github.com/prevwong/craft.js) — 8.716 ★, MIT. **Sin push desde 2025-02.**

---

## 3. Cómo se construye correctamente una landing page

Las dos guías de referencia del sector —la de Julian Shapiro y la de Harry Dry— convergen casi en el mismo esqueleto. Esto es la síntesis; el detalle está en `findings_estructura_copy.md`.

### 3.1 El orden de las secciones

1. **Navbar mínimo.** En una landing de campaña se quita la navegación entera: cada enlace es una fuga.
2. **Hero.** Titular + subtítulo + visual real + CTA + una línea de credibilidad. Tienes ~5 segundos.
3. **Prueba social de credibilidad.** Logos, cifras. Su trabajo es hacer creíble la promesa del hero.
4. **CTA principal.**
5. **Features y objeciones.** Cada bloque: beneficio en el encabezado + la objeción respondida en el párrafo + imagen del trabajo real.
6. **Testimonios.** Abajo del pliegue la prueba social cambia de función: ya no valida, inspira. Con nombre, cara y número.
7. **FAQ.** Precio, plazos, qué pasa después de enviar el formulario, garantías.
8. **CTA final.**
9. **Nota del fundador.** La gente le compra a personas. Especialmente relevante para un estudio pequeño.
10. **Footer.**

### 3.2 Las reglas de copy que más pesan

- **Test del cavernícola (Harry Dry):** alguien debería poder mirar el hero y gruñir de vuelta qué ofreces.
- **Test de Julian Shapiro:** si el visitante lee *solo* el H1, ¿sabe exactamente qué vendes? Lo que separa un titular fuerte de uno débil es la especificidad. "Improve your workflow" es malo; "Groceries delivered in 1 hour" es bueno.
- **Ecuación de compra:** `conversión = deseo − (esfuerzo + confusión)`.
- **Hazlo concreto, visual y falsable.** Una afirmación que nadie podría contradecir no convence a nadie.
- **Call to value, no call to action.** "Recibir mi diagnóstico" convierte más que "Enviar".
- **Attention ratio 1:1.** Enlaces en la página ÷ objetivos de conversión. El ideal es uno.
- **Message match.** El titular repite la promesa del anuncio o la búsqueda que trajo al visitante.

### 3.3 Los números técnicos que hay que cumplir

- **LCP < 2.5 s** (Google apunta ya a 2.0), **INP < 200 ms**, **CLS < 0.1**, medidos en móvil real. Es la métrica con la conexión más fuerte con la conversión y la que más falla: solo el 62% de sitios móviles pasa LCP.
- La evidencia de que esto paga: Rakuten midió **+33% de conversión** con una landing optimizada para Core Web Vitals contra la original; Deloitte midió **+8.4% de conversiones retail por cada 0.1 s** de mejora en móvil.
- **Formularios:** 1 campo convierte ~18%; 3 campos, ~11.5%. Los multi-paso superan a los de una página en **~86%** de los casos (13.85% vs 4.53% de media). Preguntas fáciles primero, email al final.
- **Benchmark de éxito:** la mediana de una landing ronda 2.35–6.6% según la fuente. **≥10% es excelente.**

---

## 4. Qué falla hoy en tu landing

15 hallazgos de severidad alta, todos con evidencia en el código. Los agrupo por lo que cuestan.

### 4.1 Fugas que pierden leads hoy mismo

**El newsletter tira los correos a la basura.** `js/main.js:610-617`: `initNewsletter()` hace `preventDefault()`, lee el email en una variable, oculta el formulario y muestra el mensaje de éxito. No hay `fetch`, ni `action`, ni endpoint. Cada persona que se suscribe ve un "gracias" falso y su dato se pierde. Esto no es una mejora de conversión pendiente: es una fuga en producción.

**El sitio no mide nada.** `js/meta-pixel.js:4` tiene `const META_PIXEL_ID = ''`, así que el script se autodesactiva. No hay ninguna otra analítica. No puedes saber tu tasa de conversión, ni de dónde viene el tráfico, ni dónde se cae la gente.

**En móvil desaparece el CTA del header.** `css/sections.css:344-346` oculta `.header__contact-btn` por debajo de 1024px. Por debajo de esa anchura el único CTA visible sin abrir el menú hamburguesa es el del hero. El móvil es ~60% del tráfico.

### 4.2 El mensaje

**El H1 no dice qué vendes.** `index.html:142-144`. La información concreta existe, pero está degradada al eyebrow (`index.html:141`) y al `<title>`: los dos elementos que menos peso visual tienen cargan el trabajo del titular.

**El lede son 34 palabras enumerando siete disciplinas** (`index.html:145-147`), sin explicar cómo funciona ni por qué es creíble.

**Ocho etiquetas distintas de CTA para un mismo destino.** Once enlaces apuntan a `contact.html` con textos diferentes: "Start a project", "Map an AI workflow", "Brief your first system", "Talk to CREATIVE MK", "Ask for guidance", "Let's Talk", "Send a brief". Ninguno es un call-to-value; todos describen la acción, no lo que el visitante recibe.

**Attention ratio desastroso.** 44 enlaces en el `<body>`, más el newsletter, más el FAB del concierge. Con un solo objetivo de conversión, el ratio debería tender a 1:1.

### 4.3 La credibilidad

**Cero prueba social.** Un grep de `testimonial|reseña|review` no devuelve nada. La sección que el código llama `proof` (`index.html:171-197`) y el bloque etiquetado literalmente `aria-label="CREATIVE MK trust signals"` contienen solo autoafirmaciones: "Brand + Web + Growth", "Design-led, data-aware". Eso no es prueba, es descripción.

Esto ya estaba diagnosticado en tu propio `docs/direction.md` §6, con la conclusión correcta: *"dos o tres casos reales con resultados reales moverán las probabilidades de premio y la tasa de conversión más que cualquier cantidad de trabajo de shaders"*.

### 4.4 El rendimiento

**El elemento LCP arranca invisible.** `.hero__text` lleva la clase `reveal` (`index.html:140`), y `css/base.css:243-248` la define como `opacity: 0`. Solo se hace visible cuando el `IntersectionObserver` de `js/animations.js` corre. Es decir: tu Largest Contentful Paint depende de que JavaScript se ejecute. Ninguno de los seis scripts al final del body lleva `defer`, y `js/meta-pixel.js` está en el `<head>` sin `defer` ni `async`, bloqueando el parser antes incluso del preload de la fuente.

Tu propio `direction.md` §3.2 ya había marcado esto como algo a arreglar *antes* de añadir más movimiento: 35 elementos empiezan invisibles y dependen de JS para aparecer.

**La página de conversión pesa 233 KB.** `contact.html` incrusta el bundle de React entero en línea (`scripts/copy-contact-build.mjs:35-36` inyecta 213 KB de JS y 17 KB de CSS dentro del HTML). Es la página más importante del funnel y la más pesada del sitio. Los assets ya tienen hash en el nombre y ya tienen `Cache-Control: immutable` en `_headers`: servirlos como ficheros externos es dinero tirado que se está dejando en la mesa.

### 4.5 El formulario

**Nueve puntos de interacción en un solo paso** (`contact-src/src/main.jsx:595-629`): nombre, email, teléfono, empresa, tres grupos de chips (17 chips que leer entre servicio, presupuesto y plazo), textarea y checkbox de consentimiento. Siete de ellos obligatorios.

**Sin `autocomplete` ni `inputmode`** (`main.jsx:701-718`). Los cuatro campos de texto los omiten. Es un cambio de cuatro líneas con efecto medible inmediato en móvil.

---

## 5. Plan de ejecución

Ordenado por relación impacto/esfuerzo, no por comodidad.

### Fase 0 — Cómo llega esto a producción (resuelto el 2026-08-09)

`docs/direction.md` §1 ya lo dejó zanjado: **Cloudflare Pages, proyecto `creative-mk-website`, por subida directa y sin conexión a GitHub**. Empujar a `main` no publica nada; el campo `production_branch` que reporta el proyecto es engañoso porque no hay fuente Git detrás. Eso explica los tres meses de trabajo invisible: el último despliegue fue una subida manual del 2026-06-11.

Cada cambio de este plan llega a producción con:

```bash
npm run verify && npx wrangler pages deploy dist --project-name=creative-mk-website --branch=main
```

Dos cautelas que afectan directamente a medir el funnel: `npm run verify` es la única barrera entre el árbol de trabajo y el sitio en vivo, porque no hay CI delante de la subida; y hay que **purgar la caché de zona después de desplegar, nunca antes** — el TTL de navegador de la zona es de 4 horas y pedir un asset que aún no existe cachea el fallback HTML bajo esa URL. Si instalas el snippet de analítica y compruebas su URL antes de subirlo, te envenenas la caché durante cuatro horas y creerás que la medición no funciona.

### Fase 1 — Tapar fugas y encender la medición (días)

1. Arreglar el newsletter: conectarlo al Worker que ya recibe leads, o retirar el bloque. No dejar el falso "gracias".
2. Instalar PostHog Cloud (capa gratuita) en `index.html` y `contact.html`; añadir su dominio a `script-src` y `connect-src` en `_headers:6`. Definir desde el día uno: `landing_view`, `cta_click`, `contact_start`, `contact_submit`, `concierge_open`, `concierge_lead`.
3. Añadir `autocomplete` e `inputmode` a los cuatro campos de texto del formulario.
4. Devolver el CTA del header en móvil, o añadir una barra fija inferior.
5. Sacar `.hero__text` y `.hero__signals` del sistema `reveal`; poner `defer` a los seis scripts.

Sin el punto 2, el resto del plan es opinión en vez de datos.

### Fase 2 — Arreglar el mensaje (semanas)

6. Reescribir el H1 con una promesa específica y falsable, bajando las disciplinas al subtítulo. Solo con números que puedas sostener: tus plazos ya están declarados en el FAQ (`js/main.js:364`) y tu tiempo de respuesta en `contact-src/src/main.jsx:30-31`.
7. Unificar los ocho CTAs en un solo par ES/EN de call-to-value, con la micro-objeción resuelta al lado ("Respuesta en 1 día hábil", "Sin compromiso").
8. Reordenar las secciones hacia la anatomía de §3.1: mover Insights fuera de la landing, añadir un CTA final a pantalla completa antes del footer y adelgazar el footer.
9. Ampliar el FAQ con precio de entrada, qué pasa tras enviar el formulario y garantías.

### Fase 3 — Construir la credibilidad (meses, y no es trabajo de código)

10. Conseguir permiso de dos o tres clientes reales para publicar el caso con métricas antes/después. La estructura de datos ya existe y es correcta: `case.challenge`, `case.solution`, `case.result`, `case.deliverables` y el flag `isRealClient`. Rellenarla es un trabajo de contenido.
11. Publicar 2-3 testimonios con nombre, cargo, empresa y foto, colocados justo debajo del CTA del hero y del CTA final. La investigación indica que la ubicación pesa tanto como el testimonio: ponerlos bajo el botón ha producido subidas de hasta 68%.
12. Recuperar el muro de logos (`css/logo-wall.css` ya existe y no se usa).

### Fase 4 — Optimizar con datos (cuando haya tráfico medido)

13. Partir el formulario en multi-paso con SurveyJS: chips fáciles primero, nombre y email al final.
14. Dejar de inlinear el bundle de React en `contact.html`.
15. Solo entonces, A/B testing con GrowthBook, empezando por el titular. Con poco tráfico, testea cambios grandes: las variaciones sutiles nunca alcanzarán significancia.

---

## 6. Advertencias de licencia que conviene retener

Varios de los proyectos más citados como "open source" no lo son del todo, y el detalle importa si algún día revendes la solución a un cliente:

- **Plausible**: el código de embudos vive en `extra/`, con un `COPYING.txt` que no concede derechos de uso. No puedes activarlo legalmente en un self-hosted.
- **Typebot**: licencia FSL-1.1, no aprobada por la OSI. Prohíbe usar el software para competir con Typebot.
- **Cal.com** (ahora `calcom/cal.diy`): su propio README dice que la edición comunitaria es para uso personal y **no de producción**.
- **PostHog, Formbricks, GrowthBook, Novu, Twenty, Chatwoot**: modelo open-core. El núcleo es MIT o AGPL, pero los directorios `ee/`/`enterprise/` son propietarios.
- **AGPL** (Listmonk, Keila, Rybbit, Silex, Documenso, Webstudio, EspoCRM): copyleft de red. Para uso interno no hay problema; si ofreces el panel como servicio a tus clientes, te obliga a publicar tus modificaciones.
- **eibrahim/landing-pages-resources**: sin licencia declarada, es decir, todos los derechos reservados. Úsalo como lectura, no lo republiques.
