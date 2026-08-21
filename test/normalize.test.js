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

test('accepts object and array snapshot roots, including valid empty snapshots', () => {
  assert.equal(parseDexScreenerSnapshot(snapshot).length, 1);
  assert.equal(parseDexScreenerSnapshot(snapshot.pairs).length, 1);
  assert.deepEqual(parseDexScreenerSnapshot({ pairs: [] }), []);
  assert.deepEqual(parseDexScreenerSnapshot([]), []);
});

for (const [label, input] of [
  ['an object without pairs', {}],
  ['a null root', null],
  ['a scalar root', 'pairs']
]) {
  test(`rejects ${label}`, () => {
    assert.throws(
      () => parseDexScreenerSnapshot(input),
      (error) => error?.name === 'DexwatchError' && error?.code === 'INVALID_SNAPSHOT' && /expected an array of pairs or an object with a pairs array/.test(error.message)
    );
  });
}

for (const entry of [null, 'pair', [], 42]) {
  test(`rejects malformed pair entry ${JSON.stringify(entry)}`, () => {
    assert.throws(
      () => parseDexScreenerSnapshot([entry]),
      (error) => error?.name === 'DexwatchError' && error?.code === 'INVALID_SNAPSHOT' && /pair at index 0: expected an object/.test(error.message)
    );
  });
}
