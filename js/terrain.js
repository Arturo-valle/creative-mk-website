/* ============================================
   The persistent field — 3D as spine, not doormat (audit gap 1).

   One fixed fullscreen canvas behind the whole page, rendered by OGL on a
   single triangle: a contour terrain whose state evolves across the three
   acts the page already tells. Act I: dense gold contours on ink, swelling
   on arrival, rising toward the cursor. Act II: the lights come up inside
   the shader — the same field fades to a whisper of navy topography on
   paper, the tooth of the page. Act III: the contours re-densify in gold on
   the closing navy. The field also drifts with scroll and stirs with scroll
   velocity, so the page reads as one continuous surface the visitor moves
   through instead of a hero that says goodbye at the first scroll.

   This supersedes js/hero-3d.js (three.js, hero-only, scrolled out at the
   top — the exact pattern the 2026 award research showed stopped winning).
   Fragment-shader contours replace vertex displacement: same signature,
   25KB gzipped of OGL modules instead of 184KB of three.js (measured
   across the full import closure, not the six files named below). Surgical imports on
   purpose — OGL's index.js re-exports 64 modules and the browser would
   fetch all of them.

   Reached only through the gated dynamic import in js/main.js: hardware
   WebGL2, ≥768px, motion allowed. Every colour comes from
   css/variables.css and css/stage.css tokens at runtime.
   ============================================ */

import { Renderer } from '/js/vendor/ogl/core/Renderer.js';
import { Program } from '/js/vendor/ogl/core/Program.js';
import { Mesh } from '/js/vendor/ogl/core/Mesh.js';
import { Texture } from '/js/vendor/ogl/core/Texture.js';
import { Triangle } from '/js/vendor/ogl/extras/Triangle.js';
import { Flowmap } from '/js/vendor/ogl/extras/Flowmap.js';
import { Vec2 } from '/js/vendor/ogl/math/Vec2.js';
import { Color } from '/js/vendor/ogl/math/Color.js';

const ARRIVAL_MS = 1200;

/* Two dialects of the same shader. WebGL2 requires ESSL 3.00 to use fwidth
   (the derivatives extension exists only in WebGL1 — in a WebGL2 context an
   ESSL 1.00 shader has neither the extension nor the builtin, which is how
   the first version of this file shipped dark on every real desktop). The
   bodies are identical; only the dialect scaffolding differs. */

const VERTEX_100 = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const VERTEX_300 = /* glsl */ `#version 300 es
  in vec2 uv;
  in vec2 position;
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_BODY = /* glsl */ `
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uArrival;    // 0..1, the opening swell
  uniform float uScroll;     // 0..1 across the whole document
  uniform float uDrift;      // world offset carried across page navigations
  uniform float uVel;        // smoothed scroll velocity, signed
  uniform float uDay;        // act weights, computed on the JS side so every
  uniform float uClose;      // page shares one implementation (see actWeights)
  uniform vec2 uPointer;     // pointer in uv space (aspect-corrected)
  uniform float uPointerStrength;
  uniform sampler2D tFlow;   // gesture memory: where the pointer has been
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform vec3 uPanel;
  uniform vec3 uGold;
  uniform vec3 uNavy;

  // The same three superposed sines the hero used — the field is the same
  // signature, now infinite because it lives in uv space.
  float wave(vec2 p, float t) {
    return sin(p.x * 3.1 + t * 0.55) * 0.90
         + sin(p.y * 4.2 - t * 0.40) * 0.70
         + sin((p.x + p.y) * 2.1 + t * 0.28) * 1.25;
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = vUv;
    p.x *= aspect;

    /* The world moves as the visitor does: scroll drifts the field upward
       and velocity stirs the phase, so even the quiet acts are alive.
       uDrift carries the phase across page navigations — the contours a
       visitor left on one URL are the contours that greet them on the next,
       which is what makes the whole site read as one continuous surface. */
    vec2 q = p + vec2(0.0, uDrift + uScroll * 2.6);

    /* The flowmap bends the field where the hand has been: not the live
       pointer (the gaussian below is that) but its wake, dissipating over a
       couple of seconds. Ink remembers the gesture briefly. */
    vec3 flow = TEXTURE_2D(tFlow, vUv).rgb;
    q += flow.xy * 0.22;

    float t = uTime + uVel * 0.35;

    float h = wave(q, t) * uArrival;

    // The pointer raises the terrain toward the hand.
    vec2 d = p - uPointer;
    h += uPointerStrength * uArrival * exp(-dot(d, d) * 14.0);

    /* Act weights arrive computed (terrain.js actWeights): same 8% ramps as
       before, but owned by JS so subpages without the home's landmarks get
       the same treatment from one implementation. */
    float day = uDay;
    float close = uClose;

    /* Contour density and presence per act: dense and confident at night,
       a whisper on paper, gathering again for the close. */
    float bands = mix(mix(5.0, 3.0, day), 6.0, close);
    float presence = mix(mix(0.85, 0.16, day), 0.70, close);

    float bh = h * bands;
    float w = max(fwidth(bh), 1e-4);
    float dist = abs(fract(bh - 0.5) - 0.5) / w;
    float line = clamp(1.0 - dist, 0.0, 1.0);

    /* Keep the hero copy legible: in the night act only, lines soften behind
       the headline. The mask used to remove 85% across a band wide enough to
       swallow most of a desktop hero, which read as an empty page rather than
       as restraint; it now takes 55% and releases sooner. */
    float copyMask = 1.0 - (1.0 - day) * (1.0 - close)
      * smoothstep(0.62, 0.20, p.x / aspect) * smoothstep(0.55, 0.15, 1.0 - vUv.y) * 0.55;
    line *= copyMask;

    // Height picks the ink of the line: navy troughs, gold crests.
    float m = smoothstep(-1.6, 2.4, h);
    vec3 lineColorNight = mix(uNavy, uGold, pow(m, 2.0));
    vec3 lineColorDay = mix(uNavy, uGold, pow(m, 2.0) * 0.4);
    vec3 lineColor = mix(mix(lineColorNight, lineColorDay, day), lineColorNight, close);

    // The stage lives inside the shader: ink → paper → panel navy.
    vec3 bg = mix(mix(uInk, uPaper, day), uPanel, close);

    float alpha = line * presence * (0.45 + m * 0.55);
    FRAG_OUT = vec4(mix(bg, lineColor, alpha), 1.0);
  }
`;

/* #version must be the first characters of the source — no leading newline. */
const FRAGMENT_300 = `#version 300 es
  precision highp float;
  in vec2 vUv;
  out vec4 fragColor;
  #define FRAG_OUT fragColor
  #define TEXTURE_2D texture
` + FRAGMENT_BODY;

const FRAGMENT_100 = `#extension GL_OES_standard_derivatives : enable
  precision highp float;
  varying vec2 vUv;
  #define FRAG_OUT gl_FragColor
  #define TEXTURE_2D texture2D
` + FRAGMENT_BODY;

function cssColor(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(value || fallback);
}

/* ---- cross-document handoff ----
   A WebGL context cannot survive a navigation, but its state can. dispose()
   writes the field's drift phase and earned quality tier to sessionStorage;
   the next document reads them back and opens where the last one closed,
   with the context reboot hidden under the View Transition snapshot. The
   TTL keeps continuity a navigation feeling, not a souvenir — a visitor
   returning after five minutes gets the arrival swell again. */
const HANDOFF_KEY = 'mk:field';
const HANDOFF_TTL = 300000;

function readHandoff() {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || typeof state.drift !== 'number' || typeof state.at !== 'number') return null;
    if (Date.now() - state.at > HANDOFF_TTL) return null;
    return state;
  } catch (error) {
    return null;
  }
}

export function initTerrain(canvas) {
  const restored = readHandoff();

  /* Tier ladder for the adaptive quality manager (direction.md §5.1.1),
     needed before the renderer exists because a handed-off tier sets the
     constructor's pixel ratio — a GPU that already proved it needs DPR 1.25
     should not re-audition at 1.75 on every navigation. */
  const TIER_DPRS = [Math.min(window.devicePixelRatio, 1.75), 1.5, 1.25, 1.0]
    .filter((v, i, a) => v >= 1 && a.indexOf(v) === i)
    .sort((a, b) => b - a);
  let tier = restored && Number.isInteger(restored.tier)
    && restored.tier > 0 && restored.tier < TIER_DPRS.length
    ? restored.tier : 0;

  const renderer = new Renderer({
    canvas,
    dpr: TIER_DPRS[tier],
    alpha: false,
    antialias: false,
    powerPreference: 'high-performance'
  });
  const gl = renderer.gl;

  /* The gate in js/main.js proved WebGL2 exists, but OGL still falls back to
     WebGL1 if the second context is refused. There, fwidth needs the
     derivatives extension enabled from JS as well as declared in the shader;
     if it is genuinely absent, throw — main.js's catch removes the canvas
     and the stage planes carry the color story without the field. */
  if (!renderer.isWebgl2 && !gl.getExtension('OES_standard_derivatives')) {
    throw new Error('no derivatives support');
  }

  /* Gesture memory: a 128px ping-pong flowmap (vendored, proven on /lp/).
     If float render targets are genuinely unavailable the wake is skipped —
     an empty texture reads as zero flow and the field is simply stiller. */
  let flowmap = null;
  try {
    flowmap = new Flowmap(gl, { size: 128, falloff: 0.3, dissipation: 0.96 });
  } catch (error) { /* the wake is garnish; the field survives without it */ }

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: renderer.isWebgl2 ? VERTEX_300 : VERTEX_100,
    fragment: renderer.isWebgl2 ? FRAGMENT_300 : FRAGMENT_100,
    uniforms: {
      uRes: { value: new Vec2(1, 1) },
      uTime: { value: 0 },
      uArrival: { value: 0 },
      uScroll: { value: 0 },
      uDrift: { value: restored ? restored.drift : 0 },
      uVel: { value: 0 },
      uDay: { value: 0 },
      uClose: { value: 0 },
      uPointer: { value: new Vec2(-10, -10) },
      uPointerStrength: { value: 0 },
      tFlow: flowmap ? flowmap.uniform : { value: new Texture(gl) },
      uInk: { value: cssColor('--color-black', '#0a0a0a') },
      uPaper: { value: cssColor('--color-paper', '#f7f5f0') },
      uPanel: { value: cssColor('--color-dark-panel', '#17233f') },
      uGold: { value: cssColor('--color-primary', '#E8C840') },
      uNavy: { value: cssColor('--color-navy-light', '#2A3D66') }
    }
  });
  const mesh = new Mesh(gl, { geometry, program });
  const u = program.uniforms;

  /* ---- geometry of the story: where the acts turn ----
     Same DOM math as ever, now writing JS-side bounds; actWeight() turns
     them into the uDay/uClose ramps each frame. Pages are told apart by
     their landmarks: the homepage (showreel, news) plays all three acts
     against scroll; every other URL is a daylight room — uDay locked at 1,
     no close — so a subpage is the same surface with the lights already
     up, continuous with the drift the visitor arrived carrying. */
  const hasReel = !!document.getElementById('showreel');
  const hasNews = !!document.getElementById('news');
  const actBounds = { day: 0.2, close: 0.8 };

  function measureActs() {
    const doc = document.documentElement;
    const total = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const reel = document.getElementById('showreel');
    const news = document.getElementById('news');
    if (reel) {
      actBounds.day = Math.min(
        (reel.offsetTop + reel.offsetHeight - window.innerHeight * 0.4) / total, 0.95);
    }
    if (news) {
      actBounds.close = Math.min(
        Math.max((news.offsetTop - window.innerHeight * 0.6) / total, actBounds.day + 0.05), 0.98);
    }
  }

  /* The same smoothstep the shader used, over the same ±4% ramp. */
  function actWeight(edge, x) {
    const t = Math.min(Math.max((x - (edge - 0.04)) / 0.08, 0), 1);
    return t * t * (3 - 2 * t);
  }

  /* Never measure the canvas itself: OGL's Renderer constructor stamps
     style.width/height on it (300x150, its defaults) before we say anything,
     which overrides the stylesheet's 100%. Reading that back would look like a
     real size and the field would stay a postage stamp forever. The host
     covers the viewport, so it is the honest second opinion for the case
     window.innerWidth reports 0 — a page laid out but not being rendered. */
  const host = canvas.parentElement;

  function measure() {
    const rect = host ? host.getBoundingClientRect() : null;
    return {
      width: window.innerWidth || (rect ? Math.round(rect.width) : 0),
      height: window.innerHeight || (rect ? Math.round(rect.height) : 0)
    };
  }

  /* Returns whether the drawing buffer now has a real size.

     A zero must never reach setSize — it leaves a 0x0 drawing buffer that
     nothing revives, because the visitor's window never resizes and this is
     the only listener that could re-run. That is how the field shipped
     invisible. Refuse it; the observer or the next frame will try again. */
  function resize() {
    const { width, height } = measure();
    if (!width || !height) return false;
    renderer.setSize(width, height);
    u.uRes.value.set(gl.drawingBufferWidth, gl.drawingBufferHeight);
    if (flowmap) flowmap.aspect = width / height;
    measureActs();
    return true;
  }

  /* ---- inputs ---- */
  const pointerTarget = new Vec2(-10, -10);
  let strengthTarget = 0;
  let lastPointerX = null;
  let lastPointerY = 0;
  let lastPointerAt = 0;

  function onPointerMove(event) {
    const aspect = window.innerWidth / window.innerHeight;
    pointerTarget.set(
      (event.clientX / window.innerWidth) * aspect,
      1 - event.clientY / window.innerHeight
    );
    strengthTarget = 1.0;

    if (flowmap) {
      flowmap.mouse.set(
        event.clientX / window.innerWidth,
        1 - event.clientY / window.innerHeight
      );
      const now = performance.now();
      if (lastPointerX !== null) {
        const dt = Math.max(now - lastPointerAt, 10);
        flowmap.velocity.set(
          Math.min(Math.max((event.clientX - lastPointerX) / dt, -1), 1),
          Math.min(Math.max((event.clientY - lastPointerY) / dt, -1), 1)
        );
      }
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastPointerAt = now;
    }
  }

  function onPointerLeave() { strengthTarget = 0; }

  let lastScroll = window.scrollY || 0;
  let velocity = 0;

  /* ---- adaptive quality (direction.md §5.1.1) ----

     The 22-second SwiftShader incident taught this file that GPU capability
     is bimodal and lied about by every static signal. So capability is now
     measured where it is spent: a rolling buffer of frame deltas, evaluated
     once it holds ~1.5s of frames and at most once per 3s. Sustained above
     22ms the pixel ratio steps down a tier; sustained under 12ms it steps
     back up, never past where it started. Tiers touch resolution only —
     the story is not a tier.

     The floor is stillness, not slideshow: at the lowest tier and still
     failing, the loop parks on the settled field and never restarts. A
     machine that cannot afford the field gets the field's final frame,
     which is exactly what reduced-motion visitors get on purpose.

     TIER_DPRS and tier live at the top of initTerrain — a handed-off tier
     has to reach the Renderer constructor. */
  let parked = false;
  let frameTimes = [];
  let lastFrameAt = 0;
  let tierChangedAt = 0;

  function applyTier(next, now) {
    tier = next;
    tierChangedAt = now;
    frameTimes = [];
    renderer.dpr = TIER_DPRS[tier];
    resize();
    document.documentElement.dataset.mkFieldTier = String(tier);
  }

  function evaluateTier(now) {
    const avg = frameTimes.reduce((sum, d) => sum + d, 0) / frameTimes.length;
    frameTimes = [];
    if (avg > 22) {
      if (tier < TIER_DPRS.length - 1) {
        applyTier(tier + 1, now);
      } else {
        parked = true;
        stopLoop();
      }
    } else if (avg < 12 && tier > 0) {
      applyTier(tier - 1, now);
    }
  }

  /* ---- the loop ----
     One heartbeat: when GSAP is present — and it always is when the stage
     armed, because stage.js gates on it — the field renders from
     gsap.ticker, the same clock that drives Lenis and every ScrollTrigger
     scrub, so canvas and DOM cannot disagree about a frame (the Trionn
     lesson). The private rAF path remains for the page where the vendor
     stack failed but WebGL did not. Runs while the tab is visible; the
     canvas is the page's background everywhere, so there is no offscreen
     state to pause for. */
  let raf = null;
  let running = false;
  let startedAt = 0;
  const skipArrival = !!restored;
  const useTicker = typeof window.gsap !== 'undefined' && !!window.gsap.ticker;

  function tick() {
    frame(performance.now());
  }

  function frame(now) {
    if (!useTicker) raf = requestAnimationFrame(frame);
    // Keep trying to claim a size until layout gives us one.
    if (!gl.drawingBufferWidth && !resize()) return;
    if (!startedAt) startedAt = now;

    /* Deltas above 250ms are pauses (tab switch, debugger), not frames —
       counting one would poison the average a downgrade decides on. */
    if (lastFrameAt) {
      const delta = now - lastFrameAt;
      if (delta < 250) frameTimes.push(delta);
    }
    lastFrameAt = now;
    if (frameTimes.length >= 90 && now - tierChangedAt > 3000) evaluateTier(now);

    /* A handed-off field is already risen — replaying the swell on every
       navigation would say "new page" when the design says "same surface". */
    const t = Math.min(1, (now - startedAt) / ARRIVAL_MS);
    u.uArrival.value = skipArrival ? 1 : 1 - Math.pow(1 - t, 3);

    const doc = document.documentElement;
    const total = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const y = window.scrollY || 0;
    u.uScroll.value = Math.min(y / total, 1);
    u.uDay.value = hasReel ? actWeight(actBounds.day, u.uScroll.value) : 1;
    u.uClose.value = hasNews ? actWeight(actBounds.close, u.uScroll.value) : 0;

    velocity += ((y - lastScroll) * 0.02 - velocity) * 0.08;
    lastScroll = y;
    u.uVel.value = velocity;

    u.uTime.value = now / 1000;
    u.uPointer.value.lerp(pointerTarget, 0.06);
    u.uPointerStrength.value += (strengthTarget - u.uPointerStrength.value) * 0.05;

    if (flowmap) {
      flowmap.velocity.multiply(0.94);
      flowmap.update();
    }

    renderer.render({ scene: mesh });
  }

  function startLoop() {
    if (running || parked) return;
    running = true;
    lastFrameAt = 0;
    frameTimes = [];
    if (useTicker) window.gsap.ticker.add(tick);
    else raf = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (!running) return;
    running = false;
    if (useTicker) window.gsap.ticker.remove(tick);
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function sync() {
    if (document.visibilityState === 'visible') startLoop();
    else stopLoop();
  }

  const remeasure = () => measureActs();

  /* The element knows it grew even when the window never fired an event. */
  const observer = typeof ResizeObserver === 'function'
    ? new ResizeObserver(() => resize())
    : null;

  function dispose() {
    /* The context dies here; its state crosses the navigation. Written
       before loseContext so the next document opens where this one closed:
       the drift phase the eye was following, and the tier this GPU already
       earned. */
    try {
      sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({
        drift: u.uDrift.value + u.uScroll.value * 2.6,
        tier,
        at: Date.now()
      }));
    } catch (error) { /* private mode: the next page simply gets the arrival */ }
    stopLoop();
    if (observer) observer.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', sync);
    document.removeEventListener('mk:i18n', remeasure);
    if (useTicker && typeof window.ScrollTrigger !== 'undefined') {
      window.ScrollTrigger.removeEventListener('refresh', measureActs);
    }
    window.removeEventListener('pagehide', dispose);
    geometry.remove();
    program.remove();
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  }

  if (observer && host) observer.observe(host);
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('mk:i18n', remeasure);
  /* stage.js already calls ScrollTrigger.refresh() on mk:i18n and ST refreshes
     itself on resize and font load — riding that event catches every relayout
     the fallback listeners might miss. */
  if (useTicker && typeof window.ScrollTrigger !== 'undefined') {
    window.ScrollTrigger.addEventListener('refresh', measureActs);
  }
  window.addEventListener('pagehide', dispose, { once: true });

  resize();
  sync();
  document.documentElement.dataset.mkFieldTier = String(tier);

  return dispose;
}
