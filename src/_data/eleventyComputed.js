/**
 * `home` is the prefix an in-page anchor needs to work from wherever the page
 * lives: empty on the homepage (so `#about` stays a same-page jump and the
 * scroll-spy keeps working), `/` everywhere else (so a subpage's "About" link
 * actually travels home first). Without this, shared partials would silently
 * produce dead anchors on every page except one.
 */
export default {
  home: (data) => (data.page && data.page.url === '/' ? '' : '/')
};
