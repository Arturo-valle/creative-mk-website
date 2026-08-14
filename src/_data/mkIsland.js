import services from './services.js';
import faq from './faq.js';

/**
 * The JSON island the homepage embeds for js/main.js (#mk-data).
 *
 * One source of truth: the accordion and FAQ render from the same bytes the
 * service pages are built from. Only the fields the homepage actually paints
 * are emitted — the deep page content (deliverables, engagements, per-service
 * FAQs) stays out of the island so index.html does not carry six pages twice.
 */
const pick = (loc) => ({
  title: loc.title,
  lead: loc.lead,
  proof: loc.proof,
  hook: loc.hook || null
});

export default {
  services: services.map((s) => ({
    slug: s.slug,
    media: s.media,
    en: pick(s.en),
    es: pick(s.es)
  })),
  faq
};
