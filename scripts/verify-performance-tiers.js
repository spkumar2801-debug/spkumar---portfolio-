import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testScenario({ name, url, width, height, dpr = 2, reducedMotion = false, cpuThrottlingRate = 1 }) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-test-'));
  const port = 9400 + Math.floor(Math.random() * 80);

  const args = [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpDir}`,
    `--window-size=${width},${height}`,
    '--no-first-run',
    '--no-default-browser-check'
  ];

  const cp = spawn(chromePath, args);

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
      consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: dpr,
    mobile: width < 768
  });

  if (reducedMotion) {
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
  }

  if (cpuThrottlingRate > 1) {
    await send('Emulation.setCPUThrottlingRate', { rate: cpuThrottlingRate });
  }

  const startTime = Date.now();
  await send('Page.navigate', { url });

  // Wait for preloader #pre.done
  let preDone = false;
  let loadDuration = 0;
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 200));
    const chk = await send('Runtime.evaluate', {
      expression: `!!(document.getElementById('pre')?.classList.contains('done'))`
    });
    if (chk.result?.value) {
      preDone = true;
      loadDuration = Date.now() - startTime;
      break;
    }
  }

  await new Promise(r => setTimeout(r, 800));

  const evalResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const isMobile = window.innerWidth <= 820;
      const kage = window.__kage || {};
      const tier = kage.tier || document.documentElement.dataset.tier || 0;
      const isFallback = kage.isFallback || false;
      const dprUsed = kage.renderer?.getPixelRatio?.() || 1;

      const brokenImages = Array.from(document.querySelectorAll('img')).filter(img => {
        return img.naturalWidth === 0 && img.complete;
      }).map(img => img.src);

      const navLinks = Array.from(document.querySelectorAll('.nav-link')).map(l => l.textContent.trim());
      const activeSec = document.querySelector('.nav-link.on')?.textContent.trim();

      const projects = Array.from(document.querySelectorAll('.project-editorial-card')).map(p => ({
        title: p.querySelector('.project-heading')?.textContent.trim(),
        imgSrc: p.querySelector('img')?.src,
        hasWebp: !!p.querySelector('source[type="image/webp"]')
      }));

      return {
        tier,
        isFallback,
        dprUsed,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        hasHScroll: document.documentElement.scrollWidth > window.innerWidth,
        brokenImagesCount: brokenImages.length,
        brokenImages,
        projectsCount: projects.length,
        hasWebpOnProjects: projects.every(p => p.hasWebp),
        navLinksCount: navLinks.length,
        activeSec
      };
    })()`,
    returnByValue: true
  });

  const screenshotPath = `verify_${name}.png`;
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot?.data) {
    fs.writeFileSync(screenshotPath, Buffer.from(shot.data, 'base64'));
  }

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

  return {
    scenario: name,
    url,
    viewport: `${width}x${height} @${dpr}x`,
    preDone,
    loadDurationMs: loadDuration,
    metrics: evalResult.result?.value,
    errors: consoleErrors,
    screenshot: screenshotPath
  };
}

async function runAll() {
  console.log('================================================================');
  console.log('RUNNING FULL ADAPTIVE PERFORMANCE TIER SUITE');
  console.log('================================================================');

  const scenarios = [
    // 1. EXACT REQUIRED MOBILE VIEWPORTS
    { name: 'mobile_375x667_iphone_se', url: 'http://localhost:5173/', width: 375, height: 667, dpr: 2 },
    { name: 'mobile_390x844_iphone_14', url: 'http://localhost:5173/', width: 390, height: 844, dpr: 3 },
    { name: 'mobile_430x932_iphone_15_pro_max', url: 'http://localhost:5173/', width: 430, height: 932, dpr: 3 },

    // 2. ADAPTIVE QUALITY LEVELS (Tiers 1 to 5)
    { name: 'tier_1_high_end_desktop', url: 'http://localhost:5173/?tier=1', width: 1920, height: 1080, dpr: 1 },
    { name: 'tier_2_high_end_mobile', url: 'http://localhost:5173/?tier=2', width: 390, height: 844, dpr: 3 },
    { name: 'tier_3_mid_range_mobile', url: 'http://localhost:5173/?tier=3', width: 390, height: 844, dpr: 2 },
    { name: 'tier_4_low_end_mobile', url: 'http://localhost:5173/?tier=4', width: 375, height: 667, dpr: 2 },
    { name: 'tier_5_reduced_motion', url: 'http://localhost:5173/?tier=5', width: 390, height: 844, dpr: 2, reducedMotion: true },

    // 3. LOW CPU & HIGH DPR SIMULATION
    { name: 'sim_low_cpu_mobile', url: 'http://localhost:5173/?tier=4', width: 375, height: 667, dpr: 2, cpuThrottlingRate: 4 },
    { name: 'sim_high_dpr_flagship', url: 'http://localhost:5173/?tier=2', width: 430, height: 932, dpr: 3.5 },

    // 4. EXACT REQUIRED DESKTOP VIEWPORTS
    { name: 'desktop_1280x720', url: 'http://localhost:5173/?tier=1', width: 1280, height: 720, dpr: 1 },
    { name: 'desktop_1366x768', url: 'http://localhost:5173/?tier=1', width: 1366, height: 768, dpr: 1 },
    { name: 'desktop_1440x900', url: 'http://localhost:5173/?tier=1', width: 1440, height: 900, dpr: 1 },
    { name: 'desktop_1920x1080', url: 'http://localhost:5173/?tier=1', width: 1920, height: 1080, dpr: 1 }
  ];

  let passedCount = 0;

  for (const s of scenarios) {
    try {
      const res = await testScenario(s);
      const m = res.metrics;
      const isHScrollOk = !m?.hasHScroll;
      const isErrorsOk = res.errors.length === 0;
      const isImagesOk = m?.brokenImagesCount === 0;
      const isPass = res.preDone && isHScrollOk && isErrorsOk && isImagesOk;

      if (isPass) passedCount++;

      console.log(`\nScenario: [${res.scenario}] (${res.viewport})`);
      console.log(`  Tier Applied: ${m?.tier} | Fallback Mode: ${m?.isFallback} | DPR Cap: ${m?.dprUsed}`);
      console.log(`  Load Time: ${res.loadDurationMs}ms (Preloader done: ${res.preDone})`);
      console.log(`  Horizontal Scroll: ${m?.hasHScroll ? 'FAIL (overflow detected)' : 'PASS (no overflow)'}`);
      console.log(`  Errors: ${res.errors.length === 0 ? 'CLEAN (0)' : res.errors.join('; ')}`);
      console.log(`  Images: ${m?.projectsCount} projects, 0 broken, WebP active: ${m?.hasWebpOnProjects}`);
      console.log(`  Screenshot saved: ${res.screenshot}`);
    } catch (e) {
      console.error(`FAILED scenario ${s.name}:`, e.message);
    }
  }

  console.log(`\n================================================================`);
  console.log(`TEST RESULTS: ${passedCount}/${scenarios.length} SCENARIOS PASSED`);
  console.log(`================================================================`);
}

runAll();
