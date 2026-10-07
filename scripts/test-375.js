import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const width = 375, height = 667;
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-375-'));

const cp = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9355',
  `--user-data-dir=${tmpDir}`,
  `--window-size=${width},${height}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check'
]);

let page = null;
for (let a = 0; a < 30; a++) {
  await new Promise(r => setTimeout(r, 400));
  try {
    const list = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9355/json/list', res => {
        let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
      }).on('error', reject);
    });
    page = list.find(p => p.type === 'page');
    if (page) break;
  } catch {}
}

if (!page) { console.error('No page'); process.exit(1); }

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

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: true });
await send('Page.navigate', { url: 'http://localhost:5173/' });

for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 500));
  const chk = await send('Runtime.evaluate', {
    expression: `!!(document.getElementById('pre')?.classList.contains('done'))`
  });
  if (chk.result?.value) break;
}
await new Promise(r => setTimeout(r, 1200));

const metrics = await send('Runtime.evaluate', {
  expression: `(() => {
    const heroContent = document.querySelector('.hero-content, .hero-top');
    const heroRect = heroContent ? heroContent.getBoundingClientRect() : null;
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      hasHScroll: document.documentElement.scrollWidth > window.innerWidth,
      heroRect: heroRect ? { top: Math.round(heroRect.top), bottom: Math.round(heroRect.bottom), height: Math.round(heroRect.height) } : null,
      buttonsInside: heroRect ? heroRect.bottom <= window.innerHeight : false,
      role: document.querySelector('.hero-role-title')?.textContent?.trim(),
      status: document.querySelector('.hero-status')?.textContent?.trim(),
      h1: document.querySelector('.h-hero')?.textContent?.trim()
    };
  })()`,
  returnByValue: true
});

console.log('iPhone SE 375x667 Results:', metrics.result?.value);

const shot = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync('verify_iphone_se_375x667.png', Buffer.from(shot.data, 'base64'));
console.log('Saved verify_iphone_se_375x667.png');

ws.close();
cp.kill();
try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
