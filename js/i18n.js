/* ============================================
   i18n - Internationalization System
   ============================================ */
const translations = {
  en: {
    "nav.work": "Work",
    "nav.services": "Services",
    "nav.about": "About",
    "nav.blog": "Insights",
    "nav.contact": "Contact",
    "nav.webDesign": "Websites",
    "nav.landingPages": "Conversion Pages",
    "nav.salesFunnels": "Growth Systems",
    "nav.metaAds": "Growth & Marketing",
    "nav.socialMedia": "Content Systems",
    "nav.branding": "Branding",
    "nav.logoCreation": "Identity Systems",
    "nav.brandManual": "Brand Guidelines",
    "nav.appDev": "Development",
    "nav.uxui": "Digital Product UX/UI",
    "nav.aiAutomation": "AI Automation",
    "nav.allServices": "All Capabilities ->",

    "hero.eyebrow": "Branding, UX/UI, websites, growth and AI",
    "hero.title": "Digital experiences for brands ready to grow with clarity",
    "hero.lede": "CREATIVE MK is a bilingual digital studio shaping brand identity, UX/UI, websites, growth systems, development, and practical AI automation into one coherent presence.",
    "hero.primaryCta": "Start a project",
    "hero.secondaryCta": "Explore services",
    "hero.cardStrategy": "Positioning",
    "hero.cardAutomation": "Automation",
    "hero.playBtn": "Play Showreel",
    "hero.soundEnable": "Enable sound",
    "hero.soundMute": "Mute",

    "showreel.title": "CREATIVE MK showreel",

    "proof.kicker": "Studio model",
    "proof.title": "A senior, focused partner for the digital touchpoints that shape trust.",
    "proof.text": "Inspired by the discipline of top digital studios, our work connects strategy, design, content, technology, and automation without pretending every business needs the same package.",
    "proof.itemOneLabel": "Core disciplines",
    "proof.itemOneValue": "Brand + UX + Web + AI",
    "proof.itemTwoLabel": "Languages",
    "proof.itemTwoValue": "EN + ES, one team",
    "proof.itemThreeLabel": "Engagements underway",
    "proof.itemThreeValue": "Bilingual, digital-first, strategy-led",
    "proof.itemFourLabel": "Output",
    "proof.itemFourValue": "Launch-ready systems, not loose assets",

    "capabilities.kicker": "Capabilities",
    "capabilities.title": "Services shaped as a connected brand and growth system",
    "capabilities.intro": "We organize the essentials like a premium digital studio: clear identity, refined digital experience, conversion paths, reliable build, and practical automation that helps the business respond faster.",

    "process.kicker": "Process",
    "process.title": "From unclear brief to launchable system.",
    "process.stepOneTitle": "Diagnose",
    "process.stepOneText": "We clarify the audience, offer, current bottleneck, and what the first version must prove.",
    "process.stepTwoTitle": "Shape",
    "process.stepTwoText": "We define messaging, structure, visual direction, UX flow, and the priority service path.",
    "process.stepThreeTitle": "Build",
    "process.stepThreeText": "We design and develop the assets, pages, automations, or product screens needed for launch.",
    "process.stepFourTitle": "Measure",
    "process.stepFourText": "We connect capture, follow-up, analytics, and iteration so the system can improve after launch.",
    "process.stepOneMeta": "Brief map · Offer · First metric",
    "process.stepTwoMeta": "Messaging · Structure · Visual direction",
    "process.stepThreeMeta": "Design · Build · Automations",
    "process.stepFourMeta": "Capture · Analytics · Iteration",

    "ai.label": "AI Automation",
    "ai.title": "AI belongs inside a useful workflow, not beside it.",
    "ai.text": "We use AI where it can reduce friction: lead intake, service matching, first response, content routing, internal dashboards, and follow-up. The goal is practical speed with clear human handoff.",
    "ai.cta": "Map an AI workflow",
    "ai.metricResponse": "Process first",
    "ai.metricTasks": "Cleaner handoff",
    "ai.metricROI": "Measurable iteration",
    "ai.traceIntake": "Intake",
    "ai.traceMatch": "Service match",
    "ai.traceResponse": "First response",
    "ai.traceHandoff": "Human handoff",
    "ai.traceTry": "Try the intake yourself",

    "work.kicker": "Selected work",
    "work.title": "Client work, with a name and a number. Nothing else goes here.",
    "work.viewAll": "Start a project",
    "work.ledgerTitle": "What we can't prove yet",
    "work.ledgerLead": "Most studio sites leave this part out. The rest of this page asks you to trust figures, so you should also know which figures we don't have.",
    "work.ledgerPublished": "Published client projects",
    "work.ledgerPending": "Signed, not yet publishable",
    "work.ledgerPendingNote": "They go up with the client's name and an agreed number, or they don't go up.",
    "work.ledgerRedactedLabel": "Signed engagement",
    "work.ledgerRedactedNote": "Name withheld until launch.",
    "servicesPage.kicker": "Services",
    "servicesPage.title": "Six services that chain, not six things on a menu.",
    "servicesPage.lede": "Most work here starts in one of three places — a brand that does not hold, a site that does not explain, or attention that has nowhere to go — and the rest follows in a predictable order. You can buy one. It just helps to know where it sits.",
    "servicesPage.close": "Nothing here is a package. Every engagement starts with a written proposal that names the scope, the deliverables and the price.",
    "servicesPage.othersTitle": "The other five",
    "servicePage.fitTitle": "Who this is for",
    "servicePage.whatTitle": "What it covers",
    "servicePage.howTitle": "How the work runs",
    "servicePage.ctaTitle": "Start with a diagnosis, not a quote.",
    "servicePage.ctaText": "Tell us the bottleneck. If this is not the right service for it, we will say so and point at the one that is.",
    "insightsPage.kicker": "Insights",
    "insightsPage.title": "Short notes, signed.",
    "insightsPage.lede": "No content calendar, no filler. These are the arguments that come up often enough in client conversations to be worth writing down once — a minute each, and they say a minute.",
    "insightsPage.close": "Written by Arturo Valle, who does the work these describe.",
    "insightsPage.ctaText": "Notes are short on purpose. The long version happens in a project.",
    "insightsPage.moreTitle": "More notes",
    "studioPage.kicker": "The studio",
    "studioPage.title": "One senior operator, and specialists when the work calls for them.",
    "studioPage.lede": "CREATIVE MK is Arturo Valle. Strategy, design and build happen in one conversation because they happen with one person — and when a project needs a motion designer, a copy editor or a second pair of engineering hands, they are brought in and named, not hidden behind a plural.",
    "studioPage.ruleTitle": "The publishing rule",
    "studioPage.ruleText": "Client work goes up with the client's name and an agreed number, or it does not go up. That is why the work page is short and why two engagements currently appear as redaction bars. It also means everything you do see is real — no borrowed logos, no capability showcases, no stock.",
    "studioPage.ruleCta": "See the ledger",
    "studioPage.ledgerTitle": "Where things actually stand",
    "studioPage.ledgerTeam": "Team",
    "studioPage.ledgerTeamNote": "plus specialists per project",
    "studioPage.ledgerEngagements": "Engagements underway",
    "studioPage.ledgerEngagementsNote": "signed, not yet publishable",
    "studioPage.ledgerLanguages": "Languages",
    "studioPage.ledgerLanguagesNote": "English and Spanish, one team",
    "studioPage.ledgerAwards": "Awards",
    "studioPage.ledgerAwardsNote": "first year entering",
    "studioPage.labTitle": "What the studio builds for itself",
    "studioPage.labText": "The intake agent that answers on this site and the WebGL field behind the homepage are both ours, both live, and both documented. They are the most honest proof a one-person studio can offer: not a description of the work, but the work, running where you can poke it.",
    "studioPage.ctaTitle": "If the fit is wrong, you will hear it from me.",
    "studioPage.ctaText": "A brief gets read by the person who would do the work. That is the whole advantage of a studio this size.",
    "nav.lab": "Lab",
    "subpage.home": "Home",
    "subpage.work": "Work",
    "subpage.lab": "Lab",
    "workPage.kicker": "The ledger",
    "workPage.title": "Client work, with a name and a number.",
    "workPage.lede": "Every engagement on this page is published with the client's name and an agreed figure, or it is not published. That rule is why the list below is short — and why it can be trusted.",
    "workPage.slotLabel": "Signed engagement",
    "workPage.slotNote": "In production. Published with the client's name and an agreed number, or not at all.",
    "workPage.labTitle": "Self-initiated: the lab",
    "workPage.labNote": "What the studio builds for itself, in public: the intake agent running this site and the WebGL terrain behind its hero.",
    "workPage.labCta": "Enter the lab",
    "workPage.close": "No borrowed logos, no \"capability showcases\", no stock. When a name goes up here, it is real.",
    "labPage.kicker": "The lab",
    "labPage.title": "What the studio builds for itself, in public.",
    "labPage.lede": "Client work carries names and numbers. Lab work carries neither — it is the studio using its own tools on itself, and everything here runs live on this site.",
    "labPage.pieceOneTitle": "MK Growth Concierge",
    "labPage.pieceOneText": "An intake agent on Cloudflare Workers and Durable Objects: it receives a brief, matches it to a service, drafts the first response and hands off to a person. The diagram on the homepage is its real pipeline, and the form on the contact page feeds it.",
    "labPage.pieceOneCta": "See it run",
    "labPage.pieceTwoTitle": "Signal Terrain",
    "labPage.pieceTwoText": "The WebGL field behind the entire homepage: a contour terrain in the brand's gold and navy that swells on arrival, rises toward the cursor, and turns with the page's three acts — night, paper, night — as you scroll. One shader on one triangle, loaded only where a GPU can carry it.",
    "labPage.pieceTwoCta": "Watch the terrain",
    "labPage.pieceThreeTitle": "Next: an authored WebGL piece",
    "labPage.pieceThreeText": "In progress for autumn 2026. It lands here first.",
    "work.ledgerAwards": "Awards",
    "work.ledgerAwardsNote": "None. This is the first year we're entering.",
    "work.ledgerTeam": "Team",
    "work.ledgerTeamValue": "One, plus specialists per project",
    "work.ledgerClose": "Work appears here when the client signs off on the number, not before.",

    "about.title": "A compact digital studio with strategy, design and build in one conversation.",
    "about.text": "CREATIVE MK helps businesses turn scattered digital needs into a coherent system: brand, website, product experience, content, paid growth, automation, and measurement.",
    "about.viewServices": "View our services",
    "about.bottomText": "The work is intentionally focused: understand the business, sharpen the message, design the experience, build what is needed, and connect the follow-up path so every touchpoint has a job.",
    "about.learnMore": "Talk to CREATIVE MK",

    "news.title": "Insights",
    "news.visitBlog": "Ask for guidance",
    "faq.title": "Frequently Asked Questions",

    "footer.ctaLabel": "Start a project",
    "footer.ctaTitle": "Let's Talk",
    "footer.emailLabel": "New Business",
    "footer.phoneLabel": "Project Path",
    "footer.projectPath": "Send a brief",
    "footer.navigation": "Navigation",
    "footer.services": "Services",
    "footer.office": "Office",
    "footer.address": "Digital-first agency<br>Available worldwide",
    "footer.stayUpdated": "Stay Updated",
    "footer.newsletterText": "Get occasional notes on branding, UX, websites, growth systems, and practical AI.",
    "footer.emailPlaceholder": "Your email",
    "footer.subscribe": "Subscribe",
    "footer.rights": "All rights reserved.",
    "footer.privacy": "Privacy Notice",
    "footer.terms": "Service Terms",
    "footer.subscribeSuccess": "Thanks for subscribing!"
  },
  es: {
    "nav.work": "Proyectos",
    "nav.services": "Servicios",
    "nav.about": "Nosotros",
    "nav.blog": "Insights",
    "nav.contact": "Contacto",
    "nav.webDesign": "Sitios Web",
    "nav.landingPages": "Páginas de conversión",
    "nav.salesFunnels": "Sistemas de crecimiento",
    "nav.metaAds": "Growth & Marketing",
    "nav.socialMedia": "Sistemas de contenido",
    "nav.branding": "Branding",
    "nav.logoCreation": "Sistemas de identidad",
    "nav.brandManual": "Guías de marca",
    "nav.appDev": "Desarrollo",
    "nav.uxui": "Producto Digital UX/UI",
    "nav.aiAutomation": "Automatización IA",
    "nav.allServices": "Todas las capacidades ->",

    "hero.eyebrow": "Branding, UX/UI, sitios web, crecimiento e IA",
    "hero.title": "Experiencias digitales para marcas listas para crecer con claridad",
    "hero.lede": "CREATIVE MK es un estudio digital bilingüe que integra identidad de marca, UX/UI, sitios web, sistemas de crecimiento, desarrollo y automatización con IA en una presencia coherente.",
    "hero.primaryCta": "Iniciar proyecto",
    "hero.secondaryCta": "Explorar servicios",
    "hero.cardStrategy": "Posicionamiento",
    "hero.cardAutomation": "Automatización",
    "hero.playBtn": "Reproducir",
    "hero.soundEnable": "Activar sonido",
    "hero.soundMute": "Silenciar",

    "showreel.title": "Showreel de CREATIVE MK",

    "proof.kicker": "Modelo de estudio",
    "proof.title": "Un aliado senior y enfocado para los puntos digitales que construyen confianza.",
    "proof.text": "Inspirados por la disciplina de los mejores estudios digitales, conectamos estrategia, diseño, contenido, tecnología y automatización sin asumir que todos los negocios necesitan el mismo paquete.",
    "proof.itemOneLabel": "Disciplinas centrales",
    "proof.itemOneValue": "Marca + UX + Web + IA",
    "proof.itemTwoLabel": "Idiomas",
    "proof.itemTwoValue": "EN + ES, un solo equipo",
    "proof.itemThreeLabel": "Proyectos en curso",
    "proof.itemThreeValue": "Bilingüe, digital-first y guiada por estrategia",
    "proof.itemFourLabel": "Resultado",
    "proof.itemFourValue": "Sistemas listos para lanzar, no piezas sueltas",

    "capabilities.kicker": "Capacidades",
    "capabilities.title": "Servicios pensados como un sistema conectado de marca y crecimiento",
    "capabilities.intro": "Organizamos lo esencial como un estudio digital premium: identidad clara, experiencia digital refinada, rutas de conversión, construcción confiable y automatización práctica para responder más rápido.",

    "process.kicker": "Proceso",
    "process.title": "De una idea poco clara a un sistema listo para lanzar.",
    "process.stepOneTitle": "Diagnosticar",
    "process.stepOneText": "Aclaramos audiencia, oferta, cuello de botella actual y qué debe probar la primera versión.",
    "process.stepTwoTitle": "Dar forma",
    "process.stepTwoText": "Definimos mensaje, estructura, dirección visual, flujo UX y ruta prioritaria de servicio.",
    "process.stepThreeTitle": "Construir",
    "process.stepThreeText": "Diseñamos y desarrollamos los activos, páginas, automatizaciones o pantallas necesarias para lanzar.",
    "process.stepFourTitle": "Medir",
    "process.stepFourText": "Conectamos captura, seguimiento, analítica e iteración para que el sistema mejore después del lanzamiento.",
    "process.stepOneMeta": "Mapa de brief · Oferta · Primera métrica",
    "process.stepTwoMeta": "Mensaje · Estructura · Dirección visual",
    "process.stepThreeMeta": "Diseño · Build · Automatizaciones",
    "process.stepFourMeta": "Captura · Analítica · Iteración",

    "ai.label": "Automatización IA",
    "ai.title": "La IA debe vivir dentro de un flujo útil, no al lado.",
    "ai.text": "Usamos IA donde reduce fricción: recepción de leads, recomendación de servicios, primera respuesta, rutas de contenido, dashboards internos y seguimiento. El objetivo es velocidad práctica con entrega clara a personas.",
    "ai.cta": "Mapear un flujo con IA",
    "ai.metricResponse": "Proceso primero",
    "ai.metricTasks": "Entrega más limpia",
    "ai.metricROI": "Iteración medible",
    "ai.traceIntake": "Recepción",
    "ai.traceMatch": "Selección de servicio",
    "ai.traceResponse": "Primera respuesta",
    "ai.traceHandoff": "Entrega humana",
    "ai.traceTry": "Prueba la recepción tú mismo",

    "work.kicker": "Trabajo seleccionado",
    "work.title": "Trabajo de cliente, con nombre y con cifra. Aquí no entra nada más.",
    "work.viewAll": "Empezar un proyecto",
    "work.ledgerTitle": "Lo que todavía no podemos demostrar",
    "work.ledgerLead": "Casi ningún sitio de estudio pone esta parte. El resto de esta página te pide que te fíes de unas cifras, así que también deberías saber cuáles no tenemos.",
    "work.ledgerPublished": "Proyectos de cliente publicados",
    "work.ledgerPending": "Firmados, todavía no publicables",
    "work.ledgerPendingNote": "Se publican con el nombre del cliente y una cifra acordada, o no se publican.",
    "work.ledgerRedactedLabel": "Contrato firmado",
    "work.ledgerRedactedNote": "Nombre reservado hasta el lanzamiento.",
    "servicesPage.kicker": "Servicios",
    "servicesPage.title": "Seis servicios que se encadenan, no seis cosas en un menú.",
    "servicesPage.lede": "Casi todo el trabajo empieza en uno de tres lugares — una marca que no sostiene, un sitio que no explica, o atención que no tiene a dónde ir — y el resto sigue en un orden predecible. Puedes contratar uno solo. Solo ayuda saber dónde encaja.",
    "servicesPage.close": "Aquí no hay paquetes. Cada proyecto empieza con una propuesta escrita que nombra alcance, entregables y precio.",
    "servicesPage.othersTitle": "Los otros cinco",
    "servicePage.fitTitle": "Para quién es",
    "servicePage.whatTitle": "Qué incluye",
    "servicePage.howTitle": "Cómo corre el trabajo",
    "servicePage.ctaTitle": "Empieza con un diagnóstico, no con una cotización.",
    "servicePage.ctaText": "Cuéntanos el cuello de botella. Si este no es el servicio correcto para resolverlo, lo decimos y señalamos el que sí.",
    "insightsPage.kicker": "Notas",
    "insightsPage.title": "Notas cortas, firmadas.",
    "insightsPage.lede": "Sin calendario de contenido, sin relleno. Son los argumentos que aparecen suficientes veces en conversaciones con clientes como para escribirlos una vez — un minuto cada uno, y dicen un minuto.",
    "insightsPage.close": "Escritas por Arturo Valle, que hace el trabajo que describen.",
    "insightsPage.ctaText": "Las notas son cortas a propósito. La versión larga ocurre en un proyecto.",
    "insightsPage.moreTitle": "Más notas",
    "studioPage.kicker": "El estudio",
    "studioPage.title": "Un operador senior, y especialistas cuando el trabajo los pide.",
    "studioPage.lede": "CREATIVE MK es Arturo Valle. Estrategia, diseño y construcción ocurren en una sola conversación porque ocurren con una sola persona — y cuando un proyecto necesita un diseñador de motion, un editor de copy o un segundo par de manos de ingeniería, se los trae y se los nombra, no se los esconde detrás de un plural.",
    "studioPage.ruleTitle": "La regla de publicación",
    "studioPage.ruleText": "El trabajo de cliente se publica con el nombre del cliente y una cifra acordada, o no se publica. Por eso la página de trabajo es corta y por eso dos proyectos aparecen hoy como barras de redacción. También significa que todo lo que sí ves es real — sin logos prestados, sin muestras de capacidad, sin stock.",
    "studioPage.ruleCta": "Ver el registro",
    "studioPage.ledgerTitle": "Dónde están las cosas realmente",
    "studioPage.ledgerTeam": "Equipo",
    "studioPage.ledgerTeamNote": "más especialistas por proyecto",
    "studioPage.ledgerEngagements": "Proyectos en curso",
    "studioPage.ledgerEngagementsNote": "firmados, todavía no publicables",
    "studioPage.ledgerLanguages": "Idiomas",
    "studioPage.ledgerLanguagesNote": "inglés y español, un solo equipo",
    "studioPage.ledgerAwards": "Premios",
    "studioPage.ledgerAwardsNote": "primer año participando",
    "studioPage.labTitle": "Lo que el estudio construye para sí mismo",
    "studioPage.labText": "El agente de recepción que responde en este sitio y el campo WebGL detrás de la portada son ambos nuestros, ambos en vivo y ambos documentados. Son la prueba más honesta que puede ofrecer un estudio de una persona: no una descripción del trabajo, sino el trabajo, corriendo donde puedes tocarlo.",
    "studioPage.ctaTitle": "Si el encaje no es el correcto, lo vas a oír de mí.",
    "studioPage.ctaText": "Un brief lo lee la persona que haría el trabajo. Esa es toda la ventaja de un estudio de este tamaño.",
    "nav.lab": "Lab",
    "subpage.home": "Inicio",
    "subpage.work": "Trabajo",
    "subpage.lab": "Lab",
    "workPage.kicker": "El registro",
    "workPage.title": "Trabajo de cliente, con nombre y con cifra.",
    "workPage.lede": "Cada proyecto en esta página se publica con el nombre del cliente y una cifra acordada, o no se publica. Esa regla es la razón de que la lista sea corta — y de que se pueda confiar en ella.",
    "workPage.slotLabel": "Contrato firmado",
    "workPage.slotNote": "En producción. Se publica con el nombre del cliente y una cifra acordada, o no se publica.",
    "workPage.labTitle": "Iniciativa propia: el lab",
    "workPage.labNote": "Lo que el estudio construye para sí mismo, en público: el agente de recepción que corre este sitio y el terreno WebGL detrás de su hero.",
    "workPage.labCta": "Entrar al lab",
    "workPage.close": "Sin logos prestados, sin \"muestras de capacidad\", sin stock. Cuando un nombre sube aquí, es real.",
    "labPage.kicker": "El lab",
    "labPage.title": "Lo que el estudio construye para sí mismo, en público.",
    "labPage.lede": "El trabajo de cliente lleva nombres y cifras. El del lab no lleva ninguno — es el estudio usando sus propias herramientas sobre sí mismo, y todo lo de aquí corre en vivo en este sitio.",
    "labPage.pieceOneTitle": "MK Growth Concierge",
    "labPage.pieceOneText": "Un agente de recepción sobre Cloudflare Workers y Durable Objects: recibe un brief, lo empareja con un servicio, redacta la primera respuesta y entrega a una persona. El diagrama de la portada es su pipeline real, y el formulario de contacto lo alimenta.",
    "labPage.pieceOneCta": "Verlo correr",
    "labPage.pieceTwoTitle": "Signal Terrain",
    "labPage.pieceTwoText": "El campo WebGL detrás de toda la portada: un terreno de contornos en el oro y navy de la marca que se hincha al llegar, se eleva hacia el cursor y gira con los tres actos de la página — noche, papel, noche — mientras haces scroll. Un shader sobre un triángulo, cargado solo donde una GPU puede con él.",
    "labPage.pieceTwoCta": "Ver el terreno",
    "labPage.pieceThreeTitle": "Siguiente: una pieza WebGL de autor",
    "labPage.pieceThreeText": "En progreso para otoño de 2026. Aterriza aquí primero.",
    "work.ledgerAwards": "Premios",
    "work.ledgerAwardsNote": "Ninguno. Este es el primer año que nos presentamos.",
    "work.ledgerTeam": "Equipo",
    "work.ledgerTeamValue": "Una persona, más especialistas por proyecto",
    "work.ledgerClose": "El trabajo aparece aquí cuando el cliente firma la cifra, no antes.",

    "about.title": "Un estudio digital compacto con estrategia, diseño y construcción en una sola conversación.",
    "about.text": "CREATIVE MK ayuda a convertir necesidades digitales dispersas en un sistema coherente: marca, sitio web, experiencia de producto, contenido, pauta, automatización y medición.",
    "about.viewServices": "Ver nuestros servicios",
    "about.bottomText": "El trabajo es intencionalmente enfocado: entender el negocio, afinar el mensaje, diseñar la experiencia, construir lo necesario y conectar el seguimiento para que cada punto de contacto tenga una función.",
    "about.learnMore": "Hablar con CREATIVE MK",

    "news.title": "Insights",
    "news.visitBlog": "Pedir orientación",
    "faq.title": "Preguntas frecuentes",

    "footer.ctaLabel": "Iniciar un proyecto",
    "footer.ctaTitle": "Hablemos",
    "footer.emailLabel": "Nuevos Negocios",
    "footer.phoneLabel": "Ruta de proyecto",
    "footer.projectPath": "Enviar brief",
    "footer.navigation": "Navegación",
    "footer.services": "Servicios",
    "footer.office": "Oficina",
    "footer.address": "Estudio digital-first<br>Disponible de forma remota",
    "footer.stayUpdated": "Mantente al día",
    "footer.newsletterText": "Recibe notas ocasionales sobre branding, UX, sitios web, sistemas de crecimiento e IA práctica.",
    "footer.emailPlaceholder": "Tu email",
    "footer.subscribe": "Suscribirse",
    "footer.rights": "Todos los derechos reservados.",
    "footer.privacy": "Aviso de privacidad",
    "footer.terms": "Términos de servicio",
    "footer.subscribeSuccess": "Gracias por suscribirte!"
  }
};

const LANG_STORAGE_KEY = 'creativeMkLang';

function getStoredLanguage() {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) === 'es' ? 'es' : 'en';
  } catch (error) {
    return 'en';
  }
}

function storeLanguage(lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (error) {
    // Storage can fail in private browsing modes; language switching still works for the current page.
  }
}

let currentLang = getStoredLanguage();

function setLanguage(lang) {
  currentLang = lang;
  storeLanguage(lang);
  const dict = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.placeholder = dict[key];
  });
  /* Elements that deliberately show the OTHER language — the footer finale's
     ghost layer. Swapping languages swaps the pair, never duplicates it. */
  const alt = translations[lang === 'en' ? 'es' : 'en'];
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const key = el.getAttribute('data-i18n-alt');
    if (alt[key]) el.innerHTML = alt[key];
  });
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-switch').forEach(sw => {
    sw.querySelectorAll('.lang-switch__btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  });
  if (typeof resetAccordion === 'function') {
    resetAccordion('#capabilities-list');
    resetAccordion('#faq-list');
  }
  if (typeof renderCapabilities === 'function') renderCapabilities();
  if (typeof renderWork === 'function') renderWork();
  if (typeof renderFAQ === 'function') renderFAQ();
  if (typeof animateHeroTitle === 'function') animateHeroTitle();
  if (typeof syncHeroSoundButton === 'function') syncHeroSoundButton();
  /* Spanish runs ~20% longer than English, so every swap can change layout
     height. Anything that measured the page (ScrollTrigger, drawn SVGs)
     listens for this one event and re-measures. */
  document.dispatchEvent(new CustomEvent('mk:i18n', { detail: { lang } }));
}

function initI18n() {
  document.querySelectorAll('.lang-switch__btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
  if (currentLang !== 'en') {
    setLanguage(currentLang);
  }
}
