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
