export function summarizePools(pools) {
  const chains = new Map();
  let liquidityUsd = 0;
  let volumeH24 = 0;

  for (const pool of pools) {
    chains.set(pool.chainId, (chains.get(pool.chainId) ?? 0) + 1);
    liquidityUsd += pool.liquidityUsd;
    volumeH24 += pool.volumeH24;
  }

  return {
    poolCount: pools.length,
    chains: Object.fromEntries([...chains.entries()].sort()),
    liquidityUsd,
    volumeH24
  };
}

export function formatHumanReport({ pools, ohlcRows, provenance }) {
  const summary = summarizePools(pools);
  const chainLine = Object.entries(summary.chains).map(([chain, count]) => `${chain}:${count}`).join(', ') || 'none';
  return [
    'dexwatch inspect report',
    `source: ${provenance.source}`,
    `captured: ${provenance.capturedAt}`,
    `pools: ${summary.poolCount}`,
    `chains: ${chainLine}`,
    `liquidityUsd: ${summary.liquidityUsd.toFixed(2)}`,
    `volumeH24: ${summary.volumeH24.toFixed(2)}`,
    `ohlcRows: ${ohlcRows.length}`
  ].join('\n') + '\n';
}
