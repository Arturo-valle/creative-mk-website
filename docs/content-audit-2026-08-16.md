# The content audit — August 2026

> **Status 2026-08-16:** the engine is in the build (`npm run audit`, and
> `--emit` inside `npm run build`). Site content score **72.5 → 88.6**. High
> technical findings **17 → 0**, high content findings **24 → 0**. What remains
> open is owner-gated and listed at the bottom; none of it is engineering.

`docs/audit-2026-08.md` asked whether the site was good enough to be judged.
This one asks a narrower question the first could not: *is any individual page
good enough to rank, and how would we know?* `scripts/check-site.mjs` answers
"is anything broken" — a pass/fail gate on invariants. Nothing scored the
writing.

## Where the method came from

Three open-source SEO tools, adapted to run with no network and no API keys,
because an audit that needs a credential is an audit nobody runs twice.

| Source | What was taken | What was substituted, and why |
|---|---|---|
| [sharozdawa/content-optimizer](https://github.com/sharozdawa/content-optimizer) | The 7-category, 100-point rubric: keyword usage 20, word count 15, headings 15, readability 15, entities 15, depth 10, structure 10. Kept verbatim. | It benchmarks length against the live SERP average via SerpApi. There is no SERP here, so each page type carries a floor and a target declared in `TYPE_SPEC` — editorial decisions, written where they can be argued with, not measurements pretending to be one. |
| [every-app/open-seo](https://github.com/every-app/open-seo) | The technical site audit: hreflang reciprocity, canonical self-reference, orphans, click depth, anchor quality, schema and social coverage, sitemap parity. | It is a DataForSEO client. Everything reproduced here is computable from `dist/` alone; nothing needing external rank data was faked. |
| [hilmanski/contentswift](https://github.com/hilmanski/contentswift) | Entity/topic gap analysis. | The original scrapes competitors to find what they cover and you do not. There are no competitors to scrape offline, so the idea is turned inward: the site declares a vocabulary in `src/_data`, and each page is measured against the entities *its own type* promises to name. |

Two checks are this site's own, added because reading found what the rubric
could not: **scent** (does the title share a content word with the H1, so the
click and the landing describe the same page) and **language** (does the
document's declared `lang` match the language it is written in).

## What the first run found

The same defect from four directions, and it was architectural: **`/es/` did
not exist.**

Everything else followed from it. The homepage declared no hreflang, because
it had no sibling to declare. The language control was two `<button>`s, which
no crawler presses, so seventeen Spanish URLs had no crawlable edge from the
English tree at all — discoverable only through the sitemap. The header logo
sent a Spanish reader to an English homepage. The footer, the densest link
block on the page, routed all eighteen of its links into English from both
languages, under English headings. The sitemap filtered `/es/` out by rule and
emitted `/` with no alternates.

Under that sat ordinary thinness: two of the three notes were 121 and 136 words
against a 700-word floor, the studio page was 242 words and never named one of
the six services it exists to sell, and the WebGL case was titled "The field
behind this page", which tells a reader and a crawler nothing about what it is.

And one drift bug the audit did not catch but the work exposed: the static
markup and `js/i18n.js` disagreed on four link labels. "See the ledger" shipped
on load and "Start a project" shipped after any language round trip. Both were
live at once.

## What changed

- **`/es/` exists.** The homepage body moved into `src/_includes/home-body.njk`
  and builds in both languages from `src/_data/homeCopy.js`.
- **The chrome is locale-aware.** Header, footer, nav labels, logo and legal
  links all resolve at build time, so the anchor text a crawler reads on a
  Spanish page is Spanish. The language control is an `<a href>` wherever a
  sibling document exists.
- **The two thin notes were written properly**, in both languages, every figure
  in them checkable in this repository.
- **The studio, lab, service-index and both case pages were deepened**, and both
  cases gained the section that was missing: what shipped broken.
- **The colophon** — see `src/_includes/colophon.njk`. Every page now prints the
  figures it was measured on, stamped from the audit's own payload so nothing
  is measured twice.

## The engine audited itself, repeatedly

Nine findings turned out to be defects in the instrument, not the site, and
were fixed there rather than by changing the site to satisfy a bad rule. They
are recorded because the same class of mistake will recur:

1. `ProfessionalService` already satisfies `Organization` by subtype; demanding
   the literal string would have pushed the site to ship a weaker, redundant
   type.
2. A homepage is not orphaned for lacking in-body inbound links — it is what
   other pages are reached *from*.
3. Readability was measured over `<dt>`/`<dd>` cells with no terminal
   punctuation, concatenating "Team 1 plus specialists per project" into a
   46-word "sentence". It now reads paragraphs only.
4. Bare figures in a ledger cell were invisible to a regex requiring a unit.
5. Each case was measured against the union of both cases' stacks — two pages
   penalised for not being each other.
6. Each service page was measured against all six services' deliverables, so
   the AI Automation page was marked down for never naming "Positioning brief".
7. Notes were expected to name all six services, which is a request for keyword
   stuffing in an essay. They now need one.
8. A homepage's target term was inferred from the opening words of its H1,
   producing a phantom: "lead the title with *digital experiences for brands*".
   A homepage ranks for the brand.
9. Function words like "para" could fail a coverage test, so a slug demanded a
   word no headline will ever be built around.

**This is the audit's biggest structural weakness and it should be stated
plainly: the engine was modified by the same hand whose work it scores.** Each
change above is defensible on its own; the pattern is a conflict of interest.
The mitigation is that every threshold and expectation is a named constant with
its reasoning in a comment beside it, so a reader can restore the original and
recompute. Anyone auditing this audit should start there.

### A known defect, not yet fixed

The `language` check compares function-word frequency across the whole body and
fires above 45%. Both `/privacy/` and `/terms/` are bilingual single documents
sitting at 37% and 47%, so the threshold lands inside the noise: the check
reported `/privacy/` until an English paragraph was added to it, after which it
reported `/terms/` instead. It should detect a contiguous run in the other
language, not an aggregate ratio.

## Still open, and all of it owner-gated

- **Two Spanish privacy notices exist with different content.** The Spanish half
  of `/privacy/` and the whole of `/privacidad/` say different things about
  retention, marketing email and what is collected. `/privacidad/` was written
  for the `/lp/` funnel and still styles itself with `css/lp.css`. Which text
  is authoritative is a legal decision, not a build step, so nothing was merged.
- **`/privacy/` and `/terms/` are bilingual single documents** declared
  `lang="en"`. A screen reader pronounces half of each with the wrong phonemes.
  Splitting them means deciding the canonical Spanish text — see above.
- **`/terms/` has no Spanish sibling** and therefore no hreflang. A
  machine-translated contract is worse than an English one; the footer link is
  marked `hreflang="en"` and says so.
- Analytics is still absent (`docs/direction.md` §6.1), so none of this is
  measurable against behaviour yet.
