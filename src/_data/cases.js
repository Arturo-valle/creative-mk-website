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
    "kind": "self",
    "year": "2026",
    "en": {
      "client": "CREATIVE MK",
      "title": "The intake agent that answers on this site",
      "lead": "AI Automation · Development",
      "figure": "4 stations",
      "figureLabel": "from brief to human handoff",
      "challenge": "When a lead writes to a business, what happens in the first five minutes decides more than the proposal that follows — and in a one-person studio, those minutes are exactly when nobody is free. A brief lands and waits: for attention, for context to be reassembled, for someone to decide which service it even belongs to. The tools sold for this are chatbots that deflect, which protects the calendar by spending the lead. For a studio that trade is backwards, because the conversation is the product.",
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
      "figure": "4 estaciones",
      "figureLabel": "del brief a la entrega humana",
      "challenge": "Cuando un lead le escribe a un negocio, lo que pasa en los primeros cinco minutos decide más que la propuesta que llega después — y en un estudio de una persona, esos minutos son justo cuando nadie está libre. Un brief aterriza y espera: a que haya atención, a que se reconstruya el contexto, a que alguien decida a qué servicio pertenece. Lo que se vende para esto son chatbots que desvían, que protegen la agenda gastándose al lead. Para un estudio ese intercambio está al revés, porque la conversación es el producto.",
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
    "kind": "self",
    "year": "2026",
    "en": {
      "client": "CREATIVE MK",
      "title": "The field behind this page",
      "lead": "Websites · Development",
      "figure": "−152 KB",
      "figureLabel": "gzipped, and the 3D got bigger",
      "challenge": "The first version made the mistake that argues against a studio rather than for it: a three.js scene behind the hero that scrolled away at the top, leaving ninety per cent of the page a flat document. It cost 184 KB of gzipped vendor code to make a first impression that ended where the reading began — and to a visitor deciding whether this studio should build their site, it read as \"we installed a 3D library\", not as art direction.",
      "approach": "The scene was rewritten as a single fragment shader on one fullscreen triangle, rendered by OGL with surgical imports instead of a whole engine. It stopped being the hero's decoration and became the page's ground: one fixed canvas whose state turns with the site's three acts — dense gold contours on ink, a whisper of navy topography on paper, gathering again for the dark close — driven by scroll position and velocity. The pointer raises the terrain toward the cursor. Where there is no GPU to spare, a 2D-canvas version of the same wave maths runs instead, so a phone gets a designed tier rather than the desktop minus its heart.",
      "result": "The craft now carries the whole scroll instead of the first screen, and the port removed more bytes than it added: 31 KB of OGL modules against 184 KB of three.js, both gzipped per file as the edge serves them, plus zero render-blocking scripts site-wide. A visitor never waits on the decoration, and a buyer who opens the network panel finds the numbers where this page said they would be. Two failures shipped and were caught in the process — a shader that compiled only on the fallback path, an edge cache that served a broken version behind a fixed one — both recorded in the commit history.",
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
          "value": "31 KB",
          "label": "of renderer gzipped, replacing 184 KB of three.js"
        },
        {
          "value": "2",
          "label": "shader dialects compiled from one source: ESSL 1.00 and 3.00"
        },
        {
          "value": "0",
          "label": "render-blocking scripts, site-wide"
        }
      ],
      "businessFrame": "Before a buyer asks a website studio for references, they judge the studio's own site: how fast it loads, whether the craft is real or installed. This case is that surface — the graphics system behind every page of creativemk.net, rebuilt so the visible craft grew while the page got lighter. The weight figures are checkable in this repository, and the load behavior is measurable in any browser."
    },
    "es": {
      "client": "CREATIVE MK",
      "title": "El campo detrás de esta página",
      "lead": "Sitios Web · Desarrollo",
      "figure": "−152 KB",
      "figureLabel": "gzip, y el 3D creció",
      "challenge": "La primera versión cometió el error que juega en contra de un estudio en vez de a su favor: una escena three.js detrás del hero que se despedía arriba, dejando el noventa por ciento de la página como un documento plano. Costaba 184 KB de código ajeno comprimido dar una primera impresión que terminaba donde empezaba la lectura — y para un visitante decidiendo si este estudio debería construir su sitio, se leía como \"instalamos una librería 3D\", no como dirección de arte.",
      "approach": "La escena se reescribió como un solo fragment shader sobre un triángulo a pantalla completa, renderizado por OGL con imports quirúrgicos en vez de un motor entero. Dejó de ser la decoración del hero y se volvió el suelo de la página: un canvas fijo cuyo estado gira con los tres actos del sitio — contornos dorados densos sobre tinta, un susurro de topografía navy sobre papel, densificando otra vez para el cierre oscuro — impulsado por posición y velocidad de scroll. El puntero eleva el terreno hacia el cursor. Donde no hay GPU disponible corre una versión en canvas 2D de la misma matemática de ondas, así que un teléfono recibe un tier diseñado y no el escritorio sin su corazón.",
      "result": "El oficio ahora acompaña todo el scroll en lugar de la primera pantalla, y el puerto quitó más bytes de los que puso: 31 KB de módulos OGL contra 184 KB de three.js, ambos comprimidos archivo por archivo como los sirve el edge, más cero scripts bloqueantes en todo el sitio. El visitante nunca espera por la decoración, y el comprador que abre el panel de red encuentra los números donde esta página dijo que estarían. Dos fallos se publicaron y se cazaron en el camino — un shader que compilaba solo en la ruta de respaldo, una caché de borde que sirvió una versión rota detrás de una ya arreglada — ambos registrados en el historial de commits.",
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
          "value": "31 KB",
          "label": "de renderer comprimido, reemplazando 184 KB de three.js"
        },
        {
          "value": "2",
          "label": "dialectos de shader desde una fuente: ESSL 1.00 y 3.00"
        },
        {
          "value": "0",
          "label": "scripts bloqueantes en todo el sitio"
        }
      ],
      "businessFrame": "Antes de pedir referencias a un estudio que vende sitios web, el comprador juzga el sitio del propio estudio: qué tan rápido carga, si el oficio es real o instalado. Este caso es esa superficie — el sistema gráfico detrás de cada página de creativemk.net, reconstruido para que el oficio visible creciera mientras la página se hacía más liviana. Las cifras de peso son verificables en este repositorio, y el comportamiento de carga se puede medir en cualquier navegador."
    }
  }
];

export default cases;
