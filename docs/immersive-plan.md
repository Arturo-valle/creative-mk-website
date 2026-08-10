# Immersive redesign — the component plan

Written 2026-08-10, against `docs/direction.md` (dials 8/6/3, vanilla + GSAP,
budget enforced by CI). This is the output of a 10-agent design pass: full
re-read of taste-skill (v2 + soft/redesign/brutalist variants, 54 techniques
extracted), a component-by-component inventory of the current page, five
designers working in parallel, and two adversarial critics — one enforcing the
measured constraints, one scoring as an Awwwards juror. 20 proposals went in;
2 were killed, 14 modified, 4 survived untouched. What follows is the merged,
post-verdict plan.

taste-skill's role here was vocabulary and guardrails — its dials, its
anti-slop bans, its motion skeletons translated out of React into vanilla +
GSAP. It is not a dependency and nothing from it gets installed.

> **Status 2026-08-10:** §0–§7, §10–§12 built, verified and live. Remaining
> items are content-gated: the work Flip plates (§8–9) wait on imagery and
> permission for the two real cases, the about shelf (§10) on real artifacts,
> and the newsletter form on being wired to the funnel backend or deleted.

---

## 0. The one idea everything hangs on

The inventory's harshest finding: the page is a **stack of disconnected boxes
that flips dark/light seven times** (hero `#0a0a0a`, proof white, showreel
black, capabilities white, process `#eef1f5`, work `#f7f5f0`, news `#11151f`,
FAQ `#17233f`, footer `#f5f5f5`) — the exact "random alternation" taste-skill
bans, with two navys that almost-but-don't match and four different off-whites.
No motif recurs. Nothing hands off to anything.

The plan replaces that with **a three-act color story and one recurring
signature**:

- **Act I — night.** Hero + showreel, contiguous dark. The gold contour-terrain
  is born here.
- **Act II — daylight.** One unified warm paper tone (killing the off-white
  lottery) for proof, capabilities, process, work, about. The house lights come
  up exactly once, at the showreel's exit.
- **Act III — night again.** News + FAQ + footer on **one** navy token,
  deepening to `#0a0a0a` at the bottom bar. The page closes the way it opened,
  and the gold CTA lives where gold has its strongest legal contrast.

The taste critic demanded this be decided once, not negotiated between
components. Decided: **symmetric three-act, dark → light → dark.**

The recurring signature is the **gold contour line**: born as the hero terrain,
flattening to a horizon on scroll-out, becoming the proof strip's first drawn
hairline, reappearing as a low-alpha clip motif exactly twice more
(capabilities duotone, one proof cell). Three appearances, then it stops —
repetition with restraint is what reads as authored.

Mechanism: a fixed `.page-stage` element behind everything (ink + paper planes,
one static grain layer at 0.03), sections go transparent via a JS-added class —
no-JS keeps every current solid background. Two scrubbed opacity crossfades
total. ~4KB.

---

## 1. Prerequisite: the reveal spine (build first, zero visual change)

Everything below rides on this. Replaces the 35 elements that start at
`opacity: 0` in CSS:

- `.reveal` styling moves behind a JS-added `.js-reveal` class — **no-JS now
  renders the full page**, satisfying the direction record's §3.2 mandate.
- Above-fold elements are excluded from reveal entirely (today the hero copy
  itself starts invisible — a genuine current bug).
- One `gsap.matchMedia()` gate owns reduced-motion + pointer + viewport
  branching for every effect on the page.
- One `mk:i18n` event fired by the language switcher; every measured animation
  (ScrollTriggers, split text, drawn SVGs) re-measures on it. This is the
  bilingual insurance the whole plan depends on.

## 2. Hero — "Signal Terrain" (rewrite of hero-3d.js, wow 8)

The current mesh is the stock displaced-wireframe every three.js tutorial
produces. The rewrite keeps the gate in `main.js` untouched and gives the scene
three acts:

- **Arrival:** the surface boots as a flat horizon line and *swells* into
  terrain over ~1.2s, synced to the headline — "flat signal becomes
  dimensional", not "three.js was already running".
- **Dwell:** the fragment shader draws **topographic contour bands**
  (`fract(vH * uBands)` + `fwidth` for crisp 1px rings), navy troughs to gold
  crests. One shader change turns wallpaper into a signature. The pointer
  becomes a projected gaussian attractor — terrain physically rises toward the
  cursor, crest going gold — with a damping rectangle under the copy block so
  a crest never crosses the headline.
- **Scroll-out:** one scrubbed `uProgress` flattens the terrain back to a
  horizon as the hero leaves. The horizon *becomes* the proof strip's first
  hairline (§4).

Cost: ~0KB critical path — it all lives inside the existing lazy chunk.
Critic's condition: removing the dead `.hero__signals` markup must be an
explicit decision that also removes the orphaned i18n keys, same commit.

## 3. Arrival — one directed 1.6s timeline (wow 7)

Replaces the uncoordinated 35-fade-up load-in with a single authored shot:
hairline draws across the header → wordmark letters rise → headline words
resolve from **1px gold stroke outlines to filled white** (same gold, same
weight as the terrain's contour lines — the critic's binding condition) →
terrain swell fires from the same timeline → lede and CTAs land last. Waits on
`Promise.race([document.fonts.ready, 300ms])` so LCP is never hostage.
Failsafe: `.arriving` strips itself if the timeline never registered.

## 4. Proof strip — the ledger begins (wow 6)

The critics' consensus: this is a proof strip with no proof — four
self-descriptions in the page's strongest structural slot. Plan: hairlines draw
in staggered (IO + CSS only), values rise behind them, and the content becomes
facts that survive scrutiny — including **"Engagements underway / 2"**, the
true number, cross-linked to the work ledger so the two sections corroborate
each other. Digits live in non-`data-i18n` siblings so translation never
touches them. One cell carries the contour motif at low alpha (appearance #2
of 3).

## 5. Showreel — the reel earns the width (wow 7)

The Clay move the section half-quotes, done as clip, not layout: the frame
rests full-bleed in CSS, JS insets it with `clip-path` to exactly the hero copy
block's width, and one scrub expands it to full bleed as it enters. No pin, no
hijack — expansion rides normal scroll. Above it, a hairline rail with the
title and a **real timecode** (`00:07 / 00:42`, from `timeupdate`,
tabular-nums) — honest data as decoration. Click anywhere toggles sound.

## 6. Capabilities — service index, machined (wow 7)

- Kill the `max-height` hacks: `grid-template-rows: 0fr → 1fr` makes accordion
  height intrinsic — **this is the Spanish +20% fix**, and FAQ adopts the same
  mechanism (one accordion implementation for the whole page).
- Rows get a tabular `01–06` index column: table of contents, not template.
- Image swaps become **directional wipes** (clip-path from the direction of
  travel), preloaded on `pointerenter`, with `img.decode()` capped at ~300ms
  before the wipe (critic's fix — never wipe to a blank).
- The critics' harder demand: replace the six stock photos with the studio's
  **own artifacts** run through a navy/gold duotone — the contour shader
  itself, the concierge UI, real deliverables. Stock photography is the
  anti-slop tell no wipe can fix.

## 7. Process — the line draws the work (wow 7, survived both critics intact)

One inline SVG "comb" path over the existing top rules, scrubbed
`stroke-dashoffset` — a navy trail laid down by a gold tip, drawing the method
as you scroll. Step numbers `01–04` restyled as ~3rem outlined figures that
**ink solid** as the line reaches them. Under each step, one muted line naming
real deliverables. ~1KB, no pinning, `vector-effect: non-scaling-stroke` so it
survives any language length.

## 8. Work — honesty as art direction (wow 7 + 8)

The empty portfolio stops being a gap to apologize for:

- **The ledger becomes the instrument:** values (`0, 2, 0, 1`) at
  `clamp(3.5rem, 7vw, 7rem)` tabular-nums against 11px labels, hairlines
  drawing in staggered. The signature device: the two signed engagements
  appear as sub-rows showing only an industry descriptor plus a **redaction
  bar** — near-black with a thin gold edge (critic's contrast fix) — and
  "Names withheld until launch". It is true, it is memorable, and when a case
  publishes, the bar's removal *is* the announcement.
- **Case plates with a Flip-morph modal** (for when the 2 real cases land):
  full-bleed image plates with nothing overlaid — caption line below carries
  client, outlined index numeral, one real figure. Clicking runs GSAP Flip:
  the card's media element physically reparents into the case study. A newly
  published case enters by its redaction bar wiping away (critic's fix tying
  the arc together). Language switch with the modal open: close first, then
  re-render.

## 9. About — studio of one (wow 7)

The fake-team carousel goes. In its place, a native scroll-snap shelf of
**real artifacts**, reality-gated exactly like the logo band: only what exists
renders. The logo-band proposal itself was **killed** for now — with two
unnamed clients it renders nothing; it returns as a gated component the day
logos are usable.

## 10. AI Automation — draw the automation actually running (wow 8, intact)

Kill the fake Map/Route/Learn KPI tiles. The visual becomes a ~2KB inline SVG
trace of the **intake workflow that actually powers the concierge**: a gold
polyline threading four nodes (Intake → Match → First response → Handoff),
drawn once on entry (not scrubbed), labels as HTML `data-i18n` spans overlaid
on the SVG so geometry and language never touch. The final node terminates at
the existing concierge trigger button: the diagram's endpoint is a working
demo of itself. This is the section where the "AI systems" claim becomes
demonstrable instead of decorative.

## 11. Close — news, FAQ, footer as the dark act (wow 8)

One navy token for all three (the mismatched pair dies). News becomes a ruled
editorial index — the cursor-borne preview was cut by the constraints critic;
type and a hairline-to-gold hover carry it. FAQ inherits the capabilities
accordion mechanism. And the finale: **"Let's Talk" fills with gold as you
scroll toward it** — a ghost layer in 1px gold stroke under a solid layer
revealed by clip-path scrub. The constraints critic's amendment, adopted: the
**ghost layer is set in the other language** — scrolling fills "Hablemos" over
a ghosted "Let's Talk" (and inverted in Spanish). Bilingualism as the design
device — the one brand fact no competitor shares. Both layers carry
`data-i18n`; the swap costs nothing.

Condition attached by both critics: wire the newsletter form to the funnel
backend that already exists, or delete the block. A dead form in the finale
undermines the whole honesty thesis.

## 12. Header + hand feel (merged spec, wow 6–7)

One spec, one owner (the critics forced a merge of two overlapping proposals):
a sliding gold underline that is *also* the scroll progress indicator, a
dropdown whose items actually navigate to distinct targets, magnetic
micro-physics on the CTA and key links via `gsap.quickTo` (±10px, fine
pointers only), and a wordmark with a load-in identity. No custom cursor — cut
as decoration without narrative.

---

## Killed, and why

| Proposal | Verdict |
|---|---|
| Standalone load-choreography system | Redundant — every job it claimed is owned better by the arrival timeline (§3) and the reveal spine (§1). |
| Client logo band | Honest gate + zero real logos = renders nothing. Returns when logos exist. |
| Cursor-borne news preview | Cost without narrative; restraint is the brand-consistent move. |
| Custom cursor (inside connective-tissue) | Same reason. |

## Budget accounting

| Item | Cost |
|---|---|
| GSAP core + ScrollTrigger | ~70KB (already sanctioned in direction.md §5.2) |
| GSAP Flip plugin | ~9KB |
| Everything else combined (SVGs, stage, CSS) | ~10KB |
| **New critical path** | **~326KB** — past the 300KB warn *by design* (the warn is the visible flag), under the 400KB fail with ~74KB of headroom |
| Hero rewrite | 0KB critical path (lives in the existing lazy chunk) |
| Case imagery, when real cases land | ~60–120KB AVIF each, lazy, below fold |

Mobile: no WebGL (unchanged, per §3.1 of the direction record); the contour
signature reaches mobile as the static SVG motif and the drawn hairlines,
which cost nothing. Every scrub falls to a simple settled state under
`prefers-reduced-motion` — CI already enforces the kill-switch exists.

## Build order

1. **Reveal spine** (§1) — prerequisite, zero visual change, fixes a real
   current bug (invisible above-fold content).
2. **Stage + color story** (§0) and **hero Signal Terrain + arrival** (§2–3) —
   the signature act.
3. **Header merged spec** (§12).
4. **Daylight sections** (§4–7): proof, showreel, capabilities, process.
5. **The proof arc** (§8–9): ledger + redaction bars now; Flip plates when the
   two real cases have imagery and permission.
6. **The dark close** (§10–11): AI trace, news, FAQ, footer finale.

Each phase ships independently and `npm run verify` gates every one. The
deploy remains manual (`wrangler pages deploy` + purge — see direction.md §1).
