/**
 * The six services, lifted out of the JS array they were trapped in.
 *
 * The architecture audit's sharpest finding: `servicesData` in js/main.js held
 * six services' worth of positioning copy in both languages, rendered into an
 * accordion — invisible to search as distinct documents, unlinkable in a
 * proposal, and declared to Google as an OfferCatalog of six Services with no
 * URL for any of them. The business exists to sell these six things and none
 * of them had an address.
 *
 * The copy here is the copy that already existed. What is new is the slug, the
 * ordering, and the promise that each one is a page.
 */
/*
 * Deepened 2026-08-13. Each locale now carries the page's own content:
 * hook (the homepage accordion's one line), intro, deliverables,
 * engagements, faqs and proofNote. Before this the service page rendered
 * the same desc the accordion showed and roughly one sentence of its own,
 * which is why clicking into a service delivered deja vu. Durations only
 * ever use the published ranges; an anti-fabrication pass verified every
 * claim against this repository.
 */
const services = [
  {
    "slug": "branding",
    "media": "images/services/branding.jpg",
    "esSlug": "branding",
    "index": 0,
    "en": {
      "title": "Branding",
      "lead": "Identity and positioning",
      "desc": "We define the promise, voice, visual identity, offer architecture, and brand rules that help a business feel consistent across website, ads, content, sales materials, and future campaigns.",
      "proof": "Best for new brands, premium repositioning, service businesses, and teams that need trust before scaling attention.",
      "tags": [
        "Strategy",
        "Identity",
        "Guidelines"
      ],
      "hook": "The promise, voice and rules that make every page, ad and email point the same way.",
      "intro": [
        "Most brand problems show up somewhere else first. The ad gets clicks and the landing page loses them. The proposal sounds like a different company than the website. A new hire writes an email and nobody can say whether it sounds right. None of those are design problems. They are the absence of a decision, repeated in every place a decision was needed.",
        "Branding here means making those decisions once and writing them down: who the brand helps, what changes for them, why to trust it, how it speaks, and what it looks like. The deliverable is not a logo file. It is a system another person can apply on Monday without asking — a website, an ad, a proposal and a sales conversation that point the same way."
      ],
      "deliverables": [
        {
          "name": "Positioning brief",
          "detail": "One page that states who the brand helps, what changes for them, and why to trust it — the sentence every later asset has to agree with."
        },
        {
          "name": "Voice and message guide",
          "detail": "The voice written as rules with before-and-after examples: the words the brand uses, the words it never uses, and how it says no."
        },
        {
          "name": "Visual identity system",
          "detail": "Logo, type, color and spacing delivered as working files plus a usage reference, ready for web, ads and documents in both languages."
        },
        {
          "name": "Offer architecture",
          "detail": "The services named, ordered and described so a buyer can tell what to ask for first and what comes after."
        },
        {
          "name": "Brand rules",
          "detail": "The do-and-don't document that lets a freelancer, a new hire or a future agency produce consistent work without a review call."
        },
        {
          "name": "First applications",
          "detail": "The system applied to the highest-traffic surfaces first — site hero, one ad, proposal cover, email signature — so consistency starts where buyers actually look."
        }
      ],
      "engagements": [
        {
          "name": "Brand audit",
          "duration": "1-2 weeks",
          "includes": "A read of the current site, materials and ads against the promise they imply; where the brand contradicts itself; and a prioritized fix list you can act on with or without us."
        },
        {
          "name": "Identity system",
          "duration": "4-10 weeks",
          "includes": "The full run for a new brand or a first serious version of one: positioning, voice, visual identity, offer architecture, brand rules, and first applications."
        },
        {
          "name": "Repositioning",
          "duration": "4-10 weeks",
          "includes": "For a brand that already exists: we keep what is working, rebuild the promise and the surfaces that contradict it, and leave the rules in place so the drift does not return."
        }
      ],
      "faqs": [
        {
          "q": "Do we need a rebrand, or just a better website?",
          "a": "Often the honest answer is the website. If the promise is sound and the site simply fails to state it, branding is the wrong purchase, and we will point you at the websites service instead. The audit exists to make that call before you commit to the longer engagement."
        },
        {
          "q": "We already have a logo we like. Is that a problem?",
          "a": "No. This service is not a logo replacement program. If the mark works, it stays, and the work concentrates on the parts that usually do not exist yet: the promise, the voice, the offer architecture, and the rules that keep them consistent."
        },
        {
          "q": "How does this work in two languages?",
          "a": "The Spanish is written, not translated. Voice rules and key messages are defined separately in English and Spanish, because a promise that only sounds native in one language is only trusted in one market. This site runs the same way, and it is the standing sample."
        },
        {
          "q": "Why are there no client branding cases on this page?",
          "a": "Because of the publishing rule: client work goes up with a name and an agreed figure, or it does not go up. The studio's two signed engagements sit under that rule today. Until then, the proof for this service is the brand you are reading right now."
        }
      ],
      "proofNote": "The most honest sample of this service is the site around it: the voice, the publishing rule and the visual system came out of the same process this page describes, in both languages. No client branding case is published yet — the studio’s two signed engagements are still unnamed — and nothing invented stands in for them."
    },
    "es": {
      "title": "Branding",
      "lead": "Identidad y posicionamiento",
      "desc": "Definimos promesa, voz, identidad visual, arquitectura de oferta y reglas de marca para que el negocio se sienta consistente en sitio web, anuncios, contenido, ventas y futuras campañas.",
      "proof": "Ideal para marcas nuevas, reposicionamientos premium, negocios de servicio y equipos que necesitan confianza antes de escalar la atención.",
      "tags": [
        "Estrategia",
        "Identidad",
        "Guías"
      ],
      "hook": "La promesa, la voz y las reglas que hacen que cada página, anuncio y correo apunten igual.",
      "intro": [
        "La mayoría de los problemas de marca aparecen primero en otro lado. El anuncio consigue clics y la landing los pierde. La propuesta suena a una empresa distinta a la del sitio. Alguien nuevo escribe un correo y nadie sabe decir si suena bien. Nada de eso es un problema de diseño. Es la ausencia de una decisión, repetida en cada lugar donde hacía falta una.",
        "Aquí branding significa tomar esas decisiones una sola vez y dejarlas por escrito: a quién ayuda la marca, qué cambia para esa persona, por qué confiar, cómo habla y cómo se ve. El entregable no es un archivo de logo. Es un sistema que otra persona puede aplicar el lunes sin preguntar — un sitio, un anuncio, una propuesta y una conversación de ventas que apuntan en la misma dirección."
      ],
      "deliverables": [
        {
          "name": "Brief de posicionamiento",
          "detail": "Una página que establece a quién ayuda la marca, qué cambia para esa persona y por qué confiar — la frase con la que todo lo que venga después tiene que estar de acuerdo."
        },
        {
          "name": "Guía de voz y mensajes",
          "detail": "La voz escrita como reglas con ejemplos de antes y después: las palabras que la marca usa, las que nunca usa y cómo dice que no."
        },
        {
          "name": "Sistema de identidad visual",
          "detail": "Logo, tipografía, color y espaciado entregados como archivos de trabajo más una referencia de uso, listos para web, anuncios y documentos en ambos idiomas."
        },
        {
          "name": "Arquitectura de oferta",
          "detail": "Los servicios nombrados, ordenados y descritos para que un comprador sepa qué pedir primero y qué viene después."
        },
        {
          "name": "Reglas de marca",
          "detail": "El documento de qué sí y qué no que permite a un freelancer, un nuevo integrante o una agencia futura producir trabajo consistente sin una llamada de revisión."
        },
        {
          "name": "Primeras aplicaciones",
          "detail": "El sistema aplicado primero a las superficies con más tráfico — el hero del sitio, un anuncio, la portada de propuesta, la firma de correo — para que la consistencia empiece donde mira el comprador."
        }
      ],
      "engagements": [
        {
          "name": "Auditoría de marca",
          "duration": "1-2 semanas",
          "includes": "Una lectura del sitio, los materiales y los anuncios actuales contra la promesa que implican; dónde se contradice la marca; y una lista de arreglos priorizada que puedes ejecutar con o sin nosotros."
        },
        {
          "name": "Sistema de identidad",
          "duration": "4-10 semanas",
          "includes": "El recorrido completo para una marca nueva o la primera versión seria de una: posicionamiento, voz, identidad visual, arquitectura de oferta, reglas de marca y primeras aplicaciones."
        },
        {
          "name": "Reposicionamiento",
          "duration": "4-10 semanas",
          "includes": "Para una marca que ya existe: conservamos lo que funciona, reconstruimos la promesa y las superficies que la contradicen, y dejamos las reglas instaladas para que la deriva no regrese."
        }
      ],
      "faqs": [
        {
          "q": "¿Necesitamos un rebranding o solo un mejor sitio web?",
          "a": "Muchas veces la respuesta honesta es el sitio. Si la promesa está bien y el sitio simplemente no la comunica, branding es la compra equivocada, y te vamos a señalar el servicio de sitios web. La auditoría existe para tomar esa decisión antes de comprometerte con el proyecto largo."
        },
        {
          "q": "Ya tenemos un logo que nos gusta. ¿Es un problema?",
          "a": "No. Este servicio no es un programa de reemplazo de logos. Si la marca gráfica funciona, se queda, y el trabajo se concentra en lo que normalmente todavía no existe: la promesa, la voz, la arquitectura de oferta y las reglas que las mantienen consistentes."
        },
        {
          "q": "¿Cómo funciona en dos idiomas?",
          "a": "El español se escribe, no se traduce. Las reglas de voz y los mensajes clave se definen por separado en inglés y en español, porque una promesa que solo suena nativa en un idioma solo genera confianza en un mercado. Este sitio funciona así, y es la muestra permanente."
        },
        {
          "q": "¿Por qué no hay casos de branding de clientes en esta página?",
          "a": "Por la regla de publicación: el trabajo de cliente se publica con nombre y una cifra acordada, o no se publica. Los dos proyectos firmados del estudio están bajo esa regla hoy. Mientras tanto, la prueba de este servicio es la marca que estás leyendo ahora mismo."
        }
      ],
      "proofNote": "La muestra más honesta de este servicio es el sitio que lo rodea: la voz, la regla de publicación y el sistema visual salieron del mismo proceso que describe esta página, en ambos idiomas. Todavía no hay un caso de branding de cliente publicado — los dos proyectos firmados del estudio siguen sin nombre — y nada inventado ocupa su lugar."
    }
  },
  {
    "slug": "websites",
    "media": "images/services/web-design.jpg",
    "esSlug": "sitios-web",
    "index": 1,
    "en": {
      "title": "Websites",
      "lead": "Marketing site",
      "desc": "We design and build editorial, conversion-aware websites with clear messaging, UX structure, service pathways, proof blocks, SEO foundations, and a contact flow that respects the buyer.",
      "proof": "Best for service brands, expert firms, local leaders, and companies whose current site does not explain the offer fast enough.",
      "tags": [
        "UX",
        "Copy",
        "SEO"
      ],
      "hook": "An editorial site where every section has a job: explain, prove, or move the visitor forward.",
      "intro": [
        "A marketing site has one job that most sites fail at: letting a stranger work out, in the first moments, who you help, what changes, and why to trust you. When that fails, the design carries weight the message should be carrying, and the contact form stays quiet. The work here is structural before it is visual: the promise, the page order, the path from question to next step.",
        "The build follows the structure. Every page ships with its own URL, its own title, and its own reason to rank. Forms post somewhere real, measurement is connected on delivery, and you leave with a session that lets you edit the site yourself. What changes is simple: the site stops describing the business and starts doing part of its work."
      ],
      "deliverables": [
        {
          "name": "Sitemap and message plan",
          "detail": "A written page list stating what each page must prove and which service path takes priority, agreed before design starts."
        },
        {
          "name": "The deciding screen, designed",
          "detail": "The homepage resolved and approved before a line of code, because it is the screen that decides whether a visitor stays."
        },
        {
          "name": "Page copy, in one language or two",
          "detail": "Structure and copy shaped together in English, Spanish, or both, so the message does not arrive after the layout."
        },
        {
          "name": "The built site",
          "detail": "Responsive pages you can open on your phone and walk end to end before launch, then published on fast static infrastructure."
        },
        {
          "name": "SEO foundations",
          "detail": "A URL, title, meta description, and structured data for every page that sells something, so each offer is a document search can find."
        },
        {
          "name": "Connected contact flow",
          "detail": "Forms wired to a real capture endpoint, with measurement in place at delivery rather than promised for later."
        }
      ],
      "engagements": [
        {
          "name": "Landing page or audit",
          "duration": "1-2 weeks",
          "includes": "A single conversion-focused page, or a written audit of the current site: what works, what is weak, and what to rebuild first."
        },
        {
          "name": "Full website",
          "duration": "4-8 weeks",
          "includes": "Sitemap, messaging, design, build, SEO foundations, connected forms and measurement, and the editing handoff, with a navigable version in your hands midway through."
        },
        {
          "name": "Redesign of an existing site",
          "duration": "4-8 weeks",
          "includes": "Audit first, then a rebuild that preserves what is working and replaces the sections where the visitor gets lost."
        }
      ],
      "faqs": [
        {
          "q": "Do you write the copy, or do I bring it?",
          "a": "Structure and copy are shaped together, because a layout designed around missing text is a guess. You bring the knowledge of your business; we turn it into a message and a page order. The work runs in English and Spanish, natively in both."
        },
        {
          "q": "Can you work from my existing site instead of starting over?",
          "a": "Yes. An audit comes first: what is working is preserved, weak sections are rebuilt, and the brand, site, and follow-up path are connected into one system. Sometimes the honest recommendation is to keep more than you expected."
        },
        {
          "q": "How do I know the site will be fast?",
          "a": "Because the site you are reading is the reference, and its performance work is published as a case. The animated field behind these pages runs on 36 KB of renderer, gzipped, with zero render-blocking script files site-wide, and the measurements live in the case study, not in this paragraph."
        },
        {
          "q": "What do I actually have while the work runs?",
          "a": "A plan first. The homepage designed and approved before any build. Midway you open a navigable site on your phone, and delivery lands inside the 4-8 week range for a full site: published, forms connected, measurement in place."
        }
      ],
      "proofNote": "The honest proof for this service is the site it lives on: the WebGL field behind these pages is published as a self-initiated case, contour-field, with the byte counts, the fallback tier, and two shipped failures on record. Client cases join it the day their names are cleared."
    },
    "es": {
      "title": "Sitios Web",
      "lead": "Sitio de marketing",
      "desc": "Diseñamos y construimos sitios editoriales orientados a conversión, con mensaje claro, estructura UX, rutas de servicio, bloques de prueba, bases SEO y un contacto respetuoso para el comprador.",
      "proof": "Ideal para marcas de servicio, firmas expertas, líderes locales y empresas cuyo sitio actual no explica la oferta con suficiente rapidez.",
      "tags": [
        "UX",
        "Copy",
        "SEO"
      ],
      "hook": "Un sitio editorial donde cada sección tiene una función: explicar, probar o mover al visitante.",
      "intro": [
        "Un sitio de marketing tiene una sola tarea en la que casi todos fallan: que un desconocido entienda, en los primeros momentos, a quién ayudas, qué cambia y por qué confiar. Cuando eso falla, el diseño carga el peso que debería cargar el mensaje, y el formulario de contacto se queda en silencio. Aquí el trabajo es estructural antes que visual: la promesa, el orden de las páginas, la ruta de la pregunta al siguiente paso.",
        "La construcción sigue a la estructura. Cada página sale con su propia URL, su propio título y su propia razón para posicionar. Los formularios llegan a un destino real, la medición queda conectada en la entrega, y te vas con una sesión para editar el sitio tú mismo. Lo que cambia es simple: el sitio deja de describir el negocio y empieza a hacer parte de su trabajo."
      ],
      "deliverables": [
        {
          "name": "Mapa del sitio y plan de mensaje",
          "detail": "Una lista de páginas por escrito que dice qué debe probar cada una y qué ruta de servicio tiene prioridad, acordada antes de diseñar."
        },
        {
          "name": "La pantalla que decide, diseñada",
          "detail": "La portada resuelta y aprobada antes de escribir una línea de código, porque es la pantalla que decide si el visitante se queda."
        },
        {
          "name": "Textos de página, en uno o dos idiomas",
          "detail": "Estructura y copy se trabajan juntos, en español, inglés o ambos, para que el mensaje no llegue después del layout."
        },
        {
          "name": "El sitio construido",
          "detail": "Páginas responsivas que abres en tu móvil y recorres enteras antes del lanzamiento, publicadas sobre infraestructura estática y rápida."
        },
        {
          "name": "Bases SEO",
          "detail": "URL, título, meta descripción y datos estructurados para cada página que vende algo, de modo que cada oferta sea un documento que el buscador puede encontrar."
        },
        {
          "name": "Contacto conectado",
          "detail": "Formularios apuntando a un destino real de captura, con la medición puesta en la entrega y no prometida para después."
        },
        {
          "name": "Sesión de entrega",
          "detail": "Una sesión de trabajo donde aprendes a cambiar tus textos e imágenes, para que las actualizaciones pequeñas no necesiten un ticket."
        }
      ],
      "engagements": [
        {
          "name": "Landing o auditoría",
          "duration": "1-2 semanas",
          "includes": "Una página enfocada en conversión, o una auditoría por escrito del sitio actual: qué funciona, qué está débil y qué reconstruir primero."
        },
        {
          "name": "Sitio completo",
          "duration": "4-8 semanas",
          "includes": "Mapa del sitio, mensaje, diseño, construcción, bases SEO, formularios y medición conectados, y la sesión de edición, con una versión navegable en tus manos a mitad de camino."
        },
        {
          "name": "Rediseño de un sitio existente",
          "duration": "4-8 semanas",
          "includes": "Primero la auditoría; después una reconstrucción que conserva lo que funciona y reemplaza las secciones donde se pierde al visitante."
        }
      ],
      "faqs": [
        {
          "q": "¿Escriben ustedes los textos o los traigo yo?",
          "a": "Estructura y copy se trabajan juntos, porque un layout diseñado alrededor de texto que no existe es una apuesta. Tú traes el conocimiento del negocio; nosotros lo convertimos en mensaje y orden de páginas. El trabajo corre en español e inglés, nativo en los dos."
        },
        {
          "q": "¿Pueden partir de mi sitio actual en lugar de empezar de cero?",
          "a": "Sí. Primero una auditoría: se conserva lo que funciona, se reconstruyen las secciones débiles y se conectan marca, sitio y seguimiento en un solo sistema. A veces la recomendación honesta es conservar más de lo que esperabas."
        },
        {
          "q": "¿Cómo sé que el sitio va a ser rápido?",
          "a": "Porque el sitio que estás leyendo es la referencia, y su trabajo de rendimiento está publicado como caso. El campo animado detrás de estas páginas corre sobre 36 KB de renderer con gzip, sin ningún archivo de script bloqueante en todo el sitio, y las mediciones viven en el caso, no en este párrafo."
        },
        {
          "q": "¿Qué tengo en la mano mientras avanzamos?",
          "a": "Primero un plan. Después la portada diseñada y aprobada antes de construir. A mitad de camino abres un sitio navegable en tu móvil, y la entrega llega dentro del rango de 4-8 semanas para un sitio completo: publicado, formularios conectados, medición puesta."
        }
      ],
      "proofNote": "La prueba honesta de este servicio es el sitio donde vive: el campo WebGL detrás de estas páginas está publicado como caso propio, contour-field, con los bytes contados, el tier de respaldo y dos fallos publicados en el registro. Los casos de cliente se sumarán el día que sus nombres queden aprobados."
    }
  },
  {
    "slug": "product-ux-ui",
    "media": "images/services/ux-ui-design-premium-preview.jpg",
    "esSlug": "producto-digital-ux-ui",
    "index": 2,
    "en": {
      "title": "Digital Product UX/UI",
      "lead": "Product experience",
      "desc": "We map product journeys, dashboards, portals, onboarding flows, and app interfaces so complex actions feel clear before a team commits to a build.",
      "proof": "Best for SaaS ideas, internal tools, client portals, MVPs, and businesses with a workflow that needs a better interface.",
      "tags": [
        "Flows",
        "Prototype",
        "Design System"
      ],
      "hook": "The product gets clear in prototypes before it gets expensive in code.",
      "intro": [
        "Most product budgets are spent discovering what should have been drawn first. A dashboard gets built and then rebuilt because nobody agreed on what the screen was for; an onboarding flow ships and loses users at a step no one sketched. This service moves that argument to the cheapest possible moment: before the build. We draw the flows, put a clickable prototype in front of you, and change it while changing it costs hours.",
        "What you can do afterwards is concrete. Brief a development team without ambiguity. Show stakeholders a product that behaves instead of a deck that describes one. Add screens later without the interface drifting, because the system that produced the first ones is documented."
      ],
      "deliverables": [
        {
          "name": "Flow map",
          "detail": "Every screen, state, and decision point of the journey drawn as one connected diagram, including the error and empty states that usually surface mid-build."
        },
        {
          "name": "Wireframe set",
          "detail": "Low-fidelity screens for the priority flows, cheap enough to argue with and throw away."
        },
        {
          "name": "Clickable prototype",
          "detail": "A linked prototype you can walk through on your own device and put in front of the people who will actually use the product."
        },
        {
          "name": "UI design system",
          "detail": "Type, color, spacing, and components with their states — hover, loading, error, empty — documented so screen twenty matches screen one."
        },
        {
          "name": "Build-ready handoff spec",
          "detail": "Annotated screens with behavior notes, written by a studio that also develops, so the engineer is not left to guess."
        },
        {
          "name": "Bilingual interface copy",
          "detail": "Labels, empty states, and error messages written in English and Spanish by the same hands, not run through a translator."
        }
      ],
      "engagements": [
        {
          "name": "Product UX audit",
          "duration": "1-2 weeks",
          "includes": "A screen-by-screen review of an existing product, portal, or internal tool: where users stall, which states are missing, and a prioritized fix list you can build against whether or not we do the next phase."
        },
        {
          "name": "Product design system",
          "duration": "4-10 weeks",
          "includes": "The full arc for a new product or a deep redesign: flow map, wireframes, clickable prototype, UI design system, and handoff spec, scoped to the flows that matter first."
        }
      ],
      "faqs": [
        {
          "q": "Do you also build what you design?",
          "a": "Yes. Development is its own service in this studio, and the same person who draws the flows can ship them. If your own team builds it instead, the handoff spec is written for them: annotated screens, behavior notes, states documented. Either way, nothing in the design assumes a build that cannot exist."
        },
        {
          "q": "We have a workflow in spreadsheets, not a product. Is it too early?",
          "a": "That is the cheapest moment to start, not the earliest. Mapping the workflow into flows and a prototype tells you what the product needs to be before anyone commits to a build. Teams that skip this step tend to pay for the discovery in code."
        },
        {
          "q": "Can you work on an existing product?",
          "a": "Yes. The audit exists for that: we walk the current flows, keep what works, and name what stalls users. A redesign then extends the product's own logic instead of replacing it for novelty's sake."
        },
        {
          "q": "Our interface needs to exist in Spanish and English. Is that two projects?",
          "a": "One. The studio works in both languages natively, so interface copy is written twice, not translated once. The prototype can carry both versions, and you see where each language strains the layout before development does."
        }
      ],
      "proofNote": "The closest live proof is on this site: the intake agent's conversation flow and the admin dashboard behind it are a small product the studio mapped, designed, and built for itself, running where you can use it. No client product case is publishable yet, and nothing invented stands in for one."
    },
    "es": {
      "title": "Producto Digital UX/UI",
      "lead": "Experiencia de producto",
      "desc": "Mapeamos journeys, dashboards, portales, onboarding e interfaces de app para que acciones complejas se entiendan antes de comprometer al equipo con el desarrollo.",
      "proof": "Ideal para ideas SaaS, herramientas internas, portales de cliente, MVPs y negocios con procesos que necesitan una mejor interfaz.",
      "tags": [
        "Flujos",
        "Prototipo",
        "Sistema UI"
      ],
      "hook": "El producto se aclara en prototipos antes de volverse caro en código.",
      "intro": [
        "Buena parte del presupuesto de un producto se gasta en descubrir lo que debió dibujarse primero. Se construye un dashboard y se reconstruye porque nadie acordó para qué era la pantalla; un onboarding sale a producción y pierde usuarios en un paso que nadie bocetó. Este servicio mueve esa discusión al momento más barato: antes del desarrollo. Dibujamos los flujos, ponemos un prototipo navegable frente a ti y lo corregimos mientras corregirlo cuesta horas.",
        "Lo que puedes hacer después es concreto. Darle a un equipo de desarrollo un brief sin ambigüedad. Mostrar a inversionistas o al equipo interno un producto que responde, no una presentación que lo describe. Agregar pantallas más adelante sin que la interfaz se deforme, porque el sistema que produjo las primeras queda documentado."
      ],
      "deliverables": [
        {
          "name": "Mapa de flujos",
          "detail": "Cada pantalla, estado y punto de decisión del recorrido dibujado como un solo diagrama conectado, incluyendo los estados de error y vacíos que suelen aparecer a mitad del desarrollo."
        },
        {
          "name": "Set de wireframes",
          "detail": "Pantallas en baja fidelidad para los flujos prioritarios, lo bastante baratas para discutirlas y descartarlas."
        },
        {
          "name": "Prototipo navegable",
          "detail": "Un prototipo enlazado que puedes recorrer en tu propio dispositivo y poner frente a las personas que van a usar el producto."
        },
        {
          "name": "Sistema de UI",
          "detail": "Tipografía, color, espaciado y componentes con sus estados — hover, carga, error, vacío — documentados para que la pantalla veinte se parezca a la primera."
        },
        {
          "name": "Especificación de entrega",
          "detail": "Pantallas anotadas con notas de comportamiento, escritas por un estudio que también desarrolla, para que el ingeniero no tenga que adivinar."
        },
        {
          "name": "Copy de interfaz bilingüe",
          "detail": "Etiquetas, estados vacíos y mensajes de error escritos en español e inglés por las mismas manos, no pasados por un traductor."
        }
      ],
      "engagements": [
        {
          "name": "Auditoría UX de producto",
          "duration": "1-2 semanas",
          "includes": "Una revisión pantalla por pantalla de un producto, portal o herramienta interna existente: dónde se atoran los usuarios, qué estados faltan y una lista de correcciones priorizada sobre la que puedes construir, hagamos o no la siguiente fase."
        },
        {
          "name": "Sistema de diseño de producto",
          "duration": "4-10 semanas",
          "includes": "El arco completo para un producto nuevo o un rediseño profundo: mapa de flujos, wireframes, prototipo navegable, sistema de UI y especificación de entrega, acotado a los flujos que importan primero."
        }
      ],
      "faqs": [
        {
          "q": "¿También construyen lo que diseñan?",
          "a": "Sí. El desarrollo es un servicio propio de este estudio, y la misma persona que dibuja los flujos puede publicarlos. Si lo construye tu equipo, la especificación de entrega está escrita para ellos: pantallas anotadas, notas de comportamiento, estados documentados. En cualquier caso, nada en el diseño asume un desarrollo que no puede existir."
        },
        {
          "q": "Tenemos un proceso en hojas de cálculo, no un producto. ¿Es demasiado pronto?",
          "a": "Es el momento más barato para empezar, no el más temprano. Mapear ese proceso en flujos y un prototipo te dice qué necesita ser el producto antes de que alguien comprometa un desarrollo. Los equipos que se saltan este paso suelen pagar el descubrimiento en código."
        },
        {
          "q": "¿Pueden trabajar sobre un producto existente?",
          "a": "Sí. Para eso existe la auditoría: recorremos los flujos actuales, conservamos lo que funciona y nombramos lo que atora a los usuarios. El rediseño extiende la lógica del propio producto en lugar de reemplazarla por novedad."
        },
        {
          "q": "Nuestra interfaz necesita existir en español e inglés. ¿Son dos proyectos?",
          "a": "Uno. El estudio trabaja en ambos idiomas de forma nativa, así que el copy de interfaz se escribe dos veces, no se traduce una. El prototipo puede llevar ambas versiones, y ves dónde cada idioma tensiona el layout antes de que lo descubra el desarrollo."
        }
      ],
      "proofNote": "La prueba viva más cercana está en este sitio: el flujo conversacional del agente de recepción y el panel admin detrás de él son un producto pequeño que el estudio mapeó, diseñó y construyó para sí mismo, corriendo donde puedes usarlo. Todavía no hay un caso de producto de cliente publicable, y nada inventado ocupa su lugar."
    }
  },
  {
    "slug": "growth",
    "media": "images/services/sales-funnels.jpg",
    "esSlug": "growth-marketing",
    "index": 3,
    "en": {
      "title": "Growth & Marketing",
      "lead": "Campaign system",
      "desc": "We shape landing pages, funnels, Meta campaigns, content rhythms, tracking, and follow-up paths so attention has somewhere useful to go.",
      "proof": "Best when the offer is clear enough to test traffic, capture demand, and learn from real audience signals.",
      "tags": [
        "Offer",
        "Traffic",
        "Follow-up"
      ],
      "hook": "Landing, campaign, tracking and follow-up, built as one system instead of four separate parts.",
      "intro": [
        "Most growth budgets die at the joints. The ad promises one thing, the landing says another, the form empties into an inbox, and a month later nobody can say which angle brought the leads worth having. Each part looked fine on its own; the money leaked between them.",
        "This service builds the joints. The offer gets stated once, in writing, and every ad and page is checked against it. The landing repeats the promise the click was sold on. Every lead lands in one store with its source attached, and a follow-up path answers it within a business day instead of whenever the inbox gets opened. What you can do afterwards is the point: run traffic, read what it teaches, and change one thing at a time without rebuilding."
      ],
      "deliverables": [
        {
          "name": "Offer and message map",
          "detail": "One page that states who the campaign is for, what changes for them, and why to believe it; every ad and landing is checked against this sheet before it ships."
        },
        {
          "name": "Campaign landing page",
          "detail": "Designed and built to repeat the promise the click was sold on, loading fast, with the form wired into capture rather than an inbox."
        },
        {
          "name": "Meta campaign structure",
          "detail": "Account architecture, audiences, creative angles, and a naming convention that keeps the reporting readable long after launch."
        },
        {
          "name": "Tracking and attribution layer",
          "detail": "UTM conventions and a capture endpoint, so every lead arrives carrying the campaign, ad, and angle that produced it."
        },
        {
          "name": "Follow-up path",
          "detail": "The first response, the human handoff, and what a lead receives in the days after the form — written down and connected, not left to memory."
        },
        {
          "name": "Content rhythm",
          "detail": "A publishing cadence tied to the campaign's angles, so organic content and paid traffic make the same argument."
        },
        {
          "name": "Signal readout",
          "detail": "A plain written read of what the traffic taught: which angle earned attention, where people left, and the one change to make next."
        }
      ],
      "engagements": [
        {
          "name": "Funnel audit",
          "duration": "1-2 weeks",
          "includes": "A read of the current landing, tracking, and follow-up path against the offer, with the leaks named and the fixes ordered by what each one is costing you."
        },
        {
          "name": "Campaign landing sprint",
          "duration": "1-2 weeks",
          "includes": "One landing designed, written, and built for a specific traffic source, with the form wired into capture and source attribution working from day one."
        },
        {
          "name": "Growth system",
          "duration": "4-10 weeks",
          "includes": "Offer map, landing, Meta campaign structure, tracking, follow-up automation, and content rhythm, built as one connected system and read together after launch."
        }
      ],
      "faqs": [
        {
          "q": "Do you run the ads or just build the pages?",
          "a": "Both ends. The campaign structure and creative angles on Meta, and the landing, tracking, and follow-up they point at, are shaped by the same hands — that is the argument for the service. If you already have a media buyer, we build the system around them and hand over a structure they can operate."
        },
        {
          "q": "Can you guarantee leads or a return?",
          "a": "No, and this page will not pretend otherwise. What the work guarantees is legibility: every lead arrives with its source attached, every test has a readable answer, and money stops leaking between parts that were designed separately. The studio publishes campaign figures only with a client's name and an agreed number, which is why you see none here yet."
        },
        {
          "q": "What do you need from us before starting?",
          "a": "An offer clear enough to state in one sentence. A funnel cannot repair a weak promise; paid traffic amplifies whatever it is given, confusion included. If the promise is the problem, this becomes a branding engagement first, and we will say so at the diagnosis rather than after the ad spend."
        },
        {
          "q": "Where do the leads actually go?",
          "a": "Into one store, not an inbox. The landing posts each lead, with its source parameters, to a capture endpoint; the follow-up path starts there with a first response and a clean handoff to a person. On this site, that endpoint is the intake agent you can open from the homepage — the same kind of system this service installs for you."
        }
      ],
      "proofNote": "The honest proof is partial and it is live: the studio's own campaign landing at /lp/sitios-web/ posts every lead, source attached, into the intake agent documented in the ledger. No client campaign figures appear here because none has cleared a name and a number yet."
    },
    "es": {
      "title": "Growth & Marketing",
      "lead": "Sistema de campaña",
      "desc": "Damos forma a landing pages, embudos, campañas Meta, ritmos de contenido, medición y rutas de seguimiento para que la atención tenga un siguiente paso útil.",
      "proof": "Ideal cuando la oferta ya está lo suficientemente clara para probar tráfico, capturar demanda y aprender de señales reales de audiencia.",
      "tags": [
        "Oferta",
        "Tráfico",
        "Seguimiento"
      ],
      "hook": "Landing, campaña, medición y seguimiento, construidos como un solo sistema y no como cuatro piezas.",
      "intro": [
        "La mayoría de los presupuestos de growth muere en las uniones. El anuncio promete una cosa, la landing dice otra, el formulario desemboca en una bandeja de entrada, y un mes después nadie puede decir qué ángulo trajo los leads que valían la pena. Cada pieza se veía bien por separado; el dinero se fugó entre ellas.",
        "Este servicio construye las uniones. La oferta se escribe una sola vez y cada anuncio y cada página se revisa contra ella. La landing repite la promesa que vendió el clic. Cada lead aterriza en un solo almacén con su origen adjunto, y una ruta de seguimiento lo responde en un día hábil en lugar de cuando alguien abra el correo. Lo que puedes hacer después es el punto: correr tráfico, leer lo que enseña y cambiar una cosa a la vez sin reconstruir nada."
      ],
      "deliverables": [
        {
          "name": "Mapa de oferta y mensaje",
          "detail": "Una página que establece a quién le habla la campaña, qué cambia para esa persona y por qué creerle; cada anuncio y cada landing se revisa contra esa hoja antes de publicarse."
        },
        {
          "name": "Landing de campaña",
          "detail": "Diseñada y construida para repetir la promesa que vendió el clic, con carga rápida y el formulario conectado a captura, no a una bandeja de entrada."
        },
        {
          "name": "Estructura de campaña en Meta",
          "detail": "Arquitectura de cuenta, audiencias, ángulos creativos y una convención de nombres que mantiene los reportes legibles mucho después del lanzamiento."
        },
        {
          "name": "Capa de medición y atribución",
          "detail": "Convenciones UTM y un endpoint de captura, para que cada lead llegue con la campaña, el anuncio y el ángulo que lo produjo."
        },
        {
          "name": "Ruta de seguimiento",
          "detail": "La primera respuesta, la entrega a una persona y lo que el lead recibe en los días siguientes: escrito y conectado, no dejado a la memoria."
        },
        {
          "name": "Ritmo de contenido",
          "detail": "Una cadencia de publicación atada a los ángulos de la campaña, para que el contenido orgánico y la pauta hagan el mismo argumento."
        },
        {
          "name": "Lectura de señales",
          "detail": "Un texto plano de lo que enseñó el tráfico: qué ángulo ganó atención, dónde se fue la gente y el único cambio que toca hacer ahora."
        }
      ],
      "engagements": [
        {
          "name": "Auditoría de embudo",
          "duration": "1-2 semanas",
          "includes": "Una lectura de la landing, la medición y el seguimiento actuales contra la oferta, con las fugas nombradas y los arreglos ordenados por lo que cada uno te está costando."
        },
        {
          "name": "Sprint de landing",
          "duration": "1-2 semanas",
          "includes": "Una landing diseñada, escrita y construida para una fuente de tráfico específica, con el formulario conectado a captura y la atribución de origen funcionando desde el primer día."
        },
        {
          "name": "Sistema de growth",
          "duration": "4-10 semanas",
          "includes": "Mapa de oferta, landing, estructura en Meta, medición, seguimiento automatizado y ritmo de contenido, construidos como un sistema conectado y leídos juntos después del lanzamiento."
        }
      ],
      "faqs": [
        {
          "q": "¿Corren la pauta o solo construyen las páginas?",
          "a": "Los dos extremos. La estructura de campaña y los ángulos creativos en Meta, y la landing, la medición y el seguimiento a los que apuntan, salen de las mismas manos; ese es el argumento del servicio. Si ya tienes un media buyer, construimos el sistema alrededor de esa persona y entregamos una estructura que pueda operar."
        },
        {
          "q": "¿Pueden garantizar leads o retorno?",
          "a": "No, y esta página no va a fingir lo contrario. Lo que el trabajo sí garantiza es legibilidad: cada lead llega con su origen adjunto, cada prueba tiene una respuesta legible y el dinero deja de fugarse entre piezas diseñadas por separado. El estudio publica cifras de campaña solo con el nombre del cliente y un número acordado, y por eso aquí todavía no ves ninguna."
        },
        {
          "q": "¿Qué necesitan de nosotros antes de empezar?",
          "a": "Una oferta lo bastante clara para caber en una oración. Un embudo no puede reparar una promesa débil: la pauta amplifica lo que recibe, incluida la confusión. Si el problema es la promesa, esto se convierte primero en un proyecto de branding, y te lo vamos a decir en el diagnóstico, no después del gasto en anuncios."
        },
        {
          "q": "¿A dónde van los leads?",
          "a": "A un solo almacén, no a una bandeja de entrada. La landing publica cada lead, con sus parámetros de origen, a un endpoint de captura; la ruta de seguimiento arranca ahí con una primera respuesta y una entrega limpia a una persona. En este sitio, ese endpoint es el agente de recepción que puedes abrir desde la portada: el mismo tipo de sistema que este servicio instala para ti."
        }
      ],
      "proofNote": "La prueba honesta es parcial y está viva: la landing de campaña del propio estudio, en /lp/sitios-web/, publica cada lead con su origen adjunto en el agente de recepción documentado en el registro. Aquí no aparecen cifras de campañas de clientes porque ninguna ha liberado todavía un nombre y un número."
    }
  },
  {
    "slug": "ai-automation",
    "media": "images/services/email-marketing.jpg",
    "esSlug": "automatizacion-ia",
    "index": 4,
    "en": {
      "title": "AI Automation",
      "lead": "Workflow intelligence",
      "desc": "We connect intake, service matching, first-response support, knowledge bases, dashboards, and follow-up rules so teams respond faster without losing human control.",
      "proof": "Best for businesses with repeated questions, slow lead handoff, manual reporting, or operations that need a cleaner first layer.",
      "tags": [
        "Intake",
        "Routing",
        "Dashboards"
      ],
      "hook": "The intake layer that answers on this site, built for your workflow instead of ours.",
      "intro": [
        "Most automation projects start with a tool and go looking for a problem. This one starts with the delay. In a service business the delay is usually the first five minutes after a lead arrives: the brief waits for attention, the context is reassembled by hand, and the same questions get answered from scratch again. We build the layer that removes that wait: intake that captures the real question, routing that matches it to the right service, and a first response that is accurate rather than fast-and-wrong.",
        "The agent never closes the loop alone. It drafts, routes, attaches context, and hands a person a conversation already halfway understood. The claim is testable before you buy it: the agent answering on this site is this same service, running on the studio's own leads."
      ],
      "deliverables": [
        {
          "name": "Workflow map",
          "detail": "A document naming each station a lead passes through, where the delay lives, and where the human enters."
        },
        {
          "name": "Intake agent",
          "detail": "A conversational front layer that captures the real question and the commercial fields a person needs before replying."
        },
        {
          "name": "Routing rules",
          "detail": "Matching logic that attaches a suggested service and a confidence level to every lead before a human reads it."
        },
        {
          "name": "Knowledge base",
          "detail": "Your answers, versioned, so the first response is grounded in what your business says rather than what a model guesses."
        },
        {
          "name": "Cost ceiling",
          "detail": "A quota gate on every model call, because an agent without a ceiling is an unbounded invoice."
        },
        {
          "name": "Lead store and dashboard",
          "detail": "One store that every form posts into, and an admin view that reads that same source."
        },
        {
          "name": "Follow-up rules",
          "detail": "A daily digest and reminders that tell a person which conversation needs the next human touch."
        }
      ],
      "engagements": [
        {
          "name": "Workflow audit",
          "duration": "1-2 weeks",
          "includes": "A map of your lead path, the delay named, and a written recommendation of what to automate first and what to leave manual."
        },
        {
          "name": "Automation system",
          "duration": "4-10 weeks",
          "includes": "Intake, routing, first response, knowledge base, lead store, dashboard, and follow-up rules, with a human handoff at the end of every path."
        }
      ],
      "faqs": [
        {
          "q": "Is this a chatbot?",
          "a": "Not in the usual sense. Most chatbots are built to deflect; this layer is built to receive. It captures the question, matches it to a service, drafts a grounded first response, and hands the conversation to a person with the context attached."
        },
        {
          "q": "Does the AI talk to my clients on its own?",
          "a": "It never closes the loop by itself. Drafting, routing, and context-gathering are automated; the decision and the relationship stay with a person. That handoff is a design rule in every build, not a setting someone can forget to turn on."
        },
        {
          "q": "What stops the model bill from running away?",
          "a": "A quota gate ships with every build. The agent on this site dedicates an entire component to enforcing ceilings, because an agent with a language model behind it and no ceiling is an unbounded invoice."
        },
        {
          "q": "How do we know this is the right service for us?",
          "a": "Look for the delay: repeated questions answered from scratch, leads waiting hours for a first reply, reports assembled by hand. If your bottleneck is somewhere else, in the offer or the site or the traffic, we will say so and point at the service that fits."
        }
      ],
      "proofNote": "The proof for this service is live on the page you are reading: the concierge that answers here is the same build, documented as the intake-agent case, with one component per conversation, a quota gate, a versioned lead store, and a nightly digest. It is the studio's own work; the studio's two signed engagements are not yet publishable."
    },
    "es": {
      "title": "Automatización IA",
      "lead": "Inteligencia operativa",
      "desc": "Conectamos recepción de leads, recomendación de servicios, primera respuesta, bases de conocimiento, dashboards y reglas de seguimiento para responder más rápido sin perder control humano.",
      "proof": "Ideal para negocios con preguntas repetidas, traspaso lento de leads, reportes manuales u operaciones que necesitan una primera capa más clara.",
      "tags": [
        "Recepción",
        "Rutas",
        "Dashboards"
      ],
      "hook": "La capa de recepción que responde en este sitio, construida para tu flujo, no para el nuestro.",
      "intro": [
        "La mayoría de los proyectos de automatización empieza con una herramienta y le busca un problema. Este empieza con la demora. En un negocio de servicios, la demora suele estar en los primeros cinco minutos tras la llegada de un lead: el brief espera atención, el contexto se reconstruye a mano y las mismas preguntas se responden desde cero una vez más. Construimos la capa que elimina esa espera: una recepción que captura la pregunta real, rutas que la emparejan con el servicio correcto y una primera respuesta precisa antes que rápida.",
        "El agente nunca cierra el ciclo solo. Redacta, enruta, adjunta contexto y le entrega a una persona una conversación ya entendida a medias. Y la promesa se puede probar antes de comprarla: el agente que responde en este sitio es este mismo servicio, corriendo sobre los leads del propio estudio."
      ],
      "deliverables": [
        {
          "name": "Mapa de flujo",
          "detail": "Un documento que nombra cada estación por la que pasa un lead, dónde vive la demora y dónde entra la persona."
        },
        {
          "name": "Agente de recepción",
          "detail": "Una capa conversacional que captura la pregunta real y los datos comerciales que una persona necesita antes de responder."
        },
        {
          "name": "Reglas de ruteo",
          "detail": "Lógica de emparejamiento que adjunta a cada lead un servicio sugerido y un nivel de confianza antes de que un humano lo lea."
        },
        {
          "name": "Base de conocimiento",
          "detail": "Tus respuestas, versionadas, para que la primera respuesta se base en lo que tu negocio dice y no en lo que un modelo adivina."
        },
        {
          "name": "Techo de costo",
          "detail": "Una compuerta de cuota sobre cada llamada al modelo, porque un agente sin techo es una factura sin límite."
        },
        {
          "name": "Almacén de leads y panel",
          "detail": "Un solo almacén al que publican todos los formularios, y un panel administrativo que lee esa misma fuente."
        },
        {
          "name": "Reglas de seguimiento",
          "detail": "Un resumen diario y recordatorios que le dicen a una persona qué conversación necesita el siguiente toque humano."
        }
      ],
      "engagements": [
        {
          "name": "Auditoría de flujo",
          "duration": "1-2 semanas",
          "includes": "Un mapa de tu ruta de leads, la demora con nombre y una recomendación escrita de qué automatizar primero y qué dejar manual."
        },
        {
          "name": "Sistema de automatización",
          "duration": "4-10 semanas",
          "includes": "Recepción, ruteo, primera respuesta, base de conocimiento, almacén de leads, panel y reglas de seguimiento, con entrega humana al final de cada ruta."
        }
      ],
      "faqs": [
        {
          "q": "¿Esto es un chatbot?",
          "a": "No en el sentido habitual. La mayoría de los chatbots se construye para desviar; esta capa se construye para recibir. Captura la pregunta, la empareja con un servicio, redacta una primera respuesta con base y le entrega la conversación a una persona con el contexto adjunto."
        },
        {
          "q": "¿La IA les habla a mis clientes por su cuenta?",
          "a": "Nunca cierra el ciclo sola. Redactar, enrutar y reunir contexto se automatiza; la decisión y la relación quedan en manos de una persona. Esa entrega es una regla de diseño en cada proyecto, no una opción que alguien puede olvidar activar."
        },
        {
          "q": "¿Qué evita que la factura del modelo se dispare?",
          "a": "Cada proyecto incluye una compuerta de cuota. El agente de este sitio dedica un componente completo a imponer techos, porque un agente con un modelo de lenguaje detrás y sin techo es una factura sin límite."
        },
        {
          "q": "¿Cómo sabemos si este es el servicio correcto?",
          "a": "Busca la demora: preguntas repetidas respondidas desde cero, leads que esperan horas por una primera respuesta, reportes armados a mano. Si tu cuello de botella está en otra parte, en la oferta, el sitio o el tráfico, te lo diremos y señalaremos el servicio que corresponde."
        }
      ],
      "proofNote": "La prueba de este servicio está viva en la página que estás leyendo: el concierge que responde aquí es esa misma construcción, documentada como el caso del agente de recepción, con un componente por conversación, compuerta de cuota, almacén de leads versionado y resumen nocturno. Es trabajo del propio estudio; los dos proyectos firmados del estudio aún no se pueden publicar."
    }
  },
  {
    "slug": "development",
    "media": "images/services/landing-pages.jpg",
    "esSlug": "desarrollo",
    "index": 5,
    "en": {
      "title": "Development",
      "lead": "Reliable build",
      "desc": "We turn approved strategy and UX into responsive pages, front-end systems, forms, analytics, integrations, and lightweight app experiences that are ready to use.",
      "proof": "Best when the brand, website, product screen, form, CRM, and automation need to work together instead of living as separate pieces.",
      "tags": [
        "Frontend",
        "Forms",
        "Integrations"
      ],
      "hook": "From approved design to a published system: pages, forms, and integrations, measured and documented.",
      "intro": [
        "Development is where the project stops being a description. Strategy decks and design files describe a site; this stage produces the thing itself: pages that load, forms that land somewhere, analytics that record what happened, and integrations that pass a lead to the person who answers it.",
        "The method is the one this site was built with: a versioned repository, a check gate before every deploy, assets fingerprinted so a cache can never serve a stale file, and no script allowed to block first paint. Few moving parts, all of them inspectable. Twice this site broke in public; the commit history names both failures and both fixes."
      ],
      "deliverables": [
        {
          "name": "Production front end",
          "detail": "Responsive pages built from the approved design, with fingerprinted assets and no render-blocking script files — the standard this site itself meets."
        },
        {
          "name": "Forms and lead capture",
          "detail": "Every form on the property posts to one endpoint and one store, spam-gated, with a tested path to the person who replies."
        },
        {
          "name": "Analytics on the conversion path",
          "detail": "The events that matter on the way to contact, wired and verified before launch, so the first week produces data instead of anecdotes."
        },
        {
          "name": "Integrations",
          "detail": "The connections the workflow needs — email notification, CRM handoff, automation triggers — built and tested end to end."
        },
        {
          "name": "Deploy pipeline",
          "detail": "A versioned repository with a check gate before every publish and a cache strategy that cannot serve a stale build."
        },
        {
          "name": "Handover notes",
          "detail": "A written map of the system: what runs where, how to change the content, how to deploy, and what to watch."
        }
      ],
      "engagements": [
        {
          "name": "Landing page build",
          "duration": "1-2 weeks",
          "includes": "One page from approved design to live URL: markup, form, analytics, deploy, and the check that the lead actually arrives."
        },
        {
          "name": "Full site build",
          "duration": "4-8 weeks",
          "includes": "The complete front end: every template, form, and integration, plus the deploy pipeline and handover notes."
        },
        {
          "name": "System build",
          "duration": "4-10 weeks",
          "includes": "Development that crosses into product or automation: an interface plus the worker, store, and workflow behind it — the shape of the intake agent on this site."
        }
      ],
      "faqs": [
        {
          "q": "What stack do you build on?",
          "a": "The smallest one that does the job. This site is a static build served from the edge, with a TypeScript worker behind the forms and the intake agent; that bias — few dependencies, everything versioned, a check before every deploy — carries into client work. If your project genuinely needs a CMS or an existing platform, that surfaces in diagnosis, not after the invoice."
        },
        {
          "q": "Can you build a design made by another studio?",
          "a": "Yes. Development is sold both as the final stage of a full engagement and as a standalone build of an approved design. The first step is the same either way: we read the design against the real constraints — content, devices, load budget — and tell you what will survive contact with the browser."
        },
        {
          "q": "What does \"ready to use\" mean at handover?",
          "a": "Deployed, measured, and documented. The forms are tested through to the store, the analytics events are firing, and you receive the repository with notes on what runs where and how to change it. The test we apply to ourselves: the system runs without us standing next to it."
        },
        {
          "q": "How do you keep pages fast?",
          "a": "By treating bytes as a budget, not a consequence. Assets are fingerprinted, no script blocks the first paint, and anything decorative has to pay for itself: the 3D field behind this site's homepage replaced 183 KB of engine with 36 KB of renderer, both gzipped. That work is published as a case, measurements included."
        }
      ],
      "proofNote": "The proof is the page you are on: this site — the field running behind it (contour-field) and the agent answering on it (intake-agent) — is the studio's own development work, deployed and documented down to the commits where it broke."
    },
    "es": {
      "title": "Desarrollo",
      "lead": "Construcción confiable",
      "desc": "Convertimos estrategia y UX aprobadas en páginas responsivas, sistemas front-end, formularios, analítica, integraciones y experiencias ligeras de app listas para usar.",
      "proof": "Ideal cuando marca, sitio, pantalla de producto, formulario, CRM y automatización deben trabajar juntos en lugar de vivir como piezas separadas.",
      "tags": [
        "Frontend",
        "Formularios",
        "Integraciones"
      ],
      "hook": "Del diseño aprobado al sistema publicado: páginas, formularios e integraciones, medidos y documentados.",
      "intro": [
        "Desarrollo es donde el proyecto deja de ser una descripción. El deck de estrategia y el archivo de diseño describen un sitio; esta etapa produce la cosa en sí: páginas que cargan, formularios que llegan a alguna parte, analítica que registra lo que pasó e integraciones que le entregan el lead a la persona que responde.",
        "El método es el mismo con el que se construyó este sitio: un repositorio versionado, una verificación antes de cada deploy, archivos con huella por hash para que ningún caché sirva una versión vieja, y ningún script que bloquee el primer render. Pocas piezas móviles, todas inspeccionables. Dos veces este sitio se rompió en público; el historial de commits nombra ambas fallas y ambos arreglos."
      ],
      "deliverables": [
        {
          "name": "Front end de producción",
          "detail": "Páginas responsivas construidas desde el diseño aprobado, con archivos con huella por hash y sin archivos de script bloqueantes — el estándar que este mismo sitio cumple."
        },
        {
          "name": "Formularios y captura de leads",
          "detail": "Cada formulario de la propiedad publica a un solo endpoint y un solo almacén, con filtro antispam y una ruta probada hasta la persona que contesta."
        },
        {
          "name": "Analítica en la ruta de conversión",
          "detail": "Los eventos que importan camino al contacto, conectados y verificados antes del lanzamiento, para que la primera semana produzca datos y no anécdotas."
        },
        {
          "name": "Integraciones",
          "detail": "Las conexiones que el flujo necesita — notificación por correo, traspaso a CRM, disparadores de automatización — construidas y probadas de extremo a extremo."
        },
        {
          "name": "Pipeline de deploy",
          "detail": "Un repositorio versionado con verificación antes de cada publicación y una estrategia de caché que no puede servir una versión vieja."
        },
        {
          "name": "Notas de entrega",
          "detail": "Un mapa escrito del sistema: qué corre dónde, cómo cambiar el contenido, cómo publicar y qué vigilar."
        }
      ],
      "engagements": [
        {
          "name": "Construcción de landing",
          "duration": "1-2 semanas",
          "includes": "Una página del diseño aprobado a la URL en vivo: maquetación, formulario, analítica, deploy y la prueba de que el lead de verdad llega."
        },
        {
          "name": "Construcción de sitio completo",
          "duration": "4-8 semanas",
          "includes": "El front end completo: cada plantilla, formulario e integración, más el pipeline de deploy y las notas de entrega."
        },
        {
          "name": "Construcción de sistema",
          "duration": "4-10 semanas",
          "includes": "Desarrollo que cruza hacia producto o automatización: una interfaz más el worker, el almacén y el workflow detrás — la forma del agente de recepción de este sitio."
        }
      ],
      "faqs": [
        {
          "q": "¿Sobre qué stack construyen?",
          "a": "Sobre el más pequeño que haga el trabajo. Este sitio es una construcción estática servida desde el edge, con un worker en TypeScript detrás de los formularios y del agente de recepción; ese sesgo — pocas dependencias, todo versionado, verificación antes de cada deploy — se traslada al trabajo de cliente. Si tu proyecto de verdad necesita un CMS o una plataforma existente, eso aparece en el diagnóstico, no después de la factura."
        },
        {
          "q": "¿Pueden construir un diseño hecho por otro estudio?",
          "a": "Sí. El desarrollo se contrata como etapa final de un proyecto completo o como construcción independiente de un diseño ya aprobado. El primer paso es el mismo en ambos casos: leemos el diseño contra las restricciones reales — contenido, dispositivos, presupuesto de carga — y te decimos qué va a sobrevivir el contacto con el navegador."
        },
        {
          "q": "¿Qué significa \"listo para usar\" en la entrega?",
          "a": "Publicado, medido y documentado. Los formularios están probados hasta el almacén, los eventos de analítica disparan, y recibes el repositorio con notas de qué corre dónde y cómo cambiarlo. La prueba que nos aplicamos a nosotros: el sistema corre sin nosotros al lado."
        },
        {
          "q": "¿Cómo mantienen las páginas rápidas?",
          "a": "Tratando los bytes como presupuesto, no como consecuencia. Los archivos llevan huella por hash, ningún script bloquea el primer render y todo lo decorativo tiene que pagarse a sí mismo: el campo 3D detrás de la portada de este sitio reemplazó 183 KB de motor por 36 KB de renderer, ambos con gzip. Ese trabajo está publicado como caso, con mediciones incluidas."
        }
      ],
      "proofNote": "La prueba es la página en la que estás: este sitio — el campo que corre detrás (contour-field) y el agente que responde encima (intake-agent) — es el trabajo de desarrollo del propio estudio, publicado y documentado hasta los commits donde se rompió."
    }
  }
];

export default services;
