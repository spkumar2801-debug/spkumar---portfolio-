import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runSession(viewport, options = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-test-'));
  const { width, height } = viewport;
  console.log(`\n======================================================`);
  console.log(`TESTING: ${width}x${height} (${options.name || 'default'})`);
  console.log(`======================================================`);

  const port = options.port || 9240;
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

  if (!page) throw new Error('No page target found');

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
    mobile: width < 600
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // Poll for #pre.done
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    const chk = await send('Runtime.evaluate', {
      expression: `!!(document.getElementById('pre')?.classList.contains('done'))`
    });
    if (chk.result?.value) break;
  }
  await new Promise(r => setTimeout(r, 1000));

  if (options.action === 'open-menu') {
    await send('Runtime.evaluate', {
      expression: `document.getElementById('burger')?.click()`
    });
    await new Promise(r => setTimeout(r, 600));
  } else if (options.action === 'scroll-to-projects') {
    await send('Runtime.evaluate', {
      expression: `document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' })`
    });
    await new Promise(r => setTimeout(r, 800));
  }

  const metrics = await send('Runtime.evaluate', {
    expression: `({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      hasHScroll: document.documentElement.scrollWidth > window.innerWidth,
      preDone: document.getElementById('pre')?.classList.contains('done'),
      brandText: document.querySelector('.brand-tx b')?.textContent,
      projectCards: document.querySelectorAll('.project-editorial-card').length,
      menuOpen: document.getElementById('sheet')?.classList.contains('open'),
      overflowingElements: Array.from(document.querySelectorAll('*'))
        .filter(el => {
          if (el.id === 'cursor') return false;
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
    mode: options.name || 'default',
    hasHScroll: res?.hasHScroll,
    preDone: res?.preDone,
    brandText: res?.brandText,
    projectCards: res?.projectCards,
    overflowingCount: res?.overflowingElements?.length || 0,
    consoleErrors: consoleErrors.length
  });

  if (res?.overflowingElements?.length) {
    console.warn('Overflowing elements:', res.overflowingElements);
  }

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const filename = `shot_final_${width}x${height}_${options.name || 'view'}.png`;
  fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
  console.log(`Saved screenshot: ${filename}`);

  ws.close();
  cp.kill();
  await new Promise(r => setTimeout(r, 800));
  return res;
}

async function main() {
  const tests = [
    { width: 375, height: 667, name: 'iphone_se' },
    { width: 375, height: 667, name: 'iphone_se_menu', action: 'open-menu' },
    { width: 390, height: 844, name: 'iphone_14' },
    { width: 430, height: 932, name: 'iphone_15_pro_max' },
    { width: 768, height: 1024, name: 'ipad_portrait' },
    { width: 1280, height: 800, name: 'desktop_1280' },
    { width: 1280, height: 800, name: 'desktop_projects', action: 'scroll-to-projects' },
    { width: 1920, height: 1080, name: 'desktop_1080p' }
  ];

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    t.port = 9240 + i;
    try {
      await runSession(t, t);
    } catch (err) {
      console.error(`Error testing ${t.width}x${t.height}:`, err.message);
    }
  }
}

main().catch(console.error);
