import test from 'node:test';
import assert from 'node:assert/strict';
import { runCli } from '../src/cli.js';

test('prints help without side effects', async () => {
  let stdout = '';
  const code = await runCli(['--help'], { stdout: { write: (chunk) => { stdout += chunk; } }, stderr: { write: () => {} } });
  assert.equal(code, 0);
  assert.match(stdout, /dexwatch inspect/);
});

test('rejects hidden network capture', async () => {
  let stderr = '';
  const code = await runCli(['capture', 'https://example.test/data.json'], { stdout: { write: () => {} }, stderr: { write: (chunk) => { stderr += chunk; } } });
  assert.equal(code, 1);
  assert.match(stderr, /requires allowNetwork/);
});
