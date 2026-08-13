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
const cases = [
  {
    slug: 'intake-agent',
    kind: 'self',
    year: '2026',
    en: {
      client: 'CREATIVE MK',
      title: 'The intake agent that answers on this site',
      lead: 'AI Automation · Development',
      figure: '4 stations',
      figureLabel: 'from brief to human handoff',
      challenge:
        'A one-person studio has one unavoidable bottleneck: the first five minutes after a lead arrives. A brief lands, and it waits — for attention, for context to be reassembled, for someone to decide which service it even belongs to. The answer most vendors sell for this is a chatbot that deflects. That is the opposite of what a studio wants, because the conversation IS the product.',
      approach:
        'The concierge runs on Cloudflare Workers with a Durable Object per conversation, so each visitor has isolated, consistent state without a database round trip for every turn. A second Durable Object enforces quota, because an agent with a language model behind it and no ceiling is an unbounded invoice. Leads land in D1 across three migrations — analytics, lead intelligence, retention runs — and a scheduled workflow enriches them and posts a daily digest. The admin dashboard reads the same store. What the agent never does is close the loop by itself: it drafts, it routes, it attaches context, and it hands a person a conversation that is already halfway understood.',
      result:
        'The diagram on the homepage is not an illustration of this system — it is drawn from it, station for station. The contact form and the site newsletter both post to the same lead-capture endpoint, so there is one store and one truth. It is the studio running its own AI Automation service on itself, in public, where anyone evaluating that service can poke it.',
      deliverables: ['Durable Object agent', 'Quota gate', 'D1 schema + migrations', 'Enrichment workflow', 'Admin dashboard', 'Lead capture API'],
      stack: ['Cloudflare Workers', 'Durable Objects', 'D1', 'Workflows', 'TypeScript'],
      proof: [
        { value: '7,500', label: 'lines of Worker source, typechecked in CI' },
        { value: '3', label: 'D1 migrations, versioned' },
        { value: '2', label: 'Durable Object classes: conversation and quota' }
      ]
    },
    es: {
      client: 'CREATIVE MK',
      title: 'El agente de recepción que responde en este sitio',
      lead: 'Automatización IA · Desarrollo',
      figure: '4 estaciones',
      figureLabel: 'del brief a la entrega humana',
      challenge:
        'Un estudio de una persona tiene un cuello de botella inevitable: los primeros cinco minutos tras la llegada de un lead. Un brief aterriza y espera — a que haya atención, a que se reconstruya el contexto, a que alguien decida a qué servicio pertenece. Lo que casi todos venden para esto es un chatbot que desvía. Es lo contrario de lo que un estudio quiere, porque la conversación ES el producto.',
      approach:
        'El concierge corre sobre Cloudflare Workers con un Durable Object por conversación, así cada visitante tiene estado aislado y consistente sin una ida y vuelta a base de datos en cada turno. Un segundo Durable Object impone cuota, porque un agente con un modelo de lenguaje detrás y sin techo es una factura sin límite. Los leads aterrizan en D1 a través de tres migraciones — analítica, inteligencia de leads, retención — y un workflow programado los enriquece y publica un resumen diario. El panel admin lee el mismo almacén. Lo que el agente nunca hace es cerrar el ciclo solo: redacta, enruta, adjunta contexto y le entrega a una persona una conversación ya entendida a medias.',
      result:
        'El diagrama de la portada no es una ilustración de este sistema — está dibujado desde él, estación por estación. El formulario de contacto y el newsletter publican al mismo endpoint de captura, así que hay un almacén y una verdad. Es el estudio corriendo su propio servicio de Automatización IA sobre sí mismo, en público, donde cualquiera que evalúe ese servicio puede tocarlo.',
      deliverables: ['Agente Durable Object', 'Compuerta de cuota', 'Esquema D1 + migraciones', 'Workflow de enriquecimiento', 'Panel admin', 'API de captura'],
      stack: ['Cloudflare Workers', 'Durable Objects', 'D1', 'Workflows', 'TypeScript'],
      proof: [
        { value: '7.500', label: 'líneas de Worker, con typecheck en CI' },
        { value: '3', label: 'migraciones D1, versionadas' },
        { value: '2', label: 'clases Durable Object: conversación y cuota' }
      ]
    }
  },
  {
    slug: 'contour-field',
    kind: 'self',
    year: '2026',
    en: {
      client: 'CREATIVE MK',
      title: 'The field behind this page',
      lead: 'Websites · Development',
      figure: '−100 KB',
      figureLabel: 'the 3D got bigger and the payload got smaller',
      challenge:
        'The first version was the mistake almost every studio site makes: a three.js scene behind the hero that scrolls away at the top, after which ninety per cent of the page is a flat document. It read as "we installed a 3D library", not as art direction — and it cost 118 KB of vendor code to say it.',
      approach:
        'The scene was rewritten as a single fragment shader on one fullscreen triangle, rendered by OGL with surgical imports instead of a whole engine. It stopped being the hero\'s decoration and became the page\'s ground: one fixed canvas whose state turns with the site\'s three acts — dense gold contours on ink, a whisper of navy topography on paper, then gathering again for the dark close — driven by scroll position and scroll velocity as shader uniforms. The pointer raises the terrain toward the cursor. A 2D-canvas version of the same wave maths runs where there is no GPU to spare, so a phone gets a designed tier rather than the desktop minus its heart.',
      result:
        'The 3D now carries the whole scroll instead of the first screen, and the port removed more bytes than it added: roughly 12 KB of OGL modules replacing 118 KB of three.js, net-negative even with the second renderer for small machines. Two failures shipped and were caught in the process, both recorded in the commit history — a shader that compiled only on the fallback path, and an edge cache that served the broken version behind a fixed one.',
      deliverables: ['Contour shader (GLSL, two dialects)', 'Scroll-driven act system', 'Pointer attractor', '2D fallback tier', 'Content-hash fingerprinting'],
      stack: ['OGL', 'GLSL', 'GSAP ScrollTrigger', 'Lenis', 'Cloudflare Pages'],
      proof: [
        { value: '12 KB', label: 'of renderer, replacing 118 KB of three.js' },
        { value: '2', label: 'shader dialects: ESSL 1.00 and 3.00, both verified' },
        { value: '0', label: 'blocking scripts on any route' }
      ]
    },
    es: {
      client: 'CREATIVE MK',
      title: 'El campo detrás de esta página',
      lead: 'Sitios Web · Desarrollo',
      figure: '−100 KB',
      figureLabel: 'el 3D creció y el peso bajó',
      challenge:
        'La primera versión fue el error que comete casi todo sitio de estudio: una escena three.js detrás del hero que se despide arriba, y después el noventa por ciento de la página es un documento plano. Se leía como "instalamos una librería 3D", no como dirección de arte — y costaba 118 KB de código ajeno decirlo.',
      approach:
        'La escena se reescribió como un solo fragment shader sobre un triángulo a pantalla completa, renderizado por OGL con imports quirúrgicos en vez de un motor entero. Dejó de ser la decoración del hero y se volvió el suelo de la página: un canvas fijo cuyo estado gira con los tres actos del sitio — contornos dorados densos sobre tinta, un susurro de topografía navy sobre papel, y densificando otra vez para el cierre oscuro — impulsado por posición y velocidad de scroll como uniforms del shader. El puntero eleva el terreno hacia el cursor. Una versión en canvas 2D de la misma matemática de ondas corre donde no hay GPU disponible, así que un teléfono recibe un tier diseñado en vez del escritorio sin su corazón.',
      result:
        'El 3D ahora carga todo el scroll en lugar de la primera pantalla, y el puerto quitó más bytes de los que puso: unos 12 KB de módulos OGL reemplazando 118 KB de three.js, negativo neto incluso con el segundo renderer para máquinas pequeñas. Dos fallos se publicaron y se cazaron en el proceso, ambos registrados en el historial — un shader que compilaba solo en la ruta de respaldo, y una caché de borde que sirvió la versión rota detrás de una ya arreglada.',
      deliverables: ['Shader de contornos (GLSL, dos dialectos)', 'Sistema de actos por scroll', 'Atractor de puntero', 'Tier 2D de respaldo', 'Fingerprinting por hash'],
      stack: ['OGL', 'GLSL', 'GSAP ScrollTrigger', 'Lenis', 'Cloudflare Pages'],
      proof: [
        { value: '12 KB', label: 'de renderer, reemplazando 118 KB de three.js' },
        { value: '2', label: 'dialectos de shader: ESSL 1.00 y 3.00, ambos verificados' },
        { value: '0', label: 'scripts bloqueantes en ninguna ruta' }
      ]
    }
  }
];

export default cases;
