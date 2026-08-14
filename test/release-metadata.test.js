import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const runMetadata = (...args) => spawnSync(
  process.execPath,
  ['scripts/release-metadata.mjs', ...args],
  { cwd: new URL('..', import.meta.url), encoding: 'utf8' },
);

test('release metadata supports local checks without a tag', () => {
  const result = runMetadata();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Release metadata passed for dexwatch 0\.2\.0\./);
});

test('release metadata accepts the matching stable version tag', () => {
  const result = runMetadata('--tag', 'v0.2.0');
  assert.equal(result.status, 0, result.stderr);
});

test('release metadata rejects a tag for another package version', () => {
  const result = runMetadata('--tag', 'v9.9.9');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /release tag v9\.9\.9 differs from package version v0\.2\.0/);
});

test('release metadata rejects a missing tag value', () => {
  const result = runMetadata('--tag');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--tag requires a release tag/);
});

for (const tag of ['0.2.0', 'v0.2', 'v0.2.0-beta.1']) {
  test(`release metadata rejects malformed tag ${tag}`, () => {
    const result = runMetadata('--tag', tag);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /release tag must be stable semver prefixed with v/);
  });
}
