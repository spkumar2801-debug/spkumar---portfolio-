import fs from 'fs';

const html = fs.readFileSync('public/landing-pages/kage.html', 'utf8');

const regexes = [
  /src=["']([^"']+)["']/g,
  /href=["']([^"']+)["']/g,
  /url\(["']?([^"')]+)["']?\)/g,
  /["'](\/[^"']+\.(?:png|jpg|jpeg|webp|svg|woff2|woff|ttf|hdr|bin|gltf|glb))["']/g,
  /["']([a-zA-Z0-9_\-./]+\.(?:png|jpg|jpeg|webp|svg|woff2|woff|ttf|hdr|bin|gltf|glb))["']/g
];

const matches = new Set();
for (const r of regexes) {
  let m;
  while ((m = r.exec(html)) !== null) {
    matches.add(m[1]);
  }
}

console.log('Found assets in kage.html:');
Array.from(matches).sort().forEach(a => console.log(' -', a));
