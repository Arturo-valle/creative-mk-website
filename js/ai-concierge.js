(function () {
  const LANG_KEY = 'creativeMkLang';
  const SESSION_KEY = 'creativeMkConciergeSession';
  const BRIEF_KEY = 'creativeMkBrief';
  const REPORT_KEY = 'creativeMkReportReceipt';
  const MAX_MESSAGE = 800;

  const copy = {
    en: {
      fab: 'Ask MK',
      title: 'MK Growth Concierge',
      subtitle: 'Focused diagnostic for brand, websites, UX, growth and AI workflows.',
      input: 'Ask which service fits, or paste a URL for a clarity check.',
      send: 'Send',
      close: 'Close',
      open: 'Open concierge',
      typing: 'Thinking...',
      error: 'The AI layer is resting. I can still guide you with the local service map.',
      auditPrompt: 'Paste a public URL and I will run a quick clarity and conversion check.',
      briefReady: 'Brief ready. Opening the contact form.',
      briefCta: 'Create brief',
      captureTitle: 'Save this diagnostic',
      captureText: 'CREATIVE MK can review this map and reply with a sharper next step.',
      captureName: 'Name',
      captureEmail: 'Work email',
      captureCompany: 'Company',
      captureConsent: 'I agree CREATIVE MK can store this diagnostic and contact me about this project.',
      captureSubmit: 'Save diagnostic',
      captureSuccess: 'Saved. CREATIVE MK has this diagnostic in the private dashboard.',
      captureReportLink: 'Open diagnostic receipt',
      mapTitle: 'Growth Map',
      mapScore: 'Fit score',
      mapService: 'Primary path',
      mapNext: 'Next question',
      quicks: [
        ['diagnostic', 'Growth diagnostic'],
        ['audit', 'Audit my website'],
        ['service', 'Which service fits?'],
        ['brief', 'Create brief']
      ],
      inlineEyebrow: 'MK Growth Concierge',
      inlineText: 'Get a focused diagnostic before you brief us.'
    },
    es: {
      fab: 'Ask MK',
      title: 'MK Growth Concierge',
      subtitle: 'Diagnóstico enfocado para marca, sitios web, UX, growth e IA.',
      input: 'Pregunta qué servicio encaja, o pega una URL para revisar claridad.',
      send: 'Enviar',
      close: 'Cerrar',
      open: 'Abrir concierge',
      typing: 'Pensando...',
      error: 'La capa de IA está descansando. Igual puedo guiarte con el mapa local de servicios.',
      auditPrompt: 'Pega una URL pública y reviso claridad, conversión y siguiente acción.',
      briefReady: 'Brief listo. Abriendo el formulario de contacto.',
      briefCta: 'Crear brief',
      captureTitle: 'Guardar diagnóstico',
      captureText: 'CREATIVE MK puede revisar este mapa y responder con un siguiente paso más claro.',
      captureName: 'Nombre',
      captureEmail: 'Email de trabajo',
      captureCompany: 'Empresa',
      captureConsent: 'Acepto que CREATIVE MK guarde este diagnóstico y me contacte sobre este proyecto.',
      captureSubmit: 'Guardar diagnóstico',
      captureSuccess: 'Guardado. CREATIVE MK ya tiene este diagnóstico en el dashboard privado.',
      captureReportLink: 'Abrir recibo del diagnóstico',
      mapTitle: 'Growth Map',
      mapScore: 'Score de fit',
      mapService: 'Ruta principal',
      mapNext: 'Siguiente pregunta',
      quicks: [
        ['diagnostic', 'Diagnóstico de crecimiento'],
        ['audit', 'Auditar mi web'],
        ['service', '¿Qué servicio encaja?'],
        ['brief', 'Crear brief']
      ],
      inlineEyebrow: 'MK Growth Concierge',
      inlineText: 'Obtén un diagnóstico enfocado antes de enviarnos tu brief.'
    }
  };

  function getLang() {
    try {
      return localStorage.getItem(LANG_KEY) === 'es' ? 'es' : 'en';
    } catch {
      return 'en';
    }
  }

  function getSessionId() {
    try {
      const existing = localStorage.getItem(SESSION_KEY);
      if (existing) return existing;
      const next = `mk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, next);
      return next;
    } catch {
      return `mk-${Date.now().toString(36)}`;
    }
  }

  function endpoint(action) {
    const productionOrigin = /(^|\.)creativemk\.net$/i.test(window.location.hostname)
      ? window.location.origin
      : 'https://creative-mk-concierge.arturo-ordonezv.workers.dev';
    const base = window.CREATIVE_MK_AGENT_BASE || productionOrigin;
    return `${base}/agents/creative-mk-concierge/${encodeURIComponent(getSessionId())}/${action}`;
  }

  function isUrl(value) {
    return /^(https?:\/\/|www\.)[^\s]+\.[^\s]+/i.test(value.trim());
  }

  function localReply(message, lang) {
    const text = message.toLowerCase();
    const service = /brand|logo|marca|identidad/.test(text)
      ? lang === 'es' ? 'Branding' : 'Branding'
      : /ads|meta|pauta|traffic|trafico|tráfico|growth|marketing|contenido|content/.test(text)
        ? 'Growth & Marketing'
        : /automation|automatizacion|automatización|chatbot|ia|ai/.test(text)
          ? lang === 'es' ? 'Automatización IA' : 'AI Automation'
          : /app|software|portal|saas/.test(text)
            ? lang === 'es' ? 'Desarrollo' : 'Development'
            : /ux|ui|producto|product|prototype|prototipo/.test(text)
              ? 'Digital Product UX/UI'
              : lang === 'es' ? 'Sitios Web' : 'Websites';

    if (lang === 'es') {
      return `Mi recomendación inicial: ${service}. Lo convertiría en un sistema con mensaje claro, punto de conversión y seguimiento útil. Dime tu objetivo, canal actual y urgencia para afinarlo.`;
    }

    return `Initial recommendation: ${service}. I would turn it into a system with clear messaging, a conversion point, and useful follow-up. Tell me your goal, current channel, and urgency to sharpen it.`;
  }

  function buildWidget() {
    const root = document.createElement('div');
    root.className = 'mk-concierge';
    root.innerHTML = `
      <button class="mk-concierge__fab" type="button" aria-expanded="false">
        <span class="mk-concierge__mark">MK</span>
        <span class="mk-concierge__fab-text"></span>
      </button>
      <section class="mk-concierge__panel" aria-label="MK Growth Concierge" hidden>
        <header class="mk-concierge__header">
          <div>
            <strong class="mk-concierge__title"></strong>
            <span class="mk-concierge__subtitle"></span>
          </div>
          <button class="mk-concierge__close" type="button">×</button>
        </header>
        <div class="mk-concierge__messages" aria-live="polite"></div>
        <aside class="mk-concierge__map" hidden>
          <div class="mk-concierge__map-top">
            <span class="mk-concierge__map-title"></span>
            <strong class="mk-concierge__map-score">--</strong>
          </div>
          <div class="mk-concierge__map-bar" aria-hidden="true"><span></span></div>
          <dl class="mk-concierge__map-grid">
            <div>
              <dt class="mk-concierge__map-service-label"></dt>
              <dd class="mk-concierge__map-service">--</dd>
            </div>
            <div>
              <dt class="mk-concierge__map-next-label"></dt>
              <dd class="mk-concierge__map-next">--</dd>
            </div>
          </dl>
        </aside>
        <form class="mk-concierge__capture" hidden>
          <strong class="mk-concierge__capture-title"></strong>
          <span class="mk-concierge__capture-text"></span>
          <div class="mk-concierge__capture-grid">
            <input class="mk-concierge__capture-name" name="name" type="text" autocomplete="name" required>
            <input class="mk-concierge__capture-email" name="email" type="email" autocomplete="email" required>
            <input class="mk-concierge__capture-company" name="company" type="text" autocomplete="organization">
          </div>
          <label class="mk-concierge__capture-consent">
            <input type="checkbox" name="consent" required>
            <span></span>
          </label>
          <button class="mk-concierge__capture-submit" type="submit"></button>
        </form>
        <div class="mk-concierge__quicks"></div>
        <form class="mk-concierge__form">
          <textarea class="mk-concierge__input" rows="2" maxlength="${MAX_MESSAGE}"></textarea>
          <button class="mk-concierge__send" type="submit"></button>
        </form>
        <div class="mk-concierge__turnstile" aria-hidden="true"></div>
      </section>
    `;
    document.body.appendChild(root);
    return root;
  }

  const root = buildWidget();
  const fab = root.querySelector('.mk-concierge__fab');
  const panel = root.querySelector('.mk-concierge__panel');
  const close = root.querySelector('.mk-concierge__close');
  const messages = root.querySelector('.mk-concierge__messages');
  const growthMap = root.querySelector('.mk-concierge__map');
  const mapScore = root.querySelector('.mk-concierge__map-score');
  const mapBar = root.querySelector('.mk-concierge__map-bar span');
  const mapService = root.querySelector('.mk-concierge__map-service');
  const mapNext = root.querySelector('.mk-concierge__map-next');
  const capture = root.querySelector('.mk-concierge__capture');
  const captureName = root.querySelector('.mk-concierge__capture-name');
  const captureEmail = root.querySelector('.mk-concierge__capture-email');
  const captureCompany = root.querySelector('.mk-concierge__capture-company');
  const captureConsent = root.querySelector('.mk-concierge__capture-consent span');
  const captureSubmit = root.querySelector('.mk-concierge__capture-submit');
  const quicks = root.querySelector('.mk-concierge__quicks');
  const form = root.querySelector('.mk-concierge__form');
  const input = root.querySelector('.mk-concierge__input');
  const send = root.querySelector('.mk-concierge__send');
  const turnstileSlot = root.querySelector('.mk-concierge__turnstile');
  let auditMode = false;
  let busy = false;
  let lastDiagnosticPayload = null;
  let captureShown = false;
  let turnstileLoad;
  let turnstileWidgetId;
  let publicConfigLoad;
  let publicConfig;

  function t() {
    return copy[getLang()];
  }

  function translate() {
    const langCopy = t();
    root.querySelector('.mk-concierge__fab-text').textContent = langCopy.fab;
    root.querySelector('.mk-concierge__title').textContent = langCopy.title;
    root.querySelector('.mk-concierge__subtitle').textContent = langCopy.subtitle;
    close.setAttribute('aria-label', langCopy.close);
    fab.setAttribute('aria-label', langCopy.open);
    input.placeholder = langCopy.input;
    send.textContent = langCopy.send;
    root.querySelector('.mk-concierge__map-title').textContent = langCopy.mapTitle;
    root.querySelector('.mk-concierge__map-service-label').textContent = langCopy.mapService;
    root.querySelector('.mk-concierge__map-next-label').textContent = langCopy.mapNext;
    root.querySelector('.mk-concierge__capture-title').textContent = langCopy.captureTitle;
    root.querySelector('.mk-concierge__capture-text').textContent = langCopy.captureText;
    captureName.placeholder = langCopy.captureName;
    captureEmail.placeholder = langCopy.captureEmail;
    captureCompany.placeholder = langCopy.captureCompany;
    captureConsent.textContent = langCopy.captureConsent;
    captureSubmit.textContent = langCopy.captureSubmit;
    growthMap.setAttribute('aria-label', `${langCopy.mapTitle}: ${langCopy.mapScore}`);
    quicks.innerHTML = '';

    langCopy.quicks.forEach(([mode, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mk-concierge__quick';
      button.textContent = label;
      button.dataset.mode = mode;
      quicks.appendChild(button);
    });

    document.querySelectorAll('[data-mk-concierge-trigger]').forEach((button) => {
      const eyebrow = button.querySelector('.ai-concierge-inline__eyebrow');
      const text = button.querySelector('.ai-concierge-inline__text');
      if (eyebrow) eyebrow.textContent = langCopy.inlineEyebrow;
      if (text) text.textContent = langCopy.inlineText;
    });
  }

  function addMessage(role, text) {
    const item = document.createElement('div');
    item.className = `mk-concierge__message mk-concierge__message--${role}`;
    item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  function addReportReceipt(reportUrl) {
    if (!reportUrl) return;
    const link = document.createElement('a');
    link.className = 'mk-concierge__receipt';
    link.href = reportUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = t().captureReportLink;
    messages.appendChild(link);
    messages.scrollTop = messages.scrollHeight;
  }

  function updateGrowthMap(data) {
    const diagnostic = data && data.diagnostic;
    if (!diagnostic) return;

    lastDiagnosticPayload = data;
    const score = Number(data.leadScore || diagnostic.leadScore?.score || 0);
    const service = diagnostic.primaryService || '--';
    const support = Array.isArray(diagnostic.supportServices) && diagnostic.supportServices.length
      ? ` + ${diagnostic.supportServices.join(' + ')}`
      : '';

    growthMap.hidden = false;
    mapScore.textContent = `${Math.max(0, Math.min(100, score))}/100`;
    mapBar.style.width = `${Math.max(8, Math.min(100, score))}%`;
    mapService.textContent = `${service}${support}`;
    mapNext.textContent = data.nextQuestion || diagnostic.nextQuestion || '--';
  }

  function maybeShowCapture(data, reason) {
    const diagnostic = data && data.diagnostic;
    const score = Number(data?.leadScore || diagnostic?.leadScore?.score || 0);
    const highIntent = score >= 70 || reason === 'audit-url' || reason === 'brief';
    if (!highIntent || captureShown) return;

    captureShown = true;
    capture.hidden = false;
    logEvent('capture-open', {
      reason,
      scoreBand: Math.floor(score / 20) * 20,
      page: window.location.pathname
    });
  }

  function referrerType() {
    try {
      if (!document.referrer) return 'direct';
      const referrer = new URL(document.referrer);
      if (referrer.hostname === window.location.hostname) return 'internal';
      return referrer.hostname.replace(/^www\./, '').slice(0, 80);
    } catch {
      return 'unknown';
    }
  }

  function attribution() {
    const params = new URLSearchParams(window.location.search || '');
    const data = { referrer: referrerType() };
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
      const value = params.get(key);
      if (value) data[key] = value.slice(0, 120);
    });
    return data;
  }

  function logEvent(eventType, metadata) {
    fetch(endpoint('events'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: getLang(), eventType, metadata: { ...attribution(), ...(metadata || {}) } }),
      keepalive: true
    }).catch(() => {});
  }

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (turnstileLoad) return turnstileLoad;

    turnstileLoad = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return turnstileLoad;
  }

  async function loadPublicConfig() {
    if (publicConfig) return publicConfig;
    if (publicConfigLoad) return publicConfigLoad;

    publicConfigLoad = fetch(endpoint('config'), {
      headers: { Accept: 'application/json' }
    })
      .then((response) => response.ok ? response.json() : {})
      .then((config) => {
        publicConfig = config || {};
        return publicConfig;
      })
      .catch(() => ({}));

    return publicConfigLoad;
  }

  async function getTurnstileToken(action) {
    const config = await loadPublicConfig();
    const siteKey = window.CREATIVE_MK_TURNSTILE_SITE_KEY || config?.turnstile?.siteKey;
    if (!siteKey) return null;

    try {
      const turnstile = await loadTurnstile();
      return await new Promise((resolve, reject) => {
        const options = {
          sitekey: siteKey,
          size: 'invisible',
          action,
          callback: resolve,
          'error-callback': reject,
          'expired-callback': () => resolve(null)
        };

        if (turnstileWidgetId === undefined) {
          turnstileWidgetId = turnstile.render(turnstileSlot, options);
        }

        turnstile.execute(turnstileWidgetId, { action });
      });
    } catch {
      return null;
    }
  }

  function setOpen(open) {
    panel.hidden = !open;
    root.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', String(open));
    if (open) {
      translate();
      window.setTimeout(() => input.focus(), 60);
    }
  }

  async function post(action, payload) {
    const protectedPayload = { lang: getLang(), ...payload };
    if (action === 'audit-url' || action === 'brief' || action === 'lead-capture') {
      const token = await getTurnstileToken(action);
      if (token) protectedPayload.turnstileToken = token;
    }

    const response = await fetch(endpoint(action), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(protectedPayload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Request failed ${response.status}`);
    }
    return data;
  }

  async function ask(message) {
    if (busy) return;
    const clean = message.trim().slice(0, MAX_MESSAGE);
    if (!clean) return;
    busy = true;
    input.value = '';
    addMessage('user', clean);
    const thinking = addMessage('assistant', t().typing);

    try {
      const action = auditMode || isUrl(clean) ? 'audit-url' : 'chat';
      const data = action === 'audit-url'
        ? await post(action, { url: clean })
        : await post(action, { message: clean, context: { page: window.location.pathname } });
      thinking.textContent = data.reply || localReply(clean, getLang());
      updateGrowthMap(data);
      maybeShowCapture(data, action);
      logEvent(action, { page: window.location.pathname, fallback: Boolean(data.fallback) });
      auditMode = false;
    } catch (error) {
      thinking.textContent = error.message && !/Request failed/.test(error.message)
        ? error.message
        : localReply(clean, getLang());
    } finally {
      busy = false;
    }
  }

  async function createBrief() {
    if (busy) return;
    busy = true;
    const thinking = addMessage('assistant', t().typing);
    try {
      const data = await post('brief', {});
      if (data.brief) {
        localStorage.setItem(BRIEF_KEY, JSON.stringify(data.brief));
      }
      if (data.reportUrl) {
        localStorage.setItem(REPORT_KEY, JSON.stringify({
          reportId: data.reportId,
          reportUrl: data.reportUrl,
          report: data.report || null,
          savedAt: new Date().toISOString()
        }));
      }
      updateGrowthMap(data);
      logEvent('form-click', { source: 'brief', page: window.location.pathname });
      thinking.textContent = t().briefReady;
      window.setTimeout(() => {
        window.location.href = data.contactUrl || 'contact.html?from=mk-concierge';
      }, 360);
    } catch {
      const lang = getLang();
      const fallbackBrief = {
        source: 'mk-growth-concierge',
        createdAt: new Date().toISOString(),
        lang,
        recommendedService: lang === 'es' ? 'Sitios Web' : 'Websites',
        serviceSlug: 'web-design',
        supportServices: lang === 'es' ? ['Growth & Marketing', 'Automatización IA'] : ['Growth & Marketing', 'AI Automation'],
        leadScore: 35,
        budget: lang === 'es' ? 'No estoy seguro' : 'Not sure yet',
        budgetSlug: 'not-sure',
        timeline: 'Flexible',
        timelineSlug: 'flexible',
        summary: localReply('', lang),
        notes: messages.textContent.slice(-1200)
      };
      localStorage.setItem(BRIEF_KEY, JSON.stringify(fallbackBrief));
      logEvent('form-click', { source: 'brief-fallback', page: window.location.pathname, fallback: true });
      thinking.textContent = t().briefReady;
      window.setTimeout(() => {
        window.location.href = 'contact.html?from=mk-concierge';
      }, 360);
    } finally {
      busy = false;
    }
  }

  async function submitCapture(event) {
    event.preventDefault();
    if (busy) return;
    if (!capture.checkValidity()) {
      capture.reportValidity();
      return;
    }

    busy = true;
    captureSubmit.disabled = true;
    const thinking = addMessage('assistant', t().typing);
    let storedBrief = null;
    try {
      storedBrief = JSON.parse(localStorage.getItem(BRIEF_KEY) || 'null');
    } catch {
      storedBrief = null;
    }

    try {
      const data = await post('lead-capture', {
        name: captureName.value.trim(),
        email: captureEmail.value.trim(),
        company: captureCompany.value.trim(),
        consent: true,
        source: 'mk-concierge-chat',
        page_url: window.location.href,
        ...attribution(),
        brief: storedBrief,
        diagnostic: lastDiagnosticPayload?.diagnostic || null,
        leadScore: lastDiagnosticPayload?.leadScore || null
      });
      updateGrowthMap(data);
      logEvent('capture-submit', {
        page: window.location.pathname,
        priority: data.dashboardPriority,
        leadId: data.leadId
      });
      thinking.textContent = t().captureSuccess;
      if (data.reportUrl) {
        try {
          localStorage.setItem(REPORT_KEY, JSON.stringify({
            leadId: data.leadId,
            reportId: data.reportId,
            reportUrl: data.reportUrl,
            reports: data.reports || {},
            savedAt: new Date().toISOString()
          }));
        } catch {}
        addReportReceipt(data.reportUrl);
      }
      capture.hidden = true;
    } catch (error) {
      thinking.textContent = error.message || t().error;
      captureSubmit.disabled = false;
    } finally {
      busy = false;
    }
  }

  function handleQuick(mode) {
    setOpen(true);
    logEvent('quick', { mode, page: window.location.pathname });
    if (mode === 'audit') {
      auditMode = true;
      addMessage('assistant', t().auditPrompt);
      input.placeholder = 'https://example.com';
      return;
    }
    if (mode === 'brief') {
      createBrief();
      return;
    }
    const prompts = {
      diagnostic: getLang() === 'es'
        ? 'Quiero diagnosticar mi sistema de crecimiento. Mi objetivo es vender más y ordenar mis canales.'
        : 'I want to diagnose my growth system. My goal is to sell more and organize my channels.',
      service: getLang() === 'es'
        ? 'No sé qué servicio necesito. Ayúdame a elegir entre sitio web, branding, UX, growth, desarrollo o automatización.'
        : 'I am not sure which service I need. Help me choose between website, branding, UX, growth, development, or automation.'
    };
    ask(prompts[mode] || prompts.diagnostic);
  }

  fab.addEventListener('click', () => {
    const willOpen = panel.hidden;
    setOpen(willOpen);
    logEvent(willOpen ? 'open' : 'close', { source: 'fab', page: window.location.pathname });
  });
  close.addEventListener('click', () => {
    setOpen(false);
    logEvent('close', { source: 'panel', page: window.location.pathname });
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    ask(input.value);
  });
  capture.addEventListener('submit', submitCapture);
  quicks.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-mode]');
    if (button) handleQuick(button.dataset.mode);
  });
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-mk-concierge-trigger]');
    if (trigger) {
      event.preventDefault();
      handleQuick(trigger.dataset.mode || 'diagnostic');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });
  window.addEventListener('storage', (event) => {
    if (event.key === LANG_KEY) translate();
  });

  translate();
  logEvent('page-view', {
    page: window.location.pathname,
    title: document.title.slice(0, 120),
    referrer: referrerType()
  });

  window.creativeMkConcierge = {
    open: function (mode) {
      setOpen(true);
      if (mode) handleQuick(mode);
    },
    createBrief
  };
})();
