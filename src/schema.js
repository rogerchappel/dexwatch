const NUMERIC_FIELDS = new Set(['priceUsd', 'liquidityUsd', 'volumeH24', 'txnsH24', 'fdv', 'marketCap']);

export function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toIsoString(value, fallbackDate = new Date(0)) {
  if (value === null || value === undefined || value === '') return fallbackDate.toISOString();
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  return Number.isNaN(date.getTime()) ? fallbackDate.toISOString() : date.toISOString();
}

export function normalizeAddress(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function normalizeSymbol(value, fallback = 'UNKNOWN') {
  const symbol = String(value ?? '').trim();
  return symbol.length > 0 ? symbol.toUpperCase() : fallback;
}

export function isNumericField(field) {
  return NUMERIC_FIELDS.has(field);
}
