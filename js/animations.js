/* ============================================
   Scroll Animations & Hero
   ============================================ */
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal:not(.revealed)').forEach(el => observer.observe(el));
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
