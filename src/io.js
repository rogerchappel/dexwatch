import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { DexwatchError } from './errors.js';

export async function readJsonSource(inputPath) {
  const resolved = resolve(inputPath);
  const info = await stat(resolved);
  const jsonPath = info.isDirectory() ? join(resolved, 'snapshot.json') : resolved;
  const rawText = await readFile(jsonPath, 'utf8');
  try {
    return { source: jsonPath, rawText, json: JSON.parse(rawText) };
  } catch (error) {
    throw new DexwatchError(`Invalid JSON in ${jsonPath}: ${error.message}`, { code: 'INVALID_JSON' });
  }
}

export async function ensureOutputDir(outputDir) {
  await mkdir(outputDir, { recursive: true });
  return resolve(outputDir);
}

export async function writeJson(path, data) {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function writeText(path, text) {
  await writeFile(path, text, 'utf8');
}
