# Direction record — cinematic redesign

Written 2026-08-09, against commit `a04cdbb` on `next`.

This is the document the redesign is designed *against*. It records what was
measured, what was decided, and what is deliberately still open. When a later
change contradicts something here, change this file in the same commit.

---

## 1. Where the site actually deploys — UNRESOLVED

This is the reason three months of work sat unpublished, and it is still not
answered. Read this section before trying to publish anything.

**What is established:**

- `main` was fast-forwarded onto `next` and pushed on 2026-08-09.
  `origin/main` is at `d2304a2`.
- **That push did not deploy anything.** The live site was unchanged twenty
  minutes later, still serving the 2026-06-11 build (16 stylesheets, Google
  Fonts, no WebGL hero). **There is no Git-connected auto-deploy on `main`.**
- The origin honours `_headers`: the CSP served live matches the `_headers`
  restored in `fb6110e` as part of the June 11 production build. That narrows
  the host to one that supports `_headers` — Netlify or Cloudflare Pages — and
  rules nothing else in.
- `creativemk.net` sits behind Cloudflare's proxy (`Server: cloudflare`), but
  that only describes DNS, not where the files are served from.

**What could not be established from here:**

- No Pages project serving `creativemk.net` appears in the account the local
  `wrangler` token can read (`6b110c77…`). But `cloudflare/agent/wrangler.jsonc`
  declares a **different** account (`2a432f7e…`), and the token cannot enumerate
  it. So the Pages hypothesis is neither confirmed nor excluded.
- `netlify.toml` is tracked at the repo root with `publish = "dist"` and
  `command = "npm run build"`. It may be the live path, or a leftover from
  before a migration. Unknown.

**An earlier version of this document asserted "Cloudflare Pages, building from
`main`". That was an inference from the `_headers` match, and `_headers` is
shared syntax between Netlify and Pages. It was not evidence. The push proved
it wrong.**

**Next step, and it needs a human with dashboard access:** open the Cloudflare
and Netlify dashboards for `creativemk.net` and record here which one serves the
apex domain, which branch or upload path it uses, and whether builds are
automatic or manual. Until that is written down, publishing stays a manual,
supervised act.

- A local `.netlify/` directory was removed on 2026-08-09. It was gitignored CLI
  state whose `publish` path pointed at a **different client's project**
  (`Kevin - Sitio web 3.5 (Codex App)\dist`). Anyone running `netlify deploy`
  from this folder would have published the wrong site. If it reappears after
  someone runs `netlify link`, check where it points before trusting it.

**`next` was never blocked.** It builds clean and passes every site invariant. It
had simply never been merged — and merging it, as it turns out, is not the same
as publishing it.

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

1. **Where the site actually deploys from (§1).** Blocking. Everything else on
   this list is cosmetic next to it.
2. **`netlify.toml` at the repo root** — is Netlify the live host, a fallback, or
   dead weight? Cannot be answered without §1. Left in place because deleting a
   tracked deploy config while the deploy path is unknown is how sites go down.
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
