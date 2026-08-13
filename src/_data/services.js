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
const services = [
  {
    slug: 'branding',
    esSlug: 'branding',
    index: 0,
    en: {
      title: 'Branding',
      lead: 'Identity and positioning',
      desc: 'We define the promise, voice, visual identity, offer architecture, and brand rules that help a business feel consistent across website, ads, content, sales materials, and future campaigns.',
      proof: 'Best for new brands, premium repositioning, service businesses, and teams that need trust before scaling attention.',
      tags: ['Strategy', 'Identity', 'Guidelines']
    },
    es: {
      title: 'Branding',
      lead: 'Identidad y posicionamiento',
      desc: 'Definimos promesa, voz, identidad visual, arquitectura de oferta y reglas de marca para que el negocio se sienta consistente en sitio web, anuncios, contenido, ventas y futuras campañas.',
      proof: 'Ideal para marcas nuevas, reposicionamientos premium, negocios de servicio y equipos que necesitan confianza antes de escalar la atención.',
      tags: ['Estrategia', 'Identidad', 'Guías']
    }
  },
  {
    slug: 'websites',
    esSlug: 'sitios-web',
    index: 1,
    en: {
      title: 'Websites',
      lead: 'Marketing site',
      desc: 'We design and build editorial, conversion-aware websites with clear messaging, UX structure, service pathways, proof blocks, SEO foundations, and a contact flow that respects the buyer.',
      proof: 'Best for service brands, expert firms, local leaders, and companies whose current site does not explain the offer fast enough.',
      tags: ['UX', 'Copy', 'SEO']
    },
    es: {
      title: 'Sitios Web',
      lead: 'Sitio de marketing',
      desc: 'Diseñamos y construimos sitios editoriales orientados a conversión, con mensaje claro, estructura UX, rutas de servicio, bloques de prueba, bases SEO y un contacto respetuoso para el comprador.',
      proof: 'Ideal para marcas de servicio, firmas expertas, líderes locales y empresas cuyo sitio actual no explica la oferta con suficiente rapidez.',
      tags: ['UX', 'Copy', 'SEO']
    }
  },
  {
    slug: 'product-ux-ui',
    esSlug: 'producto-digital-ux-ui',
    index: 2,
    en: {
      title: 'Digital Product UX/UI',
      lead: 'Product experience',
      desc: 'We map product journeys, dashboards, portals, onboarding flows, and app interfaces so complex actions feel clear before a team commits to a build.',
      proof: 'Best for SaaS ideas, internal tools, client portals, MVPs, and businesses with a workflow that needs a better interface.',
      tags: ['Flows', 'Prototype', 'Design System']
    },
    es: {
      title: 'Producto Digital UX/UI',
      lead: 'Experiencia de producto',
      desc: 'Mapeamos journeys, dashboards, portales, onboarding e interfaces de app para que acciones complejas se entiendan antes de comprometer al equipo con el desarrollo.',
      proof: 'Ideal para ideas SaaS, herramientas internas, portales de cliente, MVPs y negocios con procesos que necesitan una mejor interfaz.',
      tags: ['Flujos', 'Prototipo', 'Sistema UI']
    }
  },
  {
    slug: 'growth',
    esSlug: 'growth-marketing',
    index: 3,
    en: {
      title: 'Growth & Marketing',
      lead: 'Campaign system',
      desc: 'We shape landing pages, funnels, Meta campaigns, content rhythms, tracking, and follow-up paths so attention has somewhere useful to go.',
      proof: 'Best when the offer is clear enough to test traffic, capture demand, and learn from real audience signals.',
      tags: ['Offer', 'Traffic', 'Follow-up']
    },
    es: {
      title: 'Growth & Marketing',
      lead: 'Sistema de campaña',
      desc: 'Damos forma a landing pages, embudos, campañas Meta, ritmos de contenido, medición y rutas de seguimiento para que la atención tenga un siguiente paso útil.',
      proof: 'Ideal cuando la oferta ya está lo suficientemente clara para probar tráfico, capturar demanda y aprender de señales reales de audiencia.',
      tags: ['Oferta', 'Tráfico', 'Seguimiento']
    }
  },
  {
    slug: 'ai-automation',
    esSlug: 'automatizacion-ia',
    index: 4,
    en: {
      title: 'AI Automation',
      lead: 'Workflow intelligence',
      desc: 'We connect intake, service matching, first-response support, knowledge bases, dashboards, and follow-up rules so teams respond faster without losing human control.',
      proof: 'Best for businesses with repeated questions, slow lead handoff, manual reporting, or operations that need a cleaner first layer.',
      tags: ['Intake', 'Routing', 'Dashboards']
    },
    es: {
      title: 'Automatización IA',
      lead: 'Inteligencia operativa',
      desc: 'Conectamos recepción de leads, recomendación de servicios, primera respuesta, bases de conocimiento, dashboards y reglas de seguimiento para responder más rápido sin perder control humano.',
      proof: 'Ideal para negocios con preguntas repetidas, traspaso lento de leads, reportes manuales u operaciones que necesitan una primera capa más clara.',
      tags: ['Recepción', 'Rutas', 'Dashboards']
    }
  },
  {
    slug: 'development',
    esSlug: 'desarrollo',
    index: 5,
    en: {
      title: 'Development',
      lead: 'Reliable build',
      desc: 'We turn approved strategy and UX into responsive pages, front-end systems, forms, analytics, integrations, and lightweight app experiences that are ready to use.',
      proof: 'Best when the brand, website, product screen, form, CRM, and automation need to work together instead of living as separate pieces.',
      tags: ['Frontend', 'Forms', 'Integrations']
    },
    es: {
      title: 'Desarrollo',
      lead: 'Construcción confiable',
      desc: 'Convertimos estrategia y UX aprobadas en páginas responsivas, sistemas front-end, formularios, analítica, integraciones y experiencias ligeras de app listas para usar.',
      proof: 'Ideal cuando marca, sitio, pantalla de producto, formulario, CRM y automatización deben trabajar juntos en lugar de vivir como piezas separadas.',
      tags: ['Frontend', 'Formularios', 'Integraciones']
    }
  }
];

export default services;
