import { portfolioConfig } from '../config/portfolioData.js';

/**
 * ==============================================================================
 * PROJECTS COMPONENT RENDERER
 * Showcase cards with modern visual previews and configurable link placeholders
 * ==============================================================================
 */

function getProjectMockupHtml(project) {
  if (project.id === 'pk-college-web') {
    return `
      <div class="mockup-college">
        <div class="mockup-hero-banner">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <div style="width:18px; height:18px; border-radius:4px; background:var(--crimson); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; color:#fff;">PK</div>
            <span style="font-size:0.75rem; font-weight:600; color:#fff;">College Portal & Administration</span>
          </div>
          <span style="font-family:var(--font-mono); font-size:0.68rem; color:#34d399; background:rgba(16,185,129,0.15); padding:2px 6px; border-radius:4px;">● Firebase Synced</span>
        </div>
        <div class="mockup-grid-blocks">
          <div class="mockup-block">
            <div class="mockup-line short crimson"></div>
            <div class="mockup-line" style="width:85%"></div>
            <div class="mockup-line short"></div>
          </div>
          <div class="mockup-block">
            <div class="mockup-line short" style="background:#3b82f6"></div>
            <div class="mockup-line" style="width:70%"></div>
            <div class="mockup-line short"></div>
          </div>
          <div class="mockup-block">
            <div class="mockup-line short" style="background:#10b981"></div>
            <div class="mockup-line" style="width:90%"></div>
            <div class="mockup-line short"></div>
          </div>
        </div>
      </div>
    `;
  } else if (project.id === 'sloopin') {
    return `
      <div class="mockup-social-feed">
        <div class="mockup-feed-card">
          <div class="mockup-feed-header">
            <div class="mockup-avatar"></div>
            <div style="flex:1">
              <div class="mockup-line short" style="margin-bottom:3px; width:45%;"></div>
              <div class="mockup-line" style="width:30%; height:4px;"></div>
            </div>
          </div>
          <div class="mockup-media-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center; margin-top:2px;">
            <span style="font-size:0.7rem; color:#f43f5e;">♥ 142</span>
            <span style="font-size:0.7rem; color:#94a3b8;">💬 38</span>
            <span style="font-size:0.7rem; color:#38bdf8; margin-left:auto;">Cloudinary CDN</span>
          </div>
        </div>
      </div>
    `;
  } else {
    // Smart Plant Disease CNN Project
    return `
      <div class="mockup-neural-vision">
        <div class="cnn-scanner-frame">
          <div class="cnn-scanner-line"></div>
          <div style="display:flex; flex-direction:column; align-items:center; gap:0.4rem; z-index:1;">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 0-7.07 17.07l2.83-2.83A6 6 0 0 1 12 6V2z"></path><path d="M12 22a10 10 0 0 0 7.07-17.07l-2.83 2.83A6 6 0 0 1 12 18v4z"></path></svg>
            <span style="font-family:var(--font-mono); font-size:0.75rem; color:#6ee7b7; letter-spacing:0.05em;">CNN VISION CLASSIFICATION</span>
          </div>
        </div>
        <div class="cnn-status-output">
          <span>Target: Solanum lycopersicum</span>
          <span style="font-weight:600; color:#10b981;">Confidence: 98.4%</span>
        </div>
      </div>
    `;
  }
}

export function renderProjects(containerElement) {
  if (!containerElement) return;

  const projects = portfolioConfig.projects;

  containerElement.innerHTML = projects.map((project, idx) => `
    <article class="project-card reveal-on-scroll reveal-delay-${(idx % 3) + 1}">
      <div class="torii-corner-accent torii-corner-top-left"></div>
      <div class="torii-corner-accent torii-corner-bottom-right"></div>

      <!-- Left/Top: Interactive Browser / System Mockup Preview -->
      <div class="project-preview-wrapper">
        <div class="preview-browser-header">
          <span class="browser-dot red"></span>
          <span class="browser-dot yellow"></span>
          <span class="browser-dot green"></span>
          <span class="browser-address-bar">https://app.portfolio/${project.id}</span>
        </div>
        <div class="preview-canvas-content">
          ${getProjectMockupHtml(project)}
        </div>
      </div>

      <!-- Right/Bottom: Project Details -->
      <div class="project-details">
        <span class="project-category-tag">${project.category || project.tagline || 'Engineering'}</span>
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>

        <ul class="project-highlights-list">
          ${(project.highlights || []).map(item => `
            <li class="project-highlight-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>${item}</span>
            </li>
          `).join('')}
        </ul>

        <div class="project-tech-stack">
          ${(project.technologies || []).map(tech => `
            <span class="tech-tag">${tech}</span>
          `).join('')}
        </div>

        <div class="project-links-bar">
          <a href="${project.githubUrl || project.github || '#'}" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="project-link-btn project-link-secondary" 
             title="Configurable repository link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            <span>GitHub Repository</span>
          </a>

          ${(project.liveUrl || project.live) ? `
            <a href="${project.liveUrl || project.live}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="project-link-btn project-link-primary" 
               title="Configurable live application link">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              <span>Live Application</span>
            </a>
          ` : ''}
        </div>
      </div>
    </article>
  `).join('');
}
