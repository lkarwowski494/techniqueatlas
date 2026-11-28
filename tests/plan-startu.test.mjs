// Plan startu (Z-00, docs/55-plan-startu.md): wymuszone odhaczanie zadań. (a) format tabeli; (b) „zrobione” wymaga daty i dowodu; (c) nie „zrobione”, gdy zadanie z kolumny „Po” nie jest;
// (d) przy indeksowanie=true wszystkie zadania etapów 0–5 „zrobione” albo „odpada” oraz Z-61 (zgoda właściciela) „zrobione”, inaczej błąd startu (build stop); przy false tylko ostrzeżenie. Bez sieci.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parsePlan, checkPlanStartu, etap, KOLUMNY } from '../src/plan-startu.mjs';
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
test('start: indeksowanie=true wymaga wszystkich zadań etapów 0–5 „zrobione” albo „odpada” (błąd); bez indeksowania ostrzeżenie; etap 6 (Z-62…Z-65, po włączeniu Google) i 7 nie blokują, ale Z-61 (zgoda właściciela) musi być „zrobione”', () => {
  const rows = [DONE('Z-00'), row('Z-02', 'Z-00', 'w toku'), row('Z-52'), row('Z-60'), row('Z-65'), row('Z-70')];
  const p = parsePlan(plan(...rows)).rows;
  const on = checkPlanStartu({ rows: p, indexing: true }), off = checkPlanStartu({ rows: p, indexing: false });
  assert.equal(on.errors.length, 2); assert.match(on.errors[0], /plan startu: 2 zadań etapów 0–5 niezrobionych \(Z-02, Z-52\)/); assert.match(on.errors[1], /Z-61.*zgod/); assert.deepEqual(on.warnings, []);
  assert.deepEqual(off.errors, []); assert.equal(off.warnings.length, 2); /* etapy 0–5 i brak zgody Z-61 */
  const zgoda = [DONE('Z-60'), row('Z-61', 'Z-60', 'zrobione', '2026-11-28', 'zgoda właściciela 28.11.2026: „Włączamy Google.”'), row('Z-65'), row('Z-70')];
  const all = parsePlan(plan(DONE('Z-00'), DONE('Z-02', 'Z-00'), ...zgoda)).rows;
  assert.deepEqual(checkPlanStartu({ rows: all, indexing: true }), { errors: [], warnings: [] }); /* Z-62…Z-65 otwarte: włączenie Google nie blokuje samo siebie, ale zgoda właściciela (Z-61) jest wymagana */
  assert.match(checkPlanStartu({ rows: [], indexing: true }).errors.join(), /pusty/);
});
test('stan „odpada” (decyzja właściciela, np. ZM-20): dozwolony; wymaga daty i powodu; liczy się jak załatwione dla S11 i dla „Po” następników; zadanie „odpada” nie sprawdza własnego „Po”', () => {
  const od = (id, po = '—', data = '2026-11-27', dowod = 'ZM-20') => row(id, po, 'odpada', data, dowod);
  assert.deepEqual(parsePlan(plan(od('Z-08'))).errors, []);
  const r = (rows, indexing = false) => checkPlanStartu({ rows: parsePlan(plan(...rows)).rows, indexing });
  assert.match(r([od('Z-08', '—', '—')]).errors.join(), /Z-08.*dat/i); assert.match(r([od('Z-08', '—', '2026-11-27', '—')]).errors.join(), /Z-08.*powod|Z-08.*dowod/i);
  assert.deepEqual(r([row('Z-07', '—', 'w toku'), od('Z-08', 'Z-07'), DONE('Z-41', 'Z-08')]).errors, []); /* „odpada” z niezrobionym „Po” i następnik „zrobione” po „odpada” */
  assert.deepEqual(r([od('Z-08'), od('Z-28', 'Z-08, Z-25')], true).errors.filter(e => /niezrobionych/.test(e)), []);
});
test('S11 punkt 1: „odpada” wymaga w Dowodzie identyfikatora decyzji (ZM-nn albo KO-nn); dowolny tekst nie przechodzi', () => {
  const r = dowod => checkPlanStartu({ rows: parsePlan(plan(row('Z-08', '—', 'odpada', '2026-11-27', dowod))).rows, indexing: false }).errors.join();
  assert.match(r('x'), /Z-08.*odpada.*identyfikator/); assert.match(r('nie robimy'), /Z-08.*identyfikator/); assert.match(r('ZM-x'), /identyfikator/);
  assert.equal(r('ZM-20 (decyzja właściciela)'), ''); assert.equal(r('wg KO-131'), '');
});
test('S11 punkt 2: indeksowanie=true wymaga Z-61 (zgoda właściciela) „zrobione” z cytatem słów właściciela w Dowodzie; bez indeksowania tylko ostrzeżenie', () => {
  const baza = [DONE('Z-00'), DONE('Z-60', 'Z-00')];
  const z = (...r) => parsePlan(plan(...baza, ...r)).rows, on = rows => checkPlanStartu({ rows, indexing: true }), off = rows => checkPlanStartu({ rows, indexing: false });
  assert.match(on(z(row('Z-61', 'Z-60'))).errors.join(), /Z-61.*zgod/); assert.deepEqual(off(z(row('Z-61', 'Z-60'))).errors, []); assert.match(off(z(row('Z-61', 'Z-60'))).warnings.join(), /Z-61.*zgod/);
  assert.match(on(z(row('Z-61', 'Z-60', 'w toku'))).errors.join(), /Z-61.*zgod/);
  assert.match(on(z(row('Z-61', 'Z-60', 'zrobione', '2026-11-28', 'zgoda'))).errors.join(), /Z-61.*cytat/);
  assert.deepEqual(on(z(row('Z-61', 'Z-60', 'zrobione', '2026-11-28', 'właściciel 28.11.2026: „Włączamy Google.”'))).errors, []);
  assert.match(on(parsePlan(plan(...baza)).rows).errors.join(), /Z-61/); /* wiersza Z-61 brak w planie: też błąd */
});
test('startGuards składa S11 plan startu (przekazane pliki mają pierwszeństwo); build() je dostaje przez startGuards', () => {
  const base = { cfg: { indeksowanie: true, wersjaWydania: '1.1.1', indeksowanieOd: '2026-12-01' }, pin: { ref: 'v1.1.1-b1' }, manifest: { app: { version: '1.1.1' } }, data: { pl: { exercises: [{ name: 'A' }] } }, langs: ['pl'] };
  const tm = { 'A': { status: 'sprawdzone', data: '2026-11-28' } };
  const ok = startGuards({ ...base, files: { trademark: tm, plan: plan(DONE('Z-00'), DONE('Z-60', 'Z-00'), row('Z-61', 'Z-60', 'zrobione', '2026-11-28', 'właściciel: „Tak.”')) } }); assert.deepEqual(ok.errors, []);
  const bad = startGuards({ ...base, files: { trademark: tm, plan: plan(row('Z-00')) } }); assert.equal(bad.errors.length, 2); assert.match(bad.errors.join(), /plan startu: 2 zadań|plan startu.*Z-61/);
});
test('docs/55-plan-startu.md: format poprawny, reguły odhaczania spełnione, zadania Z-00…Z-65 obecne, Z-08 i Z-28 „odpada” (ZM-20), Z-41 bez zależności od Z-28, S11 z progiem etapu 5 (bez zamrażania stanu — decyzja właściciela 28.11.2026: „Test pilnuje reguł”)', () => {
  const md = readFileSync(join(ROOT, 'docs/55-plan-startu.md'), 'utf8'), { rows, errors } = parsePlan(md);
  assert.deepEqual(errors, []); assert.deepEqual(checkPlanStartu({ rows, indexing: false }).errors, []);
  const ids = rows.map(r => r.id);
  const expected = ['Z-00', 'Z-01', 'Z-02', 'Z-03', 'Z-04', 'Z-05', 'Z-06', 'Z-07', 'Z-08', 'Z-10', 'Z-11', 'Z-12', 'Z-20', 'Z-21', 'Z-22', 'Z-23', 'Z-24', 'Z-25', 'Z-26', 'Z-27', 'Z-28',
    'Z-30', 'Z-31', 'Z-32', 'Z-33', 'Z-34', 'Z-35', 'Z-40', 'Z-41', 'Z-50', 'Z-51', 'Z-52', 'Z-60', 'Z-61', 'Z-62', 'Z-63', 'Z-64', 'Z-65'];
  assert.deepEqual(ids, expected);
  const odpada = ['Z-08', 'Z-28'];
  for (const r of rows) assert.equal(r.stan === 'odpada', odpada.includes(r.id), r.id);
  for (const r of rows.filter(x => odpada.includes(x.id))) { assert.equal(r.data, '2026-11-27', r.id); assert.match(r.dowod, /ZM-20/, r.id); }
  assert.deepEqual(rows.find(r => r.id === 'Z-41').po, ['Z-40']);
  /* włączenie Google (Z-60) nie blokuje samo siebie: gdy etapy 0–5 są zrobione albo odpadły, a Z-60…Z-65 otwarte, S11 przy indeksowanie=true przechodzi */
  const zrobione = r => ({ ...r, stan: 'zrobione', data: '2026-11-28', dowod: 'abc1234', po: [] });
  const gotowe = rows.map(r => etap(r.id) <= 5 && r.stan !== 'odpada' ? zrobione(r) : r);
  assert.match(checkPlanStartu({ rows: gotowe, indexing: true }).errors.join(), /Z-61/); /* etapy 0–5 mało: potrzebna zgoda właściciela */
  const zZgoda = gotowe.map(r => r.id === 'Z-60' ? zrobione(r) : r.id === 'Z-61' ? { ...zrobione(r), dowod: 'właściciel 28.11.2026: „Włączamy Google.”' } : r);
  assert.deepEqual(checkPlanStartu({ rows: zZgoda, indexing: true }).errors, []); /* Z-60 i Z-61 odhaczone w commicie PR z indeksowanie=true; Z-62…Z-65 otwarte nie blokują */
  assert.equal(zZgoda.filter(r => ['Z-62', 'Z-63', 'Z-64', 'Z-65'].includes(r.id) && r.stan !== 'otwarte').length, 0);
});
