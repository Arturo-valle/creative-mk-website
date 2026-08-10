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
      media: 'images/services/branding.jpg'
    },
    {
      title: 'Websites',
      lead: 'Marketing site',
      desc: 'We design and build editorial, conversion-aware websites with clear messaging, UX structure, service pathways, proof blocks, SEO foundations, and a contact flow that respects the buyer.',
      proof: 'Best for service brands, expert firms, local leaders, and companies whose current site does not explain the offer fast enough.',
      tags: ['UX', 'Copy', 'SEO'],
      media: 'images/services/web-design.jpg'
    },
    {
      title: 'Digital Product UX/UI',
      lead: 'Product experience',
      desc: 'We map product journeys, dashboards, portals, onboarding flows, and app interfaces so complex actions feel clear before a team commits to a build.',
      proof: 'Best for SaaS ideas, internal tools, client portals, MVPs, and businesses with a workflow that needs a better interface.',
      tags: ['Flows', 'Prototype', 'Design System'],
      media: 'images/services/ux-ui-design-premium-preview.jpg'
    },
    {
      title: 'Growth & Marketing',
      lead: 'Campaign system',
      desc: 'We shape landing pages, funnels, Meta campaigns, content rhythms, tracking, and follow-up paths so attention has somewhere useful to go.',
      proof: 'Best when the offer is clear enough to test traffic, capture demand, and learn from real audience signals.',
      tags: ['Offer', 'Traffic', 'Follow-up'],
      media: 'images/services/sales-funnels.jpg'
    },
    {
      title: 'AI Automation',
      lead: 'Workflow intelligence',
      desc: 'We connect intake, service matching, first-response support, knowledge bases, dashboards, and follow-up rules so teams respond faster without losing human control.',
      proof: 'Best for businesses with repeated questions, slow lead handoff, manual reporting, or operations that need a cleaner first layer.',
      tags: ['Intake', 'Routing', 'Dashboards'],
      media: 'images/services/email-marketing.jpg'
    },
    {
      title: 'Development',
      lead: 'Reliable build',
      desc: 'We turn approved strategy and UX into responsive pages, front-end systems, forms, analytics, integrations, and lightweight app experiences that are ready to use.',
      proof: 'Best when the brand, website, product screen, form, CRM, and automation need to work together instead of living as separate pieces.',
      tags: ['Frontend', 'Forms', 'Integrations'],
      media: 'images/services/landing-pages.jpg'
    }
  ],
  es: [
    {
      title: 'Branding',
      lead: 'Identidad y posicionamiento',
      desc: 'Definimos promesa, voz, identidad visual, arquitectura de oferta y reglas de marca para que el negocio se sienta consistente en sitio web, anuncios, contenido, ventas y futuras campañas.',
      proof: 'Ideal para marcas nuevas, reposicionamientos premium, negocios de servicio y equipos que necesitan confianza antes de escalar la atención.',
      tags: ['Estrategia', 'Identidad', 'Guías'],
      media: 'images/services/branding.jpg'
    },
    {
      title: 'Sitios Web',
      lead: 'Sitio de marketing',
      desc: 'Diseñamos y construimos sitios editoriales orientados a conversión, con mensaje claro, estructura UX, rutas de servicio, bloques de prueba, bases SEO y un contacto respetuoso para el comprador.',
      proof: 'Ideal para marcas de servicio, firmas expertas, líderes locales y empresas cuyo sitio actual no explica la oferta con suficiente rapidez.',
      tags: ['UX', 'Copy', 'SEO'],
      media: 'images/services/web-design.jpg'
    },
    {
      title: 'Producto Digital UX/UI',
      lead: 'Experiencia de producto',
      desc: 'Mapeamos journeys, dashboards, portales, onboarding e interfaces de app para que acciones complejas se entiendan antes de comprometer al equipo con el desarrollo.',
      proof: 'Ideal para ideas SaaS, herramientas internas, portales de cliente, MVPs y negocios con procesos que necesitan una mejor interfaz.',
      tags: ['Flujos', 'Prototipo', 'Sistema UI'],
      media: 'images/services/ux-ui-design-premium-preview.jpg'
    },
    {
      title: 'Growth & Marketing',
      lead: 'Sistema de campaña',
      desc: 'Damos forma a landing pages, embudos, campañas Meta, ritmos de contenido, medición y rutas de seguimiento para que la atención tenga un siguiente paso útil.',
      proof: 'Ideal cuando la oferta ya está lo suficientemente clara para probar tráfico, capturar demanda y aprender de señales reales de audiencia.',
      tags: ['Oferta', 'Tráfico', 'Seguimiento'],
      media: 'images/services/sales-funnels.jpg'
    },
    {
      title: 'Automatización IA',
      lead: 'Inteligencia operativa',
      desc: 'Conectamos recepción de leads, recomendación de servicios, primera respuesta, bases de conocimiento, dashboards y reglas de seguimiento para responder más rápido sin perder control humano.',
      proof: 'Ideal para negocios con preguntas repetidas, traspaso lento de leads, reportes manuales u operaciones que necesitan una primera capa más clara.',
      tags: ['Recepción', 'Rutas', 'Dashboards'],
      media: 'images/services/email-marketing.jpg'
    },
    {
      title: 'Desarrollo',
      lead: 'Construcción confiable',
      desc: 'Convertimos estrategia y UX aprobadas en páginas responsivas, sistemas front-end, formularios, analítica, integraciones y experiencias ligeras de app listas para usar.',
      proof: 'Ideal cuando marca, sitio, pantalla de producto, formulario, CRM y automatización deben trabajar juntos en lugar de vivir como piezas separadas.',
      tags: ['Frontend', 'Formularios', 'Integraciones'],
      media: 'images/services/landing-pages.jpg'
    }
  ]
};

/**
 * Real client work. Nothing else.
 *
 * This held six fabricated entries — every one carrying `isRealClient: false`
 * and rendering with the label "Capability showcase". They were removed on
 * 2026-08-10: an award jury reads that label the same way a buyer does, and a
 * studio portfolio with no client in it is the one thing no amount of craft
 * around it can compensate for. See docs/direction.md §6.
 *
 * The shape below is what renderWork() and openCaseModal() consume, and it is
 * unchanged, so a real project drops straight in:
 *
 *   {
 *     name: 'Client name',
 *     category: 'Web',            // also the filter label
 *     desc: 'One line, what it is.',
 *     tags: ['Brand', 'Web'],
 *     color: '#191712',           // card field behind the image
 *     img: 'images/work/slug.jpg',// -480/-960 .avif/.webp beside it
 *     outcome: 'The number',      // shown on the card when isRealClient
 *     isRealClient: true,
 *     case: { challenge, solution, result, deliverables: [] }
 *   }
 *
 * Both language arrays must stay the same length: renderWork() indexes into
 * workData[currentLang] by position when a card is opened.
 */
const workData = {
  en: [],
  es: []
};

/**
 * Signed work that cannot be published yet. Only the count, because that is the
 * only part that is honest to state without the client's name on it. When one
 * of them clears, it moves into workData and this drops by one.
 */
const workPendingCount = 2;

const newsImages = ['images/news/news-1.jpg', 'images/news/news-2.jpg', 'images/news/news-3.jpg'];

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
    { q: 'Are the projects shown real client case studies?', a: 'Yes — that is the only thing the work section accepts. Two signed projects are waiting on their client to approve a name and a figure, and until then they are counted but not shown. Nothing invented stands in for them.' },
    { q: 'Can you redesign an existing website or brand?', a: 'Yes. We can audit the current experience, preserve what is working, rebuild weak sections, and turn the brand, site, and follow-up path into a clearer system.' },
    { q: 'How do you approach AI automation?', a: 'We begin with a workflow, not a tool. Useful starting points include lead intake, service matching, first response, knowledge bases, dashboards, and follow-up prompts with a clear human handoff.' },
    { q: 'How long does a typical project take?', a: 'A focused landing page or audit can take 1-2 weeks, a full website often takes 4-8 weeks, and deeper brand, product, or automation systems usually take 4-10 weeks depending on scope.' }
  ],
  es: [
    { q: '¿Qué servicios ofrece CREATIVE MK?', a: 'Trabajamos branding, sitios web, producto digital UX/UI, sistemas de growth y marketing, desarrollo y automatización práctica con IA. El objetivo es conectar las piezas que hacen que un negocio se entienda, genere confianza y reciba mejores contactos.' },
    { q: '¿Los proyectos mostrados son casos reales de clientes?', a: 'Sí, es lo único que admite la sección de trabajo. Hay dos proyectos firmados esperando a que el cliente apruebe nombre y cifra; hasta entonces se cuentan pero no se enseñan. No hay nada inventado ocupando su lugar.' },
    { q: '¿Pueden rediseñar un sitio o marca existente?', a: 'Sí. Podemos auditar la experiencia actual, conservar lo que funciona, reconstruir secciones débiles y convertir marca, sitio y seguimiento en un sistema más claro.' },
    { q: '¿Cómo integran automatización con IA?', a: 'Empezamos con un flujo, no con una herramienta. Los mejores puntos de inicio suelen ser recepción de leads, recomendación de servicio, primera respuesta, bases de conocimiento, dashboards y prompts de seguimiento con entrega clara a una persona.' },
    { q: '¿Cuánto tiempo toma un proyecto?', a: 'Una landing o auditoría enfocada puede tomar 1-2 semanas, un sitio completo suele tomar 4-8 semanas y sistemas más profundos de marca, producto o automatización pueden tomar 4-10 semanas según el alcance.' }
  ]
};

const _capabilitiesVisualBound = new WeakSet();
let lastFocusedElement = null;

function renderCapabilities() {
  const list = document.getElementById('capabilities-list');
  if (!list) return;
  const data = servicesData[currentLang];
  /* Layer-aware initial write: after swaps the visible <picture> may be either
     layer, and a language switch resets the accordion to row 0 — the image
     and the wipe state have to follow. */
  const visual = document.getElementById('capabilities-visual');
  if (visual && data[0]) {
    const layers = visual.querySelectorAll('.cap-layer');
    const front = layers[Number(visual.dataset.front || 0)] || layers[0];
    if (front) setCapLayerSources(front, data[0], data[0].title);
    visual.dataset.current = '0';
  }
  list.innerHTML = data.map((s, i) => `
    <div class="accordion-item reveal${i === 0 ? ' active' : ''}">
      <button class="accordion-header" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="cap-content-${i}" data-service-index="${i}">
        <span class="accordion-index" aria-hidden="true">0${i + 1}</span>
        <span>
          <span class="accordion-kicker">${s.lead}</span>
          <span class="accordion-title">${s.title}</span>
        </span>
        <span class="accordion-icon"></span>
      </button>
      <div class="accordion-content" id="cap-content-${i}" role="region">
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

/**
 * Directional wipe between service images (immersive-plan §6).
 *
 * Two stacked <picture> layers inside #capabilities-visual. Selecting a row
 * below the current one wipes the incoming image in from the bottom; a row
 * above wipes from the top — the visual travels the way the index does. The
 * incoming image is written to the hidden layer, decoded (capped at 300ms so
 * a slow network degrades to an instant swap, never a blank wipe), then
 * clip-path reveals it and the layers trade roles.
 *
 * On hover-capable devices the target image is preloaded on pointerenter —
 * fetching on explicit intent, at most one image per hover.
 *
 * Without GSAP the wipe falls back to writing the visible layer directly:
 * exactly the old behaviour, minus the crossfade.
 */
function setCapLayerSources(layer, service, title) {
  const base = service.media.replace(/\.(jpg|png)$/i, '');
  const avif = layer.querySelector('source[type="image/avif"]');
  const webp = layer.querySelector('source[type="image/webp"]');
  const img = layer.querySelector('img');
  if (avif) avif.srcset = `${base}-480.avif 480w, ${base}-960.avif 960w`;
  if (webp) webp.srcset = `${base}-480.webp 480w, ${base}-960.webp 960w`;
  img.src = service.media;
  img.alt = `${title} preview`;
  return img;
}

function initCapabilitiesVisualSwap(list) {
  if (_capabilitiesVisualBound.has(list)) return;
  _capabilitiesVisualBound.add(list);

  const visual = document.getElementById('capabilities-visual');
  const layers = visual ? visual.querySelectorAll('.cap-layer') : [];
  /* State lives on the DOM, not in this closure: renderCapabilities re-runs on
     every EN/ES swap and needs to reset it (see its layer-aware write). */
  const getFront = () => Number(visual.dataset.front || 0);
  const getCurrent = () => Number(visual.dataset.current || 0);
  let animating = false;

  const decodeCapped = (img) =>
    Promise.race([
      img.decode ? img.decode().catch(() => {}) : Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 300))
    ]);

  // Preload on intent, hover devices only.
  if (window.matchMedia('(hover: hover)').matches) {
    list.addEventListener('pointerenter', (e) => {
      const header = e.target.closest && e.target.closest('.accordion-header');
      if (!header) return;
      const service = servicesData[currentLang][Number(header.dataset.serviceIndex)];
      if (!service) return;
      const probe = new Image();
      probe.src = service.media;
    }, true);
  }

  list.addEventListener('click', async (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;
    const idx = Number(header.dataset.serviceIndex);
    const service = servicesData[currentLang][idx];
    if (!service || layers.length < 2 || idx === getCurrent()) return;

    const front = layers[getFront()];
    const back = layers[1 - getFront()];
    const fromBelow = idx > getCurrent();
    visual.dataset.current = String(idx);

    if (typeof gsap === 'undefined' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCapLayerSources(front, service, service.title);
      return;
    }
    if (animating) gsap.killTweensOf(back);
    animating = true;

    const img = setCapLayerSources(back, service, service.title);
    await decodeCapped(img);

    back.style.zIndex = 2;
    front.style.zIndex = 1;
    gsap.fromTo(back,
      { clipPath: fromBelow ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)' },
      {
        clipPath: 'inset(0% 0 0% 0)',
        duration: 0.6,
        ease: 'power3.inOut',
        onComplete: () => {
          visual.dataset.front = String(1 - getFront());
          animating = false;
        }
      });
    gsap.fromTo(back.querySelector('img'),
      { scale: 1.06 }, { scale: 1, duration: 0.7, ease: 'power2.out' });
  });
}

/**
 * The ledger of what the studio cannot yet prove.
 *
 * This is deliberately not a placeholder. A portfolio section with two projects
 * in it looks thin; a portfolio section with two projects and an explicit
 * account of what is missing reads as a studio with a rule. It shrinks on its
 * own as workData fills up — the published figure is derived, never typed — so
 * it never needs removing.
 */
function workLedger() {
  /* js/i18n.js declares `translations` and `currentLang` at the top level of a
     classic script and loads before this file, so both are in scope. Generated
     markup cannot use data-i18n here: setLanguage() runs before renderWork() on
     first paint, so the attributes would never be filled. */
  const t = (key) => (translations[currentLang] || {})[key] || '';
  const rows = [
    [t('work.ledgerPublished'), String(workData[currentLang].length), ''],
    [t('work.ledgerPending'), String(workPendingCount), t('work.ledgerPendingNote')],
    [t('work.ledgerAwards'), '0', t('work.ledgerAwardsNote')],
    [t('work.ledgerTeam'), '1', t('work.ledgerTeamValue')]
  ];
  return `
    <section class="work__ledger reveal" aria-labelledby="work-ledger-title">
      <h3 class="work__ledger-title" id="work-ledger-title">${t('work.ledgerTitle')}</h3>
      <p class="work__ledger-lead">${t('work.ledgerLead')}</p>
      <dl class="work__ledger-list">
        ${rows.map(([label, value, note]) => `
          <div class="work__ledger-row">
            <dt class="work__ledger-label">${label}</dt>
            <dd class="work__ledger-value">${value}</dd>
            ${note ? `<dd class="work__ledger-note">${note}</dd>` : ''}
          </div>`).join('')}
      </dl>
      <p class="work__ledger-close">${t('work.ledgerClose')}</p>
    </section>`;
}

function renderWork() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;
  const data = workData[currentLang];
  const allLabel = currentLang === 'es' ? 'Todos' : 'All';
  const viewText = currentLang === 'es' ? 'Ver sistema' : 'View system';
  const categories = [allLabel, ...new Set(data.map(item => item.category))];

  /* Filters need something to filter. With two cases they are furniture, and
     with none they are a row of buttons over an empty box. */
  const filters = categories.length > 2 ? `
    <div class="work__filters" aria-label="${currentLang === 'es' ? 'Filtrar proyectos' : 'Filter work'}">
      ${categories.map((category, i) => `<button class="work__filter${i === 0 ? ' active' : ''}" type="button" data-filter="${category}">${category}</button>`).join('')}
    </div>` : '';

  const cards = data.length ? `
    <div class="work__cards">
      ${data.map((p, i) => workCard(p, viewText, i)).join('')}
    </div>` : '';

  grid.innerHTML = filters + cards + workLedger();

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

  /* Everything this function writes starts hidden behind `.js-reveal`, so it
     has to be handed to the observer. It happened to work before only because
     setLanguage() calls renderFAQ() after renderWork() and renderFAQ() ends
     with this call — reorder those two and the whole section would go invisible
     on the first EN/ES switch. Claiming it here removes that coupling; the call
     is idempotent, since there is one observer and it only picks up elements
     that are not revealed yet. */
  initAnimations();
}

/**
 * Build a <picture> for one of the derivatives produced by
 * scripts/convert-images.mjs.
 *
 * `fallback` is the path stored in the content data and is also the <img> src,
 * so it carries the right extension for that asset (.jpg, or .png where the
 * artwork actually uses transparency). The AVIF and WebP candidates are derived
 * from it; the pipeline emits 480 and 960 for every source, because none of the
 * source art is wider than 1024px.
 *
 * width/height are declared so the browser reserves the box before the image
 * decodes. Every source in this project is 1024x1024, so the ratio is 1:1 for
 * all of them. CSS still controls the rendered size; these only supply the
 * intrinsic aspect ratio, which is what stops the layout shifting.
 */
function pictureMarkup(fallback, alt, sizes, { lazy = true } = {}) {
  const base = fallback.replace(/\.(jpg|png)$/i, '');
  const srcset = (ext) => `${base}-480.${ext} 480w, ${base}-960.${ext} 960w`;
  const loading = lazy ? ' loading="lazy"' : '';
  return `<picture>
      <source type="image/avif" srcset="${srcset('avif')}" sizes="${sizes}">
      <source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}">
      <img src="${fallback}" alt="${alt}"${loading} decoding="async" width="960" height="960">
    </picture>`;
}

function workCard(p, viewText, idx) {
  return `<article class="work__card reveal" data-work-index="${idx}" data-category="${p.category}" role="button" tabindex="0" aria-label="${viewText}: ${p.name}">
    <div class="work__card-media" style="background:${p.color}">
      ${pictureMarkup(p.img, p.name, '(max-width: 768px) 100vw, 33vw')}
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
        ${pictureMarkup(newsImages[i], n.title, '(max-width: 768px) 100vw, 33vw')}
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
    'images/team/team-1.jpg', 'images/team/team-2.jpg', 'images/team/team-3.jpg',
    'images/team/team-4.jpg', 'images/team/team-5.jpg', 'images/team/team-6.jpg'
  ];
  const items = imgs.map(src => `<div class="about__carousel-item">${pictureMarkup(src, 'CREATIVE MK team', '(max-width: 768px) 60vw, 280px')}</div>`).join('');
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
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
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

  // The markup ships without a `src` so nothing downloads before this runs and
  // the browser picks exactly one file per breakpoint. Under reduced motion we
  // never fetch on our own: `force` is the user asking for it via the button,
  // and an existing `src` means they already opted in and only the breakpoint
  // changed.
  function setVideoSource({ force = false } = {}) {
    if (motionQuery.matches && !force && !video.getAttribute('src')) return;

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
  syncHeroSoundButton();

  // The showreel sits below the fold, so nothing is fetched until it is on
  // screen. That keeps several megabytes of video off the critical path of the
  // first screen. setVideoSource() still refuses to fetch under reduced motion.
  function activate() {
    setVideoSource();
    if (!motionQuery.matches) playMuted();
  }

  const section = document.getElementById('showreel');
  if (section && typeof IntersectionObserver === 'function') {
    new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activate();
        else if (!video.paused) video.pause();
      }
    }, { threshold: 0.01 }).observe(section);
  } else {
    activate();
  }

  btn.addEventListener('click', () => {
    // Unmute first: setVideoSource reads the current muted state to decide what
    // to restore once metadata lands.
    video.muted = !video.muted;
    if (!video.getAttribute('src')) setVideoSource({ force: true });
    else if (!video.muted) playMuted();
    syncHeroSoundButton();
  });

  const onBreakpointChange = () => setVideoSource();
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', onBreakpointChange);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(onBreakpointChange);
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
        ${pictureMarkup(project.img, project.name, '(max-width: 900px) 100vw, 860px', { lazy: false })}
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
        ${pictureMarkup(imgSrc, article.title, '(max-width: 900px) 100vw, 860px', { lazy: false })}
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

/**
 * Ambient WebGL background for the hero.
 *
 * Everything expensive lives in js/hero-3d.js and is reached through a dynamic
 * import, so none of it is in the initial payload. The import is only issued
 * for visitors who can benefit: no reduced-motion preference, WebGL2 available,
 * and a viewport wide enough that the surface is not competing with the copy.
 * When any gate fails the hero keeps its flat background and nothing is
 * fetched at all.
 *
 * The path is absolute on purpose: main.js is a classic script, so a relative
 * specifier would resolve against the document URL, not this file.
 */
/**
 * WebGL2 that is actually worth using.
 *
 * A context alone is not enough: Chrome hands back a working WebGL2 context
 * backed by SwiftShader when GPU acceleration is unavailable or blocklisted,
 * and rasterising this scene on the CPU costs seconds of main-thread time.
 * CI measured 22s of blocking time on index.html against 98ms on the contact
 * page in the same run, which is exactly that path.
 *
 * WEBGL_debug_renderer_info is unavailable in some privacy configurations. When
 * we cannot tell, we assume hardware: the visitor with a real GPU is the common
 * case, and a false negative would cost every one of them the background.
 */
function hasAcceleratedWebgl2() {
  let gl = null;
  try {
    gl = document.createElement('canvas').getContext('webgl2');
  } catch (error) {
    return false;
  }
  if (!gl) return false;

  try {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    if (!info) return true;
    const renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || '');
    return !/swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i.test(renderer);
  } catch (error) {
    return true;
  } finally {
    // Free the probe context instead of leaving it to the GC; browsers cap how
    // many live WebGL contexts a page may hold.
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  }
}

function initHeroBackground() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(min-width: 768px)').matches) return;

  if (!hasAcceleratedWebgl2()) return;

  const start = () => {
    import('/js/hero-3d.js')
      .then((module) => module.initHero3D(canvas))
      .catch(() => {
        // A failed background must never break the page; the hero simply stays flat.
        canvas.remove();
      });
  };

  // Defer past first paint so the chunk never competes with the initial render.
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(start, { timeout: 2000 });
  } else {
    setTimeout(start, 200);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initHeader();
  initHeroBackground();
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
