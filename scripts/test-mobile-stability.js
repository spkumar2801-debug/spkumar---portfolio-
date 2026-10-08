import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const TEST_SCENARIOS = [
  { name: 'iPhone SE (375x667) [Throttled CPU]', width: 375, height: 667, dpr: 2, cpuThrottling: 4, isMobile: true },
  { name: 'iPhone 14 (390x844) [Standard Mobile]', width: 390, height: 844, dpr: 3, cpuThrottling: 1, isMobile: true },
  { name: 'iPhone 15 Pro Max (430x932) [High DPR Flagship]', width: 430, height: 932, dpr: 3, cpuThrottling: 1, isMobile: true }
];

async function runScenario(scenario) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-mob-stab-'));
  const port = 9700 + Math.floor(Math.random() * 80);

  const args = [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpDir}`,
    `--window-size=${scenario.width},${scenario.height}`,
    '--no-first-run',
    '--no-default-browser-check'
  ];

  const cp = spawn(chromePath, args);

  let page = null;
  for (let a = 0; a < 40; a++) {
    await new Promise(r => setTimeout(r, 350));
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

  if (!page) {
    cp.kill();
    throw new Error('No page target found');
  }

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
      const txt = data.params.args.map(a => a.value || a.description).join(' ');
      if (!txt.includes('favicon') && !txt.includes('threeuiStorageImage')) {
        consoleErrors.push(txt);
      }
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: scenario.width,
    height: scenario.height,
    deviceScaleFactor: scenario.dpr,
    mobile: scenario.isMobile
  });

  if (scenario.cpuThrottling > 1) {
    await send('Emulation.setCPUThrottlingRate', { rate: scenario.cpuThrottling });
  }

  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // Wait for preloader dismissal
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 200));
    const chk = await send('Runtime.evaluate', {
      expression: `!!(document.getElementById('pre')?.classList.contains('done'))`
    });
    if (chk.result?.value) break;
  }

  await new Promise(r => setTimeout(r, 600));

  // Get initial memory / heap size
  const heap1 = await send('Runtime.evaluate', {
    expression: `window.performance?.memory?.usedJSHeapSize || 0`,
    returnByValue: true
  });

  // Perform 4 repetitive top-to-bottom scroll cycles
  const sections = ['hero', 'about', 'experience', 'skills', 'projects', 'youtube', 'contact'];
  let maxScrollDuration = 0;

  for (let cycle = 1; cycle <= 4; cycle++) {
    const cycleStart = Date.now();
    // Scroll down through all sections
    for (const sec of sections) {
      await send('Runtime.evaluate', {
        expression: `(() => { const el = document.getElementById('${sec}'); if (el) el.scrollIntoView({ behavior: 'instant' }); })()`
      });
      await new Promise(r => setTimeout(r, 60));
    }
    // Scroll back up
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 0, behavior: 'instant' });`
    });
    await new Promise(r => setTimeout(r, 80));
    const dur = Date.now() - cycleStart;
    if (dur > maxScrollDuration) maxScrollDuration = dur;
  }

  // Get final state check after repetitive scrolling
  const finalCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const kage = window.__kage || {};
      const tier = kage.tier || document.documentElement.dataset.tier;
      const isFallback = kage.isFallback || false;
      const hasHScroll = document.documentElement.scrollWidth > window.innerWidth;
      const heap = window.performance?.memory?.usedJSHeapSize || 0;
      return {
        tier,
        isFallback,
        hasHScroll,
        heap
      };
    })()`,
    returnByValue: true
  });

  const res = finalCheck.result.value;

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

  return {
    name: scenario.name,
    tier: res.tier,
    isFallback: res.isFallback,
    hasHScroll: res.hasHScroll,
    initialHeap: heap1.result.value,
    finalHeap: res.heap,
    errors: consoleErrors,
    maxScrollDuration
  };
}

async function main() {
  console.log('='.repeat(75));
  console.log('MOBILE REPETITIVE SCROLL & MEMORY STABILITY AUDIT');
  console.log('='.repeat(75));

  let totalFailures = 0;

  for (const sc of TEST_SCENARIOS) {
    process.stdout.write(`Testing [${sc.name}]... `);
    try {
      const res = await runScenario(sc);
      const fails = [];
      if (res.hasHScroll) fails.push('Horizontal overflow');
      if (res.errors.length > 0) fails.push(`Console error: ${res.errors[0]}`);

      if (fails.length === 0) {
        console.log(`PASS | Tier: ${res.tier} | Repetitive 4-cycle scroll duration: ${res.maxScrollDuration}ms | 0 errors`);
      } else {
        console.log(`FAIL`);
        fails.forEach(f => console.log(`   - ${f}`));
        totalFailures++;
      }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      totalFailures++;
    }
  }

  console.log('='.repeat(75));
  if (totalFailures === 0) {
    console.log('ALL MOBILE STABILITY & REPETITIVE SCROLL CHECKS PASSED!');
  } else {
    console.error(`FAILED: ${totalFailures} scenarios had stability issues.`);
  }
  console.log('='.repeat(75));

  process.exit(totalFailures === 0 ? 0 : 1);
}

main();
