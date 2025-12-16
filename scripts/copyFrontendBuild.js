const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const srcDir = path.join(repoRoot, 'frontend', 'dist');
const destDir = path.join(repoRoot, 'backend', 'public');

if (!fs.existsSync(srcDir)) {
  console.error(`Frontend build not found at: ${srcDir}`);
  console.error('Run: npm run build --prefix frontend');
  process.exit(1);
}

fs.rmSync(destDir, { recursive: true, force: true });
fs.mkdirSync(destDir, { recursive: true });
fs.cpSync(srcDir, destDir, { recursive: true });

console.log(`Copied frontend build from ${srcDir} -> ${destDir}`);
