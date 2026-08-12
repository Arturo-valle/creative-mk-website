/* ============================================
   The gold cursor — one hand identity for the whole site (audit gap 10).

   A small gold follower that lerps after the pointer and opens into a ring
   over anything interactive. It never replaces the native cursor — replacing
   an accessibility primitive for style is the kind of decoration the audit
   killed — it accompanies it. Fine pointers only, never under reduced
   motion, and it rides the same deferred GSAP everything else uses.
   ============================================ */

function initCursor() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  if (typeof gsap === 'undefined') return;

  var dot = document.createElement('div');
  dot.className = 'mk-cursor';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);

  var toX = gsap.quickTo(dot, 'x', { duration: 0.35, ease: 'power3' });
  var toY = gsap.quickTo(dot, 'y', { duration: 0.35, ease: 'power3' });

  var INTERACTIVE = 'a, button, [role="button"], input, textarea, select, .accordion-header';

  window.addEventListener('pointermove', function (e) {
    toX(e.clientX);
    toY(e.clientY);
    dot.classList.add('mk-cursor--alive');
    dot.classList.toggle('mk-cursor--open', !!(e.target.closest && e.target.closest(INTERACTIVE)));
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', function () {
    dot.classList.remove('mk-cursor--alive');
  });

  window.addEventListener('pointerdown', function () {
    dot.classList.add('mk-cursor--press');
  }, { passive: true });
  window.addEventListener('pointerup', function () {
    dot.classList.remove('mk-cursor--press');
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', initCursor);
