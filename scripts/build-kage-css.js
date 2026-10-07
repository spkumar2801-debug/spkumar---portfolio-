import fs from 'fs';

const html = fs.readFileSync('public/landing-pages/kage.html', 'utf8');

const styleStart = html.indexOf('<style>') + 7;
const styleEnd = html.indexOf('</style>');
const kageCss = html.slice(styleStart, styleEnd);

fs.writeFileSync('src/styles/kage-base.css', kageCss, 'utf8');
console.log('Saved src/styles/kage-base.css (size:', fs.statSync('src/styles/kage-base.css').size, 'bytes)');
