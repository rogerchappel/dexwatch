# dexwatch docs

- [PRD](PRD.md) defines the local-first V1 contract.
- [TASKS](TASKS.md) tracks implementation waves.
- [ORCHESTRATION](ORCHESTRATION.md) captures repository automation context.

## V1 data flow

1. Start from a local DexScreener-style JSON fixture or explicitly captured URL.
2. Normalize pool fields into stable JavaScript objects.
3. Apply deterministic filters.
4. Build OHLC-style buckets from captured timestamps.
5. Write JSON, CSV, report, and provenance outputs.

The default path has no network behavior.
