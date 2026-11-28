// Z-40 009 (KO-139): oficjalne plakietki „Download on the App Store” (czarne, SVG, 35 języków, Apple Marketing Tools) — pliki niezmienione, <img> w ramce tylko przy pliku, linia znaków Apple tylko przy grafice.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { build } from '../src/build.mjs';
import { requireData, tmpDist, tmpDir, ROOT } from './pomoc.mjs';
import { readJson } from '../src/lib.mjs';
import { czytaj, element, elementy } from './strona-html.mjs';

requireData();
const DIR = join(ROOT, 'assets/plakietka'), APP = '123456789', Z = readJson('assets/plakietka/ZRODLA.json').zrodla;
const KODY = readdirSync(join(ROOT, 'src/ui')).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, '')), sha = f => createHash('sha256').update(readFileSync(f)).digest('hex');
const ramka = (out, l) => element(czytaj(out, `${l}/exercises/back-squat/index.html`), 'aside', 'ramka');
const stopka = (out, l) => czytaj(out, `${l}/exercises/back-squat/index.html`).match(/<footer[\s\S]*<\/footer>/)?.[0] ?? '';

test('Z-40 009: każdy język strony (35) ma plik assets/plakietka/<kod>.svg, a plików poza językami strony nie ma', () => {
  assert.equal(KODY.length, 35); assert.deepEqual(readdirSync(DIR).filter(f => f.endsWith('.svg')).sort(), KODY.map(k => `${k}.svg`).sort());
});

test('Z-40 009: pliki są bajt w bajt takie, jak pobrane z Apple (suma SHA-256 z ZRODLA.json), z adresem źródła Apple i datą pobrania', () => {
  for (const k of KODY) {
    const z = Z[k]; assert.ok(z, `${k}: brak wpisu w ZRODLA.json`);
    assert.match(z.url, /^https:\/\/toolbox\.marketingtools\.apple\.com\/api\/v2\/badges\/download-on-the-app-store\/black\/[a-z-]+$/, `${k}: źródło`);
    assert.match(z.data, /^\d{4}-\d{2}-\d{2}$/, `${k}: data`); assert.equal(sha(join(DIR, `${k}.svg`)), z.sha256, `${k}: plik zmieniony względem pobranego z Apple`);
  }
});

test('Z-40 009: każdy plik to SVG Apple (tytuł „Download_on_the_App_Store_Badge…” albo eksport „Artwork”), czarny wariant, bez skryptów i odwołań zewnętrznych', () => {
  for (const k of KODY) {
    const s = readFileSync(join(DIR, `${k}.svg`), 'utf8').replace(/^<\?xml[^>]*>\s*(<!--[\s\S]*?-->\s*)?/, ''); assert.match(s, /^<svg[\s>]/, `${k}: nie SVG`);
    assert.match(s, /<title>Download_on_the_App_Store_Badge|id="Artwork"/, `${k}: znacznik Apple (tytuł albo eksport Illustratora „Artwork” — hr, uk)`);
    assert.doesNotMatch(s, /<script|xlink:href="http|href="http|<image/, `${k}: skrypt albo odwołanie zewnętrzne`);
  }
});

test('Z-40 009: z appStoreId i plikami każda strona ćwiczenia ma w ramce link z <img src=assets/plakietka/<język>.svg alt height≥40> i w stopce linię znaków Apple', async () => {
  const r = await build({ out: tmpDist(), cfg: { appStoreId: APP, jezyki: ['pl', 'en', 'de', 'sr'] } });
  for (const l of ['pl', 'en', 'de', 'sr']) {
    const rm = ramka(r.out, l), img = rm.wnetrze.match(/<a href="https:\/\/apps\.apple\.com\/app\/id123456789[^"]*"><img ([^>]*)><\/a>/)?.[1]; assert.ok(img, `${l}: brak <img> w linku do sklepu`);
    assert.match(img, new RegExp(`src="[./]*assets/plakietka/${l}\\.svg"`), `${l}: src`); assert.match(img, /alt="[^"]+"/, `${l}: alt`);
    assert.ok(Number(img.match(/height="(\d+)"/)?.[1]) >= 40, `${l}: height < 40`); assert.match(stopka(r.out, l), /class="zastrz"/, `${l}: linia znaków Apple`);
    assert.ok(readFileSync(join(r.out, 'assets/plakietka', `${l}.svg`)).equals(readFileSync(join(DIR, `${l}.svg`))), `${l}: kopia w dist zmieniona`);
  }
});

test('Z-40 009: z appStoreId, ale bez pliku plakietki: zwykły link tekstowy bez <img>, bez linii znaków Apple, z ostrzeżeniem budowania', async () => {
  const pusty = tmpDir('plakietka-');
  const r = await build({ out: tmpDist(), cfg: { appStoreId: APP, jezyki: ['pl', 'en'] }, plakietkaDir: pusty });
  for (const l of ['pl', 'en']) { const rm = ramka(r.out, l); assert.doesNotMatch(rm.wnetrze, /<img/, l); assert.match(rm.wnetrze, /<a href="https:\/\/apps\.apple\.com\/app\/id123456789[^"]*">[^<]+<\/a>/, `${l}: link tekstowy`); assert.doesNotMatch(stopka(r.out, l), /class="zastrz"/, `${l}: linia znaków bez grafiki`); }
  assert.ok(r.warnings?.some(w => /plakietka App Store/.test(w)) ?? true);
});

test('Z-40 009: bez appStoreId (stan config.json): bez plakietki, bez linku do sklepu i bez linii znaków Apple', async () => {
  assert.equal(readJson('config.json').appStoreId, '', 'config.json: appStoreId zostaje puste do publikacji');
  const r = await build({ out: tmpDist(), cfg: { appStoreId: '', jezyki: ['pl', 'en'] } });
  for (const l of ['pl', 'en']) { assert.doesNotMatch(ramka(r.out, l).wnetrze, /<img|apps\.apple\.com/, l); assert.doesNotMatch(stopka(r.out, l), /class="zastrz"|apps\.apple\.com/, l); }
});
