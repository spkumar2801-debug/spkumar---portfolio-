import { spawn } from 'child_process';
import http from 'http';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9223',
  '--disable-gpu',
  '--no-first-run'
]);

async function main() {
  await new Promise(r => setTimeout(r, 1200));
  const list = await new Promise(res => http.get('http://127.0.0.1:9223/json/list', r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
  }));
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (method, params = {}) => new Promise(res => {
    const cur = id++;
    const handler = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === cur) { ws.removeEventListener('message', handler); res(d.result); }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: cur, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // wait 8.5 seconds
  await new Promise(r => setTimeout(r, 8500));

  const check = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        url: window.location.href,
        title: document.title,
        bodyLen: document.body.innerHTML.length,
        bodySnippet: document.body.innerHTML.slice(0, 300),
        iframeCount: document.querySelectorAll('iframe').length
      };
    })()`,
    returnByValue: true
  });

  console.log('Inspection result:', JSON.stringify(check.result.value, null, 2));
  chrome.kill();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
