import { normalizeAddress, normalizeSymbol, toIsoString, toNumber } from './schema.js';

export function normalizePool(pair, options = {}) {
  const fallbackCapturedAt = options.capturedAt ?? new Date(0).toISOString();
  const base = pair?.baseToken ?? {};
  const quote = pair?.quoteToken ?? {};
  const liquidity = pair?.liquidity ?? {};
  const volume = pair?.volume ?? {};
  const txns = pair?.txns ?? {};

  return {
    chainId: String(pair?.chainId ?? '').trim().toLowerCase(),
    dexId: String(pair?.dexId ?? '').trim().toLowerCase(),
    pairAddress: normalizeAddress(pair?.pairAddress),
    url: String(pair?.url ?? ''),
    baseToken: {
      address: normalizeAddress(base.address),
      name: String(base.name ?? '').trim(),
      symbol: normalizeSymbol(base.symbol)
    },
    quoteToken: {
      address: normalizeAddress(quote.address),
      name: String(quote.name ?? '').trim(),
      symbol: normalizeSymbol(quote.symbol)
    },
    priceUsd: toNumber(pair?.priceUsd),
    priceNative: toNumber(pair?.priceNative),
    liquidityUsd: toNumber(liquidity.usd),
    volumeH24: toNumber(volume.h24),
    txnsH24: toNumber(txns.h24?.buys) + toNumber(txns.h24?.sells),
    fdv: toNumber(pair?.fdv),
    marketCap: toNumber(pair?.marketCap),
    pairCreatedAt: toIsoString(pair?.pairCreatedAt, new Date(0)),
    capturedAt: toIsoString(pair?.capturedAt ?? fallbackCapturedAt, new Date(0))
  };
}

export function parseDexScreenerSnapshot(input, options = {}) {
  const capturedAt = options.capturedAt ?? input?.capturedAt ?? new Date(0).toISOString();
  const rawPairs = Array.isArray(input?.pairs) ? input.pairs : Array.isArray(input) ? input : [];
  return rawPairs.map((pair) => normalizePool(pair, { capturedAt }));
}
