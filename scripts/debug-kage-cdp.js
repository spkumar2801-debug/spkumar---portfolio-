import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-cdp-run-'));

async function inspect(url) {
  console.log(`\n========================================\nINSPECTING: ${url}\n========================================`);
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  // Poll for CDP to become ready
  let page = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const list = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9222/json/list', (res) => {
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
  console.log('Connected to target:', page.title);

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

  const errors = [];
  const exceptions = [];

  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value !== undefined ? a.value : a.description || JSON.stringify(a)).join(' ');
      if (data.params.type === 'error') {
        errors.push(text);
        console.error('[CONSOLE ERROR]', text);
      } else {
        console.log(`[CONSOLE ${data.params.type.toUpperCase()}]`, text);
      }
    }
    if (data.method === 'Runtime.exceptionThrown') {
      const details = data.params.exceptionDetails;
      const desc = details.exception?.description || details.text || JSON.stringify(details);
      exceptions.push(desc);
      console.error('[EXCEPTION]', desc);
    }
    if (data.method === 'Network.responseReceived') {
      const resp = data.params.response;
      if (resp.status >= 400) {
        console.error(`[HTTP ${resp.status}]`, resp.url);
      }
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');

  console.log('Navigating to', url);
  await send('Page.navigate', { url });

  // Poll state every 1s for 9s
  for (let s = 1; s <= 9; s++) {
    await new Promise(r => setTimeout(r, 1000));
    const state = await send('Runtime.evaluate', {
      expression: `({
        second: ${s},
        prePct: document.getElementById('pre-pct')?.textContent,
        preDone: document.getElementById('pre')?.classList.contains('done'),
        isLocked: document.body?.classList.contains('is-locked'),
        hasKage: !!(window.__kage || window.__secret),
        glWidth: document.getElementById('gl')?.width,
        glHeight: document.getElementById('gl')?.height,
        sceneChildren: (window.__kage || window.__secret)?.scene?.children?.length || 0
      })`,
      returnByValue: true
    });
    console.log(`[T=${s}s]`, JSON.stringify(state.result?.value));
    if (state.result?.value?.preDone && state.result?.value?.hasKage) {
      console.log('Scene loaded and preloader completed!');
      break;
    }
  }

  // Scroll test
  console.log('Testing scroll...');
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 1500);` });
  await new Promise(r => setTimeout(r, 500));
  const afterScroll = await send('Runtime.evaluate', {
    expression: `({
      scrollY: window.scrollY,
      rigProg: (window.__kage || window.__secret)?.RIG?.prog,
      cameraZ: (window.__kage || window.__secret)?.camera?.position?.z
    })`,
    returnByValue: true
  });
  console.log('Scroll Result:', afterScroll.result?.value);

  ws.close();
  cp.kill();
  await new Promise(r => setTimeout(r, 1000));

  console.log('Total Console Errors:', errors.length);
  console.log('Total Exceptions:', exceptions.length);
}

async function main() {
  try {
    await inspect('http://localhost:5173/');
    await inspect('http://localhost:5173/landing-pages/kage.html');
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch(console.error);
