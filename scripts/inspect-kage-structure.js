import fs from 'fs';

const html = fs.readFileSync('public/landing-pages/kage.html', 'utf8');

// Find all section or chapter elements
const matches = [...html.matchAll(/<(section|article|div)[^>]*id=["']([^"']+)["'][^>]*>/g)];
console.log('Elements with ID found:');
matches.forEach(m => console.log(' <' + m[1] + ' id="' + m[2] + '">'));

// Also check lines between 1000 and 1300 to see DOM wrap
const lines = html.split('\n');
console.log('Total lines:', lines.length);

// Look for chapter markers or section elements
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('class="sec') || lines[i].includes('class="chapter') || lines[i].includes('<section')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}
