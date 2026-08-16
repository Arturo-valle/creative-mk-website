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
   * The homepage FAQ in schema.org shape, in the language of the document.
   *
   * This was a global data file that hardcoded `faq.en.slice(0, 3)`. That was
   * correct while English was the only homepage; the day /es/ shipped it would
   * have declared three English questions over a page showing three Spanish
   * ones — schema contradicting the rendered content, which is the one thing
   * structured data must never do. Computed here because only a computed value
   * can see `L`.
   *
   * Still sliced to three, because three is what the accordion renders.
   */
  faqEntities: (data) => {
    const loc = data.L === 'es' ? 'es' : 'en';
    const items = (data.faq && data.faq[loc]) || [];
    return items.slice(0, 3).map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }));
  },

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
  /**
   * ItemList for the three index pages, in both languages.
   *
   * The indexes declared CollectionPage and Blog — correct, and silent about
   * what they actually list. An ItemList names the members in order, which is
   * what lets a SERP show the list rather than a single blue link, and it is
   * derived from the same arrays the page renders so it cannot list a page
   * that is not there.
   */
  collectionListSchema: (data) => {
    const origin = 'https://creativemk.net';
    const url = data.page && data.page.url;
    if (!url) return null;
    const es = data.L === 'es';
    const loc = es ? 'es' : 'en';

    let items = null;
    let name = null;
    if (url === '/services/' || url === '/es/servicios/') {
      name = es ? 'Servicios' : 'Services';
      items = data.services.map((s) => ({
        url: `${origin}${es ? '/es/servicios/' + s.esSlug : '/services/' + s.slug}/`,
        label: s[loc].title
      }));
    } else if (url === '/work/' || url === '/es/trabajo/') {
      name = es ? 'Trabajo seleccionado' : 'Selected work';
      items = data.cases.map((c) => ({
        url: `${origin}${es ? '/es/trabajo/' + c.esSlug : '/work/' + c.slug}/`,
        label: c[loc].title
      }));
    } else if (url === '/insights/' || url === '/es/notas/') {
      name = es ? 'Notas' : 'Insights';
      items = data.notes.map((n) => ({
        url: `${origin}${es ? '/es/notas/' + n.esSlug : '/insights/' + n.slug}/`,
        label: n[loc].title
      }));
    }
    if (!items || !items.length) return null;

    return {
      '@type': 'ItemList',
      '@id': origin + url + '#list',
      name,
      numberOfItems: items.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        url: item.url
      }))
    };
  },

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
