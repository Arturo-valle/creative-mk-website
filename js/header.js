/* ============================================
   Header Behavior
   ============================================ */
function initHeader() {
  const header = document.getElementById('header');
  const toggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  // Sticky header
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > 50);
    lastScroll = scrollY;
  }, { passive: true });

  // Desktop dropdown: click fallback for hover
  const dropdown = document.querySelector('.header__dropdown');
  const dropdownTrigger = document.querySelector('.header__dropdown-trigger');
  if (dropdown && dropdownTrigger) {
    dropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('dropdown-open');
      dropdown.classList.toggle('dropdown-open', !isOpen);
      dropdownTrigger.setAttribute('aria-expanded', !isOpen);
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('dropdown-open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    });
    // Close dropdown when a menu item is clicked
    dropdown.querySelectorAll('.header__dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        dropdown.classList.remove('dropdown-open');
        dropdownTrigger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Mobile menu
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileNav.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });
  }
}
