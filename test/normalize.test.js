import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDexScreenerSnapshot } from '../src/normalize.js';

const snapshot = {
  capturedAt: '2026-05-01T00:00:00.000Z',
  pairs: [{ chainId: 'Ethereum', dexId: 'Uniswap', pairAddress: '0xABC', baseToken: { symbol: 'abc' }, quoteToken: { symbol: 'weth' }, priceUsd: '12.50', liquidity: { usd: '1000' }, volume: { h24: '200' }, txns: { h24: { buys: 2, sells: 3 } } }]
};

test('normalizes dexscreener pair snapshots', () => {
  const [pool] = parseDexScreenerSnapshot(snapshot);
  assert.equal(pool.chainId, 'ethereum');
  assert.equal(pool.dexId, 'uniswap');
  assert.equal(pool.pairAddress, '0xabc');
  assert.equal(pool.baseToken.symbol, 'ABC');
  assert.equal(pool.priceUsd, 12.5);
  assert.equal(pool.txnsH24, 5);
});
