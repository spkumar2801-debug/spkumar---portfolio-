import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testViewport(width, height, name, port = 9310) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-verify-'));
  console.log(`\n======================================================`);
  console.log(`TESTING VIEWPORT: ${width}x${height} (${name})`);
  console.log(`======================================================`);

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
          let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
        }).on('error', reject);
      });
      page = list.find(p => p.type === 'page');
      if (page) break;
    } catch {}
  }

  if (!page) throw new Error('No Chrome target');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let msgId = 1;
  const send = (method, params = {}) => new Promise(resolve => {
    const id = msgId++;
    const handler = evt => {
      const d = JSON.parse(evt.data);
      if (d.id === id) { ws.removeEventListener('message', handler); resolve(d.result); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const consoleErrors = [];
  ws.onmessage = evt => {
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
    mobile: width < 600
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // Wait for preloader to finish
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    const chk = await send('Runtime.evaluate', {
      expression: `!!(document.getElementById('pre')?.classList.contains('done'))`
    });
    if (chk.result?.value) break;
  }
  await new Promise(r => setTimeout(r, 1200));

  const evaluation = await send('Runtime.evaluate', {
    expression: `(() => {
      const hero = document.getElementById('hero');
      const heroContent = document.querySelector('.hero-content, .hero-top');
      const heroRect = heroContent ? heroContent.getBoundingClientRect() : null;
      const nav = document.getElementById('nav');
      const navRect = nav ? nav.getBoundingClientRect() : null;
      
      const welcome = document.querySelector('.hero-welcome-eyebrow')?.textContent?.trim();
      const heroH1 = document.querySelector('.h-hero')?.textContent?.trim();
      const role = document.querySelector('.hero-role-title')?.textContent?.trim();
      const sub = document.querySelector('.hero-sub')?.textContent?.trim();
      const status = document.querySelector('.hero-status')?.textContent?.trim();
      
      const ctaButtons = Array.from(document.querySelectorAll('.hero-ctas a')).map(a => a.textContent.trim());

      const eduDegree = document.querySelector('.edu-degree')?.textContent?.trim();
      const eduCollege = document.querySelector('.edu-college')?.textContent?.trim();
      const eduYear = document.querySelector('.edu-year')?.textContent?.trim();
      const eduInAbout = !!document.querySelector('#about .edu-card');
      const eduInContact = !!document.querySelector('#contact .edu-card');

      const brandB = document.querySelector('.brand-tx b')?.textContent?.trim();
      const brandSpk = document.querySelector('.brand-spk')?.textContent?.trim();

      const projects = Array.from(document.querySelectorAll('.project-heading')).map(h => h.textContent.trim());

      const overflowElements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          if (el.id === 'cursor') return false;
          const r = el.getBoundingClientRect();
          return r.right > window.innerWidth + 2 || r.left < -2;
        })
        .map(el => (el.tagName + (el.id ? '#' + el.id : '')).slice(0, 40));

      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        hasHScroll: document.documentElement.scrollWidth > window.innerWidth,
        heroRect: heroRect ? { top: Math.round(heroRect.top), bottom: Math.round(heroRect.bottom), height: Math.round(heroRect.height) } : null,
        navHeight: navRect ? Math.round(navRect.height) : null,
        welcome,
        heroH1,
        role,
        sub,
        status,
        ctaButtons,
        eduDegree,
        eduCollege,
        eduYear,
        eduInAbout,
        eduInContact,
        brandB,
        brandSpk,
        projects,
        overflowCount: overflowElements.length,
        overflowElements: overflowElements.slice(0, 5)
      };
    })()`,
    returnByValue: true
  });

  const res = evaluation.result?.value;
  console.log('Metrics:', {
    viewport: `${width}x${height}`,
    hasHScroll: res.hasHScroll,
    heroVertical: res.heroRect,
    welcome: res.welcome,
    heroH1: res.heroH1,
    role: res.role,
    status: res.status,
    ctaButtons: res.ctaButtons,
    education: {
      degree: res.eduDegree,
      college: res.eduCollege,
      year: res.eduYear,
      inAbout: res.eduInAbout,
      inContact: res.eduInContact
    },
    brand: `${res.brandSpk} / ${res.brandB}`,
    projectCount: res.projects?.length,
    consoleErrors: consoleErrors.length,
    overflowCount: res.overflowCount
  });

  // Capture hero shot
  const heroShot = await send('Page.captureScreenshot', { format: 'png' });
  const filename = `verify_${name}_${width}x${height}.png`;
  fs.writeFileSync(filename, Buffer.from(heroShot.data, 'base64'));
  console.log(`Saved screenshot: ${filename}`);

  // Also capture about shot
  await send('Runtime.evaluate', {
    expression: `document.getElementById('about')?.scrollIntoView({ behavior: 'instant', block: 'start' })`
  });
  await new Promise(r => setTimeout(r, 800));
  const aboutShot = await send('Page.captureScreenshot', { format: 'png' });
  const aboutFilename = `verify_about_${name}_${width}x${height}.png`;
  fs.writeFileSync(aboutFilename, Buffer.from(aboutShot.data, 'base64'));
  console.log(`Saved screenshot: ${aboutFilename}`);

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  await new Promise(r => setTimeout(r, 600));
  return res;
}

async function run() {
  const viewports = [
    // Mobile Viewports requested in Section 7
    { width: 375, height: 667, name: 'iphone_se' },
    { width: 390, height: 844, name: 'iphone_14' },
    { width: 430, height: 932, name: 'iphone_15_pro_max' },
    // Desktop Viewports requested in Section 8
    { width: 1280, height: 720, name: 'desktop_720p' },
    { width: 1440, height: 900, name: 'desktop_900p' },
    { width: 1920, height: 1080, name: 'desktop_1080p' }
  ];

  let port = 9320;
  for (const vp of viewports) {
    try {
      await testViewport(vp.width, vp.height, vp.name, port++);
    } catch (e) {
      console.error(`Failed ${vp.name}:`, e.message);
    }
  }
  console.log('\nALL VERIFICATION COMPLETED!');
}

run().catch(console.error);
