import { personalInfo, contactLinks, youtubeChannel, projects } from './config/portfolioData.js';

/**
 * ==============================================================================
 * PORTFOLIO APPLICATION CONTROLLER (VERSION 2)
 * Binds clean configuration data, interactive triggers, and mobile drawer
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Populate Configurable Links and Placeholders
  bindLinks();

  // 2. Populate Projects
  bindProjects();

  // 3. Initialize Interactive Triggers
  initTriggers();

  // 4. Mobile Drawer Controls
  initMobileDrawer();

  // 5. Video Viewport & Resource Observer
  initVideoViewportObserver();
});

function initVideoViewportObserver() {
  const videos = document.querySelectorAll('video');
  if (!videos.length) return;

  const isMobile = window.innerWidth <= 820 || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

  videos.forEach(v => {
    if (isMobile && v.getAttribute('preload') !== 'none') {
      v.setAttribute('preload', 'none');
    }
  });

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (entry.isIntersecting) {
          if (vid.dataset.autoplay === 'true' && vid.paused) {
            vid.play().catch(() => {});
          }
        } else {
          if (!vid.paused) {
            vid.pause();
          }
        }
      });
    }, { threshold: 0.15 });

    videos.forEach(v => videoObserver.observe(v));
  }
}

function bindLinks() {
  // Hero Socials
  bindAnchor('hero-linkedin-link', contactLinks.linkedin);
  bindAnchor('hero-github-link', contactLinks.github);
  bindAnchor('hero-youtube-link', youtubeChannel.url || contactLinks.youtube);

  // YouTube Section Button
  bindAnchor('youtube-section-btn', youtubeChannel.url || contactLinks.youtube);

  // Contact Channels
  const emailValEl = document.getElementById('contact-email-val');
  if (emailValEl) {
    emailValEl.textContent = contactLinks.email || "Available on Request";
  }
  bindAnchor('contact-linkedin-link', contactLinks.linkedin);
  bindAnchor('contact-github-link', contactLinks.github);
  bindAnchor('contact-youtube-link', youtubeChannel.url || contactLinks.youtube);

  // Footer Links
  bindAnchor('foot-linkedin', contactLinks.linkedin);
  bindAnchor('foot-github', contactLinks.github);
  bindAnchor('foot-youtube', youtubeChannel.url || contactLinks.youtube);

  // Copyright Year
  const yearEl = document.getElementById('year-copy');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function bindProjects() {
  projects.forEach((proj, i) => {
    bindProjectAnchor(`proj-${i}-github`, proj.github, 'GitHub Repository');
    bindProjectLiveDemo(`proj-${i}-live`, proj.live);
  });
}

function bindProjectAnchor(id, url, label) {
  const el = document.getElementById(id);
  if (!el) return;
  if (url && url.trim().length > 0) {
    el.href = url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
    el.removeAttribute('aria-disabled');
    el.classList.remove('is-disabled');
    el.textContent = label;
    el.style.display = '';
  } else {
    // If no real URL exists, do not display fake link
    el.style.display = 'none';
  }
}

function bindProjectLiveDemo(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  if (url && url.trim().length > 0) {
    el.href = url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
    el.removeAttribute('aria-disabled');
    el.classList.remove('is-disabled');
    el.textContent = 'Live Demo';
    el.style.display = '';
  } else {
    // Requirement: If a project does not have a real Live Demo URL, hide/remove the Live Demo button
    el.style.display = 'none';
  }
}

function bindAnchor(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  if (url && url.trim().length > 0) {
    el.href = url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
    el.removeAttribute('aria-disabled');
    el.classList.remove('is-disabled');
  } else {
    el.removeAttribute('href');
    el.setAttribute('aria-disabled', 'true');
    el.classList.add('is-disabled');
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Profile available upon request');
    });
  }
}

function initTriggers() {
  // Email Copy Trigger
  const copyBtn = document.getElementById('copy-email-btn');
  copyBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (contactLinks.email && contactLinks.email.trim().length > 0) {
      const email = contactLinks.email;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          const ta = document.createElement('textarea');
          ta.value = email;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        showToast(`Email copied: ${email}`);
      } catch {
        showToast(`Email: ${email}`);
      }
    } else {
      showToast('Email available on request — please send a message below');
    }
  });

  // Contact Form Visual Submit
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name')?.value;
    showToast(`Thank you, ${name || 'there'}! Message sent successfully.`);
    form.reset();
  });
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  if (!toast || !toastText) return;
  toastText.textContent = msg;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function initMobileDrawer() {
  const burger = document.getElementById('burger');
  const sheet = document.getElementById('sheet');
  const closeBtn = document.getElementById('sheet-close');
  const nav = document.getElementById('nav');
  const menuLinks = document.querySelectorAll('.sheet-menu-item, .sheet-link');

  let isOpen = false;

  function setOpen(state) {
    isOpen = state;
    burger?.setAttribute('aria-expanded', String(isOpen));
    burger?.classList.toggle('active', isOpen);
    sheet?.classList.toggle('open', isOpen);
    sheet?.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('is-locked', isOpen);
    nav?.classList.toggle('menu-open', isOpen);
  }

  function toggle() {
    setOpen(!isOpen);
  }

  burger?.addEventListener('click', (e) => {
    e.preventDefault();
    toggle();
  });

  closeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    setOpen(false);
  });

  sheet?.addEventListener('click', (e) => {
    if (e.target === sheet) {
      setOpen(false);
    }
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        setOpen(false);
        const targetId = href === '#top' || href === '#hero' ? 'hero' : href.replace('#', '');
        const target = document.getElementById(targetId);
        if (target) {
          // Delay briefly to allow drawer to dismiss and scroll lock to release cleanly
          setTimeout(() => {
            const navH = 60;
            const elementPosition = target.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = Math.max(0, elementPosition - (targetId === 'hero' ? 0 : navH));
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 140);
        }
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      setOpen(false);
    }
  });
}
