import { portfolioConfig } from './config/portfolioData.js';
import { initThreeScene } from './components/threeScene.js';
import { initNavigation } from './components/navigation.js';
import { renderSkills } from './components/skillsRenderer.js';
import { renderProjects } from './components/projectCards.js';
import { initInteractions } from './components/interactions.js';

/**
 * ==============================================================================
 * APPLICATION ENTRY POINT
 * Saladi Prasanna Kumar - Personal Portfolio (Version 1)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Populate Configurable Links & Placeholders across UI
  populateConfigurableLinks();

  // 2. Initialize Three.js 3D Background on Hero Canvas
  const canvasElement = document.getElementById('hero-three-canvas');
  if (canvasElement) {
    try {
      initThreeScene(canvasElement);
    } catch (e) {
      console.warn('Three.js scene initialization fallback:', e);
    }
  }

  // 3. Render Dynamic Skills
  const skillsGrid = document.getElementById('skills-grid');
  const skillsFilterContainer = document.getElementById('skills-filter-container');
  if (skillsGrid) {
    renderSkills(skillsGrid, skillsFilterContainer);
  }

  // 4. Render Dynamic Projects
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid) {
    renderProjects(projectsGrid);
  }

  // 5. Initialize Navigation & Active Spy
  initNavigation();

  // 6. Initialize Micro-Interactions (Toast, Scroll Reveal, Form Preview)
  initInteractions();
});

/**
 * Binds links and data from portfolioConfig to HTML elements.
 * All URLs are strictly driven by portfolioConfig without any fake URLs.
 */
function populateConfigurableLinks() {
  const { contact = {}, youtubeChannel = {} } = portfolioConfig || {};

  // Hero Social Links
  bindLink('hero-linkedin-link', contact.linkedinUrl || contact.linkedin);
  bindLink('hero-github-link', contact.githubUrl || contact.github);
  bindLink('hero-youtube-link', youtubeChannel.url);

  // YouTube Section Button
  bindLink('youtube-section-btn', youtubeChannel.url);

  // Contact Channels
  bindLink('contact-channel-linkedin', contact.linkedinUrl || contact.linkedin);
  bindLink('contact-channel-github', contact.githubUrl || contact.github);
  bindLink('contact-channel-youtube', youtubeChannel.url);

  // Contact Display Email
  const emailDisplay = document.getElementById('contact-display-email');
  if (emailDisplay) {
    emailDisplay.textContent = contact.email || '';
  }

  // Footer Links
  bindLink('footer-linkedin-link', contact.linkedinUrl || contact.linkedin);
  bindLink('footer-github-link', contact.githubUrl || contact.github);
  bindLink('footer-youtube-link', youtubeChannel.url);

  // Copyright Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function bindLink(elementId, url) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (url && !url.includes('REPLACE_WITH_')) {
    el.href = url;
  } else {
    // If it's a placeholder, keep it cleanly pointing to the placeholder for user editing
    el.href = url || '#';
  }
}
