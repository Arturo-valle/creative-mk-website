/* CREATIVE MK · landing de campaña.
   Stack auto-hospedado: Lenis, GSAP, ScrollTrigger, SplitText, OGL.
   Los vendors cargan con <script defer> antes que este archivo.
   Si algo falta, la página sigue legible: la clase .anim que oculta
   elementos la añade este script, nunca el CSS. */

(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anchoOk = window.matchMedia('(min-width: 900px)').matches;

  /* ---------- puerta de capacidad para el reel ----------
     failIfMajorPerformanceCaveat es la deteccion primaria: sobre
     SwiftShader/llvmpipe devuelve null antes de rasterizar un frame.
     La extension de debug es segunda opinion, no veredicto (Firefox
     la deprecó y su ausencia no puede significar "adelante"). */
  function webgl2PorHardware() {
    let gl = null;
    try {
      gl = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    } catch { return false; }
    if (!gl) return false;
    try {
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      if (!info) return true;
      const r = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || '');
      return !/swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i.test(r);
    } catch {
      return true;
    } finally {
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
  }

  function puertasReel() {
    if (reducido || !anchoOk) return false;
    if (window.matchMedia('(pointer: coarse)').matches) return false;
    try { if (sessionStorage.getItem('mkReelOff')) return false; } catch { /* sin storage */ }
    const nav = window.navigator;
    if (nav.connection && nav.connection.saveData) return false;
    if ((nav.deviceMemory || 8) < 4) return false;
    return webgl2PorHardware();
  }

  /* ---------- Lenis ---------- */

  let lenis = null;

  function iniciarLenis() {
    if (reducido || typeof window.Lenis !== 'function') return;
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, syncTouch: false });

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((t) => lenis.raf(t * 1000));
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const bucle = (t) => { lenis.raf(t); requestAnimationFrame(bucle); };
      requestAnimationFrame(bucle);
    }

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const destino = document.querySelector(a.getAttribute('href'));
        if (!destino) return;
        e.preventDefault();
        lenis.scrollTo(destino, { offset: 0 });
      });
    });
  }

  /* ---------- el reel: flowmap si hay maquina, video plano si no ---------- */

  function iniciarVideoPlano() {
    const v = $('#hero-video');
    if (!v || reducido) return;
    v.src = anchoOk ? '/video/hero-clean-1280-v1.mp4' : '/video/hero-clean-720-v1.mp4';
    v.addEventListener('canplay', () => v.classList.add('on'), { once: true });
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); });
      }, { threshold: 0.05 }).observe(v);
    }
  }

  function iniciarShow() {
    if (!puertasReel()) { iniciarVideoPlano(); return; }
    import('/js/lp/reel.js')
      .then((mod) => {
        mod.iniciar({
          hero: $('#hero'),
          video: $('#hero-video'),
          posterUrl: '/images/lp/hero-poster-1280-v1.avif',
          alFallar: iniciarVideoPlano
        });
      })
      .catch(iniciarVideoPlano);
  }

  /* ---------- animacion ---------- */

  function iniciarAnimacion() {
    const gsap = window.gsap;
    if (!gsap || reducido) return;

    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(window.SplitText);

    document.body.classList.add('anim');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const h1 = $('#h1');
    if (h1 && window.SplitText) {
      const split = new window.SplitText(h1, { type: 'lines', linesClass: 'linea-split', mask: 'lines' });
      gsap.set(h1, { opacity: 1 });
      tl.from(split.lines, { yPercent: 115, duration: 1.05, stagger: 0.075 }, 0.15);
    } else if (h1) {
      tl.from(h1, { yPercent: 8, opacity: 0, duration: .9 }, 0.15);
    }

    tl.from('[data-rev="1"]', { y: 22, opacity: 0, duration: .8, stagger: .09 }, 0.5)
      .to('[data-rev="1"]', { opacity: 1, duration: 0 }, 0.5);

    if (!window.ScrollTrigger) {
      gsap.set('[data-rev]', { opacity: 1 });
      return;
    }

    /* Revelados variados: la uniformidad del fade-up en todo es firma de
       plantilla. Las filas del proceso entran desde su costado; el resto,
       desde abajo. Dos vocabularios, no veinte. */
    gsap.utils.toArray('[data-rev="2"]').forEach((el) => {
      const esFila = el.classList.contains('paso');
      gsap.fromTo(el,
        esFila ? { x: -30, opacity: 0 } : { y: 26, opacity: 0 },
        {
          x: 0, y: 0, opacity: 1, duration: esFila ? .7 : .85, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 84%', once: true }
        });
    });

    // Pista horizontal con pin, solo escritorio
    const carril = $('#carril');
    const viewport = $('#pista-viewport');
    if (carril && viewport && anchoOk) {
      const recorrido = () => Math.max(0, carril.scrollWidth - window.innerWidth + 64);
      gsap.to(carril, {
        x: () => -recorrido(),
        ease: 'none',
        scrollTrigger: {
          trigger: '#pista',
          start: 'top top',
          end: () => '+=' + recorrido(),
          pin: viewport,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });
    }

    /* Tipografia cinetica: la velocidad del scroll pesa sobre la variable.
       Inter "usada", no Inter por defecto: el texto gana masa al frenar. */
    if (lenis) {
      const cineticos = Array.from(document.querySelectorAll('#h1, .lg'));
      let wAct = 800;
      gsap.ticker.add(() => {
        const v = Math.min(2.2, Math.abs(lenis.velocity || 0));
        const objetivo = 800 - v * 70;          // 800 en reposo, ~646 a toda velocidad
        wAct += (objetivo - wAct) * 0.12;
        const w = Math.round(wAct);
        cineticos.forEach((el) => { el.style.fontVariationSettings = `'wght' ${w}`; });
      });
    }

    /* CTA magnetico del hero: responde a COMO te acercas.
       Solo el del hero: un objetivo movil en el boton de enviar seria
       estorbar la conversion para lucir el efecto. */
    const cta = document.querySelector('.hero .btn');
    if (cta && window.matchMedia('(pointer: fine)').matches) {
      const qx = gsap.quickTo(cta, 'x', { duration: 0.4, ease: 'power3.out' });
      const qy = gsap.quickTo(cta, 'y', { duration: 0.4, ease: 'power3.out' });
      window.addEventListener('pointermove', (e) => {
        const r = cta.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const d = Math.hypot(dx, dy);
        if (d < 110) { qx(dx * 0.28); qy(dy * 0.28); }
        else { qx(0); qy(0); }
      }, { passive: true });
    }
  }

  /* ---------- acabados con voz ---------- */

  function iniciarAcabados() {
    const original = document.title;
    document.addEventListener('visibilitychange', () => {
      document.title = document.hidden ? '← El reel sigue aquí — CREATIVE MK' : original;
    });
  }

  /* ---------- formulario ---------- */

  const SESSION_KEY = 'creativeMkConciergeSession';

  function sessionId() {
    try {
      const e = localStorage.getItem(SESSION_KEY);
      if (e) return e;
      const n = `mk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, n);
      return n;
    } catch { return `mk-${Date.now().toString(36)}`; }
  }

  function endpoint() {
    const prod = /(^|\.)creativemk\.net$/i.test(location.hostname)
      ? location.origin
      : 'https://creative-mk-concierge.arturo-ordonezv.workers.dev';
    return `${window.CREATIVE_MK_AGENT_BASE || prod}/agents/creative-mk-concierge/${encodeURIComponent(sessionId())}/lead-capture`;
  }

  function atribucion() {
    const p = new URLSearchParams(location.search || '');
    const d = {};
    try { d.referrer = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : 'direct'; }
    catch { d.referrer = 'unknown'; }
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
      const v = p.get(k); if (v) d[k] = v.slice(0, 120);
    });
    return d;
  }

  function iniciarFormulario() {
    const form = $('#form');
    if (!form) return;
    const estado = $('#estado');
    const boton = form.querySelector('button[type="submit"]');
    const etiqueta = boton ? boton.textContent : '';
    let punto = '';

    document.querySelectorAll('.chip').forEach((c) => {
      c.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach((o) => o.setAttribute('aria-pressed', 'false'));
        c.setAttribute('aria-pressed', 'true');
        punto = c.textContent.trim();
      });
    });

    const decir = (e, m) => { if (estado) { estado.dataset.e = e; estado.textContent = m; } };

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (boton) { boton.disabled = true; boton.textContent = 'Enviando…'; }
      decir('', '');

      const datos = Object.fromEntries(new FormData(form).entries());
      const payload = Object.assign({}, datos, atribucion(), {
        consent: true, lang: 'es', service: 'websites', source: 'lp-campana',
        budget_slug: punto, page_url: location.href, agent_session_id: sessionId()
      });

      try {
        const r = await fetch(endpoint(), {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!r.ok) throw new Error(String(r.status));
        form.reset();
        document.querySelectorAll('.chip').forEach((o) => o.setAttribute('aria-pressed', 'false'));
        decir('ok', 'Recibido. Te respondo en 1 día hábil, desde hey@creativemk.net.');
        if (typeof window.creativeMkTrackLead === 'function') {
          window.creativeMkTrackLead({ content_name: 'LP campaña', content_category: 'Website lead' });
        }
      } catch {
        decir('error', 'No he podido enviarlo. Escríbeme a hey@creativemk.net y lo resolvemos.');
      } finally {
        if (boton) { boton.disabled = false; boton.textContent = etiqueta; }
      }
    });
  }

  function iniciar() {
    iniciarFormulario();
    iniciarLenis();
    iniciarAnimacion();
    iniciarAcabados();
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(iniciarShow, { timeout: 1800 });
    else setTimeout(iniciarShow, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
