const fs = require('node:fs');
const path = require('node:path');

const files = [
  'index.html', 'style.css', 'app.js', 'sw.js', 'manifest.webmanifest',
  'icon.svg', 'icon-192.png', 'icon-512.png', 'heebo.woff2', 'heebo-latin.woff2',
  'licenses/Heebo-OFL.txt',
];
const output = path.join(__dirname, 'dist');
for (const file of files) {
  const destination = path.join(output, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(__dirname, file), destination);
}
console.log(`Prepared ${files.length} public files in dist/`);
