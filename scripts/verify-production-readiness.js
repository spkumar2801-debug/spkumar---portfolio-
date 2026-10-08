import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const VIEWPORTS = [
  // Mobile Viewports requested
  { name: 'iPhone SE', width: 375, height: 667, dpr: 2, isMobile: true },
  { name: 'iPhone 14', width: 390, height: 844, dpr: 3, isMobile: true },
  { name: 'iPhone 15 Pro Max', width: 430, height: 932, dpr: 3, isMobile: true },
  // Desktop Viewports requested
  { name: 'Desktop 720p', width: 1280, height: 720, dpr: 1, isMobile: false },
  { name: 'Desktop 768p', width: 1366, height: 768, dpr: 1, isMobile: false },
  { name: 'Desktop 900p', width: 1440, height: 900, dpr: 1, isMobile: false },
  { name: 'Desktop 1080p', width: 1920, height: 1080, dpr: 1, isMobile: false },
];

const SECTIONS = ['hero', 'about', 'experience', 'skills', 'projects', 'youtube', 'contact'];

async function testScenario(vp) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-audit-'));
  const port = 9500 + Math.floor(Math.random() * 80);

  const args = [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpDir}`,
    `--window-size=${vp.width},${vp.height}`,
    '--no-first-run',
    '--no-default-browser-check'
  ];

  const cp = spawn(chromePath, args);

  let page = null;
  for (let a = 0; a < 25; a++) {
    await new Promise(r => setTimeout(r, 250));
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
    throw new Error('No page target found');
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
      const txt = data.params.args.map(a => a.value || a.description).join(' ');
      if (!txt.includes('favicon') && !txt.includes('threeuiStorageImage')) {
        consoleErrors.push(txt);
      }
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.dpr,
    mobile: vp.isMobile
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // Wait for preloader dismissal
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 200));
    const chk = await send('Runtime.evaluate', {
      expression: `!!(document.getElementById('pre')?.classList.contains('done'))`
    });
    if (chk.result?.value) break;
  }

  await new Promise(r => setTimeout(r, 600));

  // 1. Initial State Check
  const initCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const bodyText = document.body.innerText;
      const forbidden = bodyText.includes('Configure in portfolioData.js');
      const hasHScroll = document.documentElement.scrollWidth > window.innerWidth;
      
      const projs = [0, 1, 2, 3].map(i => {
        const gh = document.getElementById('proj-' + i + '-github');
        const live = document.getElementById('proj-' + i + '-live');
        return {
          ghVisible: gh ? window.getComputedStyle(gh).display !== 'none' : false,
          ghHref: gh ? gh.getAttribute('href') : null,
          liveVisible: live ? window.getComputedStyle(live).display !== 'none' : false,
          liveHref: live ? live.getAttribute('href') : null,
        };
      });

      const emailVal = document.getElementById('contact-email-val')?.textContent.trim();
      const ytBtn = document.getElementById('youtube-section-btn')?.getAttribute('href');

      const brokenImages = Array.from(document.querySelectorAll('img')).filter(img => {
        return img.naturalWidth === 0 && img.complete;
      }).map(img => img.src);

      return {
        forbidden,
        hasHScroll,
        projs,
        emailVal,
        ytBtn,
        brokenImagesCount: brokenImages.length
      };
    })()`,
    returnByValue: true
  });

  const res = initCheck.result.value;

  // 2. Full Scroll Journey Test
  let scrollHasOverflow = false;
  for (const s of SECTIONS) {
    const sChk = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('${s}');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        return document.documentElement.scrollWidth > window.innerWidth;
      })()`,
      returnByValue: true
    });
    if (sChk.result.value) scrollHasOverflow = true;
    await new Promise(r => setTimeout(r, 100));
  }

  // Cleanup
  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

  return {
    name: vp.name,
    vp: `${vp.width}x${vp.height} @${vp.dpr}x`,
    hasHScroll: res.hasHScroll || scrollHasOverflow,
    forbidden: res.forbidden,
    emailVal: res.emailVal,
    ytBtn: res.ytBtn,
    projs: res.projs,
    brokenImages: res.brokenImagesCount,
    errors: consoleErrors
  };
}

async function main() {
  console.log('='.repeat(70));
  console.log('FINAL PRODUCTION AUDIT: MOBILE & DESKTOP SUITE');
  console.log('='.repeat(70));

  let totalFailures = 0;

  for (const vp of VIEWPORTS) {
    process.stdout.write(`Testing [${vp.name}] (${vp.width}x${vp.height} @${vp.dpr}x)... `);
    try {
      const out = await testScenario(vp);
      const failures = [];

      if (out.hasHScroll) failures.push('Horizontal overflow detected');
      if (out.forbidden) failures.push('Found "Configure in portfolioData.js"');
      if (out.brokenImages > 0) failures.push(`${out.brokenImages} broken image(s)`);
      if (out.errors.length > 0) failures.push(`Console error: ${out.errors[0]}`);

      // Check Live Demo: all empty must be hidden
      const unhiddenLive = out.projs.filter(p => p.liveVisible && (!p.liveHref || p.liveHref === '#'));
      if (unhiddenLive.length > 0) failures.push('Empty Live Demo button is not hidden');

      // Check GitHub repos
      const validGh = out.projs.filter(p => p.ghVisible && p.ghHref?.startsWith('https://github.com/'));
      if (validGh.length !== 4) failures.push(`Only ${validGh.length}/4 GitHub buttons point to valid repos`);

      if (failures.length === 0) {
        console.log(`PASS (0 errors, 0 overflow, clean links, email: "${out.emailVal}")`);
      } else {
        console.log(`FAIL`);
        failures.forEach(f => console.log(`   - ${f}`));
        totalFailures++;
      }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      totalFailures++;
    }
  }

  console.log('='.repeat(70));
  if (totalFailures === 0) {
    console.log('ALL VIEWPORTS PASSED WITH ZERO ERRORS. PRODUCTION READY!');
  } else {
    console.error(`AUDIT FAILED: ${totalFailures} viewports had issues.`);
  }
  console.log('='.repeat(70));

  process.exit(totalFailures === 0 ? 0 : 1);
}

main();
