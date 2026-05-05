#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

node src/cli.js inspect test/fixtures/eth-pairs \
  --output examples/out/ethereum \
  --chain ethereum \
  --min-liquidity-usd 10000 \
  --format text
