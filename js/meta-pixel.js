/* Meta Pixel. El bootstrap estándar de Meta, adaptado a archivo externo:
   la CSP de _headers ya permite connect.facebook.net en script-src y
   connect-src desde antes de que existiera este archivo, y el resto del
   embudo lo esperaba — main.js de la LP lee las cookies _fbp/_fbc para
   deduplicar CAPI y creativeMkTrackLead dispara fbq('track','Lead') si
   fbq existe. Este archivo es quien lo hace existir. */

(() => {
  'use strict';

  const META_PIXEL_ID = '1066792679333674';
  if (!META_PIXEL_ID || window.fbq) return;

  const n = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  window.fbq = n;
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];

  const t = document.createElement('script');
  t.async = true;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const s = document.getElementsByTagName('script')[0];
  if (s && s.parentNode) s.parentNode.insertBefore(t, s);
  else document.head.appendChild(t);

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
})();
