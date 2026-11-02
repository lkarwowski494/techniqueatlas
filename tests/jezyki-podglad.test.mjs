// S3 (plan linii 1.1): podgląd w 35 językach bez indeksowania. config.json buduje wszystkie 35 języków z eksportu aplikacji, `indeksowanie` zostaje false, do indeksu (po przełączeniu) idą tylko `indeksujJezyki`.
// Pilnuje, żeby infrastruktura 35 języków nie zepsuła późniejszego indeksowania (badanie indeksowania 01.11.2026): noindex bez Disallow, brak map witryny, hreflang w HTML = hreflang w mapach (tylko języki indeksowane),
// języki poza indeksem noindex,follow. Przeglądarka: każdy z 35 języków ładuje stronę główną, ćwiczenie z figurą i wyszukiwarkę bez błędów w konsoli i bez połączeń poza własnym serwerem (axe-core na wszystkich językach: tests/dostepnosc.test.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { build } from '../src/build.mjs';
import { readJson } from '../src/lib.mjs';
import { hreflangCodes, hreflang } from '../src/taksonomia.mjs';
import { buildOnce, requireData, distFiles, tmpDist, BEZ_STARTU, zPelna } from './pomoc.mjs';
import { launch, serve } from './przegladarka.mjs';

requireData();
const man = readJson('.cache/dane/manifest.json'), ALL = man.languages.map(l => l.lang), cfg0 = readJson('config.json');
const FIG = !!JSON.parse(readFileSync(join(new URL('..', import.meta.url).pathname, '.cache/dane/atlas-en.json'), 'utf8')).exercises.find(e => e.slug === 'back-squat').figure;
const read = (out, f) => readFileSync(join(out, f), 'utf8');
const robots = h => h.match(/<meta name="robots" content="([^"]*)">/)?.[1] ?? null;
const hrefs = h => [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map(m => [m[1], m[2]]);

test('config: budowane są wszystkie języki z eksportu aplikacji (35), indeksowanie wyłączone, do indeksu tylko podzbiór (po przeglądzie native speakera)', () => {
  assert.equal(ALL.length, 35); assert.deepEqual([...cfg0.jezyki].sort(), [...ALL].sort()); assert.equal(new Set(cfg0.jezyki).size, 35);
  assert.equal(cfg0.indeksowanie, false); assert.ok(cfg0.indeksujJezyki.length > 0 && cfg0.indeksujJezyki.every(l => cfg0.jezyki.includes(l)));
  assert.ok(cfg0.indeksujJezyki.length < cfg0.jezyki.length, 'nie wszystkie języki są w indeksie bez przeglądu');
  for (const l of ALL) assert.ok(existsSync(new URL(`../src/ui/${l}.json`, import.meta.url)), `src/ui/${l}.json`);
});
test('podgląd 35 języków: każda strona każdego języka ma noindex,nofollow; robots.txt bez Disallow i Sitemap; brak map witryny; katalog na każdy język ze stroną główną, listą i ćwiczeniem', async () => {
  const { out, pages } = await buildOnce();
  const html = distFiles(out).filter(p => p.endsWith('.html')).map(p => p.slice(out.length + 1));
  assert.ok(html.length > 35 * 700, `stron: ${html.length}`);
  for (const f of html) assert.equal(robots(read(out, f)), 'noindex,nofollow', f);
  assert.equal(read(out, 'robots.txt'), 'User-agent: *\nAllow: /\n'); assert.deepEqual(readdirSync(out).filter(f => /^sitemap/.test(f)), []);
  for (const l of ALL) for (const f of [`${l.toLowerCase()}/index.html`, `${l.toLowerCase()}/exercises/index.html`, `${l.toLowerCase()}/exercises/back-squat/index.html`]) assert.ok(existsSync(join(out, f)), f);
  assert.ok(pages.every(p => p.indexable === false));
  const bezSzablonuFigury = h => h.replace(/<script type="application\/json" data-labels>.*?<\/script>/s, ''); /* data-labels niesie szablon „{opis}” wypełniany w przeglądarce (assets/figura-strona.js, fmt) — zamierzony, nie luka */
  for (const f of html) assert.doesNotMatch(bezSzablonuFigury(read(out, f)), /undefined|\[object Object\]|\{[a-zA-Z]+\}/, f); /* nieuzupełnione miejsca w szablonach, pole spoza kontraktu eksportu (np. r.region zamiast r.id) */
});
test('po przełączeniu indeksowania (35 języków budowanych, indeksujJezyki bez zmian): mapy witryny tylko dla języków indeksowanych, pozostałe noindex,follow poza mapami; hreflang w HTML = tylko języki indeksowane (zgodnie z mapami); przełącznik języków w stopce zostaje pełny', async () => {
  const idxLangs = cfg0.indeksujJezyki, other = ALL.find(l => !idxLangs.includes(l)), { out, sitemaps } = await build({ out: tmpDist(), cfg: { indeksowanie: true }, ...BEZ_STARTU, ...zPelna('back-squat') });
  assert.deepEqual([...sitemaps].sort(), [...idxLangs.map(l => `sitemap-${l}.xml`), 'sitemap-glowna.xml'].sort());
  for (const l of ALL.filter(l => !idxLangs.includes(l))) assert.equal(existsSync(join(out, `sitemap-${l}.xml`)), false, l);
  const sitemapText = sitemaps.map(s => read(out, s)).join(''); assert.ok(!new RegExp(`/${other.toLowerCase()}/`).test(sitemapText), `${other} poza mapami`);
  const noidx = read(out, `${other.toLowerCase()}/exercises/back-squat/index.html`); assert.equal(robots(noidx), 'noindex,follow');
  const dom = cfg0.domena, expectCodes = ['x-default', ...idxLangs.flatMap(l => hreflangCodes(l))].sort();
  for (const f of ['en/exercises/back-squat/index.html', 'pl/index.html', 'en/exercises/index.html', 'index.html']) {
    const h = read(out, f), alts = hrefs(h); assert.deepEqual(alts.map(a => a[0]).sort(), expectCodes, f);
    assert.ok(alts.every(a => a[1].startsWith(dom + '/')), f); assert.ok(!alts.some(a => a[1].includes(`/${other.toLowerCase()}/`)), `${f}: bez ${other}`);
  }
  /* przełącznik języków (widoczne linki) pokazuje wszystkie 35 i nie dubluje się z hreflang */
  const en = read(out, 'en/exercises/back-squat/index.html'); assert.equal([...en.matchAll(/<a href="[^"]*" hreflang="[^"]+" lang="[^"]+">/g)].length, ALL.length - 1);
  /* zestaw hreflang strony = zestaw xhtml:link w mapie dla tego samego adresu */
  const xml = read(out, 'sitemap-en.xml'), block = xml.match(/<url><loc>[^<]*\/en\/exercises\/back-squat\/<\/loc>((?:<xhtml:link[^>]*\/>)+)<\/url>/)[1];
  assert.deepEqual([...block.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map(m => m[1]).sort(), hrefs(read(out, 'en/exercises/back-squat/index.html')).map(a => a[0]).filter(c => c !== 'x-default').sort());
});
test('dodanie języka do indeksujJezyki: język dodany do indeksujJezyki wchodzi do klastra hreflang i map po obu stronach (wzajemnie), a ten sam język bez wpisu znika z obu', async () => {
  const add = ALL.find(l => !cfg0.indeksujJezyki.includes(l) && !/^(es-419|sr)$/.test(l)), langs = [...cfg0.indeksujJezyki, add];
  const withAdd = await build({ out: tmpDist(), cfg: { indeksowanie: true, indeksujJezyki: langs }, ...BEZ_STARTU, ...zPelna('back-squat') });
  const a = hrefs(read(withAdd.out, 'en/exercises/back-squat/index.html')), b = hrefs(read(withAdd.out, `${add.toLowerCase()}/exercises/back-squat/index.html`));
  assert.ok(a.some(x => x[0] === hreflang(add))); assert.ok(b.some(x => x[0] === 'en')); assert.ok(withAdd.sitemaps.includes(`sitemap-${add}.xml`));
  const without = await build({ out: tmpDist(), cfg: { indeksowanie: true }, ...BEZ_STARTU, ...zPelna('back-squat') }); assert.ok(!hrefs(read(without.out, 'en/exercises/back-squat/index.html')).some(x => x[0] === hreflang(add)));
});

test('przeglądarka: 35 języków × (strona główna, ćwiczenie z figurą, wyszukiwarka) — zero błędów konsoli, zero żądań poza serwerem, noindex w DOM, figura się rysuje, <html lang> zgodny z językiem', { timeout: 15 * 60 * 1000 }, async () => {
  const { out } = await buildOnce(), srv = await serve(out), browser = await launch(), problems = [];
  const jobs = [...ALL], nameOf = l => JSON.parse(read(out, `assets/idx/${l}.js`).replace(/^export default /, '').replace(/;\s*$/, '')).find(x => x[1] === 'back-squat')[0]; let next = 0;
  async function worker() {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
    for (;;) {
      const l = jobs[next++]; if (!l) break;
      const page = await ctx.newPage(), tag = m => problems.push(`${l}: ${m}`);
      page.on('console', m => { if (m.type() === 'error') tag(`konsola ${m.text()}`); }); page.on('pageerror', e => tag(`wyjątek ${e}`));
      page.on('request', r => { if (!r.url().startsWith(srv.url) && !r.url().startsWith('data:')) tag(`żądanie poza serwerem ${r.url()}`); });
      page.on('response', r => { if (r.status() >= 400) tag(`HTTP ${r.status()} ${r.url().slice(srv.url.length)}`); });
      const lc = l.toLowerCase();
      await page.goto(`${srv.url}/${lc}/`, { waitUntil: 'load' });
      if (await page.locator('meta[name=robots]').getAttribute('content') !== 'noindex,nofollow') tag('brak noindex w DOM');
      if (await page.locator('html').getAttribute('lang') !== hreflang(l)) tag('lang strony');
      await page.locator('#szukaj').fill(nameOf(l).slice(0, 4));
      await page.waitForFunction(() => document.querySelectorAll('[data-wyniki] li').length > 0, null, { timeout: 5000 }).catch(() => tag('wyszukiwarka bez wyników'));
      await page.goto(`${srv.url}/${lc}/exercises/back-squat/`, { waitUntil: 'load' });
      if (FIG) { /* figura jest w eksporcie dopiero po recenzji rodziny; bez niej strona ćwiczenia ma być bez bloku figury */
        await page.waitForSelector('[data-views]:not([hidden]) [data-g]', { timeout: 5000 }).catch(() => tag('figura się nie rysuje'));
        const g = await page.locator('[data-g]').first().innerHTML().catch(() => ''); if (g.length < 100) tag('figura pusta');
      } else if (await page.locator('[data-figure], [data-views]').count()) tag('blok figury mimo braku figury w eksporcie');
      if (await page.locator('.sylwetki svg').count() !== 2) tag('sylwetka mięśni');
      await page.close();
    }
    await ctx.close();
  }
  try { await Promise.all(Array.from({ length: 3 }, worker)); } finally { await browser.close(); await srv.close(); }
  assert.deepEqual(problems.slice(0, 15), [], `problemów: ${problems.length}`);
});
