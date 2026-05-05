import { writeFile } from 'node:fs/promises';
import { ensureOutputDir } from './io.js';
import { buildProvenance } from './provenance.js';

export async function captureUrl(url, options = {}) {
  if (options.allowNetwork !== true) {
    throw new Error('captureUrl requires allowNetwork: true. dexwatch never performs hidden network calls.');
  }
  const capturedAt = options.capturedAt ?? new Date().toISOString();
  const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'dexwatch/0.1' } });
  if (!response.ok) throw new Error(`Fetch failed with HTTP ${response.status}`);
  const rawText = await response.text();
  JSON.parse(rawText);

  if (options.outputDir) {
    const outputDir = await ensureOutputDir(options.outputDir);
    await writeFile(`${outputDir}/snapshot.json`, rawText.endsWith('\n') ? rawText : `${rawText}\n`, 'utf8');
    const provenance = buildProvenance({ source: url, rawText, capturedAt, options: { network: true } });
    await writeFile(`${outputDir}/provenance.json`, `${JSON.stringify(provenance, null, 2)}\n`, 'utf8');
  }

  return { capturedAt, rawText };
}
