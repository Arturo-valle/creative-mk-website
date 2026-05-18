/* ============================================
   Accordion Component
   ============================================ */

/* Track bound containers so listeners can be replaced safely after re-rendering */
const _accordionBound = new WeakMap();

function initAccordion(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  // Prevent adding duplicate listeners on re-render
  if (_accordionBound.has(container)) return;

  const handleAccordionClick = (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;
    const item = header.closest('.accordion-item');
    if (!item) return;

    const content = item.querySelector('.accordion-content');
    if (!content) return;

    const isActive = item.classList.contains('active');

    // Close all
    container.querySelectorAll('.accordion-item').forEach(i => {
      i.classList.remove('active');
      const h = i.querySelector('.accordion-header');
      if (h) h.setAttribute('aria-expanded', 'false');
      const panel = i.querySelector('.accordion-content');
      if (panel) panel.style.maxHeight = null;
    });

    // Open clicked if not already open
    if (!isActive) {
      item.classList.add('active');
      header.setAttribute('aria-expanded', 'true');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  };

  container.addEventListener('click', handleAccordionClick);
  _accordionBound.set(container, handleAccordionClick);
}

/* Reset tracking when containers are re-rendered (called before re-render) */
function resetAccordion(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const handler = _accordionBound.get(container);
  if (handler) container.removeEventListener('click', handler);
  _accordionBound.delete(container);
}
