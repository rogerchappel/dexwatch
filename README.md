# dexwatch

Local-first DexScreener snapshot inspection for reproducible crypto-market
research, fixture-driven filters, and bot backtest inputs.

`dexwatch` is inspired by the public demand around tools such as
[`dexscraper`](https://github.com/vincentkoc/dexscraper), but it is a fresh
implementation with a narrower V1: deterministic local snapshots first, explicit
network capture only when requested, and provenance metadata for every run.

## Features

- Inspect a local DexScreener-style `snapshot.json` file or fixture directory.
- Filter pools by chain, DEX, base symbol, liquidity, and 24h volume.
- Export normalized pools, OHLC-style JSON/CSV rows, reports, and provenance.
- Run fully offline for repeatable tests and agent workflows.
- Capture URLs only with `--allow-network true` so there are no hidden calls.

## Install

Version 0.2.0 is prepared for the first npm publish. Once
`npm view dexwatch@0.2.0 version` returns `0.2.0`, install it from the public
registry (Node.js 20 or newer):

```sh
npm install -g dexwatch
```

Until that version is available, install from source:

```sh
git clone https://github.com/rogerchappel/dexwatch.git
cd dexwatch
npm install
npm link
```

## Quickstart

```sh
node src/cli.js inspect test/fixtures/eth-pairs \
  --output out/eth \
  --chain ethereum \
  --min-liquidity-usd 10000
```

Outputs:

- `pools.json` normalized pool records
- `ohlc.json` OHLC-style rows
- `ohlc.csv` spreadsheet/backtest-friendly rows
- `provenance.json` source, capture time, filters, OHLC bucket size, and input hash
- `report.txt` human-readable summary

## CLI

```sh
dexwatch --help
dexwatch inspect <snapshot.json|fixture-dir> --output <dir> [filters]
dexwatch capture <url> --output <dir> --allow-network true
```

Use `-o <dir>` as the short form of `--output <dir>` for either command.

Common filters:

```sh
--chain ethereum
--dex uniswap
--symbol WETH
--min-liquidity-usd 10000
--min-volume-h24 50000
--bucket-minutes 60
--format json
```

Liquidity and volume minimums accept finite non-negative numbers, including
decimals. The OHLC bucket size accepts any finite number greater than zero.
Invalid numeric values are rejected as usage errors before files are inspected.

OHLC samples are ordered by `capturedAt`, so `open` is the earliest price and
`close`, `liquidityUsd`, and `volumeH24` come from the latest sample. Samples
with the same timestamp are ordered by base symbol, quote symbol, price,
liquidity, then volume. Exported rows are ordered by bucket start, chain, DEX,
and pair address. These complete ordering keys make exports identical for every
permutation of the same samples.

## Library API

```js
import { inspectPath, filterPools, buildOhlcRows } from 'dexwatch';

const result = await inspectPath('test/fixtures/eth-pairs', {
  outputDir: 'out/eth',
  filters: { chains: ['ethereum'], min: { liquidityUsd: 10000 } }
});

console.log(result.summary);
```

## Safety boundaries

- `inspect` reads local files only.
- `capture` refuses to run unless `--allow-network true` is supplied.
- No credential discovery, telemetry, trading, signing, publishing, or background
  scheduling exists in V1.
- Outputs include provenance so downstream agents and backtests can explain where
  their data came from.

## Verify

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Development

Run the same checks maintainers use before opening a PR:

```sh
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

## Release process

Pushing a `v*.*.*` tag runs the release workflow. It completes
`npm run release:tag-check -- "$GITHUB_REF_NAME"` before `npm run release:check`,
then packs and publishes the verified tarball to npm with provenance and
attaches that tarball to the GitHub release. The package version must be new on
npm and match the release tag. Local release checks do not require a tag.

Maintainers must configure an npm trusted publisher for package `dexwatch`
with GitHub organization/user `rogerchappel`, repository `dexwatch`, workflow
filename `release.yml`, and no environment. The workflow uses GitHub OIDC, so
it does not require an `NPM_TOKEN` repository secret.

After merging a release-readiness change, tag the matching version and wait for
the Release workflow to complete. Verify the registry publish before announcing
the release:

```sh
npm view dexwatch@0.2.0 version
# 0.2.0
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please keep fixtures deterministic,
changes atomic, and network behavior explicit.

## Security

See [SECURITY.md](SECURITY.md). Do not use this tool for trading decisions
without independent verification.

## License

MIT
