# The content audit — August 2026

> **Status 2026-08-16, after an adversarial review.** The engine is in the
> build (`npm run audit`, and `--emit` inside `npm run build`).
>
> | | |
> |---|---|
> | Site content score | **72.5 → 87.2** |
> | …of which content work | **+8.4** (72.5 → 80.9, measured under the original thresholds) |
> | …of which instrument corrections | **+6.3** (80.9 → 87.2) |
> | High technical findings | **17 → 2** |
> | High content findings | **68 → 3** |
>
> Every remaining high finding is either owner-gated or a disagreement left
> standing on purpose; both are listed at the bottom.
>
> An earlier version of this header claimed **88.6**, and **17 → 0** technical
> and **24 → 0** content findings. All three were wrong. The score included
> four threshold loosenings that have since been reverted; the technical count
> was never zero — every build printed one; and the content baseline was 68,
> not 24. §"What the review found" records how.

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
   stuffing in an essay. (The first fix over-corrected to "one is enough, full
   marks"; see the review section below. It is now a proportional floor of two.)
8. A homepage's target term was inferred from the opening words of its H1,
   producing a phantom: "lead the title with *digital experiences for brands*".
   A homepage ranks for the brand.
9. Function words like "para" could fail a coverage test, so a slug demanded a
   word no headline will ever be built around.

**This is the audit's biggest structural weakness: the engine was modified by
the same hand whose work it scores.** The mitigation offered here was that every
threshold is a named constant with its reasoning beside it, so a reader can
restore the original and recompute.

## What the review found

Someone did exactly that. An adversarial arbiter rebuilt each intermediate
state and ran the original engine against the current content. The results are
recorded here rather than quietly absorbed.

**The score.** Under the original thresholds the current content scores **80.9**,
not 88.6. So of the claimed +16.1, **+8.4 is content work and +7.7 was the
scorer**. About 5 points of that was legitimate measurement fixes (items 1-9
above); the rest was threshold loosening. At the single worst commit, `699f270`,
**79% of the score gain and 100% of the "high findings → 0" claim came from
editing the rules**, not the pages.

**Four changes were missing from the list of nine above** — and they were
precisely the four that loosened a threshold rather than fixing a measurement:
the homepage floor lowered from 450/900 to 350/600; the legal floor lowered from
300 to 120, a number whose only property is that it sits just under
`/privacidad/`'s 156 words; a homepage H1 exemption stacked on top of already
redefining the homepage's target term; and the vague-heading check narrowed to
H2 only. **All four are reverted.** The findings they suppressed are live again,
including two this document disagrees with, which is the right place for a
disagreement.

**A fifth change was over-corrected rather than undisclosed.** Exempting notes
from naming all six services was fair; implementing it as "one is enough,
score 15/15" was not — it made a 15-point category incapable of losing a point
on any page in the site. It now scores proportionally against a floor of two.

**Three defects in the instrument, found by the review:**

- The link graph appended a trailing slash to every extensionless path, so
  `/contact` never resolved and **every body link to the contact page was
  dropped** — 26 of 37 scored pages, silently under-counted, including in the
  figure the colophon publishes.
- The colophon kept its own reading-ease band table with different cut points
  from the auditor's, so the report called the homepage "demanding" while the
  homepage printed "hard" about the same number. One table now, emitted with
  the score.
- `notes.js` derived the Spanish reading time from the English word count, so a
  Spanish note showed "4 min" above a colophon saying 5 — under a file comment
  promising the label can never drift from the text. Per-locale now. The
  colophon's reading-time row was removed outright: it measures the rendered
  page while the badge measures the article, and two honest numbers under one
  label is the contradiction the block exists to prevent.

**And three published figures were wrong**, on a site whose whole argument is
that its claims are checkable:

- **The byte comparison mixed compression bases.** Measured independently: the
  OGL closure is 36.4 KiB gzip -9 / 30.6 KiB brotli; three.js is 183.0 KiB gzip
  / 151.0 KiB brotli. The published "31 KB against 184 KB, **both gzipped**"
  was brotli against gzip, and the "−152 KB" headline matched no basis at all.
  Now stated on one basis, with the other published beside it.
- **"4 stations" counted circles in a diagram.** The word "station" appears zero
  times in `cloudflare/agent/src/`. The four moves are real as behaviour; the
  unit was invented. The headline figure is now one that was verified.
- **"0 render-blocking scripts, site-wide"** is true of script *files* and not
  of the inline reveal bootstrap in every `<head>`. Qualified.

## A known defect, now fixed

The `language` check compared function-word frequency across the whole body and
fired above 45%. Both `/privacy/` and `/terms/` are bilingual single documents
sitting at 37% and 47%, so the threshold landed inside the noise — and the very
commit that added the check also added an English paragraph to `/privacy/`,
pushing it under and silencing the finding it was written to catch. It now
detects a run of three or more consecutive blocks in the other language, and
reports both pages.

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
