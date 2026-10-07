import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-inspect-hero-'));

async function inspect() {
  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9228',
    `--user-data-dir=${tmpDir}`,
    '--window-size=375,667',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9228/json/list', res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const page = list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const msgId = id++;
    const handler = evt => {
      const d = JSON.parse(evt.data);
      if (d.id === msgId) { ws.removeEventListener('message', handler); res(d.result); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:5173/' });

  await new Promise(r => setTimeout(r, 8000));

  const res = await send('Runtime.evaluate', {
    expression: `
      Array.from(document.querySelectorAll('#hero *'))
        .filter(el => ['H1', 'P', 'DIV', 'SPAN', 'A'].includes(el.tagName) && el.textContent.trim().length > 0)
        .map(el => ({
          tag: el.tagName,
          class: el.className,
          hasRvIn: el.classList.contains('rv-in'),
          opacity: window.getComputedStyle(el).opacity,
          display: window.getComputedStyle(el).display,
          color: window.getComputedStyle(el).color,
          rect: {
            top: el.getBoundingClientRect().top,
            bottom: el.getBoundingClientRect().bottom,
            width: el.getBoundingClientRect().width,
            height: el.getBoundingClientRect().height
          },
          text: el.textContent.trim().slice(0, 30)
        }))
    `,
    returnByValue: true
  });

  console.log('Hero Elements on 375x667:');
  console.dir(res.result?.value?.slice(0, 15), { depth: null });

  ws.close();
  cp.kill();
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

inspect().catch(console.error);
