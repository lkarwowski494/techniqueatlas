// `npm test`: cały przebieg node --test w świeżym katalogu tymczasowym (TMPDIR) i strażnik po przebiegu (02.11.2026):
// jeśli w nim zostanie jakikolwiek atlas-* (np. pełny build strony ok. 500 MB z tmpDist()), przebieg kończy się błędem z listą — a katalog i tak jest usuwany,
// żeby pozostałości nie zapełniły dysku (01.11.2026: 85 × atlas-dist-*, ok. 40 GB). Argumenty przekazywane do node --test (domyślnie tests/*.test.mjs).
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = mkdtempSync(join(tmpdir(), 'atlas-test-run-'));
let kod = 1;
try {
  const args = process.argv.slice(2), pliki = args.some(a => !a.startsWith('-')) ? [] : ['tests/*.test.mjs'];
  const r = spawnSync(process.execPath, ['--test', ...args, ...pliki], { stdio: 'inherit', env: { ...process.env, TMPDIR: run, TMP: run, TEMP: run } });
  kod = r.status ?? 1;
  const zostalo = readdirSync(run).filter(n => n.startsWith('atlas-'));
  if (zostalo.length) { console.error(`\nstrażnik sprzątania: po testach zostało ${zostalo.length} katalogów w katalogu tymczasowym (${zostalo.join(', ')}) — użyj tmpDist()/tmpDir() z tests/pomoc.mjs`); kod = kod || 1; }
} finally { rmSync(run, { recursive: true, force: true }); }
process.exit(kod);
