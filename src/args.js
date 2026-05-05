function readValue(args, index, flag) {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
  return value;
}

export function parseCliArgs(argv) {
  const [command, ...rest] = argv;
  const options = { command, filters: { chains: [], dexes: [], symbols: [], min: {}, max: {} } };
  const positionals = [];

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }
    const value = readValue(rest, index, arg);
    index += 1;
    if (arg === '--output' || arg === '-o') options.outputDir = value;
    else if (arg === '--format') options.format = value;
    else if (arg === '--chain') options.filters.chains.push(value);
    else if (arg === '--dex') options.filters.dexes.push(value);
    else if (arg === '--symbol') options.filters.symbols.push(value);
    else if (arg === '--min-liquidity-usd') options.filters.min.liquidityUsd = Number(value);
    else if (arg === '--min-volume-h24') options.filters.min.volumeH24 = Number(value);
    else if (arg === '--bucket-minutes') options.bucketMinutes = Number(value);
    else if (arg === '--allow-network') options.allowNetwork = value === 'true' || value === '1' || value === 'yes';
    else throw new Error(`Unknown option: ${arg}`);
  }

  options.input = positionals[0];
  return options;
}
