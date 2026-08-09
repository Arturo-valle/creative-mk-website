/* ============================================
   Hero ambient background — noise-displaced wireframe surface.

   Loaded only through a dynamic import from js/main.js, and only when the
   visitor can actually benefit: no reduced-motion preference, WebGL2 available,
   viewport at least 768px. Everything below the capability gate lives here so
   none of it reaches the initial payload.

   Palette comes from css/variables.css at runtime, so this introduces no new
   brand values: --color-primary for the crest, --color-navy-light for the
   troughs, --color-black for the clear colour and the fog.
   ============================================ */

import * as THREE from './vendor/three.module.min.js';

/* The surface is deliberately kept in the lower part of the frame. The hero
   copy sits upper-left, and a bright crest passing behind white text is the one
   way this background can hurt legibility. */
const MESH_X = 8.5;
const MESH_Y = -5.4;
const CAMERA_Y = 2.4;
const AMPLITUDE = 0.62;
const ALPHA_BASE = 0.15;
const ALPHA_RANGE = 0.30;

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
    wireframe: true,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uAmp: { value: AMPLITUDE },
      uAlphaBase: { value: ALPHA_BASE },
      uAlphaRange: { value: ALPHA_RANGE },
      uCrest: { value: crest },
      uTrough: { value: trough }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uAmp;
      varying float vH;
      // Three superposed sines. Cheap, stable, and enough structure to read as
      // a surface without a noise texture.
      float wave(vec2 p, float t) {
        return sin(p.x * 0.30 + t * 0.55) * 0.90
             + sin(p.y * 0.42 - t * 0.40) * 0.70
             + sin((p.x + p.y) * 0.20 + t * 0.28) * 1.25;
      }
      void main() {
        vec3 transformed = position;
        float h = wave(position.xy, uTime) * uAmp;
        transformed.z += h;
        vH = h;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 uCrest;
      uniform vec3 uTrough;
      uniform float uAlphaBase;
      uniform float uAlphaRange;
      varying float vH;
      void main() {
        float m = smoothstep(-1.6, 2.4, vH);
        vec3 colour = mix(uTrough, uCrest, pow(m, 2.4));
        gl_FragColor = vec4(colour, uAlphaBase + m * uAlphaRange);
      }`
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI * 0.42;
  mesh.position.x = MESH_X;
  mesh.position.y = MESH_Y;
  scene.add(mesh);

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  function onPointerMove(event) {
    pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.targetY = -((event.clientY / window.innerHeight) * 2 - 1);
  }

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  let running = true;
  function onVisibility() {
    // No point burning a GPU on a tab nobody is looking at.
    if (document.visibilityState === 'visible') {
      if (!running) {
        running = true;
        renderer.setAnimationLoop(frame);
      }
    } else if (running) {
      running = false;
      renderer.setAnimationLoop(null);
    }
  }

  function frame(now) {
    pointer.x += (pointer.targetX - pointer.x) * 0.045;
    pointer.y += (pointer.targetY - pointer.y) * 0.045;
    material.uniforms.uTime.value = now / 1000;
    mesh.rotation.z = pointer.x * 0.05;
    camera.position.y = CAMERA_Y + pointer.y * 0.7;
    camera.lookAt(0, -1.2, 0);
    renderer.render(scene, camera);
  }

  function dispose() {
    renderer.setAnimationLoop(null);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', dispose);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', dispose, { once: true });

  resize();
  renderer.setAnimationLoop(frame);

  return dispose;
}
