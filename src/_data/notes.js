/**
 * The three notes, promoted out of modals.
 *
 * These were complete articles in `newsData` (js/main.js) that opened in a
 * modal with no URL — unshareable, unindexable, unrankable — under a "6 min
 * read" label on bodies of 92, 104 and 89 words. On a site whose entire brand
 * is "we only publish what we can prove", that label was the easiest-to-catch
 * lie on the property.
 *
 * They are notes, and they say so. `minutes` is computed from the real word
 * count at 230 wpm, so the label can never drift from the text again.
 */
const raw = [
  {
    slug: 'ai-for-service-businesses',
    en: {
      category: 'AI',
      title: 'Where AI actually helps a service business',
      date: 'May 2026',
      content: `Most service businesses do not need a custom model. They need the first five minutes after a lead arrives to stop being manual.\n\nThe useful surface is narrow and unglamorous: intake that captures the real question, routing that matches it to the right service, a first response that is accurate rather than fast-and-wrong, and a clean handoff to a person with the context already attached.\n\nEverything beyond that is usually a dashboard nobody opens. Start where the delay is, not where the demo is.`
    },
    es: {
      category: 'IA',
      title: 'Dónde ayuda realmente la IA en un negocio de servicios',
      date: 'Mayo 2026',
      content: `La mayoría de los negocios de servicios no necesita un modelo propio. Necesita que los primeros cinco minutos tras la llegada de un lead dejen de ser manuales.\n\nLa superficie útil es estrecha y poco glamorosa: una recepción que capture la pregunta real, una ruta que la empareje con el servicio correcto, una primera respuesta que sea precisa antes que rápida, y una entrega limpia a una persona con el contexto ya adjunto.\n\nTodo lo demás suele ser un dashboard que nadie abre. Empieza donde está la demora, no donde está la demo.`
    }
  },
  {
    slug: 'premium-website-trust',
    en: {
      category: 'Web',
      title: 'What makes a premium service website feel trustworthy',
      date: 'April 2026',
      content: `Premium sites do not win by adding decoration. They win by creating clarity: a strong promise, precise service paths, proof, rhythm, fast loading, and a contact experience that respects the buyer.\n\nThe best service sites feel editorial and operational at the same time. They are beautiful, but every section has a job: explain, reduce doubt, show proof, or move the visitor toward a clear next step.\n\nIf a person cannot tell who the brand helps, what changes, and why to trust it within the first moments, the design is carrying too much weight and the message needs better structure.`
    },
    es: {
      category: 'Web',
      title: 'Qué hace que un sitio premium genere confianza',
      date: 'Abril 2026',
      content: `Los sitios premium no ganan por agregar decoración. Ganan por crear claridad: una promesa fuerte, rutas precisas de servicio, prueba, ritmo, carga rápida y un contacto que respeta al comprador.\n\nLos mejores sitios de servicio se sienten editoriales y operativos al mismo tiempo. Son bellos, pero cada sección tiene una función: explicar, reducir dudas, mostrar prueba o mover al visitante hacia un siguiente paso claro.\n\nSi una persona no entiende a quién ayuda la marca, qué cambia y por qué confiar durante los primeros momentos, el diseño está cargando demasiado peso y el mensaje necesita mejor estructura.`
    }
  },
  {
    slug: 'funnels-and-brand-systems',
    en: {
      category: 'Growth',
      title: 'Why funnels fail when the brand system is weak',
      date: 'March 2026',
      content: `A funnel cannot repair a weak promise. Paid traffic, landing pages and automation all work better when the audience understands quickly who the brand helps, what changes, and why to trust it.\n\nA strong growth system connects positioning, creative, landing experience, follow-up and measurement. When those parts are designed separately, the campaign becomes harder to test because every step speaks with a different voice.\n\nBrand strategy is not visual finish. It is the operating logic that helps every ad, page, email and sales conversation point the same way.`
    },
    es: {
      category: 'Growth',
      title: 'Por qué los embudos fallan cuando la marca es débil',
      date: 'Marzo 2026',
      content: `Un embudo no puede reparar una promesa débil. La pauta, las landing pages y la automatización funcionan mejor cuando la audiencia entiende rápido a quién ayuda la marca, qué cambia y por qué confiar.\n\nUn sistema de crecimiento fuerte conecta posicionamiento, creatividad, experiencia de landing, seguimiento y medición. Si esas partes se diseñan por separado, la campaña se vuelve más difícil de probar porque cada paso usa un mensaje distinto.\n\nLa estrategia de marca no es solo acabado visual. Es la lógica operativa que ayuda a que cada anuncio, página, correo y conversación comercial apunte en la misma dirección.`
    }
  }
];

/** Honest reading time, derived — never typed. */
const WPM = 230;
export default raw.map((note) => {
  const words = note.en.content.split(/\s+/).filter(Boolean).length;
  return {
    ...note,
    words,
    minutes: Math.max(1, Math.round(words / WPM)),
    paragraphs: {
      en: note.en.content.split('\n\n'),
      es: note.es.content.split('\n\n')
    }
  };
});
