// Strażnicy warunków startu (docs/54 pkt 12): S3 znaki towarowe, S4 wersja, S6 reguła indeksowania (ZM-06: pełna karta i własne wskazówki). Przy indeksowanie=true naruszenie przerywa build, przy false jest ostrzeżeniem. Bez sieci.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { checkTrademarks, checkVersion, checkIndexingRule, checkIndexingStart, startGuards } from '../src/straznicy.mjs';
import { build } from '../src/build.mjs';
import { readJson, ROOT } from '../src/lib.mjs';
import { requireData, tmpDist, bezPelna, tylkoPelna } from './pomoc.mjs';

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
/* S6 (ZM-06, decyzja właściciela 02.11.2026, bramka E1 wariant A): do indeksu tylko ćwiczenie z `pelna === true` z eksportu (F-20) i własnymi wskazówkami kompletnymi w języku.
   Strażnik czyta zbudowane strony niezależnie od reguły w pages.mjs (flaga `indexable` ORAZ meta robots w HTML). Brak pola = noindex (fail-closed). */
const exPage = (lang, slug, indexable, robots = indexable ? '' : 'noindex,follow') => ({ kind: 'exercise', lang, slug, indexable, file: `${lang}/exercises/${slug}/index.html`, html: robots ? `<meta name="robots" content="${robots}">` : '<title>x</title>' });
const OWN = { scope: 'own', missing: 0 };
test('S6 (02.11.2026): ćwiczenie indeksowane musi mieć pelna === true i własne wskazówki kompletne w języku — inaczej błąd przy indeksowaniu (próbka + liczba)', () => {
  const data = { pl: { exercises: [{ id: 'A', slug: 'a', pelna: true, cues: OWN }, { id: 'B', slug: 'b', pelna: false, cues: OWN }, { id: 'C', slug: 'c', cues: OWN }, { id: 'D', slug: 'd', pelna: true, cues: { scope: 'none' } }, { id: 'E', slug: 'e', pelna: true, cues: { scope: 'own', missing: 2 } }, { id: 'F', slug: 'f', pelna: 'true', cues: OWN }] } };
  const ok = checkIndexingRule({ pages: [exPage('pl', 'a', true), ...'bcdef'.split('').map(s => exPage('pl', s, false))], data, indexing: true });
  assert.deepEqual(ok.errors, []); assert.match(ok.info, /indeksowane ćwiczenia: 1/);
  for (const s of 'bcdef') {
    const r = checkIndexingRule({ pages: [exPage('pl', s, true)], data, indexing: true });
    assert.equal(r.errors.length, 1, s); assert.match(r.errors[0], /S6 warunek indeksowania/); assert.match(r.errors[0], new RegExp(`pl/${s}`));
  }
});
test('S6 (02.11.2026): strażnik nie ufa fladze — strona bez noindex w HTML liczy się jako indeksowana; strona ćwiczenia spoza danych to błąd', () => {
  const data = { pl: { exercises: [{ id: 'B', slug: 'b', pelna: false, cues: OWN }] } };
  assert.equal(checkIndexingRule({ pages: [exPage('pl', 'b', false, '')], data, indexing: true }).errors.length, 1); /* flaga false, ale HTML bez robots */
  assert.equal(checkIndexingRule({ pages: [exPage('pl', 'b', false, 'index,follow')], data, indexing: true }).errors.length, 1);
  assert.deepEqual(checkIndexingRule({ pages: [exPage('pl', 'b', false, 'noindex,follow')], data, indexing: true }).errors, []);
  assert.match(checkIndexingRule({ pages: [exPage('pl', 'zz', true)], data, indexing: true }).errors.join(), /pl\/zz/);
  assert.deepEqual(checkIndexingRule({ pages: [{ kind: 'list', lang: 'pl', indexable: true, html: '' }], data, indexing: true }).errors, []); /* tylko strony ćwiczeń */
});
test('S6 (02.11.2026): eksport bez pola „pelna” (PIN sprzed F-20) — przy indeksowaniu błąd startu, bez indeksowania ostrzeżenie; z polem choć w jednym ćwiczeniu — bez komunikatu', () => {
  const bez = { pl: { exercises: [{ id: 'A', slug: 'a', cues: OWN }] } }, z = { pl: { exercises: [{ id: 'A', slug: 'a', pelna: false, cues: OWN }] } };
  const on = checkIndexingRule({ pages: [], data: bez, indexing: true }); assert.equal(on.errors.length, 1); assert.match(on.errors[0], /bez pola „pelna”/);
  const off = checkIndexingRule({ pages: [], data: bez, indexing: false }); assert.deepEqual(off.errors, []); assert.equal(off.warnings.length, 1);
  assert.deepEqual(checkIndexingRule({ pages: [], data: z, indexing: true }), { errors: [], warnings: [], info: 'indeksowane ćwiczenia: 0' });
  /* pominięcie warunków startu (testy na danych sprzed wydania) wyłącza tylko warunek „pole w eksporcie”, nie regułę stron */
  assert.deepEqual(checkIndexingRule({ pages: [], data: bez, indexing: true, startCondition: false }).errors, []);
  assert.equal(checkIndexingRule({ pages: [exPage('pl', 'a', true)], data: bez, indexing: true, startCondition: false }).errors.length, 1);
});
test('startGuards składa strażniki S3, S4, S8 z plikami ustawień (nazwy ze wszystkich budowanych języków); przekazane pliki mają pierwszeństwo', () => {
  const d = l => ({ exercises: [{ id: 'A', name: `A-${l}`, figure: {} }] }), cfg = { indeksowanie: true, indeksowanieOd: '2027-01-15', wersjaWydania: '1.1.0' };
  const base = { cfg, pin: { ref: 'v1.1.0-b1' }, manifest: { app: { version: '1.1.0' } }, data: { pl: d('pl'), en: d('en') }, langs: ['pl', 'en'] };
  const ok = startGuards({ ...base, files: { trademark: { 'A-pl': OK, 'A-en': OK } } }); assert.deepEqual([ok.errors, ok.warnings], [[], []]);
  const bad = startGuards({ ...base, files: { trademark: { 'A-pl': OK } } }); assert.equal(bad.errors.length, 1); assert.match(bad.errors[0], /A-en/);
});

test('pliki ustawień mają znany kształt (trademark-check.json, config.json → wersjaWydania); start-wyjatki.json usunięty razem z warunkiem 709/709 (ZM-02, ZM-06, 02.11.2026)', () => {
  const t = readJson('trademark-check.json'), c = readJson('config.json'); assert.ok(!existsSync(join(ROOT, 'start-wyjatki.json')));
  assert.equal(typeof t.nazwy, 'object'); for (const [n, e] of Object.entries(t.nazwy)) { assert.ok(['sprawdzone', 'ryzyko', 'do-sprawdzenia'].includes(e.status), n); assert.match(e.data, /^\d{4}-\d{2}-\d{2}$/, n); }
  assert.equal(typeof c.wersjaWydania, 'string');
});
test('build: bez indeksowania luki to ostrzeżenia (S3, S4, S6 pole „pelna”, zamrożenie adresów), z indeksowaniem — błąd ze wszystkimi naruszeniami; CLI nie omija strażników', async () => {
  requireData();
  const pusty = { lock: {}, overrides: { nadpisania: {}, przekierowania: {} } }; /* zamrożenie podane jawnie: test nie zależy od stanu slugs.lock.json (F-16 zamroził 709 adresów 02.11.2026) */
  const w = await build({ out: tmpDist(), slugi: pusty, ...bezPelna() }); const joined = w.warnings.join('\n');
  for (const re of [/S3 znaki towarowe/, /S4 wersja/, /S6 warunek indeksowania: eksport bez pola „pelna”/, /slugs\.lock\.json jest pusty/]) assert.match(joined, re);
  await assert.rejects(build({ out: tmpDist(), cfg: { indeksowanie: true }, slugi: pusty, ...bezPelna() }), /slugs\.lock\.json jest pusty/);
  const man = readJson('.cache/dane/manifest.json'), en = JSON.parse(readFileSync(join(ROOT, '.cache/dane', man.languages.find(l => l.lang === 'en').file), 'utf8'));
  const lock = Object.fromEntries(en.exercises.map(e => [e.id, e.slug])); /* adresy zamrożone — zostają same warunki S3/S4/S6 */
  await assert.rejects(build({ out: tmpDist(), cfg: { indeksowanie: true }, slugi: { lock, overrides: { nadpisania: {}, przekierowania: {} } }, ...bezPelna() }), err => /S3 znaki towarowe/.test(err.message) && /S4 wersja/.test(err.message) && /S6 warunek indeksowania/.test(err.message));
  assert.doesNotMatch(readFileSync(join(ROOT, 'src/build.mjs'), 'utf8').split('if (process.argv[1]')[1], /pominStraznikowStartu/);
});

test('S8 start indeksowania: indeksowanie=true bez daty indeksowanieOd to błąd, z datą — zielone; bez indeksowania nic do sprawdzenia', () => {
  assert.match(checkIndexingStart({ indexing: true, from: '' }).errors[0], /S8 start indeksowania/);
  assert.equal(checkIndexingStart({ indexing: true, from: 'jutro' }).errors.length, 1);
  assert.deepEqual(checkIndexingStart({ indexing: true, from: '2027-01-15' }), { errors: [], warnings: [] });
  assert.deepEqual(checkIndexingStart({ indexing: false, from: '' }), { errors: [], warnings: [] });
});

test('S6 (02.11.2026): strażnik jest podłączony do build() na zbudowanych stronach — raport liczy indeksowane ćwiczenia; testowe wejścia build() nie są w CLI', async () => {
  requireData();
  const r = await build({ out: tmpDist(), cfg: { indeksowanie: true, jezyki: ['pl', 'en'], indeksujJezyki: ['pl', 'en'] }, pominStraznikowStartu: true, ...tylkoPelna('back-squat') });
  assert.equal(r.report.indeksowaneCwiczenia, 'indeksowane ćwiczenia: 2'); /* back-squat w pl i en (własne wskazówki kompletne) — przy odłączonym strażniku 0 */
  const off = await build({ out: tmpDist(), cfg: { jezyki: ['pl', 'en'] }, ...tylkoPelna('back-squat') }); assert.equal(off.report.indeksowaneCwiczenia, 'indeksowane ćwiczenia: 0');
  assert.doesNotMatch(readFileSync(join(ROOT, 'src/build.mjs'), 'utf8').split('if (process.argv[1]')[1], /zmianaDanych/);
});
