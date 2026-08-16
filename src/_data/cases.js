/**
 * Case studies.
 *
 * The work index used to be a leaf: three slots, two of them redaction bars,
 * no child route and no template to make one — so the promise printed on the
 * page ("each bar becomes a full case page the day its client signs off") had
 * nothing behind it. The template exists now, and the two entries below are
 * the studio's own work: no NDA, no client to ask, nothing withheld.
 *
 * Every figure here is checkable in this repository. Where a number came from
 * a measurement, the measurement is named. A client case drops in with the
 * same shape the day a name is cleared.
 */
/*
 * Reframed 2026-08-13: each case opens with businessFrame — what the system
 * changes for a business reader — and the engineering supports rather than
 * leads. Every checkable figure is unchanged and still true; they were
 * re-homed in the prose, not deleted.
 */
const cases = [
  {
    "slug": "intake-agent",
    "esSlug": "agente-de-recepcion",
    "kind": "self",
    "year": "2026",
    "en": {
      "client": "CREATIVE MK",
      "title": "The intake agent that answers on this site",
      "lead": "AI Automation · Development",
      "figure": "2 Durable Objects",
      "figureLabel": "one per conversation, one enforcing the ceiling",
      "challenge": "The intake agent exists because of a gap in the first five minutes. When a lead writes to a business, what happens in those minutes decides more than the proposal that follows — and in a one-person studio, they are exactly when nobody is free. A brief lands and waits: for attention, for context to be reassembled, for someone to decide which service it even belongs to. The tools sold for this are chatbots that deflect, which protects the calendar by spending the lead. For a studio that trade is backwards, because the conversation is the product.",
      "approach": "The agent was built to qualify, not to deflect. It reads the brief, matches it to one of the six services, asks the questions a first call would ask, and then stops — the close stays human. Under that sits the engineering that makes it safe to run unattended: a Durable Object per conversation on Cloudflare Workers, so each visitor has isolated, consistent state without a database round trip for every turn, and a second Durable Object enforcing quota, because an agent with a language model behind it and no ceiling is an unbounded invoice. Leads land in D1 across three migrations — analytics, lead intelligence, retention runs — a nightly cron posts the digest, and queue-triggered workflows enrich and audit what came in. The admin dashboard reads the same store, so follow-up starts from the record, not from memory.",
      "result": "What changed is who waits. The first response no longer depends on a person being free, and the handoff arrives already halfway understood: service identified, context attached, the question captured in the lead's own words. Because the contact form and the site newsletter both post to the same lead-capture endpoint, there is one store and one truth — which makes response time and lead quality things the studio can measure rather than guess. And the whole system is public: the diagram on the homepage ends at a trigger that opens this agent, so the illustration and the thing it illustrates are one click apart, and anyone evaluating the AI Automation service can poke the thing itself.",
      "deliverables": [
        "Durable Object agent",
        "Quota gate",
        "D1 schema + migrations",
        "Enrichment workflow",
        "Admin dashboard",
        "Lead capture API"
      ],
      "stack": [
        "Cloudflare Workers",
        "Durable Objects",
        "D1",
        "Workflows",
        "TypeScript"
      ],
      "proof": [
        {
          "value": "7,500",
          "label": "lines of Worker source, typechecked before every deploy"
        },
        {
          "value": "3",
          "label": "D1 migrations, versioned"
        },
        {
          "value": "2",
          "label": "Durable Object classes: conversation and quota"
        },
        {
          "value": "3",
          "label": "Workflow classes: enrichment, digest, audit"
        }
      ],
      "businessFrame": "This is the system that answers a new lead on this site before a person is free to. It takes the brief, matches it to a service, drafts the first response, and hands a human a conversation with the context already attached — so response time stops depending on who happens to be available, and every lead lands in one store where it can be measured. The studio sells this as a service; here it runs on the studio itself, in public."
    },
    "es": {
      "client": "CREATIVE MK",
      "title": "El agente de recepción que responde en este sitio",
      "lead": "Automatización IA · Desarrollo",
      "figure": "2 Durable Objects",
      "figureLabel": "uno por conversación, uno imponiendo el techo",
      "challenge": "El agente de recepción existe por un hueco en los primeros cinco minutos. Cuando un lead le escribe a un negocio, lo que pasa en esos minutos decide más que la propuesta que llega después — y en un estudio de una persona, son justo cuando nadie está libre. Un brief aterriza y espera: a que haya atención, a que se reconstruya el contexto, a que alguien decida a qué servicio pertenece. Lo que se vende para esto son chatbots que desvían, que protegen la agenda gastándose al lead. Para un estudio ese intercambio está al revés, porque la conversación es el producto.",
      "approach": "El agente se construyó para calificar, no para desviar. Lee el brief, lo empareja con uno de los seis servicios, hace las preguntas que haría una primera llamada y ahí se detiene: el cierre sigue siendo humano. Debajo está la ingeniería que permite dejarlo correr solo: un Durable Object por conversación sobre Cloudflare Workers, para que cada visitante tenga estado aislado y consistente sin una ida y vuelta a base de datos en cada turno, y un segundo Durable Object que impone cuota, porque un agente con un modelo de lenguaje detrás y sin techo es una factura sin límite. Los leads aterrizan en D1 a través de tres migraciones — analítica, inteligencia de leads, retención — un cron nocturno publica el resumen y workflows disparados por cola enriquecen y auditan lo que llegó. El panel admin lee el mismo almacén, así que el seguimiento parte del registro, no de la memoria.",
      "result": "Lo que cambió es quién espera. La primera respuesta ya no depende de que una persona esté libre, y la entrega llega ya entendida a medias: servicio identificado, contexto adjunto, la pregunta capturada en las palabras del propio lead. Como el formulario de contacto y el newsletter publican al mismo endpoint de captura, hay un almacén y una verdad — y eso vuelve medibles el tiempo de respuesta y la calidad de los leads, en lugar de estimarlos. Todo el sistema es público: el diagrama de la portada termina en un disparador que abre este agente, así que la ilustración y lo que ilustra están a un clic de distancia, donde cualquiera que evalúe el servicio de Automatización IA puede tocarlo.",
      "deliverables": [
        "Agente Durable Object",
        "Compuerta de cuota",
        "Esquema D1 + migraciones",
        "Workflow de enriquecimiento",
        "Panel admin",
        "API de captura"
      ],
      "stack": [
        "Cloudflare Workers",
        "Durable Objects",
        "D1",
        "Workflows",
        "TypeScript"
      ],
      "proof": [
        {
          "value": "7.500",
          "label": "líneas de Worker, con typecheck antes de cada deploy"
        },
        {
          "value": "3",
          "label": "migraciones D1, versionadas"
        },
        {
          "value": "2",
          "label": "clases Durable Object: conversación y cuota"
        },
        {
          "value": "3",
          "label": "clases Workflow: enriquecimiento, resumen, auditoría"
        }
      ],
      "businessFrame": "Este es el sistema que responde a un lead nuevo en este sitio antes de que una persona se desocupe. Toma el brief, lo empareja con un servicio, redacta la primera respuesta y le entrega a un humano una conversación con el contexto ya adjunto — así el tiempo de respuesta deja de depender de quién esté disponible, y cada lead aterriza en un solo almacén donde se puede medir. El estudio vende esto como servicio; aquí corre sobre el estudio mismo, en público."
    }
  },
  {
    "slug": "contour-field",
    "esSlug": "campo-de-contornos",
    "kind": "self",
    "year": "2026",
    "en": {
      "client": "CREATIVE MK",
      "title": "The contour field behind this page",
      "lead": "Websites · Development",
      "figure": "−147 KB",
      "figureLabel": "gzipped, and the 3D got bigger",
      "challenge": "The contour field is the graphics system behind every page of creativemk.net. Its first version made the mistake that argues against a studio rather than for it: a three.js scene behind the hero, which scrolled away at the top and left ninety per cent of the page a flat document. It cost 183 KB of gzipped vendor code to buy a first impression that ended where the reading began. To a visitor deciding whether this studio should build their site, that reads as \"we installed a 3D library\". It does not read as art direction.",
      "approach": "The scene was rewritten as a single fragment shader on one fullscreen triangle, rendered by OGL with surgical imports rather than a whole engine. More importantly, the contour field stopped being the hero's decoration and became the page's ground. One fixed canvas now persists across the whole document, and its state turns with the site's three acts: dense gold contours on ink, a whisper of navy topography on paper, gathering again for the dark close. Scroll position drives the transition and scroll velocity bends it, so the field reacts to how fast you are reading and not only to where you are. The pointer raises the terrain toward the cursor.\n\nTwo constraints shaped the rest. The shader compiles from one source into both GLSL dialects the web still ships, ESSL 1.00 and 3.00, because a WebGL1 context and a WebGL2 context disagree about syntax this code needs. And where there is no GPU to spare, a 2D-canvas tier runs the same wave mathematics instead, so a phone gets a designed fallback rather than the desktop with its heart removed. A frame-time buffer steps resolution down before a visitor can see jank, and the floor tier stops the loop and leaves the field settled. Degradation ends in stillness, never in a slideshow.",
      "result": "The craft now carries the whole scroll instead of the first screen, and the port removed more bytes than it added. The renderer is 36 KB of OGL modules against 183 KB of three.js — gzip -9, file by file, the way the edge serves them to a client that will not take brotli. On the brotli path both numbers fall and the gap narrows: 31 KB against 151 KB. Either basis is a real saving; mixing the two, which an earlier version of this page did, is not a measurement. No script file blocks first paint anywhere on the site — the only classic script in any <head> is the inline reveal bootstrap, which is under a kilobyte and is what keeps the page readable when JavaScript fails. So a visitor never waits on the decoration, and a buyer who opens the network panel finds the numbers where this page said they would be.\n\nTwo failures shipped during the work and are worth publishing, because a case that only lists wins is a brochure. A shader compiled cleanly on the fallback path and not on the main one, so the field went black on exactly the hardware it was written for — the dual-dialect compile above is the fix. And an edge cache served a broken build from behind a fixed one for four hours, which is how long this zone holds a browser cache TTL. Both are in the commit history under their own messages.",
      "deliverables": [
        "Contour shader (GLSL, two dialects)",
        "Scroll-driven act system",
        "Pointer attractor",
        "2D fallback tier",
        "Content-hash fingerprinting"
      ],
      "stack": [
        "OGL",
        "GLSL",
        "GSAP ScrollTrigger",
        "Lenis",
        "Cloudflare Pages"
      ],
      "proof": [
        {
          "value": "36 KB",
          "label": "of renderer, gzip -9, replacing 183 KB of three.js"
        },
        {
          "value": "2",
          "label": "shader dialects compiled from one source: ESSL 1.00 and 3.00"
        },
        {
          "value": "0",
          "label": "render-blocking script files, site-wide"
        }
      ],
      "businessFrame": "Before a buyer asks a website studio for references, they judge the studio's own site: how fast it loads, whether the craft is real or installed. This case is that surface — the graphics system behind every page of creativemk.net, rebuilt so the visible craft grew while the page got lighter. The weight figures are checkable in this repository, and the load behavior is measurable in any browser."
    },
    "es": {
      "client": "CREATIVE MK",
      "title": "El campo de contornos detrás de esta página",
      "lead": "Sitios Web · Desarrollo",
      "figure": "−147 KB",
      "figureLabel": "gzip, y el 3D creció",
      "challenge": "El campo de contornos es el sistema gráfico detrás de cada página de creativemk.net. Su primera versión cometió el error que juega en contra de un estudio en vez de a su favor: una escena three.js detrás del hero, que se despedía arriba y dejaba el noventa por ciento de la página como un documento plano. Costaba 183 KB de código ajeno comprimido con gzip comprar una primera impresión que terminaba donde empezaba la lectura. Para un visitante que decide si este estudio debería construir su sitio, eso se lee como \"instalamos una biblioteca 3D\". No se lee como dirección de arte.",
      "approach": "La escena se reescribió como un solo fragment shader sobre un triángulo a pantalla completa, renderizado por OGL con imports quirúrgicos en vez de un motor entero. Más importante: el campo de contornos dejó de ser la decoración del hero y se volvió el suelo de la página. Ahora un canvas fijo persiste a lo largo de todo el documento, y su estado gira con los tres actos del sitio: contornos dorados densos sobre tinta, un susurro de topografía navy sobre papel, densificando otra vez para el cierre oscuro. La posición de scroll impulsa la transición y la velocidad la dobla, así que el campo reacciona a qué tan rápido lees y no solo a dónde estás. El puntero eleva el terreno hacia el cursor.\n\nDos restricciones dieron forma al resto. El shader compila desde una sola fuente hacia los dos dialectos GLSL que la web todavía sirve, ESSL 1.00 y 3.00, porque un contexto WebGL1 y uno WebGL2 no se ponen de acuerdo en la sintaxis que este código necesita. Y donde no hay GPU disponible corre un tier en canvas 2D con la misma matemática de ondas, así que un teléfono recibe un respaldo diseñado y no el escritorio sin su corazón. Un buffer de tiempo de cuadro baja la resolución antes de que el visitante alcance a ver un tirón, y el tier más bajo detiene el bucle y deja el campo asentado. La degradación termina en quietud, nunca en diapositivas.",
      "result": "El oficio ahora acompaña todo el scroll en lugar de la primera pantalla, y la migración quitó más bytes de los que puso. El renderer son 36 KB de módulos OGL contra 183 KB de three.js — gzip -9, archivo por archivo, como los sirve el edge a un cliente que no acepta brotli. Por la ruta brotli ambos números bajan y la distancia se acorta: 31 KB contra 151 KB. Cualquiera de las dos bases es un ahorro real; mezclarlas, que es lo que hacía una versión anterior de esta página, no es una medición. Ningún archivo de script bloquea el primer render en todo el sitio — el único script clásico en un <head> es el bootstrap inline de revelado, que pesa menos de un kilobyte y es justamente lo que deja la página legible cuando el JavaScript falla. Así que el visitante nunca espera por la decoración, y el comprador que abre el panel de red encuentra los números donde esta página dijo que estarían.\n\nDos fallos se publicaron durante el trabajo y vale la pena contarlos, porque un caso que solo enumera aciertos es un folleto. Un shader compilaba limpio en la ruta de respaldo y no en la principal, así que el campo se iba a negro justo en el hardware para el que fue escrito — la compilación de doble dialecto de arriba es el arreglo. Y una caché de borde sirvió una versión rota por delante de una ya corregida durante cuatro horas, que es el TTL de caché de navegador que tiene configurado esta zona. Los dos están en el historial de commits con su propio mensaje.",
      "deliverables": [
        "Shader de contornos (GLSL, dos dialectos)",
        "Sistema de actos por scroll",
        "Atractor de puntero",
        "Tier 2D de respaldo",
        "Fingerprinting por hash"
      ],
      "stack": [
        "OGL",
        "GLSL",
        "GSAP ScrollTrigger",
        "Lenis",
        "Cloudflare Pages"
      ],
      "proof": [
        {
          "value": "36 KB",
          "label": "de renderer con gzip -9, reemplazando 183 KB de three.js"
        },
        {
          "value": "2",
          "label": "dialectos de shader desde una fuente: ESSL 1.00 y 3.00"
        },
        {
          "value": "0",
          "label": "archivos de script bloqueantes en todo el sitio"
        }
      ],
      "businessFrame": "Antes de pedir referencias a un estudio que vende sitios web, el comprador juzga el sitio del propio estudio: qué tan rápido carga, si el oficio es real o instalado. Este caso es esa superficie — el sistema gráfico detrás de cada página de creativemk.net, reconstruido para que el oficio visible creciera mientras la página se hacía más liviana. Las cifras de peso son verificables en este repositorio, y el comportamiento de carga se puede medir en cualquier navegador."
    }
  }
];

/**
 * The three prose blocks, pre-split into paragraphs.
 *
 * They were rendered as one <p> each, which was fine while each was one
 * paragraph and silently wrong the moment one needed two: a blank line in the
 * source collapses to a space in HTML, so the break a reader needs simply
 * does not arrive. Derived here rather than split in the template because
 * Nunjucks has no split filter, and because notes.js already establishes that
 * paragraph shape is data, not markup.
 *
 * `challenge`, `approach` and `result` are left intact — the case page's meta
 * description and its schema abstract are both truncated from `challenge`.
 */
const paras = (text) => String(text).split('\n\n').map((p) => p.trim()).filter(Boolean);
const withParas = (locale) => ({
  ...locale,
  challengeParas: paras(locale.challenge),
  approachParas: paras(locale.approach),
  resultParas: paras(locale.result)
});

export default cases.map((entry) => ({
  ...entry,
  en: withParas(entry.en),
  es: withParas(entry.es)
}));
