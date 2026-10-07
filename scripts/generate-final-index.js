import fs from 'fs';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <script>
    function __threeuiStorageImage(...args) {
      const image = new Image(...args);
      const property = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
      Object.defineProperty(image, "src", {
        configurable: true,
        get() { return property.get.call(this); },
        set(value) {
          try {
            const url = new URL(value, document.baseURI);
            if (this.crossOrigin === null && (url.href.startsWith("https://ublctyddhtbgaersvxxb.supabase.co/storage/v1/object/public/threeui-media/scene-images/") || url.origin === new URL(document.baseURI).origin)) {
              this.crossOrigin = "anonymous";
            }
          } catch {}
          property.set.call(this, value);
        }
      });
      return image;
    }
  </script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Saladi Prasanna Kumar — Full Stack AI Developer / Engineer</title>
  <meta name="description" content="Personal portfolio of Saladi Prasanna Kumar — Full Stack AI Developer & Engineer at Dream Team Services. Immersive Kyoto mountain temple 3D WebGL experience.">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%2305070a'/%3E%3Ccircle cx='16' cy='17' r='8' fill='%23e0231c'/%3E%3Crect x='4' y='8' width='24' height='2.6' fill='%23dfe7e0'/%3E%3Crect x='7' y='13' width='18' height='2' fill='%23dfe7e0'/%3E%3C/svg%3E">
  
  <!-- Kage Fonts: Onest, NotoJP, Wordmark -->
  <link rel="stylesheet" href="/landing-pages/secret-pathways-assets/fonts.css">
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="/src/styles/kage-base.css">
  <link rel="stylesheet" href="/src/styles/portfolio-kage.css">
</head>
<body>
  <!-- Fixed Three.js WebGL Kyoto Sanctuary Canvas -->
  <canvas id="gl" aria-hidden="true"></canvas>

  <!-- Film Grain Overlay -->
  <div id="grain" aria-hidden="true"></div>

  <!-- Atmospheric Vignette -->
  <div id="vignette" aria-hidden="true"></div>

  <!-- Custom Dot Cursor -->
  <div id="cursor" aria-hidden="true"></div>

  <!-- Preloader with Kyoto Temple Crest -->
  <div id="pre" role="progressbar" aria-label="Loading sanctuary assets">
    <div class="pre-in">
      <div class="pre-mark">
        <svg viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="25" r="9" fill="#e0231c"/>
          <path d="M5 13h34M9 18.5h26M22 8.5v27" stroke="#dfe7e0" stroke-width="1.6"/>
        </svg>
      </div>
      <div class="pre-jp">影 • 静寂 • 知能</div>
      <div class="pre-bar"><i id="pre-fill"></i></div>
      <div class="pre-meta"><span>Entering Sanctuary</span><b id="pre-pct">0%</b></div>
    </div>
  </div>

  <!-- Fixed Studio Header Navigation -->
  <header class="nav" id="nav">
    <a class="brand" href="#hero" aria-label="Return to top">
      <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
        <circle cx="22" cy="25" r="8.6" fill="#e0231c"/>
        <path d="M5 13h34M9 18.4h26M22 8.5v27" stroke="#dfe7e0" stroke-width="1.5"/>
      </svg>
      <div class="brand-tx">
        <b>SALADI PRASANNA KUMAR</b>
        <i>FULL STACK AI DEVELOPER</i>
      </div>
    </a>

    <nav class="nav-links" aria-label="Main navigation">
      <a class="nav-link on" href="#hero" data-cursor><span>Home</span><span class="alt">主頁</span></a>
      <a class="nav-link" href="#about" data-cursor><span>About</span><span class="alt">概要</span></a>
      <a class="nav-link" href="#experience" data-cursor><span>Experience</span><span class="alt">経歴</span></a>
      <a class="nav-link" href="#skills" data-cursor><span>Skills</span><span class="alt">技術</span></a>
      <a class="nav-link" href="#projects" data-cursor><span>Projects</span><span class="alt">実績</span></a>
      <a class="nav-link" href="#youtube" data-cursor><span>YouTube</span><span class="alt">動画</span></a>
      <a class="nav-link" href="#contact" data-cursor><span>Contact</span><span class="alt">連絡</span></a>
    </nav>

    <!-- Mobile Hamburger Toggle -->
    <button class="nav-burger" id="burger" aria-label="Toggle navigation menu" aria-expanded="false">
      <i></i><i></i>
    </button>
  </header>

  <!-- Mobile Navigation Drawer -->
  <div class="nav-sheet" id="sheet" aria-hidden="true">
    <div class="sheet-scroller">
      <div class="sheet-title">SALADI PRASANNA KUMAR</div>
      <div class="sheet-links">
        <a class="sheet-link" href="#hero"><b>00</b><span>Home</span><em class="jp">主頁</em></a>
        <a class="sheet-link" href="#about"><b>01</b><span>About</span><em class="jp">概要</em></a>
        <a class="sheet-link" href="#experience"><b>02</b><span>Experience</span><em class="jp">経歴</em></a>
        <a class="sheet-link" href="#skills"><b>03</b><span>Skills</span><em class="jp">技術</em></a>
        <a class="sheet-link" href="#projects"><b>04</b><span>Projects</span><em class="jp">実績</em></a>
        <a class="sheet-link" href="#youtube"><b>05</b><span>YouTube</span><em class="jp">動画</em></a>
        <a class="sheet-link" href="#contact"><b>06</b><span>Contact</span><em class="jp">連絡</em></a>
      </div>
      <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--line-soft);">
        <a href="#contact" class="btn-kage-primary" style="width:100%; text-align:center;">Get in Touch</a>
      </div>
    </div>
  </div>

  <!-- Interactive Toast Notification -->
  <div id="toast" class="kage-toast" role="status" aria-live="polite">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e0231c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    <span id="toast-text">Copied to clipboard</span>
  </div>

  <!-- Main Continuous 3D Experience Container -->
  <main class="page" id="top">

    <!-- ====================================================================
         CHAPTER 00: HERO / THE THRESHOLD (data-cam="0")
         ==================================================================== -->
    <section class="hero" id="hero" data-cam="0">
      <div class="hero-top">
        <div class="hero-status-pill" data-rv="fade">
          <span class="pulse-dot"></span>
          <span>Currently working at <strong>Dream Team Services</strong></span>
        </div>

        <div class="eyebrow" data-rv="fade">
          <span class="dot"></span> FULL STACK AI DEVELOPER / ENGINEER
        </div>

        <h1 class="display h-hero">
          <span class="mask-line"><span>Saladi Prasanna</span></span>
          <span class="mask-line"><span>Kumar</span></span>
        </h1>

        <p class="hero-sub body" data-rv="up">
          Building intelligent, scalable and modern digital experiences across AI, frontend and backend technologies.
        </p>

        <div class="hero-ctas" data-rv="up">
          <a href="#projects" class="btn-kage-primary" data-cursor>
            <span>Explore My Work</span>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#ffffff" stroke-width="1.4"/></svg>
          </a>
          <a href="#contact" class="btn-kage-secondary" data-cursor>
            <span>Contact Me</span>
          </a>
        </div>

        <div class="hero-social-row" data-rv="up">
          <a id="hero-linkedin-link" href="#" target="_blank" rel="noopener noreferrer" class="social-circle" title="LinkedIn Profile" data-cursor>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </a>
          <a id="hero-github-link" href="#" target="_blank" rel="noopener noreferrer" class="social-circle" title="GitHub Profile" data-cursor>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          </a>
          <a id="hero-youtube-link" href="#" target="_blank" rel="noopener noreferrer" class="social-circle" title="Telugu Delight Gamers YouTube" data-cursor>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z"/></svg>
          </a>
        </div>
      </div>

      <div class="hero-spacer"></div>

      <div class="hero-foot">
        <div class="hero-cue" data-rv="fade"><span>Scroll through the sanctuary</span><span class="track"><i></i></span></div>
        <div class="chapters" id="chips">
          <div class="chip" data-chip="0" data-rv="up" data-cursor><span class="num">01</span>
            <span class="tx"><b>The Sanmon</b><p>About & engineering breadth.</p></span></div>
          <div class="chip" data-chip="1" data-rv="up" data-cursor><span class="num">02</span>
            <span class="tx"><b>Still Gardens</b><p>Work experience at Dream Team.</p></span></div>
          <div class="chip" data-chip="2" data-rv="up" data-cursor><span class="num">03</span>
            <span class="tx"><b>Sacred Craft</b><p>Skills matrix & domains.</p></span></div>
          <div class="chip" data-chip="3" data-rv="up" data-cursor><span class="num">04</span>
            <span class="tx"><b>Selected Works</b><p>Featured real-world projects.</p></span></div>
        </div>
      </div>

      <!-- Live 3D peek frame -->
      <a class="peek" href="#projects" data-view="3" data-rv="fade" data-cursor aria-label="Preview: Sanctuary projects">
        <span class="peek-fr" data-frame></span>
        <span class="peek-play"><svg viewBox="0 0 22 22" fill="none"><path d="M8 5.6 16.4 11 8 16.4z" fill="#dfe7e0"/></svg></span>
        <span class="peek-cap"><b class="jp">山門</b><i>Sanmon — Explore projects</i></span>
      </a>

      <!-- 3D wordmark fallback element -->
      <div class="word-fb" aria-hidden="true">KAGE</div>

      <div class="hero-side" data-rv="up">
        <span class="v jp">知能と技</span>
      </div>
    </section>

    <!-- ====================================================================
         CHAPTER 01: ABOUT / THE SANMON (data-cam="1")
         ==================================================================== -->
    <section class="sec" id="about" data-cam="1">
      <div class="fg" data-fg="gate" aria-hidden="true">
        <span class="fg-el fg-wall" data-fg-in="left">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/temple-wall.webp" alt="" width="1536" height="884" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-pine" data-fg-in="right">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/pine-tree.webp" alt="" width="1024" height="1438" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-grass" data-fg-in="up">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/tall-grass.webp" alt="" width="1717" height="916" loading="lazy" decoding="async">
        </span>
      </div>

      <div class="sec-head" data-rv="fade">
        <span class="k"><b>01</b> — The Sanmon</span><span class="rule"></span><span class="k jp">概要</span>
      </div>

      <div class="gate-grid">
        <h2 class="display h-sec" data-rv="up">Engineering across frontend, backend & machine intelligence.</h2>
        <div class="gate-copy">
          <p class="lead" data-rv="up">
            I currently work as a <strong>Full Stack AI Developer / Engineer</strong> at <strong>Dream Team Services</strong>, delivering robust digital products across frontend and backend development.
          </p>
          <p class="body" data-rv="up">
            My engineering work encompasses modern responsive web applications, scalable backend APIs, and seamless artificial intelligence integrations.
          </p>
          <p class="body" data-rv="up">
            I specialize in full-stack architecture with Python, Flask, JavaScript, Firebase, and Cloudinary, crafting systems that balance computational performance with refined aesthetics.
          </p>
          <a class="arrowlink" href="#experience" data-rv="fade" data-cursor>
            <span>View Experience</span>
            <span class="ar"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg></span>
          </a>
        </div>
      </div>

      <div class="gate-stats" data-rv="up">
        <div><b>2025</b><span>Graduated JNTUK</span></div>
        <div><b>Full Stack</b><span>Web Architecture</span></div>
        <div><b>AI & ML</b><span>Deep Learning</span></div>
        <div><b>Cloud</b><span>Firebase & Media</span></div>
      </div>
    </section>

    <!-- ====================================================================
         CHAPTER 02: EXPERIENCE / STILL GARDENS (data-cam="2")
         ==================================================================== -->
    <section class="sec" id="experience" data-cam="2">
      <div class="fg" data-fg="pathways" aria-hidden="true">
        <span class="fg-el fg-sakura fg-el--sway" data-fg-in="left">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/sakura-branch.webp" alt="" width="1536" height="1024" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-leaves fg-el--sway" data-fg-in="right">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/maple-leaves.webp" alt="" width="1536" height="1024" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-lantern" data-fg-in="up">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/stone-lantern.webp" alt="" width="1024" height="1499" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-bush" data-fg-in="up">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/garden-bush.webp" alt="" width="1717" height="876" loading="lazy" decoding="async">
        </span>
      </div>

      <div class="sec-head" data-rv="fade">
        <span class="k"><b>02</b> — Still Gardens</span><span class="rule"></span><span class="k jp">経歴</span>
      </div>

      <div class="cur-head">
        <h2 class="display h-sec" data-rv="up">Professional Experience</h2>
        <p class="body-lg" data-rv="up">Engineering contributions and direct operational responsibilities.</p>
      </div>

      <div class="exp-card" data-rv="up">
        <div class="exp-header">
          <div>
            <h3 class="exp-title">Full Stack AI Developer / Engineer</h3>
            <span class="exp-company">Dream Team Services</span>
          </div>
          <span class="exp-status-tag">Current Role • Present</span>
        </div>

        <ul class="exp-list">
          <li class="exp-list-item">
            <span class="exp-bullet"></span>
            <span>Full-stack web development across modern web applications</span>
          </li>
          <li class="exp-list-item">
            <span class="exp-bullet"></span>
            <span>Frontend development with high responsiveness and cross-device precision</span>
          </li>
          <li class="exp-list-item">
            <span class="exp-bullet"></span>
            <span>Backend development, server architecture and RESTful API integrations</span>
          </li>
          <li class="exp-list-item">
            <span class="exp-bullet"></span>
            <span>AI-related development and machine learning application workflows</span>
          </li>
          <li class="exp-list-item">
            <span class="exp-bullet"></span>
            <span>Firebase integration for real-time data handling and cloud synchronization</span>
          </li>
          <li class="exp-list-item">
            <span class="exp-bullet"></span>
            <span>Cloudinary integration for scalable cloud media asset pipelines</span>
          </li>
          <li class="exp-list-item">
            <span class="exp-bullet"></span>
            <span>Building modern responsive web applications optimized for speed and stability</span>
          </li>
        </ul>

        <div class="exp-tags-row">
          <span class="kage-tag">Python</span>
          <span class="kage-tag">Flask</span>
          <span class="kage-tag">JavaScript</span>
          <span class="kage-tag">Frontend Development</span>
          <span class="kage-tag">Backend Development</span>
          <span class="kage-tag">Firebase</span>
          <span class="kage-tag">Cloudinary</span>
          <span class="kage-tag">AI / Machine Learning</span>
        </div>
      </div>
    </section>

    <!-- ====================================================================
         CHAPTER 03: SKILLS / SACRED CRAFT (data-cam="3")
         ==================================================================== -->
    <section class="sec" id="skills" data-cam="3">
      <div class="fg" data-fg="lessons" aria-hidden="true">
        <span class="fg-el fg-wall fg-el--flip" data-fg-in="right">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/temple-wall.webp" alt="" width="1536" height="884" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-stones" data-fg-in="up">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/basalt-stones.webp" alt="" width="1536" height="996" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-grass" data-fg-in="up">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/tall-grass.webp" alt="" width="1717" height="916" loading="lazy" decoding="async">
        </span>
      </div>

      <div class="sec-head" data-rv="fade">
        <span class="k"><b>03</b> — Sacred Craft</span><span class="rule"></span><span class="k jp">手業</span>
      </div>

      <div class="cur-head">
        <h2 class="display h-sec" data-rv="up">Six Disciplines of Technical Craft.</h2>
        <p class="body-lg" data-rv="up">Structured engineering domains honed through real-world systems. No fake percentage metrics.</p>
      </div>

      <div class="skills-grid" data-rv="up">
        <!-- 1. Programming -->
        <div class="skill-domain-card" data-cursor>
          <div class="skill-card-top">
            <span class="skill-domain-name">Programming</span>
            <span class="skill-kanji-seal">言語</span>
          </div>
          <div class="skill-items-wrap">
            <span class="skill-item-chip">Python</span>
            <span class="skill-item-chip">C</span>
            <span class="skill-item-chip">JavaScript</span>
          </div>
        </div>

        <!-- 2. Frontend -->
        <div class="skill-domain-card" data-cursor>
          <div class="skill-card-top">
            <span class="skill-domain-name">Frontend Development</span>
            <span class="skill-kanji-seal">表層</span>
          </div>
          <div class="skill-items-wrap">
            <span class="skill-item-chip">HTML</span>
            <span class="skill-item-chip">CSS</span>
            <span class="skill-item-chip">JavaScript</span>
            <span class="skill-item-chip">Responsive Web Development</span>
          </div>
        </div>

        <!-- 3. Backend -->
        <div class="skill-domain-card" data-cursor>
          <div class="skill-card-top">
            <span class="skill-domain-name">Backend Development</span>
            <span class="skill-kanji-seal">基盤</span>
          </div>
          <div class="skill-items-wrap">
            <span class="skill-item-chip">Python</span>
            <span class="skill-item-chip">Flask</span>
            <span class="skill-item-chip">Backend Development</span>
            <span class="skill-item-chip">API Integration</span>
          </div>
        </div>

        <!-- 4. Cloud / Data -->
        <div class="skill-domain-card" data-cursor>
          <div class="skill-card-top">
            <span class="skill-domain-name">Cloud & Data</span>
            <span class="skill-kanji-seal">雲層</span>
          </div>
          <div class="skill-items-wrap">
            <span class="skill-item-chip">Firebase</span>
            <span class="skill-item-chip">MySQL</span>
            <span class="skill-item-chip">Cloudinary</span>
          </div>
        </div>

        <!-- 5. AI -->
        <div class="skill-domain-card" data-cursor>
          <div class="skill-card-top">
            <span class="skill-domain-name">AI & Machine Learning</span>
            <span class="skill-kanji-seal">知能</span>
          </div>
          <div class="skill-items-wrap">
            <span class="skill-item-chip">Artificial Intelligence</span>
            <span class="skill-item-chip">Machine Learning</span>
            <span class="skill-item-chip">CNN</span>
            <span class="skill-item-chip">AI Application Development</span>
          </div>
        </div>

        <!-- 6. Tools -->
        <div class="skill-domain-card" data-cursor>
          <div class="skill-card-top">
            <span class="skill-domain-name">Tools & Deployment</span>
            <span class="skill-kanji-seal">道具</span>
          </div>
          <div class="skill-items-wrap">
            <span class="skill-item-chip">Git</span>
            <span class="skill-item-chip">GitHub</span>
            <span class="skill-item-chip">Vercel</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================================================================
         CHAPTER 04: PROJECTS / SANCTUARY COURTYARD (data-cam="4")
         ==================================================================== -->
    <section class="sec" id="projects" data-cam="4">
      <div class="sec-head" data-rv="fade">
        <span class="k"><b>04</b> — Featured Works</span><span class="rule"></span><span class="k jp">実績</span>
      </div>

      <div class="cur-head">
        <h2 class="display h-sec" data-rv="up">Selected Projects</h2>
        <p class="body-lg" data-rv="up">Four actual software platforms engineered with modern full-stack technologies.</p>
      </div>

      <div class="projects-container">
        <!-- 01: Sloopin -->
        <article class="project-row-card" data-rv="up">
          <div class="project-preview-frame">
            <div class="browser-mock-bar">
              <span class="mock-dot"></span><span class="mock-dot"></span><span class="mock-dot"></span>
              <span class="mock-url-text">app.sloopin.dev</span>
            </div>
            <div class="mock-canvas-body">
              <div class="mock-diagram">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <span style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-dim);">Sloopin Social Media Platform</span>
              </div>
            </div>
          </div>
          <div class="project-info">
            <div class="project-category-kicker">01 — Social Media Application</div>
            <h3 class="project-heading">Sloopin / Instagram Clone</h3>
            <p class="project-desc-text">
              A modern social-media-style web application featuring user authentication, interactive feed, media sharing, and fluid responsive UI interactions.
            </p>
            <div class="exp-tags-row" style="border:0; padding:0; margin-bottom:20px;">
              <span class="kage-tag">Frontend</span>
              <span class="kage-tag">Firebase</span>
              <span class="kage-tag">Cloudinary</span>
              <span class="kage-tag">JavaScript</span>
            </div>
            <div class="project-actions-row">
              <a id="proj-0-github" href="#" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-secondary" data-cursor>GitHub Repository</a>
              <a id="proj-0-live" href="#" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-primary" data-cursor>Live Demo</a>
            </div>
          </div>
        </article>

        <!-- 02: Supermarket -->
        <article class="project-row-card" data-rv="up">
          <div class="project-preview-frame">
            <div class="browser-mock-bar">
              <span class="mock-dot"></span><span class="mock-dot"></span><span class="mock-dot"></span>
              <span class="mock-url-text">inventory.supermarket.internal</span>
            </div>
            <div class="mock-canvas-body">
              <div class="mock-diagram">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <span style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-dim);">Supermarket Management System</span>
              </div>
            </div>
          </div>
          <div class="project-info">
            <div class="project-category-kicker">02 — Commercial & Inventory</div>
            <h3 class="project-heading">Supermarket Management System</h3>
            <p class="project-desc-text">
              A comprehensive supermarket management application streamlining inventory tracking, product cataloging, transaction billing, and real-time operations.
            </p>
            <div class="exp-tags-row" style="border:0; padding:0; margin-bottom:20px;">
              <span class="kage-tag">Full Stack</span>
              <span class="kage-tag">Database</span>
              <span class="kage-tag">JavaScript</span>
              <span class="kage-tag">Backend</span>
            </div>
            <div class="project-actions-row">
              <a id="proj-1-github" href="#" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-secondary" data-cursor>GitHub Repository</a>
              <a id="proj-1-live" href="#" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-primary" data-cursor>Live Demo</a>
            </div>
          </div>
        </article>

        <!-- 03: PK Attendance -->
        <article class="project-row-card" data-rv="up">
          <div class="project-preview-frame">
            <div class="browser-mock-bar">
              <span class="mock-dot"></span><span class="mock-dot"></span><span class="mock-dot"></span>
              <span class="mock-url-text">attendance.institutional.portal</span>
            </div>
            <div class="mock-canvas-body">
              <div class="mock-diagram">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                <span style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-dim);">PK Attendance Tracking System</span>
              </div>
            </div>
          </div>
          <div class="project-info">
            <div class="project-category-kicker">03 — Enterprise & Education</div>
            <h3 class="project-heading">PK Attendance</h3>
            <p class="project-desc-text">
              An automated attendance tracking platform designed for institutional efficiency, attendance logging, administrative oversight, and student reporting.
            </p>
            <div class="exp-tags-row" style="border:0; padding:0; margin-bottom:20px;">
              <span class="kage-tag">Full Stack</span>
              <span class="kage-tag">Firebase</span>
              <span class="kage-tag">Frontend</span>
              <span class="kage-tag">JavaScript</span>
            </div>
            <div class="project-actions-row">
              <a id="proj-2-github" href="#" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-secondary" data-cursor>GitHub Repository</a>
              <a id="proj-2-live" href="#" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-primary" data-cursor>Live Demo</a>
            </div>
          </div>
        </article>

        <!-- 04: PK College of Engineering and Technology -->
        <article class="project-row-card" data-rv="up">
          <div class="project-preview-frame">
            <div class="browser-mock-bar">
              <span class="mock-dot"></span><span class="mock-dot"></span><span class="mock-dot"></span>
              <span class="mock-url-text">college.pk.edu</span>
            </div>
            <div class="mock-canvas-body">
              <div class="mock-diagram">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                <span style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:var(--bone-dim);">PK College Web Portal</span>
              </div>
            </div>
          </div>
          <div class="project-info">
            <div class="project-category-kicker">04 — Institutional Web Platform</div>
            <h3 class="project-heading">PK College of Engineering and Technology Website</h3>
            <p class="project-desc-text">
              A modern responsive college website engineered with dynamic academic content management, administrative functionality, and cloud-integrated data architecture.
            </p>
            <div class="exp-tags-row" style="border:0; padding:0; margin-bottom:20px;">
              <span class="kage-tag">Frontend</span>
              <span class="kage-tag">Firebase</span>
              <span class="kage-tag">Cloudinary</span>
              <span class="kage-tag">JavaScript</span>
            </div>
            <div class="project-actions-row">
              <a id="proj-3-github" href="#" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-secondary" data-cursor>GitHub Repository</a>
              <a id="proj-3-live" href="#" target="_blank" rel="noopener noreferrer" class="project-btn project-btn-primary" data-cursor>Live Demo</a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- ====================================================================
         CHAPTER 05: YOUTUBE / MOONWATER (data-cam="5")
         ==================================================================== -->
    <section class="sec" id="youtube" data-cam="5">
      <div class="sec-head" data-rv="fade">
        <span class="k"><b>05</b> — Creative Pursuit</span><span class="rule"></span><span class="k jp">動画</span>
      </div>

      <div class="cur-head">
        <h2 class="display h-sec" data-rv="up">YouTube Creator</h2>
        <p class="body-lg" data-rv="up">A personal creative achievement and active gaming community outside of software engineering.</p>
      </div>

      <div class="yt-card" data-rv="up">
        <div>
          <div class="project-category-kicker">Creative Milestone & Community</div>
          <h3 class="display" style="font-size:clamp(26px, 3.2vw, 42px); color:#fff; margin-bottom:14px;">Telugu Delight Gamers</h3>
          <p class="project-desc-text">
            Building an engaged gaming audience with high-energy streams, engaging playthroughs, and interactive content. Demonstrating creative storytelling, video production, and community leadership.
          </p>
          <a id="youtube-section-btn" href="#" target="_blank" rel="noopener noreferrer" class="btn-kage-primary" data-cursor>
            <span>View YouTube Channel</span>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#ffffff" stroke-width="1.4"/></svg>
          </a>
        </div>
        <div class="yt-stat-box">
          <div class="yt-stat-num">2K+</div>
          <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:var(--bone-dim);">Subscribers & Followers</div>
          <div style="font-size:11px; color:var(--muted); margin-top:6px;">Gaming Community Milestone</div>
        </div>
      </div>
    </section>

    <!-- ====================================================================
         CHAPTER 06: EDUCATION & CONTACT / AFTERLIGHT (data-cam="6")
         ==================================================================== -->
    <section class="sec fin" id="contact" data-cam="6">
      <div class="fg" data-fg="eternity" aria-hidden="true">
        <span class="fg-el fg-hill" data-fg-in="up">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/hill.webp" alt="" width="1774" height="887" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-ruins" data-fg-in="left">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/shrine-ruins.webp" alt="" width="1536" height="1001" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-grass" data-fg-in="up">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/tall-grass.webp" alt="" width="1717" height="916" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-sakura" data-fg-in="left">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/sakura-branch.webp" alt="" width="1536" height="1024" loading="lazy" decoding="async">
        </span>
      </div>

      <div class="eyebrow" data-rv="fade">Chapter 06 — Credentials & Contact</div>
      <h2 class="display" data-rv="up">Let's Build Something Exceptional</h2>
      <p class="body-lg" data-rv="up">Open for discussions on full-stack web applications, AI systems, and engineering initiatives.</p>

      <!-- Academic Foundation Card -->
      <div class="edu-card" data-rv="up" style="max-width:800px; margin:28px 0 36px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
          <h3 style="font-size:18px; font-weight:400; color:#fff;">B.Tech in Artificial Intelligence and Data Science</h3>
          <span class="kage-tag" style="color:var(--ember);">Graduated 2025</span>
        </div>
        <p style="font-size:13px; color:var(--bone-dim); margin:0;">
          JNTUK (Jawaharlal Nehru Technological University, Kakinada) — Deep Neural Networks, Algorithms, Machine Intelligence, and Core Computer Science.
        </p>
      </div>

      <!-- Contact Grid -->
      <div class="contact-grid" style="max-width:1000px; width:100%; text-align:left;">
        <div class="contact-channels-box" data-rv="up">
          <h3 style="font-size:16px; font-weight:400; color:var(--bone); margin-bottom:12px; letter-spacing:0.04em;">Direct Channels</h3>
          
          <div class="contact-channel-item">
            <div>
              <div style="font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted);">Email</div>
              <div id="contact-email-val" style="font-size:13px; font-weight:500;">Configure in portfolioData.js</div>
            </div>
            <button class="copy-btn" id="copy-email-btn" data-cursor>Copy</button>
          </div>

          <a id="contact-linkedin-link" href="#" target="_blank" rel="noopener noreferrer" class="contact-channel-item" data-cursor>
            <div>
              <div style="font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted);">LinkedIn</div>
              <div style="font-size:13px; font-weight:500;">Saladi Prasanna Kumar</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg>
          </a>

          <a id="contact-github-link" href="#" target="_blank" rel="noopener noreferrer" class="contact-channel-item" data-cursor>
            <div>
              <div style="font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted);">GitHub</div>
              <div style="font-size:13px; font-weight:500;">Repositories & Code</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg>
          </a>

          <a id="contact-youtube-link" href="#" target="_blank" rel="noopener noreferrer" class="contact-channel-item" data-cursor>
            <div>
              <div style="font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted);">YouTube</div>
              <div style="font-size:13px; font-weight:500;">Telugu Delight Gamers (2K+)</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg>
          </a>
        </div>

        <form class="contact-form" id="contact-form" data-rv="up">
          <h3 style="font-size:16px; font-weight:400; color:var(--bone); margin-bottom:8px; letter-spacing:0.04em;">Send a Message</h3>
          
          <div class="form-field">
            <label for="form-name">Name</label>
            <input type="text" id="form-name" placeholder="Your Name" required>
          </div>

          <div class="form-field">
            <label for="form-email">Email</label>
            <input type="email" id="form-email" placeholder="Your Email Address" required>
          </div>

          <div class="form-field">
            <label for="form-msg">Message</label>
            <textarea id="form-msg" placeholder="Tell me about your project or inquiry..." required></textarea>
          </div>

          <button type="submit" class="btn-kage-primary" style="margin-top:6px; justify-content:center;" data-cursor>
            <span>Send Message</span>
          </button>
          <div style="font-size:10px; color:var(--muted); text-align:center;">
            * Version 2 visual frontend preview.
          </div>
        </form>
      </div>

      <div style="margin-top:48px;">
        <a class="cta" href="#top" data-rv="fade" data-cursor>
          <i></i><span>Return to beginning</span>
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg>
        </a>
      </div>
    </section>

    <!-- ====================================================================
         FOOTER / COLOPHON (data-cam="7")
         ==================================================================== -->
    <footer class="foot" data-cam="7">
      <div class="fg" data-fg="foot" aria-hidden="true">
        <span class="fg-el fg-bush" data-fg-in="up">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/garden-bush.webp" alt="" width="1717" height="876" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-grass" data-fg-in="up">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/tall-grass.webp" alt="" width="1717" height="916" loading="lazy" decoding="async">
        </span>
        <span class="fg-el fg-stones" data-fg-in="up">
          <img crossorigin="anonymous" src="/landing-pages/kage-assets/basalt-stones.webp" alt="" width="1536" height="996" loading="lazy" decoding="async">
        </span>
      </div>

      <div class="foot-grid">
        <div class="foot-brand">
          <svg viewBox="0 0 44 44" fill="none" width="34" height="34" aria-hidden="true">
            <circle cx="22" cy="25" r="8.6" fill="#e0231c" fill-opacity=".9"/>
            <path d="M5 13h34M9 18.4h26M22 8.5v27" stroke="#dfe7e0" stroke-width="1.5"/>
          </svg>
          <p>
            Saladi Prasanna Kumar — Full Stack AI Developer / Engineer at Dream Team Services.
            Crafted with live Three.js procedural WebGL architecture.
          </p>
        </div>

        <div>
          <h4>Chapters</h4>
          <ul>
            <li><a href="#about" data-cursor>01 The Sanmon</a></li>
            <li><a href="#experience" data-cursor>02 Still Gardens</a></li>
            <li><a href="#skills" data-cursor>03 Sacred Craft</a></li>
            <li><a href="#projects" data-cursor>04 Featured Works</a></li>
          </ul>
        </div>

        <div>
          <h4>Connect</h4>
          <ul>
            <li><a id="foot-linkedin" href="#" target="_blank" rel="noopener noreferrer" data-cursor>LinkedIn</a></li>
            <li><a id="foot-github" href="#" target="_blank" rel="noopener noreferrer" data-cursor>GitHub</a></li>
            <li><a id="foot-youtube" href="#" target="_blank" rel="noopener noreferrer" data-cursor>Telugu Delight Gamers</a></li>
          </ul>
        </div>
      </div>

      <div class="foot-bar">
        <span>© <span id="year-copy"></span> Saladi Prasanna Kumar. All rights reserved.</span>
        <span class="jp">静寂と知能 — Where stillness reveals the unseen.</span>
      </div>
    </footer>
  </main>

  <!-- Load Three.js r149 -->
  <script src="/landing-pages/secret-pathways-assets/three.min.js"></script>

  <!-- Load Procedural Kage Three.js Sanctuary Engine with 8 Camera Waypoints -->
  <script src="/landing-pages/kage-engine.js"></script>

  <!-- App Controller Module -->
  <script type="module" src="/src/app.js"></script>
</body>
</html>`;

fs.writeFileSync('index.html', htmlContent, 'utf8');
console.log('Successfully written index.html (size:', fs.statSync('index.html').size, 'bytes)');
