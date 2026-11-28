// Z-40 001 (WYS): przy 320 px i tekście 200% strona nie przewija się w poziomie w żadnym z 35 języków (audyt: 20 języków z przewijaniem, bg 86 px, ru 66 px …).
// Pełne budowanie 35 języków (jak tests/dostepnosc.test.mjs) — uruchamiaj osobno: node --test --test-concurrency=1 tests/z40-przewijanie.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../src/build.mjs';
import { readJson } from '../src/lib.mjs';
import { requireData, tmpDist } from './pomoc.mjs';
import { launch, serve } from './przegladarka.mjs';

requireData();
const ALL = readJson('.cache/dane/manifest.json').languages.map(l => l.lang);

test('Z-40 001: 35 języków × (ćwiczenie, strona główna, lista) przy 320 px i tekście 200% — scrollWidth − clientWidth = 0', { timeout: 15 * 60 * 1000 }, async () => {
  assert.equal(ALL.length, 35);
  const built = await build({ out: tmpDist(), cfg: { jezyki: ALL } }), srv = await serve(built.out), browser = await launch(), zle = [];
  try {
    const c = await browser.newContext({ viewport: { width: 320, height: 900 }, bypassCSP: true, reducedMotion: 'reduce' }), p = await c.newPage();
    for (const l of ALL) for (const u of [`/${l.toLowerCase()}/exercises/back-squat/`, `/${l.toLowerCase()}/`, `/${l.toLowerCase()}/exercises/`]) {
      await p.goto(srv.url + u); await p.evaluate(() => document.fonts.ready);
      await p.evaluate(() => document.documentElement.style.setProperty('font-size', 'calc(106.25% * 2)', 'important'));
      const x = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (x > 0) zle.push(`${l} ${u}: ${x} px`);
    }
  } finally { await browser.close(); await srv.close(); }
  assert.deepEqual(zle, []);
});
