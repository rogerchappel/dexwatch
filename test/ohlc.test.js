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

test('uses capturedAt chronology regardless of input order', () => {
  const samples = [
    { ...base, priceUsd: 1.2, liquidityUsd: 12, volumeH24: 22, capturedAt: '2026-05-01T00:40:00.000Z' },
    { ...base, priceUsd: 1, liquidityUsd: 10, volumeH24: 20, capturedAt: '2026-05-01T00:10:00.000Z' }
  ];

  const chronological = buildOhlcRows(samples.toReversed());
  const reversed = buildOhlcRows(samples);

  assert.deepEqual(reversed, chronological);
  assert.equal(reversed[0].open, 1);
  assert.equal(reversed[0].close, 1.2);
  assert.equal(reversed[0].liquidityUsd, 12);
  assert.equal(reversed[0].volumeH24, 22);
});

test('breaks capturedAt ties by output values', () => {
  const capturedAt = '2026-05-01T00:10:00.000Z';
  const samples = [
    { ...base, priceUsd: 2, liquidityUsd: 20, volumeH24: 30, capturedAt },
    { ...base, priceUsd: 1, liquidityUsd: 10, volumeH24: 40, capturedAt }
  ];

  assert.deepEqual(buildOhlcRows(samples), buildOhlcRows(samples.toReversed()));
  assert.equal(buildOhlcRows(samples)[0].open, 1);
  assert.equal(buildOhlcRows(samples)[0].close, 2);
});

test('sorts rows by a complete stable identity', () => {
  const capturedAt = '2026-05-01T00:10:00.000Z';
  const samples = [
    { ...base, dexId: 'z-dex', pairAddress: '0x2', priceUsd: 1, capturedAt },
    { ...base, dexId: 'a-dex', pairAddress: '0x3', priceUsd: 1, capturedAt },
    { ...base, dexId: 'a-dex', pairAddress: '0x1', priceUsd: 1, capturedAt }
  ];

  const identities = buildOhlcRows(samples).map((row) => `${row.dexId}|${row.pairAddress}`);
  assert.deepEqual(identities, ['a-dex|0x1', 'a-dex|0x3', 'z-dex|0x2']);
  assert.deepEqual(buildOhlcRows(samples), buildOhlcRows(samples.toReversed()));
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
