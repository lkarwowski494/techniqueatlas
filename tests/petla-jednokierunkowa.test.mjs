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

test('podpis rysunku: faza bez sekund (Power Clean) bez czasu, wahadło z sekundami; pauza bez czasu jak dotąd; fazy bez znacznika untimed (stary eksport) mają sekundy', { skip: SKIP }, () => {
  assert.doesNotMatch(caption(html('en', 'power-clean')), /\d s/); assert.match(caption(html('en', 'power-clean')), /^[^·]+ · /); /* nazwa fazy · „Rysunek schematyczny” */
  assert.equal(caption(html('en', 'power-clean')).split(' · ').length, 2);
  assert.match(caption(html('en', 'clean-pull')), /\d(?:\.\d)? s/); assert.match(caption(html('en', 'back-squat')), /2 s.*Pause.*1 s/);
  assert.doesNotMatch(caption(html('pl', 'power-clean')), /\d s/);
  /* stary eksport: ta sama faza bez znacznika untimed zachowuje sekundy (negatyw) */
  const ex = ctx.data.en.exercises.find(e => e.slug === 'power-clean');
  const stary = exercisePage(ctx, 'en', { ...ex, figure: { ...ex.figure, phases: ex.figure.phases.map(({ untimed: _u, ...p }) => p) } }).html;
  assert.match(caption(stary), /Lifting 2\.5 s/);
  assert.doesNotMatch(caption(exercisePage(ctx, 'en', ex).html), /2\.5 s/);
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
