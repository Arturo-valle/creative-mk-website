/* ============================================
   i18n – Internationalization System
   ============================================ */
const translations = {
  en: {
    // Nav
    "nav.work": "Work",
    "nav.services": "Services",
    "nav.about": "About",
    "nav.blog": "Blog",
    "nav.contact": "Contact",
    "nav.webDesign": "Web Design",
    "nav.landingPages": "Landing Pages",
    "nav.salesFunnels": "Sales Funnels",
    "nav.metaAds": "Meta Ads",
    "nav.socialMedia": "Social Media",
    "nav.branding": "Branding",
    "nav.logoCreation": "Logo Creation",
    "nav.brandManual": "Brand Manual",
    "nav.appDev": "App Development",
    "nav.uxui": "UX/UI Design",
    "nav.allServices": "All Services →",
    // Hero
    "hero.title": "CREATIVE MK is a technology-driven digital marketing agency building modern digital systems",
    // Capabilities
    "capabilities.intro": "We specialize in creating comprehensive digital solutions that help businesses grow, sell more and establish a powerful online presence.",
    // AI Automation
    "ai.label": "AI-Powered Solutions",
    "ai.title": "The Future of Digital is Intelligent Automation",
    "ai.text": "We integrate artificial intelligence and automation into every digital system we build — from AI-powered chatbots and dynamic content personalization to automated marketing funnels that work 24/7.",
    "ai.cta": "Explore AI Solutions →",
    "ai.metricResponse": "Response Time",
    "ai.metricTasks": "Tasks Automated",
    "ai.metricROI": "ROI Increase",
    "hero.playBtn": "Play Showreel",
    // Work
    "work.title": "Selected Work",
    "work.viewAll": "View all work",
    // About
    "about.title": "We transform businesses through digital innovation",
    "about.text": "CREATIVE MK is a technology-driven digital marketing agency specialized in creating modern digital systems to help businesses grow, sell more and position themselves online.",
    "about.viewServices": "View our services",
    "about.bottomText": "Our team combines creativity with cutting-edge technology to deliver results that matter. From branding to full-stack development, we are your partner in digital growth.",
    "about.learnMore": "Learn about CREATIVE MK",
    // News
    "news.title": "Featured News",
    "news.visitBlog": "Visit blog",
    // FAQ
    "faq.title": "Frequently Asked Questions",
    // Footer
    "footer.ctaLabel": "Start a project",
    "footer.ctaTitle": "Let's Talk",
    "footer.emailLabel": "New Business",
    "footer.phoneLabel": "Call Us",
    "footer.navigation": "Navigation",
    "footer.services": "Services",
    "footer.office": "Office",
    "footer.address": "Digital-first agency<br>Available worldwide",
    "footer.stayUpdated": "Stay Updated",
    "footer.newsletterText": "Subscribe to our newsletter for the latest insights on digital marketing and design.",
    "footer.emailPlaceholder": "Your email",
    "footer.subscribe": "Subscribe",
    "footer.rights": "All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.subscribeSuccess": "Thanks for subscribing!",
  },
  es: {
    "nav.work": "Proyectos",
    "nav.services": "Servicios",
    "nav.about": "Nosotros",
    "nav.blog": "Blog",
    "nav.contact": "Contacto",
    "nav.webDesign": "Diseño Web",
    "nav.landingPages": "Landing Pages",
    "nav.salesFunnels": "Embudos de Venta",
    "nav.metaAds": "Meta Ads",
    "nav.socialMedia": "Redes Sociales",
    "nav.branding": "Branding",
    "nav.logoCreation": "Creación de Logos",
    "nav.brandManual": "Manual de Marca",
    "nav.appDev": "Desarrollo de Apps",
    "nav.uxui": "Diseño UX/UI",
    "nav.allServices": "Todos los servicios →",
    "hero.title": "CREATIVE MK es una agencia de marketing digital tecnológica que construye sistemas digitales modernos",
    "capabilities.intro": "Nos especializamos en crear soluciones digitales integrales que ayudan a los negocios a crecer, vender más y establecer una presencia online poderosa.",
    "ai.label": "Soluciones con IA",
    "ai.title": "El Futuro Digital es la Automatización Inteligente",
    "ai.text": "Integramos inteligencia artificial y automatización en cada sistema digital que construimos — desde chatbots con IA y personalización dinámica de contenido hasta embudos de marketing automatizados que funcionan 24/7.",
    "ai.cta": "Explorar Soluciones IA →",
    "ai.metricResponse": "Tiempo de Respuesta",
    "ai.metricTasks": "Tareas Automatizadas",
    "ai.metricROI": "Incremento de ROI",
    "hero.playBtn": "Reproducir",
    "work.title": "Proyectos Destacados",
    "work.viewAll": "Ver todos los proyectos",
    "about.title": "Transformamos negocios a través de la innovación digital",
    "about.text": "CREATIVE MK es una agencia de marketing digital tecnológica especializada en crear sistemas digitales modernos para ayudar a negocios a crecer, vender más y posicionarse en internet.",
    "about.viewServices": "Ver nuestros servicios",
    "about.bottomText": "Nuestro equipo combina creatividad con tecnología de vanguardia para entregar resultados que importan. Desde branding hasta desarrollo full-stack, somos tu aliado en el crecimiento digital.",
    "about.learnMore": "Conoce CREATIVE MK",
    "news.title": "Noticias Destacadas",
    "news.visitBlog": "Visitar blog",
    "faq.title": "Preguntas Frecuentes",
    "footer.ctaLabel": "Iniciar un proyecto",
    "footer.ctaTitle": "Hablemos",
    "footer.emailLabel": "Nuevos Negocios",
    "footer.phoneLabel": "Llámanos",
    "footer.navigation": "Navegación",
    "footer.services": "Servicios",
    "footer.office": "Oficina",
    "footer.address": "Agencia digital-first<br>Disponible mundialmente",
    "footer.stayUpdated": "Mantente Informado",
    "footer.newsletterText": "Suscríbete a nuestro newsletter para las últimas novedades en marketing digital y diseño.",
    "footer.emailPlaceholder": "Tu email",
    "footer.subscribe": "Suscribirse",
    "footer.rights": "Todos los derechos reservados.",
    "footer.privacy": "Política de Privacidad",
    "footer.terms": "Términos de Servicio",
    "footer.subscribeSuccess": "¡Gracias por suscribirte!",
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
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
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-switch').forEach(sw => {
    sw.querySelectorAll('.lang-switch__btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  });
  // Reset accordion tracking before re-render
  if (typeof resetAccordion === 'function') {
    resetAccordion('#capabilities-list');
    resetAccordion('#faq-list');
  }
  // Re-render dynamic sections
  if (typeof renderCapabilities === 'function') renderCapabilities();
  if (typeof renderWork === 'function') renderWork();
  if (typeof renderNews === 'function') renderNews();
  if (typeof renderFAQ === 'function') renderFAQ();
  // Re-animate hero title with new language text
  if (typeof animateHeroTitle === 'function') animateHeroTitle();
}

function initI18n() {
  document.querySelectorAll('.lang-switch__btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
}
