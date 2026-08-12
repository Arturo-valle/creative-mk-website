/* ============================================
   The field, designed for small machines (audit gap 4).

   Mobile and GPU-less visitors used to get the site minus its heart: a dead
   canvas and a flat dark hero. This is the answer the direction record's
   open question asked for — a designed tier, not a subtraction. The same
   three-sine wave, the same three-act color story, drawn as drifting
   contour polylines on a plain 2D canvas: no WebGL, ~3KB, throttled to
   30fps, DPR capped. It reads as the same signature because it IS the same
   math.

   Same module contract as js/terrain.js (initTerrain(canvas) → dispose);
   js/main.js picks which one to import at the gate. Reduced motion never
   reaches either.
   ============================================ */

const ARRIVAL_MS = 1200;
const FRAME_MS = 33;           // ~30fps: legible motion, cool phone
const LINES = 22;

function cssColor(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const n = v.replace('#', '');
  const s = n.length === 3 ? n.split('').map((c) => c + c).join('') : n;
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function rgb(c, alpha) {
  return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + alpha + ')';
}

function smoothstep(a, b, x) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

// The signature wave — identical constants to the shader's.
function wave(x, y, t) {
  return Math.sin(x * 3.1 + t * 0.55) * 0.90
       + Math.sin(y * 4.2 - t * 0.40) * 0.70
       + Math.sin((x + y) * 2.1 + t * 0.28) * 1.25;
}

export function initTerrain(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');

  const ink = cssColor('--color-black', '#0a0a0a');
  const paper = cssColor('--color-paper', '#f7f5f0');
  const panel = cssColor('--color-dark-panel', '#17233f');
  const gold = cssColor('--color-primary', '#E8C840');
  const navy = cssColor('--color-navy-light', '#2A3D66');

  let w = 0, h = 0, dpr = 1;
  let act1End = 0.2, act2End = 0.8;

  function measureActs() {
    const total = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const reel = document.getElementById('showreel');
    const news = document.getElementById('news');
    if (reel) act1End = Math.min((reel.offsetTop + reel.offsetHeight - window.innerHeight * 0.4) / total, 0.95);
    if (news) act2End = Math.min(Math.max((news.offsetTop - window.innerHeight * 0.6) / total, act1End + 0.05), 0.98);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    measureActs();
  }

  let raf = null;
  let startedAt = 0;
  let lastFrame = 0;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - lastFrame < FRAME_MS) return;
    lastFrame = now;
    if (!startedAt) startedAt = now;

    const arrival = 1 - Math.pow(1 - Math.min(1, (now - startedAt) / ARRIVAL_MS), 3);
    const t = now / 1000;
    const total = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const scroll = Math.min((window.scrollY || 0) / total, 1);

    const day = smoothstep(act1End - 0.04, act1End + 0.04, scroll);
    const close = smoothstep(act2End - 0.04, act2End + 0.04, scroll);

    const bg = mix(mix(ink, paper, day), panel, close);
    const amp = (1 - day) * 26 + day * (1 - close) * 8 + close * 20;
    const presence = (1 - day) * 0.5 + day * (1 - close) * 0.12 + close * 0.4;

    ctx.fillStyle = rgb(bg, 1);
    ctx.fillRect(0, 0, w, h);

    const drift = scroll * 2.6;
    const step = Math.max(12, w / 48);

    for (let i = 0; i < LINES; i++) {
      const baseY = ((i + 0.5) / LINES) * h;
      const fy = baseY / h + drift;
      const phase = (Math.sin(i * 1.7 + t * 0.2) + 1) / 2;
      const colour = mix(navy, gold, phase * phase);

      ctx.beginPath();
      for (let x = 0; x <= w + step; x += step) {
        const fx = (x / h);          // divide by height so scale matches aspect
        const y = baseY + wave(fx, fy, t) * amp * arrival;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgb(colour, presence * (0.35 + phase * 0.5));
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function sync() {
    const visible = document.visibilityState === 'visible';
    if (visible && raf === null) raf = requestAnimationFrame(frame);
    else if (!visible && raf !== null) { cancelAnimationFrame(raf); raf = null; }
  }

  const remeasure = () => measureActs();

  function dispose() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', sync);
    document.removeEventListener('mk:i18n', remeasure);
    window.removeEventListener('pagehide', dispose);
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('mk:i18n', remeasure);
  window.addEventListener('pagehide', dispose, { once: true });

  resize();
  sync();

  return dispose;
}
