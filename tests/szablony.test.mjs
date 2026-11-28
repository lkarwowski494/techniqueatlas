// Z-22: szablony tytułu, opisu (meta description), nagłówków-pytań i krótkiej odpowiedzi (pl, en) — wyłącznie z danych eksportu i tekstów stałych.
// Sprawdza: długości w granicach z docs/teksty/szablony-stron.md, brak powtórzeń słów między tytułem a opisem, unikalność, tylko dane (wskazówki dosłownie z eksportu),
// pytania tylko przy sekcjach z treścią oraz zgodność tabeli wzorców w dokumencie z wynikiem generatora (tabela nie może się rozjechać z kodem).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireData, read } from './pomoc.mjs';
import { readJson, fill } from '../src/lib.mjs';
import { LIMITY, WZORCE, JEZYKI, rdzenie, wspolne, szablonyCwiczenia, szablonyCwiczen, szablonyGlownej, szablonyListy, szablonyKategorii, tabelaWzorcow } from '../src/szablony.mjs';

requireData();
const dane = Object.fromEntries(JEZYKI.map(l => [l, readJson(`.cache/dane/atlas-${l}.json`)]));
const ui = Object.fromEntries(JEZYKI.map(l => [l, readJson(`src/ui/${l}.json`)]));
const SZ = Object.fromEntries(JEZYKI.map(l => [l, readJson(`src/szablony/${l}.json`)]));
const wlasne = e => e.cues.scope === 'own' && !e.cues.missing;
const dl = s => [...s].length;

test('rdzenie: wielkość liter, odmiana (5 pierwszych liter), słowa krótkie i słowa pomijane', () => {
  assert.deepEqual(wspolne('pl', 'Wyciskanie sztangi', 'Wyciskania ze sztangą'), ['wycis', 'sztan']);
  assert.deepEqual(wspolne('en', 'Bench Press', 'press the bar'), ['press']);
  assert.deepEqual(wspolne('en', 'Pull with the bar', 'with the arms'), []);
  assert.deepEqual([...rdzenie('pl', 'i na do ze')], []);
});

for (const lang of JEZYKI) {
  const d = dane[lang], mapa = szablonyCwiczen(d, ui[lang], lang), wyniki = d.exercises.map(e => ({ e, s: mapa.get(e.slug) }));

  test(`${lang}: tytuł ćwiczenia — niepusty, w limicie, unikalny, bez słów powtórzonych w opisie`, () => {
    const zle = wyniki.filter(({ s }) => !s.tytul || dl(s.tytul) > LIMITY.tytul.max).map(({ e, s }) => `${e.slug}: ${s.tytul}`);
    assert.deepEqual(zle, []);
    const t = wyniki.map(({ s }) => s.tytul); assert.equal(new Set(t).size, t.length, 'tytuły nieunikalne');
    /* powtórzenie dozwolone tylko w zdaniach nazwanych w `wyjatek` (rozdzielenie opisów, które bez nich byłyby identyczne — tylko strony indeksowane) */
    for (const { e, s } of wyniki) {
      const bez = s.czesciOpisu.filter(z => !s.wyjatek.includes(z.zrodlo)).map(z => z.tekst).join(' ');
      assert.deepEqual(wspolne(lang, s.tytul, bez), [], `${e.slug}: ${s.tytul} | ${s.opis}`);
      if (s.wyjatek.length) assert.ok(wlasne(e), `${e.slug}: wyjątek od zakazu powtórzeń poza stroną indeksowaną`);
    }
  });

  test(`${lang}: opis ćwiczenia indeksowanego — długość ${LIMITY.opis.min}–${LIMITY.opis.max}, unikalny; każdy opis ≤ max`, () => {
    const zaDlugie = wyniki.filter(({ s }) => dl(s.opis) > LIMITY.opis.max).map(({ e }) => e.slug);
    assert.deepEqual(zaDlugie, []);
    const idx = wyniki.filter(({ e }) => wlasne(e));
    assert.equal(idx.length, 310, 'liczba ćwiczeń z własnymi wskazówkami (P-1) — zmiana danych wymaga przeglądu szablonów');
    /* krótszy niż minimum tylko wtedy, gdy dane się wyczerpały: poniżej minimum wchodzą też zdania z powtórzeniem słowa tytułu (06-tresci-007, SZ-5),
       więc jedynym powodem pominięcia zdania w krótkim opisie jest limit długości (nie dopisujemy tekstu spoza danych); próg krótkich opisów 0 */
    const krotkie = idx.filter(({ s }) => dl(s.opis) < LIMITY.opis.min);
    for (const { e, s } of krotkie) for (const z of s.pominiete) assert.ok(dl(`${s.opis} ${z.tekst}`) > LIMITY.opis.max, `${e.slug}: pominięte ${z.zrodlo} (${z.powod}) przy opisie krótszym niż ${LIMITY.opis.min}`);
    assert.equal(krotkie.length, 0, `opisów krótszych niż ${LIMITY.opis.min} znaków: ${krotkie.map(({ e, s }) => `${e.slug} „${s.opis}”`).join('; ')}`);
    /* opis z samej partii mięśniowej (np. „Muscle group: other.”) nic nie mówi o stronie */
    const samaPartia = idx.filter(({ s }) => s.czesciOpisu.every(z => z.zrodlo === 'group' || z.zrodlo === 'family')).map(({ e, s }) => `${e.slug} „${s.opis}”`);
    assert.deepEqual(samaPartia, []);
    for (const { e, s } of krotkie) assert.ok(s.opis.length, `${e.slug}: pusty opis`);
    /* powtórzony opis dozwolony tylko, gdy ćwiczenia mają identyczne dane (mięśnie, sprzęt, wskazówki) — różnią się wyłącznie nazwą */
    const po = new Map(); for (const { e, s } of idx) po.set(s.opis, [...(po.get(s.opis) ?? []), e]);
    for (const grupa of [...po.values()].filter(g => g.length > 1)) {
      const klucz = e => JSON.stringify([e.regions, e.requires, e.cues]);
      assert.ok(grupa.every(e => klucz(e) === klucz(grupa[0])), `opis powtórzony przy różnych danych: ${grupa.map(e => e.slug).join(', ')}`);
    }
  });

  test(`${lang}: tylko dane — wskazówki w opisie i krótkiej odpowiedzi to dosłowne zdania eksportu, wskazówki ogólne nigdy`, () => {
    for (const { e, s } of wyniki) {
      const zdania = [...s.czesciOpisu, ...s.czesciOdpowiedzi].filter(c => c.zrodlo.startsWith('cues.'));
      for (const c of zdania) {
        assert.ok(wlasne(e), `${e.slug}: wskazówka w opisie ćwiczenia bez własnych wskazówek`);
        /* zdanie z listy błędów stoi w ramce tekstu stałego (06-tresci-001), reszta wskazówek dosłownie */
        const [, k, i] = c.zrodlo.split('.'); assert.equal(c.tekst, k === 'mistakes' ? fill(SZ[lang].blad, { zdanie: e.cues[k][+i] }) : e.cues[k][+i], `${e.slug}: ${c.zrodlo}`);
      }
    }
  });

  /* 06-tresci-001: w opisie meta nie ma nagłówka „Jakich błędów unikać?”, więc zdanie z cues.mistakes bez ramki czyta się jak zalecenie. */
  test(`${lang}: zdanie z listy częstych błędów w opisie zawsze z ramką słowną („${SZ[lang].blad}”)`, () => {
    assert.ok(SZ[lang].blad?.includes('{zdanie}'), `src/szablony/${lang}.json: brak tekstu stałego „blad” z {zdanie}`);
    const [przed] = SZ[lang].blad.split('{zdanie}');
    const zle = wyniki.flatMap(({ e, s }) => s.czesciOpisu.filter(z => z.zrodlo.startsWith('cues.mistakes.') && !z.tekst.startsWith(przed)).map(z => `${e.slug}: ${z.tekst}`));
    assert.deepEqual(zle, []);
    /* bez ramki żadne zdanie błędu nie trafia do opisu także w innym miejscu tekstu */
    const goly = wyniki.flatMap(({ e, s }) => (wlasne(e) ? e.cues.mistakes ?? [] : []).filter(m => s.opis.includes(m) && !s.opis.includes(fill(SZ[lang].blad, { zdanie: m }))).map(m => `${e.slug}: ${m}`));
    assert.deepEqual(goly, []);
  });

  test(`${lang}: krótka odpowiedź — w limicie, zawiera ruch przy własnych wskazówkach`, () => {
    for (const { e, s } of wyniki) {
      assert.ok(dl(s.odpowiedz) <= LIMITY.odpowiedz.max, `${e.slug}: ${dl(s.odpowiedz)}`);
      if (wlasne(e) && e.cues.move?.length) assert.ok(s.odpowiedz.startsWith(e.cues.move[0]), e.slug);
    }
  });

  test(`${lang}: nagłówki-pytania tylko przy sekcjach z treścią, bez nazwy ćwiczenia, zakończone znakiem zapytania`, () => {
    for (const { e, s } of wyniki) {
      const ma = { setup: wlasne(e) && e.cues.setup?.length, move: wlasne(e) && e.cues.move?.length, tips: wlasne(e) ? e.cues.tips?.length : e.cues.ok?.length, mistakes: e.cues.mistakes?.length, sprzet: e.requires.length, zamienniki: e.alternatives.length, miesnie: e.regions.some(r => r.load >= 0.5) /* Z-34: sekcja mięśni na stronie (listy main/aux) istnieje od obciążenia 0,5; same lekkie regiony — brak sekcji, więc brak nagłówka */ };
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

/* Nazwa podwójna (Z-32): przykłady dosłownie z docs/nazwy/pl.json (gałąź strona/z24-nazwy-pl, odczyt 27.11.2026) — krótkie, za długie jako podwójne, lokalne > 60, różnica tylko wielkością liter. */
const NAZWY_PL = {
  'bench-press': 'Wyciskanie sztangi leżąc',
  'deadlift': 'Martwy ciąg',
  'decline-bench-press': 'Wyciskanie sztangi na ławce skośnej głową w dół',
  'decline-close-grip-bench-to-skull-crusher': 'Wyciskanie wąsko na ławce głową w dół przechodzące we francuskie',
  'two-arm-dumbbell-kickback': 'Prostowanie ramion w opadzie tułowia z dwoma hantlami (kickback)',
  'nordic-curl': 'Nordic curl',
};
test('pl z nazwą lokalną: tytuł ≤ 60 (podwójna → sama lokalna); dłuższa lokalna zostaje w całości, bez ucinania', () => {
  const d = dane.pl, mapa = szablonyCwiczen(d, ui.pl, 'pl', Object.fromEntries(Object.entries(NAZWY_PL).map(([k, v]) => [k, { nazwaLokalna: v }])));
  for (const [slug, lok] of Object.entries(NAZWY_PL)) {
    const e = d.exercises.find(x => x.slug === slug), s = mapa.get(slug), podw = `${lok} (${e.name})`;
    /* lokalna różna od angielskiej tylko wielkością liter = ta sama nazwa (bez „Nordic curl (Nordic Curl)”) */
    const ta = lok.toLocaleLowerCase('pl') === e.name.toLocaleLowerCase('pl');
    const oczek = ta ? s.tytul.split(' — ')[0] === e.name && s.tytul : dl(podw) <= LIMITY.tytul.max ? podw : lok;
    assert.equal(s.tytul, oczek, slug);
    assert.ok(dl(s.tytul) <= LIMITY.tytul.max || s.tytul === lok, `${slug}: ${s.tytul}`);
    assert.deepEqual(wspolne('pl', s.tytul, s.czesciOpisu.filter(z => !s.wyjatek.includes(z.zrodlo)).map(z => z.tekst).join(' ')), [], slug);
  }
});

for (const lang of JEZYKI) test(`${lang}: pusty opis tylko poza indeksem i jawnie: pominOpis = true (Z-34 nie wstawia meta description)`, () => {
  const d = dane[lang], mapa = szablonyCwiczen(d, ui[lang], lang);
  for (const e of d.exercises) {
    const s = mapa.get(e.slug);
    assert.equal(s.pominOpis, s.opis === '', `${e.slug}: pominOpis`);
    if (s.pominOpis) assert.ok(!wlasne(e), `${e.slug}: pusty opis na stronie indeksowanej`);
  }
});

test('wzorce: 5 ćwiczeń o różnym profilu danych istnieje w eksporcie', () => {
  for (const w of WZORCE) assert.ok(dane.pl.exercises.some(e => e.slug === w.slug), w.slug);
});

test('docs/teksty/szablony-stron.md zawiera aktualną tabelę wzorców (npm run szablony)', () => {
  const doc = read('docs/teksty/szablony-stron.md');
  const tabela = tabelaWzorcow(dane, ui);
  assert.ok(doc.includes(tabela), 'tabela w dokumencie różni się od wyniku generatora — uruchom: node src/szablony.mjs i wklej tabelę');
});
