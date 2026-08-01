import { DexwatchError } from './errors.js';

function bucketStart(isoTimestamp, bucketMinutes) {
  const sizeMs = bucketMinutes * 60 * 1000;
  const ms = new Date(isoTimestamp).getTime();
  return new Date(Math.floor(ms / sizeMs) * sizeMs).toISOString();
}

function rowKey(pool, bucket) {
  return [pool.chainId, pool.dexId, pool.pairAddress, bucket].join('|');
}

function compareSamples(a, b) {
  return a.capturedAt.localeCompare(b.capturedAt)
    || a.baseToken.symbol.localeCompare(b.baseToken.symbol)
    || a.quoteToken.symbol.localeCompare(b.quoteToken.symbol)
    || a.priceUsd - b.priceUsd
    || a.liquidityUsd - b.liquidityUsd
    || a.volumeH24 - b.volumeH24;
}

function compareRows(a, b) {
  return a.bucketStart.localeCompare(b.bucketStart)
    || a.chainId.localeCompare(b.chainId)
    || a.dexId.localeCompare(b.dexId)
    || a.pairAddress.localeCompare(b.pairAddress);
}

export function buildOhlcRows(pools, options = {}) {
  const bucketMinutes = Number(options.bucketMinutes ?? 60);
  if (!Number.isFinite(bucketMinutes) || bucketMinutes <= 0) {
    throw new DexwatchError('bucketMinutes must be a finite number greater than 0');
  }
  const buckets = new Map();

  for (const pool of [...pools].sort(compareSamples)) {
    const bucket = bucketStart(pool.capturedAt, bucketMinutes);
    const key = rowKey(pool, bucket);
    const previous = buckets.get(key);
    const price = pool.priceUsd;
    if (!previous) {
      buckets.set(key, {
        bucketStart: bucket,
        bucketMinutes,
        chainId: pool.chainId,
        dexId: pool.dexId,
        pairAddress: pool.pairAddress,
        baseSymbol: pool.baseToken.symbol,
        quoteSymbol: pool.quoteToken.symbol,
        open: price,
        high: price,
        low: price,
        close: price,
        liquidityUsd: pool.liquidityUsd,
        volumeH24: pool.volumeH24,
        sampleCount: 1
      });
    } else {
      previous.high = Math.max(previous.high, price);
      previous.low = Math.min(previous.low, price);
      previous.close = price;
      previous.liquidityUsd = pool.liquidityUsd;
      previous.volumeH24 = pool.volumeH24;
      previous.sampleCount += 1;
    }
  }

  return [...buckets.values()].sort(compareRows);
}
