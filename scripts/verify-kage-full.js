import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-verify-'));

async function testPage(url) {
  console.log(`\n======================================================`);
  console.log(`TESTING: ${url}`);
  console.log(`======================================================`);

  const cp = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9226',
    `--user-data-dir=${tmpDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9226/json/list', (res) => {
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

  const consoleErrors = [];
  const exceptions = [];

  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      if (data.params.type === 'error') {
        const text = data.params.args.map(a => a.value !== undefined ? a.value : a.description).join(' ');
        consoleErrors.push(text);
        console.error('[CONSOLE ERROR]', text);
      }
    }
    if (data.method === 'Runtime.exceptionThrown') {
      const desc = data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text;
      exceptions.push(desc);
      console.error('[EXCEPTION THROWN]', desc);
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');

  await send('Page.navigate', { url });

  // Monitor loading progression for up to 10 seconds
  let done = false;
  let finalState = null;

  for (let s = 1; s <= 20; s++) {
    await new Promise(r => setTimeout(r, 500));
    const res = await send('Runtime.evaluate', {
      expression: `({
        time: (${s * 0.5}).toFixed(1) + 's',
        prePct: document.getElementById('pre-pct')?.textContent,
        preDone: document.getElementById('pre')?.classList.contains('done'),
        isLocked: document.body?.classList.contains('is-locked'),
        hasKage: !!(window.__kage || window.__secret),
        kageSceneChildren: (window.__kage || window.__secret)?.scene?.children?.length || 0,
        cameraZ: (window.__kage || window.__secret)?.camera?.position?.z,
        glCanvasWidth: document.getElementById('gl')?.width,
        glCanvasHeight: document.getElementById('gl')?.height,
        scrollY: window.scrollY
      })`,
      returnByValue: true
    });
    finalState = res.result?.value;
    console.log(`[T=${finalState?.time}] Pct: ${finalState?.prePct} | Preloader Done: ${finalState?.preDone} | 3D Scene Objects: ${finalState?.kageSceneChildren} | Canvas: ${finalState?.glCanvasWidth}x${finalState?.glCanvasHeight}`);

    if (finalState?.preDone && finalState?.hasKage) {
      done = true;
      break;
    }
  }

  // Test scrolling
  console.log('\n--- TESTING SCROLL INTERACTION ---');
  await send('Runtime.evaluate', {
    expression: `window.scrollTo({ top: 1200, behavior: 'instant' });`
  });
  await new Promise(r => setTimeout(r, 600));

  const scrollState = await send('Runtime.evaluate', {
    expression: `({
      scrollY: window.scrollY,
      rigProg: (window.__kage || window.__secret)?.RIG?.prog,
      cameraZ: (window.__kage || window.__secret)?.camera?.position?.z
    })`,
    returnByValue: true
  });
  console.log('State after scroll to 1200px:', scrollState.result?.value);

  ws.close();
  cp.kill();

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log('URL:', url);
  console.log('Loader reached 100%:', finalState?.prePct === '100' || finalState?.preDone);
  console.log('Preloader dismissed (class "done"):', finalState?.preDone);
  console.log('Live 3D Scene initialized:', finalState?.hasKage && finalState?.kageSceneChildren > 0);
  console.log('Canvas resolution:', `${finalState?.glCanvasWidth}x${finalState?.glCanvasHeight}`);
  console.log('Scroll works:', scrollState.result?.value?.scrollY > 0);
  console.log('Console Errors count:', consoleErrors.length);
  console.log('Exceptions count:', exceptions.length);

  return {
    success: finalState?.preDone && finalState?.hasKage && consoleErrors.length === 0 && exceptions.length === 0,
    errors: consoleErrors,
    exceptions
  };
}

async function main() {
  try {
    const resHome = await testPage('http://localhost:5173/');
    const resKage = await testPage('http://localhost:5173/landing-pages/kage.html');

    if (resHome.success && resKage.success) {
      console.log('\n>>> ALL VERIFICATIONS PASSED PERFECTLY! <<<');
    } else {
      console.error('\n>>> SOME CHECKS FAILED! <<<');
      process.exit(1);
    }
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch(console.error);
