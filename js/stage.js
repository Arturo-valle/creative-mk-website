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

/* Lenis: the lerp'd, inertial scroll that every scrubbed piece on this page
   reads through. Same wiring as the proven js/lp/main.js block — Lenis drives
   ScrollTrigger, GSAP's ticker drives Lenis, lagSmoothing off so scrub values
   never rubber-band. Native touch is left alone (syncTouch: false); reduced
   motion never constructs it. The skip-nav link keeps native jump behaviour:
   smooth-scrolling an accessibility escape hatch defeats its purpose. */
function initLenis() {
  if (typeof window.Lenis !== 'function') return null;
  var lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]:not(.skip-nav)').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0 });
    });
  });
  return lenis;
}

function initStage() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);
  initLenis();

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
