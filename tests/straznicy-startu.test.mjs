// Strażnicy warunków startu (docs/54 pkt 12): S3 znaki towarowe, S4 wersja, S6 reguła indeksowania (ZM-08, P-1: własne wskazówki kompletne w języku, bez wymogu pełnej karty). Przy indeksowanie=true naruszenie przerywa build, przy false jest ostrzeżeniem. Bez sieci.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { checkTrademarks, checkVersion, checkIndexingRule, checkIndexingStart, startGuards } from '../src/straznicy.mjs';
import { build } from '../src/build.mjs';
import { readJson, ROOT } from '../src/lib.mjs';
import { requireData, tmpDist } from './pomoc.mjs';

const OK = { status: 'sprawdzone', data: '2026-10-26' };

/* S3 (KO-128, decyzja właściciela 27.11.2026, ZM-20): „Nie robimy tego.” — nazwy ćwiczeń nie są sprawdzane pod kątem znaków towarowych, brak wpisu w trademark-check.json nie blokuje indeksowania.
   Zostaje blokada wpisanego statusu „ryzyko” (jeśli ktoś ją wpisze, nazwa do zmiany). Zapis „przez analogię do weta”. */
test('S3 (27.11.2026, ZM-20): brak wpisu, zły status, zła data i „do-sprawdzenia” nie blokują ani nie ostrzegają — także przy indeksowaniu; wpisane „ryzyko” blokuje przy indeksowaniu (ostrzeżenie bez)', () => {
  const names = ['A', 'B', 'A'];
  for (const bad of [{}, { A: OK }, { A: OK, B: { status: 'sprawdzone' } }, { A: OK, B: { status: 'sprawdzone', data: '26.10.2026' } }, { A: OK, B: { status: 'do-sprawdzenia', data: '2026-10-26' } }, { A: OK, B: OK }])
    for (const indexing of [true, false]) assert.deepEqual(checkTrademarks({ names, checked: bad, indexing }), { errors: [], warnings: [] }, JSON.stringify(bad));
  const risk = { A: OK, B: { status: 'ryzyko', data: '2026-10-26' } };
  const on = checkTrademarks({ names, checked: risk, indexing: true }), off = checkTrademarks({ names, checked: risk, indexing: false });
  assert.equal(on.errors.length, 1); assert.match(on.errors[0], /1 nazw ze statusem „ryzyko” \(B\)/); assert.deepEqual(on.warnings, []); assert.deepEqual(off.errors, []); assert.equal(off.warnings.length, 1);
});
test('S3 (27.11.2026, ZM-20): komunikat „ryzyko” nie wypisuje setek nazw (próbka + liczba)', () => {
  const many = Array.from({ length: 300 }, (_, i) => `N${i}`), checked = Object.fromEntries(many.map(n => [n, { status: 'ryzyko', data: '2026-11-27' }]));
  const m = checkTrademarks({ names: many, checked, indexing: true }).errors[0]; assert.match(m, /300 nazw/); assert.match(m, /\+295\)/); assert.ok(m.length < 300);
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
/* S6 (ZM-08, decyzja właściciela 27.11.2026, P-1; odwraca ZM-06): do indeksu tylko ćwiczenie z własnymi wskazówkami kompletnymi w języku (`cues.scope === 'own'`, `missing` = 0); pełna karta (`pelna`) nie jest wymagana.
   Strażnik czyta zbudowane strony niezależnie od reguły w pages.mjs (flaga `indexable` ORAZ meta robots w HTML). */
const exPage = (lang, slug, indexable, robots = indexable ? '' : 'noindex,follow') => ({ kind: 'exercise', lang, slug, indexable, file: `${lang}/exercises/${slug}/index.html`, html: robots ? `<meta name="robots" content="${robots}">` : '<title>x</title>' });
const OWN = { scope: 'own', missing: 0 };
test('S6 (27.11.2026, P-1): ćwiczenie indeksowane musi mieć własne wskazówki kompletne w języku; pełna karta (pelna) nie ma znaczenia — inaczej błąd przy indeksowaniu (próbka + liczba)', () => {
  const data = { pl: { exercises: [{ id: 'A', slug: 'a', pelna: true, cues: OWN }, { id: 'B', slug: 'b', pelna: false, cues: OWN }, { id: 'C', slug: 'c', cues: OWN }, { id: 'D', slug: 'd', pelna: true, cues: { scope: 'none' } }, { id: 'E', slug: 'e', pelna: true, cues: { scope: 'own', missing: 2 } }, { id: 'F', slug: 'f', pelna: true, cues: { scope: 'general' } }] } };
  const ok = checkIndexingRule({ pages: ['a', 'b', 'c'].map(s => exPage('pl', s, true)).concat('def'.split('').map(s => exPage('pl', s, false))), data, indexing: true });
  assert.deepEqual(ok.errors, []); assert.match(ok.info, /indeksowane ćwiczenia: 3/);
  for (const s of 'def') {
    const r = checkIndexingRule({ pages: [exPage('pl', s, true)], data, indexing: true });
    assert.equal(r.errors.length, 1, s); assert.match(r.errors[0], /S6 warunek indeksowania/); assert.match(r.errors[0], new RegExp(`pl/${s}`));
  }
});
test('S6 (02.11.2026): strażnik nie ufa fladze — strona bez noindex w HTML liczy się jako indeksowana; strona ćwiczenia spoza danych to błąd', () => {
  const data = { pl: { exercises: [{ id: 'B', slug: 'b', pelna: true, cues: { scope: 'general' } }] } };
  assert.equal(checkIndexingRule({ pages: [exPage('pl', 'b', false, '')], data, indexing: true }).errors.length, 1); /* flaga false, ale HTML bez robots */
  assert.equal(checkIndexingRule({ pages: [exPage('pl', 'b', false, 'index,follow')], data, indexing: true }).errors.length, 1);
  assert.deepEqual(checkIndexingRule({ pages: [exPage('pl', 'b', false, 'noindex,follow')], data, indexing: true }).errors, []);
  assert.match(checkIndexingRule({ pages: [exPage('pl', 'zz', true)], data, indexing: true }).errors.join(), /pl\/zz/);
  assert.deepEqual(checkIndexingRule({ pages: [{ kind: 'list', lang: 'pl', indexable: true, html: '' }], data, indexing: true }).errors, []); /* tylko strony ćwiczeń */
});
test('S6 (27.11.2026, P-1): brak pola „pelna” w eksporcie nie jest naruszeniem — ćwiczenie z własnymi wskazówkami jest indeksowane, bez błędu i bez ostrzeżenia', () => {
  const bez = { pl: { exercises: [{ id: 'A', slug: 'a', cues: OWN }] } };
  for (const indexing of [true, false]) assert.deepEqual(checkIndexingRule({ pages: [exPage('pl', 'a', true)], data: bez, indexing }), { errors: [], warnings: [], info: 'indeksowane ćwiczenia: 1' });
  assert.deepEqual(checkIndexingRule({ pages: [], data: bez, indexing: true }), { errors: [], warnings: [], info: 'indeksowane ćwiczenia: 0' });
});
test('startGuards składa strażniki S3, S4, S8, S11 z plikami ustawień (nazwy ze wszystkich budowanych języków); przekazane pliki mają pierwszeństwo', () => {
  const d = l => ({ exercises: [{ id: 'A', name: `A-${l}`, figure: {} }] }), cfg = { indeksowanie: true, indeksowanieOd: '2027-01-15', wersjaWydania: '1.1.0' };
  const base = { cfg, pin: { ref: 'v1.1.0-b1' }, manifest: { app: { version: '1.1.0' } }, data: { pl: d('pl'), en: d('en') }, langs: ['pl', 'en'] };
  /* S11 (Z-00, 27.11.2026): plan startu jest częścią startGuards; test podaje plan w całości „zrobiony”, żeby sprawdzać S3 niezależnie od stanu docs/55 */
  const plan = '| ID | Zadanie | Rola | Model | Czas | Po | Stan | Data | Dowód |\n|---|---|---|---|---|---|---|---|---|\n| Z-00 | x | 08 | sonnet | 1 h | — | zrobione | 2026-11-28 | abc1234 |\n';
  const ok = startGuards({ ...base, files: { trademark: { 'A-pl': OK, 'A-en': OK }, plan } }); assert.deepEqual([ok.errors, ok.warnings], [[], []]);
  const brak = startGuards({ ...base, files: { trademark: { 'A-pl': OK }, plan } }); assert.deepEqual([brak.errors, brak.warnings], [[], []]); /* ZM-20: brak wpisu nie blokuje */
  const bad = startGuards({ ...base, files: { trademark: { 'A-pl': OK, 'A-en': { status: 'ryzyko', data: '2026-11-27' } }, plan } }); assert.equal(bad.errors.length, 1); assert.match(bad.errors[0], /A-en/); /* wpisane „ryzyko” (nazwy ze wszystkich języków) blokuje */
});

test('pliki ustawień mają znany kształt (trademark-check.json, config.json → wersjaWydania); start-wyjatki.json usunięty razem z warunkiem 709/709 (ZM-02, ZM-06, 02.11.2026)', () => {
  const t = readJson('trademark-check.json'), c = readJson('config.json'); assert.ok(!existsSync(join(ROOT, 'start-wyjatki.json')));
  assert.equal(typeof t.nazwy, 'object'); for (const [n, e] of Object.entries(t.nazwy)) { assert.ok(['sprawdzone', 'ryzyko', 'do-sprawdzenia'].includes(e.status), n); assert.match(e.data, /^\d{4}-\d{2}-\d{2}$/, n); }
  assert.equal(typeof c.wersjaWydania, 'string');
});
test('build: bez indeksowania luki to ostrzeżenia (S4, S11 plan startu, zamrożenie adresów), z indeksowaniem — błąd ze wszystkimi naruszeniami; CLI nie omija strażników', async () => {
  requireData();
  const pusty = { lock: {}, overrides: { nadpisania: {}, przekierowania: {} } }; /* zamrożenie podane jawnie: test nie zależy od stanu slugs.lock.json */
  const stare = { wersjaWydania: '1.0.0' }; /* dane są z tagu 1.1.1: rozjazd wersji wywołuje S4 niezależnie od stanu config.json */
  const w = await build({ out: tmpDist(), cfg: stare, slugi: pusty }); const joined = w.warnings.join('\n');
  for (const re of [/S4 wersja/, /plan startu: \d+ zadań etapów 0–6 niezrobionych/, /slugs\.lock\.json jest pusty/]) assert.match(joined, re);
  assert.doesNotMatch(joined, /S3|S6/); /* S3 wyłączony: ZM-20 */ /* P-1: brak pola „pelna” ani pełnej karty nie jest naruszeniem */
  await assert.rejects(build({ out: tmpDist(), cfg: { ...stare, indeksowanie: true }, slugi: pusty }), /slugs\.lock\.json jest pusty/);
  const man = readJson('.cache/dane/manifest.json'), en = JSON.parse(readFileSync(join(ROOT, '.cache/dane', man.languages.find(l => l.lang === 'en').file), 'utf8'));
  const lock = Object.fromEntries(en.exercises.map(e => [e.id, e.slug])); /* adresy zamrożone — zostają same warunki S4/S11 */
  await assert.rejects(build({ out: tmpDist(), cfg: { ...stare, indeksowanie: true }, slugi: { lock, overrides: { nadpisania: {}, przekierowania: {} } } }), err => /S4 wersja/.test(err.message) && /plan startu/.test(err.message) && !/S3|S6/.test(err.message));
  assert.doesNotMatch(readFileSync(join(ROOT, 'src/build.mjs'), 'utf8').split('if (process.argv[1]')[1], /pominStraznikowStartu/);
});

test('S8 start indeksowania: indeksowanie=true bez daty indeksowanieOd to błąd, z datą — zielone; bez indeksowania nic do sprawdzenia', () => {
  assert.match(checkIndexingStart({ indexing: true, from: '' }).errors[0], /S8 start indeksowania/);
  assert.equal(checkIndexingStart({ indexing: true, from: 'jutro' }).errors.length, 1);
  assert.deepEqual(checkIndexingStart({ indexing: true, from: '2027-01-15' }), { errors: [], warnings: [] });
  assert.deepEqual(checkIndexingStart({ indexing: false, from: '' }), { errors: [], warnings: [] });
});

test('S6 (27.11.2026, P-1): strażnik jest podłączony do build() na zbudowanych stronach — raport liczy indeksowane ćwiczenia (własne wskazówki kompletne, w obu językach); testowe wejścia build() nie są w CLI', async () => {
  requireData();
  const r = await build({ out: tmpDist(), cfg: { indeksowanie: true, jezyki: ['pl', 'en'], indeksujJezyki: ['pl', 'en'] }, pominStraznikowStartu: true });
  const man = readJson('.cache/dane/manifest.json'), own = l => JSON.parse(readFileSync(join(ROOT, '.cache/dane', man.languages.find(x => x.lang === l).file), 'utf8')).exercises.filter(e => e.cues.scope === 'own' && !e.cues.missing).length;
  assert.equal(r.report.indeksowaneCwiczenia, `indeksowane ćwiczenia: ${own('pl') + own('en')}`); /* tag 1.1.1: 310 na język */
  assert.equal(own('pl'), 310); assert.equal(own('en'), 310);
  const off = await build({ out: tmpDist(), cfg: { jezyki: ['pl', 'en'] } }); assert.equal(off.report.indeksowaneCwiczenia, 'indeksowane ćwiczenia: 0');
  assert.doesNotMatch(readFileSync(join(ROOT, 'src/build.mjs'), 'utf8').split('if (process.argv[1]')[1], /zmianaDanych/);
});
