/* ============================================
   The stage — Act I to Act II crossfade.

   Companion to css/stage.css (docs/immersive-plan.md §0). One scrubbed tween:
   the ink plane fades out as the showreel leaves the viewport, so the page
   opens dark and the house lights come up exactly once. No pinning, no scroll
   hijack — the fade rides normal scroll travel.

   Enable conditions, all of them:
   - motion is allowed (prefers-reduced-motion not set),
   - GSAP + ScrollTrigger loaded (deferred vendor scripts; if either failed,
     the page keeps its solid section backgrounds),
   - css/stage.css actually applied. The last check is the cache guard: the
     zone serves CSS with a 4-hour edge TTL, so right after a deploy a visitor
     can hold new JS and stale CSS. Stripping section backgrounds without the
     stage styled behind them would leave text on the body background — so if
     the stage does not measure as position:fixed, we put everything back and
     walk away.
   ============================================ */

function initStage() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var stage = document.querySelector('.page-stage');
  var ink = document.querySelector('.page-stage__ink');
  var reel = document.getElementById('showreel');
  if (!stage || !ink || !reel) return;

  var root = document.documentElement;
  root.classList.add('js-stage');
  if (getComputedStyle(stage).position !== 'fixed') {
    root.classList.remove('js-stage');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.to(ink, {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: reel,
      start: 'bottom 80%',
      end: 'bottom 20%',
      scrub: true
    }
  });

  /* The EN/ES swap changes text length, which changes every section's offset.
     Re-measure instead of guessing. */
  document.addEventListener('mk:i18n', function () {
    ScrollTrigger.refresh();
  });
}

document.addEventListener('DOMContentLoaded', initStage);
