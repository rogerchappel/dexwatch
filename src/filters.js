import { isNumericField } from './schema.js';

export function buildFilter(options = {}) {
  const chains = new Set((options.chains ?? []).map((chain) => String(chain).toLowerCase()));
  const dexes = new Set((options.dexes ?? []).map((dex) => String(dex).toLowerCase()));
  const symbols = new Set((options.symbols ?? []).map((symbol) => String(symbol).toUpperCase()));
  const min = options.min ?? {};
  const max = options.max ?? {};

  return (pool) => {
    if (chains.size > 0 && !chains.has(pool.chainId)) return false;
    if (dexes.size > 0 && !dexes.has(pool.dexId)) return false;
    if (symbols.size > 0 && !symbols.has(pool.baseToken.symbol)) return false;
    for (const [field, value] of Object.entries(min)) {
      if (isNumericField(field) && pool[field] < value) return false;
    }
    for (const [field, value] of Object.entries(max)) {
      if (isNumericField(field) && pool[field] > value) return false;
    }
    return true;
  };
}

export function filterPools(pools, options = {}) {
  return pools.filter(buildFilter(options));
}
