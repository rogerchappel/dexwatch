#!/usr/bin/env node
import { parseCliArgs } from './args.js';
import { captureUrl } from './capture.js';
import { DexwatchError } from './errors.js';
import { inspectPath } from './inspect.js';
import { formatHumanReport } from './report.js';

const HELP = `dexwatch - deterministic local DexScreener snapshot inspection

Usage:
  dexwatch inspect <snapshot.json|fixture-dir> --output <dir> [filters]
  dexwatch capture <url> --output <dir> --allow-network true

Filters:
  --chain <id>                 Keep one chain (repeatable)
  --dex <id>                   Keep one dex (repeatable)
  --symbol <base>              Keep one base token symbol (repeatable)
  --min-liquidity-usd <number> Minimum pool liquidity (finite, >= 0)
  --min-volume-h24 <number>    Minimum 24h volume (finite, >= 0)
  --bucket-minutes <number>    OHLC bucket size (finite, > 0), default 60
  --format json|text           Stdout format, default text

Safety:
  inspect reads local files only. capture requires --allow-network true.
`;

export async function runCli(argv = process.argv.slice(2), io = { stdout: process.stdout, stderr: process.stderr }) {
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    io.stdout.write(HELP);
    return 0;
  }

  try {
    const options = parseCliArgs(argv);
    if (options.command === 'inspect') {
      if (!options.input) throw new DexwatchError('inspect requires an input path', { code: 'USAGE' });
      const result = await inspectPath(options.input, options);
      if (options.format === 'json') io.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      else io.stdout.write(formatHumanReport({ pools: result.pools, ohlcRows: result.ohlcRows, provenance: result.provenance }));
      return 0;
    }
    if (options.command === 'capture') {
      if (!options.input) throw new DexwatchError('capture requires a URL', { code: 'USAGE' });
      const result = await captureUrl(options.input, options);
      io.stdout.write(`captured ${result.rawText.length} bytes at ${result.capturedAt}\n`);
      return 0;
    }
    throw new DexwatchError(`Unknown command: ${options.command}`, { code: 'USAGE' });
  } catch (error) {
    io.stderr.write(`dexwatch: ${error.message}\n`);
    return error instanceof DexwatchError && error.code === 'USAGE' ? 2 : 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await runCli();
}
