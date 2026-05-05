import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPools } from '../src/filters.js';

const pools = [
  { chainId: 'ethereum', dexId: 'uniswap', baseToken: { symbol: 'ALPHA' }, liquidityUsd: 100, volumeH24: 50 },
  { chainId: 'base', dexId: 'aerodrome', baseToken: { symbol: 'BETA' }, liquidityUsd: 10, volumeH24: 500 }
];

test('filters pools by chain and metric thresholds', () => {
  assert.deepEqual(filterPools(pools, { chains: ['ethereum'], min: { liquidityUsd: 50 } }), [pools[0]]);
  assert.deepEqual(filterPools(pools, { symbols: ['BETA'], min: { volumeH24: 100 } }), [pools[1]]);
});
