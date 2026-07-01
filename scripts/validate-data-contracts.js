#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const targets = ['src/lib', 'src/data'];
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

let supabaseUsage = [];
targets.forEach(t => {
  const dir = path.join(root, t);
  const files = walk(dir);
  files.forEach(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      if (/supabase|createClient\(|from\s+['"]@supabase|from\s+['"]supabase['"]/i.test(content)) {
        supabaseUsage.push(f);
      }
    } catch (err) {}
  });
});

const docsDbPath = path.join(root, 'docs', 'marketiv-md', 'database');
const docsExist = fs.existsSync(docsDbPath) && fs.readdirSync(docsDbPath).length > 0;

if (supabaseUsage.length === 0) {
  console.log('No obvious Supabase/GraphQL data-layer changes detected.');
  process.exit(0);
}

console.log('Found files referencing Supabase/GraphQL:');
supabaseUsage.forEach(f => console.log(` - ${f}`));
if (!docsExist) {
  console.log('\nWarning: docs/marketiv-md/database appears empty. Please add docs for schema/permissions changes.');
} else {
  console.log('\nDocs for database area exist. Ensure you updated relevant pages in docs/marketiv-md/database.');
}

// Annotate-only for now
process.exit(0);
