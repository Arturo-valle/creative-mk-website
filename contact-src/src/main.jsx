import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const ENDPOINT = 'https://formspree.io/f/mzdwbeqy';
const LANG_KEY = 'creativeMkLang';
const LOGO_SRC = import.meta.env.DEV ? '/Logos/logo-dark.png' : 'Logos/logo-dark.png';

const copy = {
  en: {
    nav: {
      work: 'Work',
      services: 'Services',
      about: 'About',
      blog: 'Blog',
      contact: 'Contact'
    },
    heroTitle: "Let's Talk",
    heroText: "Tell us where your brand is going. We'll map the right digital system: website, funnel, paid media, automation, product, or a full growth stack.",
    clientLabel: 'Become a client',
    directEmail: 'hello@creativemk.com',
    directPhone: '+1 (234) 567-890',
    responseTime: 'Response window',
    responseValue: 'Within 1 business day',
    formTitle: "Let's get you to the right place",
    formText: "Share the details that help us understand scope, urgency, and the best next step.",
    progress: 'Request completeness',
    summaryTitle: 'Live request snapshot',
    summaryEmpty: 'Your selected service, budget and timeline will appear here as you fill the form.',
    labels: {
      name: 'Full name',
      email: 'Work email',
      phone: 'Phone',
      company: 'Company',
      service: 'Service',
      budget: 'Budget',
      timeline: 'Timeline',
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
    error: 'We could not send the request. Please try again or email us directly.',
    requiredHint: 'Required fields are marked with an asterisk.',
    serviceOptions: [
      'Web Design',
      'Landing Pages',
      'Sales Funnels',
      'Meta Ads',
      'Social Media',
      'Branding',
      'Logo Creation',
      'Brand Manual',
      'App Development',
      'UX/UI Design',
      'AI Automation'
    ],
    budgetOptions: ['Not sure yet', 'Under $1,000', '$1,000-$3,000', '$3,000-$7,500', '$7,500-$15,000', '$15,000+'],
    timelineOptions: ['ASAP', '2-4 weeks', '1-2 months', 'This quarter', 'Flexible'],
    footerTitle: 'CREATIVE MK',
    footerText: 'Digital-first agency. Available worldwide.'
  },
  es: {
    nav: {
      work: 'Proyectos',
      services: 'Servicios',
      about: 'Nosotros',
      blog: 'Blog',
      contact: 'Contacto'
    },
    heroTitle: 'Hablemos',
    heroText: 'Cuéntanos hacia dónde va tu marca. Vamos a mapear el sistema digital correcto: sitio web, embudo, pauta, automatización, producto o un stack completo de crecimiento.',
    clientLabel: 'Conviértete en cliente',
    directEmail: 'hello@creativemk.com',
    directPhone: '+1 (234) 567-890',
    responseTime: 'Tiempo de respuesta',
    responseValue: 'Dentro de 1 día hábil',
    formTitle: 'Llevemos tu solicitud al lugar correcto',
    formText: 'Comparte los detalles que nos ayudan a entender alcance, urgencia y el siguiente paso ideal.',
    progress: 'Solicitud completada',
    summaryTitle: 'Resumen vivo',
    summaryEmpty: 'Tu servicio, presupuesto y timeline aparecerán aquí mientras completas el formulario.',
    labels: {
      name: 'Nombre completo',
      email: 'Email de trabajo',
      phone: 'Teléfono',
      company: 'Empresa',
      service: 'Servicio',
      budget: 'Presupuesto',
      timeline: 'Timeline',
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
    error: 'No pudimos enviar la solicitud. Inténtalo de nuevo o escríbenos directamente.',
    requiredHint: 'Los campos obligatorios están marcados con asterisco.',
    serviceOptions: [
      'Diseño Web',
      'Landing Pages',
      'Embudos de Venta',
      'Meta Ads',
      'Redes Sociales',
      'Branding',
      'Creación de Logos',
      'Manual de Marca',
      'Desarrollo de Apps',
      'Diseño UX/UI',
      'Automatización IA'
    ],
    budgetOptions: ['No estoy seguro', 'Menos de $1,000', '$1,000-$3,000', '$3,000-$7,500', '$7,500-$15,000', '$15,000+'],
    timelineOptions: ['Lo antes posible', '2-4 semanas', '1-2 meses', 'Este trimestre', 'Flexible'],
    footerTitle: 'CREATIVE MK',
    footerText: 'Agencia digital-first. Disponible mundialmente.'
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

function App() {
  const [lang, setLang] = useState(getStoredLang);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const formRef = useRef(null);
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
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setError('');

    const htmlForm = formRef.current;
    if (!htmlForm) return;

    if (!htmlForm.checkValidity()) {
      htmlForm.reportValidity();
      return;
    }

    setStatus('submitting');
    const payload = new FormData(htmlForm);
    payload.set('language', lang);
    payload.set('page_url', window.location.href);

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Formspree returned ${response.status}`);
      }

      setStatus('success');
      setForm(initialForm);
      htmlForm.reset();
    } catch (submitError) {
      setStatus('error');
      setError(t.error);
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
              <a href="tel:+1234567890">{t.directPhone}</a>
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

            <form ref={formRef} action={ENDPOINT} method="POST" onSubmit={submitForm} className="contact-form">
              <input type="hidden" name="subject" value="New service request from CREATIVE MK website" readOnly />
              <input type="hidden" name="source" value="contact.html" readOnly />
              <input type="hidden" name="language" value={lang} readOnly />
              <input type="hidden" name="page_url" value={typeof window === 'undefined' ? '' : window.location.href} readOnly />
              <input className="gotcha" type="text" name="_gotcha" tabIndex="-1" autoComplete="off" />

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

              <p className="required-note">{t.requiredHint}</p>
              {error ? <p className="form-alert" role="alert">{error}</p> : null}
              {status === 'success' ? (
                <div className="success-state" role="status" aria-live="polite">
                  <strong>{t.successTitle}</strong>
                  <span>{t.successText}</span>
                </div>
              ) : null}

              <MagneticButton disabled={status === 'submitting'}>
                {status === 'submitting' ? t.submitting : t.submit}
              </MagneticButton>
            </form>
          </section>
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
        <a href="mailto:hello@creativemk.com">hello@creativemk.com</a>
        <a href="index.html#capabilities">{t.nav.services}</a>
        <a href="index.html#work">{t.nav.work}</a>
      </div>
    </footer>
  );
}

createRoot(document.getElementById('root')).render(<App />);
