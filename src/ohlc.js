import { DexwatchError } from './errors.js';

function bucketStart(isoTimestamp, bucketMinutes) {
  const sizeMs = bucketMinutes * 60 * 1000;
  const ms = new Date(isoTimestamp).getTime();
  return new Date(Math.floor(ms / sizeMs) * sizeMs).toISOString();
}

function rowKey(pool, bucket) {
  return [pool.chainId, pool.dexId, pool.pairAddress, bucket].join('|');
}

export function buildOhlcRows(pools, options = {}) {
  const bucketMinutes = Number(options.bucketMinutes ?? 60);
  if (!Number.isFinite(bucketMinutes) || bucketMinutes <= 0) {
    throw new DexwatchError('bucketMinutes must be a finite number greater than 0');
  }
  const buckets = new Map();

  for (const pool of pools) {
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

  return [...buckets.values()].sort((a, b) => a.bucketStart.localeCompare(b.bucketStart) || a.chainId.localeCompare(b.chainId));
}
