import fs from 'fs';

const kageHtml = fs.readFileSync('public/landing-pages/kage.html', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const ids = [
  'fg-sky', 'rail', 'chips', 'cards', 'cur', 'gl', 'grain', 
  'vignette', 'cursor', 'pre', 'pre-fill', 'pre-pct', 'nav', 
  'sheet', 'burger', 'hero'
];

ids.forEach(id => {
  const inKage = kageHtml.includes('id="' + id + '"');
  const inIndex = indexHtml.includes('id="' + id + '"');
  console.log(`${id.padEnd(12)} in kage.html: ${inKage} | in index.html: ${inIndex}`);
});
