# Roadmap

## V1: local fixture MVP

- [x] Local DexScreener-style snapshot inspection
- [x] Chain, DEX, symbol, liquidity, and volume filters
- [x] Normalized JSON exports
- [x] OHLC-style JSON and CSV exports
- [x] Provenance metadata with input hashes
- [x] Fixture-backed unit tests and CLI smoke tests

## Near-term

- [ ] More public fixture shapes from DexScreener responses
- [ ] Golden snapshot tests for CLI output stability
- [ ] Optional NDJSON output for larger local captures
- [ ] Example backtest adapter notebook or script

## Later

- [ ] Explicit API capture recipes for common DexScreener endpoints
- [ ] Watch-mode planner that prints actions before running them
- [ ] Plugin format for downstream bot research pipelines

## Non-goals

- Trading, signing, wallet access, or order execution
- Hidden polling or hidden network calls
- Credential discovery or telemetry
