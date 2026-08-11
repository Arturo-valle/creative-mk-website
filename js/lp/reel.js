/* reel.js — el momento firma: el reel del estudio como materia.
   La velocidad del puntero escribe en un flowmap que desplaza las UVs del
   vídeo: tocarlo deja una estela líquida que se disipa sola, con la
   aberración teñida hacia el dorado de marca. No es un blob decorativo:
   el vídeo ES el contenido, y responder al visitante es lo que separa
   la artesanía de la animación reproducida.

   Import dinámico tras las puertas de main.js. OGL auto-hospedado. */

/* Imports quirúrgicos: el index.js de OGL re-exporta 64 módulos y el
   navegador los pediría todos. Así solo viajan los que se usan. */
import { Renderer } from '/js/vendor/ogl/core/Renderer.js';
import { Program } from '/js/vendor/ogl/core/Program.js';
import { Mesh } from '/js/vendor/ogl/core/Mesh.js';
import { Texture } from '/js/vendor/ogl/core/Texture.js';
import { Triangle } from '/js/vendor/ogl/extras/Triangle.js';
import { Flowmap } from '/js/vendor/ogl/extras/Flowmap.js';
import { Vec2 } from '/js/vendor/ogl/math/Vec2.js';

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
  precision highp float;
  uniform sampler2D tMedia;
  uniform sampler2D tFlow;
  uniform vec2 uCover;
  varying vec2 vUv;

  void main() {
    vec3 flow = texture2D(tFlow, vUv).rgb;

    /* encuadre cover: recorta la textura al aspecto del lienzo */
    vec2 uv = (vUv - 0.5) * uCover + 0.5;

    /* la estela desplaza las UVs; los tres canales se separan un poco:
       aberracion cromatica solo donde hay movimiento */
    vec2 duv = flow.xy * 0.22;
    vec3 col;
    col.r = texture2D(tMedia, uv - duv * 1.05).r;
    col.g = texture2D(tMedia, uv - duv).g;
    col.b = texture2D(tMedia, uv - duv * 0.95).b;

    /* el rastro respira dorado de marca, nunca como superficie plana */
    float f = length(flow.xy);
    col = mix(col, vec3(0.910, 0.784, 0.251), smoothstep(0.18, 0.7, f) * 0.45);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function iniciar({ hero, video, posterUrl, alFallar }) {
  const renderer = new Renderer({
    dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    alpha: false,
    antialias: false,
    powerPreference: 'high-performance'
  });
  const gl = renderer.gl;
  if (!gl) throw new Error('sin contexto');

  const canvas = gl.canvas;
  canvas.className = 'hero__gl';
  canvas.setAttribute('aria-hidden', 'true');
  const velo = hero.querySelector('.hero__velo');
  hero.insertBefore(canvas, velo);

  /* el <video> pasa a ser solo fuente de textura */
  if (video) video.style.display = 'none';

  const flowmap = new Flowmap(gl, { falloff: 0.28, dissipation: 0.94 });
  const geometry = new Triangle(gl);
  const texture = new Texture(gl, { generateMipmaps: false });

  let mediaW = 1280, mediaH = 466;
  const uCover = { value: new Vec2(1, 1) };

  const program = new Program(gl, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    uniforms: {
      tMedia: { value: texture },
      tFlow: flowmap.uniform,
      uCover
    }
  });
  const mesh = new Mesh(gl, { geometry, program });

  function ajustarCover() {
    const ca = canvas.width / Math.max(1, canvas.height);
    const ma = mediaW / Math.max(1, mediaH);
    if (ca > ma) uCover.value.set(1, ma / ca);
    else uCover.value.set(ca / ma, 1);
  }

  function redimensionar() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h);
    flowmap.aspect = w / Math.max(1, h);
    ajustarCover();
  }
  window.addEventListener('resize', redimensionar, { passive: true });
  redimensionar();

  /* arranca con el poster: hay imagen aunque el video tarde o falle */
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    if (!videoListo) {
      texture.image = img;
      mediaW = img.naturalWidth; mediaH = img.naturalHeight;
      ajustarCover();
    }
  };
  img.src = posterUrl;

  /* el video toma el relevo cuando tiene datos */
  let videoListo = false;
  let frameNuevo = false;

  function engancharVideo() {
    if (!video) return;
    const alFrame = () => {
      if (!videoListo) {
        videoListo = true;
        texture.image = video;
        mediaW = video.videoWidth || 1280; mediaH = video.videoHeight || 466;
        ajustarCover();
      }
      frameNuevo = true;
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(alFrame);
    };
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(alFrame);
    else video.addEventListener('timeupdate', alFrame);

    if (!video.src) {
      const s = video.querySelector('source');
      video.src = s ? s.src : '/video/hero-clean-1280-v1.mp4';
    }
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  }
  engancharVideo();

  /* puntero → flowmap, como el ejemplo oficial de OGL */
  const mouse = new Vec2(-1, -1);
  const velocity = new Vec2();
  const ultimo = { x: 0, y: 0, t: 0, valido: false };

  function alMover(e) {
    const x = e.clientX, y = e.clientY;
    mouse.set(x / window.innerWidth, 1 - y / window.innerHeight);
    const ahora = performance.now();
    if (ultimo.valido) {
      const dt = Math.max(10, ahora - ultimo.t);
      velocity.x = (x - ultimo.x) / dt;
      velocity.y = (y - ultimo.y) / dt;
      velocity.needsUpdate = true;
    }
    ultimo.x = x; ultimo.y = y; ultimo.t = ahora; ultimo.valido = true;
  }
  window.addEventListener('pointermove', alMover, { passive: true });

  /* bucle con vigilante: la pagina paga por cada visita, el efecto no */
  let vivo = true, visible = true, raf = 0;
  const costes = [];
  let avisos = 0;

  function frame() {
    if (!vivo) return;
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const t0 = performance.now();

    if (!velocity.needsUpdate) { mouse.set(-1, -1); velocity.set(0, 0); }
    flowmap.mouse.copy(mouse);
    flowmap.velocity.lerp(velocity, velocity.needsUpdate ? 0.5 : 0.1);
    velocity.needsUpdate = false;

    if (frameNuevo) { texture.needsUpdate = true; frameNuevo = false; }

    flowmap.update();
    renderer.render({ scene: mesh });

    const coste = performance.now() - t0;
    costes.push(coste);
    if (costes.length >= 30) {
      const mediana = costes.slice().sort((a, b) => a - b)[15];
      costes.length = 0;
      if (mediana > 22) {
        avisos += 1;
        if (avisos >= 2) {
          try { sessionStorage.setItem('mkReelOff', '1'); } catch { /* sin storage */ }
          destruir();
          if (typeof alFallar === 'function') alFallar();
        }
      } else {
        avisos = 0;
      }
    }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      es.forEach((e) => {
        visible = e.isIntersecting;
        if (video) { if (visible) video.play().catch(() => {}); else video.pause(); }
      });
    }, { threshold: 0.02 }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => { visible = !document.hidden && visible; });

  function destruir() {
    vivo = false;
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', alMover);
    if (video && !video.paused) video.pause();
    canvas.remove();
    if (video) video.style.display = '';
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  }

  requestAnimationFrame(() => canvas.classList.add('on'));
  raf = requestAnimationFrame(frame);

  return { destruir };
}
