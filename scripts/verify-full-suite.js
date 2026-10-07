import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTest(viewport, options = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-suite-'));
  const { width, height } = viewport;
  const port = options.port || (9300 + Math.floor(Math.random() * 80));

  const cp = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpDir}`,
    `--window-size=${width},${height}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  let page = null;
  for (let a = 0; a < 25; a++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const list = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/list`, res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => resolve(JSON.parse(d)));
        }).on('error', reject);
      });
      page = list.find(p => p.type === 'page');
      if (page) break;
    } catch {}
  }

  if (!page) {
    cp.kill();
    throw new Error('No target page found');
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let msgId = 1;
  const send = (method, params = {}) => new Promise(resolve => {
    const id = msgId++;
    const handler = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id === id) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const consoleErrors = [];
  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
      consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: width < 768
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // Wait for preloader #pre.done
  for (let i = 0; i < 35; i++) {
    await new Promise(r => setTimeout(r, 400));
    const chk = await send('Runtime.evaluate', {
      expression: `!!(document.getElementById('pre')?.classList.contains('done'))`
    });
    if (chk.result?.value) break;
  }
  await new Promise(r => setTimeout(r, 1200));

  if (options.openMenu) {
    await send('Runtime.evaluate', {
      expression: `document.getElementById('burger')?.click()`
    });
    await new Promise(r => setTimeout(r, 500));
  } else if (options.scrollTo) {
    await send('Runtime.evaluate', {
      expression: `document.querySelector('${options.scrollTo}')?.scrollIntoView({ behavior: 'instant' })`
    });
    await new Promise(r => setTimeout(r, 700));
  }

  const evalResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const isMobile = window.innerWidth <= 820;
      const navLinks = Array.from(document.querySelectorAll('.nav-link')).map(l => ({
        text: l.textContent.trim(),
        href: l.getAttribute('href'),
        active: l.classList.contains('on'),
        color: window.getComputedStyle(l).color,
        bg: window.getComputedStyle(l).backgroundColor,
        fontSize: window.getComputedStyle(l).fontSize
      }));

      const sheetOpen = document.getElementById('sheet')?.classList.contains('open');
      const sheetItems = Array.from(document.querySelectorAll('.sheet-menu-item')).map(item => ({
        num: item.querySelector('.sheet-item-num')?.textContent.trim(),
        title: item.querySelector('.sheet-item-title')?.textContent.trim(),
        href: item.getAttribute('href'),
        height: item.getBoundingClientRect().height
      }));

      const aboutHead = document.querySelector('#about h2')?.textContent.trim();
      const aboutBody = document.querySelector('#about .body-lg')?.textContent.trim();
      const eduDegree = document.querySelector('.edu-degree')?.textContent.trim();
      const eduCollege = document.querySelector('.edu-college')?.textContent.trim();
      const eduYear = document.querySelector('.edu-year')?.textContent.trim();

      const projects = Array.from(document.querySelectorAll('.project-editorial-card')).map(p => ({
        title: p.querySelector('.project-heading')?.textContent.trim(),
        imgSrc: p.querySelector('img')?.getAttribute('src'),
        aspectRatio: window.getComputedStyle(p.querySelector('.project-image-box')).aspectRatio,
        github: p.querySelector('[id$="-github"]')?.getAttribute('href') || 'disabled',
        live: p.querySelector('[id$="-live"]')?.getAttribute('href') || 'disabled'
      }));

      const dpr = window.__kage?.renderer?.getPixelRatio?.() || window.devicePixelRatio;

      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        hasHScroll: document.documentElement.scrollWidth > window.innerWidth,
        isMobile,
        navLinksCount: navLinks.length,
        navLinksVisible: !isMobile ? window.getComputedStyle(document.querySelector('.nav-links')).display !== 'none' : false,
        activeNavLink: navLinks.find(l => l.active)?.text,
        sheetOpen,
        sheetItemsCount: sheetItems.length,
        sheetItems,
        about: {
          degree: eduDegree,
          college: eduCollege,
          year: eduYear,
          hasFullStackAi: aboutBody?.includes('Full Stack AI Developer') || aboutBody?.includes('Dream Team Services')
        },
        projectsCount: projects.length,
        projects,
        dpr
      };
    })()`,
    returnByValue: true
  });

  // Capture screenshot
  if (options.screenshot) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot?.data) {
      fs.writeFileSync(options.screenshot, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot: ${options.screenshot}`);
    }
  }

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

  return {
    viewport: `${width}x${height}`,
    mode: options.name || 'default',
    metrics: evalResult.result?.value,
    errors: consoleErrors
  };
}

async function main() {
  console.log('STARTING FULL VERIFICATION PASS...');
  const tests = [
    { vp: { width: 375, height: 667 }, opt: { name: 'iphone_se', screenshot: 'verify_375x667.png' } },
    { vp: { width: 375, height: 667 }, opt: { name: 'iphone_se_menu', openMenu: true, screenshot: 'verify_375x667_menu.png' } },
    { vp: { width: 390, height: 844 }, opt: { name: 'iphone_14', screenshot: 'verify_390x844.png' } },
    { vp: { width: 430, height: 932 }, opt: { name: 'iphone_15_pro_max', screenshot: 'verify_430x932.png' } },
    { vp: { width: 768, height: 1024 }, opt: { name: 'ipad_portrait', screenshot: 'verify_768x1024.png' } },
    { vp: { width: 1024, height: 768 }, opt: { name: 'ipad_landscape', screenshot: 'verify_1024x768.png' } },
    { vp: { width: 1280, height: 720 }, opt: { name: 'desktop_720p', screenshot: 'verify_1280x720.png' } },
    { vp: { width: 1440, height: 900 }, opt: { name: 'desktop_900p', screenshot: 'verify_1440x900.png' } },
    { vp: { width: 1920, height: 1080 }, opt: { name: 'desktop_1080p', screenshot: 'verify_1920x1080.png' } },
    { vp: { width: 1920, height: 1080 }, opt: { name: 'desktop_1080p_about', scrollTo: '#about', screenshot: 'verify_1080p_about.png' } },
    { vp: { width: 1920, height: 1080 }, opt: { name: 'desktop_1080p_projects', scrollTo: '#projects', screenshot: 'verify_1080p_projects.png' } }
  ];

  for (const t of tests) {
    try {
      const res = await runTest(t.vp, t.opt);
      console.log(`\n--- RESULT [${res.mode} ${res.viewport}] ---`);
      console.log('Errors:', res.errors.length === 0 ? 'CLEAN (0)' : res.errors);
      console.log('Has Horizontal Scroll:', res.metrics?.hasHScroll);
      if (res.metrics?.isMobile) {
        console.log('Mobile menu open:', res.metrics?.sheetOpen, 'Items:', res.metrics?.sheetItemsCount);
      } else {
        console.log('Desktop Nav Visible:', res.metrics?.navLinksVisible, 'Active Link:', res.metrics?.activeNavLink);
      }
      console.log('Projects count:', res.metrics?.projectsCount, 'About Degree:', res.metrics?.about?.degree);
    } catch (e) {
      console.error(`FAILED test ${t.opt.name}:`, e.message);
    }
  }
  console.log('\nFULL VERIFICATION PASS COMPLETED.');
}

main();
