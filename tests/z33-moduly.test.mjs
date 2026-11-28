// Z-33: moduły bez budowania strony — render tekstów prawnych (src/prawne.mjs), strażnicy S12 i S13 (src/straznicy.mjs), liczba dni z kodu aplikacji (src/aplikacja.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { bezKomentarzy, mdDoHtml, wstaw } from '../src/prawne.mjs';
import { checkPrawne, checkRamka } from '../src/straznicy.mjs';
import { dniBezOplat, dokumentRamki } from '../src/aplikacja.mjs';
import { read, tmpDir, tmpDist, BEZ_STARTU } from './pomoc.mjs';
import { build } from '../src/build.mjs';
import { exercisePage, homePage } from '../src/pages.mjs';
import { brakujacePodklucze } from './strona-html.mjs';

test('Z-33 prawne: komentarze (także zagnieżdżone, z [DO KONSULTACJI]) znikają, wstawki są podmieniane, brak wartości daje tekst zastępczy, a znaczniki w wartościach są escapowane', () => {
  assert.equal(bezKomentarzy('a <!-- x <!-- D-1 --> y --> b <!-- [DO KONSULTACJI] z -->c'), 'a  b c');
  assert.equal(wstaw('A {{administrator}} B {{kontakt}} C {{nieznana}}', { administrator: 'X' }, { kontakt: '(brak)' }), 'A X B (brak) C (nieznana)');
  const d = mdDoHtml(bezKomentarzy('# Tytuł <!-- k -->\n\nAkapit **ważny** i `kod` <b>.\n## Sekcja\n- jeden\n- dwa\nkoniec'));
  assert.equal(d.h1, 'Tytuł'); assert.deepEqual(d.naglowki, ['Sekcja']);
  assert.equal(d.html, '<p>Akapit <strong>ważny</strong> i <code>kod</code> &lt;b&gt;.</p>\n<h2>Sekcja</h2>\n<ul>\n<li>jeden</li>\n<li>dwa</li>\n</ul>\n<p>koniec</p>');
  assert.throws(() => mdDoHtml('bez nagłówka'), /h1/);
});

test('Z-33 S12 wstawki prawne: puste administrator, kontakt albo data → ostrzeżenie przed startem i błąd przy indeksowaniu; komplet → cisza', () => {
  const pelne = { administrator: 'A', kontakt: 'k', dataObowiazywania: '2026-12-01' };
  assert.deepEqual(checkPrawne({ wartosci: pelne, indexing: true }), { errors: [], warnings: [] });
  const bez = { ...pelne, kontakt: ' ' };
  assert.match(checkPrawne({ wartosci: bez, indexing: true }).errors[0], /S12.*\{\{kontakt\}\}/); assert.equal(checkPrawne({ wartosci: bez, indexing: false }).errors.length, 0); assert.equal(checkPrawne({ wartosci: bez, indexing: false }).warnings.length, 1);
  assert.match(checkPrawne({ wartosci: {}, indexing: true }).errors[0], /administrator.*kontakt.*dataObowiazywania/);
});

test('Z-33 S13 zdania ramki: zgodne z dokumentem i wersją → cisza; inna wersja wydania, zmienione zdanie albo brak klucza → naruszenie', () => {
  const doc = dokumentRamki(), ui = JSON.parse(JSON.stringify({ pl: JSON.parse(read('src/ui/pl.json')), en: JSON.parse(read('src/ui/en.json')) }));
  assert.deepEqual(checkRamka({ doc, ui, wersjaWydania: doc.wersja, indexing: true }), { errors: [], warnings: [] });
  assert.match(checkRamka({ doc, ui, wersjaWydania: '9.9.9', indexing: true }).errors[0], /S13.*sprawdzono dla wersji 1\.1\.1.*9\.9\.9/); assert.equal(checkRamka({ doc, ui, wersjaWydania: '9.9.9', indexing: false }).warnings.length, 1);
  ui.en.ramka.z3 = 'Changed.'; assert.match(checkRamka({ doc, ui, wersjaWydania: doc.wersja, indexing: false }).errors.join(), /src\/ui\/en\.json \(ramka\.z3\)/);
  delete ui.pl.wsparcie.w2; assert.match(checkRamka({ doc, ui, wersjaWydania: doc.wersja, indexing: false }).errors.join(), /src\/ui\/pl\.json \(wsparcie\.w2\)/);
});

test('Z-33 liczba dni bez opłat pochodzi z lib/access.ts aplikacji (5 w wersji 1.1.1); brak pliku albo liczby to błąd, nie zgadnięta wartość', () => {
  assert.equal(dniBezOplat(), 5);
  const d = tmpDir('atlas-z33-'); {
    assert.throws(() => dniBezOplat(d), /npm run dane/);
    mkdirSync(join(d, 'app/lib'), { recursive: true }); writeFileSync(join(d, 'app/lib/access.ts'), 'export const PAYWALL = { ENABLED: true };\n');
    assert.throws(() => dniBezOplat(d), /FREE_TRAINING_DAYS_PER_MONTH/);
    writeFileSync(join(d, 'app/lib/access.ts'), 'export const PAYWALL = {\n  FREE_TRAINING_DAYS_PER_MONTH: 3,\n};\n'); assert.equal(dniBezOplat(d), 3);
  }
});

/* Z-33 recenzja (NISKIE): język z niepełnym zestawem podkluczy (np. ramka bez z5, wsparcie bez w2) nie wypisuje „undefined”; cały blok spada na wersję angielską z lang="en" */
test('Z-33 (recenzja, NISKIE) ramka i akapit o wsparciu z brakującym podkluczem: bez „undefined”, blok angielski z lang="en"', async () => {
  const r = await build({ out: tmpDist(), cfg: { jezyki: ['pl', 'en', 'de'] }, ...BEZ_STARTU }), ctx = r.ctx, ex = ctx.data.de.exercises[0];
  const { z5, ...ramkaBezZ5 } = ctx.uiEn.ramka, { w2, ...wspBezW2 } = ctx.uiEn.wsparcie; assert.ok(z5 && w2);
  ctx.ui.de = { ...ctx.ui.de, ramka: ramkaBezZ5, wsparcie: wspBezW2 };
  const html = exercisePage(ctx, 'de', ex).html;
  assert.doesNotMatch(html, /undefined/); assert.match(html, /<aside class="ramka"[\s\S]*?<h2 id="ramka-t" lang="en">/); assert.match(html, /<p class="wsparcie" lang="en">/);
  assert.doesNotMatch(homePage(ctx, 'de').html, /undefined/);
  /* język z kompletnym zestawem zostaje własny (bez lang="en") */
  ctx.ui.de = { ...ctx.ui.de, ramka: ctx.uiEn.ramka, wsparcie: ctx.uiEn.wsparcie }; assert.doesNotMatch(exercisePage(ctx, 'de', ex).html, /<h2 id="ramka-t" lang="en">/);
});

test('Z-33 (recenzja, NISKIE) parytet kluczy UI: wyjątek sprawdza podklucze, gdy język ma klucz (ramka bez z5 → błąd), a gdy klucza nie ma — nic', () => {
  const pl = { ramka: { tytul: 'a', z1: 'b', z5: 'c' }, wsparcie: { w1: 'a' }, x: 1 };
  assert.deepEqual(brakujacePodklucze({ x: 1 }, pl, ['ramka', 'wsparcie']), []);
  assert.deepEqual(brakujacePodklucze({ ramka: { tytul: 'a', z1: 'b', z5: 'c' }, wsparcie: { w1: 'a' } }, pl, ['ramka', 'wsparcie']), []);
  assert.deepEqual(brakujacePodklucze({ ramka: { tytul: 'a', z1: 'b' }, wsparcie: { w1: 'a', w9: 'z' } }, pl, ['ramka', 'wsparcie']), ['ramka: brak z5', 'wsparcie: nadmiarowy w9']);
});
