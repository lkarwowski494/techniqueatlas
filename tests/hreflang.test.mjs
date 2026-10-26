// hreflang (docs/54 pkt 5): Google nie obsługuje kodu es-419, więc es-419 → lista regionów es-XX na ten sam adres (bez BR i JP); serbski w cyrylicy → sr-Cyrl; kody poprawne, bez duplikatów, wzajemne.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { build } from '../src/build.mjs';
import { ES_419_HREFLANG_REGIONS, hreflang, hreflangCodes } from '../src/taksonomia.mjs';
import { readJson, ROOT } from '../src/lib.mjs';
import { requireData, tmpDist, BEZ_STARTU } from './pomoc.mjs';

requireData();
const LANGS = ['pl', 'en', 'es', 'es-419', 'sr', 'pt-BR', 'zh-Hant'];
const CFG = { indeksowanie: true, jezyki: LANGS, indeksujJezyki: LANGS };
const dom = readJson('config.json').domena;
const built = await build({ out: tmpDist(), cfg: CFG, ...BEZ_STARTU });
const read = f => readFileSync(join(built.out, f), 'utf8');
const links = h => [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map(m => [m[1], m[2]]);

test('regiony es-419: lista = ES_419_REGIONS aplikacji bez „419”, BR i JP; kody krajów, bez duplikatów, alfabetycznie', () => {
  assert.ok(ES_419_HREFLANG_REGIONS.length > 0);
  for (const r of ES_419_HREFLANG_REGIONS) assert.match(r, /^[A-Z]{2}$/);
  assert.equal(new Set(ES_419_HREFLANG_REGIONS).size, ES_419_HREFLANG_REGIONS.length);
  assert.deepEqual([...ES_419_HREFLANG_REGIONS], [...ES_419_HREFLANG_REGIONS].sort());
  for (const nie of ['BR', 'JP', '419', 'ES']) assert.ok(!ES_419_HREFLANG_REGIONS.includes(nie), nie);
  const src = join(ROOT, '.cache/app/lib/i18n.ts');
  if (existsSync(src)) { /* strażnik rozjazdu z aplikacją (lista pobrana razem z danymi) */
    const app = readFileSync(src, 'utf8').match(/ES_419_REGIONS = \[([^\]]+)\]/)[1].match(/'([^']+)'/g).map(x => x.slice(1, -1));
    assert.deepEqual([...ES_419_HREFLANG_REGIONS], app.filter(r => !['419', 'BR', 'JP'].includes(r)).sort());
  }
});
test('hreflangCodes i hreflang: es-419 → es-XX; sr → sr-Cyrl; pozostałe jak kod aplikacji', () => {
  assert.deepEqual(hreflangCodes('es-419'), ES_419_HREFLANG_REGIONS.map(r => `es-${r}`));
  assert.deepEqual(hreflangCodes('sr'), ['sr-Cyrl']); assert.equal(hreflang('sr'), 'sr-Cyrl');
  for (const l of ['pl', 'en', 'es', 'pt-BR', 'zh-Hant']) assert.deepEqual(hreflangCodes(l), [l]);
  assert.equal(hreflang('es-419'), 'es-419'); /* znacznik języka strony (lang, a hreflang): poprawny BCP 47 */
});
test('strona ćwiczenia: es-419 to jeden adres pod wszystkimi kodami es-XX (żadnego es-419, BR, JP); sr tylko jako sr-Cyrl; x-default → /', () => {
  const h = read('en/exercises/back-squat/index.html'), alts = links(h), codes = alts.map(a => a[0]);
  assert.equal(new Set(codes).size, codes.length, 'kody hreflang nie powtarzają się');
  const es419 = alts.filter(a => a[0].startsWith('es-')); assert.deepEqual(es419.map(a => a[0]), ES_419_HREFLANG_REGIONS.map(r => `es-${r}`));
  for (const [, href] of es419) assert.equal(href, `${dom}/es-419/exercises/back-squat/`);
  for (const zly of ['es-419', 'es-BR', 'es-JP', 'sr']) assert.ok(!codes.includes(zly), zly);
  assert.equal(alts.find(a => a[0] === 'sr-Cyrl')[1], `${dom}/sr/exercises/back-squat/`);
  assert.equal(alts.find(a => a[0] === 'es')[1], `${dom}/es/exercises/back-squat/`); assert.equal(alts.find(a => a[0] === 'x-default')[1], `${dom}/`);
  assert.equal(alts.find(a => a[0] === 'pt-BR')[1], `${dom}/pt-br/exercises/back-squat/`); assert.equal(alts.find(a => a[0] === 'zh-Hant')[1], `${dom}/zh-hant/exercises/back-squat/`);
  for (const c of codes) assert.match(c, /^(?:x-default|[a-z]{2}(?:-[A-Z]{2}|-[A-Z][a-z]{3})?)$/, c);
});
test('wzajemność: każda strona wymieniona w hreflang strony A wymienia A pod własnym kodem języka (wszystkie kody es-XX wskazują stronę es-419, która wymienia siebie)', () => {
  const pages = ['index.html', ...LANGS.flatMap(l => [`${l.toLowerCase()}/index.html`, `${l.toLowerCase()}/exercises/back-squat/index.html`, `${l.toLowerCase()}/muscles/legs/index.html`])].filter(f => existsSync(join(built.out, f)));
  for (const f of pages.filter(f => f !== 'index.html')) {
    const h = read(f), self = `${dom}/${f.replace(/index\.html$/, '')}`, mine = links(h);
    assert.ok(mine.some(a => a[1] === self), `${f}: wymienia siebie`);
    for (const url of new Set(mine.map(a => a[1]).filter(u => u !== `${dom}/`))) {
      const other = links(read(url.slice(dom.length + 1) + 'index.html')); assert.ok(other.some(a => a[1] === self), `${f} ↔ ${url}`);
    }
  }
});
test('lang strony: <html lang> i odnośniki językowe — sr-Cyrl dla serbskiego, es-419 zostaje (znacznik języka, nie kod wyszukiwarki)', () => {
  assert.match(read('sr/exercises/back-squat/index.html'), /<html lang="sr-Cyrl">/); assert.match(read('es-419/exercises/back-squat/index.html'), /<html lang="es-419">/);
  assert.match(read('en/exercises/back-squat/index.html'), /<a href="[^"]*" hreflang="sr-Cyrl" lang="sr-Cyrl">/);
  assert.match(read('index.html'), /hreflang="sr-Cyrl" lang="sr-Cyrl"/);
});
test('mapy witryny: xhtml:link z tymi samymi kodami (es-XX × region, sr-Cyrl), wzajemnie i bez duplikatów', () => {
  const xml = read('sitemap-en.xml'), block = xml.match(/<url><loc>[^<]*\/en\/exercises\/[^<]+<\/loc>((?:<xhtml:link[^>]*\/>)+)<\/url>/)[1];
  const alts = [...block.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]), codes = alts.map(a => a[0]);
  assert.equal(new Set(codes).size, codes.length);
  for (const r of ES_419_HREFLANG_REGIONS) assert.ok(codes.includes(`es-${r}`), r);
  assert.ok(codes.includes('sr-Cyrl') && !codes.includes('sr') && !codes.includes('es-419') && !codes.includes('es-BR'));
});
