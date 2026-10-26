// Strażnicy warunków startu (docs/54 pkt 12): S3 znaki towarowe, S4 wersja, S6 komplet figur. Przy indeksowanie=true naruszenie przerywa build, przy false jest ostrzeżeniem. Bez sieci.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkTrademarks, checkVersion, checkStartCondition, startGuards } from '../src/straznicy.mjs';
import { build } from '../src/build.mjs';
import { readJson, ROOT } from '../src/lib.mjs';
import { requireData, tmpDist } from './pomoc.mjs';

const OK = { status: 'sprawdzone', data: '2026-10-26' };

test('S3: wszystkie nazwy ze statusem „sprawdzone” i datą → zielone; brak wpisu, zły status, zła data i „do-sprawdzenia” → błąd przy indeksowaniu, ostrzeżenie bez', () => {
  const names = ['A', 'B', 'A'];
  assert.deepEqual(checkTrademarks({ names, checked: { A: OK, B: OK }, indexing: true }), { errors: [], warnings: [] });
  for (const bad of [{}, { A: OK }, { A: OK, B: { status: 'sprawdzone' } }, { A: OK, B: { status: 'sprawdzone', data: '26.10.2026' } }, { A: OK, B: { status: 'do-sprawdzenia', data: '2026-10-26' } }]) {
    const on = checkTrademarks({ names, checked: bad, indexing: true }), off = checkTrademarks({ names, checked: bad, indexing: false });
    assert.equal(on.errors.length, 1, JSON.stringify(bad)); assert.deepEqual(on.warnings, []); assert.deepEqual(off.errors, []); assert.equal(off.warnings.length, 1);
  }
});
test('S3: status „ryzyko” to osobny komunikat (nazwa do zmiany); komunikat nie wypisuje setek nazw (próbka + liczba)', () => {
  const r = checkTrademarks({ names: ['A'], checked: { A: { status: 'ryzyko', data: '2026-10-26' } }, indexing: true }); assert.match(r.errors[0], /1 nazw ze statusem „ryzyko” \(A\)/);
  const many = Array.from({ length: 300 }, (_, i) => `N${i}`), m = checkTrademarks({ names: many, checked: {}, indexing: true }).errors[0]; assert.match(m, /300 nazw/); assert.match(m, /\+295\)/); assert.ok(m.length < 300);
});
test('S4: wersja danych = wersja wydania; puste wydanie, rozjazd wersji, ref nie będący tagiem v<wersja> → błąd przy indeksowaniu, ostrzeżenie (poza tagiem) bez', () => {
  const ok = { manifestVersion: '1.1.0', releaseVersion: '1.1.0', pinRef: 'v1.1.0-b1030' };
  assert.deepEqual(checkVersion({ ...ok, indexing: true }), { errors: [], warnings: [] });
  assert.match(checkVersion({ ...ok, releaseVersion: '', indexing: true }).errors[0], /wersjaWydania jest puste/);
  assert.match(checkVersion({ ...ok, manifestVersion: '1.0.0', indexing: true }).errors[0], /dane są z wersji aplikacji 1\.0\.0, a config\.json → wersjaWydania to 1\.1\.0/);
  for (const ref of ['main', 'strona-eksport', 'v1.0.0-b5', 'v1.1', '1.1.0']) assert.match(checkVersion({ ...ok, pinRef: ref, indexing: true }).errors.join(''), /nie jest tagiem wydania v1\.1\.0/, ref);
  const off = checkVersion({ ...ok, manifestVersion: '1.0.0', pinRef: 'main', indexing: false }); assert.deepEqual(off.errors, []); assert.equal(off.warnings.length, 1);
  assert.deepEqual(checkVersion({ ...ok, pinRef: 'main', indexing: false }), { errors: [], warnings: [] }); /* ref ma znaczenie dopiero przy publikacji */
});
test('S6: komplet figur → zielone; brak figury bez wyjątku → błąd (liczba i próbka); wyjątek z powodem wystarcza; wyjątek bez powodu, zbędny albo dla nieznanego id → błąd', () => {
  const E = [{ id: 'A', figure: {} }, { id: 'B', figure: null }, { id: 'C', figure: null }];
  assert.deepEqual(checkStartCondition({ exercises: [E[0]], indexing: true }).errors, []);
  const none = checkStartCondition({ exercises: E, indexing: true }); assert.match(none.errors[0], /figury ma 1 z 3 ćwiczeń; brak figury i wyjątku z powodem: 2 \(B, C\)/); assert.equal(none.info, 'figury: 1/3');
  assert.deepEqual(checkStartCondition({ exercises: E, exceptions: { B: 'ruch bez rodziny figur', C: 'poza zakresem 1.1' }, indexing: true }).errors, []);
  assert.match(checkStartCondition({ exercises: E, exceptions: { B: '  ', C: 'x' }, indexing: true }).errors.join(), /„B”/);
  assert.match(checkStartCondition({ exercises: E, exceptions: { B: 'a', C: 'b', A: 'c' }, indexing: true }).errors.join(), /„A” jest zbędny/);
  assert.match(checkStartCondition({ exercises: E, exceptions: { B: 'a', C: 'b', Z: 'c' }, indexing: true }).errors.join(), /nieznanego ćwiczenia „Z”/);
  const off = checkStartCondition({ exercises: E, indexing: false }); assert.deepEqual(off.errors, []); assert.equal(off.warnings.length, 1);
});
test('startGuards składa trzy strażniki z plikami ustawień (nazwy ze wszystkich budowanych języków); przekazane pliki mają pierwszeństwo', () => {
  const d = l => ({ exercises: [{ id: 'A', name: `A-${l}`, figure: {} }] }), cfg = { indeksowanie: true, wersjaWydania: '1.1.0' };
  const base = { cfg, pin: { ref: 'v1.1.0-b1' }, manifest: { app: { version: '1.1.0' } }, data: { pl: d('pl'), en: d('en') }, langs: ['pl', 'en'] };
  const ok = startGuards({ ...base, files: { trademark: { 'A-pl': OK, 'A-en': OK }, wyjatki: {} } }); assert.deepEqual([ok.errors, ok.warnings, ok.info], [[], [], 'figury: 1/1']);
  const bad = startGuards({ ...base, files: { trademark: { 'A-pl': OK }, wyjatki: {} } }); assert.equal(bad.errors.length, 1); assert.match(bad.errors[0], /A-en/);
});

test('pliki ustawień mają znany kształt (trademark-check.json, start-wyjatki.json, config.json → wersjaWydania)', () => {
  const t = readJson('trademark-check.json'), w = readJson('start-wyjatki.json'), c = readJson('config.json');
  assert.equal(typeof t.nazwy, 'object'); for (const [n, e] of Object.entries(t.nazwy)) { assert.ok(['sprawdzone', 'ryzyko', 'do-sprawdzenia'].includes(e.status), n); assert.match(e.data, /^\d{4}-\d{2}-\d{2}$/, n); }
  assert.equal(typeof w.wyjatki, 'object'); for (const [id, why] of Object.entries(w.wyjatki)) assert.ok(typeof why === 'string' && why.trim(), id);
  assert.equal(typeof c.wersjaWydania, 'string');
});
test('build: bez indeksowania luki to ostrzeżenia (S3, S4, S6, zamrożenie adresów), z indeksowaniem — błąd ze wszystkimi naruszeniami; CLI nie omija strażników', async () => {
  requireData();
  const w = await build({ out: tmpDist() }); const joined = w.warnings.join('\n');
  for (const re of [/S3 znaki towarowe/, /S4 wersja/, /S6 warunek startu/, /slugs\.lock\.json jest pusty/]) assert.match(joined, re);
  await assert.rejects(build({ out: tmpDist(), cfg: { indeksowanie: true } }), /slugs\.lock\.json jest pusty/);
  const man = readJson('.cache/dane/manifest.json'), en = JSON.parse(readFileSync(join(ROOT, '.cache/dane', man.languages.find(l => l.lang === 'en').file), 'utf8'));
  const lock = Object.fromEntries(en.exercises.map(e => [e.id, e.slug])); /* adresy zamrożone — zostają same warunki S3/S4/S6 */
  await assert.rejects(build({ out: tmpDist(), cfg: { indeksowanie: true }, slugi: { lock, overrides: { nadpisania: {}, przekierowania: {} } } }), err => /S3 znaki towarowe/.test(err.message) && /S4 wersja/.test(err.message) && /S6 warunek startu/.test(err.message));
  assert.doesNotMatch(readFileSync(join(ROOT, 'src/build.mjs'), 'utf8').split('if (process.argv[1]')[1], /pominStraznikowStartu/);
});
