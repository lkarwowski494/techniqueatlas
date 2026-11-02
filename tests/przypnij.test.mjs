// Ponowne przypięcie danych strony jednym poleceniem (`npm run przypnij -- <skrót> [--ref <gałąź|tag>]`): zmienia tylko PIN.json, odrzuca skrót inny niż pełny (40 znaków).
import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { przypnij } from '../src/przypnij.mjs';
import { readJson, ROOT } from '../src/lib.mjs';
import { tmpDir } from './pomoc.mjs';

const A = 'a'.repeat(40), B = 'b'.repeat(40), PIN = { _opis: 'x', repoAplikacji: 'o/r', ref: 'integracja-1-1', commit: A };

test('przypnij: podmienia commit, zachowuje pozostałe pola; --ref zmienia też ref', () => {
  assert.deepEqual(przypnij(PIN, B), { ...PIN, commit: B });
  assert.deepEqual(przypnij(PIN, B, 'v1.1.0-b1'), { ...PIN, ref: 'v1.1.0-b1', commit: B });
});
test('przypnij: skrót krótki, wielkie litery, puste, z białymi znakami i zły ref → błąd (PIN bez zmian)', () => {
  for (const bad of ['', undefined, 'fba531d', B.toUpperCase(), B + ' ', B.slice(1), B + 'b']) assert.throws(() => przypnij(PIN, bad), /pełny skrót/, String(bad));
  for (const ref of ['', 'a b', 'a;b', '$(x)']) assert.throws(() => przypnij(PIN, B, ref), /ref/, ref);
});
test('polecenie `npm run przypnij`: jedno wywołanie zmienia tylko commit w PIN.json (kopia repo w katalogu tymczasowym), PIN.json kończy się nową linią', () => {
  const dir = tmpDir('atlas-pin-'); mkdirSync(join(dir, 'src'));
  for (const f of ['src/przypnij.mjs', 'src/lib.mjs', 'PIN.json', 'package.json']) copyFileSync(join(ROOT, f), join(dir, f));
  execFileSync('node', [join(dir, 'src/przypnij.mjs'), B], { cwd: dir, stdio: 'pipe' });
  const after = JSON.parse(readFileSync(join(dir, 'PIN.json'), 'utf8')), before = readJson('PIN.json');
  assert.deepEqual(after, { ...before, commit: B }); assert.ok(readFileSync(join(dir, 'PIN.json'), 'utf8').endsWith('}\n'));
  assert.match(JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts.przypnij, /src\/przypnij\.mjs/);
  writeFileSync(join(dir, 'PIN.json'), JSON.stringify(before)); assert.throws(() => execFileSync('node', [join(dir, 'src/przypnij.mjs'), 'fba531d'], { cwd: dir, stdio: 'pipe' }));
});
