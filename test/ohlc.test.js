import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOhlcRows } from '../src/ohlc.js';

const base = { chainId: 'base', dexId: 'aerodrome', pairAddress: '0xcafe', baseToken: { symbol: 'MEME' }, quoteToken: { symbol: 'USDC' }, liquidityUsd: 1, volumeH24: 2 };

test('builds deterministic ohlc buckets', () => {
  const rows = buildOhlcRows([
    { ...base, priceUsd: 1, capturedAt: '2026-05-01T00:10:00.000Z' },
    { ...base, priceUsd: 1.2, capturedAt: '2026-05-01T00:40:00.000Z' }
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].open, 1);
  assert.equal(rows[0].high, 1.2);
  assert.equal(rows[0].low, 1);
  assert.equal(rows[0].close, 1.2);
  assert.equal(rows[0].sampleCount, 2);
});

test('accepts positive decimal bucket sizes', () => {
  const rows = buildOhlcRows([
    { ...base, priceUsd: 1, capturedAt: '2026-05-01T00:07:00.000Z' }
  ], { bucketMinutes: 2.5 });
  assert.equal(rows[0].bucketMinutes, 2.5);
  assert.equal(rows[0].bucketStart, '2026-05-01T00:05:00.000Z');
});

for (const bucketMinutes of [0, -5, Number.NaN, Number.POSITIVE_INFINITY, 'nope']) {
  test(`rejects invalid OHLC bucket size ${String(bucketMinutes)}`, () => {
    assert.throws(
      () => buildOhlcRows([], { bucketMinutes }),
      { message: 'bucketMinutes must be a finite number greater than 0' }
    );
  });
}
