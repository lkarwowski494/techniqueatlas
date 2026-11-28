// KO-141 (a): liczba mnoga w szablonach i tekstach stałych — dla KAŻDEGO języka z config.json i każdej frazy z formami liczby (obiekt z kategoriami CLDR)
// sprawdzamy: (1) istnieją formy wymagane przez Intl.PluralRules tego języka (niepuste), (2) dla liczb próbnych plural() wybiera formę kategorii liczby, nie zapasową `other`.
// Test strukturalny: nie rozstrzyga, czy brzmienie formy jest poprawne (zamiana dwóch istniejących form) — to sprawdza przegląd przez API (docs/przeklad/README.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, plural } from '../src/lib.mjs';

const JEZYKI = JSON.parse(readFileSync(join(ROOT, 'config.json'), 'utf8')).jezyki;
const KATEGORIE = ['zero', 'one', 'two', 'few', 'many', 'other'];
const PROBNE = [0, 1, 2, 3, 5, 11, 21, 22, 25, 101, 102, 708];
const JSON_ = rel => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
const jestFraza = v => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0 && Object.keys(v).every(k => KATEGORIE.includes(k));
/** Wszystkie frazy z formami liczby w pliku: ścieżka → obiekt form. */
const frazy = (o, p = '', w = {}) => { for (const [k, v] of Object.entries(o)) { if (jestFraza(v)) w[p + k] = v; else if (v && typeof v === 'object' && !Array.isArray(v)) frazy(v, p + k + '.', w); } return w; };
const ZRODLA = [['szablony', l => `src/szablony/${l}.json`], ['ui', l => `src/ui/${l}.json`]];

test('liczba mnoga: każdy język z config.json ma plik szablonów, a w szablonach są frazy z formami liczby (strażnik, że test nie przechodzi na pustych danych)', () => {
  for (const l of JEZYKI) assert.ok(existsSync(join(ROOT, `src/szablony/${l}.json`)), l);
  for (const l of JEZYKI) assert.ok(Object.keys(frazy(JSON_(`src/szablony/${l}.json`))).length >= 2, l);
});

for (const l of JEZYKI) {
  const kat = new Intl.PluralRules(l).resolvedOptions().pluralCategories;
  for (const [zrodlo, sciezka] of ZRODLA) {
    const f = frazy(JSON_(sciezka(l)));
    test(`liczba mnoga ${l} (${zrodlo}): formy wymagane przez Intl.PluralRules (${kat.join(', ')}) istnieją i są niepuste`, () => {
      const brak = [];
      for (const [klucz, formy] of Object.entries(f)) for (const k of kat) if (typeof formy[k] !== 'string' || !formy[k].trim()) brak.push(`${klucz}.${k}`);
      assert.deepEqual(brak, []);
    });
    test(`liczba mnoga ${l} (${zrodlo}): dla liczb próbnych ${PROBNE.join(', ')} plural() wybiera formę kategorii liczby, nie zapasową other`, () => {
      const zle = [], pr = new Intl.PluralRules(l);
      for (const [klucz, formy] of Object.entries(f)) for (const n of PROBNE) {
        const k = pr.select(n);
        if (typeof formy[k] !== 'string') { zle.push(`${klucz} n=${n} kategoria ${k}: brak formy`); continue; }
        if (plural(l, formy, n) !== formy[k]) zle.push(`${klucz} n=${n}: plural() ≠ forma ${k}`);
      }
      assert.deepEqual(zle, []);
    });
  }
}
