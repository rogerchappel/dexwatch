# Security policy

## Supported versions

`dexwatch` is pre-1.0. Security fixes target the latest release on `main` until
formal release branches exist.

## Reporting a vulnerability

Please open a private GitHub security advisory or email the maintainer listed on
the GitHub repository. Include:

- affected version or commit
- reproduction steps
- expected and actual behavior
- whether local files, network capture, or generated outputs are involved

## Safety model

`dexwatch inspect` is local-first: it reads an explicit file or fixture directory
and writes outputs only to the requested output path.

`dexwatch capture` is intentionally opt-in and requires `--allow-network true`.
The project should not add hidden network calls, background jobs, credential
scraping, telemetry, signing, trading, or publishing behavior.

## Data handling

Fixtures may contain public market data only. Do not commit private API keys,
wallet material, credentials, or proprietary datasets.
