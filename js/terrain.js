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
   ~12KB of OGL modules instead of ~118KB of three.js. Surgical imports on
   purpose — OGL's index.js re-exports 64 modules and the browser would
   fetch all of them.

   Reached only through the gated dynamic import in js/main.js: hardware
   WebGL2, ≥768px, motion allowed. Every colour comes from
   css/variables.css and css/stage.css tokens at runtime.
   ============================================ */

import { Renderer } from '/js/vendor/ogl/core/Renderer.js';
import { Program } from '/js/vendor/ogl/core/Program.js';
import { Mesh } from '/js/vendor/ogl/core/Mesh.js';
import { Triangle } from '/js/vendor/ogl/extras/Triangle.js';
import { Vec2 } from '/js/vendor/ogl/math/Vec2.js';
import { Color } from '/js/vendor/ogl/math/Color.js';

const ARRIVAL_MS = 1200;

const VERTEX = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
  precision highp float;

  varying vec2 vUv;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uArrival;    // 0..1, the opening swell
  uniform float uScroll;     // 0..1 across the whole document
  uniform float uVel;        // smoothed scroll velocity, signed
  uniform float uAct1End;    // normalized scroll where daylight begins
  uniform float uAct2End;    // normalized scroll where the dark close begins
  uniform vec2 uPointer;     // pointer in uv space (aspect-corrected)
  uniform float uPointerStrength;
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
       and velocity stirs the phase, so even the quiet acts are alive. */
    vec2 q = p + vec2(0.0, uScroll * 2.6);
    float t = uTime + uVel * 0.35;

    float h = wave(q, t) * uArrival;

    // The pointer raises the terrain toward the hand.
    vec2 d = p - uPointer;
    h += uPointerStrength * uArrival * exp(-dot(d, d) * 14.0);

    /* Act weights: 0→1 ramps at each boundary, softened over 8% of the
       page so the shader turns with the color stage, not against it. */
    float day = smoothstep(uAct1End - 0.04, uAct1End + 0.04, uScroll);
    float close = smoothstep(uAct2End - 0.04, uAct2End + 0.04, uScroll);

    /* Contour density and presence per act: dense and confident at night,
       a whisper on paper, gathering again for the close. */
    float bands = mix(mix(5.0, 3.0, day), 6.0, close);
    float presence = mix(mix(0.55, 0.10, day), 0.45, close);

    float bh = h * bands;
    float w = max(fwidth(bh), 1e-4);
    float dist = abs(fract(bh - 0.5) - 0.5) / w;
    float line = clamp(1.0 - dist, 0.0, 1.0);

    /* Keep the hero copy legible: in the night act only, lines fade in the
       upper-left quadrant where the headline lives. */
    float copyMask = 1.0 - (1.0 - day) * (1.0 - close)
      * smoothstep(0.9, 0.35, p.x / aspect) * smoothstep(0.55, 0.15, 1.0 - vUv.y) * 0.85;
    line *= copyMask;

    // Height picks the ink of the line: navy troughs, gold crests.
    float m = smoothstep(-1.6, 2.4, h);
    vec3 lineColorNight = mix(uNavy, uGold, pow(m, 2.0));
    vec3 lineColorDay = mix(uNavy, uGold, pow(m, 2.0) * 0.4);
    vec3 lineColor = mix(mix(lineColorNight, lineColorDay, day), lineColorNight, close);

    // The stage lives inside the shader: ink → paper → panel navy.
    vec3 bg = mix(mix(uInk, uPaper, day), uPanel, close);

    float alpha = line * presence * (0.35 + m * 0.65);
    gl_FragColor = vec4(mix(bg, lineColor, alpha), 1.0);
  }
`;

function cssColor(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(value || fallback);
}

export function initTerrain(canvas) {
  const renderer = new Renderer({
    canvas,
    dpr: Math.min(window.devicePixelRatio, 1.75),
    alpha: false,
    antialias: false,
    powerPreference: 'high-performance'
  });
  const gl = renderer.gl;

  /* The gate in js/main.js proved WebGL2 exists, but OGL still falls back to
     WebGL1 if the second context is refused. fwidth is core in WebGL2 and an
     extension in WebGL1 — enable it there, and if it is genuinely absent,
     throw: main.js's catch removes the canvas and the stage planes carry the
     color story without the field. */
  if (!renderer.isWebgl2 && !gl.getExtension('OES_standard_derivatives')) {
    throw new Error('no derivatives support');
  }

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    uniforms: {
      uRes: { value: new Vec2(1, 1) },
      uTime: { value: 0 },
      uArrival: { value: 0 },
      uScroll: { value: 0 },
      uVel: { value: 0 },
      uAct1End: { value: 0.2 },
      uAct2End: { value: 0.8 },
      uPointer: { value: new Vec2(-10, -10) },
      uPointerStrength: { value: 0 },
      uInk: { value: cssColor('--color-black', '#0a0a0a') },
      uPaper: { value: cssColor('--color-paper', '#f7f5f0') },
      uPanel: { value: cssColor('--color-dark-panel', '#17233f') },
      uGold: { value: cssColor('--color-primary', '#E8C840') },
      uNavy: { value: cssColor('--color-navy-light', '#2A3D66') }
    }
  });
  const mesh = new Mesh(gl, { geometry, program });
  const u = program.uniforms;

  /* ---- geometry of the story: where the acts turn ---- */
  function measureActs() {
    const doc = document.documentElement;
    const total = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const reel = document.getElementById('showreel');
    const news = document.getElementById('news');
    if (reel) {
      u.uAct1End.value = Math.min(
        (reel.offsetTop + reel.offsetHeight - window.innerHeight * 0.4) / total, 0.95);
    }
    if (news) {
      u.uAct2End.value = Math.min(
        Math.max((news.offsetTop - window.innerHeight * 0.6) / total, u.uAct1End.value + 0.05), 0.98);
    }
  }

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    u.uRes.value.set(gl.drawingBufferWidth, gl.drawingBufferHeight);
    measureActs();
  }

  /* ---- inputs ---- */
  const pointerTarget = new Vec2(-10, -10);
  let strengthTarget = 0;

  function onPointerMove(event) {
    const aspect = window.innerWidth / window.innerHeight;
    pointerTarget.set(
      (event.clientX / window.innerWidth) * aspect,
      1 - event.clientY / window.innerHeight
    );
    strengthTarget = 1.0;
  }

  function onPointerLeave() { strengthTarget = 0; }

  let lastScroll = window.scrollY || 0;
  let velocity = 0;

  /* ---- the loop: runs while the tab is visible; the canvas is the page's
     background everywhere, so there is no offscreen state to pause for ---- */
  let raf = null;
  let startedAt = 0;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!startedAt) startedAt = now;

    const t = Math.min(1, (now - startedAt) / ARRIVAL_MS);
    u.uArrival.value = 1 - Math.pow(1 - t, 3);

    const doc = document.documentElement;
    const total = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const y = window.scrollY || 0;
    u.uScroll.value = Math.min(y / total, 1);

    velocity += ((y - lastScroll) * 0.02 - velocity) * 0.08;
    lastScroll = y;
    u.uVel.value = velocity;

    u.uTime.value = now / 1000;
    u.uPointer.value.lerp(pointerTarget, 0.06);
    u.uPointerStrength.value += (strengthTarget - u.uPointerStrength.value) * 0.05;

    renderer.render({ scene: mesh });
  }

  function sync() {
    const visible = document.visibilityState === 'visible';
    if (visible && raf === null) {
      raf = requestAnimationFrame(frame);
    } else if (!visible && raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  const remeasure = () => measureActs();

  function dispose() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', sync);
    document.removeEventListener('mk:i18n', remeasure);
    window.removeEventListener('pagehide', dispose);
    geometry.remove();
    program.remove();
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('mk:i18n', remeasure);
  window.addEventListener('pagehide', dispose, { once: true });

  resize();
  sync();

  return dispose;
}
