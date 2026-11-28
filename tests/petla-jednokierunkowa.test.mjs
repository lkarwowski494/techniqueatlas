// Tryb pętli figury na stronie (r6-W2 A, 05.11.2026): eksport aplikacji niesie `loop` i fazy `untimed`; strona gra pętlę jednokierunkową funkcją silnika (oneWayAt — ta sama co w aplikacji),
// a dane bez pola `loop` (stary PIN) i wahadło (np. Clean Pull) zachowują dotychczasowe wahadło. Faza bez sekund nie pokazuje czasu w podpisie rysunku.
// Dopóki PIN.json wskazuje eksport sprzed W2-A (bez pola `loop`), testy zależne od nowego eksportu są pomijane z powodem — wracają po przepięciu PIN-u (koordynator).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildOnce } from './pomoc.mjs';
import { launch, serve } from './przegladarka.mjs';
import { figureModule, exercisePage } from '../src/pages.mjs';
import { CACHE } from '../src/lib.mjs';

const { out, ctx } = await buildOnce();
const FIGS = JSON.parse(readFileSync(join(CACHE, 'dane/figury.json'), 'utf8')).figures;
const NOWY = FIGS['power-clean']?.loop === 'jednokierunkowa';
const SKIP = NOWY ? false : 'eksport z PIN.json jest sprzed r6-W2 A (brak figury Power Clean z loop) — test wraca po przepięciu PIN-u na commit z W2-A';
const mod = slug => readFileSync(join(out, `assets/fig/${slug}.js`), 'utf8');
const html = (lang, slug) => readFileSync(join(out, `${lang}/exercises/${slug}/index.html`), 'utf8');
const caption = h => h.match(/<figcaption class="drobne">(.*?)<\/figcaption>/s)[1];

test('dane figury: jednokierunkowa niesie loop (Power Clean, Snatch Balance, Block Power Snatch), wahadło (Clean Pull, Back Squat) niesie loop „wahadlo”', { skip: SKIP }, () => {
  for (const s of ['power-clean', 'snatch-balance', 'block-power-snatch']) assert.match(mod(s), /"loop":"jednokierunkowa"/, s);
  for (const s of ['clean-pull', 'back-squat']) { assert.match(mod(s), /"loop":"wahadlo"/, s); assert.doesNotMatch(mod(s), /"loop":"jednokierunkowa"/, s); }
});

test('zgodność wstecz: figura z danych bez pola loop (stary PIN) nie dostaje loop w module — gra wahadło', () => {
  const fig = FIGS['back-squat']; const { loop: _l, ...bez } = fig;
  assert.doesNotMatch(figureModule(ctx, 'back-squat', bez), /"loop"/);
  assert.match(figureModule(ctx, 'back-squat', { ...fig, loop: 'jednokierunkowa' }), /"loop":"jednokierunkowa"/); /* negatyw: pole przechodzi, gdy jest */
});

/* Z-40 004: podpis figury nie powtarza faz (tempo niesie linia wymiarowa); decyzja BA (27.11.2026: faza untimed bez czasu) dotyczy teraz linii wymiarowej — test przeniesiony z podpisu na aria-label linii */
test('podpis rysunku i linia tempa: podpis to sam „rysunek schematyczny”; faza bez sekund (Power Clean) bez linii i czasu, wahadło z sekundami; fazy bez znacznika untimed (stary eksport) mają sekundy w linii', { skip: SKIP }, () => {
  const wymiar = h => h.match(/<div class="wymiar[^"]*" role="img" aria-label="([^"]*)"/)?.[1] ?? null;
  for (const [l, s] of [['en', 'power-clean'], ['en', 'clean-pull'], ['en', 'back-squat'], ['pl', 'power-clean']]) assert.doesNotMatch(caption(html(l, s)), /\d s|·/, `${l}/${s}`);
  assert.equal(wymiar(html('en', 'power-clean')), null); assert.equal(wymiar(html('pl', 'power-clean')), null);
  assert.match(wymiar(html('en', 'clean-pull')), /\d(?:\.\d)? s/); assert.match(wymiar(html('en', 'back-squat')), /2 s.*1 s/); assert.match(wymiar(html('en', 'back-squat')), /Pause/);
  /* stary eksport: ta sama faza bez znacznika untimed zachowuje sekundy (negatyw) */
  const ex = ctx.data.en.exercises.find(e => e.slug === 'power-clean');
  const stary = exercisePage(ctx, 'en', { ...ex, figure: { ...ex.figure, phases: ex.figure.phases.map(({ untimed: _u, ...p }) => p) } }).html;
  assert.match(wymiar(stary), /Lifting 2\.5 s/);
});

/* funkcja czasu w przeglądarce: moduł strony z dist, silnik z aplikacji */
async function inBrowser(fn, arg) {
  const srv = await serve(out), browser = await launch(), page = await (await browser.newContext()).newPage(), errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); page.on('pageerror', e => errors.push(String(e)));
  try { await page.goto(srv.url + '/en/exercises/power-clean/'); const r = await page.evaluate(fn, arg); assert.deepEqual(errors, []); return r; } finally { await browser.close(); await srv.close(); }
}
test('uOf: pętla jednokierunkowa = oneWayAt silnika (pauza 0,5 s w 0, ruch liniowy 1,5 s, pauza 0,5 s w 1, skok do 0 bez cofania); wahadło i brak pola loop = uAt (tempo, wygładzenie)', async () => {
  const r = await inBrowser(async () => {
    const { uOf } = await import('/assets/figura-czas.js'), E = await import('/assets/silnik/figura.js'), T = E.TEMPO;
    const ms = [0, 250, 500, 1000, 1250, 2000, 2250, 2499, 2500, 3000, 4500, 5000];
    const one = { loop: 'jednokierunkowa', lowerFirst: true }, old = { lowerFirst: true }, pend = { loop: 'wahadlo', lowerFirst: true }, st = { loop: 'jednokierunkowa', static: true };
    return { ms, one: ms.map(m => uOf(one, m, T)), engine: ms.map(m => E.oneWayAt(m)), old: ms.map(m => uOf(old, m, T)), pend: ms.map(m => uOf(pend, m, T)), uAt: ms.map(m => E.uAt(m, true, T)), st: uOf(st, 100, T) };
  });
  assert.deepEqual(r.one, r.engine); assert.deepEqual(r.old, r.uAt); assert.deepEqual(r.pend, r.uAt);
  assert.deepEqual(r.one.slice(0, 3), [0, 0, 0]); assert.equal(r.one[3], 1 / 3); assert.equal(r.one[5], 1); assert.equal(r.one[7], 1); assert.equal(r.one[8], 0); assert.equal(r.one[9], 0); /* skok do 0 po pętli 2,5 s */
  for (let i = 1; i < 8; i++) assert.ok(r.one[i] >= r.one[i - 1], `u nie maleje w jednej pętli (${r.ms[i]} ms)`);
  assert.notDeepEqual(r.one, r.uAt, 'negatyw: pętla jednokierunkowa to nie wahadło'); assert.equal(r.st, 1, 'figura statyczna zostaje w pozycji końcowej');
});

test('strona Power Clean w przeglądarce: figura animuje się bez błędów w konsoli, kształty zmieniają się w czasie', { skip: SKIP }, async () => {
  const srv = await serve(out), browser = await launch(), page = await (await browser.newContext({ reducedMotion: 'no-preference' })).newPage(), errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); page.on('pageerror', e => errors.push(String(e)));
  try {
    await page.goto(srv.url + '/en/exercises/power-clean/'); await page.waitForSelector('[data-views]:not([hidden])');
    const a = await page.locator('[data-g]').first().innerHTML(); await page.waitForTimeout(900); assert.notEqual(await page.locator('[data-g]').first().innerHTML(), a);
    assert.equal(await page.locator('[data-pause]').textContent(), 'Pause animation');
    assert.deepEqual(errors, []);
  } finally { await browser.close(); await srv.close(); }
});

/* Z-02a: czas przebiegu per ćwiczenie (oneWayRepMs z aplikacji) i marsz (cykl_lustro) — jak ExerciseFigureV2 w v1.1.1 */
test('moduł figury: jednokierunkowa niesie klucz ćwiczenia (czas przebiegu z silnika), marsz niesie loop „cykl_lustro” bez klucza', () => {
  assert.match(mod('alternating-deltoid-raise'), /"key":"Alternating Deltoid Raise"/);
  assert.match(mod('farmer-s-walk'), /"loop":"cykl_lustro"/); assert.doesNotMatch(mod('farmer-s-walk'), /"key"/);
  assert.doesNotMatch(mod('back-squat'), /"key"/);
});
test('podpis rysunku: marsz (faza bez sekund) bez czasu', () => { assert.doesNotMatch(caption(html('en', 'farmer-s-walk')), /\d s/); });
test('uOf: czas przebiegu z oneWayRepMs (Alternating Deltoid Raise 6 s, reszta 1,5 s); marsz = cycleAt/2 (liniowo, bez tempa, skok po 2 s)', async () => {
  const r = await inBrowser(async () => {
    const { uOf } = await import('/assets/figura-czas.js'), A = await import('/assets/silnik/anim.js'), T = A.TEMPO;
    const ms = [0, 500, 1000, 1500, 2000, 2500, 3500, 6500, 7000];
    const dr = { loop: 'jednokierunkowa', key: 'Alternating Deltoid Raise', lowerFirst: true }, pc = { loop: 'jednokierunkowa', key: 'Power Clean', lowerFirst: true }, walk = { loop: 'cykl_lustro', lowerFirst: false };
    const wms = [0, 500, 1000, 1999, 2000, 2500, 4000];
    return { ms, dr: ms.map(m => uOf(dr, m, T)), drApp: ms.map(m => A.oneWayAt(m, A.oneWayRepMs('Alternating Deltoid Raise'))), pc: ms.map(m => uOf(pc, m, T)), pcApp: ms.map(m => A.oneWayAt(m, A.oneWayRepMs('Power Clean'))),
      wms, walk: wms.map(m => uOf(walk, m, T)), walkApp: wms.map(m => A.cycleAt(m) / 2) };
  });
  assert.deepEqual(r.dr, r.drApp); assert.deepEqual(r.pc, r.pcApp); assert.equal(r.dr[6], 0.5, 'połowa przebiegu 6 s po pauzie 0,5 s'); assert.notDeepEqual(r.dr, r.pc);
  assert.deepEqual(r.walk, r.walkApp); assert.deepEqual(r.walk, [0, 0.25, 0.5, 0.9995, 0, 0.25, 0]);
});
