/* Consentimiento de medición. Una sola pregunta, una sola cookie en juego.

   /privacy/ decía "No advertising pixels run on this site" mientras esta misma
   página cargaba el píxel de Meta — la promesa publicada y el código llevaban
   direcciones opuestas desde la decisión D3 (2026-08-18), que reinstauró el
   píxel sin reinstaurar la base legal. Este archivo es la resolución: el píxel
   se queda (la campaña lo necesita), pero detrás de una elección real, y el
   aviso vuelve a decir la verdad.

   El contrato:
   - Sin elección guardada → tarjeta discreta abajo a la izquierda. Nada carga.
   - Aceptar → localStorage 'mk-consent' = 'granted' y evento 'mk:consent';
     js/meta-pixel.js escucha ese evento y arranca.
   - Rechazar → 'denied'. Nada carga, nunca, y no se vuelve a preguntar.
   - Global Privacy Control → se respeta como rechazo, sin banner y sin
     escribir nada: una señal explícita del navegador no necesita diálogo.
   - [data-consent-revoke] en las páginas de privacidad retira el
     consentimiento; [data-consent-state] muestra la elección vigente.

   Los textos viven aquí y no en i18n.js a propósito: la tarjeta se inyecta en
   runtime, así que la puerta i18n de check-site (que lee el HTML estático) no
   puede verificarla — un par EN/ES local y el atributo lang del documento
   evitan prometer una paridad que ningún gate vigila. */

(() => {
  'use strict';

  const KEY = 'mk-consent';

  const read = () => {
    try { return localStorage.getItem(KEY); } catch { return null; }
  };
  const write = (value) => {
    try { localStorage.setItem(KEY, value); } catch { /* nada que guardar, nada que romper */ }
  };

  const gpc = navigator.globalPrivacyControl === true;
  const lang = (document.documentElement.lang || 'en').slice(0, 2) === 'es' ? 'es' : 'en';

  const TEXTS = {
    en: {
      body: 'We use one measurement pixel (Meta) to know which campaigns work. Nothing loads unless you accept.',
      accept: 'Accept',
      decline: 'Decline',
      policy: 'Privacy notice',
      policyHref: '/privacy/',
      label: 'Measurement consent',
      state: { granted: 'accepted', denied: 'declined', none: 'not decided — no pixel has loaded', gpc: 'declined via Global Privacy Control' },
      revoked: 'Consent withdrawn'
    },
    es: {
      body: 'Usamos un solo píxel de medición (Meta) para saber qué campañas funcionan. No se carga nada salvo que aceptes.',
      accept: 'Aceptar',
      decline: 'Rechazar',
      policy: 'Aviso de privacidad',
      policyHref: '/privacidad/',
      label: 'Consentimiento de medición',
      state: { granted: 'aceptado', denied: 'rechazado', none: 'sin decidir — ningún píxel se ha cargado', gpc: 'rechazado vía Global Privacy Control' },
      revoked: 'Consentimiento retirado'
    }
  };
  const TEXT = TEXTS[lang];

  /* /privacy/ es un documento con las dos lenguas en secciones lang="…", así
     que el estado y el botón de retirada hablan la lengua de su sección, no
     la del documento. */
  const textsFor = (el) => {
    const scoped = el.closest('[lang]')?.getAttribute('lang') || lang;
    return TEXTS[scoped.slice(0, 2) === 'es' ? 'es' : 'en'];
  };

  const announce = (granted) => {
    document.dispatchEvent(new CustomEvent('mk:consent', { detail: { granted } }));
  };

  const stateText = (t) => {
    if (gpc && !read()) return t.state.gpc;
    const stored = read();
    if (stored === 'granted') return t.state.granted;
    if (stored === 'denied') return t.state.denied;
    return t.state.none;
  };

  const paintState = () => {
    for (const el of document.querySelectorAll('[data-consent-state]')) {
      el.textContent = stateText(textsFor(el));
    }
  };

  window.creativeMkConsent = {
    get: () => (gpc && !read() ? 'denied' : read()),
    grant() { write('granted'); paintState(); announce(true); },
    deny() { write('denied'); paintState(); announce(false); }
  };

  const ready = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn();

  ready(() => {
    paintState();

    for (const el of document.querySelectorAll('[data-consent-revoke]')) {
      el.addEventListener('click', () => {
        window.creativeMkConsent.deny();
        el.textContent = textsFor(el).revoked;
        el.disabled = true;
      });
    }

    // Una señal del navegador o una elección previa cierran la pregunta.
    if (gpc || read()) return;

    const style = document.createElement('style');
    style.textContent = [
      '.mk-consent{position:fixed;left:16px;bottom:16px;z-index:var(--z-overlay,1200);',
      'max-width:380px;width:calc(100vw - 32px);box-sizing:border-box;',
      'background:var(--paper-raised);color:var(--ink);border:1px solid var(--rule-strong);',
      'box-shadow:var(--shadow-overlay);padding:1rem 1.1rem;',
      'font-family:var(--font-text,system-ui,sans-serif);font-size:.85rem;line-height:1.55}',
      '.mk-consent p{margin:0 0 .85rem}',
      '.mk-consent__actions{display:flex;gap:.6rem;flex-wrap:wrap;align-items:center}',
      '.mk-consent button{font:inherit;cursor:pointer;padding:.45em 1em;border-radius:0}',
      '.mk-consent__accept{background:var(--ink);color:var(--paper);border:1px solid var(--ink)}',
      '.mk-consent__decline{background:transparent;color:var(--ink);border:1px solid var(--rule-strong)}',
      '.mk-consent a{color:var(--gold-aged)}'
    ].join('');
    document.head.appendChild(style);

    const card = document.createElement('div');
    card.className = 'mk-consent';
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', TEXT.label);

    const message = document.createElement('p');
    message.textContent = TEXT.body + ' ';
    const policy = document.createElement('a');
    policy.href = TEXT.policyHref;
    policy.textContent = TEXT.policy;
    message.appendChild(policy);

    const actions = document.createElement('div');
    actions.className = 'mk-consent__actions';
    const make = (cls, label, handler) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = cls;
      button.textContent = label;
      button.addEventListener('click', () => { handler(); card.remove(); });
      actions.appendChild(button);
    };
    make('mk-consent__accept', TEXT.accept, () => window.creativeMkConsent.grant());
    make('mk-consent__decline', TEXT.decline, () => window.creativeMkConsent.deny());

    card.append(message, actions);
    document.body.appendChild(card);
  });
})();
