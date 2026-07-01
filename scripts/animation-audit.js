#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const targets = ['src/app', 'src/components'];
const exts = ['.ts', '.tsx', '.js', '.jsx'];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(f => {
    const filePath = path.join(dir, f);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) results = results.concat(walk(filePath));
    else if (exts.includes(path.extname(filePath))) results.push(filePath);
  });
  return results;
}

const patterns = [
  {re: /from\s+['"]gsap['"]/i, message: 'Direct gsap import (prefer src/lib/gsap util)'},
  {re: /\bgsap\b/i, message: 'gsap usage found (verify useGSAP and scoped refs)'},
  {re: /whileInView\s*\(|useScroll\s*\(/i, message: 'Framer Motion scroll API usage (migrate to ScrollTrigger)'},
  {re: /useEffect\s*\(/i, message: 'useEffect found — confirm GSAP lifecycle uses useGSAP'}
];

let issues = [];
targets.forEach(t => {
  const dir = path.join(root, t);
  const files = walk(dir);
  files.forEach(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      patterns.forEach(p => {
        if (p.re.test(content)) {
          issues.push({file: f, message: p.message});
        }
      });
    } catch (err) {
      // ignore
    }
  });
});

if (issues.length === 0) {
  console.log('No animation audit issues found.');
  process.exit(0);
}

console.log('Animation audit found issues:');
issues.forEach(i => console.log(`${i.file}: ${i.message}`));

// Annotate-only: exit 0 so workflow doesn't block by default.
process.exit(0);
