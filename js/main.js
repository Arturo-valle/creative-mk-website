/* ============================================
   Main.js - Content Data & Initialization
   ============================================ */

/* One source of truth (audit 2026-08-13): the services and FAQ copy lives
   in src/_data/ and reaches this script as a build-time JSON island in
   index.html (#mk-data, emitted from src/_data/mkIsland.js). The August
   rebuild copied these strings into the data files but left the originals
   here, so a copy edit could make the accordion and the service pages
   silently disagree. Now the accordion renders from the same bytes Eleventy
   renders the pages from. On URLs without the island the arrays are empty
   and the renderers no-op — those pages have no accordion. */
const mkData = (() => {
  const island = document.getElementById('mk-data');
  if (!island) return null;
  try { return JSON.parse(island.textContent); } catch (error) { return null; }
})();

const SERVICE_SLUGS = mkData
  ? mkData.services.map((s) => s.slug)
  : ['branding', 'websites', 'product-ux-ui', 'growth', 'ai-automation', 'development'];

const servicesData = {
  en: mkData ? mkData.services.map((s) => Object.assign({ media: s.media }, s.en)) : [],
  es: mkData ? mkData.services.map((s) => Object.assign({ media: s.media }, s.es)) : []
};



const faqData = mkData ? mkData.faq : { en: [], es: [] };

const _capabilitiesVisualBound = new WeakSet();

function renderCapabilities() {
  const list = document.getElementById('capabilities-list');
  if (!list) return;
  const data = servicesData[currentLang];
  /* Layer-aware initial write: after swaps the visible <picture> may be either
     layer, and a language switch resets the accordion to row 0 — the image
     and the wipe state have to follow. */
  const visual = document.getElementById('capabilities-visual');
  if (visual && data[0]) {
    const layers = visual.querySelectorAll('.cap-layer');
    const front = layers[Number(visual.dataset.front || 0)] || layers[0];
    if (front) setCapLayerSources(front, data[0], data[0].title);
    visual.dataset.current = '0';
  }
  list.innerHTML = data.map((s, i) => `
    <div class="accordion-item reveal${i === 0 ? ' active' : ''}">
      <button class="accordion-header" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="cap-content-${i}" data-service-index="${i}">
        <span class="accordion-index" aria-hidden="true">0${i + 1}</span>
        <span>
          <span class="accordion-kicker">${s.lead}</span>
          <a class="accordion-title" href="/services/${SERVICE_SLUGS[i]}/">${s.title}</a>
        </span>
        <span class="accordion-icon"></span>
      </button>
      <div class="accordion-content" id="cap-content-${i}" role="region">
        <div class="accordion-content__inner">
          <div>
            <p class="accordion-text">${s.hook || s.proof}</p>
            <a class="accordion-more link-arrow" href="/services/${SERVICE_SLUGS[i]}/">${currentLang === 'es' ? 'Ver el servicio' : 'See the service'}</a>
          </div>
        </div>
      </div>
    </div>`).join('');

  initCapabilitiesVisualSwap(list);
  initAccordion('#capabilities-list');
  initAnimations();
}

/**
 * Directional wipe between service images (immersive-plan §6).
 *
 * Two stacked <picture> layers inside #capabilities-visual. Selecting a row
 * below the current one wipes the incoming image in from the bottom; a row
 * above wipes from the top — the visual travels the way the index does. The
 * incoming image is written to the hidden layer, decoded (capped at 300ms so
 * a slow network degrades to an instant swap, never a blank wipe), then
 * clip-path reveals it and the layers trade roles.
 *
 * On hover-capable devices the target image is preloaded on pointerenter —
 * fetching on explicit intent, at most one image per hover.
 *
 * Without GSAP the wipe falls back to writing the visible layer directly:
 * exactly the old behaviour, minus the crossfade.
 */
function setCapLayerSources(layer, service, title) {
  const base = service.media.replace(/\.(jpg|png)$/i, '');
  const avif = layer.querySelector('source[type="image/avif"]');
  const webp = layer.querySelector('source[type="image/webp"]');
  const img = layer.querySelector('img');
  if (avif) avif.srcset = `${base}-480.avif 480w, ${base}-960.avif 960w`;
  if (webp) webp.srcset = `${base}-480.webp 480w, ${base}-960.webp 960w`;
  img.src = service.media;
  img.alt = `${title} preview`;
  return img;
}

function initCapabilitiesVisualSwap(list) {
  if (_capabilitiesVisualBound.has(list)) return;
  _capabilitiesVisualBound.add(list);

  const visual = document.getElementById('capabilities-visual');
  const layers = visual ? visual.querySelectorAll('.cap-layer') : [];
  /* State lives on the DOM, not in this closure: renderCapabilities re-runs on
     every EN/ES swap and needs to reset it (see its layer-aware write). */
  const getFront = () => Number(visual.dataset.front || 0);
  const getCurrent = () => Number(visual.dataset.current || 0);
  let animating = false;

  const decodeCapped = (img) =>
    Promise.race([
      img.decode ? img.decode().catch(() => {}) : Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 300))
    ]);

  // Preload on intent, hover devices only.
  if (window.matchMedia('(hover: hover)').matches) {
    list.addEventListener('pointerenter', (e) => {
      const header = e.target.closest && e.target.closest('.accordion-header');
      if (!header) return;
      const service = servicesData[currentLang][Number(header.dataset.serviceIndex)];
      if (!service) return;
      const probe = new Image();
      probe.src = service.media;
    }, true);
  }

  list.addEventListener('click', async (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;
    const idx = Number(header.dataset.serviceIndex);
    const service = servicesData[currentLang][idx];
    if (!service || layers.length < 2 || idx === getCurrent()) return;

    const front = layers[getFront()];
    const back = layers[1 - getFront()];
    const fromBelow = idx > getCurrent();
    visual.dataset.current = String(idx);

    if (typeof gsap === 'undefined' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCapLayerSources(front, service, service.title);
      return;
    }
    if (animating) gsap.killTweensOf(back);
    animating = true;

    const img = setCapLayerSources(back, service, service.title);
    await decodeCapped(img);

    back.style.zIndex = 2;
    front.style.zIndex = 1;
    gsap.fromTo(back,
      { clipPath: fromBelow ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)' },
      {
        clipPath: 'inset(0% 0 0% 0)',
        duration: 0.6,
        ease: 'power3.inOut',
        onComplete: () => {
          visual.dataset.front = String(1 - getFront());
          animating = false;
        }
      });
    gsap.fromTo(back.querySelector('img'),
      { scale: 1.06 }, { scale: 1, duration: 0.7, ease: 'power2.out' });
  });
}

/**
 * The home's work section is a teaser, not the ledger (audit 2026-08-13).
 * The two workplates render at build time from src/_data/cases.js; this
 * writes the one honest line under them. The full ledger — published,
 * signed, awards, team, the redaction bars — now lives at /work/ as static
 * bilingual markup: a homepage that repeats the destination teaches the
 * visitor the destination is not worth the click. Kept as `renderWork`
 * because js/i18n.js re-invokes that name on every language switch, and it
 * still claims its own reveal elements for the observer.
 */
function renderWork() {
  const grid = document.getElementById('work-grid');
  if (!grid) return;
  const t = (key) => (translations[currentLang] || {})[key] || '';
  grid.innerHTML = `
      <p class="work__summary reveal">${t('work.summary')}</p>`;
  initAnimations();
}

function renderFAQ() {
  const list = document.getElementById('faq-list');
  if (!list) return;
  /* Three at the door (audit 2026-08-13): the FAQ was the richest copy on
     the property and it lived only here, which made the home the page of
     record for every question. The service pages now carry their own FAQs;
     the home keeps the three orientation questions and sends the rest
     deeper. faqEntities.js slices identically so the schema never declares
     more than the page shows. */
  const data = faqData[currentLang].slice(0, 3);
  list.innerHTML = data.map((f, i) => `
    <div class="accordion-item reveal">
      <button class="accordion-header" aria-expanded="false" aria-controls="faq-content-${i}">
        <span class="accordion-title">${f.q}</span>
        <span class="accordion-icon"></span>
      </button>
      <div class="accordion-content" id="faq-content-${i}" role="region">
        <div class="accordion-content__inner">
          <p class="accordion-text">${f.a}</p>
        </div>
      </div>
    </div>`).join('');
  initAccordion('#faq-list');
  initAnimations();
}

/* The stock "team" carousel was deleted 2026-08-10: six strangers above a
   ledger that says "Team: 1" was the loudest honesty contradiction on the
   page. An artifacts shelf takes this slot when real artifacts exist. */

/**
 * The newsletter now actually subscribes. It posts to the same Worker
 * lead-capture endpoint the concierge and the lp form use — the funnel
 * backend that already exists — and only claims success when the server
 * agrees. The previous version hid the form and showed "thanks" while
 * discarding the address, which was the most falsifiable claim on the page.
 */
function newsletterEndpoint() {
  const prod = /(^|\.)creativemk\.net$/i.test(location.hostname)
    ? location.origin
    : 'https://creative-mk-concierge.arturo-ordonezv.workers.dev';
  let session;
  try {
    session = localStorage.getItem('creativeMkSession');
    if (!session) {
      session = `mk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('creativeMkSession', session);
    }
  } catch (error) {
    session = `mk-${Date.now().toString(36)}`;
  }
  return `${prod}/agents/creative-mk-concierge/${encodeURIComponent(session)}/lead-capture`;
}

function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const success = document.getElementById('newsletter-success');
  if (!form || !success) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const email = input && input.value.trim();
    if (!email) return;
    if (button) button.disabled = true;
    try {
      const res = await fetch(newsletterEndpoint(), {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // The Worker requires a name; a newsletter has none. This labels the
          // record for what it is instead of inventing a person.
          name: 'Newsletter subscriber',
          email,
          consent: true,
          lang: currentLang,
          service: 'newsletter',
          source: 'newsletter-footer',
          page_url: location.href
        })
      });
      if (!res.ok) throw new Error(String(res.status));
      form.hidden = true;
      success.hidden = false;
    } catch (error) {
      // Honest failure: the form stays, the button recovers, nothing pretends.
      if (button) button.disabled = false;
      input.setCustomValidity(currentLang === 'es'
        ? 'No se pudo suscribir. Intenta de nuevo.'
        : 'Could not subscribe. Please try again.');
      input.reportValidity();
      input.addEventListener('input', () => input.setCustomValidity(''), { once: true });
    }
  });
}

function syncHeroSoundButton() {
  const btn = document.getElementById('hero-play-btn');
  const video = document.getElementById('hero-video');
  if (!btn || !video) return;

  const btnLabel = btn.querySelector('span');
  const btnIcon = btn.querySelector('svg');
  const isSoundOn = !video.muted;
  const dict = translations[currentLang] || translations.en;

  btn.classList.toggle('hero__play-btn--active', isSoundOn);
  btn.setAttribute('aria-pressed', String(isSoundOn));
  btn.setAttribute('aria-label', isSoundOn ? dict['hero.soundMute'] : dict['hero.soundEnable']);

  if (btnLabel) btnLabel.textContent = isSoundOn ? dict['hero.soundMute'] : dict['hero.soundEnable'];
  if (btnIcon) {
    btnIcon.innerHTML = isSoundOn
      ? '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>'
      : '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
  }
}

function initPlayShowreel() {
  const btn = document.getElementById('hero-play-btn');
  const video = document.getElementById('hero-video');
  if (!btn || !video) return;

  const mobileQuery = window.matchMedia('(max-width: 640px)');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopSrc = video.dataset.srcDesktop;
  const mobileSrc = video.dataset.srcMobile;

  /* AV1 saves 35% on this reel (5.4 MB → 3.6 MB desktop, 4.2 → 2.9 mobile),
     which matters most on the mobile networks this studio's market actually
     uses. But AV1 without a hardware decoder is a CPU heater, and a 20-second
     looping autoplay is the worst possible thing to decode in software — the
     same class of mistake as the 22-second SwiftShader incident
     (direction.md §3.1). So the format is chosen the way the WebGL tier is
     chosen: by asking whether the machine can actually afford it.
     MediaCapabilities answers `powerEfficient` only for hardware paths;
     anything else keeps the H.264 file. Both are muxed the same, so the
     decision changes only which URL is fetched. */
  let av1Src = null;

  function pickAv1() {
    if (!video.dataset.av1Desktop || typeof navigator.mediaCapabilities === 'undefined') return;
    navigator.mediaCapabilities.decodingInfo({
      type: 'file',
      video: {
        contentType: 'video/mp4; codecs="av01.0.05M.08"',
        width: 1920, height: 1080, bitrate: 1400000, framerate: 30
      }
    }).then((info) => {
      if (info && info.supported && info.smooth && info.powerEfficient) {
        av1Src = { desktop: video.dataset.av1Desktop, mobile: video.dataset.av1Mobile };
        // Only swap before the first fetch; mid-playback re-fetching a
        // 3.5 MB file to save bytes already spent is a net loss.
        if (!video.getAttribute('src')) setVideoSource();
      }
    }).catch(() => { /* keep H.264 */ });
  }

  function getExpectedSrc() {
    const wantsMobile = mobileQuery.matches;
    if (av1Src) return wantsMobile ? av1Src.mobile : av1Src.desktop;
    return wantsMobile ? mobileSrc : desktopSrc;
  }

  function playMuted() {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        video.muted = true;
        syncHeroSoundButton();
      });
    }
  }

  // The markup ships without a `src` so nothing downloads before this runs and
  // the browser picks exactly one file per breakpoint. Under reduced motion we
  // never fetch on our own: `force` is the user asking for it via the button,
  // and an existing `src` means they already opted in and only the breakpoint
  // changed.
  function setVideoSource({ force = false } = {}) {
    if (motionQuery.matches && !force && !video.getAttribute('src')) return;

    const nextSrc = getExpectedSrc();
    if (!nextSrc || video.getAttribute('src') === nextSrc) return;
    const wasPlaying = !video.paused;
    const previousTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    const shouldRestoreSound = !video.muted;

    video.addEventListener('loadedmetadata', () => {
      if (previousTime > 0 && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(previousTime, Math.max(video.duration - 0.25, 0));
      }
      video.muted = !shouldRestoreSound;
      syncHeroSoundButton();
      if (wasPlaying || video.autoplay) playMuted();
    }, { once: true });

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('src', nextSrc);
    video.load();
  }

  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  syncHeroSoundButton();

  /* Ask about AV1 now, while the reel is still below the fold and nothing
     has been fetched: the answer arrives long before activate() runs, so
     the cheaper file is the one that gets requested. If the probe is slow
     or the codec is unsupported the H.264 path is already in place. */
  pickAv1();

  // The showreel sits below the fold, so nothing is fetched until it is on
  // screen. That keeps several megabytes of video off the critical path of the
  // first screen. setVideoSource() still refuses to fetch under reduced motion.
  let activated = false;

  function activate() {
    activated = true;
    setVideoSource();
    if (!motionQuery.matches) playMuted();
  }

  const section = document.getElementById('showreel');

  /* The observer is the fast path, not the only path.
     IntersectionObserver delivers nothing while the page is not being
     rendered — a background tab, a window the compositor has parked — and
     `visibilitychange` never fires for a document that stayed nominally
     visible the whole time. The reel then sits at a black frame that nothing
     revives, which is what visitors were reporting. So measure the geometry
     ourselves too, from every signal that survives that state. */
  function reelInView() {
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  function maybeActivate() {
    if (activated || !reelInView()) return;
    activate();
    window.removeEventListener('scroll', maybeActivate);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') maybeActivate();
  });
  window.addEventListener('scroll', maybeActivate, { passive: true });
  requestAnimationFrame(maybeActivate);

  if (section && typeof IntersectionObserver === 'function') {
    new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activate();
        else if (!video.paused) video.pause();
      }
    }, { threshold: 0.01 }).observe(section);
  } else {
    activate();
  }

  btn.addEventListener('click', () => {
    // Unmute first: setVideoSource reads the current muted state to decide what
    // to restore once metadata lands.
    video.muted = !video.muted;
    if (!video.getAttribute('src')) setVideoSource({ force: true });
    else if (!video.muted) playMuted();
    syncHeroSoundButton();
  });

  const onBreakpointChange = () => setVideoSource();
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', onBreakpointChange);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(onBreakpointChange);
  }
}

/**
 * Ambient WebGL background for the hero.
 *
 * Everything expensive lives in js/hero-3d.js and is reached through a dynamic
 * import, so none of it is in the initial payload. The import is only issued
 * for visitors who can benefit: no reduced-motion preference, WebGL2 available,
 * and a viewport wide enough that the surface is not competing with the copy.
 * When any gate fails the hero keeps its flat background and nothing is
 * fetched at all.
 *
 * The path is absolute on purpose: main.js is a classic script, so a relative
 * specifier would resolve against the document URL, not this file.
 */
/**
 * WebGL2 that is actually worth using.
 *
 * A context alone is not enough: Chrome hands back a working WebGL2 context
 * backed by SwiftShader when GPU acceleration is unavailable or blocklisted,
 * and rasterising this scene on the CPU costs seconds of main-thread time.
 * CI measured 22s of blocking time on index.html against 98ms on the contact
 * page in the same run, which is exactly that path.
 *
 * WEBGL_debug_renderer_info is unavailable in some privacy configurations. When
 * we cannot tell, we assume hardware: the visitor with a real GPU is the common
 * case, and a false negative would cost every one of them the background.
 */
function hasAcceleratedWebgl2() {
  let gl = null;
  try {
    gl = document.createElement('canvas').getContext('webgl2');
  } catch (error) {
    return false;
  }
  if (!gl) return false;

  try {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    if (!info) return true;
    const renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || '');
    return !/swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i.test(renderer);
  } catch (error) {
    return true;
  } finally {
    // Free the probe context instead of leaving it to the GC; browsers cap how
    // many live WebGL contexts a page may hold.
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  }
}

function initHeroBackground() {
  /* The persistent field (js/terrain.js): one fixed canvas inside the stage,
     painting the whole three-act color story with the contour terrain in it.
     Same gates as its hero-only predecessor — reduced motion, ≥768px,
     hardware WebGL2 — and it engages only when the stage did, because it
     replaces the stage's planes visually and something must be behind the
     transparent sections if it fails. */
  const canvas = document.getElementById('page-canvas');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* The tier is designed, not subtracted (audit gap 4): capable desktops get
     the WebGL field; phones and software renderers get the same signature
     drawn as 2D polylines by terrain-lite. Only reduced motion gets stillness,
     and that on purpose. */
  const useLite = !window.matchMedia('(min-width: 768px)').matches || !hasAcceleratedWebgl2();

  const start = () => {
    if (!document.documentElement.classList.contains('js-stage')) return;
    import(useLite ? '/js/terrain-lite.js?v=20260810b' : '/js/terrain.js?v=20260810b')
      .then((module) => module.initTerrain(canvas))
      .catch(() => {
        // A failed field must never break the page; the stage planes remain.
        canvas.remove();
      });
  };

  // Defer past first paint so the chunk never competes with the initial render.
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(start, { timeout: 2000 });
  } else {
    setTimeout(start, 200);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initHeader();
  initHeroBackground();
  animateHeroTitle();
  renderCapabilities();
  renderWork();
  renderFAQ();
  initNewsletter();
  initPlayShowreel();
  initAnimations();
});
