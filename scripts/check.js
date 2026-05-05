#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const required = ['README.md', 'SECURITY.md', 'CONTRIBUTING.md', 'docs/PRD.md', 'src/cli.js'];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (/\.(js|md|json|sh)$/.test(entry.name)) files.push(path);
  }
  return files;
}

for (const file of required) {
  const info = await stat(join(root, file));
  if (!info.isFile() || info.size === 0) throw new Error(`required file missing or empty: ${file}`);
}

for (const file of await walk(root)) {
  const text = await readFile(file, 'utf8');
  if (text.includes('\t')) throw new Error(`tabs are not allowed: ${file}`);
  if (text.includes('TODO:')) throw new Error(`template TODO remains: ${file}`);
}

console.log('check passed');
