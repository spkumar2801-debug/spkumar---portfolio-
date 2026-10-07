import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testViewport(viewport, options = {}) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-polish-'));
  const { width, height } = viewport;
  const port = options.port || (9250 + Math.floor(Math.random() * 50));

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

  // Wait for preloader
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 400));
    const chk = await send('Runtime.evaluate', {
      expression: `!!(document.getElementById('pre')?.classList.contains('done'))`
    });
    if (chk.result?.value) break;
  }
  await new Promise(r => setTimeout(r, 1200));

  const evaluation = await send('Runtime.evaluate', {
    expression: `(() => {
      const bodyFont = window.getComputedStyle(document.body).fontFamily;
      const h1Font = window.getComputedStyle(document.querySelector('.h-hero') || document.body).fontFamily;
      const primaryBtn = document.querySelector('.btn-spk-primary');
      const secondaryBtn = document.querySelector('.btn-spk-secondary');
      
      const pRect = primaryBtn ? primaryBtn.getBoundingClientRect() : null;
      const sRect = secondaryBtn ? secondaryBtn.getBoundingClientRect() : null;
      const pStyle = primaryBtn ? window.getComputedStyle(primaryBtn) : null;
      const sStyle = secondaryBtn ? window.getComputedStyle(secondaryBtn) : null;

      const heroKicker = document.querySelector('.hero-welcome-eyebrow');
      const heroRole = document.querySelector('.hero-role-title');
      const heroSub = document.querySelector('.hero-sub');

      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasHScroll: document.documentElement.scrollWidth > window.innerWidth,
        bodyFont,
        h1Font,
        primaryBtn: pRect ? {
          width: Math.round(pRect.width),
          height: Math.round(pRect.height),
          fontSize: pStyle.fontSize,
          fontWeight: pStyle.fontWeight,
          letterSpacing: pStyle.letterSpacing,
          backgroundColor: pStyle.backgroundColor,
          color: pStyle.color,
          fontFamily: pStyle.fontFamily
        } : null,
        secondaryBtn: sRect ? {
          width: Math.round(sRect.width),
          height: Math.round(sRect.height),
          fontSize: sStyle.fontSize,
          fontWeight: sStyle.fontWeight,
          letterSpacing: sStyle.letterSpacing,
          backgroundColor: sStyle.backgroundColor,
          color: sStyle.color,
          fontFamily: sStyle.fontFamily
        } : null,
        buttonsEqualWidth: pRect && sRect ? Math.abs(pRect.width - sRect.width) <= 2 : false,
        buttonsEqualHeight: pRect && sRect ? Math.abs(pRect.height - sRect.height) <= 2 : false,
        heroTypography: {
          eyebrow: heroKicker ? heroKicker.textContent.trim() : null,
          eyebrowLetterSpacing: heroKicker ? window.getComputedStyle(heroKicker).letterSpacing : null,
          role: heroRole ? heroRole.textContent.trim() : null,
          sub: heroSub ? heroSub.textContent.trim() : null
        }
      };
    })()`,
    returnByValue: true
  });

  const res = evaluation.result?.value;
  console.log(`[${options.name || 'Test'}] ${width}x${height}:`, {
    hasHScroll: res?.hasHScroll,
    bodyFont: res?.bodyFont,
    primaryBtnDimensions: res?.primaryBtn ? `${res.primaryBtn.width}x${res.primaryBtn.height}` : 'N/A',
    secondaryBtnDimensions: res?.secondaryBtn ? `${res.secondaryBtn.width}x${res.secondaryBtn.height}` : 'N/A',
    buttonsEqualWidth: res?.buttonsEqualWidth,
    buttonsEqualHeight: res?.buttonsEqualHeight,
    primaryLetterSpacing: res?.primaryBtn?.letterSpacing,
    secondaryLetterSpacing: res?.secondaryBtn?.letterSpacing,
    consoleErrors: consoleErrors.length
  });

  // Capture screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot?.data) {
    const shotPath = path.join(process.cwd(), 'public', `shot-${width}x${height}.png`);
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: ${shotPath}`);
  }

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  return { ...res, consoleErrors };
}

async function main() {
  console.log('--- STARTING COMPREHENSIVE VIEWPORT & TYPOGRAPHY VERIFICATION ---');
  const viewports = [
    { width: 375, height: 667, name: 'iPhone SE (375x667)' },
    { width: 390, height: 844, name: 'iPhone 12/13/14 (390x844)' },
    { width: 430, height: 932, name: 'iPhone 14/15 Pro Max (430x932)' },
    { width: 1280, height: 720, name: 'Desktop HD (1280x720)' },
    { width: 1440, height: 900, name: 'Desktop WXGA+ (1440x900)' },
    { width: 1920, height: 1080, name: 'Desktop Full HD (1920x1080)' }
  ];

  for (const vp of viewports) {
    await testViewport(vp, { name: vp.name });
  }
  console.log('--- ALL VIEWPORT TESTS COMPLETE ---');
}

main().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
