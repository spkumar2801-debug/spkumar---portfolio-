import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureShot(width, height, label, port) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `chrome-shot-${label}-`));
  console.log(`\nCapturing ${label} (${width}x${height}) on port ${port}...`);

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
  for (let a = 0; a < 15; a++) {
    await new Promise(r => setTimeout(r, 400));
    try {
      const list = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/list`, res => {
          let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
        }).on('error', reject);
      });
      page = list.find(p => p.type === 'page') || list[0];
      if (page) break;
    } catch {}
  }

  if (!page) throw new Error(`Could not connect on port ${port}`);

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

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: width < 600
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // Wait reliably for preloader dismissal
  for (let w = 0; w < 30; w++) {
    await new Promise(r => setTimeout(r, 500));
    const chk = await send('Runtime.evaluate', {
      expression: `!!(document.getElementById('pre')?.classList.contains('done'))`
    });
    if (chk.result?.value) break;
  }
  // Extra wait for entrance reveals
  await new Promise(r => setTimeout(r, 1600));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const filename = `shot_${label}_${width}x${height}.png`;
  if (shot && shot.data) {
    fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot to ${filename}`);
  }

  const check = await send('Runtime.evaluate', {
    expression: `({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasHScroll: document.documentElement.scrollWidth > window.innerWidth,
      brandText: document.querySelector('.brand-tx b')?.textContent,
      heroHeading: document.querySelector('.h-hero')?.textContent?.replace(/\\s+/g, ' ').trim(),
      heroOpacity: window.getComputedStyle(document.querySelector('.h-hero')).opacity
    })`,
    returnByValue: true
  });
  console.log(`DOM check for ${label}:`, check.result?.value);

  ws.close();
  cp.kill();
  await new Promise(r => setTimeout(r, 1000));
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
}

async function run() {
  await captureShot(375, 667, 'mobile_375', 9231);
  await captureShot(390, 844, 'mobile_390', 9232);
  await captureShot(1280, 800, 'desktop_1280', 9233);
}

run().catch(console.error);
