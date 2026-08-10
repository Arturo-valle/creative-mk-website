/* ============================================
   Scroll Animations & Hero
   ============================================ */

/* The hidden state for `.reveal` lives behind `.js-reveal` on <html>, added by
   the bootstrap in index.html before the first paint. This file's job is to
   claim it — setting `revealReady` tells the bootstrap's load handler that the
   reveals are wired and the class can stay. If this script never runs, that
   handler strips the class and the page renders its content. */

let revealObserver = null;

function initAnimations() {
  const targets = document.querySelectorAll('.reveal:not(.revealed)');
  if (!targets.length) return;

  /* No observer, or the visitor asked for less motion: leave everything
     visible. The bootstrap makes the same two checks, so in practice
     `.js-reveal` is already absent by the time we get here. */
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.dataset.revealReady = 'true';

  /* One observer for the life of the page. This function runs again after every
     render and after every EN/ES switch (js/i18n.js re-renders the accordions),
     and the previous version built a fresh IntersectionObserver each time
     without ever disconnecting the old one — they accumulated for as long as
     the visitor kept toggling languages. */
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  }

  targets.forEach((el) => revealObserver.observe(el));
}

/* Hero word animation — fixed to handle re-animation on language change */
function animateHeroTitle() {
  const hero = document.getElementById('hero-title');
  if (!hero) return;

  // Get the raw text (from data-i18n updated content)
  // First, strip any existing spans to get clean text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = hero.innerHTML;
  const text = tempDiv.textContent.trim();

  const words = text.split(/\s+/);

  // Reset any existing animation by forcing a reflow
  hero.style.opacity = '0';
  hero.innerHTML = words.map((w, i) =>
    `<span class="word" style="animation-delay:${0.08 * i}s">${w}</span>`
  ).join(' ');

  // Force reflow then show
  void hero.offsetWidth;
  hero.style.opacity = '1';
}
