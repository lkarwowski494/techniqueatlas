// Adresy ćwiczeń (docs/54 pkt 4): zamrożenie (slugs.lock.json), nadpisania i przekierowania (slug-overrides.json); zmiana adresu bez wpisu zatrzymuje build; stary adres działa jako przekierowanie.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { effectiveSlugs, checkSlugLock, checkRedirectRemoval, REDIRECT_MIN_DAYS, freeze, remapSlugs, SLUG_RE, SLUG_MAX } from '../src/slugi.mjs';
import { build } from '../src/build.mjs';
import { readJson, CACHE, ROOT } from '../src/lib.mjs';
import { requireData, tmpDist, distFiles, BEZ_STARTU } from './pomoc.mjs';

requireData();
const ex = (id, slug) => ({ id, slug, alternatives: [] });
const cur = (...p) => new Map(p);
const R = to => ({ do: to, od: '2026-11-01' }); /* wpis przekierowania: cel + data dodania */

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
  const ok = checkSlugLock({ current: cur(['A', 'a-new']), lock, redirects: { 'a-old': R('A') } }); assert.deepEqual(ok.errors, []); assert.deepEqual(ok.redirects, [{ from: 'a-old', to: 'a-new' }]);
  assert.match(checkSlugLock({ current: cur(['A', 'a-new']), lock, redirects: { 'a-old': R('B') } }).errors.join('\n'), /bez przekierowania|nie jest ćwiczeniem/); /* przekierowanie na inne ćwiczenie nie tłumaczy zmiany */
});
test('checkSlugLock: ćwiczenie usunięte wymaga przekierowania (na zastępcze albo „lista”); przekierowanie nie może zasłonić żywej strony ani wskazywać nieistniejącego celu', () => {
  const lock = { A: 'a', B: 'b' };
  assert.match(checkSlugLock({ current: cur(['B', 'b']), lock }).errors[0], /zniknęło z danych bez przekierowania/);
  const r = checkSlugLock({ current: cur(['B', 'b']), lock, redirects: { a: R('lista') } }); assert.deepEqual(r.errors, []); assert.deepEqual(r.redirects, [{ from: 'a', to: null }]);
  assert.deepEqual(checkSlugLock({ current: cur(['B', 'b']), lock, redirects: { a: R('B') } }).redirects, [{ from: 'a', to: 'b' }]);
  assert.match(checkSlugLock({ current: cur(['B', 'b']), lock, redirects: { a: R('Z') } }).errors.join('\n'), /cel „Z” nie jest ćwiczeniem/);
  assert.match(checkSlugLock({ current: cur(['A', 'a'], ['B', 'b']), lock, redirects: { b: R('A') } }).errors.join('\n'), /zasłania żywą stronę/);
  assert.match(checkSlugLock({ current: cur(['B', 'b']), lock: { B: 'b' }, redirects: { 'Zły': R('B') } }).errors.join('\n'), /nie jest poprawnym adresem/);
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
  assert.deepEqual(freeze({ current: cur(['A', 'a2']), lock: { A: 'a' }, redirects: { a: R('A') } }), { lock: { A: 'a2' }, errors: [] });
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
  if (sq.figure) { assert.ok(existsSync(join(r.out, 'assets/fig/back-squat-old.js'))); assert.ok(existsSync(join(r.out, 'assets/poz/back-squat-old.svg'))); } else assert.ok(!existsSync(join(r.out, 'assets/fig/back-squat-old.js')), 'eksport bez figury back-squat (figury czekają na recenzję): moduł figury nie powstaje');
  const h = readFileSync(join(r.out, 'en/exercises/back-squat-old/index.html'), 'utf8'); if (sq.figure) assert.match(h, /assets\/poz\/back-squat-old\.svg#start/); assert.match(h, /class="sylwetki /);
  for (const f of distFiles(r.out).filter(f => /exercises\/[^/]+\/index\.html$/.test(f))) assert.doesNotMatch(readFileSync(f, 'utf8'), /exercises\/back-squat\/|"\.\.\/back-squat\/"/);
});
test('build: przeniesiony adres zostaje jako przekierowanie (meta refresh 0 s + canonical na nowy adres) w każdym budowanym języku; usunięte → lista; poza mapami witryny', async () => {
  const sq = await first();
  const slugi = { lock: { [sq.id]: 'old-squat', 'Usuniete Cwiczenie': 'removed-one' }, overrides: { nadpisania: {}, przekierowania: { 'old-squat': R(sq.id), 'removed-one': R('lista') } } };
  const r = await build({ out: tmpDist(), cfg: { indeksowanie: true }, slugi, ...BEZ_STARTU }); const dom = readJson('config.json').domena;
  for (const l of ['pl', 'en']) {
    const h = readFileSync(join(r.out, `${l}/exercises/old-squat/index.html`), 'utf8');
    assert.ok(h.includes(`<meta http-equiv="refresh" content="0;url=${dom}/${l}/exercises/back-squat/">`), 'meta refresh: pełny adres z domeną'); assert.ok(h.includes(`<link rel="canonical" href="${dom}/${l}/exercises/back-squat/">`)); assert.match(h, /<a href="\.\.\/back-squat\/"[^>]*>Back Squat<\/a>/);
    assert.doesNotMatch(h, /noindex|hreflang=/);
    const g = readFileSync(join(r.out, `${l}/exercises/removed-one/index.html`), 'utf8'); assert.ok(g.includes(`<meta http-equiv="refresh" content="0;url=${dom}/${l}/exercises/">`)); assert.ok(g.includes(`<link rel="canonical" href="${dom}/${l}/exercises/">`));
    assert.ok(!readFileSync(join(r.out, `sitemap-${l}.xml`), 'utf8').includes('old-squat'));
  }
  const off = await build({ out: tmpDist(), slugi }); assert.match(readFileSync(join(off.out, 'en/exercises/old-squat/index.html'), 'utf8'), /<meta name="robots" content="noindex,nofollow">/);
});
test('build: pusty plik zamrożenia — ostrzeżenie bez indeksowania, błąd przy indeksowaniu (adresy muszą być zamrożone przed publikacją)', async () => {
  const slugi = { lock: {}, overrides: { nadpisania: {}, przekierowania: {} } };
  const w = await build({ out: tmpDist(), slugi }); assert.ok(w.warnings.some(x => /slugs\.lock\.json jest pusty/.test(x)));
  await assert.rejects(build({ out: tmpDist(), cfg: { indeksowanie: true }, slugi }), /slugs\.lock\.json jest pusty/);
});

/* Przekierowania z datą dodania i ochrona przed zbyt wczesnym usunięciem (badanie indeksowania 01.11.2026, pkt 6: „at least 1 year”). */
test('przekierowania: każdy wpis ma cel (do) i datę dodania (od, RRRR-MM-DD); brak daty albo zła data to błąd', () => {
  const lock = { A: 'a' }, cur1 = cur(['B', 'b']);
  assert.match(checkSlugLock({ current: cur1, lock, redirects: { a: 'lista' } }).errors.join('\n'), /przekierowanie „a”: wpis musi mieć postać \{ "do": …, "od": "RRRR-MM-DD" \}/);
  assert.match(checkSlugLock({ current: cur1, lock, redirects: { a: { do: 'lista' } } }).errors.join('\n'), /„a”: brak daty dodania \(od\)/);
  for (const zla of ['2026-13-01', '1.11.2026', '2026-02-30', '']) assert.match(checkSlugLock({ current: cur1, lock, redirects: { a: { do: 'lista', od: zla } } }).errors.join('\n'), /„a”: data dodania/, zla);
  assert.deepEqual(checkSlugLock({ current: cur1, lock, redirects: { a: R('lista') } }).errors, []);
});
test('przekierowania w repo: wszystkie wpisy slug-overrides.json mają datę dodania', () => {
  for (const [k, v] of Object.entries(readJson('slug-overrides.json').przekierowania)) assert.match(v?.od ?? '', /^\d{4}-\d{2}-\d{2}$/, k);
});
test('checkRedirectRemoval: usunięcie przekierowania młodszego niż 365 dni od startu indeksowania to błąd; starsze albo przed startem — wolno; liczba 365 w jednym miejscu', () => {
  assert.equal(REDIRECT_MIN_DAYS, 365);
  const before = { a: { do: 'lista', od: '2026-11-01' }, b: { do: 'lista', od: '2027-02-01' } }, after = {}, start = '2027-01-01';
  const r = (today, from = start) => checkRedirectRemoval({ before, after, indexingFrom: from, today });
  const e = r('2027-06-01').errors.join('\n'); assert.match(e, /„a”/); assert.match(e, /365 dni/); assert.match(e, /„b”/);
  assert.deepEqual(r('2028-01-01').errors.length, 1, 'po 365 dniach od startu (2028-01-01) „a” wolno usunąć; „b” (dodane 2027-02-01) jeszcze nie');
  assert.deepEqual(r('2028-02-01').errors, []);
  assert.deepEqual(r('2027-06-01', '').errors, [], 'indeksowanie jeszcze nie wystartowało — nic nie zaindeksowano');
  assert.deepEqual(checkRedirectRemoval({ before, after: before, indexingFrom: start, today: '2027-02-01' }).errors, [], 'bez usunięcia — bez błędu');
  assert.deepEqual(checkRedirectRemoval({ before: {}, after: before, indexingFrom: start, today: '2027-02-01' }).errors, [], 'dodanie — bez błędu');
  assert.equal(checkRedirectRemoval({ before: { c: { do: 'lista', od: '2026-01-01' } }, after: {}, indexingFrom: '2027-01-01', today: '2027-06-01' }).errors.length, 1, 'wiek liczony od startu indeksowania, gdy wpis starszy niż start');
});
test('strażnik usuwania przekierowań w repo: względem main nie zniknął żaden wpis młodszy niż 365 dni od startu indeksowania', () => {
  let base; try { base = JSON.parse(execFileSync('git', ['show', 'origin/main:slug-overrides.json'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })).przekierowania; } catch { return; } /* bez origin/main (płytki klon) — sprawdzi CI z fetch-depth 0 */
  const cfg = readJson('config.json');
  assert.deepEqual(checkRedirectRemoval({ before: base, after: readJson('slug-overrides.json').przekierowania, indexingFrom: cfg.indeksowanieOd, today: new Date().toISOString().slice(0, 10) }).errors, []);
});
test('config.json: indeksowanieOd (data startu indeksowania) puste przed startem; przy indeksowanie=true musi być datą', () => {
  const cfg = readJson('config.json'); assert.equal(typeof cfg.indeksowanieOd, 'string');
  if (cfg.indeksowanie) assert.match(cfg.indeksowanieOd, /^\d{4}-\d{2}-\d{2}$/); else assert.equal(cfg.indeksowanieOd, '');
});
test('config.json: domena kanoniczna zaczyna się od https://www. (decyzja właściciela 01.11.2026, wariant A: z www) i nie kończy ukośnikiem', () => {
  const d = readJson('config.json').domena; assert.match(d, /^https:\/\/www\.[a-z0-9.-]+$/);
});
