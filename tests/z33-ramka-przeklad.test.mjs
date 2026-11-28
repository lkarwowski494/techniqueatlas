// KO-141 e): ramka „w aplikacji” w 33 językach z przekładu API. Źródło przekładu: docs/teksty/ramka/{pl,en}.json (docs/przeklad/zrodla.json, źródło „ramka”) — kopia zdań z src/ui/{pl,en}.json,
// więc test pilnuje zgodności źródła z tekstami stron oraz kompletności przekładu (tytuł z {nazwa} i 8 zdań) w każdym języku z config.json.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../src/lib.mjs';

const json = rel => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
const KLUCZE = ['tytul', ...Array.from({ length: 8 }, (_, i) => `z${i + 1}`)];
const JEZYKI = json('config.json').jezyki.filter(l => l !== 'pl' && l !== 'en');

for (const l of ['pl', 'en']) test(`ramka: źródło przekładu docs/teksty/ramka/${l}.json = ramka z src/ui/${l}.json (tytuł i 8 zdań)`, () => {
  assert.deepEqual(json(`docs/teksty/ramka/${l}.json`), Object.fromEntries(KLUCZE.map(k => [k, json(`src/ui/${l}.json`).ramka[k]])));
});

test(`ramka: ${JEZYKI.length} języków z config.json ma docs/teksty/ramka/<kod>.json z tytułem ({nazwa}) i 8 niepustymi zdaniami, innymi niż polskie i angielskie`, () => {
  const pl = json('docs/teksty/ramka/pl.json'), en = json('docs/teksty/ramka/en.json'), zle = [];
  for (const l of JEZYKI) {
    const f = `docs/teksty/ramka/${l}.json`; if (!existsSync(join(ROOT, f))) { zle.push(`${l}: brak pliku`); continue; }
    const r = json(f);
    for (const k of KLUCZE) if (typeof r[k] !== 'string' || !r[k].trim()) zle.push(`${l}.${k}: pusty`); else if (r[k] === pl[k] || r[k] === en[k]) zle.push(`${l}.${k}: taki jak pl albo en`);
    if (!/\{nazwa\}/.test(r.tytul ?? '')) zle.push(`${l}.tytul: brak {nazwa}`);
  }
  assert.deepEqual(zle, []);
});
