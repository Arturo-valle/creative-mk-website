import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mzdwbeqy';
const LANG_KEY = 'creativeMkLang';
const SESSION_KEY = 'creativeMkConciergeSession';
const BRIEF_KEY = 'creativeMkBrief';
const LOGO_SRC = import.meta.env.DEV ? '/Logos/logo-dark.png' : 'Logos/logo-dark.png';

const copy = {
  en: {
    nav: {
      work: 'Work',
      services: 'Services',
      about: 'About',
      blog: 'Insights',
      contact: 'Contact'
    },
    heroTitle: "Let's Talk",
    heroText: 'Tell us what you are trying to clarify, launch, redesign, or automate. We will map the right first system across brand, UX/UI, website, growth, development, or AI.',
    clientLabel: 'Start a project',
    directEmail: 'hey@creativemk.net',
    directProject: 'Send a focused brief',
    responseTime: 'Response window',
    responseValue: 'Within 1 business day',
    formTitle: 'Send a focused project brief',
    formText: 'Share the context that helps us recommend scope, sequence, and the first useful next step.',
    agentBriefTitle: 'MK Concierge brief loaded',
    agentBriefText: 'Review the prefilled recommendation, add your contact details, and send when ready.',
    progress: 'Request completeness',
    summaryTitle: 'Live request snapshot',
    summaryEmpty: 'Your selected service, budget and launch window will appear here as you fill the form.',
    labels: {
      name: 'Full name',
      email: 'Work email',
      phone: 'Phone',
      company: 'Company',
      service: 'Service',
      budget: 'Budget',
      timeline: 'Launch window',
      message: 'Project notes'
    },
    placeholders: {
      name: 'Your name',
      email: 'you@company.com',
      phone: '+1 555 000 0000',
      company: 'Company or brand',
      message: 'What are you trying to build, fix, launch, or scale?'
    },
    optional: 'Optional',
    submit: 'Send project request',
    submitting: 'Sending request...',
    successTitle: 'Request received.',
    successText: 'Thanks for reaching out. We will review the details and reply with the next step.',
    consentLabel: 'I agree that CREATIVE MK can store this request and contact me about this project.',
    consentHelp: 'Your request stays inside CREATIVE MK systems. We do not sell your information.',
    error: 'We could not send the request. Please try again or email us directly.',
    fallbackNotice: 'Cloudflare capture was unavailable, so the request was sent through the temporary fallback.',
    requiredHint: 'Required fields are marked with an asterisk.',
    serviceOptions: [
      'Branding',
      'Websites',
      'Digital Product UX/UI',
      'Growth & Marketing',
      'Development',
      'AI Automation'
    ],
    budgetOptions: ['Not sure yet', 'Under $1,000', '$1,000-$3,000', '$3,000-$7,500', '$7,500-$15,000', '$15,000+'],
    timelineOptions: ['ASAP', '2-4 weeks', '1-2 months', 'This quarter', 'Flexible'],
    footerTitle: 'CREATIVE MK',
    footerText: 'Bilingual digital studio. Available remotely.',
    legalLabel: 'Legal notes',
    privacyTitle: 'Privacy notice',
    privacyText: 'We use the information you send to review your request, respond to your project, and improve our lead process. We do not sell personal information.',
    termsTitle: 'Service terms',
    termsText: 'Every engagement starts with a scoped proposal, timeline, deliverables, and approval path. No work begins until both sides agree to the project terms.'
  },
  es: {
    nav: {
      work: 'Proyectos',
      services: 'Servicios',
      about: 'Nosotros',
      blog: 'Insights',
      contact: 'Contacto'
    },
    heroTitle: 'Hablemos',
    heroText: 'Cuéntanos qué quieres aclarar, lanzar, rediseñar o automatizar. Vamos a mapear el primer sistema correcto entre marca, UX/UI, sitio web, crecimiento, desarrollo o IA.',
    clientLabel: 'Iniciar proyecto',
    directEmail: 'hey@creativemk.net',
    directProject: 'Enviar brief enfocado',
    responseTime: 'Tiempo de respuesta',
    responseValue: 'Dentro de 1 día hábil',
    formTitle: 'Envía un brief enfocado',
    formText: 'Comparte el contexto que nos ayuda a recomendar alcance, secuencia y el primer siguiente paso útil.',
    agentBriefTitle: 'Brief de MK Concierge cargado',
    agentBriefText: 'Revisa la recomendación prellenada, agrega tus datos de contacto y envía cuando esté listo.',
    progress: 'Solicitud completada',
    summaryTitle: 'Resumen vivo',
    summaryEmpty: 'Tu servicio, presupuesto y ventana de lanzamiento aparecerán aquí mientras completas el formulario.',
    labels: {
      name: 'Nombre completo',
      email: 'Email de trabajo',
      phone: 'Teléfono',
      company: 'Empresa',
      service: 'Servicio',
      budget: 'Presupuesto',
      timeline: 'Ventana de lanzamiento',
      message: 'Notas del proyecto'
    },
    placeholders: {
      name: 'Tu nombre',
      email: 'tu@empresa.com',
      phone: '+1 555 000 0000',
      company: 'Empresa o marca',
      message: '¿Qué quieres construir, corregir, lanzar o escalar?'
    },
    optional: 'Opcional',
    submit: 'Enviar solicitud',
    submitting: 'Enviando solicitud...',
    successTitle: 'Solicitud recibida.',
    successText: 'Gracias por escribirnos. Vamos a revisar los detalles y responder con el siguiente paso.',
    consentLabel: 'Acepto que CREATIVE MK guarde esta solicitud y me contacte sobre este proyecto.',
    consentHelp: 'Tu solicitud queda dentro de los sistemas de CREATIVE MK. No vendemos tu información.',
    error: 'No pudimos enviar la solicitud. Inténtalo de nuevo o escríbenos directamente.',
    fallbackNotice: 'La captura en Cloudflare no estuvo disponible, así que enviamos la solicitud por el fallback temporal.',
    requiredHint: 'Los campos obligatorios están marcados con asterisco.',
    serviceOptions: [
      'Branding',
      'Sitios Web',
      'Producto Digital UX/UI',
      'Growth & Marketing',
      'Desarrollo',
      'Automatización IA'
    ],
    budgetOptions: ['No estoy seguro', 'Menos de $1,000', '$1,000-$3,000', '$3,000-$7,500', '$7,500-$15,000', '$15,000+'],
    timelineOptions: ['Lo antes posible', '2-4 semanas', '1-2 meses', 'Este trimestre', 'Flexible'],
    footerTitle: 'CREATIVE MK',
    footerText: 'Estudio digital bilingüe. Disponible de forma remota.',
    legalLabel: 'Notas legales',
    privacyTitle: 'Aviso de privacidad',
    privacyText: 'Usamos la información que envías para revisar tu solicitud, responder sobre tu proyecto y mejorar nuestro proceso comercial. No vendemos información personal.',
    termsTitle: 'Términos de servicio',
    termsText: 'Cada proyecto inicia con una propuesta de alcance, tiempos, entregables y ruta de aprobación. Ningún trabajo empieza hasta que ambas partes acuerden los términos.'
  }
};

const initialForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  service: '',
  budget: '',
  timeline: '',
  message: ''
};

const requiredFields = ['name', 'email', 'service', 'budget', 'timeline', 'message'];

function getSessionId() {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const random = window.crypto?.randomUUID ? window.crypto.randomUUID().slice(0, 12) : Math.random().toString(36).slice(2, 14);
    const next = `mk-${Date.now().toString(36)}-${random}`;
    localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return `mk-${Date.now().toString(36)}`;
  }
}

function agentEndpoint(action) {
  const productionOrigin = /(^|\.)creativemk\.net$/i.test(window.location.hostname)
    ? window.location.origin
    : 'https://creative-mk-concierge.arturo-ordonezv.workers.dev';
  const base = window.CREATIVE_MK_AGENT_BASE || productionOrigin;
  return `${base}/agents/creative-mk-concierge/${encodeURIComponent(getSessionId())}/${action}`;
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

function attributionFields() {
  const params = new URLSearchParams(window.location.search || '');
  const data = { referrer: referrerType() };
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
    const value = params.get(key);
    if (value) data[key] = value.slice(0, 120);
  });
  return data;
}

let publicConfigPromise;
let publicConfig;
let turnstilePromise;

async function loadPublicConfig() {
  if (publicConfig) return publicConfig;
  if (publicConfigPromise) return publicConfigPromise;

  publicConfigPromise = fetch(agentEndpoint('config'), {
    headers: { Accept: 'application/json' }
  })
    .then((response) => response.ok ? response.json() : {})
    .then((config) => {
      publicConfig = config || {};
      return publicConfig;
    })
    .catch(() => ({}));

  return publicConfigPromise;
}

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstilePromise) return turnstilePromise;

  turnstilePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return turnstilePromise;
}

async function getTurnstileToken(action, slot, widgetRef) {
  const config = await loadPublicConfig();
  const siteKey = window.CREATIVE_MK_TURNSTILE_SITE_KEY || config?.turnstile?.siteKey;
  if (!siteKey || !slot) return null;

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

      if (widgetRef.current === null) {
        widgetRef.current = turnstile.render(slot, options);
      }

      turnstile.execute(widgetRef.current, { action });
    });
  } catch {
    return null;
  }
}

const serviceIndexes = {
  branding: 0,
  'logo-creation': 0,
  'brand-manual': 0,
  'web-design': 1,
  websites: 1,
  'landing-pages': 1,
  'ux-ui-design': 2,
  'digital-product': 2,
  'sales-funnels': 3,
  'meta-ads': 3,
  'social-media': 3,
  'app-development': 4,
  development: 4,
  'ai-automation': 5
};

const budgetIndexes = {
  'not-sure': 0,
  'under-1000': 1,
  '1000-3000': 2,
  '3000-7500': 3,
  '7500-15000': 4,
  '15000-plus': 5
};

const timelineIndexes = {
  asap: 0,
  '2-4-weeks': 1,
  '1-2-months': 2,
  'this-quarter': 3,
  flexible: 4
};

function getStoredLang() {
  try {
    return localStorage.getItem(LANG_KEY) === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

function setStoredLang(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Ignore storage failures in private browsing modes.
  }
}

function readStoredBrief() {
  try {
    const raw = localStorage.getItem(BRIEF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.source === 'mk-growth-concierge' ? parsed : null;
  } catch {
    return null;
  }
}

function byIndex(options, indexes, slug, fallback) {
  const index = indexes[slug];
  return typeof index === 'number' ? options[index] : fallback || '';
}

function briefMessage(brief, lang) {
  const lines = [];
  if (brief.summary) lines.push(brief.summary);
  if (Array.isArray(brief.supportServices) && brief.supportServices.length) {
    lines.push(
      lang === 'es'
        ? `Capas de soporte sugeridas: ${brief.supportServices.join(' + ')}`
        : `Suggested support layers: ${brief.supportServices.join(' + ')}`
    );
  }
  if (typeof brief.leadScore === 'number') {
    lines.push(lang === 'es' ? `Score anónimo del diagnóstico: ${brief.leadScore}/100` : `Anonymous diagnostic score: ${brief.leadScore}/100`);
  }
  if (brief.notes) lines.push(brief.notes);
  if (brief.audit?.url) {
    lines.push(
      lang === 'es'
        ? `Mini-auditoría: ${brief.audit.url}\nSiguiente acción: ${brief.audit.nextAction || 'Pendiente de revisar.'}`
        : `Mini audit: ${brief.audit.url}\nNext action: ${brief.audit.nextAction || 'Review pending.'}`
    );
  }
  return lines.filter(Boolean).join('\n\n');
}

function App() {
  const [lang, setLang] = useState(getStoredLang);
  const [form, setForm] = useState(initialForm);
  const [agentBrief, setAgentBrief] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const formRef = useRef(null);
  const turnstileSlotRef = useRef(null);
  const turnstileWidgetRef = useRef(null);
  const briefAppliedRef = useRef(false);
  const t = copy[lang];

  const completeRequired = requiredFields.filter((field) => String(form[field]).trim()).length;
  const progress = Math.round((completeRequired / requiredFields.length) * 100);

  const snapshot = useMemo(() => {
    return [form.service, form.budget, form.timeline].filter(Boolean).join(' / ');
  }, [form.service, form.budget, form.timeline]);

  useEffect(() => {
    document.documentElement.lang = lang;
    setStoredLang(lang);
  }, [lang]);

  useEffect(() => {
    if (briefAppliedRef.current) return;
    const storedBrief = readStoredBrief();
    if (!storedBrief) return;

    briefAppliedRef.current = true;
    setAgentBrief(storedBrief);
    setForm((current) => ({
      ...current,
      service: current.service || byIndex(t.serviceOptions, serviceIndexes, storedBrief.serviceSlug, storedBrief.recommendedService),
      budget: current.budget || byIndex(t.budgetOptions, budgetIndexes, storedBrief.budgetSlug, storedBrief.budget),
      timeline: current.timeline || byIndex(t.timelineOptions, timelineIndexes, storedBrief.timelineSlug, storedBrief.timeline),
      message: current.message || briefMessage(storedBrief, lang)
    }));
  }, [lang, t]);

  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.16 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  function updateField(name, value) {
    setStatus('idle');
    setError('');
    setNotice('');
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    const htmlForm = formRef.current;
    if (!htmlForm) return;

    if (!htmlForm.checkValidity()) {
      htmlForm.reportValidity();
      return;
    }

    setStatus('submitting');
    const formData = new FormData(htmlForm);
    formData.set('language', lang);
    formData.set('page_url', window.location.href);
    formData.set('agent_session_id', getSessionId());
    Object.entries(attributionFields()).forEach(([key, value]) => {
      formData.set(key, value);
    });
    if (agentBrief) {
      formData.set('brief', JSON.stringify(agentBrief));
    }

    const payload = Object.fromEntries(formData.entries());
    payload.lang = lang;
    payload.consent = formData.get('consent') === 'on';
    payload.brief = agentBrief;
    const turnstileToken = await getTurnstileToken('lead-capture', turnstileSlotRef.current, turnstileWidgetRef);
    if (turnstileToken) {
      payload.turnstileToken = turnstileToken;
      formData.set('turnstileToken', turnstileToken);
    }

    try {
      const response = await fetch(agentEndpoint('lead-capture'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const cloudflareError = new Error(data.error || `Cloudflare returned ${response.status}`);
        cloudflareError.status = response.status;
        throw cloudflareError;
      }

      setStatus('success');
      window.creativeMkTrackLead?.({
        content_name: 'Contact form',
        content_category: 'Website lead'
      });
      try {
        localStorage.removeItem(BRIEF_KEY);
      } catch {
        // Ignore storage cleanup failures.
      }
      setForm(initialForm);
      htmlForm.reset();
    } catch (submitError) {
      if (submitError.status && submitError.status < 500) {
        setStatus('error');
        setError(submitError.message || t.error);
        return;
      }

      try {
        const fallbackResponse = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });

        if (!fallbackResponse.ok) {
          throw new Error(`Formspree returned ${fallbackResponse.status}`);
        }

        setStatus('success');
        setNotice(t.fallbackNotice);
        window.creativeMkTrackLead?.({
          content_name: 'Contact form fallback',
          content_category: 'Website lead'
        });
        setForm(initialForm);
        htmlForm.reset();
      } catch {
        setStatus('error');
        setError(submitError.message || t.error);
      }
    }
  }

  return (
    <div className="contact-shell">
      <Header lang={lang} setLang={setLang} t={t} />
      <main className="contact-main">
        <section className="contact-hero">
          <div className="contact-copy reveal-on-scroll is-visible">
            <img className="hero-logo" src={LOGO_SRC} alt="CREATIVE MK" />
            <h1>{t.heroTitle}</h1>
            <p>{t.heroText}</p>
            <div className="contact-routes" aria-label={t.clientLabel}>
              <span>{t.clientLabel}</span>
              <a href={`mailto:${t.directEmail}`}>{t.directEmail}</a>
              <a href="#request-title">{t.directProject}</a>
            </div>
            <div className="signal-card" aria-label={t.summaryTitle}>
              <div>
                <span>{t.responseTime}</span>
                <strong>{t.responseValue}</strong>
              </div>
              <div className="signal-lines" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>

          <section className="request-panel reveal-on-scroll is-visible" aria-labelledby="request-title">
            <div className="request-panel__top">
              <div>
                <h2 id="request-title">{t.formTitle}</h2>
                <p>{t.formText}</p>
              </div>
              <div className="progress-meter" aria-label={`${t.progress}: ${progress}%`}>
                <span>{progress}%</span>
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <circle cx="20" cy="20" r="17" />
                  <circle cx="20" cy="20" r="17" style={{ '--progress': progress }} />
                </svg>
              </div>
            </div>
            <div className="completion-bar" aria-hidden="true">
              <span className="progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <form ref={formRef} action={agentEndpoint('lead-capture')} method="POST" onSubmit={submitForm} className="contact-form">
              <input type="hidden" name="subject" value="New service request from CREATIVE MK website" readOnly />
              <input type="hidden" name="source" value="contact.html" readOnly />
              <input type="hidden" name="language" value={lang} readOnly />
              <input type="hidden" name="page_url" value={typeof window === 'undefined' ? '' : window.location.href} readOnly />
              <input type="hidden" name="agent_session_id" value={typeof window === 'undefined' ? '' : getSessionId()} readOnly />
              {agentBrief ? (
                <>
                  <input type="hidden" name="agent_brief_source" value={agentBrief.source} readOnly />
                  <input type="hidden" name="agent_recommendation" value={agentBrief.recommendedService || ''} readOnly />
                  <input type="hidden" name="agent_support_services" value={(agentBrief.supportServices || []).join(' + ')} readOnly />
                  <input type="hidden" name="agent_lead_score" value={agentBrief.leadScore || ''} readOnly />
                  <input type="hidden" name="agent_brief_created_at" value={agentBrief.createdAt || ''} readOnly />
                </>
              ) : null}
              <input className="gotcha" type="text" name="_gotcha" tabIndex="-1" autoComplete="off" />

              {agentBrief ? (
                <div className="agent-brief-note" role="status">
                  <strong>{t.agentBriefTitle}</strong>
                  <span>{t.agentBriefText}</span>
                </div>
              ) : null}

              <TextField name="name" type="text" required label={t.labels.name} placeholder={t.placeholders.name} value={form.name} onChange={updateField} />
              <TextField name="email" type="email" required label={t.labels.email} placeholder={t.placeholders.email} value={form.email} onChange={updateField} />
              <TextField name="phone" type="tel" label={t.labels.phone} placeholder={t.placeholders.phone} value={form.phone} onChange={updateField} optional={t.optional} />
              <TextField name="company" type="text" label={t.labels.company} placeholder={t.placeholders.company} value={form.company} onChange={updateField} optional={t.optional} />

              <ChipGroup name="service" required label={t.labels.service} options={t.serviceOptions} value={form.service} onChange={updateField} wide />
              <ChipGroup name="budget" required label={t.labels.budget} options={t.budgetOptions} value={form.budget} onChange={updateField} />
              <ChipGroup name="timeline" required label={t.labels.timeline} options={t.timelineOptions} value={form.timeline} onChange={updateField} />

              <div className="field field--wide">
                <label htmlFor="message">
                  {t.labels.message} <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="5"
                  value={form.message}
                  placeholder={t.placeholders.message}
                  onChange={(event) => updateField('message', event.target.value)}
                />
              </div>

              <LiveSummary title={t.summaryTitle} empty={t.summaryEmpty} snapshot={snapshot} message={form.message} />

              <label className="consent-line">
                <input type="checkbox" name="consent" required />
                <span>
                  {t.consentLabel}
                  <small>{t.consentHelp}</small>
                </span>
              </label>

              <p className="required-note">{t.requiredHint}</p>
              {notice ? <p className="form-notice" role="status">{notice}</p> : null}
              {error ? <p className="form-alert" role="alert">{error}</p> : null}
              {status === 'success' ? (
                <div className="success-state" role="status" aria-live="polite">
                  <strong>{t.successTitle}</strong>
                  <span>{t.successText}</span>
                </div>
              ) : null}

              <div className="turnstile-slot" ref={turnstileSlotRef} aria-hidden="true" />
              <MagneticButton disabled={status === 'submitting'}>
                {status === 'submitting' ? t.submitting : t.submit}
              </MagneticButton>
            </form>
          </section>
        </section>
        <section className="contact-legal" aria-label={t.legalLabel}>
          <article id="privacy">
            <span>{t.legalLabel}</span>
            <h2>{t.privacyTitle}</h2>
            <p>{t.privacyText}</p>
          </article>
          <article id="terms">
            <span>{t.legalLabel}</span>
            <h2>{t.termsTitle}</h2>
            <p>{t.termsText}</p>
          </article>
        </section>
      </main>
      <Footer t={t} />
    </div>
  );
}

function Header({ lang, setLang, t }) {
  return (
    <header className="contact-header">
      <a className="contact-header__logo" href="index.html" aria-label="CREATIVE MK Home">
        <img src={LOGO_SRC} alt="CREATIVE MK" />
      </a>
      <nav className="contact-header__nav" aria-label="Main navigation">
        <a href="index.html#work">{t.nav.work}</a>
        <a href="index.html#capabilities">{t.nav.services}</a>
        <a href="index.html#about">{t.nav.about}</a>
        <a href="index.html#news">{t.nav.blog}</a>
      </nav>
      <div className="contact-header__actions">
        <div className="contact-lang" aria-label="Language switcher">
          <button
            type="button"
            aria-label="English"
            className={lang === 'en' ? 'active' : ''}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            type="button"
            aria-label="Spanish"
            className={lang === 'es' ? 'active' : ''}
            onClick={() => setLang('es')}
          >
            ES
          </button>
        </div>
        <a className="contact-header__cta" href="contact.html">{t.nav.contact}</a>
      </div>
    </header>
  );
}

function TextField({ name, type, required = false, label, placeholder, value, onChange, optional }) {
  return (
    <div className="field">
      <label htmlFor={name}>
        {label} {required ? <span aria-hidden="true">*</span> : <em>{optional}</em>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </div>
  );
}

function ChipGroup({ name, label, options, value, onChange, required = false, wide = false }) {
  return (
    <fieldset className={`chip-field ${wide ? 'chip-field--wide' : ''}`}>
      <legend>
        {label} {required ? <span aria-hidden="true">*</span> : null}
      </legend>
      <input className="sr-only" name={name} value={value} required={required} readOnly tabIndex="-1" />
      <div className="chip-grid">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? 'chip is-selected' : 'chip'}
            onClick={() => onChange(name, option)}
            aria-pressed={value === option}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function LiveSummary({ title, empty, snapshot, message }) {
  return (
    <aside className="live-summary" aria-live="polite">
      <span>{title}</span>
      <strong>{snapshot || empty}</strong>
      {message ? <p>{message.slice(0, 120)}{message.length > 120 ? '...' : ''}</p> : null}
    </aside>
  );
}

function MagneticButton({ disabled, children }) {
  const buttonRef = useRef(null);

  function moveButton(event) {
    const button = buttonRef.current;
    if (!button || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = button.getBoundingClientRect();
    button.style.setProperty('--mx', `${event.clientX - rect.left - rect.width / 2}px`);
    button.style.setProperty('--my', `${event.clientY - rect.top - rect.height / 2}px`);
  }

  function resetButton() {
    const button = buttonRef.current;
    if (!button) return;
    button.style.setProperty('--mx', '0px');
    button.style.setProperty('--my', '0px');
  }

  return (
    <button
      ref={buttonRef}
      type="submit"
      className="magnetic-submit"
      disabled={disabled}
      onMouseMove={moveButton}
      onMouseLeave={resetButton}
    >
      <span>{children}</span>
    </button>
  );
}

function Footer({ t }) {
  return (
    <footer className="contact-footer">
      <div>
        <strong>{t.footerTitle}</strong>
        <span>{t.footerText}</span>
      </div>
      <div className="contact-footer__links">
        <a href="mailto:hey@creativemk.net">hey@creativemk.net</a>
        <a href="index.html#capabilities">{t.nav.services}</a>
        <a href="index.html#work">{t.nav.work}</a>
        <a href="#privacy">{t.privacyTitle}</a>
        <a href="#terms">{t.termsTitle}</a>
      </div>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(<App />);
