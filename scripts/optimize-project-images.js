import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-img-'));

async function convertImages() {
  console.log('Starting image optimizer via Chrome headless...');
  const port = 9388;
  const cp = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpDir}`,
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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'about:blank' });

  const images = [
    { src: 'sloopin.jpg', dest: 'sloopin.webp' },
    { src: 'supermarket.jpg', dest: 'supermarket.webp' },
    { src: 'pk-attendance.jpg', dest: 'pk-attendance.webp' },
    { src: 'pk-college.jpg', dest: 'pk-college.webp' }
  ];

  const projectsDir = path.resolve('public/assets/projects');

  for (const img of images) {
    const srcPath = path.join(projectsDir, img.src);
    const destPath = path.join(projectsDir, img.dest);
    const base64Src = fs.readFileSync(srcPath).toString('base64');

    const evalResult = await send('Runtime.evaluate', {
      expression: `(async () => {
        return new Promise((resolve) => {
          const image = new Image();
          image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            const webpData = canvas.toDataURL('image/webp', 0.82);
            resolve(webpData.replace(/^data:image\\/webp;base64,/, ''));
          };
          image.src = 'data:image/jpeg;base64,${base64Src}';
        });
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    if (evalResult?.result?.value) {
      fs.writeFileSync(destPath, Buffer.from(evalResult.result.value, 'base64'));
      const origSize = fs.statSync(srcPath).size;
      const newSize = fs.statSync(destPath).size;
      console.log(`Optimized ${img.src} (${Math.round(origSize / 1024)} KB) -> ${img.dest} (${Math.round(newSize / 1024)} KB) [${Math.round((1 - newSize / origSize) * 100)}% savings]`);
    } else {
      console.error(`Failed to optimize ${img.src}`, evalResult);
    }
  }

  ws.close();
  cp.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  console.log('Image optimization complete.');
}

convertImages().catch(console.error);
