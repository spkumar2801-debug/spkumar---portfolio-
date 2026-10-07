import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-vp-'));

async function inspectViewport(width, height) {
  console.log(`\n======================================================`);
  console.log(`TESTING VIEWPORT: ${width}x${height}`);
  console.log(`======================================================`);

  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tmpDir}`,
    `--window-size=${width},${height}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  let page = null;
  for (let a = 0; a < 15; a++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const list = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json/list', res => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => resolve(JSON.parse(d)));
        }).on('error', reject);
      });
      page = list.find(p => p.type === 'page') || list[0];
      if (page) break;
    } catch {}
  }

  if (!page) throw new Error('Could not connect to Chrome CDP');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let msgId = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve) => {
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
  };

  const consoleErrors = [];
  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
      consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: width < 600
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // Wait 8.5 seconds for preloader & entrance animations
  await new Promise(r => setTimeout(r, 8500));

  const metrics = await send('Runtime.evaluate', {
    expression: `({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      hasHScroll: document.documentElement.scrollWidth > window.innerWidth,
      preDone: document.getElementById('pre')?.classList.contains('done'),
      heroHeight: document.getElementById('hero')?.offsetHeight,
      navHeight: document.getElementById('nav')?.offsetHeight,
      brandText: document.querySelector('.brand-tx b')?.textContent,
      has3DScene: !!(window.__kage || window.__secret),
      projectCardCount: document.querySelectorAll('.project-editorial-card').length,
      overflowingElements: Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const r = el.getBoundingClientRect();
          return r.right > window.innerWidth + 2 || r.left < -2;
        })
        .map(el => (el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').join('.') : '')).slice(0, 50))
        .slice(0, 5)
    })`,
    returnByValue: true
  });

  const res = metrics.result?.value;
  console.log('Results:', {
    viewport: `${width}x${height}`,
    innerWidth: res?.innerWidth,
    scrollWidth: res?.scrollWidth,
    horizontalScrollDetected: res?.hasHScroll,
    preloaderCompleted: res?.preDone,
    brandIdentity: res?.brandText,
    projectsRendered: res?.projectCardCount,
    live3DSceneActive: res?.has3DScene,
    overflowingElementsCount: res?.overflowingElements?.length || 0,
    consoleErrors: consoleErrors.length
  });

  if (res?.overflowingElements?.length) {
    console.warn('Elements extending outside viewport:', res.overflowingElements);
  }

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot && shot.data) {
    const filename = `screenshot_${width}x${height}.png`;
    fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot to ${filename}`);
  }

  ws.close();
  cp.kill();
  await new Promise(r => setTimeout(r, 1200));

  return {
    success: !res?.hasHScroll && res?.preDone && res?.has3DScene && consoleErrors.length === 0,
    metrics: res
  };
}

async function main() {
  try {
    const vps = [
      [375, 667],
      [390, 844],
      [430, 932],
      [768, 1024],
      [1280, 800],
      [1920, 1080]
    ];

    let allPass = true;
    for (const [w, h] of vps) {
      const outcome = await inspectViewport(w, h);
      if (!outcome.success) allPass = false;
    }

    if (allPass) {
      console.log('\n======================================================');
      console.log('>>> ALL VIEWPORTS PASSED WITH ZERO ERRORS & ZERO OVERFLOW! <<<');
      console.log('======================================================');
    } else {
      console.warn('\nSome viewports had warnings or overflow.');
    }
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch(console.error);
