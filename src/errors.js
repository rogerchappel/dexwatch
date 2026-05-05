export class DexwatchError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'DexwatchError';
    this.code = options.code ?? 'DEXWATCH_ERROR';
    this.details = options.details;
  }
}

export function invariant(condition, message, options) {
  if (!condition) throw new DexwatchError(message, options);
}
