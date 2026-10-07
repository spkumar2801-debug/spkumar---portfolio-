import { portfolioConfig } from '../config/portfolioData.js';

/**
 * ==============================================================================
 * SKILLS COMPONENT RENDERER
 * Interactive categorized cards with Japanese aesthetic kanji accents
 * ==============================================================================
 */

const iconMap = {
  programming: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  frontend: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
  backend: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`,
  databaseCloud: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
  ai: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path><circle cx="12" cy="12" r="4"></circle></svg>`,
  tools: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`
};

export function renderSkills(containerElement, filterContainerElement) {
  if (!containerElement) return;

  const categories = portfolioConfig?.skills ? Object.entries(portfolioConfig.skills) : [];

  // Render Filter Buttons
  if (filterContainerElement) {
    filterContainerElement.innerHTML = `
      <button class="skills-filter-btn active" data-filter="all">All Domains</button>
      ${categories.map(([key, cat]) => `
        <button class="skills-filter-btn" data-filter="${key}">${cat.category || cat.name || key}</button>
      `).join('')}
    `;

    // Filter event listeners
    const filterButtons = filterContainerElement.querySelectorAll('.skills-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        filterSkillCards(filter);
      });
    });
  }

  // Render Skill Cards
  function renderCards(filter = 'all') {
    const filteredCategories = filter === 'all' 
      ? categories 
      : categories.filter(([key]) => key === filter);

    containerElement.innerHTML = filteredCategories.map(([key, group], idx) => `
      <div class="skill-card reveal-on-scroll reveal-delay-${(idx % 4) + 1}" data-category="${key}">
        <div class="torii-corner-accent torii-corner-top-left"></div>
        <div class="torii-corner-accent torii-corner-bottom-right"></div>
        
        <div class="skill-card-top">
          <div class="skill-category-badge">
            <div class="skill-category-icon">
              ${iconMap[key] || iconMap.programming}
            </div>
            <h3 class="skill-category-name">${group.category || group.name || key}</h3>
          </div>
          <div class="skill-card-kanji">${group.kanji || '技'}</div>
        </div>

        <div class="skill-items-container">
          ${(group.skills || group.items || []).map(skill => `
            <span class="skill-pill">
              <span class="skill-pill-indicator"></span>
              ${skill}
            </span>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function filterSkillCards(filter) {
    const cards = containerElement.querySelectorAll('.skill-card');
    cards.forEach(card => {
      if (filter === 'all' || card.getAttribute('data-category') === filter) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  renderCards('all');
}
