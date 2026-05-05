# Release candidate readiness

## Summary
- Branch prepared for release-candidate readiness review.
- Local verification status: **PASS**
- Detailed command output is captured in `.rc_check.log`.

## Checks run
1. `npm run release:check`
2. `bash scripts/validate.sh`
3. `node /Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js check .`

## Result
```
npm notice 2.3kB src/cli.js
npm notice 416B src/csv.js
npm notice 348B src/errors.js
npm notice 1.1kB src/filters.js
npm notice 506B src/index.js
npm notice 1.5kB src/inspect.js
npm notice 965B src/io.js
npm notice 1.7kB src/normalize.js
npm notice 1.6kB src/ohlc.js
npm notice 454B src/provenance.js
npm notice 1.0kB src/report.js
npm notice 1.0kB src/schema.js
npm notice Tarball Details
npm notice name: dexwatch
npm notice version: 0.1.0
npm notice filename: dexwatch-0.1.0.tgz
npm notice package size: 7.4 kB
npm notice unpacked size: 20.8 kB
npm notice shasum: 68b1dcc30f0def5a82d4e71d9bb07c76927dcd29
npm notice integrity: sha512-ZLYWLLQrgYlYt[...]ip3tsif19eNkA==
npm notice total files: 19
npm notice
dexwatch-0.1.0.tgz
PASS: package script: release:check
NOTE: agent-qc not installed; skipping optional agent check

Validation passed.

## releasebox
✅ releasebox config: node-cli
✅ ci workflow: .github/workflows/ci.yml
✅ release dry run workflow: .github/workflows/release-dry-run.yml
✅ task breakdown: docs/TASKS.md
✅ orchestration plan: docs/ORCHESTRATION.md
✅ dependabot config: .github/dependabot.yml
✅ npm test script: node --test
✅ build script: node scripts/build.js
✅ smoke script: node scripts/smoke.js
✅ bin entry: {"dexwatch":"./src/cli.js"}
RESULT release_check=0 validate=0 releasebox=0
```
