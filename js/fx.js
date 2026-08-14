/* ============================================
   The motion language, declared in markup (direction.md §5.1.1).

   `data-fx` is how every page — services, cases, notes, legal, the /es/
   mirrors when they land — inherits the site's motion without owning a
   script. The effect is named where the content lives:

     data-fx="lines"     headline/lede: SplitText line masks rise
     data-fx="words"     words rise in a loosely shuffled order
     data-fx="fade-up"   a block lifts in
     data-fx="group"     direct children lift in, staggered
     data-fx="draw"      a rule draws in from the left

   Optional: data-fx-delay="0.2" (seconds, after the trigger fires).

   The three binding criteria (direction.md §5.1.1) shape everything here:

   1. Reduced motion: nothing arms — the matchMedia gate below is the only
      entry point, so PRM (and no-JS, trivially) reads finished content.
   2. EN→ES→EN: text is split lazily, at reveal time, so a swap before the
      reveal costs nothing. A swap after the reveal overwrites the split
      DOM with plain visible text — the finished state — so the dead
      SplitText instance is discarded, never reverted: revert() would
      resurrect the pre-swap language.
   3. No-JS: the hidden state is applied by gsap.set at arm time, never by
      CSS. Markup alone renders complete.

   Costs ~2KB. Consumes the vendored gsap + ScrollTrigger + SplitText.
   ============================================ */

(function () {
  'use strict';

  var live = []; // { el, split } — splits that exist right now

  function arm(gsap, ScrollTrigger, SplitTextCtor) {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-fx]'));
    if (!nodes.length) return;

    nodes.forEach(function (el) {
      var kind = el.getAttribute('data-fx');
      var delay = parseFloat(el.getAttribute('data-fx-delay')) || 0;

      /* Hidden only from here on — a JS decision, revocable by no JS. */
      var targets = kind === 'group'
        ? Array.prototype.slice.call(el.children)
        : [el];
      if (!targets.length) return;

      if (kind === 'draw') {
        gsap.set(el, { scaleX: 0, transformOrigin: 'left center' });
      } else {
        gsap.set(targets, { autoAlpha: 0 });
      }

      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: function () { reveal(el, kind, targets, delay, gsap, SplitTextCtor); }
      });
    });

    /* A language swap nukes any split line DOM by writing textContent over
       it — which is the finished, visible state in the new language. The
       instance is dead; reverting it would restore the old language. */
    document.addEventListener('mk:i18n', function () {
      live.forEach(function (entry) { entry.split = null; });
      live.length = 0;
    });

    /* The failsafe direction.md §3.2 made standing practice.

       Hiding an element from JS and revealing it from a scroll trigger has
       one catastrophic failure mode: the hide runs, the reveal never does,
       and content is invisible forever on a page that looks like it loaded.
       That happened here once already with the .reveal spine.

       Two guards. On `load`, anything already inside the viewport is
       revealed outright — it should never have needed a scroll. And a
       ceiling: three seconds after load, any node still hidden is shown
       regardless of where it sits, because a reveal that has not fired by
       then is a bug, and a bug must not cost the visitor the page. */
    function rescue(viewportOnly) {
      nodes.forEach(function (el) {
        /* The test is visibility, not the data-fx-done marker. The marker
           means "the reveal fired", which is not the same as "the element
           can be read": a tween that was created and then never advanced
           leaves the element marked and invisible, and an earlier version of
           this guard skipped exactly those. */
        var kindNow = el.getAttribute('data-fx');
        var probe = kindNow === 'group' ? (el.firstElementChild || el) : el;
        if (kindNow !== 'draw' && getComputedStyle(probe).visibility !== 'hidden') return;
        if (viewportOnly) {
          var box = el.getBoundingClientRect();
          if (box.top > window.innerHeight || box.bottom < 0) return;
        }
        var kind = el.getAttribute('data-fx');
        var targets = kind === 'group' ? Array.prototype.slice.call(el.children) : [el];
        el.setAttribute('data-fx-done', '');
        /* Kill first, then set. A reveal tween that was created but never
           advanced is still live, and it re-asserts opacity 0 on the next
           tick — so a rescue that only writes the final state gets quietly
           overwritten by the animation it was rescuing the element from. */
        gsap.killTweensOf(targets);
        if (kind === 'draw') gsap.set(el, { scaleX: 1 });
        else gsap.set(targets, { autoAlpha: 1, y: 0 });
      });
    }

    window.addEventListener('load', function () {
      ScrollTrigger.refresh();
      rescue(true);
      window.setTimeout(function () { rescue(false); }, 3000);
    });
  }

  function reveal(el, kind, targets, delay, gsap, SplitTextCtor) {
    /* The marker CSS hooks onto (css/subpage.css uses it for the figure's
       raking sweep). An attribute, not a class, so it cannot collide with
       the older .reveal/.revealed observer spine that still owns the
       homepage. */
    el.setAttribute('data-fx-done', '');

    if (kind === 'draw') {
      gsap.to(el, { scaleX: 1, duration: 0.9, delay: delay, ease: 'power3.inOut' });
      return;
    }

    if ((kind === 'lines' || kind === 'words') && SplitTextCtor) {
      try {
        var split = new SplitTextCtor(el, kind === 'lines'
          ? { type: 'lines', mask: 'lines', linesClass: 'fx-line' }
          : { type: 'words', wordsClass: 'fx-word' });
        live.push({ el: el, split: split });
        var parts = kind === 'lines' ? split.lines : split.words;
        gsap.set(el, { autoAlpha: 1 });
        gsap.from(parts, {
          yPercent: 110,
          autoAlpha: kind === 'words' ? 0 : 1,
          duration: 0.8,
          delay: delay,
          ease: 'power3.out',
          stagger: kind === 'lines'
            ? 0.09
            : { each: 0.045, from: 'random' }
        });
        return;
      } catch (error) {
        /* Splitting can fail on exotic content; fall through to the lift. */
      }
    }

    gsap.to(targets, {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      delay: delay,
      ease: 'power2.out',
      stagger: targets.length > 1 ? 0.08 : 0,
      startAt: { y: 18 }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
    window.gsap.registerPlugin(window.ScrollTrigger);

    /* The PRM gate is the single entry point: outside it, no element is
       ever hidden and the markup reads as written. matchMedia re-arms if
       the preference flips mid-visit. */
    window.gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', function () {
      arm(window.gsap, window.ScrollTrigger,
        typeof window.SplitText !== 'undefined' ? window.SplitText : null);
    });
  });
})();
