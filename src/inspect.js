import { join } from 'node:path';
import { toCsv } from './csv.js';
import { filterPools } from './filters.js';
import { readJsonSource, ensureOutputDir, writeJson, writeText } from './io.js';
import { parseDexScreenerSnapshot } from './normalize.js';
import { buildOhlcRows } from './ohlc.js';
import { buildProvenance } from './provenance.js';
import { formatHumanReport, summarizePools } from './report.js';

export async function inspectPath(inputPath, options = {}) {
  const capturedAt = options.capturedAt ?? new Date().toISOString();
  const { source, rawText, json } = await readJsonSource(inputPath);
  const allPools = parseDexScreenerSnapshot(json, { capturedAt });
  const pools = filterPools(allPools, options.filters ?? {});
  const ohlcRows = buildOhlcRows(pools, { bucketMinutes: options.bucketMinutes ?? 60 });
  const provenance = buildProvenance({ source, rawText, capturedAt, options: { filters: options.filters ?? {} } });
  const result = { summary: summarizePools(pools), pools, ohlcRows, provenance };

  if (options.outputDir) {
    const outputDir = await ensureOutputDir(options.outputDir);
    await writeJson(join(outputDir, 'pools.json'), pools);
    await writeJson(join(outputDir, 'ohlc.json'), ohlcRows);
    await writeText(join(outputDir, 'ohlc.csv'), toCsv(ohlcRows));
    await writeJson(join(outputDir, 'provenance.json'), provenance);
    await writeText(join(outputDir, 'report.txt'), formatHumanReport({ pools, ohlcRows, provenance }));
  }

  return result;
}
