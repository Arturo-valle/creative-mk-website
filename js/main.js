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
  'images/services/branding.png',       // Logo Creation reuses branding img
  'images/services/email-marketing.png', // Brand Manual
  'images/services/web-design.png',      // App Development
  'images/services/landing-pages.png'    // UX/UI Design
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
    { name: "Luminos App", desc: "Fintech mobile application", tags: ["UX/UI", "App Development"], color: "#1a1a2e", img: "images/portfolio-1.png" },
    { name: "Verde Organic", desc: "E-commerce brand & web design", tags: ["Web Design", "Branding"], color: "#2d5016", img: "images/portfolio-2.png" },
    { name: "NovaTech Solutions", desc: "Corporate website redesign", tags: ["Web Design", "Landing Pages"], color: "#0f3460", img: "images/portfolio-3.png" },
    { name: "Bloom Wellness", desc: "Full digital marketing campaign", tags: ["Meta Ads", "Sales Funnels"], color: "#6b2d5b", img: "images/portfolio-4.png" },
    { name: "Atlas Ventures", desc: "Brand identity & guidelines", tags: ["Branding", "Logo Creation"], color: "#1b1b2f", img: "images/portfolio-5.png" },
    { name: "CrystalClear SaaS", desc: "Product design & development", tags: ["UX/UI", "App Development"], color: "#0a3d62", img: "images/portfolio-6.png" }
  ],
  es: [
    { name: "Luminos App", desc: "Aplicación móvil fintech", tags: ["UX/UI", "Desarrollo de Apps"], color: "#1a1a2e", img: "images/portfolio-1.png" },
    { name: "Verde Organic", desc: "E-commerce: marca y diseño web", tags: ["Diseño Web", "Branding"], color: "#2d5016", img: "images/portfolio-2.png" },
    { name: "NovaTech Solutions", desc: "Rediseño de sitio corporativo", tags: ["Diseño Web", "Landing Pages"], color: "#0f3460", img: "images/portfolio-3.png" },
    { name: "Bloom Wellness", desc: "Campaña de marketing digital integral", tags: ["Meta Ads", "Embudos de Venta"], color: "#6b2d5b", img: "images/portfolio-4.png" },
    { name: "Atlas Ventures", desc: "Identidad de marca y lineamientos", tags: ["Branding", "Creación de Logos"], color: "#1b1b2f", img: "images/portfolio-5.png" },
    { name: "CrystalClear SaaS", desc: "Diseño de producto y desarrollo", tags: ["UX/UI", "Desarrollo de Apps"], color: "#0a3d62", img: "images/portfolio-6.png" }
  ]
};

/* ---- News Data ---- */
const newsImages = ['images/news/news-1.png', 'images/news/news-2.png', 'images/news/news-3.png'];

const newsData = {
  en: [
    { category: "Marketing", title: "The Future of Sales Funnels in 2026", date: "May 2026", read: "5 min read" },
    { category: "Design", title: "Why Great UX Design Drives Revenue Growth", date: "Apr 2026", read: "4 min read" },
    { category: "Technology", title: "How Meta Ads AI Is Changing Digital Advertising", date: "Mar 2026", read: "6 min read" }
  ],
  es: [
    { category: "Marketing", title: "El Futuro de los Embudos de Venta en 2026", date: "Mayo 2026", read: "5 min lectura" },
    { category: "Diseño", title: "Por Qué un Gran Diseño UX Impulsa el Crecimiento de Ingresos", date: "Abr 2026", read: "4 min lectura" },
    { category: "Tecnología", title: "Cómo la IA de Meta Ads Está Cambiando la Publicidad Digital", date: "Mar 2026", read: "6 min lectura" }
  ]
};

/* ---- FAQ Data ---- */
const faqData = {
  en: [
    { q: "What services does CREATIVE MK offer?", a: "We offer a full range of digital services including Web Design, Landing Pages, Sales Funnels, Meta Ads, Social Media Management, Branding, Logo Creation, Brand Manuals, App Development, and UX/UI Design." },
    { q: "How long does a typical project take?", a: "Project timelines vary by scope. A landing page typically takes 1-2 weeks, a full website 4-8 weeks, and comprehensive branding projects 3-6 weeks. We'll provide a detailed timeline during our initial consultation." },
    { q: "Do you work with international clients?", a: "Absolutely. We are a digital-first agency with clients worldwide. Our team is bilingual (English/Spanish) and experienced in working across different time zones and cultures." },
    { q: "What is your approach to Meta Ads?", a: "We use a data-driven approach combining audience research, creative testing, and continuous optimization. We manage the entire process from strategy to execution, reporting transparent results." },
    { q: "Can you help with an existing brand refresh?", a: "Yes. Many of our clients come to us for brand refreshes. We can update your visual identity, create new brand guidelines, redesign your website, and align all touchpoints with your evolved brand vision." }
  ],
  es: [
    { q: "¿Qué servicios ofrece CREATIVE MK?", a: "Ofrecemos una gama completa de servicios digitales incluyendo Diseño Web, Landing Pages, Embudos de Venta, Meta Ads, Manejo de Redes Sociales, Branding, Creación de Logos, Manuales de Marca, Desarrollo de Aplicaciones y Diseño UX/UI." },
    { q: "¿Cuánto tiempo toma un proyecto típico?", a: "Los tiempos varían según el alcance. Una landing page toma típicamente 1-2 semanas, un sitio web completo 4-8 semanas, y proyectos integrales de branding 3-6 semanas. Proporcionamos un cronograma detallado en la consulta inicial." },
    { q: "¿Trabajan con clientes internacionales?", a: "Por supuesto. Somos una agencia digital-first con clientes en todo el mundo. Nuestro equipo es bilingüe (inglés/español) y tiene experiencia trabajando en diferentes zonas horarias y culturas." },
    { q: "¿Cuál es su enfoque para Meta Ads?", a: "Usamos un enfoque basado en datos combinando investigación de audiencia, pruebas creativas y optimización continua. Gestionamos todo el proceso desde la estrategia hasta la ejecución, reportando resultados transparentes." },
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
      <button class="accordion-header" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="cap-content-${i}">
        <span class="accordion-title">${s.title}</span>
        <span class="accordion-icon"></span>
      </button>
      <div class="accordion-content" id="cap-content-${i}" role="region" style="${i === 0 ? 'max-height:500px' : ''}">
        <div class="accordion-content__inner">
          <div>
            <p class="accordion-text">${s.desc}</p>
            <div class="accordion-tags">${s.tags.map(t => `<span class="accordion-tag">${t}</span>`).join('')}</div>
          </div>
          <div class="accordion-image">
            <img src="${serviceImages[i]}" alt="${s.title}" loading="lazy">
          </div>
        </div>
      </div>
    </div>`).join('');
  initAccordion('#capabilities-list');
  initAnimations();
}

function renderWork() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;
  const data = workData[currentLang];
  grid.innerHTML = `
    <div class="work__row work__row--two">
      ${data.slice(0, 2).map(p => workCard(p)).join('')}
    </div>
    <div class="work__row work__row--two-reverse">
      ${data.slice(2, 4).map(p => workCard(p)).join('')}
    </div>
    <div class="work__row work__row--two">
      ${data.slice(4, 6).map(p => workCard(p)).join('')}
    </div>`;
}

function workCard(p) {
  return `<div class="work__card reveal">
    <div class="work__card-image" style="aspect-ratio:4/3;background:${p.color}">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
    </div>
    <div class="work__card-info">
      <h3 class="work__card-name">${p.name}</h3>
      <p class="work__card-desc">${p.desc}</p>
      <div class="work__card-tags">${p.tags.map(t => `<span class="work__card-tag">${t}</span>`).join('')}</div>
    </div>
  </div>`;
}

function renderNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const data = newsData[currentLang];
  grid.innerHTML = data.map((n, i) => `
    <a href="#news" class="news__card reveal">
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
    </a>`).join('');
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

/* ---- Logo Wall with Professional SVG Logos ---- */
function renderLogoWall() {
  const grid = document.getElementById('logo-grid');
  if (!grid) return;
  const logos = [
    { name: 'Spotify', svg: '<svg viewBox="0 0 168 168" width="100" height="36"><path fill="#1DB954" d="M84 0C37.6 0 0 37.6 0 84s37.6 84 84 84 84-37.6 84-84S130.4 0 84 0zm38.5 121.2c-1.5 2.4-4.7 3.2-7.1 1.7-19.5-11.9-44-14.6-72.9-8-2.8.6-5.5-1.1-6.2-3.9-.6-2.8 1.1-5.5 3.9-6.2 31.6-7.2 58.7-4.1 80.7 9.3 2.4 1.5 3.2 4.7 1.6 7.1zm10.3-22.9c-1.9 3-5.8 4-8.9 2.1-22.3-13.7-56.3-17.7-82.7-9.7-3.3 1-6.8-.9-7.8-4.2-1-3.3.9-6.8 4.2-7.8 30.1-9.1 67.5-4.7 93 11.1 3.1 1.8 4.1 5.8 2.2 8.5zm.9-23.8c-26.8-15.9-71-17.4-96.6-9.6-4.1 1.2-8.4-1.1-9.6-5.2-1.2-4.1 1.1-8.4 5.2-9.6 29.4-8.9 78.3-7.2 109.2 11.1 3.7 2.2 4.9 6.9 2.7 10.5-2.2 3.7-6.9 4.9-10.5 2.8h-.4z"/></svg>' },
    { name: 'Airbnb', svg: '<svg viewBox="0 0 120 36" width="100" height="36"><path fill="#FF5A5F" d="M60.1 1.5c-3.7 0-6.7 3-6.7 6.7s3 6.7 6.7 6.7 6.7-3 6.7-6.7-3-6.7-6.7-6.7zm0 10.9c-2.3 0-4.2-1.9-4.2-4.2s1.9-4.2 4.2-4.2 4.2 1.9 4.2 4.2-1.9 4.2-4.2 4.2zM29.3 8.2c0-3.7-3-6.7-6.7-6.7s-6.7 3-6.7 6.7 3 6.7 6.7 6.7 6.7-3 6.7-6.7zm-10.9 0c0-2.3 1.9-4.2 4.2-4.2s4.2 1.9 4.2 4.2-1.9 4.2-4.2 4.2-4.2-1.9-4.2-4.2z"/><text x="5" y="32" font-family="Inter,Arial" font-weight="700" font-size="14" fill="#FF5A5F">airbnb</text></svg>' },
    { name: 'Stripe', svg: '<svg viewBox="0 0 120 36" width="100" height="36"><text x="10" y="26" font-family="Inter,Arial" font-weight="700" font-size="22" fill="#635BFF">stripe</text></svg>' },
    { name: 'Notion', svg: '<svg viewBox="0 0 120 36" width="100" height="36"><text x="10" y="26" font-family="Inter,Arial" font-weight="600" font-size="20" fill="#000">Notion</text></svg>' },
    { name: 'Slack', svg: '<svg viewBox="0 0 120 36" width="100" height="36"><circle cx="12" cy="10" r="4" fill="#E01E5A"/><circle cx="24" cy="10" r="4" fill="#36C5F0"/><circle cx="12" cy="22" r="4" fill="#2EB67D"/><circle cx="24" cy="22" r="4" fill="#ECB22E"/><text x="36" y="22" font-family="Inter,Arial" font-weight="700" font-size="18" fill="#000">slack</text></svg>' },
    { name: 'Figma', svg: '<svg viewBox="0 0 120 36" width="100" height="36"><circle cx="10" cy="8" r="5" fill="#F24E1E"/><circle cx="20" cy="8" r="5" fill="#FF7262"/><circle cx="10" cy="18" r="5" fill="#A259FF"/><circle cx="20" cy="18" r="5" fill="#1ABCFE"/><circle cx="10" cy="28" r="5" fill="#0ACF83"/><text x="32" y="24" font-family="Inter,Arial" font-weight="600" font-size="18" fill="#000">Figma</text></svg>' },
    { name: 'Vercel', svg: '<svg viewBox="0 0 120 36" width="100" height="36"><polygon points="15,4 28,28 2,28" fill="#000"/><text x="34" y="24" font-family="Inter,Arial" font-weight="600" font-size="18" fill="#000">Vercel</text></svg>' },
    { name: 'Shopify', svg: '<svg viewBox="0 0 120 36" width="100" height="36"><text x="10" y="26" font-family="Inter,Arial" font-weight="700" font-size="20" fill="#96BF48">shopify</text></svg>' },
    { name: 'HubSpot', svg: '<svg viewBox="0 0 120 36" width="100" height="36"><text x="10" y="26" font-family="Inter,Arial" font-weight="700" font-size="18" fill="#FF7A59">HubSpot</text></svg>' },
    { name: 'Webflow', svg: '<svg viewBox="0 0 120 36" width="100" height="36"><text x="10" y="26" font-family="Inter,Arial" font-weight="700" font-size="18" fill="#4353FF">Webflow</text></svg>' }
  ];
  grid.innerHTML = logos.map(l => `
    <div class="logo-wall__item reveal">
      ${l.svg}
    </div>`).join('');
}

function renderCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  const imgs = ['images/portfolio-1.png','images/portfolio-2.png','images/portfolio-3.png','images/portfolio-4.png','images/portfolio-5.png','images/portfolio-6.png'];
  const items = imgs.map(src => `<div class="about__carousel-item"><img src="${src}" alt="CREATIVE MK project showcase" loading="lazy"></div>`).join('');
  track.innerHTML = items + items;
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

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initHeader();
  animateHeroTitle();
  renderCapabilities();
  renderLogoWall();
  renderWork();
  renderCarousel();
  renderNews();
  renderFAQ();
  initNewsletter();
  initAnimations();
});
