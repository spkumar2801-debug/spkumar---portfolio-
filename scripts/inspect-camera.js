import fs from 'fs';

const html = fs.readFileSync('public/landing-pages/kage.html', 'utf8');

// Find camera targets or waypoints
const lines = html.split('\n');
for (let i = 1205; i < Math.min(lines.length, 1400); i++) {
  const line = lines[i];
  if (line.includes('camera') || line.includes('CAM') || line.includes('target') || line.includes('scroll') || line.includes('scene')) {
    console.log(`Line ${i + 1}: ${line.slice(0, 100)}`);
  }
}
