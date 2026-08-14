/**
 * `home` is the prefix an in-page anchor needs to work from wherever the page
 * lives: empty on the homepage (so `#about` stays a same-page jump and the
 * scroll-spy keeps working), `/` everywhere else (so a subpage's "About" link
 * actually travels home first). Without this, shared partials would silently
 * produce dead anchors on every page except one.
 */
export default {
  home: (data) => (data.page && data.page.url === '/' ? '' : '/'),

  /**
   * A service page's own FAQPage entities, derived from the same array the
   * template renders. Computed rather than written into front matter so the
   * two cannot drift: delete a question from services.js and it leaves the
   * schema in the same build.
   */
  serviceFaqEntities: (data) => {
    const faqs = data.service && data.service.en && data.service.en.faqs;
    if (!faqs || !faqs.length) return null;
    return faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }));
  }
};
