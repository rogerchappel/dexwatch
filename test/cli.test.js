import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { isCliEntrypoint, runCli } from '../src/cli.js';

test('recognizes an installed binary symlink as the CLI entrypoint', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dexwatch-cli-test-'));
  const link = join(directory, 'dexwatch');
  try {
    await symlink(resolve('src/cli.js'), link);
    assert.equal(isCliEntrypoint(link), true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('prints help without side effects', async () => {
  let stdout = '';
  const code = await runCli(['--help'], { stdout: { write: (chunk) => { stdout += chunk; } }, stderr: { write: () => {} } });
  assert.equal(code, 0);
  assert.match(stdout, /dexwatch inspect/);
});

test('rejects hidden network capture', async () => {
  let stderr = '';
  const code = await runCli(['capture', 'https://example.test/data.json'], { stdout: { write: () => {} }, stderr: { write: (chunk) => { stderr += chunk; } } });
  assert.equal(code, 2);
  assert.match(stderr, /requires allowNetwork/);
});

test('rejects invalid stdout formats as usage errors', async () => {
  let stderr = '';
  const code = await runCli(['inspect', 'test/fixtures/eth-pairs', '--format', 'xml'], { stdout: { write: () => {} }, stderr: { write: (chunk) => { stderr += chunk; } } });
  assert.equal(code, 2);
  assert.match(stderr, /--format must be json or text/);
});

for (const [flag, values, constraint] of [
  ['--bucket-minutes', ['0', '-5', 'nope', 'Infinity'], 'finite number greater than 0'],
  ['--min-liquidity-usd', ['-1', 'nope', 'Infinity'], 'finite number greater than or equal to 0'],
  ['--min-volume-h24', ['-0.1', 'nope', 'Infinity'], 'finite number greater than or equal to 0']
]) {
  for (const value of values) {
    test(`rejects invalid numeric value ${flag} ${value} as a usage error`, async () => {
      let stderr = '';
      const code = await runCli(
        ['inspect', 'test/fixtures/eth-pairs', flag, value],
        { stdout: { write: () => {} }, stderr: { write: (chunk) => { stderr += chunk; } } }
      );
      assert.equal(code, 2);
      assert.match(stderr, new RegExp(`${flag} must be a ${constraint}`));
      assert.doesNotMatch(stderr, /Invalid time value/);
    });
  }
}

test('accepts decimal and integer numeric option values', async () => {
  let stderr = '';
  const code = await runCli(
    ['inspect', 'test/fixtures/eth-pairs', '--bucket-minutes', '15', '--min-liquidity-usd', '10000.5', '--min-volume-h24', '0'],
    { stdout: { write: () => {} }, stderr: { write: (chunk) => { stderr += chunk; } } }
  );
  assert.equal(code, 0);
  assert.equal(stderr, '');
});

test('inspect -o writes artifacts to the requested directory', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dexwatch-cli-output-'));
  const outputDir = join(directory, 'inspect');
  try {
    const code = await runCli(
      ['inspect', 'test/fixtures/eth-pairs', '-o', outputDir],
      { stdout: { write: () => {} }, stderr: { write: () => {} } }
    );
    assert.equal(code, 0);
    assert.match(await readFile(join(outputDir, 'report.txt'), 'utf8'), /dexwatch inspect report/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('capture -o writes artifacts to the requested directory', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'dexwatch-cli-output-'));
  const outputDir = join(directory, 'capture');
  t.mock.method(globalThis, 'fetch', async () => new Response('{"pairs":[]}'));
  try {
    const code = await runCli(
      ['capture', 'https://example.test/snapshot.json', '-o', outputDir, '--allow-network', 'true'],
      { stdout: { write: () => {} }, stderr: { write: () => {} } }
    );
    assert.equal(code, 0);
    assert.deepEqual(JSON.parse(await readFile(join(outputDir, 'snapshot.json'), 'utf8')), { pairs: [] });
    assert.equal(JSON.parse(await readFile(join(outputDir, 'provenance.json'), 'utf8')).source, 'https://example.test/snapshot.json');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

for (const command of ['inspect', 'capture']) {
  test(`${command} rejects extra positional arguments without writing output`, async () => {
    const directory = await mkdtemp(join(tmpdir(), 'dexwatch-cli-invalid-'));
    const outputDir = join(directory, command);
    let stderr = '';
    try {
      const code = await runCli(
        [command, 'input', 'extra', '-o', outputDir, '--allow-network', 'true'],
        { stdout: { write: () => {} }, stderr: { write: (chunk) => { stderr += chunk; } } }
      );
      assert.equal(code, 2);
      assert.match(stderr, /Unexpected argument: extra/);
      await assert.rejects(access(outputDir), { code: 'ENOENT' });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}
