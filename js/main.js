/* ============================================
   Main.js - Content Data & Initialization
   ============================================ */

const servicesData = {
  en: [
    {
      title: 'Strategy & Branding',
      lead: 'Identity system',
      desc: 'We define positioning, visual language, voice, offer architecture, and the core narrative that makes the brand easier to trust and choose.',
      proof: 'Best for launches, refreshes, and premium repositioning.',
      tags: ['Positioning', 'Identity', 'Voice'],
      media: 'images/services/branding.png'
    },
    {
      title: 'Websites',
      lead: 'Conversion site',
      desc: 'Editorial-grade websites with fast structure, clear UX, SEO foundations, persuasive proof, and a front door built for qualified inquiries.',
      proof: 'Best for service brands, expert firms, and local leaders scaling online.',
      tags: ['UX', 'SEO', 'Speed'],
      media: 'images/services/web-design.png'
    },
    {
      title: 'Landing Pages & Funnels',
      lead: 'Campaign engine',
      desc: 'Single-purpose pages and automated journeys that connect message, offer, lead capture, email, retargeting, and CRM logic.',
      proof: 'Best for paid traffic, launches, booking flows, and lead magnets.',
      tags: ['CRO', 'Lead Flow', 'CRM'],
      media: 'images/services/sales-funnels.png'
    },
    {
      title: 'Paid Growth',
      lead: 'Media system',
      desc: 'Meta campaigns shaped around creative testing, audience signals, measurement hygiene, and AI-assisted optimization that moves budget toward buyers.',
      proof: 'Best for brands that need disciplined acquisition, not random boosts.',
      tags: ['Meta Ads', 'Testing', 'ROAS'],
      media: 'images/services/meta-ads.png'
    },
    {
      title: 'Content Systems',
      lead: 'Visibility rhythm',
      desc: 'Repeatable content operations for short-form video, social media, captions, community touchpoints, and reporting that compounds over time.',
      proof: 'Best for brands that need consistency without losing quality.',
      tags: ['Short-form', 'Calendar', 'Reporting'],
      media: 'images/services/social-media.png'
    },
    {
      title: 'Product UX/UI',
      lead: 'Interface design',
      desc: 'Research-led product flows, prototypes, dashboards, and app interfaces that reduce friction and make complex actions feel obvious.',
      proof: 'Best for SaaS, portals, internal tools, and mobile product ideas.',
      tags: ['Flows', 'Prototype', 'Design System'],
      media: 'images/services/ux-ui-design-premium-preview.png'
    },
    {
      title: 'Development',
      lead: 'Build layer',
      desc: 'Front-end, app, and integration work that turns the strategy and interface into a dependable digital product or marketing system.',
      proof: 'Best when design, analytics, forms, APIs, and automation need to work together.',
      tags: ['Frontend', 'APIs', 'Integrations'],
      media: 'images/services/landing-pages.png'
    },
    {
      title: 'AI Automation',
      lead: 'Intelligent ops',
      desc: 'Chatbots, routing, content personalization, automations, and dashboards that remove manual work from sales and marketing operations.',
      proof: 'Best for teams that need faster response and cleaner follow-up.',
      tags: ['Chatbots', 'Workflows', 'Dashboards'],
      media: 'images/services/email-marketing.png'
    }
  ],
  es: [
    {
      title: 'Estrategia & Branding',
      lead: 'Sistema de identidad',
      desc: 'Definimos posicionamiento, lenguaje visual, voz, arquitectura de oferta y narrativa central para que la marca sea mas facil de confiar y elegir.',
      proof: 'Ideal para lanzamientos, renovaciones y reposicionamiento premium.',
      tags: ['Posicionamiento', 'Identidad', 'Voz'],
      media: 'images/services/branding.png'
    },
    {
      title: 'Sitios Web',
      lead: 'Sitio de conversion',
      desc: 'Sitios web editoriales con estructura rapida, UX clara, bases SEO, prueba persuasiva y una puerta de entrada para oportunidades calificadas.',
      proof: 'Ideal para marcas de servicio, firmas expertas y lideres locales que escalan online.',
      tags: ['UX', 'SEO', 'Velocidad'],
      media: 'images/services/web-design.png'
    },
    {
      title: 'Landing Pages & Embudos',
      lead: 'Motor de campana',
      desc: 'Paginas de accion unica y recorridos automatizados que conectan mensaje, oferta, captura, email, retargeting y CRM.',
      proof: 'Ideal para pauta, lanzamientos, agendamientos y lead magnets.',
      tags: ['CRO', 'Leads', 'CRM'],
      media: 'images/services/sales-funnels.png'
    },
    {
      title: 'Paid Growth',
      lead: 'Sistema de pauta',
      desc: 'Campanas Meta alrededor de pruebas creativas, senales de audiencia, medicion limpia y optimizacion asistida por IA.',
      proof: 'Ideal para marcas que necesitan adquisicion disciplinada, no boosts al azar.',
      tags: ['Meta Ads', 'Testing', 'ROAS'],
      media: 'images/services/meta-ads.png'
    },
    {
      title: 'Sistemas de Contenido',
      lead: 'Ritmo de visibilidad',
      desc: 'Operaciones repetibles para video corto, redes sociales, captions, comunidad y reportes que crecen con el tiempo.',
      proof: 'Ideal para marcas que necesitan consistencia sin perder calidad.',
      tags: ['Video corto', 'Calendario', 'Reportes'],
      media: 'images/services/social-media.png'
    },
    {
      title: 'Producto UX/UI',
      lead: 'Diseno de interfaz',
      desc: 'Flujos de producto, prototipos, dashboards e interfaces de app basados en investigacion para reducir friccion.',
      proof: 'Ideal para SaaS, portales, herramientas internas e ideas mobile.',
      tags: ['Flujos', 'Prototipo', 'Sistema UI'],
      media: 'images/services/ux-ui-design-premium-preview.png'
    },
    {
      title: 'Desarrollo',
      lead: 'Capa de build',
      desc: 'Frontend, apps e integraciones que convierten estrategia e interfaz en un producto digital o sistema de marketing confiable.',
      proof: 'Ideal cuando diseno, analitica, formularios, APIs y automatizacion deben trabajar juntos.',
      tags: ['Frontend', 'APIs', 'Integraciones'],
      media: 'images/services/landing-pages.png'
    },
    {
      title: 'Automatizacion IA',
      lead: 'Operaciones inteligentes',
      desc: 'Chatbots, routing, personalizacion de contenido, automatizaciones y dashboards para quitar trabajo manual de ventas y marketing.',
      proof: 'Ideal para equipos que necesitan respuesta rapida y seguimiento limpio.',
      tags: ['Chatbots', 'Workflows', 'Dashboards'],
      media: 'images/services/email-marketing.png'
    }
  ]
};

const workData = {
  en: [
    {
      name: 'Growth Stack Blueprint',
      category: 'Growth',
      desc: 'A connected funnel system for turning paid attention into qualified conversations.',
      tags: ['Funnels', 'Meta Ads', 'Automation'],
      color: '#18212f',
      img: 'images/portfolio-1.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'Many service businesses run ads, forms, email, and follow-up as disconnected pieces. That makes attribution messy and response time slow.',
        solution: 'We map the offer, build a conversion page, connect CRM routing, add email follow-up, and create reporting around the actions that matter.',
        result: 'A repeatable acquisition system designed to reduce manual follow-up and make every campaign easier to measure.',
        deliverables: ['Conversion landing page', 'Lead routing', 'Email follow-up', 'Campaign dashboard']
      }
    },
    {
      name: 'Premium Service Website',
      category: 'Web',
      desc: 'A polished editorial website system for trust, positioning, and booked inquiries.',
      tags: ['Websites', 'UX', 'SEO'],
      color: '#263c35',
      img: 'images/portfolio-2.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'Premium service brands often explain too much and prove too little, which makes visitors hesitate before taking action.',
        solution: 'We structure the site around a sharp promise, proof blocks, service pathways, and a contact flow that feels high-touch.',
        result: 'A digital front door designed to make expertise easier to understand and easier to buy.',
        deliverables: ['Messaging architecture', 'Website UX', 'Service pages', 'Contact path']
      }
    },
    {
      name: 'Brand Identity System',
      category: 'Brand',
      desc: 'A flexible identity framework for launches, social channels, ads, and future campaigns.',
      tags: ['Branding', 'Logo', 'Guidelines'],
      color: '#4f342f',
      img: 'images/portfolio-5.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'A brand can look decent in one place and still fall apart across ads, social, website, decks, and vendor handoffs.',
        solution: 'We create a practical system: mark, palette, type, visual rules, tone, and examples for the channels the business actually uses.',
        result: 'A brand manual that makes every touchpoint feel consistent without slowing the team down.',
        deliverables: ['Logo direction', 'Palette', 'Typography', 'Brand manual']
      }
    },
    {
      name: 'Product UX Sprint',
      category: 'Product',
      desc: 'A focused interface sprint for dashboards, portals, onboarding, and app workflows.',
      tags: ['UX/UI', 'Prototype', 'Design System'],
      color: '#14283a',
      img: 'images/portfolio-6.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'Product ideas often grow as feature lists before the core user journey is clear.',
        solution: 'We define priority workflows, prototype the experience, design reusable UI patterns, and identify what should be built first.',
        result: 'A product direction that helps founders and teams build with less waste and more confidence.',
        deliverables: ['Journey map', 'Clickable prototype', 'UI components', 'Build roadmap']
      }
    },
    {
      name: 'Content Operating Rhythm',
      category: 'Content',
      desc: 'A social content system for visibility, consistency, and useful reporting.',
      tags: ['Social Media', 'Short-form', 'Reporting'],
      color: '#604024',
      img: 'images/portfolio-4.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'Teams post inconsistently because ideas, approvals, formats, and reporting live in different places.',
        solution: 'We define pillars, reusable formats, posting cadence, creative briefs, and reporting views so content becomes operational.',
        result: 'A content rhythm built for steady visibility instead of last-minute posting.',
        deliverables: ['Content pillars', 'Short-form briefs', 'Posting cadence', 'Monthly report']
      }
    },
    {
      name: 'AI Response Layer',
      category: 'AI',
      desc: 'An intelligent intake and follow-up layer for service requests and support questions.',
      tags: ['AI Automation', 'Forms', 'Routing'],
      color: '#20263a',
      img: 'images/portfolio-3.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'When inquiries arrive from many channels, response quality depends too much on who is available that day.',
        solution: 'We structure intake questions, qualify leads, route requests, draft follow-up, and surface the right next step.',
        result: 'A faster first response and cleaner handoff from marketing to sales or operations.',
        deliverables: ['Smart intake', 'Routing logic', 'Follow-up templates', 'Ops dashboard']
      }
    }
  ],
  es: [
    {
      name: 'Blueprint de Growth Stack',
      category: 'Growth',
      desc: 'Un sistema de embudo conectado para convertir atencion pagada en conversaciones calificadas.',
      tags: ['Embudos', 'Meta Ads', 'Automatizacion'],
      color: '#18212f',
      img: 'images/portfolio-1.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'Muchos negocios de servicio tienen ads, formularios, email y seguimiento como piezas separadas. Eso ensucia la medicion y retrasa la respuesta.',
        solution: 'Mapeamos la oferta, construimos pagina de conversion, conectamos routing CRM, agregamos email follow-up y reportes.',
        result: 'Un sistema de adquisicion repetible disenado para reducir seguimiento manual y medir mejor cada campana.',
        deliverables: ['Landing de conversion', 'Routing de leads', 'Email follow-up', 'Dashboard']
      }
    },
    {
      name: 'Sitio Premium de Servicio',
      category: 'Web',
      desc: 'Un sistema web editorial para confianza, posicionamiento y oportunidades calificadas.',
      tags: ['Sitios Web', 'UX', 'SEO'],
      color: '#263c35',
      img: 'images/portfolio-2.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'Las marcas premium de servicio suelen explicar demasiado y probar muy poco, lo que hace que el visitante dude.',
        solution: 'Estructuramos el sitio alrededor de una promesa clara, bloques de prueba, rutas de servicio y contacto high-touch.',
        result: 'Una puerta digital disenada para hacer la experiencia mas facil de entender y comprar.',
        deliverables: ['Arquitectura de mensaje', 'UX web', 'Paginas de servicio', 'Ruta de contacto']
      }
    },
    {
      name: 'Sistema de Identidad',
      category: 'Brand',
      desc: 'Un marco de identidad flexible para lanzamientos, redes, anuncios y futuras campanas.',
      tags: ['Branding', 'Logo', 'Lineamientos'],
      color: '#4f342f',
      img: 'images/portfolio-5.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'Una marca puede verse bien en un lugar y romperse en ads, redes, sitio web, decks y proveedores.',
        solution: 'Creamos un sistema practico: marca, paleta, tipografia, reglas visuales, tono y ejemplos para canales reales.',
        result: 'Un manual de marca que ayuda a que cada punto de contacto sea consistente sin frenar al equipo.',
        deliverables: ['Direccion de logo', 'Paleta', 'Tipografia', 'Manual de marca']
      }
    },
    {
      name: 'Sprint de Producto UX',
      category: 'Product',
      desc: 'Un sprint de interfaz para dashboards, portales, onboarding y flujos de app.',
      tags: ['UX/UI', 'Prototipo', 'Sistema UI'],
      color: '#14283a',
      img: 'images/portfolio-6.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'Las ideas de producto suelen crecer como listas de funciones antes de aclarar el viaje principal del usuario.',
        solution: 'Definimos flujos prioritarios, prototipamos, disenamos patrones reutilizables e identificamos que construir primero.',
        result: 'Una direccion de producto que ayuda a construir con menos desperdicio y mas confianza.',
        deliverables: ['Mapa de journey', 'Prototipo clickable', 'Componentes UI', 'Roadmap']
      }
    },
    {
      name: 'Ritmo Operativo de Contenido',
      category: 'Content',
      desc: 'Un sistema de contenido social para visibilidad, consistencia y reportes utiles.',
      tags: ['Redes', 'Video corto', 'Reportes'],
      color: '#604024',
      img: 'images/portfolio-4.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'Los equipos publican de forma irregular porque ideas, aprobaciones, formatos y reportes viven en lugares distintos.',
        solution: 'Definimos pilares, formatos reutilizables, cadencia, briefs creativos y vistas de reporte.',
        result: 'Un ritmo de contenido construido para visibilidad constante, no publicaciones de ultimo minuto.',
        deliverables: ['Pilares de contenido', 'Briefs short-form', 'Cadencia', 'Reporte mensual']
      }
    },
    {
      name: 'Capa de Respuesta IA',
      category: 'AI',
      desc: 'Una capa inteligente de intake y seguimiento para solicitudes de servicio y soporte.',
      tags: ['IA', 'Formularios', 'Routing'],
      color: '#20263a',
      img: 'images/portfolio-3.png',
      outcome: 'Showcase',
      isRealClient: false,
      case: {
        challenge: 'Cuando las consultas llegan por muchos canales, la calidad de respuesta depende demasiado de quien este disponible.',
        solution: 'Estructuramos intake, calificamos leads, ruteamos solicitudes, redactamos follow-up y mostramos el siguiente paso.',
        result: 'Primera respuesta mas rapida y handoff mas limpio entre marketing, ventas y operaciones.',
        deliverables: ['Intake inteligente', 'Logica de routing', 'Templates follow-up', 'Dashboard ops']
      }
    }
  ]
};

const newsImages = ['images/news/news-1.png', 'images/news/news-2.png', 'images/news/news-3.png'];

const newsData = {
  en: [
    {
      category: 'AI',
      title: 'How AI is reshaping service-business growth systems',
      date: 'May 2026',
      read: '5 min read',
      content: 'AI is most useful when it is connected to a real workflow. For service businesses, that means faster qualification, cleaner handoff, better follow-up, and more useful reporting.\n\nThe highest-leverage use cases are lead intake, response routing, content personalization, support triage, and campaign reporting.\n\nThe creative work still matters. AI simply removes the drag around repetitive operational tasks so the brand can respond with more speed and consistency.'
    },
    {
      category: 'Design',
      title: 'What makes a premium service website feel trustworthy',
      date: 'Apr 2026',
      read: '4 min read',
      content: 'Premium websites do not win by adding more decoration. They win by creating clarity: a strong promise, proof, pacing, fast loading, and a contact path that respects the buyer.\n\nThe best service sites feel editorial and operational at the same time. They are beautiful, but every section has a job.\n\nThat is the standard we use when designing websites, landing pages, and brand systems for growth-focused businesses.'
    },
    {
      category: 'Growth',
      title: 'Why funnels fail when the brand system is weak',
      date: 'Mar 2026',
      read: '6 min read',
      content: 'A funnel cannot fix a weak promise. Paid media, landing pages, and automation work best when the audience immediately understands who the brand helps, what changes, and why it should be trusted.\n\nThe real growth stack connects positioning, creative, landing experience, follow-up, and measurement.\n\nWhen those pieces are designed together, campaigns become easier to test and easier to improve.'
    }
  ],
  es: [
    {
      category: 'IA',
      title: 'Como la IA esta cambiando los sistemas de crecimiento',
      date: 'Mayo 2026',
      read: '5 min lectura',
      content: 'La IA funciona mejor cuando esta conectada a un flujo real. Para negocios de servicio, eso significa mejor calificacion, handoff mas limpio, follow-up mas rapido y reportes mas utiles.\n\nLos casos de mayor impacto son intake de leads, routing de respuesta, personalizacion de contenido, soporte y reportes de campana.\n\nLa creatividad sigue importando. La IA simplemente quita friccion operativa repetitiva.'
    },
    {
      category: 'Diseno',
      title: 'Que hace que un sitio premium genere confianza',
      date: 'Abr 2026',
      read: '4 min lectura',
      content: 'Los sitios premium no ganan por agregar mas decoracion. Ganan por crear claridad: promesa fuerte, prueba, ritmo, carga rapida y una ruta de contacto respetuosa.\n\nLos mejores sitios de servicio se sienten editoriales y operativos al mismo tiempo. Son bellos, pero cada seccion tiene un trabajo.\n\nEse es el estandar que usamos al disenar sitios, landing pages y sistemas de marca.'
    },
    {
      category: 'Growth',
      title: 'Por que los embudos fallan cuando la marca es debil',
      date: 'Mar 2026',
      read: '6 min lectura',
      content: 'Un embudo no puede reparar una promesa debil. La pauta, las landing pages y la automatizacion funcionan mejor cuando la audiencia entiende rapido a quien ayuda la marca, que cambia y por que confiar.\n\nEl growth stack real conecta posicionamiento, creatividad, experiencia de landing, follow-up y medicion.\n\nCuando esas piezas se disenan juntas, las campanas son mas faciles de probar y mejorar.'
    }
  ]
};

const faqData = {
  en: [
    { q: 'What services does CREATIVE MK offer?', a: 'We build connected digital systems across branding, websites, landing pages, funnels, paid growth, content systems, product UX/UI, development, and AI automation.' },
    { q: 'Can you redesign an existing website or brand?', a: 'Yes. We can audit the current experience, preserve what works, rebuild weak sections, and turn the brand into a clearer system across web, ads, content, and sales touchpoints.' },
    { q: 'Do you work with international clients?', a: 'Yes. CREATIVE MK is digital-first, bilingual, and built to collaborate across markets and time zones.' },
    { q: 'How do you integrate AI automation?', a: 'We connect AI to practical workflows: lead intake, routing, first-response support, content personalization, reporting, and follow-up sequences.' },
    { q: 'How long does a typical project take?', a: 'A focused landing page can take 1-2 weeks, a full website 4-8 weeks, and deeper brand or product systems 4-10 weeks depending on scope.' }
  ],
  es: [
    { q: 'Que servicios ofrece CREATIVE MK?', a: 'Construimos sistemas digitales conectados: branding, sitios web, landing pages, embudos, paid growth, contenido, UX/UI, desarrollo y automatizacion IA.' },
    { q: 'Pueden redisenar un sitio o marca existente?', a: 'Si. Podemos auditar la experiencia actual, conservar lo que funciona, reconstruir secciones debiles y convertir la marca en un sistema mas claro.' },
    { q: 'Trabajan con clientes internacionales?', a: 'Si. CREATIVE MK es digital-first, bilingue y esta preparado para colaborar entre mercados y zonas horarias.' },
    { q: 'Como integran automatizacion con IA?', a: 'Conectamos IA a flujos practicos: intake de leads, routing, primera respuesta, personalizacion de contenido, reportes y secuencias de follow-up.' },
    { q: 'Cuanto tiempo toma un proyecto?', a: 'Una landing enfocada puede tomar 1-2 semanas, un sitio completo 4-8 semanas y sistemas de marca o producto 4-10 semanas segun alcance.' }
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
