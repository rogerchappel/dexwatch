#!/usr/bin/env node
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCli } from '../src/cli.js';

const outputDir = await mkdtemp(join(tmpdir(), 'dexwatch-smoke-'));
let stdout = '';
let stderr = '';
const code = await runCli([
  'inspect',
  'test/fixtures/eth-pairs',
  '--output', outputDir,
  '--chain', 'ethereum',
  '--min-liquidity-usd', '10000',
  '--format', 'json'
], {
  stdout: { write: (chunk) => { stdout += chunk; } },
  stderr: { write: (chunk) => { stderr += chunk; } }
});

if (code !== 0) throw new Error(`CLI failed: ${stderr}`);
const result = JSON.parse(stdout);
if (result.summary.poolCount !== 2) throw new Error(`expected 2 pools, got ${result.summary.poolCount}`);
const csv = await readFile(join(outputDir, 'ohlc.csv'), 'utf8');
if (!csv.includes('bucketStart')) throw new Error('missing CSV output');
await rm(outputDir, { recursive: true, force: true });
console.log('smoke passed');
