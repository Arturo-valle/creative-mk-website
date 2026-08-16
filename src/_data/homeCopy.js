/**
 * The homepage's own words, in both languages.
 *
 * Why this file exists: the homepage was the last page whose Spanish lived
 * only in `js/i18n.js`, as a runtime swap over English markup. That made
 * `/es/` impossible — there was no Spanish document to serve, only an English
 * one that rewrote itself after the crawler had already left. The audit found
 * the consequence rather than the cause: seventeen Spanish URLs unreachable
 * from the homepage, and the highest-authority page on the site declaring no
 * hreflang at all, because it had no sibling to declare.
 *
 * Lifting the strings here makes both documents build from one source.
 * `js/i18n.js` keeps its copy for the in-page toggle, and check-site.mjs still
 * enforces key parity across the two locales — but the *pages* no longer
 * depend on JavaScript to be Spanish.
 *
 * Four labels were corrected on the way in. The static HTML said "See the
 * ledger", "Meet the studio", "About the studio" and "Read the notes"; the
 * dictionary said "Start a project", "View our services", "Talk to CREATIVE MK"
 * and "Ask for guidance". Both shipped: you saw the first set on load and the
 * second set the moment you toggled the language and came back. The dictionary
 * values were left over from when those links pointed at the contact page. The
 * markup's wording won because it is the one that describes where the link
 * actually goes.
 */
export default {
  en: {
    hero: {
      eyebrow: 'Branding, UX/UI, websites, growth and AI',
      title: 'Digital experiences for brands ready to grow with clarity',
      lede: 'CREATIVE MK is a bilingual digital studio shaping brand identity, UX/UI, websites, growth systems, development, and practical AI automation into one coherent presence.',
      primaryCta: 'Start a project',
      secondaryCta: 'Explore services',
      soundEnable: 'Enable sound'
    },
    showreel: { title: 'CREATIVE MK showreel' },
    proof: {
      kicker: 'Studio model',
      title: 'A senior, focused partner for the digital touchpoints that shape trust.',
      text: 'Inspired by the discipline of top digital studios, our work connects strategy, design, content, technology, and automation without pretending every business needs the same package.',
      itemOneLabel: 'Core disciplines',
      itemOneValue: 'Brand + UX + Web + AI',
      itemTwoLabel: 'Languages',
      itemTwoValue: 'EN + ES, one team',
      itemThreeLabel: 'Engagements underway',
      itemFourLabel: 'Output',
      itemFourValue: 'Launch-ready systems, not loose assets'
    },
    capabilities: {
      kicker: 'Capabilities',
      title: 'Services shaped as a connected brand and growth system',
      intro: 'We organize the essentials like a premium digital studio: clear identity, refined digital experience, conversion paths, reliable build, and practical automation that helps the business respond faster.'
    },
    process: {
      kicker: 'Process',
      title: 'From unclear brief to launchable system.',
      steps: [
        { title: 'Diagnose', text: 'We clarify the audience, offer, current bottleneck, and what the first version must prove.', meta: 'Brief map · Offer · First metric' },
        { title: 'Shape', text: 'We define messaging, structure, visual direction, UX flow, and the priority service path.', meta: 'Messaging · Structure · Visual direction' },
        { title: 'Build', text: 'We design and develop the assets, pages, automations, or product screens needed for launch.', meta: 'Design · Build · Automations' },
        { title: 'Measure', text: 'We connect capture, follow-up, analytics, and iteration so the system can improve after launch.', meta: 'Capture · Analytics · Iteration' }
      ]
    },
    ai: {
      label: 'AI Automation',
      title: 'AI belongs inside a useful workflow, not beside it.',
      text: 'We use AI where it can reduce friction: lead intake, service matching, first response, content routing, internal dashboards, and follow-up. The goal is practical speed with clear human handoff.',
      cta: 'Map an AI workflow',
      conciergeEyebrow: 'MK Growth Concierge',
      conciergeText: 'Get a focused AI diagnostic before you brief us.',
      trace: ['Intake', 'Service match', 'First response', 'Human handoff']
    },
    work: {
      kicker: 'Selected work',
      title: 'The ledger: what is published, and what is not yet.',
      viewAll: 'See the ledger',
      selfLabel: 'Self-initiated'
    },
    about: {
      title: 'A compact digital studio with strategy, design and build in one conversation.',
      text: 'CREATIVE MK helps businesses turn scattered digital needs into a coherent system: brand, website, product experience, content, paid growth, automation, and measurement.',
      viewServices: 'Meet the studio',
      bottomText: 'The work is intentionally focused: understand the business, sharpen the message, design the experience, build what is needed, and connect the follow-up path so every touchpoint has a job.',
      learnMore: 'About the studio'
    },
    news: { title: 'Insights', visitBlog: 'Read the notes' },
    faq: { title: 'Frequently Asked Questions' },
    servicePreviewAlt: 'Service preview'
  },

  es: {
    hero: {
      eyebrow: 'Branding, UX/UI, sitios web, crecimiento e IA',
      title: 'Experiencias digitales para marcas listas para crecer con claridad',
      lede: 'CREATIVE MK es un estudio digital bilingüe que integra identidad de marca, UX/UI, sitios web, sistemas de crecimiento, desarrollo y automatización con IA en una presencia coherente.',
      primaryCta: 'Iniciar proyecto',
      secondaryCta: 'Explorar servicios',
      soundEnable: 'Activar sonido'
    },
    showreel: { title: 'Showreel de CREATIVE MK' },
    proof: {
      kicker: 'Modelo de estudio',
      title: 'Un aliado senior y enfocado para los puntos digitales que construyen confianza.',
      text: 'Inspirados por la disciplina de los mejores estudios digitales, conectamos estrategia, diseño, contenido, tecnología y automatización sin asumir que todos los negocios necesitan el mismo paquete.',
      itemOneLabel: 'Disciplinas centrales',
      itemOneValue: 'Marca + UX + Web + IA',
      itemTwoLabel: 'Idiomas',
      itemTwoValue: 'EN + ES, un solo equipo',
      itemThreeLabel: 'Proyectos en curso',
      itemFourLabel: 'Resultado',
      itemFourValue: 'Sistemas listos para lanzar, no piezas sueltas'
    },
    capabilities: {
      kicker: 'Capacidades',
      title: 'Servicios pensados como un sistema conectado de marca y crecimiento',
      intro: 'Organizamos lo esencial como un estudio digital premium: identidad clara, experiencia digital refinada, rutas de conversión, construcción confiable y automatización práctica para responder más rápido.'
    },
    process: {
      kicker: 'Proceso',
      title: 'De una idea poco clara a un sistema listo para lanzar.',
      steps: [
        { title: 'Diagnosticar', text: 'Aclaramos audiencia, oferta, cuello de botella actual y qué debe probar la primera versión.', meta: 'Mapa de brief · Oferta · Primera métrica' },
        { title: 'Dar forma', text: 'Definimos mensaje, estructura, dirección visual, flujo UX y ruta prioritaria de servicio.', meta: 'Mensaje · Estructura · Dirección visual' },
        { title: 'Construir', text: 'Diseñamos y desarrollamos los activos, páginas, automatizaciones o pantallas necesarias para lanzar.', meta: 'Diseño · Build · Automatizaciones' },
        { title: 'Medir', text: 'Conectamos captura, seguimiento, analítica e iteración para que el sistema mejore después del lanzamiento.', meta: 'Captura · Analítica · Iteración' }
      ]
    },
    ai: {
      label: 'Automatización IA',
      title: 'La IA debe vivir dentro de un flujo útil, no al lado.',
      text: 'Usamos IA donde reduce fricción: recepción de leads, recomendación de servicios, primera respuesta, rutas de contenido, dashboards internos y seguimiento. El objetivo es velocidad práctica con entrega clara a personas.',
      cta: 'Mapear un flujo con IA',
      conciergeEyebrow: 'MK Growth Concierge',
      conciergeText: 'Obtén un diagnóstico con IA antes de escribirnos el brief.',
      trace: ['Recepción', 'Selección de servicio', 'Primera respuesta', 'Entrega humana']
    },
    work: {
      kicker: 'Trabajo seleccionado',
      title: 'El registro: lo publicado, y lo que todavía no.',
      viewAll: 'Ver el registro',
      selfLabel: 'Iniciativa propia'
    },
    about: {
      title: 'Un estudio digital compacto con estrategia, diseño y construcción en una sola conversación.',
      text: 'CREATIVE MK ayuda a convertir necesidades digitales dispersas en un sistema coherente: marca, sitio web, experiencia de producto, contenido, pauta, automatización y medición.',
      viewServices: 'Conocer el estudio',
      bottomText: 'El trabajo es intencionalmente enfocado: entender el negocio, afinar el mensaje, diseñar la experiencia, construir lo necesario y conectar el seguimiento para que cada punto de contacto tenga una función.',
      learnMore: 'Sobre el estudio'
    },
    news: { title: 'Insights', visitBlog: 'Leer las notas' },
    faq: { title: 'Preguntas frecuentes' },
    servicePreviewAlt: 'Vista previa del servicio'
  }
};
