# The architecture audit — why it reads as one landing page

Written 2026-08-10, output of a 9-agent pass: two hostile inventories (routes
and copy depth), three benchmarks (top-studio IA fetched live, service-business
funnel patterns, toolchain survey), three critics (information architect,
brutal juror, toolchain lead), one synthesizer. The owner's prompt: "the home
looks like one giant landing page, the sections have no pages, it feels like
something an 8-year-old made." The audit's finding: **he is right, and it is
measurable.**

> **Status 2026-08-10, end of session:** Phases 0-3 are built, verified and
> live. The site went from 6 crawlable URLs to 20. The Eleventy page factory,
> the six service pages, /studio/, /insights/, the two self-owned case
> studies, the trailer homepage, FAQPage schema, content-hash fingerprinting
> and a hardened invariant gate all shipped. Four rounds of specialist
> validation ran against the work; the fact-checkers found seven false
> published figures and one self-contradicting page, all corrected — see the
> commit history. Still deferred and owner-gated: /es/ static mirrors,
> analytics, the two client case pages (need names cleared), and moving the
> contact island into the factory.

## The mechanisms of the feeling

1. **29 of the primary nav+footer links are same-page anchors.** Work points
   at `#work` — a section with zero cards — while a real `/work/` sits one
   directory away. Five of six services in the dropdown resolve to the *same*
   anchor. Navigation that only scrolls is the defining behavior of a landing
   page.
2. **The crawlable site is six URLs**, two of them legal boilerplate. The most
   minimal benchmark studio (Obys, nav = Work + About) ships ~21; Clay — the
   closest commercial comp — ships dozens.
3. **Six sellable services, zero service pages.** `servicesData`
   (js/main.js:5-106) holds six pages' worth of bilingual positioning copy,
   invisible to search, unlinkable in a proposal. The JSON-LD OfferCatalog
   declares six Services with no URL for any of them.
4. **Three complete articles live in modals** labeled "6 min read" on ~110-word
   bodies — a 12×-falsifiable claim on a site whose brand is honesty. The
   "Visit blog" CTA delivers a contact form.
5. **The Spanish half doesn't exist**: zero hreflang, zero `/es/` URLs — a
   "bilingual studio" whose Spanish is a post-JS text swap Google never sees.
6. **Zero analytics** on a studio that sells growth measurement.
7. **Root cause is economic, not creative**: the build is copy+hash with no
   templating; the header exists in 8 hand-maintained variants, so page N+1
   costs as much as page 1. The owner never lacked content; **he lacked a page
   factory.**

## Self-criticism (the sessions' own work)

- Built `/work/` and `/lab/` and left the header nav on anchors — pages nobody
  could reach. Building pages without routing to them spends the effort and
  forfeits the credit.
- Called service pages "content-gated" when the content sat in `servicesData`
  all along. **A structure problem was misdiagnosed as a writing problem.**
- Polished shaders and cache semantics while the IA was the actual bottleneck
  for conversion, SEO, credibility and the awards bid alike.
- Tolerated honesty bugs on an honesty brand: inflated read times, a blog link
  with no blog, two divergent privacy policies.

What stays: the ledger voice, the noindexed LP lane, fingerprinting, the
check-site gate, the motion layer. The verdict builds on them.

## The toolchain decision (one path)

**Eleventy 3.1.x (stable), Nunjucks-processed .html templates.** The ten
existing pages are already valid Eleventy input; the 8 duplicated chrome
blocks become one partial set; `js/`, `css/`, the OGL field and the GSAP stack
pass through byte-identical; the fingerprint pass and check-site stay verbatim
as post-passes; the direct-upload deploy never changes. Astro rejected (script
hoisting endangers the hand-ordered motion stack; every page converts to
.astro; second Vite pipeline). Extending build-pages.mjs rejected (by page 25
it is a private, worse Eleventy — locale pagination is where hand-rolled
scripts die).

- **i18n**: the dictionary becomes an Eleventy data file; locale pagination
  emits `/` and `/es/` pairs with bidirectional hreflang in static HTML;
  runtime i18n demotes to a language switcher.
- **Analytics**: Counterscale self-hosted on the existing Cloudflare account —
  cookieless, no banner, and "we run our own analytics on our own edge" is
  sellable proof for Growth. Conversion truth stays in the D1 capture with a
  new service/source field. Plausible is the named fallback.
- **OG cards**: eleventy-plugin-og-image at build time.
- **Skills**: install nothing third-party; write one project-local `new-page`
  skill encoding the page contract (front matter, both-locale discipline, nav
  partial, verify, deploy).

## The target sitemap (6 → ~38 URLs, ~42 with client cases)

Everything marked **[today]** assembles from content already in the repo.

| Route (EN + /es/ pair) | Source |
|---|---|
| **[today]** `/` trailer (10 jobs → 60-second trailer that routes outward) | existing sections, subtraction |
| **[today]** `/services/` hub + six spokes: websites, ai-automation, branding, growth, product-ux-ui, development | `servicesData` + LP narrative + FAQ timelines |
| **[today]** `/work/` upgraded + `/work/intake-agent/` + `/work/contour-field/` (self-owned, NDA-free cases) | labPage keys, cloudflare/, admin/, repo decision records |
| [owner] `/work/client-case-1..2/` | the redaction bars' promise; needs sign-off |
| **[today]** `/studio/` — names Arturo Valle, tells the ledger story | work.ledger* keys + LP founder line |
| **[today]** `/insights/` + three note pages with honest read times and bylines | `newsData` full bodies |
| **[today]** `/lab/` with full site header (today linked from exactly one place) | existing |
| **[today]** `/contact/`, `/privacy/`+`/es/privacidad/` consolidated, `/terms/` + ES, bilingual 404, generated sitemap, per-page OG | existing + Eleventy |
| [owner] `/lp/sitios-web/` stays noindexed — the paid lane pattern is correct | — |

## Build order (~14 working days)

- **Hour 0 (shipped with this commit):** header Work → `/work/`.
- **Phase 0, days 1–3 — the page factory:** Eleventy spliced before the
  fingerprint pass; acceptance = empty `diff -r` of dist; partials kill the 8
  chrome copies; nav flips to routes in one file; markdown collections +
  generated sitemap.
- **Phase 1, days 4–7 — pages from trapped content:** services hub + six v1
  spokes, `/studio/`, `/insights/` + three notes, work/lab upgrades.
- **Phase 2, days 8–10 — proof and the trailer:** the two self-owned cases,
  then the homepage shrinks LAST (teasers need destinations). This is the step
  that frees the cinematic turn the awards bid needs.
- **Phase 3, days 11–12.5 — the Spanish half exists:** locale pagination,
  hreflang, legal consolidation, `/contact/` routed.
- **Phase 4, days 13–14 — eyes and chrome:** OG cards, two new check-site
  ERRORs (shared-logo og:image; missing hreflang pair), Counterscale + Worker
  conversion events, the `new-page` skill.

In parallel, owner-only: LP integrity decision before next ad spend; deep
service body copy (~8–10k words ×2); studio narrative + photo; two client case
interviews; expanding the three notes. **Everything after day 14 is writing.**

## The three highest feel-per-day moves

1. **Flip the nav to real routes with six v1 service pages behind it** (days
   1–6). Attacks the exact mechanism of the complaint; mostly assembly, not
   writing.
2. **Publish the two self-owned case studies** (~2 days). The index→case spine
   is the one structure every studio shares and a landing page never has. The
   intake agent and this site's own field are complete, redaction-proof cases.
3. **`/studio/` names the founder + the honesty repairs** (~1 day). The
   strongest trust line on the property currently lives on a noindexed ad
   page; the easiest-to-catch lie ("6 min read") prints on every card.
