import test from 'node:test';
import assert from 'node:assert/strict';
import { formatHumanReport, summarizePools } from '../src/report.js';

test('summarizes pools and formats human reports', () => {
  const pools = [
    { chainId: 'ethereum', liquidityUsd: 100, volumeH24: 50 },
    { chainId: 'ethereum', liquidityUsd: 25, volumeH24: 75 }
  ];
  const summary = summarizePools(pools);
  assert.deepEqual(summary.chains, { ethereum: 2 });
  assert.equal(summary.liquidityUsd, 125);
  assert.match(formatHumanReport({ pools, ohlcRows: [], provenance: { source: 'fixture', capturedAt: 'now' } }), /pools: 2/);
});
