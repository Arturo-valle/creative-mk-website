/**
 * The link graph between the three silos.
 *
 * The IA audit found services, work and insights sealed off from each other:
 * no service page linked a case, no case named the services it demonstrates,
 * no note pointed at the service it argues for. Each silo looped inside
 * itself, which is what makes distinct URLs read as anchors on one page —
 * and it meant /services/ai-automation/ did not link /work/intake-agent/,
 * which is that exact service, built by this studio, running on this site.
 *
 * Relations are declared once here and consumed by every leaf template, so a
 * new case or note joins the graph by adding a line, not by editing three
 * templates. Truthful by construction: only pairs that genuinely demonstrate
 * each other are listed, which is why branding and product-ux-ui have no
 * case — the studio has not published one, and inventing the link would be
 * the same lie as inventing the case.
 */

/** service slug → { cases: [caseSlug], notes: [noteSlug] } */
export const byService = {
  branding: { cases: [], notes: ['funnels-and-brand-systems'] },
  websites: { cases: ['contour-field'], notes: ['premium-website-trust'] },
  'product-ux-ui': { cases: [], notes: ['premium-website-trust'] },
  growth: { cases: [], notes: ['funnels-and-brand-systems'] },
  'ai-automation': { cases: ['intake-agent'], notes: ['ai-for-service-businesses'] },
  development: { cases: ['intake-agent', 'contour-field'], notes: [] }
};

/** case slug → service slugs it demonstrates */
export const byCase = {
  'intake-agent': ['ai-automation', 'development'],
  'contour-field': ['websites', 'development']
};

/** note slug → the service it argues for */
export const byNote = {
  'ai-for-service-businesses': 'ai-automation',
  'premium-website-trust': 'websites',
  'funnels-and-brand-systems': 'growth'
};

export default { byService, byCase, byNote };
