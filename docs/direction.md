# Direction record — cinematic redesign

Written 2026-08-09, against commit `a04cdbb` on `next`.

This is the document the redesign is designed *against*. It records what was
measured, what was decided, and what is deliberately still open. When a later
change contradicts something here, change this file in the same commit.

The component-by-component design plan that implements this direction lives in
[immersive-plan.md](immersive-plan.md) (written 2026-08-10). This file owns the
constraints; that one owns the design.

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

**⚠ Discovered 2026-08-13: the shell's ambient `CLOUDFLARE_API_TOKEN`
belongs to a different account** — `zyz.investments@gmail.com`, account
`6b110c77818243752bd803fe71603797`, not this site's account above. The env
var overrides wrangler's own login, so the publish command as documented
would deploy `creative-mk-website` into the wrong account (Pages creates
missing projects on deploy rather than failing).

**`npx wrangler whoami` first, every time, and read the account id.** The
2026-06 three-months-dark incident (§1) and the wrong-client `.netlify/`
publish path (§1.2) were the same class of failure: deploy state pointing
somewhere true-looking and wrong. The check takes two seconds and is the
only thing standing between a release and a stranger's account.

A token scoped to the correct account was supplied on 2026-08-13 and the
release below shipped with it. It is **not** stored in this repo and must
never be: pass it inline for the one command
(`CLOUDFLARE_API_TOKEN=… npx wrangler pages deploy …`) and let it leave with
the shell.

### 1.3 Release log

**2026-08-18** — Pages deployment `f2e903ae`, account `2a432f7e…`, repo tag
`phase-1-shipped` at `d618a34`. 62 of 339 files changed. Carries the atomic
repaint onto the closed token set (§5.3 finally executed rather than
documented), the token guard in `check-site.mjs`, `js/fitter.js`, and the
retinted 404. `npm run verify` green before upload; every referenced asset on
the live homepage resolves; 225 elements measured live with transitions
suppressed, zero contrast failures.

**The whoami rule paid for itself on this release.** The ambient
`CLOUDFLARE_API_TOKEN` still resolved to `zyz.investments@gmail.com` /
`6b110c77…`; deploying with it would have created `creative-mk-website` inside
that account, silently, because Pages creates missing projects rather than
failing. The owner supplied a correctly-scoped token and whoami confirmed
`2a432f7e…` before a single byte was uploaded. Keep the check.

`/es/` returned 404 in production before this deploy and 200 after — the whole
Spanish tree had been sitting built in `dist/` and unpublished.

Still open, owner-gated: **the zone cache was not purged** (the supplied token
reads zones but returns `10000 Authentication error` on purge — no
`Zone → Cache Purge` scope, exactly as §1.1 says), and **the token needs
rotating** because it was pasted into a chat transcript.


**2026-08-13** — first publish since 2026-06-11. 40 pages, 82 changed files.
Carries the whole August-13 workstream: the deep service pages, the Spanish
URL tree, the cross-page field handoff, the Act II emboss, per-page OG cards,
the related graph and the contact fallback. Verified live afterwards, never
before (§1.1).

Two things did not ship with it and are owner-gated:

- **The zone cache was not purged.** Pages tokens do not carry
  `Zone → Cache Purge`, so the purge has to happen in the dashboard (zone
  `9c6d17208894937c1c029efaf2e3673e`). Until it does, the 4-hour browser TTL
  means returning visitors can hold old CSS against new HTML.
- **Analytics is still absent** (§6.1). The CSP already allows Cloudflare
  Insights and the Meta Pixel; neither is installed, so the effect of this
  release on bounce and conversion is unmeasurable by construction.

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

**Done, 2026-08-10.** `css/base.css` now scopes the hidden state to
`.js-reveal .reveal`, matching the contract `css/lp.css` already used. Three
paths were verified in the browser against the built `dist/`, with transitions
suppressed so the readings are resolved values and not a frame of the
animation:

| Path | Result |
|---|---|
| Class present, not yet revealed | 35/35 hidden — the reveal is armed |
| Class present, `.revealed` added | opacity 1 — the state class still wins |
| **Class absent** (JS blocked, errored, disabled) | **35/35 visible** |

The class is added by an inline bootstrap at the end of `<head>` in
`index.html`, not by `js/animations.js`. That placement is deliberate: it runs
before the first paint, so nothing flashes in and then hides, which adding it
from an end-of-body script would risk. The failure mode that placement
reintroduces — bootstrap runs, `js/animations.js` then fails — is closed by a
`load` handler that strips the class again unless `js/animations.js` set
`document.documentElement.dataset.revealReady`. That third path was verified by
clearing the flag and re-firing `load`: the class is removed and the page reads.

Fixed in the same pass: `initAnimations()` built a fresh `IntersectionObserver`
on every call and never disconnected the old one. It is called three times at
boot and again on every EN/ES switch, so observers accumulated for as long as a
visitor kept toggling languages. There is now one observer for the life of the
page.

Not verified here, and not affected by the change: that the observer actually
fires on scroll. The preview pane does not composite — a control observer built
from scratch on a visible element reported nothing either, and `innerHeight` was
0 at load — so it has to be checked in a real browser. The observer options are
byte-for-byte what they were.

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
| `MOTION_INTENSITY` | ~3 | **7** | Amended 2026-08-13, §5.1.1. Motion is the expensive axis and the only one that can regress §3.1, §3.2 and §3.3 simultaneously. |
| `VISUAL_DENSITY` | ~4 | **3** | More air. Costs nothing, and it is what reads as expensive. |

The reference preset for "agency / creative landing" is 9 / 8 / 3. We are
deliberately taking the variance and holding back the motion.

### 5.1.1 The 2026-08-13 amendment: motion 6 → 7, with its justification

The owner's directive of 2026-08-13 — the whole site dynamic, every page
inside one motion language, built to compete for international awards —
raises `MOTION_INTENSITY` from 6 to 7. This section is the justification
that the original rule demanded for every point above 6.

The evidence that licenses it: the SOTM winners of 2026 do not win on heavier
motion but on *complete* motion — Son Daven's lesson is that no block (FAQ,
footer, contact) drops out of the motion language, and its Usability 7.16 was
still the score's floor. So the point is spent on **coverage, not intensity**:
a declarative effect system every page inherits, not bigger effects on the
homepage. 8+ stays out; the taste-skill preset's 9-10 is where the three
contracts of §3 start losing.

The point is only affordable under three **binding acceptance criteria** —
every new effect, no exceptions, checked before merge:

1. **Settled under `prefers-reduced-motion`** — the effect resolves to its
   completed end-state, verified with the media query forced on. CI checks
   the global kill-switch exists; this criterion checks each effect actually
   uses it. (The Trionn convention of merely *slowing* idle motion under PRM
   is explicitly not imported — stillness on purpose is the accessibility
   thesis, and the winners' weakest subscore is the one we intend to beat.)
2. **Survives EN→ES→EN** — a full round trip through the language switch with
   re-measure (`mk:i18n` → `ScrollTrigger.refresh()` and any split text
   reverted, rewritten, re-split). Spanish runs ~20% longer; an effect that
   measures once is an effect that breaks in half the market.
3. **Renders as content with JS blocked** — the no-JS document shows the
   finished content, per the §3.2 contract. Effects are added by script,
   never assumed by markup.

Two enforcement mechanisms ride with the amendment:

- **Adaptive quality tiers in the field renderer** (js/terrain.js): a rolling
  frame-time buffer degrades resolution before a visitor ever sees jank —
  above ~22ms sustained the tier steps down, below ~12ms it steps back up;
  tiers touch pixel ratio only, never story. This converts the binary
  SwiftShader gate into measured tiers, and it is the only lawful path §3.1
  leaves toward mobile 3D: the runtime measurement *is* the number the rule
  demands. The floor tier stops the loop and leaves the settled field —
  degradation ends in stillness, not slideshow.
- **A per-frame budget for the field's program stack: ≤6ms at DPR 1.5 on the
  dev machine,** measured before each merge that touches the shader, the
  number recorded here the way the 22s SwiftShader figure was.

  Measured 2026-08-13 at 1920×1200 (DPR 1.5 over 1280×800), 60 draws per
  reading, `readPixels` as the sync point: **night act 0.73 ms/frame,
  daylight act with the emboss 0.31 ms/frame.** The daylight act is
  *cheaper* than the night act — the emboss costs four extra `wave()` taps
  and a normalize, while the contour path it replaces runs `fwidth` and a
  `fract` band it now barely uses. So Act II was bought at negative cost,
  and the 6 ms budget is ~8% spent. The raymarched version the research
  proposed (32–48 sphere-tracing steps) was not built: a forward-difference
  gradient over the height field the site already has produces the same
  raking-light relief for a fraction of the fill rate, and it keeps Act I
  and Act II literally the same surface under different light rather than
  two unrelated scenes.

Decisions recorded with the amendment, so a later taste pass reads them as
chosen rather than accidental: the persistent canvas stays (per-section
scenes are rework with no payoff at this page count — steal only the idle
warm-up); no plugin enters while a shipped hand-rolled equivalent exists
(ScrambleText, DrawSVG, MorphSVG stay out; Flip enters content-gated when
the case plates have imagery); three.js stays banned from site pages — its
techniques port to the vendored OGL tree, and the /lab/ authored piece may
reach `three/webgpu` only via dynamic import with a deliberate gate amendment
in the same commit. The gold cursor, which §12 of the immersive plan killed
and Phase 6 shipped anyway, must either acquire narrative (it becomes the
raking-light source over the Act II emboss) or go — it does not stay as
decoration.

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

GSAP + ScrollTrigger landed (2026-08-10) as **deferred** classic scripts, so
they never block render and the check — which counts only render-blocking
bytes — correctly leaves them out of the critical-path sum. This supersedes the
earlier note that adding GSAP would trip the 300 KB warning: the ~115 KB is
still paid in bandwidth, but not in time-to-first-paint. Everything that uses
GSAP runs at `DOMContentLoaded`, which deferred scripts are guaranteed to
precede, so the ordering is safe by construction.

All four guards were verified by deliberately breaking the build and confirming
each one fires.

---

## 6. The thing that matters more than any of this

**Resolved 2026-08-10: the six fabricated entries are gone.** What follows is
kept because the reasoning is still the reasoning, and because the section is
now empty until real work fills it.

Until today, **all six portfolio entries in `js/main.js` carried
`isRealClient: false`** and rendered with the label "Capability showcase". The
Work section said, in the site's own words, that these were examples of systems
we *can* shape.

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

### 6.0 What replaced them

`workData` is now `{ en: [], es: [] }`, with the accepted shape documented above
it so a real project drops straight in. `workPendingCount` holds the two signed
projects that cannot be published yet — the count is the only part that is
honest to state without a client's name on it.

The section renders a **ledger** instead of a grid: four rows, tabular figures,
a rule under each, no card and no fill. Published client projects **0** ·
signed but not publishable **2** · awards **0** · team **1**. The published
figure is derived from `workData.length`, never typed, so the ledger cannot go
stale; it shrinks on its own as real cases arrive and never needs removing.

Two decisions worth keeping:

- **Filters only appear above two categories.** With two cases they are
  furniture; with none they are a row of buttons over an empty box.
- **The FAQ answer changed with it.** It used to explain that the work section
  showed capability showcases. That sentence described something that no longer
  exists, and a stale FAQ is worse than none — it now says the section accepts
  client work only, and that two are waiting on a name and a figure.

Verified in the browser against the built `dist/`: 0 cards, 0 filters, 4 ledger
rows, correct in both languages, surviving an EN→ES→EN round trip, and neither
"Capability showcase" nor "Showcase de capacidad" appears anywhere in the DOM.

One coupling was removed at the same time. `renderWork()` writes elements that
start hidden behind `.js-reveal` but never handed them to the observer; it only
worked because `setLanguage()` happens to call `renderFAQ()` afterwards and
*that* ends with `initAnimations()`. Reordering those two would have made the
whole section invisible on the first language switch. `renderWork()` now claims
its own elements.

---

## 5.3 Ground: paper, not steel

Settled 2026-08-10. The chosen direction is a graft — the thesis of one proposal
("making the parts is cheap now, making them fit is not") carrying the WebGL
piece of another (a dry relief, blind-embossed, revealed by raking light). Those
two arrived with opposite grounds: machined steel on near-black, and cotton
paper. That had to be decided before a single token could be written, because
the palette, the piece and the fate of the navy all hang off it.

**Paper wins.** Four reasons, in the order they matter:

1. **The piece is an impression.** A blind emboss is a mark with no ink that
   does not exist until light rakes across it. On a dark ground there is nothing
   to emboss. Choosing steel would mean keeping the thesis and throwing away the
   piece that carries it.
2. **It differentiates where phase 2 is decided.** Every Site of the Month of
   2026 is dark or warm-bicolour. Site of the Month is not a score threshold —
   the eight highest-scoring sites of the month are nominated and then re-judged,
   with validated PRO user votes weighing explicitly on the final call. A light
   ground separates this site in the feed thumbnail, before anyone clicks.
3. **It buys the cheapest points on the board.** Near-black on warm paper clears
   AAA comfortably. Accessibility is the lowest sub-score of every winner
   measured (6.6–7.8); it is the one place where two points are available without
   spending on 3D.
4. **It is the larger transformation for zero runtime.** §5.1 argues that layout
   variance is free and motion is not. Ground is the same kind of axis: the site
   is `#0a0a0a` today, so the flip reads as a redesign and costs nothing at
   runtime, no bilingual risk, no mobile penalty.

The two worlds are not actually in conflict, and the seam is worth naming: a
machinist's inspection plate and a printer's proof are the same object — a flat
surface where you check whether something came out right, under raking light.
Both proposals reached raking light independently. So: **paper ground, machined
furniture.** Rules, borders, the focus ring and the case fields are metal; the
page they sit on is paper.

**The navy dies.** `#1B2A4A` survived only as a section field, and on paper that
field becomes the warm near-black of the plate. It was already the most generic
value in the set — navy plus gold is the most predictable pairing there is — and
nothing in the direction needs it. `--color-navy` and `--color-navy-light` go,
along with `--color-text-muted`, which is derived from it.

**The gold survives, demoted.** `#E8C840` stops being an interface colour: no
buttons, no underlines, no borders, no icons. It appears as the specular in the
relief and as the keyboard focus ring, and nowhere else. Its contrast on paper is
1.36:1 — unusable as text, which is part of why the current page scores where it
does — so text that needs the brand colour uses an aged cut of the same hue.

Consequence for sequencing: the repaint is **one atomic pass, not a cleanup**.
There are 52 unique hex values in `css/`, only 18 of them in `variables.css`;
changing the tokens without also catching the 34 hardcoded values would leave
the page half-repainted, which reads worse than either ground. It does not get
started until the token set is final.

## 5.4 Display face: Fit, and the token set it closes

Settled 2026-08-10. The site has no display face — `--font-primary` and
`--font-display` are the same string — and that single line is the largest
share of why Design scores where it does. Two candidates were costed.

**Fit**, David Jonathan Ross, Mini licence **50 USD**, 3 workstations, 15,000
monthly unique web visitors, 10 named instances from Skyline to Ultra Extended.
**Signifier**, Klim, roughly 180–240 USD for two cuts.

Fit wins, and not on price. Its width axis *is* the mechanism that makes the
Spanish and English headline end on the same right edge — the thesis of this
direction demonstrated in three seconds by pressing ES. Signifier is the more
beautiful face and does nothing for that problem. It also carries a second cost
the research flagged: it is one of the most-used faces in awarded work, and a
jury reads it as the safe pick in a field it already describes as
indistinguishable.

The objection raised against Fit — that it is a capitals series and a
44-character Spanish headline in it reads as a novelty face — was checked and is
out of date: **lowercase and small caps were added to the family in 2024**. The
risk is mitigated anyway by keeping the extreme widths for the plate and the
figures, and holding the prose to a short range.

**Two corrections to carry into implementation.**

The width axis range is **not published**. Two earlier drafts assumed `82–108`
and `100–800`; both were invented, and the first could not have converged. Code
must probe for the usable bounds and binary-search on *rendered width*, never on
assumed axis numbers.

The measurement must happen in the **DOM, off-screen, and be cached** — one
resolved width per string per language, not per switch. The canvas `font`
shorthand does not accept `font-variation-settings`, so `measureText` cannot
instantiate an arbitrary width reliably; and re-measuring seven strings on every
language change is reflow inside the 260 ms window where the text is out.

**Before paying**, confirm ñ á é í ó ú ü ¿ ¡ in the Glyphs panel. The family
page lists Latin Western & Eastern European but does not name Spanish
diacritics explicitly.

### 5.4.1 The finding that changed a rule

Every ratio in the new token block was computed rather than estimated, and one
of them overturned a decision made earlier in this document. §5.3 said the gold
survives as the specular and as the focus ring. Measured:

| | on paper `#EDE9E1` | on plate `#191712` |
|---|---|---|
| `--gold` `#E8C840` | **1.36:1** | 10.89:1 |
| `--gold-aged` `#7A5C12` | 5.15:1 | — |

WCAG 2.2 SC 1.4.11 requires 3:1 for a focus indicator. Raw gold on paper is not
a third of that. So the rule is now **two-sided**: the focus ring is
`--gold-aged` on paper and `--gold` on plate. Shipping the obvious version would
have put a failing focus indicator on every interactive element of a site whose
whole competitive argument is that its accessibility is better than the
winners'.

## 6.1 Meta Pixel removed, and the measurement gap it was hiding

Deleted 2026-08-10: `js/meta-pixel.js` and its four references (`index.html`,
`contact.html`, `contact-src/index.html`, and the copy inside the build output).

It shipped with `META_PIXEL_ID = ''`, so every branch past the guard was dead —
and it was the **first script in `<head>`, ahead of the stylesheets**, a
render-blocking classic script whose entire runtime effect was setting two
`data-` attributes. It was removing itself from the critical path for free.

Both callers are already null-safe and were left alone: `contact-src/src/main.jsx`
uses `window.creativeMkTrackLead?.()` and `js/lp.js` guards with `typeof`.

**This does not close the measurement gap, it exposes it.** The site now has no
analytics of any kind. Every funnel step before the concierge opens is still a
blind spot, and that is a decision to make on purpose rather than inherit from a
tag that never fired.

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
