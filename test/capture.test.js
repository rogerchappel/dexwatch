import assert from 'node:assert/strict';
import test from 'node:test';
import packageJson from '../package.json' with { type: 'json' };
import { captureUrl } from '../src/capture.js';

test('capture identifies requests with the package version', async (t) => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, options });
    return new Response('{}', { status: 200 });
  });

  await captureUrl('https://example.test/snapshot.json', { allowNetwork: true });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://example.test/snapshot.json');
  assert.equal(requests[0].options.headers['user-agent'], `dexwatch/${packageJson.version}`);
});
