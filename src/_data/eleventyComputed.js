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
  /**
   * BreadcrumbList for the leaf pages. The visible crumbs have existed on
   * eleven pages since August with no structured data behind them.
   *
   * Derived from the paginated item itself rather than from front matter:
   * a nested object under `eleventyComputed` is not a template string, so
   * it never resolves, and the schema silently stayed missing while the
   * front matter looked correct. Reading data.case / data.note /
   * data.service means the trail, the crumb and the schema all come from
   * one source and cannot disagree.
   */
  breadcrumbEntities: (data) => {
    const origin = 'https://creativemk.net';
    const loc = data.L === 'es' ? 'es' : 'en';
    let parent = null;
    let label = null;

    if (data.case) {
      parent = { name: 'Selected work', url: '/work/' };
      label = data.case.en.title;
    } else if (data.note) {
      parent = { name: 'Insights', url: '/insights/' };
      label = data.note.en.title;
    } else if (data.service) {
      parent = loc === 'es'
        ? { name: 'Servicios', url: '/es/servicios/' }
        : { name: 'Services', url: '/services/' };
      label = data.service[loc].title;
    }
    if (!parent || !label || !data.canonical) return null;

    return {
      '@type': 'BreadcrumbList',
      '@id': origin + data.canonical + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: parent.name, item: origin + parent.url },
        { '@type': 'ListItem', position: 2, name: label, item: origin + data.canonical }
      ]
    };
  },

  serviceFaqEntities: (data) => {
    const loc = data.L === 'es' ? 'es' : 'en';
    const faqs = data.service && data.service[loc] && data.service[loc].faqs;
    if (!faqs || !faqs.length) return null;
    return faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }));
  }
};
