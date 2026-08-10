# Direction record — cinematic redesign

Written 2026-08-09, against commit `a04cdbb` on `next`.

This is the document the redesign is designed *against*. It records what was
measured, what was decided, and what is deliberately still open. When a later
change contradicts something here, change this file in the same commit.

---

## 1. How the site deploys

Settled 2026-08-09, after a wrong guess and a push that proved it wrong.

**Host: Cloudflare Pages, project `creative-mk-website`, in the account
`2a432f7e8d56266c9dd713199ecf5b47` (arturo.ordonezv@gmail.com).** It serves both
`creative-mk-website.pages.dev` and the apex `creativemk.net`.

**It is a direct-upload project. It is not connected to GitHub.** The project
reports `production_branch: main`, which is misleading — with no Git source that
field does nothing. Pushing to `main` publishes nothing at all.

This is the whole explanation for the unshipped work: the previous deployment
was a manual upload dated **2026-06-11**, and every commit after it was
invisible to the public until someone uploaded again.

**To publish:**

```bash
npm run verify && npx wrangler pages deploy dist --project-name=creative-mk-website --branch=main
```

`npm run verify` is not optional politeness — it is the only gate between the
working tree and the live site, because there is no CI in front of the upload.

### 1.1 Purge after deploying, and never probe before

The zone's Browser Cache TTL is **14400s (4 hours)** and it overrides the
`Cache-Control` values in `_headers`. Cloudflare also caches the SPA-style
fallback: a request for a file that does not exist yet returns `index.html` with
`200`, and *that* gets cached for four hours under the missing file's URL.

Requesting an asset before it is deployed therefore poisons its cache entry.
This happened on 2026-08-09 to `/css/base.css` — pre-deploy verification
requests cached the HTML fallback, so the edge served `text/html` for a
stylesheet after the real file was live.

**Deploy first, verify second, and purge the zone cache as part of every
release.** Zone id `9c6d17208894937c1c029efaf2e3673e`. The Workers/Pages tokens
do not carry `Zone → Cache Purge`; use the dashboard, or a token that has it.

### 1.2 Netlify is not involved

`netlify.toml` is still tracked at the repo root. It is a leftover and it points
at nothing live. A gitignored `.netlify/` directory was also removed on
2026-08-09 — its `publish` path pointed at **a different client's project**
(`Kevin - Sitio web 3.5 (Codex App)\dist`). Deleting the tracked `netlify.toml`
is now safe; it is left only so the removal is a deliberate commit rather than a
side effect of this one.

**`next` was never blocked.** It built clean and passed every invariant. It had
simply never been merged — and merging it, as it turned out, was not the same as
publishing it.

---

## 2. What ships when `next` reaches `main`

Measured on the built `dist/`, not estimated:

| | Value |
|---|---|
| Homepage critical path | **247 KB** (HTML + 5 CSS + classic JS + Inter woff2) |
| Render-blocking stylesheets | 16 → **5** |
| Fonts | Google Fonts `<link>` → **self-hosted Inter Variable** (48 KB) |
| Images | JPEG only → **AVIF + WebP with `srcset`**, sources excluded from `dist/` |
| Hero | Static → **WebGL shader mesh**, lazily imported behind a triple gate |
| Showreel | Inside the hero → **its own lazily-loaded section** |
| `dist/` total | 17.05 MB |

CSS consolidation was verified by diffing every selector between `main` and
`next`: **exactly one selector was dropped, `.hero__visual`**, and it is dead —
nothing in the HTML, JS or CSS references it. It belonged to the showreel before
the showreel moved out of the hero. No unintended style loss.

---

## 3. The three constraints the redesign has to survive

These are not preferences. Each one is a measured property of this specific site.

### 3.1 WebGL already hit a wall here once

`js/main.js` gates the 3D hero behind three conditions: no `prefers-reduced-motion`,
viewport ≥ 768px, and a **hardware** WebGL2 renderer. The hardware check exists
because CI measured **22 seconds of blocking time** on `index.html` when the
scene rasterised on SwiftShader, against 98 ms on the contact page in the same run.

Consequence: **mobile currently gets no 3D at all.** "More 3D" means widening a
gate that was closed for a measured reason. Any proposal to widen it needs a
number attached, not an intention.

### 3.2 35 elements start invisible and depend on JavaScript to appear

`.reveal` sets `opacity: 0`, and only the `IntersectionObserver` in
`js/animations.js` adds `.revealed`. There are **35 such elements** on the
homepage. If that observer never runs — script error, blocked JS, an unusual
client — the page renders blank below the header.

This is already live and already the design. It becomes materially riskier as
the number of animated elements grows. **Fix this before adding motion, not
after:** the reveal transition should be opt-in via a class the script *adds*
(`js-reveal`), so the no-JS state is visible content rather than an empty page.

### 3.3 Bilingual EN/ES with a runtime text swap

`js/i18n.js` swaps `textContent` in place. `animateHeroTitle()` already
re-splits the `<h1>` into per-word spans on every language change. Spanish runs
roughly 20% longer than English.

Every kinetic-type effect added from here has to survive text changing length
without a reload. Almost none of the award-site references solve this, because
almost none of them are bilingual. Budget for it explicitly.

---

## 4. Stack decision for the homepage

**Decision: keep the homepage static and vanilla. Add GSAP + ScrollTrigger. Do
not migrate it to React.**

Rationale:

- `contact.html` is already client-rendered, and `scripts/check-site.mjs`
  exempts it from heading checks because its static HTML has no content. Making
  the homepage client-rendered would apply that same hole to **the page that
  actually ranks**. The homepage's static HTML is an asset worth keeping.
- Nothing the cinematic direction needs requires a component model. Pinning,
  scrubbing and timeline orchestration are DOM-level concerns; GSAP handles them
  on plain elements.
- GSAP + ScrollTrigger is roughly 70 KB, which fits inside the budget in §5 with
  room to spare. React + a motion library does not.

Honest cost of this decision: the homepage's sections are assembled with
`innerHTML` from data objects in `js/main.js`. That is workable for reveals and
scroll effects, and it gets unpleasant if the design grows shared element
transitions between views. **If that specific requirement appears, revisit this
decision rather than working around it.**

Prerequisite before any of it: §3.2.

---

## 5. Dials and budget

### 5.1 Dials

Using the `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY` vocabulary from
[taste-skill](https://github.com/Leonxlnx/taste-skill), which is useful precisely
because it turns "more show" into three numbers that can be argued about.

| Dial | Today | Target | Why |
|---|---|---|---|
| `DESIGN_VARIANCE` | ~4 | **8** | Asymmetry is free. It is CSS Grid and negative margins: no runtime cost, no i18n risk, no mobile penalty. |
| `MOTION_INTENSITY` | ~3 | **6** | Motion is the expensive axis and the only one that can regress §3.1, §3.2 and §3.3 simultaneously. |
| `VISUAL_DENSITY` | ~4 | **3** | More air. Costs nothing, and it is what reads as expensive. |

The reference preset for "agency / creative landing" is 9 / 8 / 3. We are
deliberately taking the variance and holding back the motion.

**The point worth remembering: variance is free, motion is not.** Most of the
perceived transformation is available on the axis that carries no cost. Spend
there first, and treat every point of motion above 6 as something that has to be
justified against the budget below.

Anything above `MOTION_INTENSITY` 3 must honour `prefers-reduced-motion`. The
global kill switch lives in `css/base.css` and is now enforced (§5.2).

### 5.2 Budget, enforced

`scripts/check-site.mjs` now fails the build on these. They are not advisory.

| Check | Warn | Error | Today |
|---|---|---|---|
| Homepage critical path | 300 KB | 400 KB | **247 KB** |
| Any single video | 6 MB | 10 MB | 5.19 MB |
| `dist/` total | 25 MB | — | 17.05 MB |
| three.js / `hero-3d.js` in a `<script src>` | — | always | passes |
| Global `prefers-reduced-motion: reduce` block | — | if absent | passes |

Ceilings sit above today's numbers on purpose. They are not targets to grow into
— they are the point where a change stops being free and has to be argued for.
Adding GSAP moves the critical path to roughly 320 KB, which trips the warning.
That is intended: it should be a visible decision, not a silent one.

All four guards were verified by deliberately breaking the build and confirming
each one fires.

---

## 6. The thing that matters more than any of this

**All six portfolio entries in `js/main.js` carry `isRealClient: false`** and
render with the label "Capability showcase". The Work section says, in the
site's own words, that these are examples of systems we *can* shape.

Award juries score Content alongside Design and Creativity, and prospective
clients read that label the same way a jury does. A cinematic shell amplifies
whatever is underneath it. Right now what is underneath is hypothetical.

**Two or three real cases with real outcomes will move both the award odds and
the conversion rate further than any amount of shader work.** This is the
sequencing recommendation, and it is not a technical task — it needs client
permission and real numbers, which only CREATIVE MK can supply.

The data structure is already there and already correct: `case.challenge`,
`case.solution`, `case.result`, `case.deliverables`, and the `isRealClient` flag
that drives the label. Filling it in is a content job, not an engineering one.

---

## 7. Open questions

1. **Connect the Pages project to GitHub, or accept manual uploads forever.**
   The direct-upload setup is exactly what let three months of work go
   unpublished (§1). Connecting it to `Arturo-valle/creative-mk-website` with
   build command `npm run build` and output `dist` would make a merge to `main`
   mean something. Until then, releases depend on someone remembering.
2. **Delete `netlify.toml`.** Now safe (§1.2), deliberately left for its own
   commit.
3. **CSP allows Google Fonts that nothing loads.** `_headers` still permits
   `fonts.googleapis.com` in `style-src` and `fonts.gstatic.com` in `font-src`.
   Inter is self-hosted now and a repo-wide search finds no remaining reference
   outside the gitignored `.contact-qa/` prototype. Tightening this is safe and
   was deliberately not bundled with the release, so a rollback stays clean.
4. **Mobile 3D.** Currently excluded entirely (§3.1). Either it stays excluded
   and mobile gets a different treatment designed on purpose, or someone
   measures a cheaper scene on a mid-range Android. Not a decision to make from
   a desktop.
5. **Manual cache-busting** (`?v=20260610-...`) on `ai-concierge.js` and the
   admin assets. Works, but it is a symptom of unversioned assets and
   `check:site` warns about it on every run. Worth resolving before the asset
   count grows.
