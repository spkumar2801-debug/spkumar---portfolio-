import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-diag-'));

async function diag(width, height) {
  console.log(`Starting diag for ${width}x${height}...`);
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
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
        http.get('http://127.0.0.1:9224/json/list', res => {
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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: width < 600
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // Wait for #pre.done up to 15s
  const waitStart = Date.now();
  let done = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    const chk = await send('Runtime.evaluate', {
      expression: `!!(document.getElementById('pre')?.classList.contains('done'))`
    });
    if (chk.result?.value) {
      done = true;
      console.log(`Preloader completed in ${(Date.now() - waitStart) / 1000}s`);
      break;
    }
  }

  // Extra 1.5s for hero entry animations (.rv-in)
  await new Promise(r => setTimeout(r, 1500));

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const hero = document.getElementById('hero');
      const heroTop = document.querySelector('.hero-top');
      const h1 = document.querySelector('.h-hero');
      const ctas = document.querySelector('.hero-ctas');
      const pre = document.getElementById('pre');
      const portal = document.querySelector('.hero-project-portal');
      const nav = document.querySelector('.nav');

      const r = el => el ? {
        top: Math.round(el.getBoundingClientRect().top),
        bottom: Math.round(el.getBoundingClientRect().bottom),
        height: Math.round(el.getBoundingClientRect().height)
      } : null;

      const bodyChildren = Array.from(document.body.children).map(c => ({
        tag: c.tagName, id: c.id, cls: c.className,
        pos: getComputedStyle(c).position,
        display: getComputedStyle(c).display,
        top: Math.round(c.getBoundingClientRect().top),
        h: Math.round(c.getBoundingClientRect().height)
      }));

      return {
        bodyChildren,
        navHeight: nav?.offsetHeight,
        navRect: r(nav),
        heroRect: r(hero),
        heroTopRect: r(heroTop),
        heroTopPadding: heroTop ? getComputedStyle(heroTop).paddingTop : null,
        h1Rect: r(h1),
        ctasRect: r(ctas),
        portalRect: r(portal)
      };
    })()`,
    returnByValue: true
  });

  console.log('DIAGNOSTIC RESULT:', JSON.stringify(result.result?.value, null, 2));

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`diag_${width}x${height}.png`, Buffer.from(shot.data, 'base64'));
  console.log(`Saved diag_${width}x${height}.png`);

  ws.close();
  cp.kill();
}

diag(375, 667).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
