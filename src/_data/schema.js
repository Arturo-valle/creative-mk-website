import services from './services.js';

/**
 * The studio node, in one place.
 *
 * Every page used to reference `{"@id": "https://creativemk.net/#studio"}`
 * without that node existing in its own graph — a dangling pointer on twelve
 * pages, because a consumer parsing one document has no way to resolve an @id
 * declared in another. Each page now embeds this stub alongside its own node,
 * which is what the homepage's full graph and contact.html already did.
 *
 * It also carries the OfferCatalog, so the six services are finally declared
 * with the URLs that now exist — the exact defect the whole rebuild was for.
 */
export const studio = {
  '@type': 'ProfessionalService',
  '@id': 'https://creativemk.net/#studio',
  name: 'CREATIVE MK',
  url: 'https://creativemk.net/',
  logo: 'https://creativemk.net/Logos/logo-dark.png',
  email: 'hey@creativemk.net',
  areaServed: 'Worldwide',
  availableLanguage: ['en', 'es'],
  knowsLanguage: ['en', 'es'],
  founder: { '@type': 'Person', name: 'Arturo Valle' }
};

export const studioFull = {
  ...studio,
  image: 'https://creativemk.net/Logos/logo-dark.png',
  description:
    'Bilingual digital studio shaping brand identity, UX/UI, websites, growth systems, development, and practical AI automation into one coherent presence.',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Capabilities',
    itemListElement: services.map((service) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        '@id': `https://creativemk.net/services/${service.slug}/#service`,
        name: service.en.title,
        url: `https://creativemk.net/services/${service.slug}/`
      }
    }))
  }
};

export default { studio, studioFull };
