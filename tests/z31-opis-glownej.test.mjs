// Z-31 (znalezisko 06-tresci-002): akapit na stronie głównej nie twierdzi, że każde ćwiczenie ma wskazówki i zamienniki; liczba ćwiczeń pochodzi z danych.
// Dane eksportu: wskazówki 567, zamienniki 609 z 708 — więc zdanie o „opisie techniki” i „zamiennikach” przy wszystkich byłoby nieprawdziwe.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { buildOnce, requireData, ROOT } from './pomoc.mjs';
import { readJson, plural, fill } from '../src/lib.mjs';
import { czytaj, element, tekst } from './strona-html.mjs';

requireData();
const { out, ctx } = await buildOnce('z31-glowna', { jezyki: ['pl', 'en'] });

test('Z-31 strona główna: akapit z liczbą ćwiczeń z eksportu i bez twierdzenia o wskazówkach i zamiennikach przy wszystkich', () => {
  for (const l of ['pl', 'en']) {
    const ex = ctx.data[l].exercises, wszystkie = ex.length, zWskazowkami = ex.filter(e => e.cues.scope !== 'none').length, zZamiennikami = ex.filter(e => e.alternatives.length).length;
    assert.ok(zWskazowkami < wszystkie && zZamiennikami < wszystkie, 'dane się zmieniły: warunek testu (nie każde ćwiczenie ma wskazówki i zamienniki) nie zachodzi');
    const akapit = tekst(element(czytaj(out, `${l}/index.html`), 'p', 'licznik').wnetrze);
    assert.ok(akapit.startsWith(`${wszystkie} `), `${l}: „${akapit}” nie zaczyna się od liczby ćwiczeń z eksportu (${wszystkie})`);
    assert.doesNotMatch(akapit, /opis|wskaz|zamienni|technique|notes|tips|alternatives/i, `${l}: ${akapit}`);
  }
});

test('Z-31 countLine w 35 językach: każda forma liczby ma {n} i nie zawiera dawnego twierdzenia (opis techniki, mięśnie, zamienniki)', () => {
  const pliki = readdirSync(`${ROOT}/src/ui`).filter(f => f.endsWith('.json'));
  assert.equal(pliki.length, 35);
  for (const f of pliki) {
    const forms = readJson(`src/ui/${f}`).countLine, wszystkie = typeof forms === 'string' ? [forms] : Object.values(forms);
    for (const w of wszystkie) assert.ok(w.includes('{n}'), `${f}: ${w}`);
  }
  const pl = readJson('src/ui/pl.json'), l = n => fill(plural('pl', pl.countLine, n), { n });
  assert.match(l(1), /^1 ćwiczenie — /); assert.match(l(5), /^5 ćwiczeń — /);
  assert.doesNotMatch(JSON.stringify(readJson('src/ui/pl.json').countLine), /opisem techniki|zamiennikami/);
  assert.doesNotMatch(JSON.stringify(readJson('src/ui/en.json').countLine), /technique notes|alternatives/);
});
