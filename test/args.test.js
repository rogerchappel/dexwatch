import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCliArgs } from '../src/args.js';

for (const command of ['inspect', 'capture']) {
  test(`parses -o as the ${command} output directory`, () => {
    const options = parseCliArgs([command, 'input', '-o', 'requested-output']);
    assert.equal(options.input, 'input');
    assert.equal(options.outputDir, 'requested-output');
  });

  test(`rejects extra positional arguments for ${command}`, () => {
    assert.throws(
      () => parseCliArgs([command, 'input', 'extra']),
      { code: 'USAGE', message: 'Unexpected argument: extra' }
    );
  });
}
