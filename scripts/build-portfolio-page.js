import fs from 'fs';
import path from 'path';

// Read the original kage.html
const originalHtml = fs.readFileSync('public/landing-pages/kage.html', 'utf8');

// Extract the Three.js procedural script from line 1207 to 4822
const scriptStartIdx = originalHtml.indexOf('<script>', originalHtml.indexOf('secret-pathways-assets/three.min.js'));
const scriptEndIdx = originalHtml.lastIndexOf('</script>');
let threeScript = originalHtml.slice(scriptStartIdx + 8, scriptEndIdx);

// Update CAM array inside the Three.js script to smoothly cover 8 waypoints
const oldCamBlock = `const CAM = [
  { p: [  0.0, 4.05, 13.6 ], t: [  0.0, 6.60, -18.0 ], fov: 36 },  /* 0 hero        */
  { p: [ -5.6, 2.35, 11.6 ], t: [  1.2, 5.60, -14.0 ], fov: 48 },  /* 1 the sanmon  */
  { p: [  1.2, 3.60,  2.2 ], t: [ -0.6, 7.50, -22.0 ], fov: 40 },  /* 2 gardens     */
  { p: [  5.2, 2.10, -3.4 ], t: [ -2.6, 7.00, -20.0 ], fov: 46 },  /* 3 craft       */
  { p: [  0.0, 7.60, -16.0 ], t: [  0.0, 13.0, -40.0 ], fov: 42 }, /* 4 afterlight  */
  { p: [  0.0, 10.5, -20.0 ], t: [  0.0, 3.00, -34.0 ], fov: 46 }  /* 5 footer      */
];`;

const newCamBlock = `const CAM = [
  { p: [  0.0, 4.05, 13.6 ], t: [  0.0, 6.60, -18.0 ], fov: 36 },  /* 0 hero        */
  { p: [ -5.6, 2.35, 11.6 ], t: [  1.2, 5.60, -14.0 ], fov: 48 },  /* 1 about       */
  { p: [  1.2, 3.60,  2.2 ], t: [ -0.6, 7.50, -22.0 ], fov: 40 },  /* 2 experience  */
  { p: [  5.2, 2.10, -3.4 ], t: [ -2.6, 7.00, -20.0 ], fov: 46 },  /* 3 skills      */
  { p: [ -3.8, 3.20, -8.6 ], t: [  0.8, 6.40, -24.0 ], fov: 44 },  /* 4 projects    */
  { p: [  2.4, 2.60, -12.4], t: [ -1.0, 5.20, -28.0 ], fov: 44 },  /* 5 youtube     */
  { p: [  0.0, 7.60, -16.0], t: [  0.0, 13.0, -40.0 ], fov: 42 },  /* 6 contact     */
  { p: [  0.0, 10.5, -20.0], t: [  0.0, 3.00, -34.0 ], fov: 46 }   /* 7 footer      */
];`;

if (threeScript.includes(oldCamBlock)) {
  threeScript = threeScript.replace(oldCamBlock, newCamBlock);
  console.log('Successfully updated CAM waypoints in Three.js script!');
} else {
  console.log('CAM block not found with exact whitespace, attempting regex replace...');
  threeScript = threeScript.replace(/const CAM = \[\s*\{ p:[\s\S]*?\];/, newCamBlock);
}

// Write the standalone Kage Three.js engine to public/landing-pages/kage-engine.js
fs.writeFileSync('public/landing-pages/kage-engine.js', threeScript, 'utf8');
console.log('Created public/landing-pages/kage-engine.js (size:', fs.statSync('public/landing-pages/kage-engine.js').size, 'bytes)');
