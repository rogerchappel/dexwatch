import { createHash } from 'node:crypto';

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function buildProvenance({ source, rawText, capturedAt, options = {} }) {
  return {
    tool: 'dexwatch',
    source,
    capturedAt,
    inputSha256: sha256(rawText),
    network: options.network === true ? 'explicit' : 'none',
    filters: options.filters ?? {},
    warnings: options.warnings ?? []
  };
}
