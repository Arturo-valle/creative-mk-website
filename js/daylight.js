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
  initShowreelScrub();
  initFooterFinale();
  initWayfinding();
  initHeadlineReveals();
  initLanguageScramble();
}

/* ---- §11: the finale — Hablemos fills over its other-language ghost ---- */

function initFooterFinale() {
  var fill = document.querySelector('.footer__cta-title--fill');
  var stack = document.querySelector('.footer__cta-stack');
  if (!fill || !stack) return;

  gsap.fromTo(fill,
    { '--cta-clip': '100%' },
    {
      '--cta-clip': '0%',
      ease: 'none',
      immediateRender: true,
      scrollTrigger: {
        trigger: '.footer__cta',
        start: 'top 85%',
        end: 'top 35%',
        scrub: 0.6
      }
    });

  /* Magnetic micro-physics on fine pointers only: the word leans toward the
     hand, ±10px, springs back on leave. */
  if (window.matchMedia('(pointer: fine)').matches) {
    var qx = gsap.quickTo(stack, 'x', { duration: 0.4, ease: 'power3' });
    var qy = gsap.quickTo(stack, 'y', { duration: 0.4, ease: 'power3' });
    stack.addEventListener('pointermove', function (e) {
      var r = stack.getBoundingClientRect();
      qx(gsap.utils.clamp(-10, 10, (e.clientX - (r.left + r.width / 2)) / r.width * 24));
      qy(gsap.utils.clamp(-10, 10, (e.clientY - (r.top + r.height / 2)) / r.height * 24));
    });
    stack.addEventListener('pointerleave', function () { qx(0); qy(0); });
  }
}

/* ---- §5: the reel earns the width ---- */

function initShowreelScrub() {
  var frame = document.querySelector('.showreel__frame');
  var rail = document.querySelector('.showreel__rail');
  var video = document.getElementById('hero-video');
  var timecode = document.getElementById('showreel-timecode');
  var btn = document.getElementById('hero-play-btn');
  if (!frame || !rail) return;

  /* The frame starts clipped to the rail's CONTENT width — the reel opens
     exactly as wide as the copy above it, then earns the full bleed. The
     container's clientWidth includes its own padding, so subtract it.
     Function-based: invalidateOnRefresh re-measures on resize and language
     swaps. */
  var startInset = function () {
    var cs = getComputedStyle(rail);
    var content = rail.clientWidth
      - parseFloat(cs.paddingLeft || 0)
      - parseFloat(cs.paddingRight || 0);
    return Math.max((frame.clientWidth - content) / 2, 0) + 'px';
  };

  gsap.fromTo(frame,
    { '--reel-inset': startInset, '--reel-radius': '28px' },
    {
      '--reel-inset': '0px',
      '--reel-radius': '0px',
      ease: 'none',
      immediateRender: true,
      scrollTrigger: {
        trigger: '#showreel',
        start: 'top 80%',
        end: 'top 15%',
        scrub: 0.6,
        invalidateOnRefresh: true
      }
    });

  /* Honest data as decoration: the actual playback clock, ~4Hz. The element
     ships hidden (css) and only appears once real metadata exists — an
     instrument that reads "0:00 / 0:00" forever is a lie, and reduced-motion
     visitors whose video never loads should see no clock at all. */
  if (video && timecode) {
    var fmt = function (s) {
      if (!isFinite(s)) return '0:00';
      var m = Math.floor(s / 60);
      var sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    };
    video.addEventListener('loadedmetadata', function () {
      timecode.style.visibility = 'visible';
      timecode.textContent = fmt(0) + ' / ' + fmt(video.duration);
    });
    video.addEventListener('timeupdate', function () {
      timecode.textContent = fmt(video.currentTime) + ' / ' + fmt(video.duration);
    });
  }

  /* The whole frame toggles sound; the button keeps doing the real work. */
  if (btn) {
    frame.addEventListener('click', function (event) {
      if (event.target.closest('#hero-play-btn')) return;
      btn.click();
    });
  }
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

/* ---- §12: wayfinding — the underline that knows where you are ---- */

function initWayfinding() {
  var nav = document.getElementById('main-nav');
  var underline = nav && nav.querySelector('.header__nav-underline');
  if (!nav || !underline) return;

  var targets = {
    work: nav.querySelector('[data-nav-section="work"]'),
    capabilities: nav.querySelector('[data-nav-section="capabilities"]'),
    about: nav.querySelector('[data-nav-section="about"]'),
    news: nav.querySelector('[data-nav-section="news"]')
  };
  /* Which nav item answers for each section. Dark act and footer point at
     nothing: the underline bows out rather than lying. */
  var sectionMap = {
    capabilities: 'capabilities',
    process: 'capabilities',
    'ai-automation': 'capabilities',
    work: 'work',
    about: 'about',
    news: 'news',
    faq: 'news'
  };

  var current = null;

  function moveTo(key) {
    if (key === current) return;
    current = key;
    var link = key && targets[key];
    if (!link) {
      gsap.to(underline, { opacity: 0, duration: 0.25 });
      return;
    }
    gsap.to(underline, {
      x: link.offsetLeft,
      width: link.offsetWidth,
      opacity: 1,
      duration: 0.45,
      ease: 'power3.out'
    });
  }

  /* The spy: whichever mapped section owns the middle of the viewport wins. */
  var visible = new Map();
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
    });
    var best = null, bestRatio = 0;
    visible.forEach(function (ratio, id) {
      if (ratio > bestRatio) { bestRatio = ratio; best = id; }
    });
    moveTo(best ? sectionMap[best] : null);
  }, { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.05, 0.25, 0.5] });

  Object.keys(sectionMap).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) spy.observe(section);
  });

  /* Link widths change with the language; re-aim the underline. */
  var reaim = function () {
    var key = current;
    current = null;
    moveTo(key);
  };
  window.addEventListener('resize', reaim);
  document.addEventListener('mk:i18n', function () { setTimeout(reaim, 50); });

  /* Dropdown items that carry a data-cap-index open their accordion row on
     arrival instead of just parking the viewport at the section top. */
  document.addEventListener('click', function (event) {
    var item = event.target.closest && event.target.closest('[data-cap-index]');
    if (!item) return;
    var idx = item.getAttribute('data-cap-index');
    var header = document.querySelector(
      '#capabilities-list .accordion-header[data-service-index="' + idx + '"]'
    );
    if (header && header.getAttribute('aria-expanded') !== 'true') header.click();
  });

  /* Magnetic contact button, fine pointers only. */
  var cta = document.querySelector('.header__contact-btn');
  if (cta && window.matchMedia('(pointer: fine)').matches) {
    var qx = gsap.quickTo(cta, 'x', { duration: 0.35, ease: 'power3' });
    var qy = gsap.quickTo(cta, 'y', { duration: 0.35, ease: 'power3' });
    cta.addEventListener('pointermove', function (e) {
      var r = cta.getBoundingClientRect();
      qx(gsap.utils.clamp(-6, 6, (e.clientX - (r.left + r.width / 2)) / r.width * 12));
      qy(gsap.utils.clamp(-6, 6, (e.clientY - (r.top + r.height / 2)) / r.height * 12));
    });
    cta.addEventListener('pointerleave', function () { qx(0); qy(0); });
  }
}

/* ---- Week 2: type. Masked line reveals + the EN/ES scramble ---- */

/* Section headlines rise out of line masks as they enter — the standard
   kinetic-type register of current winners, applied only below the fold (the
   hero has its own arrival). Splits happen after fonts are ready so line
   breaks are measured against the real face, and re-split on every language
   swap because Spanish breaks differently. */
function initHeadlineReveals() {
  if (typeof SplitText === 'undefined') return;
  gsap.registerPlugin(SplitText);

  var SELECTOR = [
    '.proof__title', '.capabilities .section-title', '.process .section-title',
    '.ai-automation__title', '.work__title', '.about__title',
    '.news__title', '.faq__title'
  ].join(', ');

  var splits = [];

  function teardown() {
    splits.forEach(function (s) {
      if (s.trigger) s.trigger.kill();
      s.split.revert();
    });
    splits = [];
  }

  function build() {
    document.querySelectorAll(SELECTOR).forEach(function (el) {
      if (!el.textContent.trim()) return;
      var split = SplitText.create(el, { type: 'lines', mask: 'lines' });
      var tween = gsap.from(split.lines, {
        yPercent: 115,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true }
      });
      splits.push({ split: split, trigger: tween.scrollTrigger });
    });
  }

  var ready = (document.fonts && document.fonts.ready) || Promise.resolve();
  Promise.race([ready, new Promise(function (r) { setTimeout(r, 400); })]).then(build);

  document.addEventListener('mk:i18n', function () {
    /* The swap rewrote the headlines' innerHTML, orphaning the old splits;
       rebuild against the new text after the DOM settles. */
    teardown();
    setTimeout(build, 60);
  });
}

/* The signature only a bilingual studio can have: switching language plays a
   short per-word scramble on the hero headline — glyphs cycle and resolve
   into the other language. Skipped while the arrival shot still owns the
   hero, and never constructed under reduced motion (the caller gates). */
function initLanguageScramble() {
  var GLYPHS = 'abcdefghijklmnopqrstuvwxyzáéíóñ—·';

  document.addEventListener('mk:i18n', function () {
    var root = document.documentElement;
    if (root.classList.contains('js-arrival') && !root.classList.contains('js-arrival-done')) return;
    var words = document.querySelectorAll('#hero-title .word');
    if (!words.length) return;

    words.forEach(function (word, i) {
      var target = word.textContent;
      var state = { p: 0 };
      gsap.to(state, {
        p: 1,
        duration: 0.5,
        delay: i * 0.05,
        ease: 'power2.in',
        onUpdate: function () {
          var settled = Math.floor(target.length * state.p);
          var out = target.slice(0, settled);
          for (var c = settled; c < target.length; c++) {
            out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          word.textContent = out;
        },
        onComplete: function () { word.textContent = target; }
      });
    });
  });
}
