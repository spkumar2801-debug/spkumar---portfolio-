import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-cdp-lifecycle-'));

async function inspect(url) {
  console.log(`\n========================================\nINSPECTING: ${url}\n========================================`);
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9225/json/list', (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
  const page = list.find(p => p.type === 'page') || list[0];
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

  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('[CONSOLE]', data.params.type, data.params.args.map(a => a.value !== undefined ? a.value : a.description).join(' '));
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('[EXCEPTION]', data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url });

  // Poll state every 500ms for 6 seconds
  for (let s = 1; s <= 12; s++) {
    await new Promise(r => setTimeout(r, 500));
    const res = await send('Runtime.evaluate', {
      expression: `({
        step: ${s},
        prePct: document.getElementById('pre-pct')?.textContent,
        preDone: document.getElementById('pre')?.classList.contains('done'),
        isLocked: document.body?.classList.contains('is-locked'),
        hasKage: !!window.__kage,
        kageError: window.__kage?.error
      })`,
      returnByValue: true
    });
    console.log(JSON.stringify(res.result?.value));
  }

  ws.close();
  cp.kill();
}

async function main() {
  try {
    await inspect('http://localhost:5173/landing-pages/kage.html');
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch(console.error);
