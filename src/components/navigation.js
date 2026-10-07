/**
 * ==============================================================================
 * NAVIGATION LOGIC
 * Active Section Indicator, Smooth Scroll, and Mobile Drawer
 * ==============================================================================
 */

export function initNavigation() {
  const headerNav = document.querySelector('.header-nav');
  const desktopLinks = document.querySelectorAll('.nav-menu-desktop .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileBackdrop = document.querySelector('.mobile-drawer-backdrop');
  const mobileCloseBtn = document.querySelector('.mobile-close-btn');

  // 1. Sticky header on scroll
  function handleScroll() {
    if (window.scrollY > 40) {
      headerNav?.classList.add('scrolled');
    } else {
      headerNav?.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Active Section Spy using IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        setActiveLink(id);
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  function setActiveLink(activeId) {
    desktopLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    mobileLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // 3. Mobile Drawer Controls
  function openMobileMenu() {
    mobileDrawer?.classList.add('open');
    mobileBackdrop?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileDrawer?.classList.remove('open');
    mobileBackdrop?.classList.remove('open');
    document.body.style.overflow = '';
  }

  mobileToggle?.addEventListener('click', openMobileMenu);
  mobileCloseBtn?.addEventListener('click', closeMobileMenu);
  mobileBackdrop?.addEventListener('click', closeMobileMenu);

  // Close on mobile link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
      closeMobileMenu();
    }
  });
}
