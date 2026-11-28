// KO-147 P3 (BQ2 c): każdy napis z liczbą ({n}) w src/ui i szablonach ma formy liczby mnogiej wg Intl.PluralRules języka, jeśli język ma więcej niż jedną kategorię.
// Napis (string) bez form jest poprawny tylko dla języka z jedną kategorią (other: ja, ko, zh-Hant, vi, id, ms) — dla pozostałych błędny przy małych liczbach (np. „1 exercises”).
// Wyjątki są nazwane i uzasadnione (WYJATKI niżej). Test strukturalny: nie ocenia brzmienia form (to robi przegląd API).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../src/lib.mjs';

const JEZYKI = JSON.parse(readFileSync(join(ROOT, 'config.json'), 'utf8')).jezyki;
const JSON_ = rel => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
const KAT = ['zero', 'one', 'two', 'few', 'many', 'other'];
const jestFraza = v => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0 && Object.keys(v).every(k => KAT.includes(k));
/** Wszystkie napisy z liczbą {n}: ścieżka → tekst (dla fraz z formami: ścieżka.kategoria). */
const napisy = (o, p = '', w = {}) => { for (const [k, v] of Object.entries(o)) { if (typeof v === 'string') { if (v.includes('{n}')) w[p + k] = v; } else if (jestFraza(v)) { for (const [kk, vv] of Object.entries(v)) if (typeof vv === 'string' && vv.includes('{n}')) w[`${p}${k}.${kk}`] = vv; } else if (v && typeof v === 'object' && !Array.isArray(v)) napisy(v, p + k + '.', w); } return w; };
/** Wyjątki (klucz ui → powód); każdy dotyczy napisu, którego rzeczownik nie zależy od {n} albo nie występuje. */
const WYJATKI = {
  wszystkieJezyki: 'liczba w nawiasie po słowie „języki”, bez rzeczownika zależnego od {n} (wartość = 35 języków)',
  wynik: 'rzeczownik zależy od {m} (razem w bibliotece, zawsze ≥ 2: 708), nie od {n}',
};

test('liczba mnoga w napisach: strażnik, że źródło pl ma napis z liczbą (test nie przechodzi na pustych danych)', () => {
  assert.ok(Object.keys(napisy(JSON_('src/ui/pl.json'))).some(k => k.startsWith('countLine.')));
});

for (const l of JEZYKI) {
  const kat = new Intl.PluralRules(l).resolvedOptions().pluralCategories;
  test(`napisy z liczbą w src/ui/${l}.json: ${kat.length > 1 ? `formy (${kat.join(', ')}) zamiast pojedynczego napisu` : 'jedna kategoria — napis wystarcza'}`, () => {
    const zle = [];
    for (const [sciezka, tekst] of Object.entries(napisy(JSON_(`src/ui/${l}.json`)))) {
      const klucz = sciezka.split('.')[0];
      if (WYJATKI[klucz]) continue;
      if (kat.length > 1 && sciezka === klucz) zle.push(`${klucz}: napis bez form liczby („${tekst}”), wymagane ${kat.join(', ')}`);
    }
    assert.deepEqual(zle, []);
  });
  test(`napisy z liczbą w src/szablony/${l}.json: {n} razem z rzeczownikiem z form ({pozycji} albo {opisow})`, () => {
    const sz = JSON_(`src/szablony/${l}.json`), zle = [];
    for (const [sciezka, tekst] of Object.entries(napisy(sz))) if (!/\{(pozycji|opisow)\}/.test(tekst)) zle.push(`${sciezka}: „${tekst}” bez rzeczownika z form`);
    assert.deepEqual(zle, []);
  });
}
