/* ============================================
   The arrival — one directed opening shot (immersive-plan §3).

   Replaces the uncoordinated word-fade with a single timeline: the header
   hairline draws, the headline resolves from 1px gold stroke outlines — the
   same weight and gold as the terrain's contour lines — to filled white, and
   the lede and CTAs land last. The terrain's own swell (hero-3d.js ACT 1)
   starts when its lazy chunk arrives, a beat later, so the sequence reads
   copy-then-landscape.

   Ownership contract mirrors the reveal bootstrap: index.html adds
   `js-arrival` pre-paint (JS running, motion allowed); this file claims it by
   setting data-arrival-ready, and the bootstrap's load handler strips the
   class if nobody claimed it — a blocked script leaves a fully readable hero.
   On completion we ADD `js-arrival-done` rather than removing the start
   class: the done-state rules in css/stage.css override the hidden states and
   also disarm the legacy wordFadeIn replay when the EN/ES swap re-splits the
   headline.
   ============================================ */

function initArrival() {
  var root = document.documentElement;
  if (!root.classList.contains('js-arrival')) return;

  var title = document.getElementById('hero-title');
  if (!title || typeof gsap === 'undefined') {
    root.classList.remove('js-arrival');
    return;
  }

  /* Split the headline ourselves if nothing has yet. animateHeroTitle() in
     js/animations.js does the same work and is idempotent, so whichever runs
     first wins and the other finds the job done. */
  if (!title.querySelector('.word') && typeof animateHeroTitle === 'function') {
    animateHeroTitle();
  }
  var words = title.querySelectorAll('.word');
  if (!words.length) {
    root.classList.remove('js-arrival');
    return;
  }

  root.dataset.arrivalReady = 'true';

  /* Inter Variable is preloaded, but the shot must never be hostage to it:
     whichever wins — fonts ready or 300ms — starts the timeline. */
  var fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
  Promise.race([
    fontsReady,
    new Promise(function (resolve) { setTimeout(resolve, 300); })
  ]).then(function () {
    var tl = gsap.timeline({
      onComplete: function () { root.classList.add('js-arrival-done'); }
    });

    tl.to('.header__rule', { scaleX: 1, duration: 0.45, ease: 'power2.out' }, 0);
    tl.to('.hero__eyebrow', { opacity: 1, duration: 0.4, ease: 'none' }, 0.15);

    /* The words resolve via CSS transitions; the timeline only conducts. */
    words.forEach(function (word, i) {
      tl.call(function () { word.classList.add('word--in'); }, null, 0.25 + i * 0.08);
    });

    var tail = 0.25 + words.length * 0.08 + 0.15;
    tl.to(['.hero__lede', '.hero__actions'], {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.1
    }, tail);

    /* If the visitor switches language mid-shot, the headline re-splits and
       the new spans would wait for calls that already fired. Finish the shot
       instantly; the done-state takes over. */
    document.addEventListener('mk:i18n', function () {
      if (tl.progress() < 1) tl.progress(1);
    }, { once: true });
  });
}

document.addEventListener('DOMContentLoaded', initArrival);
