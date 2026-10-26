// Figura w przeglądarce (docs/54 pkt 6): przy „Ogranicz ruch” widać dwie pozycje statyczne z podpisami i animacja nie startuje; bez ograniczenia ruchu animowane widoki zastępują pozycje;
// „Wznów animację” i wybór błędu odsłaniają widoki; sylwetka i pozycje się rysują (<use> z arkusza, kolory ze zmiennych); 404 ma adresy od korzenia (działa pod dowolnym adresem); zero błędów w konsoli.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildOnce } from './pomoc.mjs';
import { launch, serve } from './przegladarka.mjs';

const { out } = await buildOnce();
const URL_ = '/en/exercises/back-squat/';
async function withPage(opts, fn) {
  const srv = await serve(out), browser = await launch(), ctx = await browser.newContext({ viewport: { width: 700, height: 1000 }, ...opts }), page = await ctx.newPage(), errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); page.on('pageerror', e => errors.push(String(e)));
  try { await page.goto(srv.url + URL_); await fn(page, srv.url); assert.deepEqual(errors, []); } finally { await browser.close(); await srv.close(); }
}
const vis = (page, sel) => page.locator(sel).isVisible();

test('„Ogranicz ruch”: widoczne dwie pozycje z podpisami, animowane widoki ukryte, przycisk „Wznów”; Wznów odsłania animowane widoki i chowa pozycje', async () => {
  await withPage({ reducedMotion: 'reduce' }, async page => {
    await page.waitForTimeout(300);
    assert.equal(await vis(page, '[data-poses]'), true); assert.equal(await vis(page, '[data-views]'), false);
    assert.deepEqual(await page.locator('[data-poses] p').allTextContents(), ['Starting position', 'End position']);
    const box = await page.locator('[data-poses] svg').first().boundingBox(); assert.ok(box.width > 50 && box.height > 50, 'pozycja się rysuje (use z arkusza)');
    assert.equal(await page.locator('[data-pause]').textContent(), 'Resume animation');
    await page.click('[data-pause]'); assert.equal(await vis(page, '[data-views]'), true); assert.equal(await vis(page, '[data-poses]'), false);
    assert.ok((await page.locator('[data-g]').first().innerHTML()).length > 100);
  });
});
test('„Ogranicz ruch”: wybór częstego błędu odsłania widoki z pozą błędu (bez startu animacji)', async () => {
  await withPage({ reducedMotion: 'reduce' }, async page => {
    await page.waitForTimeout(300); await page.locator('[data-error]:visible').first().click();
    assert.equal(await vis(page, '[data-views]'), true); assert.equal(await vis(page, '[data-error-text]'), true);
    assert.equal(await page.locator('[data-pause]').getAttribute('aria-pressed'), 'true');
  });
});
test('bez ograniczenia ruchu: animowane widoki zastępują pozycje, przycisk „Pause animation”, kształty się zmieniają w czasie', async () => {
  await withPage({ reducedMotion: 'no-preference' }, async page => {
    await page.waitForSelector('[data-views]:not([hidden])');
    assert.equal(await vis(page, '[data-poses]'), false); assert.equal(await page.locator('[data-pause]').textContent(), 'Pause animation');
    const a = await page.locator('[data-g]').first().innerHTML(); await page.waitForTimeout(700); assert.notEqual(await page.locator('[data-g]').first().innerHTML(), a);
    await page.click('[data-pause]'); assert.equal(await page.locator('[data-pause]').getAttribute('aria-pressed'), 'true');
  });
});
test('sylwetka: dwa rysunki (przód, tył) mają rozmiar, a partie ćwiczenia mają kolor akcentu (zmienne CSS przez <use>), nie domyślny', async () => {
  await withPage({ colorScheme: 'light' }, async page => {
    assert.equal(await page.locator('.sylwetki svg').count(), 2); const b = await page.locator('.sylwetki svg').first().boundingBox(); assert.ok(b.width > 40 && b.height > 100);
    const px = await page.evaluate(async () => { const r = await fetch(document.querySelector('.sylwetki use').getAttribute('href').split('#')[0]); return (await r.text()).includes('var(--mm-5,var(--mm-part))'); });
    assert.equal(px, true);
  });
});
test('404: adresy od korzenia (strona 404.html jest serwowana pod dowolnym adresem), arkusz stylów i linki języków działają z głębokiej ścieżki', async () => {
  const h = readFileSync(join(out, '404.html'), 'utf8'); assert.match(h, /<link rel="stylesheet" href="\/assets\/site\.css">/); assert.match(h, /<a href="\/pl\/" lang="pl">/); assert.doesNotMatch(h, /href="(?!\/|\#|https:)/);
  const srv = await serve(out), browser = await launch(), page = await browser.newPage();
  try { const r = await page.goto(srv.url + '/a/b/c/nie-ma/'); assert.equal(r.status(), 404); assert.equal((await page.request.get(srv.url + await page.locator('link[rel=stylesheet]').getAttribute('href'))).status(), 200);
    await page.click('a[href="/pl/"]'); assert.match(page.url(), /\/pl\/$/); } finally { await browser.close(); await srv.close(); }
});
