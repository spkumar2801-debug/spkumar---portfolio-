import { portfolioConfig } from '../config/portfolioData.js';

/**
 * ==============================================================================
 * INTERACTION HANDLERS & MICRO-ANIMATIONS
 * Toast notifications, copy-to-clipboard, form preview, and scroll reveal
 * ==============================================================================
 */

export function initInteractions() {
  const toastEl = document.getElementById('copy-toast');
  const toastMsg = document.getElementById('toast-message');

  let toastTimer = null;
  function showToast(message, duration = 3200) {
    if (!toastEl || !toastMsg) return;
    toastMsg.textContent = message;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }

  // 1. Copy Email Handlers
  const copyEmailBtns = document.querySelectorAll('.copy-email-btn');
  copyEmailBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = portfolioConfig?.contact?.email || portfolioConfig?.contactLinks?.email || '';
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          // Fallback
          const textArea = document.createElement('textarea');
          textArea.value = email;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        showToast(`Email copied: ${email}`);
      } catch (err) {
        showToast(`Email address: ${email}`);
      }
    });
  });

  // 2. Contact Form Preview Handler (Version 1 Frontend Only)
  const contactForm = document.getElementById('portfolio-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const msgInput = document.getElementById('contact-message');

      if (!nameInput?.value.trim() || !emailInput?.value.trim() || !msgInput?.value.trim()) {
        showToast('Please fill in your name, email, and message.');
        return;
      }

      showToast(`Thank you, ${nameInput.value.trim()}! Message received in Version 1 preview mode.`);
      contactForm.reset();
    });
  }

  // 3. Scroll Reveal Observer
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // 4. Back to top link
  const backToTopBtn = document.querySelector('.footer-back-to-top');
  backToTopBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
