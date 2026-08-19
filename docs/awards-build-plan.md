# Execution plan — the print-shop build, 2026-08-18 → 2026-10-31

Written 2026-08-17 against `next` at `0ca8bbd`; revised the same day after a
three-lens adversarial review (calendar arithmetic, repo accuracy,
completeness) found the first draft over-committed by ~1 week and missing its
own submission mechanics. This file owns the **schedule and scope** of the
awards-window build. `direction.md` owns the constraints; `immersive-plan.md`
owns the homepage component design; the 2026-08-17 theme study (delivered
in-chat, essentials in project memory) owns the concept verdicts this plan
sequences. When a later change contradicts something here, change this file in
the same commit.

> **Status 2026-08-18:**
> - **Phase 0 — SHIPPED 2026-08-18.** The `--font-display` footgun is fixed and
>   the site is live (Pages deployment `f2e903ae`, tag `phase-1-shipped`). The
>   whoami check earned its place first: the ambient token resolved to
>   `zyz.investments@gmail.com` / `6b110c77…`, and a deploy with it would have
>   created this project inside a stranger's account. The owner then supplied a
>   correctly-scoped token, confirmed as `2a432f7e…` before anything uploaded.
>   **`/es/` now returns 200 — it had been 404 in production while the whole
>   Spanish tree sat built in `dist/`.**
> - **Phase 1 §2.2 — the atomic repaint is DONE and verified** (commit
>   `41e8f04`): 180 hexes and 145 rgba tones onto the closed set, the three
>   private token sets re-pointed, the contact island bridged, the 404
>   retinted, five real contrast failures fixed, and the token guard live in
>   `check-site.mjs` (0 errors; 676 legacy names remain as the stage-B rename
>   meter). Zero contrast failures on the EN homepage, the ES homepage,
>   /work/ and contact.
> - **Phase 1 §2.1 — the fitter module is DONE and dormant** (commit
>   `1512dc8`): `js/fitter.js` probes the axis rather than assuming a range,
>   measures in the DOM, caches per string+language+measure, and owns the
>   refit→re-split ordering via a `mk:fitter` event. It correctly reports
>   `hasAxis: false` against the shipped Inter and leaves every element
>   untouched, so it wakes up the day the licence lands with no other change.
>   7.6 KB deferred, nothing added to the critical path.
> - **Next, in order:** the owner's Fit purchase (§2.1, blocking and the only
>   thing holding §2.3's display voice); Phase 2 item 0 (type roles, and
>   killing the remaining glassmorphism on `.hero__link` and the unscrolled
>   lang-switch).
>
> **Open against this release, both owner-only:**
> 1. **The zone cache was not purged.** The supplied token reads zones fine but
>    the purge returns `10000 Authentication error` — it does not carry
>    `Zone → Cache Purge`, exactly as §1.1 predicts. Purge zone
>    `9c6d17208894937c1c029efaf2e3673e` from the dashboard. Fingerprinted
>    filenames mean stale CSS cannot be served against new HTML, so the
>    exposure is the 4-hour HTML TTL only, not a broken page.
> 2. **Rotate the token.** It was pasted into a chat transcript, which is where
>    the two tokens named in the August audit already are. One rotation closes
>    all three.

**The unit:** 1 plan-week ≈ 15–20 focused hours (evenings + one weekend day).
Every estimate below is in these part-time weeks, and phases are **serialized
— one person, one phase at a time.** The first draft overlapped phases; the
review priced that overlap as a slip already spent, so it is gone.

---

## 0. What this plan builds, in one paragraph

Three layers, one story — *a print shop on cotton paper*. The **substrate**
(deploy what exists, the atomic repaint onto the closed token set, the Fit
display face and its width-fitter) makes the site one design instead of four.
The **grammar** (Make-Ready site-wide, carrying In Register's mandatory half;
then In Register's theater on the language switch) makes every arrival a named
press operation and turns the EN⇄ES swap into the signature no competitor can
copy. The **peak** (Pull a Proof, the operable embossing press at `/lab/`)
lets the visitor manufacture the site's core image — the blind emboss — with
the two easings as literal machine strokes. Target: Awwwards submission
**Oct 27** (approval takes up to a week; the realistic pool is **November
SOTM**, which still reaches the Feb-2027 annual — SOTM must be won Sept–Dec
2026). Scoring context: 5.3 today, 7.65+ entry band, Design 40 / Usability 30
/ Creativity 20 / Content 10.

### 0.1 Decision log (settled 2026-08-17, three-judge verdict + review)

| Decision | Verdict |
|---|---|
| The `/lab/` peak is **Pull a Proof** (embossing press), not Resurvey (erosion) | Coherence: the set speaks press-dialect end to end; the weeks-1–2 severable core is the abort gate erosion lacks. Resurvey is the pre-loaded standalone piece for the 3-month resubmission window. |
| **The Inspection Lamp does not enter the October window.** | Its honest estimate is ~5 weeks (height-field addressing strategy unspecified); it is the November project. The peak's lighting spine (relief + Kajiya-Kay gold) is built shareable so November starts warm. |
| **October is WebGL2-only.** The `three/webgpu` path moves to November. | The first draft promised the sim twice and funded it once. WebGL2 fragment ping-pong is the piece; the WebGPU port is an enhancement with its own line on the November list. |
| The gold cursor is **deleted** in Make-Ready | The direction's "acquire narrative or go" ultimatum, answered the honest interim way. If the Lamp ships in November, delete the deletion. Full deletion list in §3 item 7. |
| GRAD-axis "ink gain" items are **dead** | The shipped `fonts/inter-latin-variable.woff2` carries no GRAD axis. Verified. Do not resurrect without a face that has one. |
| The fitter **solver** ships in Phase 1 as shared infrastructure (CI-checked, no visible chrome); the fitter as **visible instrument** ships only inside In Register, rationed to at most one hero measure-bar | Three options sold the same swap-refit showpiece; In Register keeps the performance, the solver is plumbing five features need. Solve values may appear in the colophon. |
| The Unsurveyed Map ships only its **guilloche subset** in October | Guilloche-edged redaction bars + honest counts fold into Make-Ready's ledger work. The hatch shader and quadrangle index wait for a publication to draw. |
| **Newsletter: WIRED.** `js/main.js` `initNewsletter()` posts to the real Worker lead endpoint | The immersive-plan §11 "wire it or delete it" demand is already satisfied in code; its stale status line is corrected in the same commit as this plan. |
| **Pre-fired cuts** (spent at signing, not scheduled anywhere below): In Register's CMYK-halftone pass; the peak's typed-forme scope (curated formes only ship) | The review priced the calendar at ~0.2–0.3 weeks over even after serializing; these two were first in the cut order, so they are gone now, not on slip. Both join the November list. |
| **Live cut order** when the calendar bites further | 1. In Register's plate-lift theater (the swap *contract* survives inside Make-Ready) · 2. the press-cycle loader (§3 item 6) + INSPECT's sheet-tilt hold. Honest budget: these recover ~0.7–1.1 weeks; **the largest slip the plan survives with the full peak is ~0.5–0.8 weeks.** Beyond that: the peak's G4a floor (logotype-forme core only), and last, the G4a abort. |

---

## 1. Phase 0 — Ship what exists (Aug 18, ~half a day)

Production is behind the repo: `/es/` 404s live while `dist/` holds the full
Spanish tree. Nothing in this plan exists for a jury until this is routine.

- [x] `npx wrangler whoami` — **read the account id** (`2a432f...`, not the
      ambient token's `6b11...` — see `direction.md` §1 for the wrong-account
      incident). Pass the correct token inline for the one command.
- [x] `npm run verify` → `npx wrangler pages deploy dist
      --project-name=creative-mk-website --branch=main`
- [ ] **STILL OPEN** — purge the zone cache (dashboard, zone `9c6d1720...`) — deploy first,
      verify second, never probe before (direction.md §1.1).
- [x] Live checks: `/es/` renders, `/es/trabajo/` renders, CSS content-type
      correct, sitemap reachable.
- [x] One-line footgun fix, same deploy: `css/variables.css` declares
      `--font-display: 'Fit', …` in the new block and the legacy block
      **redefines it to Inter** ~34 lines later. Delete the legacy
      redefinition now so the face is wired the day it lands.

**The deploy ritual, every phase from here on:** `npm run verify` → deploy →
purge → live check → **git tag `phase-N-shipped`** → record the deployment id
from wrangler's output in this file → **merge `next`→`main`** so the repo's
main always equals the live site. **Rollback** = re-promote the previous
deployment in the Pages dashboard (or rebuild from the tag and redeploy),
then purge the zone again — the 4-hour TTL applies to rollbacks too.

**Gate G0 (Aug 18):** the public site equals the repo.

---

## 2. Phase 1 — Substrate (Aug 18 – Sept 7, 3 weeks)

Nothing in the grammar or the peak looks right over the current four
interleaved color systems. The repaint is **one atomic pass** (direction.md
§5.3): the token set closes first, then everything moves at once. The review
re-priced this phase from 2 weeks to 3: the edit surface is **occurrences**,
not unique values — 182 hex + 179 rgba() occurrences across ~6,300 lines of
CSS, and several migration rows are per-role judgment calls, not find-replace.

### 2.1 Fit: purchase and the fitter module (week 1)

- [ ] **OWNER, Aug 18, blocking:** confirm ñ á é í ó ú ü ¿ ¡ in the Glyphs
      panel on djr.com, then buy the Mini licence (50 USD, 15k monthly
      uniques tier). Nothing display-facing in this phase starts without the
      file; buying day one lets the wait overlap the repaint below.
- [ ] **Measure the woff2 at purchase** and record it in §8 — it lands inside
      the 300/400KB critical-path gate (§7.6).
- [ ] Probe the **actual wdth axis bounds** — unpublished; two prior drafts
      invented ranges (direction.md §5.4). Never assume axis numbers.
- [ ] `@font-face` with `font-display: swap` + preload; verify against the
      `--font-display` consumers after the Phase-0 footgun fix.
- [ ] **The fitter module** (`js/fitter.js`): binary search on *rendered
      width* via off-screen DOM measure (canvas `measureText` cannot see
      `font-variation-settings`); one cached solve per string per language;
      contract: `refit(el) -> Promise<wdth>` and the ordering law
      **settle → refit → re-split**, exported as an event the i18n and
      SplitText layers subscribe to. Shared by Make-Ready, In Register, and
      the peak's ES forme — build once, here. No visible chrome (§0.1).
- [ ] Wire into `scripts/measure-bilingual.mjs` so the EN/ES same-right-edge
      claim is CI-checked, not asserted.

### 2.2 The atomic repaint (weeks 1–3)

Scope, measured 2026-08-17: 75 unique hexes (51 hardcoded outside
`variables.css`; 182 occurrences), 179 `rgba()` occurrences (108 distinct),
3 private token sets, 21 border-radius values, 24 shadows, 9 easing curves,
36 duration literals, 9–10 button systems (only `.btn` + variants exist as a
system; the rest are bespoke). Target: the closed set of `variables.css`'s
new block.

Migration table (the pass works against this):

| Today | Becomes |
|---|---|
| Grounds `#ffffff` `#f7f5f0` `#fafafa` `#f5f5f5` `#f6f6f6` `#f0f0f0` | `--paper` (page) / `--paper-raised` (fields) / `--paper-sunk` (wells) |
| Darks `#0a0a0a` `#1a1a1a` `#111111` `#161616` `#171717`… (text) | `--ink` / `--ink-muted` / `--ink-faint` per role |
| Panels `#17233f` `#11151f` `#1B2A4A` `#0d1b3e` `#2a3d66` (navy family) | `--plate` / `--plate-raised`; text on them `--plate-ink` / `--plate-muted`. **The navy dies — all of it.** |
| Gold as interface (`--color-primary` bgs/borders/text ×~50, `#b8860b`) | Dies. Links on paper: `--gold-aged`. Focus ring: `--gold-aged` on paper / `--gold` on plate (two-sided rule, direction.md §5.4.1). Gold otherwise appears only as specular in relief. |
| Grays `--color-gray-*` ramp | `--ink-*` on paper, `--plate-*` on plate, `--rule`/`--rule-strong` for lines |
| Radii (21 values) | Closed set: `0` (rules, plates, inputs — machined furniture), `--radius-pill` (the one pill, spelled once), `50%` (dots only). The 8/12/16/24/28px middle class dies. |
| Shadows (24) | ≤2: one hairline lift for raised paper, one for overlays. Everything else flattens — paper reads by tone, not by blur. |
| Easings (9) + durations (36) | `--ease-seat`/820ms and `--ease-release`/260ms. Structural exceptions (Lenis lerp, reduced-motion 0.01ms kill) whitelisted by name in the guard. |
| Buttons (9–10 systems) | One `.btn` primitive, two fills (ink-on-paper / paper-on-plate) + one ghost. `lang-switch`, `header__contact-btn`, `footer__newsletter-btn`, `hero__cta`, concierge send, lp buttons become variants. |
| `lp.css` `--negro/--oro/--crema…`, `ai-concierge.css` `--mkc-*` (incl. the stray teal `#0f766e`), `stage.css` locals `--color-paper`/`--color-dark-panel` | Re-pointed to core tokens; private sets deleted. |
| `contact.html` island tokens (name-collision, different values) | **Token bridge**: build-time copy of the real values from `variables.css` into the Vite build. Full visual unification of contact runs on September evenings (§2.3). |
| **`src/404.html`** (deliberately self-contained inline styles: `#0a0a0a` ground, `#2A3D66` SVG stroke, raw `#E8C840` link) | Stays self-contained, but its hardcoded values become copies of the new tokens: ground = `--plate`'s value, strokes = `--rule`/`--gold` values, link per the two-sided rule. (There is no `/es/` 404 to mirror.) |

Known accessibility fixes riding in the same pass: `lp.css:55` gold focus
ring on cream (1.36:1) and `ai-concierge.css:367` gold focus on white — both
become the two-sided rule. The 17 hardcoded `#7a5c12` become `var(--gold-aged)`.

- [ ] **Guard, same commit**: extend `scripts/check-site.mjs` with a token
      guard — error on any legacy hex/token (`#17233f`, `#1B2A4A`,
      `--color-navy`, `--color-gray-`, `--color-primary`…) outside
      `variables.css`, warn on new `rgba()` literals above a small whitelist.
      **The guard scans built HTML too** (the 404's inline styles), with
      404.html's hexes whitelisted only at the new values. The repaint is
      done when the guard passes at zero, and the guard keeps it done.
- [ ] Verification: axe/contrast pass on paper and plate grounds; visual pass
      of every template EN and ES (40 built pages, 404 included);
      `npm run verify` green.

### 2.3 Moved out of this phase (review finding)

Type roles and homepage furniture normalization belong to Make-Ready — they
are its soil and are scheduled there (§3 item 0). The **contact island's
visual unification** (bridged tokens applied, `.btn` primitive, paper ground,
h1 below the homepage's) is the standing **September-evenings valve**: it is
the default background task when a mid-week evening is too short for the
current phase's next item, and it must be done before the submission pass.

**Gate G1 (Sept 7):** token guard at zero · axe pass both grounds · Fit live
with the fitter solving EN/ES headlines to one measure in CI · woff2 size
recorded · deploy ritual complete.

---

## 3. Phase 2 — Make-Ready (Sept 8 – 24, 2.5 weeks)

The site-wide motion grammar: every arrival is a named press operation. Zero
new WebGL; the terrain underneath is untouched. This phase also carries **In
Register's mandatory half** — the scramble re-author and the fitter wiring
are owed by the bilingual contract regardless of any theater. Full spec:
theme study, option "Make-Ready". Build items in order:

0. **Type roles + furniture normalization** (from Phase 1): three voices —
   **display** (Fit: hero + section openers), **content title** (Inter 600,
   one mid size), **kicker/label** (the existing 11px/0.12em system). The
   homepage h2 chaos (36→79px) resolves into these. Glassmorphism, gold
   chips and card shadows die; rules + numerals + tabular figures replace
   them. Make-Ready's operations act on rules and figures, not cards.
1. **The arrival choreography.** H1 seats in two masked line reveals
   (820ms), nav hairline scribes across, registration cross stamps top-right
   (260ms). Done by ~1.2s, then stillness. Rides the existing
   `js-reveal`/no-JS contract — markup ships finished, script
   rewinds-then-plays.
2. **Scribe-line rules.** Section rules draw via CSS scroll-driven `view()`
   timelines behind `@supports`, fully-drawn fallback state. One-shot per
   section — never scroll-scrubbed (dash draws are main-thread paint;
   one-shot is the law).
3. **Registration figures.** Key figures arrive as two impressions — ink
   layer + 3px-off blind ghost — translating into register with the seat
   curve. Compositor transforms only; hard caps 4px / 400ms.
4. **The ledger, machined + guilloche.** Eleventy hypotrochoid shortcode →
   static SVG security borders under the redaction bars; honest counts
   (published 0 / signed 2 / awards 0 / team 1); SIGNED stamps seat.
   *Week-1 gate: print the guilloche SVG at 1:1 — a millimeter under
   banknote grade and plain rules ship instead, shortcode parked.*
5. **Scramble re-author** (In Register's mandatory half): full diacritic
   alphabet (á é í ó ú ñ ü ¿ ¡), ink-on-paper palette, no monospace flicker,
   staggers normalized by total duration so ES +20% never lengthens
   choreography; settle → refit → re-split wired through `js/fitter.js`.
6. **The press-cycle loader** (cold cache only): registration marks align,
   platen closes and releases, masking font load. Never gates markup; PRM
   skips to the finished proof. *(This is live cut #2 — first candidate if
   the phase runs long.)*
7. **Cursor deletion**, complete list: `js/cursor.js` · the script tag at
   `src/_includes/scripts.njk:24` · `css/stage.css:720–759` · the
   `.mk-cursor` line in the reduced-motion block near `stage.css:800` —
   then `grep mk-cursor` to confirm zero references. No i18n strings are
   involved (the "cursor" keys in `js/i18n.js` describe the native pointer).
   Record the deletion in `direction.md` §5.1.1's cursor clause.

Mobile: figures ship pre-registered (zero cost) until the one extra
composited layer has its Android number (§8 — device must exist by Sept 8).

**Gate G2 (Sept 24):** grammar live on every template · EN→ES→EN round trip
green in `test:i18n` · PRM state = finished proof on every effect · deploy
ritual. Thumbnail check: screenshot the hero at Awwwards' feed-card crop —
if it reads as "clean but empty", pull one ledger band up the page (variance
is free).

---

## 4. Phase 3 — In Register, the theater (Sept 25 – 27, 0.5 week)

The mandatory half already shipped inside Make-Ready. This half-week is the
performance, strictly timeboxed — it is also live cut #1:

1. Plate-tab control (two stacked tabs + registration cross) replacing the
   pill lang-switch; `aria-live="polite"` announce.
2. The cycle (≤1.3s): lines lift 2px (release) → scramble-as-typesetting →
   headlines re-solve wdth in one supervised 820ms transition, ES landing
   narrower on the same measure, **same right edge** → figure plates drift
   2–4px and seat back → REGISTERED tick stamps.
3. The hero quotes the same physics once at arrival (the discoverability
   answer): H1 ink + ghost seating into register as the face settles.
4. No-JS: the control is a real `<a>` to the static `/es/` mirror (live
   since Phase 0).

The CMYK-halftone pass is **pre-cut** (§0.1) — it is on the November list,
not here.

**Gate G3 (Sept 27):** full cycle ≤1.3s · drift never exceeds 4px/400ms ·
PRM = instant cut to the registered target language · `measure:bilingual`
proves the same-edge claim in CI · deploy ritual.

---

## 5. Phase 4 — Pull a Proof, the `/lab/` peak (Sept 28 – Oct 25, 4 weeks)

The one showpiece. **WebGL2 fragment ping-pong only** (§0.1): the
`three/webgpu` port is November's enhancement, so this month has one sim,
one backend, no parity tax. Typed formes are pre-cut — **curated formes
only** (logotype, today's headline, EN/ES pair). Full spec: theme study,
option "Pull a Proof (machine)". Week map — each week ends runnable:

| Week | Deliverable | Gate |
|---|---|---|
| 1 (Sep 28–Oct 4) | Press sim: heightfield plastic-compression + fiber-springback ping-pong passes (~0.5–1ms) on the terrain heightfield handed in via the existing sessionStorage phase handoff (`js/terrain.js` — handoff-IN only; nothing hands back out in October) | Sim visibly presses a hardcoded die |
| 2 (Oct 5–11) | **The lighting spine** (built shareable for November's Lamp): relief render = normal fetch + Blinn raking term + Kajiya-Kay anisotropic gold masked to die marks + paper-fiber micro-normals baked once (~0.8ms) | **G4a — the abort gate (Oct 11), objective:** (a) ≤3ms/frame at DPR 1.5 on the WebGL2 tier, measured by the same 60-draw `readPixels` method as the 0.31/0.73ms act numbers, recorded in §8; (b) the logotype die presses and relights with §7.1 (PRM) and §7.3 (no-JS) passing; (c) a side-by-side against the blind-emboss reference judged by **someone who is not the builder**. Fail → abort the peak: October ships the grammar + this room as a "first proof" teaser, and the submission leans on Make-Ready + In Register. Decided here, not in week 4. |
| 3 (Oct 12–18) | The verbs: DIAL (GSAP Draggable — **vendor `js/vendor/Draggable.min.js`, lazy-loaded only inside the /lab/ chunk, sanctioned in `direction.md`'s plugin clause in the same commit** — snap array from indices, arrow keys step detents) · CLAMP (press-and-hold, 820ms seat, pressure needle into the green arc; Space/Enter parity) · PULL (260ms release) · INSPECT (cursor = raking lamp — adds light, never masks; sheet-tilt hold is live cut #2b) · runtime forme bake for the curated set, ES forme re-solved to the chase via `js/fitter.js` · **colophon page drafted** (`scripts/colophon.mjs` exists — extend it: budgets, tier table, PRM contract) · **Android measurements taken** (§8) · **G4b midpoint: frame cost re-measured** while there is calendar left to react | Full press cycle by keyboard alone; midpoint number recorded |
| 4 (Oct 19–25) | **Feel only, plus the final numbers**: the fiber must read **plastic, not rubbery** — this week exists for material iteration · hysteresis quality tiers (~45fps down / ~83fps up, DPR drop during clamp) · final tiers verified: no-JS = photographed proof + full description + colophon; <768px = 12s filmed pull + photographed proof, honestly captioned · ledger signpost "proofs pulled here" | **G4b (Oct 25):** 2–3ms/frame at DPR 1.5, measured and recorded in §8 |

PRM state: a finished pulled proof under the parked lamp — every stage
operable but seating instantly. The finale is stillness anyway.

---

## 6. Phase 5 — Submission (Oct 26 – 29, with a real buffer)

The submission is a deliverable with its own prep, not six bullets:

- [ ] **By Oct 20** (inside peak week 3–4, evenings): draft the submission
      fields — title, description (EN; the jury's first read, written
      against the colophon story), category, tags, credits/roles. Assemble
      the outreach list: real contacts with **validated Awwwards PRO
      accounts** (soliciting votes is legal per the 2026-08-10 terms check;
      fake accounts are not).
- [ ] **Oct 26 — buffer day**: final `npm run verify` · deploy · purge ·
      live pass EN/ES on the real phone and the low-contrast panel (§8
      devices) · OG/meta pass (`scripts/og-cards.mjs`; the hero crop at
      Awwwards' card size) · analytics decision executed or blindness
      explicitly accepted (§10 — nothing changes after the freeze).
- [ ] **Oct 27 — submit** ($65, non-refunded). Mechanics, stated so the date
      is deliberate: the fee buys a **SOTD nomination**; approval takes up to
      a week, so the SOTD likely lands in **November's pool**; SOTM is the
      month's top-8 re-judge with PRO votes weighing (direction.md), and a
      Sept–Dec 2026 SOTM reaches the Feb-2027 annual. Oct 27 is chosen for
      the November pool on purpose.
- [ ] **Production freeze** from submission through the 5-day voting window
      — no deploys, no experiments. Send the outreach when voting opens.
- [ ] The 3-month resubmission window then opens. **November list:** The
      Inspection Lamp (on the peak's lighting spine) · Resurvey standalone ·
      the `three/webgpu` port · the CMYK-halftone pass · typed formes ·
      Flip case plates / distortion planes / about shelf as content arrives.

---

## 7. Acceptance criteria — every effect, no exceptions

Checked before merge (direction.md §5.1.1's binding criteria plus two laws):

1. **PRM settles** — the effect resolves to its completed end-state with the
   media query forced on. Settled, not slowed.
2. **Survives EN→ES→EN** — full round trip with re-measure (`mk:i18n` →
   refit → re-split → `ScrollTrigger.refresh()`). CI: `npm run test:i18n`.
3. **Renders as content with JS blocked** — markup ships finished; script
   only rewinds.
4. **Mobile claim = mobile number** — any effect shipping below 768px, and
   any mobile claim in the submission, carries a measured figure from the
   §8 Android. No number, no claim.
5. **Frame budget** — background stack ≤6ms at DPR 1.5 on content pages
   (current: acts 0.31–0.73ms + grammar 0ms); the peak owns its page at
   2–3ms with tiers. Measured before each merge that touches a shader,
   recorded in §8.
6. **Byte budget** — the `check-site.mjs` 300/400KB critical-path gate stays
   binding on every page (its collector counts preloads — Fit's woff2 lands
   inside it). Any deliberate overage past the 300KB warn is written down
   here, immersive-plan-style, or it does not ship.

## 8. Measurement obligations (open, dated when closed)

**Device procurement — OWNER, by Sept 8:** a Moto-G-class Android in hand
(buy used if needed) and the low-contrast laptop panel named. If neither
exists by Sept 8, the fallback is BrowserStack real-device for these numbers
— decided then, not at G2.

| What | Where | Number |
|---|---|---|
| Fit woff2 size + post-preload homepage critical path | build | — |
| Fit wdth usable bounds at display sizes | probe, both languages | — |
| Make-Ready figure-registration extra layer | §8 Android | — |
| In Register plate-seat transform cost | §8 Android | — |
| Fitter solve batch (page of headlines) | §8 Android | — |
| Peak frame cost at DPR 1.5 (G4a ≤3ms · G4b midpoint · G4b final 2–3ms) | dev machine, 60-draw `readPixels` | — |
| Peak mobile tier: video decode + LCP | §8 Android | — |

## 9. Risks and kill criteria

- **Calendar truth (post-review):** serialized, the phases sum to ~10.1
  plan-weeks against 10.7 calendar weeks — the remaining margin is the §0.1
  live-cut budget (~0.7–1.1 weeks) and the Oct-26 buffer day. **Max
  survivable slip with the full peak: ~0.5–0.8 weeks.** Past that, the peak
  contracts to its G4a floor (logotype core); past *that*, the G4a abort
  ships the grammar alone. Cuts fire on gate dates, not on debate.
- **G4a is judged by someone who is not the builder** (criterion c) — this
  project has documented four times what happens when the builder scores
  their own work at the exact moment sunk cost peaks.
- **Guilloche under banknote grade** → plain rules ship, shortcode parked
  (P2 week-1 print test).
- **Seat drift read as bug** → caps 4px/400ms are law; review kills any
  effect that needs a caption to parse.
- **Fiber reads rubbery in week 4** → the logotype-forme core from G4a is
  the piece; everything else was already severed.
- **Scramble reads as terminal-decrypt** → the cycle cheapens; the diacritic
  alphabet, ink palette and no-monospace rules are review items, not taste.

## 10. Owner-gated parallel track (dated where the plan depends on it)

- **Fit purchase — Aug 18, in §2.1, blocking.** (Listed here only so the
  owner's calendar shows it; anything phase-blocking lives in its phase.)
- **Device procurement — by Sept 8, §8.**
- **Analytics — decide by Oct 15,** execute (or explicitly decline) in the
  final Oct-26 deploy; after the freeze it is forbidden by the plan's own
  rule. The site currently measures nothing (direction.md §6.1).
- **The two real client cases** (Content-10): a case arriving **before Sept
  30** may buy its immersive-plan machinery (Flip plates, distortion planes,
  about shelf) only by trading against the §0.1 cut order; a case arriving
  later publishes plain — redaction-bar removal + a minimal case page — and
  the machinery is explicitly post-October, alongside the Lamp.
- Rotate the two Cloudflare tokens pasted in chat in August (audit memory).
- Legal review of privacy/terms.
