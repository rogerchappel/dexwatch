#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'dexwatch-package-smoke-'));

try {
  const output = execFileSync('npm', ['pack', '--json', '--pack-destination', temporaryDirectory], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  const [packument] = JSON.parse(output);
  const files = new Set(packument.files.map((entry) => entry.path));

const requiredFiles = [
  "package.json",
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "src/cli.js",
  "src/index.js",
  "examples/README.md",
  "examples/filter-ethereum.sh",
];

  const missingFiles = requiredFiles.filter((file) => !files.has(file));

  if (missingFiles.length > 0) {
    throw new Error(`Package is missing expected files:\n${missingFiles.map((file) => `- ${file}`).join('\n')}`);
  }

  const installDirectory = join(temporaryDirectory, 'install');
  const tarball = join(temporaryDirectory, packument.filename);
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--prefix', installDirectory, tarball], {
    stdio: 'inherit',
  });

  const outputDirectory = join(temporaryDirectory, 'output');
  execFileSync(join(installDirectory, 'node_modules', '.bin', 'dexwatch'), [
    'inspect',
    join(root, 'test', 'fixtures', 'eth-pairs'),
    '--output',
    outputDirectory,
    '--format',
    'json',
  ], { stdio: ['ignore', 'pipe', 'inherit'] });

  const pools = JSON.parse(readFileSync(join(outputDirectory, 'pools.json'), 'utf8'));
  if (pools.length === 0) throw new Error('Installed CLI produced no pools from the fixture');

  execFileSync(process.execPath, [
    '--input-type=module',
    '--eval',
    "import { inspectPath } from 'dexwatch'; if (typeof inspectPath !== 'function') process.exit(1);",
  ], { cwd: installDirectory, stdio: 'inherit' });

  console.log(`Package smoke passed: packed ${files.size} files, installed the tarball, exercised the CLI, and imported inspectPath.`);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
