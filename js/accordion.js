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

    // Height is intrinsic now (grid 0fr/1fr in css/sections.css): the class
    // is the whole state machine, and nothing measures scrollHeight — which
    // is what used to clip the longer Spanish copy.
    container.querySelectorAll('.accordion-item').forEach(i => {
      i.classList.remove('active');
      const h = i.querySelector('.accordion-header');
      if (h) h.setAttribute('aria-expanded', 'false');
    });

    if (!isActive) {
      item.classList.add('active');
      header.setAttribute('aria-expanded', 'true');
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
