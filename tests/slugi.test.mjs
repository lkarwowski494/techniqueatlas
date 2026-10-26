// Adresy ćwiczeń (docs/54 pkt 4): zamrożenie (slugs.lock.json), nadpisania i przekierowania (slug-overrides.json); zmiana adresu bez wpisu zatrzymuje build; stary adres działa jako przekierowanie.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { effectiveSlugs, checkSlugLock, freeze, remapSlugs, SLUG_RE, SLUG_MAX } from '../src/slugi.mjs';
import { build } from '../src/build.mjs';
import { readJson, CACHE } from '../src/lib.mjs';
import { requireData, tmpDist, distFiles, BEZ_STARTU } from './pomoc.mjs';

requireData();
const ex = (id, slug) => ({ id, slug, alternatives: [] });
const cur = (...p) => new Map(p);

test('pliki ustawień: slugs.lock.json i slug-overrides.json istnieją, mają znany kształt, a wpisy są poprawnymi adresami', () => {
  const lock = readJson('slugs.lock.json'), ov = readJson('slug-overrides.json');
  assert.equal(typeof lock.slugi, 'object'); assert.equal(typeof ov.nadpisania, 'object'); assert.equal(typeof ov.przekierowania, 'object');
  for (const s of [...Object.values(lock.slugi), ...Object.values(ov.nadpisania), ...Object.keys(ov.przekierowania)]) { assert.match(s, SLUG_RE); assert.ok(s.length <= SLUG_MAX); }
});
test('zamrożenie vs bieżące dane: jeśli plik zamrożenia ma wpisy, każdy zgadza się z danymi albo ma przekierowanie (adres, który działał, nie znika po cichu)', () => {
  const lock = readJson('slugs.lock.json').slugi, ov = readJson('slug-overrides.json'), man = readJson('.cache/dane/manifest.json');
  const en = JSON.parse(readFileSync(join(CACHE, `dane/${man.languages.find(l => l.lang === 'en').file}`), 'utf8'));
  const eff = effectiveSlugs(en.exercises, ov.nadpisania); assert.deepEqual(eff.errors, []);
  assert.deepEqual(checkSlugLock({ current: eff.slugs, lock, redirects: ov.przekierowania, indexing: false }).errors, []);
});

test('effectiveSlugs: nadpisanie zmienia slug; nieistniejące id, zły adres i kolizja to błędy', () => {
  const list = [ex('A', 'a'), ex('B', 'b')];
  assert.deepEqual([...effectiveSlugs(list, { A: 'a-old' }).slugs], [['A', 'a-old'], ['B', 'b']]);
  assert.match(effectiveSlugs(list, { Z: 'z' }).errors[0], /nieistniejącego/);
  assert.match(effectiveSlugs(list, { A: 'Zły Adres' }).errors[0], /nie spełnia reguły/);
  assert.match(effectiveSlugs(list, { A: 'x'.repeat(81) }).errors[0], /nie spełnia reguły/);
  assert.match(effectiveSlugs(list, { A: 'b' }).errors[0], /kolizja adresów: „b”/);
  assert.match(effectiveSlugs([ex('A', 'same'), ex('B', 'same')], {}).errors[0], /kolizja/); /* kolizja z samego eksportu też zatrzymuje */
});
test('checkSlugLock: bez zmian — brak błędów; zmiana adresu bez przekierowania — błąd z dwiema drogami; z przekierowaniem — zielone', () => {
  const lock = { A: 'a-old' };
  assert.deepEqual(checkSlugLock({ current: cur(['A', 'a-old']), lock }).errors, []);
  const e = checkSlugLock({ current: cur(['A', 'a-new']), lock }).errors; assert.equal(e.length, 1); assert.match(e[0], /zmienił się z a-old na a-new bez przekierowania/); assert.match(e[0], /nadpisania/); assert.match(e[0], /przekierowania/);
  const ok = checkSlugLock({ current: cur(['A', 'a-new']), lock, redirects: { 'a-old': 'A' } }); assert.deepEqual(ok.errors, []); assert.deepEqual(ok.redirects, [{ from: 'a-old', to: 'a-new' }]);
  assert.match(checkSlugLock({ current: cur(['A', 'a-new']), lock, redirects: { 'a-old': 'B' } }).errors.join('\n'), /bez przekierowania|nie jest ćwiczeniem/); /* przekierowanie na inne ćwiczenie nie tłumaczy zmiany */
});
test('checkSlugLock: ćwiczenie usunięte wymaga przekierowania (na zastępcze albo „lista”); przekierowanie nie może zasłonić żywej strony ani wskazywać nieistniejącego celu', () => {
  const lock = { A: 'a', B: 'b' };
  assert.match(checkSlugLock({ current: cur(['B', 'b']), lock }).errors[0], /zniknęło z danych bez przekierowania/);
  const r = checkSlugLock({ current: cur(['B', 'b']), lock, redirects: { a: 'lista' } }); assert.deepEqual(r.errors, []); assert.deepEqual(r.redirects, [{ from: 'a', to: null }]);
  assert.deepEqual(checkSlugLock({ current: cur(['B', 'b']), lock, redirects: { a: 'B' } }).redirects, [{ from: 'a', to: 'b' }]);
  assert.match(checkSlugLock({ current: cur(['B', 'b']), lock, redirects: { a: 'Z' } }).errors.join('\n'), /cel „Z” nie jest ćwiczeniem/);
  assert.match(checkSlugLock({ current: cur(['A', 'a'], ['B', 'b']), lock, redirects: { b: 'A' } }).errors.join('\n'), /zasłania żywą stronę/);
  assert.match(checkSlugLock({ current: cur(['B', 'b']), lock: { B: 'b' }, redirects: { 'Zły': 'B' } }).errors.join('\n'), /nie jest poprawnym adresem/);
});
test('checkSlugLock: pusty lub niepełny plik zamrożenia — błąd przy indeksowaniu, ostrzeżenie bez; nowe ćwiczenie dostaje to samo', () => {
  const empty = i => checkSlugLock({ current: cur(['A', 'a']), lock: {}, indexing: i });
  assert.match(empty(true).errors[0], /pusty/); assert.deepEqual(empty(false).errors, []); assert.match(empty(false).warnings[0], /pusty/);
  const fresh = i => checkSlugLock({ current: cur(['A', 'a'], ['N', 'n']), lock: { A: 'a' }, indexing: i });
  assert.match(fresh(true).errors[0], /„N” \(n\) nie ma zamrożonego adresu/); assert.deepEqual(fresh(false).errors, []); assert.equal(fresh(false).warnings.length, 1);
});
test('freeze: dopisuje nowe, zachowuje usunięte, aktualizuje zmienione tylko z przekierowaniem (inaczej błąd i nic nie jest zapisane), wynik posortowany', () => {
  assert.deepEqual(freeze({ current: cur(['B', 'b'], ['A', 'a']), lock: { Z: 'z' } }), { lock: { A: 'a', B: 'b', Z: 'z' }, errors: [] });
  assert.match(freeze({ current: cur(['A', 'a2']), lock: { A: 'a' } }).errors[0], /bez przekierowania/);
  assert.deepEqual(freeze({ current: cur(['A', 'a2']), lock: { A: 'a' }, redirects: { a: 'A' } }), { lock: { A: 'a2' }, errors: [] });
});
test('remapSlugs: slug, zamienniki, klucze figur i sylwetek przechodzą na nowy adres we wszystkich językach; bez zmian — te same obiekty', () => {
  const data = { en: { exercises: [{ id: 'A', slug: 'a', alternatives: ['b'] }, { id: 'B', slug: 'b', alternatives: ['a'] }] } }, figs = { a: 1, b: 2 }, sil = { levels: { a: [1], b: [2] } };
  const same = remapSlugs({ data, figs, sil }, new Map([['a', 'a'], ['b', 'b']])); assert.equal(same.data, data);
  const r = remapSlugs({ data, figs, sil }, new Map([['a', 'z'], ['b', 'b']]));
  assert.deepEqual(r.data.en.exercises, [{ id: 'A', slug: 'z', alternatives: ['b'] }, { id: 'B', slug: 'b', alternatives: ['z'] }]); assert.deepEqual(r.figs, { z: 1, b: 2 }); assert.deepEqual(r.sil.levels, { z: [1], b: [2] });
  assert.equal(data.en.exercises[0].slug, 'a'); /* wejście bez zmian */
});

const first = async () => {
  const man = readJson('.cache/dane/manifest.json'); const en = JSON.parse(readFileSync(join(CACHE, `dane/${man.languages.find(l => l.lang === 'en').file}`), 'utf8'));
  return en.exercises.find(e => e.id === 'Back Squat');
};
test('build: zmiana adresu względem zamrożenia bez wpisu przerywa budowanie; nadpisanie zachowuje stary adres we wszystkich stronach (zamienniki, figura, sylwetka)', async () => {
  const sq = await first();
  const lock = { [sq.id]: 'back-squat-old' };
  await assert.rejects(build({ out: tmpDist(), slugi: { lock, overrides: { nadpisania: {}, przekierowania: {} } } }), /zmienił się z back-squat-old na back-squat bez przekierowania/);
  const r = await build({ out: tmpDist(), slugi: { lock, overrides: { nadpisania: { [sq.id]: 'back-squat-old' }, przekierowania: {} } } });
  assert.ok(existsSync(join(r.out, 'en/exercises/back-squat-old/index.html'))); assert.ok(!existsSync(join(r.out, 'en/exercises/back-squat/index.html')));
  assert.ok(existsSync(join(r.out, 'assets/fig/back-squat-old.js'))); assert.ok(existsSync(join(r.out, 'assets/poz/back-squat-old.svg')));
  const h = readFileSync(join(r.out, 'en/exercises/back-squat-old/index.html'), 'utf8'); assert.match(h, /assets\/poz\/back-squat-old\.svg#start/); assert.match(h, /class="sylwetki /);
  for (const f of distFiles(r.out).filter(f => /exercises\/[^/]+\/index\.html$/.test(f))) assert.doesNotMatch(readFileSync(f, 'utf8'), /exercises\/back-squat\/|"\.\.\/back-squat\/"/);
});
test('build: przeniesiony adres zostaje jako przekierowanie (meta refresh 0 s + canonical na nowy adres) w każdym budowanym języku; usunięte → lista; poza mapami witryny', async () => {
  const sq = await first();
  const slugi = { lock: { [sq.id]: 'old-squat', 'Usuniete Cwiczenie': 'removed-one' }, overrides: { nadpisania: {}, przekierowania: { 'old-squat': sq.id, 'removed-one': 'lista' } } };
  const r = await build({ out: tmpDist(), cfg: { indeksowanie: true }, slugi, ...BEZ_STARTU }); const dom = readJson('config.json').domena;
  for (const l of ['pl', 'en']) {
    const h = readFileSync(join(r.out, `${l}/exercises/old-squat/index.html`), 'utf8');
    assert.match(h, /<meta http-equiv="refresh" content="0;url=\.\.\/back-squat\/">/); assert.ok(h.includes(`<link rel="canonical" href="${dom}/${l}/exercises/back-squat/">`)); assert.match(h, /<a href="\.\.\/back-squat\/"[^>]*>Back Squat<\/a>/);
    assert.doesNotMatch(h, /noindex|hreflang=/);
    const g = readFileSync(join(r.out, `${l}/exercises/removed-one/index.html`), 'utf8'); assert.match(g, /<meta http-equiv="refresh" content="0;url=\.\.\/">/); assert.ok(g.includes(`<link rel="canonical" href="${dom}/${l}/exercises/">`));
    assert.ok(!readFileSync(join(r.out, `sitemap-${l}.xml`), 'utf8').includes('old-squat'));
  }
  const off = await build({ out: tmpDist(), slugi }); assert.match(readFileSync(join(off.out, 'en/exercises/old-squat/index.html'), 'utf8'), /<meta name="robots" content="noindex,nofollow">/);
});
test('build: pusty plik zamrożenia — ostrzeżenie bez indeksowania, błąd przy indeksowaniu (adresy muszą być zamrożone przed publikacją)', async () => {
  const slugi = { lock: {}, overrides: { nadpisania: {}, przekierowania: {} } };
  const w = await build({ out: tmpDist(), slugi }); assert.ok(w.warnings.some(x => /slugs\.lock\.json jest pusty/.test(x)));
  await assert.rejects(build({ out: tmpDist(), cfg: { indeksowanie: true }, slugi }), /slugs\.lock\.json jest pusty/);
});
