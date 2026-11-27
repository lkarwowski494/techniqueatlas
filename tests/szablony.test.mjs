// Z-22: szablony tytułu, opisu (meta description), nagłówków-pytań i krótkiej odpowiedzi (pl, en) — wyłącznie z danych eksportu i tekstów stałych.
// Sprawdza: długości w granicach z docs/teksty/szablony-stron.md, brak powtórzeń słów między tytułem a opisem, unikalność, tylko dane (wskazówki dosłownie z eksportu),
// pytania tylko przy sekcjach z treścią oraz zgodność tabeli wzorców w dokumencie z wynikiem generatora (tabela nie może się rozjechać z kodem).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireData, read } from './pomoc.mjs';
import { readJson } from '../src/lib.mjs';
import { LIMITY, WZORCE, JEZYKI, rdzenie, wspolne, szablonyCwiczenia, szablonyGlownej, szablonyListy, szablonyKategorii, tabelaWzorcow } from '../src/szablony.mjs';

requireData();
const dane = Object.fromEntries(JEZYKI.map(l => [l, readJson(`.cache/dane/atlas-${l}.json`)]));
const ui = Object.fromEntries(JEZYKI.map(l => [l, readJson(`src/ui/${l}.json`)]));
const wlasne = e => e.cues.scope === 'own' && !e.cues.missing;
const dl = s => [...s].length;

test('rdzenie: wielkość liter, odmiana (5 pierwszych liter), słowa krótkie i słowa pomijane', () => {
  assert.deepEqual(wspolne('pl', 'Wyciskanie sztangi', 'Wyciskania ze sztangą'), ['wycis', 'sztan']);
  assert.deepEqual(wspolne('en', 'Bench Press', 'press the bar'), ['press']);
  assert.deepEqual(wspolne('en', 'Pull with the bar', 'with the arms'), []);
  assert.deepEqual([...rdzenie('pl', 'i na do ze')], []);
});

for (const lang of JEZYKI) {
  const d = dane[lang], wyniki = d.exercises.map(e => ({ e, s: szablonyCwiczenia(d, ui[lang], lang, e) }));

  test(`${lang}: tytuł ćwiczenia — niepusty, w limicie, unikalny, bez słów powtórzonych w opisie`, () => {
    const zle = wyniki.filter(({ s }) => !s.tytul || dl(s.tytul) > LIMITY.tytul.max).map(({ e, s }) => `${e.slug}: ${s.tytul}`);
    assert.deepEqual(zle, []);
    const t = wyniki.map(({ s }) => s.tytul); assert.equal(new Set(t).size, t.length, 'tytuły nieunikalne');
    const powt = wyniki.map(({ e, s }) => [e.slug, wspolne(lang, s.tytul, s.opis)]).filter(([, w]) => w.length);
    assert.deepEqual(powt, []);
  });

  test(`${lang}: opis ćwiczenia indeksowanego — długość ${LIMITY.opis.min}–${LIMITY.opis.max}, unikalny; każdy opis ≤ max`, () => {
    const zaDlugie = wyniki.filter(({ s }) => dl(s.opis) > LIMITY.opis.max).map(({ e }) => e.slug);
    assert.deepEqual(zaDlugie, []);
    const idx = wyniki.filter(({ e }) => wlasne(e));
    assert.equal(idx.length, 310, 'liczba ćwiczeń z własnymi wskazówkami (P-1) — zmiana danych wymaga przeglądu szablonów');
    const krotkie = idx.filter(({ s }) => dl(s.opis) < LIMITY.opis.min).map(({ e, s }) => `${e.slug}: ${s.opis}`);
    assert.deepEqual(krotkie, []);
    const o = idx.map(({ s }) => s.opis); assert.equal(new Set(o).size, o.length, 'opisy indeksowanych nieunikalne');
  });

  test(`${lang}: tylko dane — wskazówki w opisie i krótkiej odpowiedzi to dosłowne zdania eksportu, wskazówki ogólne nigdy`, () => {
    for (const { e, s } of wyniki) {
      const zdania = [...s.czesciOpisu, ...s.czesciOdpowiedzi].filter(c => c.zrodlo.startsWith('cues.'));
      for (const c of zdania) {
        assert.ok(wlasne(e), `${e.slug}: wskazówka w opisie ćwiczenia bez własnych wskazówek`);
        const [, k, i] = c.zrodlo.split('.'); assert.equal(c.tekst, e.cues[k][+i], `${e.slug}: ${c.zrodlo}`);
      }
    }
  });

  test(`${lang}: krótka odpowiedź — w limicie, zawiera ruch przy własnych wskazówkach`, () => {
    for (const { e, s } of wyniki) {
      assert.ok(dl(s.odpowiedz) <= LIMITY.odpowiedz.max, `${e.slug}: ${dl(s.odpowiedz)}`);
      if (wlasne(e) && e.cues.move?.length) assert.ok(s.odpowiedz.startsWith(e.cues.move[0]), e.slug);
    }
  });

  test(`${lang}: nagłówki-pytania tylko przy sekcjach z treścią, bez nazwy ćwiczenia, zakończone znakiem zapytania`, () => {
    for (const { e, s } of wyniki) {
      const ma = { setup: wlasne(e) && e.cues.setup?.length, move: wlasne(e) && e.cues.move?.length, tips: wlasne(e) ? e.cues.tips?.length : e.cues.ok?.length, mistakes: e.cues.mistakes?.length, sprzet: e.requires.length, zamienniki: e.alternatives.length, miesnie: e.regions.length };
      for (const [k, v] of Object.entries(ma)) assert.equal(k in s.pytania, !!v, `${e.slug}: ${k}`);
      for (const q of Object.values(s.pytania)) { assert.match(q, /\?$/); assert.ok(!q.includes(e.name), e.slug); }
    }
  });

  test(`${lang}: strona główna, lista i kategorie — tytuły unikalne, opisy unikalne i w limicie, bez powtórzeń z tytułem`, () => {
    const strony = [szablonyGlownej(d, ui[lang], lang), szablonyListy(d, ui[lang], lang), ...szablonyKategorii(d, ui[lang], lang)];
    for (const s of strony) {
      assert.ok(dl(s.tytul) <= LIMITY.tytul.max && dl(s.opis) >= LIMITY.opis.min && dl(s.opis) <= LIMITY.opis.max, `${s.tytul} | ${s.opis}`);
      assert.deepEqual(wspolne(lang, s.tytul, s.opis), [], s.tytul);
    }
    for (const k of ['tytul', 'opis']) { const v = strony.map(s => s[k]); assert.equal(new Set(v).size, v.length, k); }
  });
}

test('wzorce: 5 ćwiczeń o różnym profilu danych istnieje w eksporcie', () => {
  for (const w of WZORCE) assert.ok(dane.pl.exercises.some(e => e.slug === w.slug), w.slug);
});

test('docs/teksty/szablony-stron.md zawiera aktualną tabelę wzorców (npm run szablony)', () => {
  const doc = read('docs/teksty/szablony-stron.md');
  const tabela = tabelaWzorcow(dane, ui);
  assert.ok(doc.includes(tabela), 'tabela w dokumencie różni się od wyniku generatora — uruchom: node src/szablony.mjs i wklej tabelę');
});
