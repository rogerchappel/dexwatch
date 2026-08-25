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

test('accepts finite numeric strings and valid pair timestamps', () => {
  const [pool] = parseDexScreenerSnapshot([{
    priceUsd: '12.50', priceNative: '0.005', liquidity: { usd: '1000' },
    volume: { h24: '200' }, txns: { h24: { buys: '2', sells: '3' } },
    fdv: '5000', marketCap: '4000', pairCreatedAt: 1777593600000,
    capturedAt: '2026-05-01T00:00:00.000Z'
  }]);
  assert.equal(pool.priceUsd, 12.5);
  assert.equal(pool.priceNative, 0.005);
  assert.equal(pool.liquidityUsd, 1000);
  assert.equal(pool.volumeH24, 200);
  assert.equal(pool.txnsH24, 5);
  assert.equal(pool.pairCreatedAt, '2026-05-01T00:00:00.000Z');
});

for (const [path, pair] of [
  ['priceUsd', { priceUsd: 'not-a-price' }],
  ['priceNative', { priceNative: '' }],
  ['liquidity.usd', { liquidity: { usd: Number.NaN } }],
  ['volume.h24', { volume: { h24: 'lots' } }],
  ['txns.h24.buys', { txns: { h24: { buys: Infinity } } }],
  ['txns.h24.sells', { txns: { h24: { sells: null } } }],
  ['fdv', { fdv: {} }],
  ['marketCap', { marketCap: 'unknown' }],
  ['pairCreatedAt', { pairCreatedAt: 'not-a-date' }],
  ['capturedAt', { capturedAt: '' }]
]) {
  test(`rejects malformed pair field ${path}`, () => {
    assert.throws(
      () => parseDexScreenerSnapshot([pair]),
      (error) => error?.code === 'INVALID_SNAPSHOT'
        && error?.details?.index === 0
        && error?.details?.field === path
        && error.message.includes(`index 0 field ${path}`)
    );
  });
}

for (const [path, pair] of [
  ['baseToken', { baseToken: null }],
  ['quoteToken', { quoteToken: [] }],
  ['liquidity', { liquidity: 'deep' }],
  ['volume', { volume: 24 }],
  ['txns', { txns: false }],
  ['txns.h24', { txns: { h24: [] } }]
]) {
  test(`rejects malformed pair container ${path}`, () => {
    assert.throws(
      () => parseDexScreenerSnapshot([pair]),
      (error) => error?.code === 'INVALID_SNAPSHOT'
        && error?.details?.index === 0
        && error?.details?.field === path
        && error.message.includes(`index 0 field ${path}`)
    );
  });
}

for (const [path, pair] of [
  ['chainId', { chainId: 1 }],
  ['dexId', { dexId: {} }],
  ['pairAddress', { pairAddress: ['0xabc'] }],
  ['url', { url: true }],
  ['baseToken.address', { baseToken: { address: 10 } }],
  ['baseToken.name', { baseToken: { name: null } }],
  ['baseToken.symbol', { baseToken: { symbol: false } }],
  ['quoteToken.address', { quoteToken: { address: {} } }],
  ['quoteToken.name', { quoteToken: { name: 10 } }],
  ['quoteToken.symbol', { quoteToken: { symbol: [] } }]
]) {
  test(`rejects malformed identity field ${path}`, () => {
    assert.throws(
      () => parseDexScreenerSnapshot([pair]),
      (error) => error?.code === 'INVALID_SNAPSHOT'
        && error?.details?.index === 0
        && error?.details?.field === path
        && error.message.includes(`index 0 field ${path}`)
    );
  });
}

test('preserves defaults when optional containers and identity fields are omitted', () => {
  const [pool] = parseDexScreenerSnapshot([{}]);
  assert.equal(pool.chainId, '');
  assert.equal(pool.dexId, '');
  assert.equal(pool.pairAddress, '');
  assert.deepEqual(pool.baseToken, { address: '', name: '', symbol: '' });
  assert.deepEqual(pool.quoteToken, { address: '', name: '', symbol: '' });
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
