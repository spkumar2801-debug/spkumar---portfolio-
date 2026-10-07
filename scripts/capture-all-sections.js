import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-sec-'));

async function captureSections(width, height, prefix) {
  console.log(`Capturing sections for ${width}x${height}...`);
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9229',
    `--user-data-dir=${tmpDir}`,
    `--window-size=${width},${height}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  let page = null;
  for (let a = 0; a < 20; a++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      const list = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9229/json/list', res => {
          let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
        }).on('error', reject);
      });
      page = list.find(p => p.type === 'page');
      if (page) break;
    } catch {}
  }
  if (!page) throw new Error('No page target');

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
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: width < 600 });
  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // wait for preloader
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    const chk = await send('Runtime.evaluate', { expression: `!!(document.getElementById('pre')?.classList.contains('done'))` });
    if (chk.result?.value) break;
  }
  await new Promise(r => setTimeout(r, 1500));

  const sections = ['hero', 'about', 'experience', 'skills', 'projects', 'youtube', 'contact'];
  for (const sec of sections) {
    await send('Runtime.evaluate', {
      expression: `document.getElementById('${sec}')?.scrollIntoView({ behavior: 'instant', block: 'start' })`
    });
    await new Promise(r => setTimeout(r, 600));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`sec_${prefix}_${sec}.png`, Buffer.from(shot.data, 'base64'));
    console.log(`Saved sec_${prefix}_${sec}.png`);
  }

  ws.close();
  cp.kill();
}

async function main() {
  try {
    await captureSections(1280, 800, 'desk');
    await captureSections(390, 844, 'mob');
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch(console.error);
