/* ============================================
   Accordion Component
   ============================================ */

/* Track bound containers to prevent duplicate listeners */
const _accordionBound = new WeakSet();

function initAccordion(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  // Prevent adding duplicate listeners on re-render
  if (_accordionBound.has(container)) return;
  _accordionBound.add(container);
  
  container.addEventListener('click', (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return;
    const item = header.closest('.accordion-item');
    const content = item.querySelector('.accordion-content');
    const isActive = item.classList.contains('active');
    
    // Close all
    container.querySelectorAll('.accordion-item').forEach(i => {
      i.classList.remove('active');
      const h = i.querySelector('.accordion-header');
      if (h) h.setAttribute('aria-expanded', 'false');
      i.querySelector('.accordion-content').style.maxHeight = null;
    });
    
    // Open clicked if not already open
    if (!isActive) {
      item.classList.add('active');
      header.setAttribute('aria-expanded', 'true');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  });
}

/* Reset tracking when containers are re-rendered (called before re-render) */
function resetAccordion(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (container) _accordionBound.delete(container);
}
