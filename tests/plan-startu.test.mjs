// Plan startu (Z-00, docs/55-plan-startu.md): wymuszone odhaczanie zadań. (a) format tabeli; (b) „zrobione” wymaga daty i dowodu; (c) nie „zrobione”, gdy zadanie z kolumny „Po” nie jest;
// (d) przy indeksowanie=true wszystkie zadania etapów 0–6 „zrobione”, inaczej błąd startu (build stop); przy false tylko ostrzeżenie. Bez sieci.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parsePlan, checkPlanStartu, KOLUMNY } from '../src/plan-startu.mjs';
import { startGuards } from '../src/straznicy.mjs';
import { ROOT } from '../src/lib.mjs';

const HEAD = '| ID | Zadanie | Rola | Model | Czas | Po | Stan | Data | Dowód |\n|---|---|---|---|---|---|---|---|---|\n';
const row = (id, po = '—', stan = 'otwarte', data = '—', dowod = '—') => `| ${id} | zadanie ${id} | 08 | sonnet | 1 h | ${po} | ${stan} | ${data} | ${dowod} |\n`;
const plan = (...rows) => `# Plan\n\n${HEAD}${rows.join('')}`;
const DONE = (id, po) => row(id, po, 'zrobione', '2026-11-28', 'abc1234');

test('format: nagłówek z kolumnami ID…Dowód; wiersze rozpoznane; zły nagłówek, zły stan, zły ID, zduplikowany ID, nieznane „Po” → błąd', () => {
  assert.deepEqual(KOLUMNY, ['ID', 'Zadanie', 'Rola', 'Model', 'Czas', 'Po', 'Stan', 'Data', 'Dowód']);
  const ok = parsePlan(plan(row('Z-00'), row('Z-02', 'Z-00', 'w toku')));
  assert.deepEqual(ok.errors, []); assert.deepEqual(ok.rows.map(r => [r.id, r.po, r.stan]), [['Z-00', [], 'otwarte'], ['Z-02', ['Z-00'], 'w toku']]);
  assert.match(parsePlan('# Plan\n\nbrak tabeli').errors.join(), /brak tabeli/);
  assert.match(parsePlan(plan(row('Z-00', '—', 'gotowe'))).errors.join(), /Z-00.*Stan/);
  assert.match(parsePlan(plan(row('X-1'))).errors.join(), /X-1.*ID/);
  assert.match(parsePlan(plan(row('Z-00'), row('Z-00'))).errors.join(), /Z-00.*zduplikowany/);
  assert.match(parsePlan(plan(row('Z-00', 'Z-99'))).errors.join(), /Z-00.*nieznane.*Z-99/);
  assert.match(parsePlan(plan(row('Z-00', 'Z-00'))).errors.join(), /Z-00.*samo/);
});
test('„zrobione” wymaga daty RRRR-MM-DD i dowodu (test czerwony na brakującym dowodzie)', () => {
  const r = rows => checkPlanStartu({ rows: parsePlan(plan(...rows)).rows, indexing: false });
  assert.deepEqual(r([DONE('Z-00')]).errors, []);
  assert.match(r([row('Z-00', '—', 'zrobione', '2026-11-28', '—')]).errors.join(), /Z-00.*dowod/i);
  assert.match(r([row('Z-00', '—', 'zrobione', '—', 'abc1234')]).errors.join(), /Z-00.*dat/i);
  assert.match(r([row('Z-00', '—', 'zrobione', '28.11.2026', 'abc1234')]).errors.join(), /Z-00.*dat/i);
  assert.deepEqual(r([row('Z-00', '—', 'w toku', '2026-11-27')]).errors, []);
});
test('zależności: „zrobione” nie może mieć w „Po” zadania niezrobionego', () => {
  const r = rows => checkPlanStartu({ rows: parsePlan(plan(...rows)).rows, indexing: false });
  assert.match(r([row('Z-00'), DONE('Z-02', 'Z-00')]).errors.join(), /Z-02.*Z-00/);
  assert.deepEqual(r([DONE('Z-00'), DONE('Z-02', 'Z-00')]).errors, []);
  assert.deepEqual(r([row('Z-00', '—', 'w toku'), row('Z-02', 'Z-00')]).errors, []); /* niezrobione zadania nie są sprawdzane */
});
test('start: indeksowanie=true wymaga wszystkich zadań etapów 0–6 „zrobione” (błąd); bez indeksowania ostrzeżenie; etap 7 (Z-7x) nie blokuje', () => {
  const rows = [DONE('Z-00'), row('Z-02', 'Z-00', 'w toku'), row('Z-65'), row('Z-70')];
  const p = parsePlan(plan(...rows)).rows;
  const on = checkPlanStartu({ rows: p, indexing: true }), off = checkPlanStartu({ rows: p, indexing: false });
  assert.equal(on.errors.length, 1); assert.match(on.errors[0], /plan startu: 2 zadań etapów 0–6 niezrobionych \(Z-02, Z-65\)/); assert.deepEqual(on.warnings, []);
  assert.deepEqual(off.errors, []); assert.equal(off.warnings.length, 1);
  const all = parsePlan(plan(DONE('Z-00'), DONE('Z-02', 'Z-00'), row('Z-70'))).rows;
  assert.deepEqual(checkPlanStartu({ rows: all, indexing: true }), { errors: [], warnings: [] });
  assert.match(checkPlanStartu({ rows: [], indexing: true }).errors.join(), /pusty/);
});
test('startGuards składa S11 plan startu (przekazane pliki mają pierwszeństwo); build() je dostaje przez startGuards', () => {
  const base = { cfg: { indeksowanie: true, wersjaWydania: '1.1.1', indeksowanieOd: '2026-12-01' }, pin: { ref: 'v1.1.1-b1' }, manifest: { app: { version: '1.1.1' } }, data: { pl: { exercises: [{ name: 'A' }] } }, langs: ['pl'] };
  const tm = { 'A': { status: 'sprawdzone', data: '2026-11-28' } };
  const ok = startGuards({ ...base, files: { trademark: tm, plan: plan(DONE('Z-00')) } }); assert.deepEqual(ok.errors, []);
  const bad = startGuards({ ...base, files: { trademark: tm, plan: plan(row('Z-00')) } }); assert.equal(bad.errors.length, 1); assert.match(bad.errors[0], /plan startu/);
});
test('stan startowy docs/55-plan-startu.md: format poprawny, brak „zrobione”, zadania Z-00…Z-65 obecne, „w toku” zgodnie z poleceniem koordynatora', () => {
  const md = readFileSync(join(ROOT, 'docs/55-plan-startu.md'), 'utf8'), { rows, errors } = parsePlan(md);
  assert.deepEqual(errors, []); assert.deepEqual(checkPlanStartu({ rows, indexing: false }).errors, []);
  const ids = rows.map(r => r.id);
  const expected = ['Z-00', 'Z-01', 'Z-02', 'Z-03', 'Z-04', 'Z-05', 'Z-06', 'Z-07', 'Z-08', 'Z-10', 'Z-11', 'Z-12', 'Z-20', 'Z-21', 'Z-22', 'Z-23', 'Z-24', 'Z-25', 'Z-26', 'Z-27', 'Z-28',
    'Z-30', 'Z-31', 'Z-32', 'Z-33', 'Z-34', 'Z-35', 'Z-40', 'Z-41', 'Z-50', 'Z-51', 'Z-52', 'Z-60', 'Z-61', 'Z-62', 'Z-63', 'Z-64', 'Z-65'];
  assert.deepEqual(ids, expected);
  const wToku = ['Z-00', 'Z-01', 'Z-02', 'Z-03', 'Z-04', 'Z-06', 'Z-07', 'Z-20', 'Z-21', 'Z-24'];
  for (const r of rows) assert.equal(r.stan, wToku.includes(r.id) ? 'w toku' : 'otwarte', r.id);
});
