/**
 * The page factory.
 *
 * The August architecture audit found the site's real bottleneck was economic,
 * not creative: with no templating, the header existed in eight hand-maintained
 * copies, so page N+1 cost as much as page 1 — which is why a studio with six
 * services and three written articles shipped six crawlable URLs.
 *
 * Eleventy processes only the hand-authored pages in src/. Everything the
 * browser actually runs — js/, css/, the vendored ogl tree, the GSAP stack —
 * is copied byte-identical by scripts/copy-assets.mjs and never passes through
 * a bundler, so the deferred script ordering and the OGL contour field are
 * exactly what they were. The fingerprint pass runs afterwards and is
 * unchanged.
 *
 * Pipeline: vite (contact island) -> copy-assets -> eleventy -> fingerprint
 *           -> check-site -> wrangler pages deploy.
 */
export default function (eleventyConfig) {
  // .html files are first-class templates, so no page had to be rewritten
  // into a new format to join the factory.
  eleventyConfig.setTemplateFormats(['html', 'njk', 'md']);

  /* JSON-LD must be serialised, never string-interpolated. Building it by
     hand meant Nunjucks' HTML autoescaping ran inside a <script> block, which
     turned an ampersand in "Growth & Marketing" into &amp;amp; in the machine-
     readable payload. This filter emits real JSON and escapes only the one
     sequence that could close the script element early. */
  eleventyConfig.addFilter('jsonld', (value) =>
    JSON.stringify(value, null, 2).replace(/</g, '\\u003c')
  );

  /* Titles and descriptions are plain text in front matter; the head partial
     needs them escaped exactly once. Nunjucks' default autoescape would run a
     second pass over an already-escaped entity. */
  eleventyConfig.addFilter('attr', (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  );

  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: '_includes',
      data: '_data'
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };
}
