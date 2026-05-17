/* ============================================
   Main.js – Content Data & Initialization
   ============================================ */

/* ---- Services Data ---- */
const serviceImages = [
  'images/services/web-design.png',
  'images/services/landing-pages.png',
  'images/services/sales-funnels.png',
  'images/services/meta-ads.png',
  'images/services/social-media.png',
  'images/services/branding.png',
  'images/services/branding.png',
  'images/services/email-marketing.png',
  'images/services/web-design.png',
  'images/services/landing-pages.png'
];

const servicesData = {
  en: [
    { title: "Web Design", desc: "Custom website design that converts visitors into customers. We craft beautiful, responsive sites tailored to your brand identity.", tags: ["Responsive", "Custom Design", "CMS"] },
    { title: "Landing Pages", desc: "High-converting landing pages designed to maximize your marketing ROI. Every element is optimized for conversion.", tags: ["A/B Testing", "Conversion", "Speed"] },
    { title: "Sales Funnels", desc: "End-to-end sales funnels that guide your prospects from awareness to purchase with strategic automation.", tags: ["Automation", "Email", "Strategy"] },
    { title: "Meta Ads", desc: "Data-driven Meta advertising campaigns that reach your ideal audience and deliver measurable results across Facebook and Instagram.", tags: ["Facebook", "Instagram", "Analytics"] },
    { title: "Social Media Management", desc: "Strategic social media management that builds your brand presence, engages your audience, and drives growth.", tags: ["Content", "Engagement", "Growth"] },
    { title: "Branding", desc: "Comprehensive brand identity development that positions your business for success in the digital landscape.", tags: ["Identity", "Strategy", "Positioning"] },
    { title: "Logo Creation", desc: "Distinctive, memorable logos that capture the essence of your brand and stand out in competitive markets.", tags: ["Vectorial", "Versatile", "Iconic"] },
    { title: "Brand Manual", desc: "Complete brand guidelines that ensure consistency across all your digital and physical touchpoints.", tags: ["Guidelines", "Typography", "Colors"] },
    { title: "App Development", desc: "Custom application development for mobile and web platforms, built with modern frameworks and scalable architecture.", tags: ["Mobile", "Web Apps", "APIs"] },
    { title: "UX/UI Design", desc: "User-centered interface design that creates intuitive, delightful digital experiences driving engagement and retention.", tags: ["Research", "Prototyping", "Testing"] }
  ],
  es: [
    { title: "Diseño Web", desc: "Diseño web personalizado que convierte visitantes en clientes. Creamos sitios hermosos y responsivos adaptados a tu identidad de marca.", tags: ["Responsivo", "Diseño Custom", "CMS"] },
    { title: "Landing Pages", desc: "Landing pages de alta conversión diseñadas para maximizar tu ROI de marketing. Cada elemento está optimizado para convertir.", tags: ["A/B Testing", "Conversión", "Velocidad"] },
    { title: "Embudos de Venta", desc: "Embudos de venta completos que guían a tus prospectos desde el conocimiento hasta la compra con automatización estratégica.", tags: ["Automatización", "Email", "Estrategia"] },
    { title: "Meta Ads", desc: "Campañas publicitarias en Meta basadas en datos que alcanzan a tu audiencia ideal y entregan resultados medibles en Facebook e Instagram.", tags: ["Facebook", "Instagram", "Analítica"] },
    { title: "Manejo de Redes Sociales", desc: "Gestión estratégica de redes sociales que construye tu presencia de marca, engancha a tu audiencia e impulsa el crecimiento.", tags: ["Contenido", "Engagement", "Crecimiento"] },
    { title: "Branding", desc: "Desarrollo integral de identidad de marca que posiciona tu negocio para el éxito en el panorama digital.", tags: ["Identidad", "Estrategia", "Posicionamiento"] },
    { title: "Creación de Logos", desc: "Logos distintivos y memorables que capturan la esencia de tu marca y destacan en mercados competitivos.", tags: ["Vectorial", "Versátil", "Icónico"] },
    { title: "Manual de Marca", desc: "Guías de marca completas que aseguran consistencia en todos tus puntos de contacto digitales y físicos.", tags: ["Lineamientos", "Tipografía", "Colores"] },
    { title: "Desarrollo de Aplicaciones", desc: "Desarrollo de aplicaciones personalizadas para plataformas móviles y web, construidas con frameworks modernos y arquitectura escalable.", tags: ["Móvil", "Web Apps", "APIs"] },
    { title: "Diseño UX/UI", desc: "Diseño de interfaces centrado en el usuario que crea experiencias digitales intuitivas y encantadoras.", tags: ["Investigación", "Prototipado", "Testing"] }
  ]
};

/* ---- Portfolio Data ---- */
const workData = {
  en: [
    { name: "Luminos App", desc: "Fintech mobile application", tags: ["UX/UI", "App Development"], color: "#1a1a2e", img: "images/portfolio-1.png",
      case: { challenge: "Luminos needed a mobile banking app that could compete with established fintech players while targeting Gen Z users.", solution: "We designed a complete UX/UI system with gamified savings features, biometric security, and a distinctive dark-mode interface.", result: "4.8★ App Store rating, 150K downloads in 3 months, 62% daily active user retention." }},
    { name: "Verde Organic", desc: "E-commerce brand & web design", tags: ["Web Design", "Branding"], color: "#2d5016", img: "images/portfolio-2.png",
      case: { challenge: "An organic food brand needed to transition from farmers' markets to a full e-commerce presence.", solution: "We built a complete brand identity with earth-tone palette, custom typography, and a Shopify-based store with subscription features.", result: "285% increase in online revenue, 12K monthly subscribers within 6 months." }},
    { name: "NovaTech Solutions", desc: "Corporate website redesign", tags: ["Web Design", "Landing Pages"], color: "#0f3460", img: "images/portfolio-3.png",
      case: { challenge: "NovaTech's enterprise software site had a 78% bounce rate and wasn't generating qualified leads.", solution: "Complete redesign focused on clear value propositions, interactive product demos, and an optimized lead capture funnel.", result: "Bounce rate reduced to 34%, lead generation increased by 420%, average session duration up 3.2x." }},
    { name: "Bloom Wellness", desc: "Full digital marketing campaign", tags: ["Meta Ads", "Sales Funnels"], color: "#6b2d5b", img: "images/portfolio-4.png",
      case: { challenge: "A wellness brand needed to scale from local to national reach with a limited marketing budget.", solution: "We created a multi-channel funnel strategy combining Meta Ads, email automation, and retargeting with dynamic creative optimization.", result: "ROAS of 6.8x, 3,200 new customers in 90 days, cost per acquisition reduced by 58%." }},
    { name: "Atlas Ventures", desc: "Brand identity & guidelines", tags: ["Branding", "Logo Creation"], color: "#1b1b2f", img: "images/portfolio-5.png",
      case: { challenge: "A venture capital firm needed a brand refresh to attract Series A startups and institutional investors.", solution: "We developed a premium brand system with custom logo, typography hierarchy, pitch deck templates, and comprehensive brand guidelines.", result: "Brand recognition increased 340%, 28 new startup partnerships in Q1, investor presentation close rate up 45%." }},
    { name: "CrystalClear SaaS", desc: "Product design & development", tags: ["UX/UI", "App Development"], color: "#0a3d62", img: "images/portfolio-6.png",
      case: { challenge: "A B2B analytics platform needed a complete product redesign to reduce churn and improve onboarding.", solution: "We redesigned the entire product with an intuitive dashboard system, guided onboarding flow, and real-time collaboration features.", result: "Churn reduced from 12% to 4.2%, onboarding completion rate increased to 89%, NPS score improved from 32 to 71." }}
  ],
  es: [
    { name: "Luminos App", desc: "Aplicación móvil fintech", tags: ["UX/UI", "Desarrollo de Apps"], color: "#1a1a2e", img: "images/portfolio-1.png",
      case: { challenge: "Luminos necesitaba una app bancaria móvil que compitiera con players fintech establecidos, enfocada en usuarios Gen Z.", solution: "Diseñamos un sistema UX/UI completo con ahorro gamificado, seguridad biométrica y una interfaz distintiva en modo oscuro.", result: "4.8★ en App Store, 150K descargas en 3 meses, 62% de retención de usuarios activos diarios." }},
    { name: "Verde Organic", desc: "E-commerce: marca y diseño web", tags: ["Diseño Web", "Branding"], color: "#2d5016", img: "images/portfolio-2.png",
      case: { challenge: "Una marca de alimentos orgánicos necesitaba transicionar de mercados locales a e-commerce completo.", solution: "Construimos una identidad de marca completa con paleta terrosa, tipografía custom y tienda Shopify con suscripciones.", result: "285% de incremento en ingresos online, 12K suscriptores mensuales en 6 meses." }},
    { name: "NovaTech Solutions", desc: "Rediseño de sitio corporativo", tags: ["Diseño Web", "Landing Pages"], color: "#0f3460", img: "images/portfolio-3.png",
      case: { challenge: "El sitio de software empresarial de NovaTech tenía 78% de tasa de rebote y no generaba leads calificados.", solution: "Rediseño completo enfocado en propuestas de valor claras, demos interactivos y embudo de captación optimizado.", result: "Tasa de rebote reducida a 34%, generación de leads aumentó 420%, duración de sesión aumentó 3.2x." }},
    { name: "Bloom Wellness", desc: "Campaña de marketing digital integral", tags: ["Meta Ads", "Embudos de Venta"], color: "#6b2d5b", img: "images/portfolio-4.png",
      case: { challenge: "Una marca de bienestar necesitaba escalar de alcance local a nacional con presupuesto limitado.", solution: "Creamos una estrategia multi-canal con Meta Ads, automatización de email y retargeting con optimización dinámica de creativos.", result: "ROAS de 6.8x, 3,200 nuevos clientes en 90 días, costo por adquisición reducido 58%." }},
    { name: "Atlas Ventures", desc: "Identidad de marca y lineamientos", tags: ["Branding", "Creación de Logos"], color: "#1b1b2f", img: "images/portfolio-5.png",
      case: { challenge: "Un fondo de capital de riesgo necesitaba renovar su marca para atraer startups Serie A e inversores institucionales.", solution: "Desarrollamos un sistema de marca premium con logo custom, jerarquía tipográfica, plantillas de pitch deck y guías de marca completas.", result: "Reconocimiento de marca incrementó 340%, 28 nuevas alianzas con startups en Q1, tasa de cierre de presentaciones aumentó 45%." }},
    { name: "CrystalClear SaaS", desc: "Diseño de producto y desarrollo", tags: ["UX/UI", "Desarrollo de Apps"], color: "#0a3d62", img: "images/portfolio-6.png",
      case: { challenge: "Una plataforma de analítica B2B necesitaba rediseño completo para reducir abandono y mejorar onboarding.", solution: "Rediseñamos todo el producto con sistema de dashboards intuitivo, flujo de onboarding guiado y colaboración en tiempo real.", result: "Abandono reducido de 12% a 4.2%, tasa de completación de onboarding aumentó a 89%, NPS mejoró de 32 a 71." }}
  ]
};

/* ---- News Data ---- */
const newsImages = ['images/news/news-1.png', 'images/news/news-2.png', 'images/news/news-3.png'];

const newsData = {
  en: [
    { category: "AI", title: "How AI is Revolutionizing Digital Marketing Strategies", date: "May 2026", read: "5 min read",
      content: "Artificial intelligence is no longer a futuristic concept — it's the backbone of modern digital marketing. From predictive customer segmentation to automated content generation, AI tools are enabling agencies to deliver hyper-personalized experiences at scale.\n\nAt CREATIVE MK, we've integrated AI-powered chatbots that handle 85% of initial customer inquiries, reducing response times from hours to seconds. Our dynamic content personalization engine analyzes user behavior in real-time, adjusting messaging, imagery, and CTAs to match individual preferences.\n\nThe most impactful applications we've seen include:\n• Predictive lead scoring that identifies high-value prospects before they engage\n• Automated A/B testing that optimizes campaigns 24/7 without human intervention\n• Natural language processing for sentiment analysis across social channels\n\nThe key insight? AI doesn't replace creativity — it amplifies it. By automating data analysis and routine optimization, creative teams can focus on what they do best: crafting compelling narratives that resonate with audiences." },
    { category: "Design", title: "Modern Branding Trends That Define Premium Identities", date: "Apr 2026", read: "4 min read",
      content: "In 2026, premium branding has shifted decisively toward minimalist sophistication. The brands that stand out aren't the loudest — they're the most intentional.\n\nKey trends defining premium identities this year:\n\n1. Typography-First Design: Leading brands are using custom typefaces as their primary brand asset, reducing reliance on logos and icons.\n\n2. Muted, Earthy Palettes: Neon and bright gradients are giving way to warm neutrals, deep charcoals, and organic earth tones.\n\n3. Editorial Whitespace: Premium brands embrace generous whitespace, allowing each element to breathe and command attention.\n\n4. Hyper-Realistic Photography: Stock photos are out. Brands investing in custom, editorial-quality photography see 3x higher engagement.\n\n5. Micro-Interactions: Subtle hover effects, smooth transitions, and purposeful animations create a sense of craftsmanship.\n\nAt CREATIVE MK, we apply these principles across every project, ensuring our clients' brands feel current, premium, and memorable." },
    { category: "Technology", title: "Web Design Trends Shaping the Digital Landscape in 2026", date: "Mar 2026", read: "6 min read",
      content: "The web design landscape in 2026 is defined by the convergence of aesthetics, performance, and intelligence.\n\nTop trends we're implementing:\n\n• Scroll-Driven Animations: CSS scroll-timeline is now widely supported, enabling cinematic storytelling without JavaScript overhead.\n\n• Variable Fonts: Single font files that adapt weight, width, and optical size dynamically, improving both performance and typographic control.\n\n• Dark Mode by Default: With 78% of users preferring dark interfaces, dark-mode-first design has become the standard.\n\n• AI-Powered Personalization: Websites that adapt layout, content, and navigation based on user behavior see 45% higher conversion rates.\n\n• Core Web Vitals Obsession: Google's ranking factors have made performance optimization inseparable from design decisions. Every visual choice must justify its loading cost.\n\n• 3D and WebGL Integration: Subtle 3D elements add depth and premium feel without sacrificing performance.\n\nThe most successful websites in 2026 don't just look beautiful — they're intelligent systems that learn and adapt to each visitor." }
  ],
  es: [
    { category: "IA", title: "Cómo la IA Está Revolucionando las Estrategias de Marketing Digital", date: "Mayo 2026", read: "5 min lectura",
      content: "La inteligencia artificial ya no es un concepto futurista — es la columna vertebral del marketing digital moderno. Desde la segmentación predictiva de clientes hasta la generación automatizada de contenido, las herramientas de IA permiten a las agencias ofrecer experiencias hiperpersonalizadas a escala.\n\nEn CREATIVE MK, hemos integrado chatbots con IA que manejan el 85% de las consultas iniciales de clientes, reduciendo tiempos de respuesta de horas a segundos. Nuestro motor de personalización dinámica de contenido analiza el comportamiento del usuario en tiempo real, ajustando mensajes, imágenes y CTAs según preferencias individuales.\n\nLas aplicaciones más impactantes que hemos visto incluyen:\n• Puntuación predictiva de leads que identifica prospectos de alto valor antes de que interactúen\n• Testing A/B automatizado que optimiza campañas 24/7 sin intervención humana\n• Procesamiento de lenguaje natural para análisis de sentimiento en canales sociales\n\nLa clave: la IA no reemplaza la creatividad — la amplifica." },
    { category: "Diseño", title: "Tendencias de Branding Moderno que Definen Identidades Premium", date: "Abr 2026", read: "4 min lectura",
      content: "En 2026, el branding premium se ha movido decisivamente hacia la sofisticación minimalista. Las marcas que destacan no son las más ruidosas — son las más intencionales.\n\nTendencias clave que definen identidades premium este año:\n\n1. Diseño Typography-First: Las marcas líderes usan tipografías custom como su activo principal de marca.\n\n2. Paletas Terrosas y Suaves: Los neones y gradientes brillantes dan paso a neutrales cálidos, carbones profundos y tonos orgánicos.\n\n3. Whitespace Editorial: Las marcas premium abrazan el espacio generoso, permitiendo que cada elemento respire y comande atención.\n\n4. Fotografía Hiperrealista: Las fotos de stock están fuera. Las marcas que invierten en fotografía editorial custom ven 3x más engagement.\n\n5. Micro-Interacciones: Efectos hover sutiles, transiciones suaves y animaciones con propósito crean sensación de artesanía.\n\nEn CREATIVE MK, aplicamos estos principios en cada proyecto." },
    { category: "Tecnología", title: "Tendencias de Diseño Web que Moldean el Panorama Digital en 2026", date: "Mar 2026", read: "6 min lectura",
      content: "El panorama del diseño web en 2026 se define por la convergencia de estética, rendimiento e inteligencia.\n\nTendencias principales que estamos implementando:\n\n• Animaciones por Scroll: CSS scroll-timeline ahora tiene soporte amplio, permitiendo narrativa cinematográfica sin sobrecarga de JavaScript.\n\n• Fuentes Variables: Archivos de fuente únicos que adaptan peso, ancho y tamaño óptico dinámicamente.\n\n• Dark Mode por Defecto: Con 78% de usuarios prefiriendo interfaces oscuras, el diseño dark-mode-first se ha convertido en estándar.\n\n• Personalización con IA: Sitios web que adaptan layout, contenido y navegación basados en comportamiento del usuario ven 45% más conversión.\n\n• Obsesión por Core Web Vitals: Los factores de ranking de Google han hecho que la optimización de rendimiento sea inseparable de las decisiones de diseño.\n\n• Integración 3D y WebGL: Elementos 3D sutiles añaden profundidad y sensación premium sin sacrificar rendimiento.\n\nLos sitios web más exitosos en 2026 no solo se ven hermosos — son sistemas inteligentes que aprenden y se adaptan a cada visitante." }
  ]
};

/* ---- FAQ Data ---- */
const faqData = {
  en: [
    { q: "What services does CREATIVE MK offer?", a: "We offer a full range of digital services including Web Design, Landing Pages, Sales Funnels, Meta Ads, Social Media Management, Branding, Logo Creation, Brand Manuals, App Development, and UX/UI Design." },
    { q: "How long does a typical project take?", a: "Project timelines vary by scope. A landing page typically takes 1-2 weeks, a full website 4-8 weeks, and comprehensive branding projects 3-6 weeks. We'll provide a detailed timeline during our initial consultation." },
    { q: "Do you work with international clients?", a: "Absolutely. We are a digital-first agency with clients worldwide. Our team is bilingual (English/Spanish) and experienced in working across different time zones and cultures." },
    { q: "How do you integrate AI automation?", a: "We embed AI tools into every system we build — from intelligent chatbots and automated email sequences to dynamic content personalization and predictive analytics dashboards that work 24/7." },
    { q: "Can you help with an existing brand refresh?", a: "Yes. Many of our clients come to us for brand refreshes. We can update your visual identity, create new brand guidelines, redesign your website, and align all touchpoints with your evolved brand vision." }
  ],
  es: [
    { q: "¿Qué servicios ofrece CREATIVE MK?", a: "Ofrecemos una gama completa de servicios digitales incluyendo Diseño Web, Landing Pages, Embudos de Venta, Meta Ads, Manejo de Redes Sociales, Branding, Creación de Logos, Manuales de Marca, Desarrollo de Aplicaciones y Diseño UX/UI." },
    { q: "¿Cuánto tiempo toma un proyecto típico?", a: "Los tiempos varían según el alcance. Una landing page toma típicamente 1-2 semanas, un sitio web completo 4-8 semanas, y proyectos integrales de branding 3-6 semanas. Proporcionamos un cronograma detallado en la consulta inicial." },
    { q: "¿Trabajan con clientes internacionales?", a: "Por supuesto. Somos una agencia digital-first con clientes en todo el mundo. Nuestro equipo es bilingüe (inglés/español) y tiene experiencia trabajando en diferentes zonas horarias y culturas." },
    { q: "¿Cómo integran la automatización con IA?", a: "Integramos herramientas de IA en cada sistema que construimos — desde chatbots inteligentes y secuencias de email automatizadas hasta personalización dinámica de contenido y dashboards de analítica predictiva que funcionan 24/7." },
    { q: "¿Pueden ayudar con un rediseño de marca existente?", a: "Sí. Muchos clientes nos buscan para refrescar su marca. Podemos actualizar tu identidad visual, crear nuevos lineamientos de marca, rediseñar tu sitio web y alinear todos los puntos de contacto con tu visión de marca evolucionada." }
  ]
};

/* ---- Render Functions ---- */

function renderCapabilities() {
  const list = document.getElementById('capabilities-list');
  if (!list) return;
  const data = servicesData[currentLang];
  list.innerHTML = data.map((s, i) => `
    <div class="accordion-item reveal${i === 0 ? ' active' : ''}">
      <button class="accordion-header" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="cap-content-${i}" data-service-index="${i}">
        <span class="accordion-title">${s.title}</span>
        <span class="accordion-icon"></span>
      </button>
      <div class="accordion-content" id="cap-content-${i}" role="region" style="${i === 0 ? 'max-height:500px' : ''}">
        <div class="accordion-content__inner">
          <div>
            <p class="accordion-text">${s.desc}</p>
            <div class="accordion-tags">${s.tags.map(t => `<span class="accordion-tag">${t}</span>`).join('')}</div>
          </div>
        </div>
      </div>
    </div>`).join('');
  
  // Update central visual on accordion change
  list.addEventListener('click', (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;
    const idx = header.dataset.serviceIndex;
    const img = document.getElementById('cap-visual-img');
    if (img && serviceImages[idx]) {
      img.style.opacity = '0';
      img.style.transform = 'scale(0.95)';
      setTimeout(() => {
        img.src = serviceImages[idx];
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      }, 200);
    }
  });

  initAccordion('#capabilities-list');
  initAnimations();
}

function renderWork() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;
  const data = workData[currentLang];
  const viewText = currentLang === 'es' ? 'Ver proyecto' : 'View case study';
  grid.innerHTML = `
    <div class="work__row work__row--two">
      ${data.slice(0, 2).map((p, i) => workCard(p, viewText, i)).join('')}
    </div>
    <div class="work__row work__row--two-reverse">
      ${data.slice(2, 4).map((p, i) => workCard(p, viewText, i + 2)).join('')}
    </div>
    <div class="work__row work__row--two">
      ${data.slice(4, 6).map((p, i) => workCard(p, viewText, i + 4)).join('')}
    </div>`;

  // Attach click events to work cards
  grid.querySelectorAll('.work__card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.workIndex);
      const project = workData[currentLang][idx];
      if (project && project.case) openCaseModal(project);
    });
    card.style.cursor = 'pointer';
  });
}

function workCard(p, viewText, idx) {
  return `<div class="work__card reveal" data-work-index="${idx}">
    <div class="work__card-media" style="background:${p.color}">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="work__card-overlay">
        <h3 class="work__card-name">${p.name}</h3>
        <p class="work__card-desc">${p.desc}</p>
        <div class="work__card-tags">${p.tags.map(t => `<span class="work__card-tag">${t}</span>`).join('')}</div>
      </div>
      <span class="work__card-cta">${viewText}</span>
    </div>
    <div class="work__card-info">
      <h3 class="work__card-info-name">${p.name}</h3>
      <p class="work__card-info-desc">${p.desc}</p>
    </div>
  </div>`;
}

function renderNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const data = newsData[currentLang];
  grid.innerHTML = data.map((n, i) => `
    <div class="news__card reveal" data-news-index="${i}" style="cursor:pointer">
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
    </div>`).join('');

  // Attach click events to news cards
  grid.querySelectorAll('.news__card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.newsIndex);
      const article = newsData[currentLang][idx];
      if (article && article.content) openNewsModal(article, newsImages[idx]);
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

/* ---- Carousel with Team Photos ---- */
function renderCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  const imgs = [
    'images/team/team-1.png', 'images/team/team-2.png', 'images/team/team-3.png',
    'images/team/team-4.png', 'images/team/team-5.png', 'images/team/team-6.png'
  ];
  const items = imgs.map(src => `<div class="about__carousel-item"><img src="${src}" alt="CREATIVE MK team" loading="lazy"></div>`).join('');
  track.innerHTML = items + items; // Duplicate for infinite loop

  // Navigation buttons
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (prevBtn && nextBtn) {
    const scrollAmount = 400;
    const carousel = track.parentElement;
    prevBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    nextBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }
}

/* ---- Newsletter Handler ---- */
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

/* ---- Play Showreel — Auto-sound + Toggle ---- */
function initPlayShowreel() {
  const btn = document.getElementById('hero-play-btn');
  const video = document.getElementById('hero-video');
  if (!btn || !video) return;

  const btnLabel = btn.querySelector('span');
  const btnIcon = btn.querySelector('svg');

  function setUnmutedState() {
    btn.classList.add('hero__play-btn--active');
    if (btnLabel) btnLabel.textContent = currentLang === 'es' ? 'Silenciar' : 'Mute';
    if (btnIcon) btnIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
  }

  function setMutedState() {
    btn.classList.remove('hero__play-btn--active');
    if (btnLabel) btnLabel.textContent = currentLang === 'es' ? '🔇 Activar sonido' : '🔇 Enable Sound';
    if (btnIcon) btnIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
  }

  // Attempt autoplay with sound
  video.muted = false;
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      // Autoplay with sound succeeded!
      setUnmutedState();
    }).catch(() => {
      // Browser blocked unmuted autoplay — fallback to muted
      video.muted = true;
      video.play();
      setMutedState();
      // Add a gentle pulse to draw attention to the sound button
      btn.classList.add('hero__play-btn--pulse');
    });
  }

  // Toggle mute/unmute on click
  btn.addEventListener('click', () => {
    btn.classList.remove('hero__play-btn--pulse');
    if (video.muted) {
      video.muted = false;
      video.play();
      setUnmutedState();
    } else {
      video.muted = true;
      setMutedState();
    }
  });
}

/* ---- Modal System ---- */
function createModal() {
  if (document.getElementById('detail-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'detail-modal';
  modal.className = 'detail-modal';
  modal.innerHTML = `
    <div class="detail-modal__backdrop"></div>
    <div class="detail-modal__container">
      <button class="detail-modal__close" aria-label="Close">&times;</button>
      <div class="detail-modal__content"></div>
    </div>`;
  document.body.appendChild(modal);
}

function openModal(html) {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;
  modal.querySelector('.detail-modal__content').innerHTML = html;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function openCaseModal(project) {
  const labels = currentLang === 'es'
    ? { challenge: 'El Desafío', solution: 'Nuestra Solución', result: 'Resultados', caseStudy: 'Caso de Estudio' }
    : { challenge: 'The Challenge', solution: 'Our Solution', result: 'Results', caseStudy: 'Case Study' };

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
        <div class="modal-case__section modal-case__section--result">
          <h3>${labels.result}</h3>
          <p>${project.case.result}</p>
        </div>
      </div>
    </div>`;
  openModal(html);
}

function openNewsModal(article, imgSrc) {
  const backLabel = currentLang === 'es' ? '← Volver a noticias' : '← Back to news';
  const paragraphs = article.content.split('\n\n').map(p => {
    if (p.startsWith('•') || p.startsWith('1.') || p.startsWith('2.') || p.startsWith('3.') || p.startsWith('4.') || p.startsWith('5.')) {
      return `<p class="modal-news__list">${p.replace(/\n/g, '<br>')}</p>`;
    }
    return `<p>${p}</p>`;
  }).join('');

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
        <button class="modal-news__back" onclick="closeModal()">${backLabel}</button>
      </div>
    </div>`;
  openModal(html);
}

function initModal() {
  createModal();
  document.addEventListener('click', (e) => {
    if (e.target.closest('.detail-modal__close') || e.target.closest('.detail-modal__backdrop')) {
      closeModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ---- Init ---- */
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

