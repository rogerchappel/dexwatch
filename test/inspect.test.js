import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectPath } from '../src/inspect.js';

test('inspects a fixture directory and writes all outputs', async () => {
  const outputDir = await mkdtemp(join(tmpdir(), 'dexwatch-test-'));
  const result = await inspectPath('test/fixtures/eth-pairs', { outputDir, filters: { chains: ['ethereum'], min: { liquidityUsd: 10000 } }, capturedAt: '2026-05-01T01:00:00.000Z' });
  assert.equal(result.summary.poolCount, 2);
  assert.match(await readFile(join(outputDir, 'report.txt'), 'utf8'), /dexwatch inspect report/);
  assert.match(await readFile(join(outputDir, 'provenance.json'), 'utf8'), /inputSha256/);
  await rm(outputDir, { recursive: true, force: true });
});
