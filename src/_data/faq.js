/**
 * The FAQ, lifted out of js/main.js.
 *
 * Five question/answer pairs in both languages — the richest long-tail text on
 * the site and the only place that states a real timeline commitment. They
 * rendered client-side into an accordion with no schema, so they earned
 * nothing. Now they also become FAQPage structured data.
 */
const faq = {
  "en": [
    {
      "q": "What services does CREATIVE MK offer?",
      "a": "We work across branding, websites, digital product UX/UI, growth and marketing systems, development, and practical AI automation. The goal is to connect the pieces that shape how a business is understood, trusted, and contacted."
    },
    {
      "q": "Are the projects shown real client case studies?",
      "a": "Client work is only published with a name and an agreed figure, and two engagements are signed but not yet publishable. The two cases open today are the studio's own, labelled as self-initiated. Two signed projects are waiting on their client to approve a name and a figure, and until then they are counted but not shown. Nothing invented stands in for them."
    },
    {
      "q": "Can you redesign an existing website or brand?",
      "a": "Yes. We can audit the current experience, preserve what is working, rebuild weak sections, and turn the brand, site, and follow-up path into a clearer system."
    },
    {
      "q": "How do you approach AI automation?",
      "a": "We begin with a workflow, not a tool. Useful starting points include lead intake, service matching, first response, knowledge bases, dashboards, and follow-up prompts with a clear human handoff."
    },
    {
      "q": "How long does a typical project take?",
      "a": "A focused landing page or audit can take 1-2 weeks, a full website often takes 4-8 weeks, and deeper brand, product, or automation systems usually take 4-10 weeks depending on scope."
    }
  ],
  "es": [
    {
      "q": "¿Qué servicios ofrece CREATIVE MK?",
      "a": "Trabajamos branding, sitios web, producto digital UX/UI, sistemas de growth y marketing, desarrollo y automatización práctica con IA. El objetivo es conectar las piezas que hacen que un negocio se entienda, genere confianza y reciba mejores contactos."
    },
    {
      "q": "¿Los proyectos mostrados son casos reales de clientes?",
      "a": "Sí, es lo único que admite la sección de trabajo. Hay dos proyectos firmados esperando a que el cliente apruebe nombre y cifra; hasta entonces se cuentan pero no se enseñan. No hay nada inventado ocupando su lugar."
    },
    {
      "q": "¿Pueden rediseñar un sitio o marca existente?",
      "a": "Sí. Podemos auditar la experiencia actual, conservar lo que funciona, reconstruir secciones débiles y convertir marca, sitio y seguimiento en un sistema más claro."
    },
    {
      "q": "¿Cómo integran automatización con IA?",
      "a": "Empezamos con un flujo, no con una herramienta. Los mejores puntos de inicio suelen ser recepción de leads, recomendación de servicio, primera respuesta, bases de conocimiento, dashboards y prompts de seguimiento con entrega clara a una persona."
    },
    {
      "q": "¿Cuánto tiempo toma un proyecto?",
      "a": "Una landing o auditoría enfocada puede tomar 1-2 semanas, un sitio completo suele tomar 4-8 semanas y sistemas más profundos de marca, producto o automatización pueden tomar 4-10 semanas según el alcance."
    }
  ]
};

export default faq;
