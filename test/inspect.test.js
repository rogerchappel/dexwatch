import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspectPath } from '../src/inspect.js';

test('inspects a fixture directory and writes all outputs', async () => {
  const outputDir = await mkdtemp(join(tmpdir(), 'dexwatch-test-'));
  const result = await inspectPath('test/fixtures/eth-pairs', { outputDir, filters: { chains: ['ethereum'], min: { liquidityUsd: 10000 } }, bucketMinutes: 15, capturedAt: '2026-05-01T01:00:00.000Z' });
  assert.equal(result.summary.poolCount, 2);
  assert.equal(result.provenance.bucketMinutes, 15);
  assert.match(await readFile(join(outputDir, 'report.txt'), 'utf8'), /dexwatch inspect report/);
  const provenance = JSON.parse(await readFile(join(outputDir, 'provenance.json'), 'utf8'));
  assert.equal(provenance.inputSha256, result.provenance.inputSha256);
  assert.equal(provenance.bucketMinutes, 15);
  await rm(outputDir, { recursive: true, force: true });
});
