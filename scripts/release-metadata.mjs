#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const root = new URL('..', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));

const packageJson = await readJson('package.json');
const lockfile = await readJson('package-lock.json');
const releasebox = await readJson('releasebox.config.json');
const workflow = await readFile(new URL('.github/workflows/release.yml', root), 'utf8');
const changelog = await readFile(new URL('CHANGELOG.md', root), 'utf8');

const fail = (message) => {
  throw new Error(`Release metadata check failed: ${message}`);
};

if (!/^\d+\.\d+\.\d+$/.test(packageJson.version)) fail('package version must be stable semver');
if (lockfile.version !== packageJson.version) fail('lockfile root version differs from package.json');
if (lockfile.packages?.['']?.version !== packageJson.version) fail('lockfile package version differs from package.json');
if (releasebox.release?.publishNpm !== true) fail('ReleaseBox must declare npm publishing');
if (!workflow.includes('npm publish ./*.tgz --provenance --access public')) fail('release workflow must publish the packed artifact');
if (!changelog.includes(`## [${packageJson.version}]`)) fail('changelog lacks the package version');
if (!changelog.includes('[Unreleased]: https://github.com/rogerchappel/dexwatch/compare/v0.1.0...HEAD')) fail('Unreleased comparison is invalid');
if (!changelog.includes('[latest release]: https://github.com/rogerchappel/dexwatch/releases/latest')) fail('latest release link is invalid');

console.log(`Release metadata passed for dexwatch ${packageJson.version}.`);
