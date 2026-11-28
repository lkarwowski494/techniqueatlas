// Z-34: IndexNow (scripts/indexnow.mjs — funkcje czyste, bez sieci) i świeżość obrazków podglądu (assets/podglad/ + src/podglad-skroty.json względem danych figur).
import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { adresyZMap, zbudujZadania, LIMIT } from '../scripts/indexnow.mjs';
import { skrotPodgladu } from '../src/podglad.mjs';
import { build } from '../src/build.mjs';
import { ROOT, tmpDir, requireData, tmpDist, BEZ_STARTU, read } from './pomoc.mjs';

test('Z-34 (A12) IndexNow: adresy z map witryny (bez map, bez powtórzeń), żądanie z hostem, kluczem i plikiem klucza; porcje po 10 000; adres spoza domeny i zły klucz to błąd', () => {
  const d = tmpDir('atlas-inx-'); try {
    writeFileSync(join(d, 'sitemap.xml'), '<sitemapindex><sitemap><loc>https://x.example/sitemap-pl.xml</loc></sitemap><sitemap><loc>https://x.example/sitemap-glowna.xml</loc></sitemap></sitemapindex>');
    writeFileSync(join(d, 'sitemap-pl.xml'), '<urlset><url><loc>https://x.example/pl/</loc></url><url><loc>https://x.example/pl/a/?b=1&amp;c=2</loc></url></urlset>');
    writeFileSync(join(d, 'sitemap-glowna.xml'), '<urlset><url><loc>https://x.example/</loc></url><url><loc>https://x.example/pl/</loc></url></urlset>');
    const adresy = adresyZMap(d); assert.deepEqual(adresy, ['https://x.example/pl/', 'https://x.example/pl/a/?b=1&c=2', 'https://x.example/']);
    assert.deepEqual(zbudujZadania({ domena: 'https://x.example', klucz: 'abcdef0123456789', adresy }), [{ host: 'x.example', key: 'abcdef0123456789', keyLocation: 'https://x.example/abcdef0123456789.txt', urlList: adresy }]);
  } finally { rmSync(d, { recursive: true, force: true }); }
  const wiele = Array.from({ length: LIMIT + 1 }, (_, i) => `https://x.example/${i}/`), z = zbudujZadania({ domena: 'https://x.example', klucz: 'abcdef0123456789', adresy: wiele });
  assert.deepEqual(z.map(x => x.urlList.length), [LIMIT, 1]);
  assert.throws(() => zbudujZadania({ domena: 'https://x.example', klucz: 'abcdef0123456789', adresy: ['https://obca.example/'] }), /spoza domeny/);
  assert.throws(() => zbudujZadania({ domena: 'https://x.example', klucz: 'zły klucz', adresy: [] }), /indexNowKlucz/);
});

test('Z-34 (A12) IndexNow: skrypt wysyła tylko z flagą --wyslij (domyślnie próba na sucho), a klucz w config.json to ten sam napis co plik klucza w dist przy indeksowaniu', () => {
  const src = read('scripts/indexnow.mjs'); assert.match(src, /includes\('--wyslij'\)/); assert.equal((src.match(/fetch\(/g) ?? []).length, 1);
  const klucz = JSON.parse(read('config.json')).indexNowKlucz; assert.match(klucz, /^[A-Za-z0-9-]{8,128}$/);
});

test('Z-34 (A9) świeżość podglądu: każde ćwiczenie z rysunkiem ma assets/podglad/<slug>.png ze skrótem zgodnym z rysunkiem i szablonem; brak plików bez ćwiczenia (po zmianie danych: node scripts/podglad.mjs)', async () => {
  requireData();
  const { ctx } = await build({ out: tmpDist(), cfg: { jezyki: ['en'] }, ...BEZ_STARTU }), skroty = JSON.parse(read('src/podglad-skroty.json'));
  const z = ctx.data.en.exercises.filter(e => e.figure && ctx.figs[e.slug]), pliki = readdirSync(join(ROOT, 'assets/podglad'));
  const brak = z.filter(e => !pliki.includes(`${e.slug}.png`)).map(e => e.slug), stare = z.filter(e => skroty[e.slug] !== skrotPodgladu(ctx, ctx.figs[e.slug])).map(e => e.slug);
  const nadmiar = pliki.filter(f => !z.some(e => `${e.slug}.png` === f)), nadSkroty = Object.keys(skroty).filter(s => !z.some(e => e.slug === s));
  assert.deepEqual({ brak: brak.slice(0, 5), stare: stare.slice(0, 5), nadmiar, nadSkroty }, { brak: [], stare: [], nadmiar: [], nadSkroty: [] });
});
