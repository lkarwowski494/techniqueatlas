// Z-34 (zadanie 3): źródło „ui” w docs/przeklad/zrodla.json (zastępuje „ramka”) — mechanizm przekładu na prawdziwych plikach src/ui/, bez sieci i bez płatnych wywołań
// (nałożenie propozycji `zastosuj` jest lokalne). Lista kluczy czekających: docs/teksty/ui-do-przekladu-z33.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { wczytajZrodla } from '../scripts/przeklad/zrodla.mjs';
import { zTlumaczeniem, zastosuj } from '../scripts/przeklad/rdzen.mjs';
import { ROOT, tmpDir, read } from './pomoc.mjs';

const CZEKAJACE = ['prawne', 'prawneBrak', 'wsparcie', 'ramka'], zm = s => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort().join();
const kopia = () => { const d = tmpDir('atlas-ui-'); for (const f of ['config.json', 'docs/przeklad/zrodla.json', 'docs/nazwy/pl.json']) { mkdirSync(join(d, f, '..'), { recursive: true }); cpSync(join(ROOT, f), join(d, f)); } for (const k of ['src/ui', 'src/szablony', 'docs/teksty/prawne']) cpSync(join(ROOT, k), join(d, k), { recursive: true }); return d; };

test('Z-34 źródło „ui” zastępuje „ramka”: mapa src/ui/{pl,en}.json → src/ui/{kod}.json, bez znacznika oczekuje; pozycje to wszystkie teksty pl z angielskim odpowiednikiem i tymi samymi zmiennymi {…}', () => {
  const k = JSON.parse(read('docs/przeklad/zrodla.json')), ui = k.zrodla.find(z => z.id === 'ui');
  assert.equal(k.zrodla.some(z => z.id === 'ramka'), false); assert.ok(ui); assert.deepEqual([ui.rodzaj, ui.pl, ui.en, ui.cel, ui.oczekuje], ['mapa', 'src/ui/pl.json', 'src/ui/en.json', 'src/ui/{kod}.json', undefined]);
  const [z] = wczytajZrodla(ROOT, ['ui']); assert.equal(z.id, 'ui');
  for (const klucz of ['ramka.tytul', ...Array.from({ length: 8 }, (_, i) => `ramka.z${i + 1}`), 'wsparcie.w1', 'wsparcie.w2', 'wsparcie.w3', 'prawne.nav', 'prawne.privacy', 'prawneBrak.administrator']) assert.ok(z.pozycje.some(p => p.klucz === klucz), klucz);
  for (const p of z.pozycje) { assert.equal(typeof p.en, 'string', `${p.klucz}: brak angielskiego (countLine: en ma jeden napis zamiast form liczby mnogiej)`); assert.equal(zm(p.en), zm(p.pl), `${p.klucz}: zmienne pl ≠ en`); }
  assert.ok(z.pozycje.every(p => !p.klucz.startsWith('_')));
});

test('Z-34 źródło „ui”: do przekładu zostają dokładnie klucze czekające (prawne, prawneBrak, wsparcie, ramka) — istniejące tłumaczenia w src/ui/<kod>.json są pomijane (de, ja)', () => {
  const root = kopia(), [z] = wczytajZrodla(root, ['ui']);
  for (const kod of ['de', 'ja']) {
    const { pozycje, jest } = zTlumaczeniem(root, z, kod); assert.ok(jest);
    const brak = pozycje.filter(p => !p.tlumaczenie).map(p => p.klucz), oczekiwane = z.pozycje.filter(p => CZEKAJACE.includes(p.sciezka[0])).map(p => p.klucz);
    assert.deepEqual(brak, oczekiwane, kod); assert.ok(brak.length >= 15, `${kod}: ${brak.length}`);
  }
});

test('Z-34 źródło „ui”: nałożenie propozycji (lokalnie, bez sieci) dopisuje tylko brakujące klucze, zachowuje istniejące teksty i wcięcie pliku, pomija propozycje ze zmienionymi zmiennymi i klucze, które język już ma', () => {
  const root = kopia(), [z] = wczytajZrodla(root, ['ui']), przed = JSON.parse(readFileSync(join(root, 'src/ui/de.json'), 'utf8')), prop = {};
  for (const p of z.pozycje.filter(p => CZEKAJACE.includes(p.sciezka[0]))) prop[p.klucz] = `[de] ${p.pl}`;
  prop['wsparcie.w2'] = 'bez zmiennej'; prop.siteName = 'Nadpisanie'; /* zmienna {dni} zgubiona; klucz, który de już ma */
  const wyj = join(root, 'raport'); mkdirSync(join(wyj, 'ui'), { recursive: true }); writeFileSync(join(wyj, 'ui/de.json'), JSON.stringify({ propozycje: prop }));
  const w = zastosuj(root, wyj), tekst = readFileSync(join(root, 'src/ui/de.json'), 'utf8'), po = JSON.parse(tekst);
  assert.equal(w.zapisanych, Object.keys(prop).length - 2); assert.equal(po.siteName, przed.siteName); assert.equal(po.wsparcie?.w2, undefined);
  assert.equal(po.ramka.z5, `[de] ${z.pozycje.find(p => p.klucz === 'ramka.z5').pl}`); assert.deepEqual(Object.keys(po.ramka), ['tytul', ...Array.from({ length: 8 }, (_, i) => `z${i + 1}`)].filter(k => k in po.ramka));
  for (const k of Object.keys(przed)) if (!CZEKAJACE.includes(k)) assert.deepEqual(po[k], przed[k], k);
  assert.match(tekst, /^\{\n  "_opis"/, 'wcięcie 2 spacje jak w repo (bez przeformatowania całego pliku)');
  assert.deepEqual(w.pominietych.map(s => s.replace(/„.*”/, '„…”')).sort(), ['ui/de: zmienne „…”', 'ui/de: „…” istnieje (użyj --nadpisz, żeby zastąpić)']);
});

test('Z-34 źródło „ui”: język z jednym napisem zamiast form liczby mnogiej (countLine w de, ja) nie dostaje próśb o przekład form few/many i nie traci napisu przy nałożeniu', () => {
  const root = kopia(), [z] = wczytajZrodla(root, ['ui']), de = JSON.parse(readFileSync(join(root, 'src/ui/de.json'), 'utf8'));
  assert.equal(typeof de.countLine, 'string'); assert.ok(z.pozycje.some(p => p.klucz === 'countLine.few'), 'pl ma formy liczby mnogiej');
  const wyj = join(root, 'raport'); mkdirSync(join(wyj, 'ui'), { recursive: true }); writeFileSync(join(wyj, 'ui/de.json'), JSON.stringify({ propozycje: { 'countLine.few': '{n} Übungen (few)', 'countLine.one': '{n} Übung' } }));
  const w = zastosuj(root, wyj); assert.equal(w.zapisanych, 0); assert.equal(JSON.parse(readFileSync(join(root, 'src/ui/de.json'), 'utf8')).countLine, de.countLine);
});
