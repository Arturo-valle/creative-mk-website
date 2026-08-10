/* ============================================
   Signal Terrain — the hero's authored scene.

   Replaces the stock displaced-wireframe with a living contour map: crisp
   topographic rings derived from height bands, navy troughs to gold crests,
   in three acts (docs/immersive-plan.md §2):

   ACT 1 — arrival. The surface boots flat and swells into terrain over ~1.2s,
   so the opening reads "flat signal becomes dimensional", not "three.js was
   already running".

   ACT 2 — dwell. Contour lines from fract(height × bands) with fwidth
   antialiasing. The pointer is a projected attractor: the ray is intersected
   with the base plane and the terrain physically rises toward the cursor, its
   crest going gold.

   ACT 3 — scroll-out. A scrubbed uProgress flattens the terrain back toward a
   horizon as the hero leaves the viewport. If GSAP/ScrollTrigger are absent
   the scene simply keeps dwelling — the act is an enhancement, not a
   dependency.

   Loaded only through the gated dynamic import in js/main.js (reduced motion,
   ≥768px, hardware WebGL2). Palette still comes from css/variables.css so
   this introduces no new brand values.
   ============================================ */

import * as THREE from './vendor/three.module.min.js';

/* The surface stays in the lower part of the frame: the copy sits upper-left,
   and keeping crests away from white text is the one legibility rule this
   background must obey. The pointer bump is capped for the same reason. */
const MESH_X = 8.5;
const MESH_Y = -5.4;
const CAMERA_Y = 2.4;
const AMPLITUDE = 0.62;
const ARRIVAL_MS = 1200;
const POINTER_BUMP = 1.1;

function cssColor(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(value || fallback);
}

export function initHero3D(canvas) {
  const crest = cssColor('--color-primary', '#E8C840');
  const trough = cssColor('--color-navy-light', '#2A3D66');
  const clear = cssColor('--color-black', '#0a0a0a');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setClearColor(clear, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(clear, 0.055);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, CAMERA_Y, 12);
  camera.lookAt(0, -1.2, 0);

  const geometry = new THREE.PlaneGeometry(46, 30, 190, 130);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uAmp: { value: AMPLITUDE },
      uArrival: { value: 0 },
      uProgress: { value: 0 },
      uPointer: { value: new THREE.Vector2(999, 999) },
      uPointerStrength: { value: 0 },
      uBands: { value: 5.0 },
      uAlphaBase: { value: 0.22 },
      uAlphaRange: { value: 0.5 },
      uCrest: { value: crest },
      uTrough: { value: trough }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uAmp;
      uniform float uArrival;
      uniform float uProgress;
      uniform vec2 uPointer;
      uniform float uPointerStrength;
      varying float vH;
      // Three superposed sines: cheap, stable, enough structure to band.
      float wave(vec2 p, float t) {
        return sin(p.x * 0.30 + t * 0.55) * 0.90
             + sin(p.y * 0.42 - t * 0.40) * 0.70
             + sin((p.x + p.y) * 0.20 + t * 0.28) * 1.25;
      }
      void main() {
        vec3 transformed = position;
        float alive = uArrival * (1.0 - uProgress);
        float h = wave(position.xy, uTime) * uAmp * alive;
        // The pointer attractor: a gaussian hill that rises under the cursor.
        vec2 d = position.xy - uPointer;
        h += uPointerStrength * alive * exp(-dot(d, d) / 16.0);
        transformed.z += h;
        vH = h;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 uCrest;
      uniform vec3 uTrough;
      uniform float uBands;
      uniform float uAlphaBase;
      uniform float uAlphaRange;
      uniform float uProgress;
      varying float vH;
      void main() {
        float m = smoothstep(-1.6, 2.4, vH);
        // Topographic rings: distance to the nearest height band, antialiased
        // with the screen-space derivative so lines stay 1px at any depth.
        float bands = vH * uBands;
        float w = max(fwidth(bands), 1e-4);
        float d = abs(fract(bands - 0.5) - 0.5) / w;
        float line = clamp(1.0 - d, 0.0, 1.0);
        vec3 colour = mix(uTrough, uCrest, pow(m, 2.0));
        float alpha = line * (uAlphaBase + m * uAlphaRange) * (1.0 - uProgress * 0.85);
        gl_FragColor = vec4(colour, alpha);
      }`
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI * 0.42;
  mesh.position.x = MESH_X;
  mesh.position.y = MESH_Y;
  scene.add(mesh);
  mesh.updateMatrixWorld();

  /* Pointer → mesh-local coordinates via a ray against the base plane (the
     undisplaced surface). A mathematical plane intersection instead of a
     Raycaster against 49k triangles: same answer for our purpose, none of the
     cost, safe to run on every pointermove. */
  const basePlane = new THREE.Plane();
  const planeNormal = new THREE.Vector3(0, 0, 1)
    .applyQuaternion(mesh.quaternion)
    .normalize();
  basePlane.setFromNormalAndCoplanarPoint(planeNormal, mesh.position);

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  const pointerTarget = new THREE.Vector2(999, 999);
  let strengthTarget = 0;

  function onPointerMove(event) {
    ndc.x = (event.clientX / window.innerWidth) * 2 - 1;
    ndc.y = -((event.clientY / window.innerHeight) * 2 - 1);
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(basePlane, hit)) {
      mesh.worldToLocal(hit);
      pointerTarget.set(hit.x, hit.y);
      strengthTarget = POINTER_BUMP;
    } else {
      strengthTarget = 0;
    }
  }

  function onPointerLeave() {
    strengthTarget = 0;
  }

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  /* ACT 3 — scroll-out. GSAP and ScrollTrigger are deferred globals; by the
     time this module loads (post-idle) they are either present or they failed,
     and either way the scene works. Scrub 0.6 keeps the flattening slightly
     behind the finger, which reads as weight. */
  let scrollTrigger = null;
  if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
    window.gsap.registerPlugin(window.ScrollTrigger);
    const state = { p: 0 };
    const tween = window.gsap.to(state, {
      p: 1,
      ease: 'none',
      onUpdate: () => { material.uniforms.uProgress.value = state.p; },
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      }
    });
    scrollTrigger = tween.scrollTrigger || null;
  }

  /* The loop runs only while the hero is worth drawing: tab in front, hero on
     screen. Same discipline as before — frames nobody sees are pure cost. */
  let tabVisible = document.visibilityState === 'visible';
  let heroOnScreen = true;
  let running = false;
  let startedAt = 0;

  function sync() {
    const shouldRun = tabVisible && heroOnScreen;
    if (shouldRun === running) return;
    running = shouldRun;
    renderer.setAnimationLoop(running ? frame : null);
  }

  function onVisibility() {
    tabVisible = document.visibilityState === 'visible';
    sync();
  }

  const host = canvas.closest('#hero') || canvas.parentElement;
  let heroObserver = null;
  if (host && typeof IntersectionObserver === 'function') {
    heroObserver = new IntersectionObserver((entries) => {
      heroOnScreen = entries.some((entry) => entry.isIntersecting);
      sync();
    }, { threshold: 0 });
    heroObserver.observe(host);
  }

  const pointerUniform = material.uniforms.uPointer.value;

  function frame(now) {
    if (!startedAt) startedAt = now;
    // ACT 1 — the swell. easeOutCubic from flat to full terrain.
    const t = Math.min(1, (now - startedAt) / ARRIVAL_MS);
    material.uniforms.uArrival.value = 1 - Math.pow(1 - t, 3);

    material.uniforms.uTime.value = now / 1000;
    pointerUniform.lerp(pointerTarget, 0.06);
    material.uniforms.uPointerStrength.value +=
      (strengthTarget - material.uniforms.uPointerStrength.value) * 0.05;
    renderer.render(scene, camera);
  }

  function dispose() {
    renderer.setAnimationLoop(null);
    if (heroObserver) heroObserver.disconnect();
    if (scrollTrigger) scrollTrigger.kill();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', dispose);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', dispose, { once: true });

  resize();
  sync();

  return dispose;
}
