// BQ2 e): źródło „ui” (src/ui/{pl,en}.json → src/ui/{kod}.json) w mechanizmie przekładu API. Bez sieci i bez klucza; fixtura w katalogu tymczasowym, niezależna od danych strony.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { wczytajZrodla, pozycjeDlaJezyka } from '../scripts/przeklad/zrodla.mjs';
import { zastosuj } from '../scripts/przeklad/rdzen.mjs';
import { ROOT } from './pomoc.mjs';

let licznik = 0; const katalogi = []; process.on('exit', () => { for (const d of katalogi) rmSync(d, { recursive: true, force: true }); }); /* katalog tymczasowy własny: sprzatanie.test.mjs (integracja) wymaga tmpDir z pomoc.mjs, którego main nie ma */
const zapisz = (root, f, o) => { mkdirSync(join(root, f, '..'), { recursive: true }); writeFileSync(join(root, f), JSON.stringify(o, null, 2) + '\n'); };
const czytaj = (root, f) => JSON.parse(readFileSync(join(root, f), 'utf8'));
function fixtura() {
  const root = join(tmpdir(), `zrodlo-ui-${process.pid}-${Date.now()}-${++licznik}`); mkdirSync(root, { recursive: true }); katalogi.push(root);
  zapisz(root, 'config.json', { jezyki: ['pl', 'en', 'de', 'ja'] });
  mkdirSync(join(root, 'docs/przeklad'), { recursive: true }); cpSync(join(ROOT, 'docs/przeklad/zrodla.json'), join(root, 'docs/przeklad/zrodla.json'));
  const pl = { countLine: { one: '{n} ćwiczenie', few: '{n} ćwiczenia', many: '{n} ćwiczeń', other: '{n} ćwiczenia' }, wsparcie: { w2: 'Aplikacja daje {dni} dni.' }, tytul: 'Tytuł' };
  const en = { countLine: { one: '{n} exercise', other: '{n} exercises' }, wsparcie: { w2: 'The app gives {dni} days.' }, tytul: 'Title' };
  zapisz(root, 'src/ui/pl.json', pl); zapisz(root, 'src/ui/en.json', en);
  zapisz(root, 'src/ui/de.json', { countLine: { one: '{n} Übung', other: '{n} Übungen' }, tytul: 'Titel' });
  zapisz(root, 'src/ui/ja.json', { countLine: '{n}種目', tytul: 'タイトル' });
  zapisz(root, 'docs/nazwy/pl.json', { 'Bench Press': 'Wyciskanie' }); zapisz(root, 'src/szablony/pl.json', { sprzet: 'Sprzęt: {lista}.' }); zapisz(root, 'src/szablony/en.json', { sprzet: 'Equipment: {lista}.' });
  mkdirSync(join(root, 'docs/teksty/prawne'), { recursive: true }); writeFileSync(join(root, 'docs/teksty/prawne/polityka.pl.md'), '# Polityka\n'); writeFileSync(join(root, 'docs/teksty/prawne/polityka.en.md'), '# Policy\n'); /* pozostałe źródła z zrodla.json muszą się wczytać */
  return root;
}

test('zrodla.json: źródło „ui” (mapa src/ui/{pl,en}.json → src/ui/{kod}.json) zastępuje „ramka”, bez znacznika oczekuje', () => {
  const k = JSON.parse(readFileSync(join(ROOT, 'docs/przeklad/zrodla.json'), 'utf8')), ui = k.zrodla.find((z) => z.id === 'ui');
  assert.ok(ui && !k.zrodla.some((z) => z.id === 'ramka'));
  assert.deepEqual([ui.rodzaj, ui.pl, ui.en, ui.cel, ui.oczekuje], ['mapa', 'src/ui/pl.json', 'src/ui/en.json', 'src/ui/{kod}.json', undefined]);
});

test('pozycje źródła „ui”: klucze zagnieżdżone, a forma pl bez odpowiednika en (few, many) ma angielski zapas `other`', () => {
  const [z] = wczytajZrodla(fixtura(), ['ui']), poz = (k) => z.pozycje.find((p) => p.klucz === k);
  assert.equal(poz('wsparcie.w2').en, 'The app gives {dni} days.');
  assert.equal(poz('countLine.few').en, '{n} exercises'); assert.equal(poz('countLine.many').en, '{n} exercises'); assert.equal(poz('countLine.one').en, '{n} exercise');
});

test('formy liczby mnogiej wg kategorii języka docelowego: de ma one, other; ja tylko other', () => {
  const [z] = wczytajZrodla(fixtura(), ['ui']), k = (kod) => pozycjeDlaJezyka(z, kod).filter((p) => p.klucz.startsWith('countLine.')).map((p) => p.klucz.split('.')[1]).sort();
  assert.deepEqual(k('de'), ['one', 'other']); assert.deepEqual(k('ja'), ['other']);
});

test('nałożenie: brakujący klucz dopisany z wcięciem 2 spacje; istniejące teksty i napis zamiast drzewa (ja countLine) nietknięte także z --nadpisz', () => {
  const root = fixtura(), wyj = join(root, 'raport'), ja0 = czytaj(root, 'src/ui/ja.json'), de0 = czytaj(root, 'src/ui/de.json');
  zapisz(root, 'raport/ui/de.json', { propozycje: { 'wsparcie.w2': 'Die App gibt {dni} Tage.', 'tytul': 'ZMIENIONY' } });
  zapisz(root, 'raport/ui/ja.json', { propozycje: { 'countLine.other': '{n} 種目 (nowy)' } });
  const w = zastosuj(root, wyj);
  assert.equal(czytaj(root, 'src/ui/de.json').wsparcie.w2, 'Die App gibt {dni} Tage.'); assert.equal(czytaj(root, 'src/ui/de.json').tytul, de0.tytul);
  assert.match(readFileSync(join(root, 'src/ui/de.json'), 'utf8'), /^\{\n  "countLine"/);
  assert.deepEqual(czytaj(root, 'src/ui/ja.json'), ja0); assert.ok(w.pominietych.some((s) => /napis zamiast drzewa/.test(s)), w.pominietych.join('\n'));
  const w2 = zastosuj(root, wyj, { nadpisz: true }); assert.deepEqual(czytaj(root, 'src/ui/ja.json'), ja0); assert.ok(w2.pominietych.some((s) => /napis zamiast drzewa/.test(s)));
});

test('workflowy przekładu i przeglądu: przy galaz_tekstow pobierają z gałęzi także src/ui (źródło „ui” czyta teksty z gałęzi); uprawnienia contents: read bez zmian (KO-149)', () => {
  for (const f of ['przeklad-tlumaczen.yml', 'przeglad-tlumaczen.yml']) {
    const y = readFileSync(join(ROOT, '.github/workflows', f), 'utf8');
    assert.match(y, /for P in docs\/nazwy docs\/teksty src\/szablony src\/ui; do/, `${f}: lista ścieżek z gałęzi tekstów bez src/ui`);
    assert.match(y, /git checkout FETCH_HEAD -- "\$P"/, `${f}: pobranie ścieżki z FETCH_HEAD`);
    assert.match(y, /permissions:\n  contents: read\n/, `${f}: uprawnienia tylko do odczytu`);
  }
});
