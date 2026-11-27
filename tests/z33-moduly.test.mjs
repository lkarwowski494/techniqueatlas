// Z-33: moduły bez budowania strony — render tekstów prawnych (src/prawne.mjs), strażnicy S12 i S13 (src/straznicy.mjs), liczba dni z kodu aplikacji (src/aplikacja.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bezKomentarzy, mdDoHtml, wstaw } from '../src/prawne.mjs';
import { checkPrawne, checkRamka } from '../src/straznicy.mjs';
import { dniBezOplat, dokumentRamki } from '../src/aplikacja.mjs';
import { read } from './pomoc.mjs';

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
  const d = mkdtempSync(join(tmpdir(), 'atlas-z33-')); try {
    assert.throws(() => dniBezOplat(d), /npm run dane/);
    mkdirSync(join(d, 'app/lib'), { recursive: true }); writeFileSync(join(d, 'app/lib/access.ts'), 'export const PAYWALL = { ENABLED: true };\n');
    assert.throws(() => dniBezOplat(d), /FREE_TRAINING_DAYS_PER_MONTH/);
    writeFileSync(join(d, 'app/lib/access.ts'), 'export const PAYWALL = {\n  FREE_TRAINING_DAYS_PER_MONTH: 3,\n};\n'); assert.equal(dniBezOplat(d), 3);
  } finally { rmSync(d, { recursive: true, force: true }); }
});
