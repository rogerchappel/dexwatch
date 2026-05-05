# Contributing to dexwatch

Thanks for helping make deterministic market-data workflows easier to review.

## Development setup

```sh
npm install
npm test
npm run smoke
```

## Contribution expectations

- Keep changes small and reviewable.
- Prefer fixture-backed behavior over live-network assumptions.
- Add or update tests for parsers, filters, exports, and CLI behavior.
- Keep provenance fields stable unless a breaking change is intentional.
- Do not add telemetry, credential lookup, trading actions, or hidden network
  calls.

## Commit style

Use Conventional Commits where practical:

- `feat:` user-visible behavior
- `fix:` bug fixes
- `test:` tests and fixtures
- `docs:` documentation and examples
- `chore:` repository maintenance

## Pull request checklist

Before opening a PR, run:

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

Include the fixture or command used to verify any CLI output change.
