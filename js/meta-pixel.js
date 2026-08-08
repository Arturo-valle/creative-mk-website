/* Meta Pixel bootstrap for CREATIVE MK.
   Add the numeric Pixel ID from Meta Events Manager to enable tracking. */
(() => {
  const META_PIXEL_ID = '';
  const pixelId = String(META_PIXEL_ID).trim();
  const isConfigured = /^\d+$/.test(pixelId);

  document.documentElement.dataset.metaPixelLoaded = 'true';
  document.documentElement.dataset.metaPixelConfigured = isConfigured ? 'true' : 'false';
  window.creativeMkMetaPixelReady = isConfigured;
  window.creativeMkTrack = function creativeMkTrack(eventName, params = {}) {
    if (!isConfigured || typeof window.fbq !== 'function') return;
    window.fbq('track', eventName, params);
  };
  window.creativeMkTrackLead = function creativeMkTrackLead(params = {}) {
    window.creativeMkTrack('Lead', params);
  };

  if (!isConfigured) return;

  !function loadMetaPixel(f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function fbq() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
})();
