// KO-146: przekład i przegląd frazy z formami liczby mnogiej (obiekt z kluczami kategorii CLDR) — formy według Intl.PluralRules JĘZYKA DOCELOWEGO, nie polskiego źródła.
// Bez tego sl nie dostaje `two`, lv `zero`, a języki bez rozróżnienia (ja, ko, vi…) dostają zbędne formy. Bez sieci i bez klucza.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import * as rdzen from '../scripts/przeklad/rdzen.mjs';
import * as zrodla from '../scripts/przeklad/zrodla.mjs';

const sprzatanie = [];
process.on('exit', () => { for (const d of sprzatanie) rmSync(d, { recursive: true, force: true }); });
const zapisz = (root, f, tresc) => { mkdirSync(dirname(join(root, f)), { recursive: true }); writeFileSync(join(root, f), JSON.stringify(tresc, null, 1) + '\n'); };
const czytaj = p => JSON.parse(readFileSync(p, 'utf8'));
const KODY = ['sl', 'lv', 'ja', 'cs', 'pl'];

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'mnoga-')); sprzatanie.push(root);
  zapisz(root, 'config.json', { jezyki: ['pl', 'en', 'sl', 'lv', 'ja', 'cs'] });
  zapisz(root, 'src/szablony/pl.json', { sprzet: 'Sprzęt: {lista}.', opis: '{n} {opisow}', opisow: { one: 'opis', few: 'opisy', many: 'opisów', other: 'opisu' } });
  zapisz(root, 'src/szablony/en.json', { sprzet: 'Equipment: {lista}.', opis: '{n} {opisow}', opisow: { one: 'description', other: 'descriptions' } });
  zapisz(root, 'docs/przeklad/zrodla.json', { zrodla: [{ id: 'szablony', rodzaj: 'mapa', pl: 'src/szablony/pl.json', en: 'src/szablony/en.json', cel: 'src/szablony/{kod}.json', opis: 'szablony' }] });
  zapisz(root, '.cache/dane/slownik-terminow.json', { pojecia: [] });
  zapisz(root, 'docs/slownik-strony.json', { pojecia: [] });
  return root;
}
const klucze = (root, kod) => zrodla.pozycjeDlaJezyka(zrodla.wczytajZrodla(root)[0], kod).map(p => p.klucz);
const uruchom = async (root, argv) => { const logi = []; const kod = await rdzen.main('przeklad', argv, {}, { fetchFn: async () => { throw new Error('bez sieci'); }, log: s => logi.push(String(s)), root, spij: async () => {} }); return { kod, logi }; };

test('pozycje dla języka: sl ma one, two, few, other (nie polskie many); lv zero, one, other; ja tylko other; cs one, few, many, other', () => {
  const root = fixture(), ile = (k) => k.filter(x => x.startsWith('opisow.')).sort();
  assert.deepEqual(ile(klucze(root, 'sl')), ['opisow.few', 'opisow.one', 'opisow.other', 'opisow.two']);
  assert.deepEqual(ile(klucze(root, 'lv')), ['opisow.one', 'opisow.other', 'opisow.zero']);
  assert.deepEqual(ile(klucze(root, 'ja')), ['opisow.other']);
  assert.deepEqual(ile(klucze(root, 'cs')), ['opisow.few', 'opisow.many', 'opisow.one', 'opisow.other']);
});

test('pozycje dla języka: pozostałe pozycje bez zmian, identyfikatory unikalne, forma ma kategorię i liczby przykładowe z Intl.PluralRules', () => {
  const root = fixture(), z = zrodla.wczytajZrodla(root)[0], p = zrodla.pozycjeDlaJezyka(z, 'sl');
  assert.deepEqual(p.filter(x => !x.klucz.startsWith('opisow.')).map(x => x.klucz), ['sprzet', 'opis']);
  assert.equal(new Set(p.map(x => x.id)).size, p.length);
  const dwa = p.find(x => x.klucz === 'opisow.two'); assert.equal(dwa.kategoria, 'two');
  const pr = new Intl.PluralRules('sl'); assert.ok(dwa.przyklady.length >= 2 && dwa.przyklady.every(n => pr.select(n) === 'two'), JSON.stringify(dwa.przyklady));
  assert.match(dwa.pl, /^opisy$/, 'źródło polskie: forma polska dla tej samej liczby (2 → few)');
});

test('prompt przekładu sl: pozycje liczby mnogiej niosą pole „forma” z kategorią i liczbami; system opisuje to pole', () => {
  const root = fixture(), z = zrodla.wczytajZrodla(root)[0], zad = rdzen.budujZadanie('przeklad', { ...z, pozycje: zrodla.pozycjeDlaJezyka(z, 'sl') }, 'sl', null);
  const lista = JSON.parse(zad.messages[0].content.split('\n').pop()), dwa = lista.find(x => /two/.test(x.forma ?? ''));
  assert.ok(dwa, 'brak pola forma z kategorią two'); assert.match(zad.system, /forma/);
});

test('--zastosuj sl i lv: nakłada formy two i zero (klucze spoza polskich kategorii)', async () => {
  const root = fixture(), wyj = join(root, 'raport');
  zapisz(root, 'raport/szablony/sl.json', { propozycje: { 'opisow.two': 'DVA', 'opisow.one': 'ENA', 'opisow.few': 'TRI', 'opisow.other': 'VEC' } });
  zapisz(root, 'raport/szablony/lv.json', { propozycje: { 'opisow.zero': 'NULLE', 'opisow.one': 'VIENS', 'opisow.other': 'CITI' } });
  const r = await uruchom(root, ['--zastosuj', wyj]); assert.equal(r.kod, 0, r.logi.join('\n'));
  assert.deepEqual(czytaj(join(root, 'src/szablony/sl.json')).opisow, { two: 'DVA', one: 'ENA', few: 'TRI', other: 'VEC' });
  assert.equal(czytaj(join(root, 'src/szablony/lv.json')).opisow.zero, 'NULLE');
  assert.doesNotMatch(r.logi.join('\n'), /spoza źródła/);
});

test('przegląd (odczyt celów): sl widzi formę two z pliku celu jako pozycję do oceny', () => {
  const root = fixture(); zapisz(root, 'src/szablony/sl.json', { opisow: { two: 'DVA', one: 'ENA' } });
  const t = rdzen.zTlumaczeniem(root, zrodla.wczytajZrodla(root)[0], 'sl');
  assert.equal(t.pozycje.find(x => x.klucz === 'opisow.two').tlumaczenie, 'DVA');
});

test('pozycje dla języka: powtórne przepisanie (zTlumaczeniem na już przepisanych pozycjach) nie zmienia wyniku', () => {
  const root = fixture(), z = zrodla.wczytajZrodla(root)[0], raz = zrodla.pozycjeDlaJezyka(z, 'sl');
  assert.deepEqual(zrodla.pozycjeDlaJezyka({ ...z, pozycje: raz }, 'sl'), raz);
});
