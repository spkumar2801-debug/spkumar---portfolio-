import fs from 'fs';

const html = fs.readFileSync('public/landing-pages/kage.html', 'utf8');

const s = html.indexOf('id="rail"');
if (s !== -1) {
  console.log('rail found in kage.html at line', html.slice(0, s).split('\n').length);
  console.log(html.slice(s - 100, s + 100));
}

const sSky = html.indexOf('id="fg-sky"');
if (sSky !== -1) {
  console.log('fg-sky found in kage.html at line', html.slice(0, sSky).split('\n').length);
  console.log(html.slice(sSky - 100, sSky + 100));
}
