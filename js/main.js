/* ============================================
   Main.js - Content Data & Initialization
   ============================================ */

const servicesData = {
  en: [
    {
      title: 'Branding',
      lead: 'Identity and positioning',
      desc: 'We define the promise, voice, visual identity, offer architecture, and brand rules that help a business feel consistent across website, ads, content, sales materials, and future campaigns.',
      proof: 'Best for new brands, premium repositioning, service businesses, and teams that need trust before scaling attention.',
      tags: ['Strategy', 'Identity', 'Guidelines'],
      media: 'images/services/branding.png'
    },
    {
      title: 'Websites',
      lead: 'Marketing site',
      desc: 'We design and build editorial, conversion-aware websites with clear messaging, UX structure, service pathways, proof blocks, SEO foundations, and a contact flow that respects the buyer.',
      proof: 'Best for service brands, expert firms, local leaders, and companies whose current site does not explain the offer fast enough.',
      tags: ['UX', 'Copy', 'SEO'],
      media: 'images/services/web-design.png'
    },
    {
      title: 'Digital Product UX/UI',
      lead: 'Product experience',
      desc: 'We map product journeys, dashboards, portals, onboarding flows, and app interfaces so complex actions feel clear before a team commits to a build.',
      proof: 'Best for SaaS ideas, internal tools, client portals, MVPs, and businesses with a workflow that needs a better interface.',
      tags: ['Flows', 'Prototype', 'Design System'],
      media: 'images/services/ux-ui-design-premium-preview.png'
    },
    {
      title: 'Growth & Marketing',
      lead: 'Campaign system',
      desc: 'We shape landing pages, funnels, Meta campaigns, content rhythms, tracking, and follow-up paths so attention has somewhere useful to go.',
      proof: 'Best when the offer is clear enough to test traffic, capture demand, and learn from real audience signals.',
      tags: ['Offer', 'Traffic', 'Follow-up'],
      media: 'images/services/sales-funnels.png'
    },
    {
      title: 'AI Automation',
      lead: 'Workflow intelligence',
      desc: 'We connect intake, service matching, first-response support, knowledge bases, dashboards, and follow-up rules so teams respond faster without losing human control.',
      proof: 'Best for businesses with repeated questions, slow lead handoff, manual reporting, or operations that need a cleaner first layer.',
      tags: ['Intake', 'Routing', 'Dashboards'],
      media: 'images/services/email-marketing.png'
    },
    {
      title: 'Development',
      lead: 'Reliable build',
      desc: 'We turn approved strategy and UX into responsive pages, front-end systems, forms, analytics, integrations, and lightweight app experiences that are ready to use.',
      proof: 'Best when the brand, website, product screen, form, CRM, and automation need to work together instead of living as separate pieces.',
      tags: ['Frontend', 'Forms', 'Integrations'],
      media: 'images/services/landing-pages.png'
    }
  ],
  es: [
    {
      title: 'Branding',
      lead: 'Identidad y posicionamiento',
      desc: 'Definimos promesa, voz, identidad visual, arquitectura de oferta y reglas de marca para que el negocio se sienta consistente en sitio web, anuncios, contenido, ventas y futuras campañas.',
      proof: 'Ideal para marcas nuevas, reposicionamientos premium, negocios de servicio y equipos que necesitan confianza antes de escalar la atención.',
      tags: ['Estrategia', 'Identidad', 'Guías'],
      media: 'images/services/branding.png'
    },
    {
      title: 'Sitios Web',
      lead: 'Sitio de marketing',
      desc: 'Diseñamos y construimos sitios editoriales orientados a conversión, con mensaje claro, estructura UX, rutas de servicio, bloques de prueba, bases SEO y un contacto respetuoso para el comprador.',
      proof: 'Ideal para marcas de servicio, firmas expertas, líderes locales y empresas cuyo sitio actual no explica la oferta con suficiente rapidez.',
      tags: ['UX', 'Copy', 'SEO'],
      media: 'images/services/web-design.png'
    },
    {
      title: 'Producto Digital UX/UI',
      lead: 'Experiencia de producto',
      desc: 'Mapeamos journeys, dashboards, portales, onboarding e interfaces de app para que acciones complejas se entiendan antes de comprometer al equipo con el desarrollo.',
      proof: 'Ideal para ideas SaaS, herramientas internas, portales de cliente, MVPs y negocios con procesos que necesitan una mejor interfaz.',
      tags: ['Flujos', 'Prototipo', 'Sistema UI'],
      media: 'images/services/ux-ui-design-premium-preview.png'
    },
    {
      title: 'Growth & Marketing',
      lead: 'Sistema de campaña',
      desc: 'Damos forma a landing pages, embudos, campañas Meta, ritmos de contenido, medición y rutas de seguimiento para que la atención tenga un siguiente paso útil.',
      proof: 'Ideal cuando la oferta ya está lo suficientemente clara para probar tráfico, capturar demanda y aprender de señales reales de audiencia.',
      tags: ['Oferta', 'Tráfico', 'Seguimiento'],
      media: 'images/services/sales-funnels.png'
    },
    {
      title: 'Automatización IA',
      lead: 'Inteligencia operativa',
      desc: 'Conectamos recepción de leads, recomendación de servicios, primera respuesta, bases de conocimiento, dashboards y reglas de seguimiento para responder más rápido sin perder control humano.',
      proof: 'Ideal para negocios con preguntas repetidas, traspaso lento de leads, reportes manuales u operaciones que necesitan una primera capa más clara.',
      tags: ['Recepción', 'Rutas', 'Dashboards'],
      media: 'images/services/email-marketing.png'
    },
    {
      title: 'Desarrollo',
      lead: 'Construcción confiable',
      desc: 'Convertimos estrategia y UX aprobadas en páginas responsivas, sistemas front-end, formularios, analítica, integraciones y experiencias ligeras de app listas para usar.',
      proof: 'Ideal cuando marca, sitio, pantalla de producto, formulario, CRM y automatización deben trabajar juntos en lugar de vivir como piezas separadas.',
      tags: ['Frontend', 'Formularios', 'Integraciones'],
      media: 'images/services/landing-pages.png'
    }
  ]
};

const workData = {
  en: [
    {
      name: 'Growth System Blueprint',
      category: 'Growth',
      desc: 'A connected campaign and follow-up system for turning paid attention into qualified conversations.',
      tags: ['Offer', 'Traffic', 'Follow-up'],
      color: '#18212f',
      img: 'images/portfolio-1.png',
      outcome: 'Capability showcase',
      isRealClient: false,
      case: {
        challenge: 'A service business can have ads, a form, a calendar, and follow-up messages without those pieces telling one clear story.',
        solution: 'We sharpen the offer, design the landing path, define the lead capture logic, and connect the first response so the campaign has a complete next step.',
        result: 'A practical acquisition system that is easier to launch, measure, and improve without depending on scattered manual follow-up.',
        deliverables: ['Offer map', 'Conversion page', 'Lead capture path', 'Follow-up sequence']
      }
    },
    {
      name: 'Premium Service Website',
      category: 'Web',
      desc: 'A refined website structure for trust, positioning, service clarity, and qualified inquiries.',
      tags: ['Websites', 'Messaging', 'UX'],
      color: '#263c35',
      img: 'images/portfolio-2.png',
      outcome: 'Capability showcase',
      isRealClient: false,
      case: {
        challenge: 'Premium service brands often have strong expertise but a website that explains too much, proves too little, and makes the next step feel vague.',
        solution: 'We structure the site around a clear promise, service pathways, proof sections, concise copy, and a contact experience that feels considered.',
        result: 'A digital front door that makes the offer easier to understand, trust, and act on.',
        deliverables: ['Messaging architecture', 'Homepage UX', 'Service pathways', 'Contact flow']
      }
    },
    {
      name: 'Brand Identity System',
      category: 'Brand',
      desc: 'A flexible identity foundation for launches, web, content, sales materials, and future campaigns.',
      tags: ['Branding', 'Identity', 'Guidelines'],
      color: '#4f342f',
      img: 'images/portfolio-5.png',
      outcome: 'Capability showcase',
      isRealClient: false,
      case: {
        challenge: 'A brand can look acceptable in one place and still feel inconsistent across ads, social posts, proposals, decks, and vendor handoffs.',
        solution: 'We create a practical system: positioning, logo direction, palette, typography, tone, usage rules, and examples for the channels the business actually uses.',
        result: 'A brand foundation that helps every touchpoint feel intentional without slowing the team down.',
        deliverables: ['Positioning notes', 'Logo direction', 'Visual system', 'Brand guide']
      }
    },
    {
      name: 'Product UX Sprint',
      category: 'Product',
      desc: 'A focused UX/UI sprint for dashboards, portals, onboarding, MVPs, and app workflows.',
      tags: ['UX/UI', 'Prototype', 'Design System'],
      color: '#14283a',
      img: 'images/portfolio-6.png',
      outcome: 'Capability showcase',
      isRealClient: false,
      case: {
        challenge: 'Product ideas often become feature lists before the primary user journey, value moment, and build sequence are clear.',
        solution: 'We define the priority workflows, prototype the experience, design reusable UI patterns, and identify the smallest useful version to build first.',
        result: 'A product direction that helps founders and teams move with less waste and more confidence.',
        deliverables: ['Journey map', 'Clickable prototype', 'UI components', 'MVP scope']
      }
    },
    {
      name: 'Visibility Operating Rhythm',
      category: 'Content',
      desc: 'A content and campaign rhythm for visibility, consistency, authority, and useful reporting.',
      tags: ['Content', 'Campaigns', 'Reporting'],
      color: '#604024',
      img: 'images/portfolio-4.png',
      outcome: 'Capability showcase',
      isRealClient: false,
      case: {
        challenge: 'Teams often post inconsistently because ideas, approvals, formats, offers, and reporting live in separate places.',
        solution: 'We define content pillars, reusable formats, campaign angles, cadence, brief templates, and reporting views so visibility becomes operational.',
        result: 'A rhythm built for steady authority and campaign support instead of last-minute posting.',
        deliverables: ['Content pillars', 'Campaign angles', 'Posting cadence', 'Reporting view']
      }
    },
    {
      name: 'AI Intake Layer',
      category: 'AI',
      desc: 'An AI-assisted intake and handoff layer for service requests, FAQs, and first-response needs.',
      tags: ['AI Automation', 'Intake', 'Handoff'],
      color: '#20263a',
      img: 'images/portfolio-3.png',
      outcome: 'Capability showcase',
      isRealClient: false,
      case: {
        challenge: 'When inquiries arrive from many channels, response quality can depend too much on who is available that day.',
        solution: 'We structure the intake questions, match the service path, prepare useful first-response logic, and surface what a human should review next.',
        result: 'A faster first layer and cleaner handoff from marketing to sales or operations.',
        deliverables: ['Smart intake', 'Service matching', 'Follow-up prompts', 'Ops dashboard']
      }
    }
  ],
  es: [
    {
      name: 'Blueprint de Sistema de Crecimiento',
      category: 'Growth',
      desc: 'Un sistema conectado de campaña y seguimiento para convertir atención pagada en conversaciones calificadas.',
      tags: ['Oferta', 'Tráfico', 'Seguimiento'],
      color: '#18212f',
      img: 'images/portfolio-1.png',
      outcome: 'Showcase de capacidad',
      isRealClient: false,
      case: {
        challenge: 'Un negocio de servicio puede tener anuncios, formulario, calendario y mensajes de seguimiento sin que esas piezas cuenten una historia clara.',
        solution: 'Afinamos la oferta, diseñamos la ruta de landing, definimos la lógica de captura y conectamos la primera respuesta para que la campaña tenga un siguiente paso completo.',
        result: 'Un sistema de adquisición práctico, más fácil de lanzar, medir y mejorar sin depender de seguimiento manual disperso.',
        deliverables: ['Mapa de oferta', 'Página de conversión', 'Ruta de captura', 'Secuencia de seguimiento']
      }
    },
    {
      name: 'Sitio Premium de Servicio',
      category: 'Web',
      desc: 'Una estructura web refinada para confianza, posicionamiento, claridad de servicios y oportunidades calificadas.',
      tags: ['Sitios Web', 'Mensaje', 'UX'],
      color: '#263c35',
      img: 'images/portfolio-2.png',
      outcome: 'Showcase de capacidad',
      isRealClient: false,
      case: {
        challenge: 'Muchas marcas de servicio tienen experiencia real, pero un sitio que explica demasiado, prueba poco y deja ambiguo el siguiente paso.',
        solution: 'Estructuramos el sitio alrededor de una promesa clara, rutas de servicio, bloques de prueba, copy conciso y un contacto más considerado.',
        result: 'Una puerta digital que hace la oferta más fácil de entender, confiar y accionar.',
        deliverables: ['Arquitectura de mensaje', 'UX de homepage', 'Rutas de servicio', 'Flujo de contacto']
      }
    },
    {
      name: 'Sistema de Identidad',
      category: 'Brand',
      desc: 'Una base flexible de identidad para lanzamientos, web, contenido, materiales comerciales y futuras campañas.',
      tags: ['Branding', 'Identidad', 'Guías'],
      color: '#4f342f',
      img: 'images/portfolio-5.png',
      outcome: 'Showcase de capacidad',
      isRealClient: false,
      case: {
        challenge: 'Una marca puede verse aceptable en un lugar y aun así sentirse inconsistente en anuncios, redes, propuestas, decks y entregas a proveedores.',
        solution: 'Creamos un sistema práctico: posicionamiento, dirección de logo, paleta, tipografía, tono, reglas de uso y ejemplos para canales reales.',
        result: 'Una base de marca que ayuda a que cada punto de contacto se sienta intencional sin frenar al equipo.',
        deliverables: ['Notas de posicionamiento', 'Dirección de logo', 'Sistema visual', 'Guía de marca']
      }
    },
    {
      name: 'Sprint de Producto UX',
      category: 'Product',
      desc: 'Un sprint UX/UI para dashboards, portales, onboarding, MVPs y flujos de app.',
      tags: ['UX/UI', 'Prototipo', 'Sistema UI'],
      color: '#14283a',
      img: 'images/portfolio-6.png',
      outcome: 'Showcase de capacidad',
      isRealClient: false,
      case: {
        challenge: 'Las ideas de producto suelen convertirse en listas de funciones antes de aclarar el recorrido principal, el momento de valor y la secuencia de construcción.',
        solution: 'Definimos flujos prioritarios, prototipamos la experiencia, diseñamos patrones reutilizables e identificamos la versión mínima útil para construir primero.',
        result: 'Una dirección de producto que ayuda a avanzar con menos desperdicio y más confianza.',
        deliverables: ['Mapa de journey', 'Prototipo clickable', 'Componentes UI', 'Alcance MVP']
      }
    },
    {
      name: 'Ritmo Operativo de Visibilidad',
      category: 'Content',
      desc: 'Un ritmo de contenido y campaña para visibilidad, consistencia, autoridad y reportes útiles.',
      tags: ['Contenido', 'Campañas', 'Reportes'],
      color: '#604024',
      img: 'images/portfolio-4.png',
      outcome: 'Showcase de capacidad',
      isRealClient: false,
      case: {
        challenge: 'Los equipos suelen publicar de forma irregular porque ideas, aprobaciones, formatos, ofertas y reportes viven en lugares distintos.',
        solution: 'Definimos pilares de contenido, formatos reutilizables, ángulos de campaña, cadencia, briefs y vistas de reporte para operar la visibilidad.',
        result: 'Un ritmo construido para autoridad constante y soporte de campañas, no publicaciones de último minuto.',
        deliverables: ['Pilares de contenido', 'Ángulos de campaña', 'Cadencia', 'Vista de reportes']
      }
    },
    {
      name: 'Capa de Recepción IA',
      category: 'AI',
      desc: 'Una capa asistida por IA para recepción de solicitudes, preguntas frecuentes y primera respuesta.',
      tags: ['IA', 'Recepción', 'Handoff'],
      color: '#20263a',
      img: 'images/portfolio-3.png',
      outcome: 'Showcase de capacidad',
      isRealClient: false,
      case: {
        challenge: 'Cuando las consultas llegan por muchos canales, la calidad de respuesta puede depender demasiado de quién esté disponible ese día.',
        solution: 'Estructuramos las preguntas de recepción, recomendamos la ruta de servicio, preparamos lógica de primera respuesta y mostramos lo que una persona debe revisar después.',
        result: 'Una primera capa más rápida y una entrega más limpia entre marketing, ventas y operaciones.',
        deliverables: ['Recepción inteligente', 'Recomendación de servicio', 'Prompts de seguimiento', 'Dashboard operativo']
      }
    }
  ]
};

const newsImages = ['images/news/news-1.png', 'images/news/news-2.png', 'images/news/news-3.png'];

const newsData = {
  en: [
    {
      category: 'AI Guide',
      title: 'Where AI actually helps a service business',
      date: 'May 2026',
      read: '6 min read',
      content: 'AI is most useful when it is attached to a specific business workflow. For service businesses, the strongest starting points are lead intake, service matching, first-response support, content routing, internal reporting, and follow-up reminders.\n\nThe mistake is treating AI as a decorative feature. A useful AI layer should know what information to ask for, what should be routed to a human, and where the next action lives.\n\nBefore adding AI, map the current delay: slow replies, repeated questions, unclear qualification, manual reporting, or inconsistent follow-up. That bottleneck should decide the first automation.'
    },
    {
      category: 'Websites',
      title: 'What makes a premium service website feel trustworthy',
      date: 'Apr 2026',
      read: '7 min read',
      content: 'Premium websites do not win by adding more decoration. They win by creating clarity: a strong promise, precise service paths, proof, thoughtful pacing, fast loading, and a contact path that respects the buyer.\n\nThe best service sites feel editorial and operational at the same time. They are beautiful, but every section has a job: explain, reduce doubt, show proof, or move the visitor toward a clear next step.\n\nIf a visitor cannot understand who the brand helps, what changes, and why the team can be trusted within the first few moments, the design is carrying too much weight and the message needs sharper structure.'
    },
    {
      category: 'Brand Strategy',
      title: 'Why funnels fail when the brand system is weak',
      date: 'Mar 2026',
      read: '6 min read',
      content: 'A funnel cannot fix a weak promise. Paid media, landing pages, and automation work best when the audience immediately understands who the brand helps, what changes, and why it should be trusted.\n\nA strong growth system connects positioning, creative, landing experience, follow-up, and measurement. If those parts are designed separately, the campaign becomes harder to test because each step uses a different message.\n\nBrand strategy is not just visual polish. It is the operating logic that helps every ad, page, email, and sales conversation point in the same direction.'
    }
  ],
  es: [
    {
      category: 'Guía IA',
      title: 'Dónde ayuda realmente la IA en un negocio de servicios',
      date: 'Mayo 2026',
      read: '6 min lectura',
      content: 'La IA funciona mejor cuando está conectada a un flujo específico del negocio. Para negocios de servicio, los mejores puntos de inicio suelen ser recepción de leads, recomendación de servicio, primera respuesta, rutas de contenido, reportes internos y recordatorios de seguimiento.\n\nEl error es tratar la IA como decoración. Una capa útil debe saber qué información pedir, qué debe pasar a una persona y dónde vive la siguiente acción.\n\nAntes de agregar IA, conviene mapear el retraso actual: respuestas lentas, preguntas repetidas, calificación poco clara, reportes manuales o seguimiento inconsistente. Ese cuello de botella debe decidir la primera automatización.'
    },
    {
      category: 'Sitios Web',
      title: 'Qué hace que un sitio premium genere confianza',
      date: 'Abr 2026',
      read: '7 min lectura',
      content: 'Los sitios premium no ganan por agregar más decoración. Ganan por crear claridad: una promesa fuerte, rutas precisas de servicio, prueba, ritmo, carga rápida y un contacto que respeta al comprador.\n\nLos mejores sitios de servicio se sienten editoriales y operativos al mismo tiempo. Son bellos, pero cada sección tiene una función: explicar, reducir dudas, mostrar prueba o mover al visitante hacia un siguiente paso claro.\n\nSi una persona no entiende a quién ayuda la marca, qué cambia y por qué confiar durante los primeros momentos, el diseño está cargando demasiado peso y el mensaje necesita mejor estructura.'
    },
    {
      category: 'Estrategia de marca',
      title: 'Por qué los embudos fallan cuando la marca es débil',
      date: 'Mar 2026',
      read: '6 min lectura',
      content: 'Un embudo no puede reparar una promesa débil. La pauta, las landing pages y la automatización funcionan mejor cuando la audiencia entiende rápido a quién ayuda la marca, qué cambia y por qué confiar.\n\nUn sistema de crecimiento fuerte conecta posicionamiento, creatividad, experiencia de landing, seguimiento y medición. Si esas partes se diseñan por separado, la campaña se vuelve más difícil de probar porque cada paso usa un mensaje distinto.\n\nLa estrategia de marca no es solo acabado visual. Es la lógica operativa que ayuda a que cada anuncio, página, correo y conversación comercial apunte en la misma dirección.'
    }
  ]
};

const faqData = {
  en: [
    { q: 'What services does CREATIVE MK offer?', a: 'We work across branding, websites, digital product UX/UI, growth and marketing systems, development, and practical AI automation. The goal is to connect the pieces that shape how a business is understood, trusted, and contacted.' },
    { q: 'Are the projects shown real client case studies?', a: 'The current work section is presented as capability showcases unless a project is explicitly labeled as client work. That keeps the site honest while still showing the type of systems CREATIVE MK can design and build.' },
    { q: 'Can you redesign an existing website or brand?', a: 'Yes. We can audit the current experience, preserve what is working, rebuild weak sections, and turn the brand, site, and follow-up path into a clearer system.' },
    { q: 'How do you approach AI automation?', a: 'We begin with a workflow, not a tool. Useful starting points include lead intake, service matching, first response, knowledge bases, dashboards, and follow-up prompts with a clear human handoff.' },
    { q: 'How long does a typical project take?', a: 'A focused landing page or audit can take 1-2 weeks, a full website often takes 4-8 weeks, and deeper brand, product, or automation systems usually take 4-10 weeks depending on scope.' }
  ],
  es: [
    { q: '¿Qué servicios ofrece CREATIVE MK?', a: 'Trabajamos branding, sitios web, producto digital UX/UI, sistemas de growth y marketing, desarrollo y automatización práctica con IA. El objetivo es conectar las piezas que hacen que un negocio se entienda, genere confianza y reciba mejores contactos.' },
    { q: '¿Los proyectos mostrados son casos reales de clientes?', a: 'La sección de trabajo actual se presenta como showcases de capacidad, a menos que un proyecto esté marcado explícitamente como trabajo de cliente. Así el sitio se mantiene honesto y aun así muestra el tipo de sistemas que CREATIVE MK puede diseñar y construir.' },
    { q: '¿Pueden rediseñar un sitio o marca existente?', a: 'Sí. Podemos auditar la experiencia actual, conservar lo que funciona, reconstruir secciones débiles y convertir marca, sitio y seguimiento en un sistema más claro.' },
    { q: '¿Cómo integran automatización con IA?', a: 'Empezamos con un flujo, no con una herramienta. Los mejores puntos de inicio suelen ser recepción de leads, recomendación de servicio, primera respuesta, bases de conocimiento, dashboards y prompts de seguimiento con entrega clara a una persona.' },
    { q: '¿Cuánto tiempo toma un proyecto?', a: 'Una landing o auditoría enfocada puede tomar 1-2 semanas, un sitio completo suele tomar 4-8 semanas y sistemas más profundos de marca, producto o automatización pueden tomar 4-10 semanas según el alcance.' }
  ]
};

const _capabilitiesVisualBound = new WeakSet();
let lastFocusedElement = null;

function renderCapabilities() {
  const list = document.getElementById('capabilities-list');
  const img = document.getElementById('cap-visual-img');
  if (!list) return;
  const data = servicesData[currentLang];
  if (img && data[0]) img.src = data[0].media;
  list.innerHTML = data.map((s, i) => `
    <div class="accordion-item reveal${i === 0 ? ' active' : ''}">
      <button class="accordion-header" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="cap-content-${i}" data-service-index="${i}">
        <span>
          <span class="accordion-kicker">${s.lead}</span>
          <span class="accordion-title">${s.title}</span>
        </span>
        <span class="accordion-icon"></span>
      </button>
      <div class="accordion-content" id="cap-content-${i}" role="region" style="${i === 0 ? 'max-height:500px' : ''}">
        <div class="accordion-content__inner">
          <div>
            <p class="accordion-text">${s.desc}</p>
            <p class="accordion-proof">${s.proof}</p>
            <div class="accordion-tags">${s.tags.map(t => `<span class="accordion-tag">${t}</span>`).join('')}</div>
          </div>
        </div>
      </div>
    </div>`).join('');

  initCapabilitiesVisualSwap(list);
  initAccordion('#capabilities-list');
  initAnimations();
}

function initCapabilitiesVisualSwap(list) {
  if (_capabilitiesVisualBound.has(list)) return;
  _capabilitiesVisualBound.add(list);
  list.addEventListener('click', (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;
    const idx = Number(header.dataset.serviceIndex);
    const service = servicesData[currentLang][idx];
    const img = document.getElementById('cap-visual-img');
    if (!img || !service) return;
    img.style.opacity = '0';
    img.style.transform = 'scale(0.96)';
    window.setTimeout(() => {
      img.src = service.media;
      img.alt = `${service.title} preview`;
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
    }, 160);
  });
}

function renderWork() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;
  const data = workData[currentLang];
  const allLabel = currentLang === 'es' ? 'Todos' : 'All';
  const viewText = currentLang === 'es' ? 'Ver sistema' : 'View system';
  const categories = [allLabel, ...new Set(data.map(item => item.category))];
  grid.innerHTML = `
    <div class="work__filters" aria-label="${currentLang === 'es' ? 'Filtrar proyectos' : 'Filter work'}">
      ${categories.map((category, i) => `<button class="work__filter${i === 0 ? ' active' : ''}" type="button" data-filter="${category}">${category}</button>`).join('')}
    </div>
    <div class="work__cards">
      ${data.map((p, i) => workCard(p, viewText, i)).join('')}
    </div>`;

  grid.querySelectorAll('.work__card').forEach(card => {
    const open = () => {
      const idx = Number(card.dataset.workIndex);
      const project = workData[currentLang][idx];
      if (project && project.case) openCaseModal(project);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  grid.querySelectorAll('.work__filter').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      grid.querySelectorAll('.work__filter').forEach(item => item.classList.toggle('active', item === button));
      grid.querySelectorAll('.work__card').forEach(card => {
        const match = filter === allLabel || card.dataset.category === filter;
        card.hidden = !match;
      });
    });
  });
}

function workCard(p, viewText, idx) {
  return `<article class="work__card reveal" data-work-index="${idx}" data-category="${p.category}" role="button" tabindex="0" aria-label="${viewText}: ${p.name}">
    <div class="work__card-media" style="background:${p.color}">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <span class="work__card-meta">${p.isRealClient ? 'Client work' : p.outcome}</span>
      <div class="work__card-overlay">
        <h3 class="work__card-name">${p.name}</h3>
        <p class="work__card-desc">${p.desc}</p>
        <div class="work__card-tags">${p.tags.map(t => `<span class="work__card-tag">${t}</span>`).join('')}</div>
      </div>
      <span class="work__card-cta">${viewText}</span>
    </div>
    <div class="work__card-info">
      <div>
        <h3 class="work__card-info-name">${p.name}</h3>
        <p class="work__card-info-desc">${p.desc}</p>
      </div>
      <span class="work__card-outcome">${p.category}</span>
    </div>
  </article>`;
}

function renderNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const data = newsData[currentLang];
  grid.innerHTML = data.map((n, i) => `
    <article class="news__card reveal" data-news-index="${i}" role="button" tabindex="0" aria-label="${n.title}">
      <div class="news__card-image">
        <img src="${newsImages[i]}" alt="${n.title}" loading="lazy">
      </div>
      <div class="news__card-body">
        <span class="news__card-category">${n.category}</span>
        <h3 class="news__card-title">${n.title}</h3>
        <div class="news__card-meta">
          <span>${n.date}</span>
          <span class="news__card-meta-dot"></span>
          <span>${n.read}</span>
        </div>
      </div>
    </article>`).join('');

  grid.querySelectorAll('.news__card').forEach(card => {
    const open = () => {
      const idx = Number(card.dataset.newsIndex);
      const article = newsData[currentLang][idx];
      if (article && article.content) openNewsModal(article, newsImages[idx]);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
}

function renderFAQ() {
  const list = document.getElementById('faq-list');
  if (!list) return;
  const data = faqData[currentLang];
  list.innerHTML = data.map((f, i) => `
    <div class="accordion-item reveal">
      <button class="accordion-header" aria-expanded="false" aria-controls="faq-content-${i}">
        <span class="accordion-title">${f.q}</span>
        <span class="accordion-icon"></span>
      </button>
      <div class="accordion-content" id="faq-content-${i}" role="region">
        <div class="accordion-content__inner">
          <p class="accordion-text">${f.a}</p>
        </div>
      </div>
    </div>`).join('');
  initAccordion('#faq-list');
  initAnimations();
}

function renderCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  const imgs = [
    'images/team/team-1.png', 'images/team/team-2.png', 'images/team/team-3.png',
    'images/team/team-4.png', 'images/team/team-5.png', 'images/team/team-6.png'
  ];
  const items = imgs.map(src => `<div class="about__carousel-item"><img src="${src}" alt="CREATIVE MK team" loading="lazy"></div>`).join('');
  track.innerHTML = items + items;

  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const carousel = track.parentElement;
  const move = (amount) => {
    track.classList.add('about__carousel-track--manual');
    carousel.scrollBy({ left: amount, behavior: 'smooth' });
  };
  if (prevBtn && nextBtn && carousel) {
    prevBtn.addEventListener('click', () => move(-400));
    nextBtn.addEventListener('click', () => move(400));
  }
}

function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const success = document.getElementById('newsletter-success');
  if (!form || !success) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    if (email) {
      form.hidden = true;
      success.hidden = false;
    }
  });
}

function syncHeroSoundButton() {
  const btn = document.getElementById('hero-play-btn');
  const video = document.getElementById('hero-video');
  if (!btn || !video) return;

  const btnLabel = btn.querySelector('span');
  const btnIcon = btn.querySelector('svg');
  const isSoundOn = !video.muted;
  const dict = translations[currentLang] || translations.en;

  btn.classList.toggle('hero__play-btn--active', isSoundOn);
  btn.setAttribute('aria-pressed', String(isSoundOn));
  btn.setAttribute('aria-label', isSoundOn ? dict['hero.soundMute'] : dict['hero.soundEnable']);

  if (btnLabel) btnLabel.textContent = isSoundOn ? dict['hero.soundMute'] : dict['hero.soundEnable'];
  if (btnIcon) {
    btnIcon.innerHTML = isSoundOn
      ? '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>'
      : '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
  }
}

function initPlayShowreel() {
  const btn = document.getElementById('hero-play-btn');
  const video = document.getElementById('hero-video');
  if (!btn || !video) return;

  const mobileQuery = window.matchMedia('(max-width: 640px)');
  const desktopSrc = video.dataset.srcDesktop;
  const mobileSrc = video.dataset.srcMobile;

  function getExpectedSrc() {
    return mobileQuery.matches ? mobileSrc : desktopSrc;
  }

  function playMuted() {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        video.muted = true;
        syncHeroSoundButton();
      });
    }
  }

  function setVideoSource() {
    const nextSrc = getExpectedSrc();
    if (!nextSrc || video.getAttribute('src') === nextSrc) return;
    const wasPlaying = !video.paused;
    const previousTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    const shouldRestoreSound = !video.muted;

    video.addEventListener('loadedmetadata', () => {
      if (previousTime > 0 && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(previousTime, Math.max(video.duration - 0.25, 0));
      }
      video.muted = !shouldRestoreSound;
      syncHeroSoundButton();
      if (wasPlaying || video.autoplay) playMuted();
    }, { once: true });

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('src', nextSrc);
    video.load();
  }

  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  setVideoSource();
  syncHeroSoundButton();
  playMuted();

  btn.addEventListener('click', () => {
    video.muted = !video.muted;
    if (!video.muted) playMuted();
    syncHeroSoundButton();
  });

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', setVideoSource);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(setVideoSource);
  }
}

function createModal() {
  if (document.getElementById('detail-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'detail-modal';
  modal.className = 'detail-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="detail-modal__backdrop"></div>
    <div class="detail-modal__container" role="document">
      <button class="detail-modal__close" type="button" aria-label="Close">&times;</button>
      <div class="detail-modal__content"></div>
    </div>`;
  document.body.appendChild(modal);
}

function openModal(html) {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;
  lastFocusedElement = document.activeElement;
  modal.querySelector('.detail-modal__content').innerHTML = html;
  const heading = modal.querySelector('.modal-case__title, .modal-news__title');
  if (heading) {
    heading.id = 'detail-modal-title';
    modal.setAttribute('aria-labelledby', heading.id);
  }
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const closeButton = modal.querySelector('.detail-modal__close');
  if (closeButton) {
    window.setTimeout(() => closeButton.focus(), 0);
    window.setTimeout(() => {
      if (!modal.contains(document.activeElement)) closeButton.focus();
    }, 120);
  }
}

function closeModal() {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  modal.removeAttribute('aria-labelledby');
  document.body.style.overflow = '';
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function openCaseModal(project) {
  const labels = currentLang === 'es'
    ? { challenge: 'El desafio', solution: 'Nuestra solucion', result: 'Resultado esperado', caseStudy: project.isRealClient ? 'Caso de estudio' : 'Showcase de capacidad', deliverables: 'Entregables' }
    : { challenge: 'The challenge', solution: 'Our approach', result: 'Expected outcome', caseStudy: project.isRealClient ? 'Case study' : 'Capability showcase', deliverables: 'Deliverables' };

  const html = `
    <div class="modal-case">
      <div class="modal-case__hero" style="background:${project.color}">
        <img src="${project.img}" alt="${project.name}">
      </div>
      <div class="modal-case__body">
        <span class="modal-case__label">${labels.caseStudy}</span>
        <h2 class="modal-case__title">${project.name}</h2>
        <p class="modal-case__desc">${project.desc}</p>
        <div class="modal-case__tags">${project.tags.map(t => `<span class="modal-case__tag">${t}</span>`).join('')}</div>
        <div class="modal-case__section">
          <h3>${labels.challenge}</h3>
          <p>${project.case.challenge}</p>
        </div>
        <div class="modal-case__section">
          <h3>${labels.solution}</h3>
          <p>${project.case.solution}</p>
        </div>
        <div class="modal-case__section">
          <h3>${labels.deliverables}</h3>
          <div class="modal-case__tags">${project.case.deliverables.map(t => `<span class="modal-case__tag">${t}</span>`).join('')}</div>
        </div>
        <div class="modal-case__section modal-case__section--result">
          <h3>${labels.result}</h3>
          <p>${project.case.result}</p>
        </div>
      </div>
    </div>`;
  openModal(html);
}

function openNewsModal(article, imgSrc) {
  const backLabel = currentLang === 'es' ? 'Volver a noticias' : 'Back to news';
  const paragraphs = article.content.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  const html = `
    <div class="modal-news">
      <div class="modal-news__hero">
        <img src="${imgSrc}" alt="${article.title}">
      </div>
      <div class="modal-news__body">
        <div class="modal-news__meta">
          <span class="modal-news__category">${article.category}</span>
          <span>${article.date}</span>
          <span class="news__card-meta-dot"></span>
          <span>${article.read}</span>
        </div>
        <h2 class="modal-news__title">${article.title}</h2>
        <div class="modal-news__content">${paragraphs}</div>
        <button class="modal-news__back" type="button">${backLabel}</button>
      </div>
    </div>`;
  openModal(html);
}

function initModal() {
  createModal();
  document.addEventListener('click', (e) => {
    if (e.target.closest('.detail-modal__close') || e.target.closest('.detail-modal__backdrop') || e.target.closest('.modal-news__back')) {
      closeModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initHeader();
  animateHeroTitle();
  renderCapabilities();
  renderWork();
  renderCarousel();
  renderNews();
  renderFAQ();
  initNewsletter();
  initPlayShowreel();
  initModal();
  initAnimations();
});
