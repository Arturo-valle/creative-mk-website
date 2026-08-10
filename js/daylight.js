/* ============================================
   Daylight scenes — the process line and the workflow trace.

   Two of the three cuadrito-killers (immersive-plan §7 and §10; the proof
   ledger is pure CSS on the reveal observer). Everything here is gated the
   same way as the stage: motion allowed, GSAP + ScrollTrigger present. The
   `js-daylight` class on <html> is what flips the sections from their static
   finished states into drawable ones, so a visitor without any of this sees
   the complete drawing, never a blank.

   The process line's geometry is measured from the real grid — column
   offsets change with language and viewport, so it rebuilds on resize and on
   every mk:i18n. The trace's geometry is a fixed viewBox; only its labels
   are language-aware, and they are HTML.
   ============================================ */

function initDaylight() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('js-daylight');

  initProcessLine();
  initAiTrace();
}

/* ---- §7: the line draws the work ---- */

function initProcessLine() {
  var grid = document.getElementById('process-grid');
  if (!grid) return;

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'process__line');
  svg.setAttribute('aria-hidden', 'true');

  var trail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  trail.setAttribute('class', 'process__line-trail');
  trail.setAttribute('pathLength', '1');

  var tip = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  tip.setAttribute('class', 'process__line-tip');
  tip.setAttribute('pathLength', '1');

  svg.appendChild(trail);
  svg.appendChild(tip);
  grid.appendChild(svg);

  var steps = Array.prototype.slice.call(grid.querySelectorAll('.process__step'));

  /* One run along the grid's top edge with a short tick down at each step's
     left edge. Measured in pixels from the live layout; pathLength="1" keeps
     the dash math in 0..1 no matter what the geometry measures. */
  function build() {
    var width = grid.clientWidth;
    var d = 'M0 1 H' + width;
    steps.forEach(function (step) {
      var x = step.offsetLeft + 1;
      d += ' M' + x + ' 1 V34';
    });
    trail.setAttribute('d', d);
    tip.setAttribute('d', d);
    svg.setAttribute('viewBox', '0 0 ' + width + ' 48');
    svg.setAttribute('width', width);
  }
  build();

  var state = { p: 0 };
  trail.style.strokeDasharray = '1';
  trail.style.strokeDashoffset = '1';
  /* The tip is a short gold dash riding just ahead of the navy trail. */
  tip.style.strokeDasharray = '0.03 1';
  tip.style.strokeDashoffset = '1.015';

  gsap.to(state, {
    p: 1,
    ease: 'none',
    onUpdate: function () {
      trail.style.strokeDashoffset = String(1 - state.p);
      tip.style.strokeDashoffset = String(1.015 - state.p);
    },
    scrollTrigger: {
      trigger: '#process',
      start: 'top 70%',
      end: 'bottom 60%',
      scrub: 0.8
    }
  });

  steps.forEach(function (step) {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 65%',
      once: true,
      onEnter: function () { step.classList.add('is-passed'); }
    });
  });

  var rebuild = function () { build(); };
  window.addEventListener('resize', rebuild);
  document.addEventListener('mk:i18n', rebuild);
}

/* ---- §10: the workflow trace ---- */

function initAiTrace() {
  var trace = document.getElementById('ai-trace');
  if (!trace) return;

  var path = trace.querySelector('.ai-trace__path');
  var nodes = Array.prototype.slice.call(trace.querySelectorAll('.ai-trace__node'));
  var labels = Array.prototype.slice.call(trace.querySelectorAll('.ai-trace__label'));

  /* Hide from the finished state only now that JS owns the redraw. */
  gsap.set(path, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(nodes, { scale: 0 });
  labels.forEach(function (l) { l.classList.add('is-pending'); });

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: trace,
      start: 'top 70%',
      once: true
    }
  });

  /* Drawn once, top to bottom, not scrubbed: an intake runs forward. */
  tl.to(path, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 0);
  nodes.forEach(function (node, i) {
    var at = 0.1 + i * 0.38;
    tl.to(node, { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }, at);
    tl.call(function () { labels[i] && labels[i].classList.remove('is-pending'); }, null, at + 0.1);
  });
}

document.addEventListener('DOMContentLoaded', initDaylight);
