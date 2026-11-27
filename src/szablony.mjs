// Z-22: szablony tytułu, opisu (meta description), nagłówków-pytań i krótkiej odpowiedzi — wyłącznie z danych eksportu (nazwa, mięśnie, sprzęt, wskazówki,
// rodzina ruchu, liczby) i tekstów stałych z src/szablony/<język>.json. Czyste funkcje; wdrożenie w src/pages.mjs to Z-34. Zasady: docs/teksty/szablony-stron.md.
// Uruchomienie `node src/szablony.mjs` drukuje tabelę wzorców dla dokumentu (test pilnuje, że dokument ma aktualną).
import { fileURLToPath } from 'node:url';
import { fill, plural, readJson } from './lib.mjs';

export const JEZYKI = ['pl', 'en'];
/** Granice długości (znaki). Źródła nie podają liczby (Google: „there's no limit”, obcinanie do szerokości urządzenia) — to decyzja studia, opis w dokumencie. */
export const LIMITY = { tytul: { max: 60 }, opis: { min: 50, max: 160 }, odpowiedz: { max: 320 } };
/** 5 ćwiczeń o różnym profilu danych (tabela wzorców w dokumencie). */
export const WZORCE = [
  { slug: 'bench-press', profil: 'wskazówki pełne (ustawienie, ruch, wskazówki, błędy), rysunek, role mięśni' },
  { slug: 'nordic-curl', profil: 'własne wskazówki bez rysunku; sprzęt jako alternatywa 4 pozycji' },
  { slug: 'deadlift', profil: 'jeden sprzęt' },
  { slug: 'seated-barbell-military-press', profil: 'kilka sprzętów (3 grupy), bez sekcji wskazówek' },
  { slug: 'zercher-squat', profil: 'rzadka odmiana (niche), tylko wskazówki ogólne wzorca ruchu — noindex' },
];

const teksty = Object.fromEntries(JEZYKI.map(l => [l, readJson(`src/szablony/${l}.json`)]));
/** Słowa pomijane przy porównaniu tytułu z opisem (spójniki i przyimki ≥ 4 litery; krótsze pomija próg długości). */
const POMIJANE = { pl: new Set(['albo', 'przez', 'oraz', 'przy', 'jako', 'żeby', 'który', 'która', 'które']), en: new Set(['with', 'from', 'your', 'into', 'over', 'then', 'that', 'this', 'keep', 'while', 'until']) };
const dl = s => [...s].length;

/** Rdzenie słów tekstu: małe litery, słowa ≥ 4 liter, pierwsze 5 liter (łapie odmianę: sztanga/sztangę, press/pressing), bez słów pomijanych. */
export function rdzenie(lang, s) {
  const slowa = String(s).toLocaleLowerCase(lang).normalize('NFC').match(/[\p{L}\p{N}]+/gu) ?? [];
  return new Set(slowa.filter(w => dl(w) >= 4 && !POMIJANE[lang]?.has(w)).map(w => [...w].slice(0, 5).join('')));
}
/** Rdzenie wspólne dwóch tekstów (powtórzenia słów). */
export const wspolne = (lang, a, b) => { const B = rdzenie(lang, b); return [...rdzenie(lang, a)].filter(r => B.has(r)); };

const wlasne = e => e.cues.scope === 'own' && !e.cues.missing;
const sprzetLista = (d, t, e) => e.requires.map(g => g.map(c => d.labels.capabilities[c]).join(t.albo)).join(', ');
function zdanieMiesni(d, t, e) {
  const L = d.labels.regions, glowne = e.regions.filter(r => r.load >= 1).map(r => L[r.id]), pom = e.regions.filter(r => r.load >= 0.5 && r.load < 1).map(r => L[r.id]);
  if (glowne.length) return { zrodlo: 'regions.glowne', tekst: fill(t.miesnieGlowne, { lista: glowne.join(', ') }) };
  if (pom.length) return { zrodlo: 'regions.pomocnicze', tekst: fill(t.miesniePomocnicze, { lista: pom.join(', ') }) };
  return { zrodlo: 'group', tekst: fill(t.partia, { grupa: d.labels.groups[e.group] }) };
}

/**
 * Szablony strony ćwiczenia. `d` — atlas języka z eksportu, `ui` — src/ui/<język>.json, `nazwaLokalna` — po Z-24/Z-32 (zrecenzowana nazwa w języku strony; brak = sama angielska).
 * Zwraca { tytul, opis, odpowiedz, pytania, czesciOpisu, czesciOdpowiedzi } — części z polem `zrodlo` (ścieżka w danych), żeby test sprawdzał, że opis powstał z danych.
 */
export function szablonyCwiczenia(d, ui, lang, e, { nazwaLokalna, pelny = false, wspolneZdania = null, sprzetMimoPowtorzenia = false, rozrozniajaceMimoPowtorzenia = false } = {}) {
  const t = teksty[lang];
  /* Tytuł: nazwa (lokalna + angielska, gdy jest lokalna) i dopisek w języku strony: etykieta rodziny ruchu, a gdy powtarza słowa nazwy — mięśnie główne. Bez nazwy witryny (podaje ją WebSite JSON-LD na stronie /, A6 Z-06). */
  /* Nazwa lokalna (Z-32): różna od angielskiej (nie tylko wielkością liter) → „{lokalna} ({angielska})”; gdy to przekracza limit — sama lokalna
     (angielska zostaje w h1 strony); lokalna dłuższa niż limit zostaje w całości (nazwy nie ucinamy, obcina wyszukiwarka). */
  const lokalna = nazwaLokalna && nazwaLokalna.toLocaleLowerCase(lang) !== e.name.toLocaleLowerCase(lang) ? nazwaLokalna : null;
  const podwojna = lokalna && fill(t.nazwaPodwojna, { lokalna, angielska: e.name });
  const nazwa = !lokalna ? e.name : dl(podwojna) <= LIMITY.tytul.max ? podwojna : lokalna;
  const glowne = e.regions.filter(r => r.load >= 1).map(r => d.labels.regions[r.id]).join(', ');
  /* dopisek z myślnikiem w etykiecie (np. „barki — przód”) odpada: tytuł miałby dwa myślniki */
  const dopiski = lokalna ? [] : [ui.families?.[e.family], glowne].filter(k => k && !k.includes('—') && !wspolne(lang, nazwa, k).length && dl(fill(t.tytulCwiczenia, { nazwa, dopisek: k })) <= LIMITY.tytul.max);
  const rodzina = ui.families?.[e.family];
  const jezykNazwy = lang !== 'en' && !lokalna; /* strona nie po angielsku, a w tytule tylko nazwa angielska */
  const warianty = [...dopiski.map(k => fill(t.tytulCwiczenia, { nazwa, dopisek: k })), nazwa];

  /* Opis: zdania z danych w kolejności ważności; zdanie, które powtarza słowo tytułu albo przekracza limit, wypada (bierze się następne). */
  const c = e.cues, cue = (k, i) => wlasne(e) && c[k]?.[i] ? { zrodlo: `cues.${k}.${i}`, tekst: k === 'mistakes' ? fill(t.blad, { zdanie: c[k][i] }) : c[k][i] } : null;
  /* zdanie z listy błędów zawsze w ramce „Częsty błąd: …” (06-tresci-001): w opisie meta nie ma nagłówka sekcji, a bez ramki zdanie czyta się jak zalecenie */
  const sprzet = e.requires.length ? { zrodlo: 'requires', tekst: fill(t.sprzet, { lista: sprzetLista(d, t, e) }) } : null;
  const miesnie = zdanieMiesni(d, t, e);
  const wszystkie = k => (wlasne(e) ? c[k] ?? [] : []).map((_, i) => cue(k, i));
  const L = d.labels.regions, pomocnicze = miesnie.zrodlo === 'regions.glowne' ? e.regions.filter(r => r.load >= 0.5 && r.load < 1).map(r => L[r.id]) : [];
  const zdPom = pomocnicze.length ? { zrodlo: 'regions.pomocnicze', tekst: fill(t.miesniePomocnicze, { lista: pomocnicze.join(', ') }) } : null;
  const zdRodzaj = ui.families?.[e.family] ? { zrodlo: 'family', tekst: fill(t.rodzaj, { rodzaj: ui.families[e.family] }) } : null;
  /* kolejność: pierwsze zdanie ruchu, mięśnie główne, sprzęt, pierwsze zdania ustawienia i wskazówek, dalsze zdania, mięśnie pomocnicze, rodzaj ruchu */
  const kolejka0 = [cue('move', 0), miesnie, sprzet, cue('setup', 0), cue('tips', 0), ...wszystkie('move').slice(1), ...wszystkie('setup').slice(1), ...wszystkie('tips').slice(1), ...wszystkie('mistakes'), zdPom, zdRodzaj].filter(Boolean);
  const kolejka = [...kolejka0]
    .sort((x, y) => sprzetMimoPowtorzenia ? (y === sprzet) - (x === sprzet) : 0)
    .sort((x, y) => wspolneZdania ? wspolneZdania.has(x.tekst) - wspolneZdania.has(y.tekst) : 0); /* opis powtarzany z innym ćwiczeniem: najpierw zdania, których tamto nie ma (sort stabilny) */
  const zloz = tytul => {
    const czesci = [];
    for (const z of kolejka) {
      const nowy = [...czesci, z].map(x => x.tekst).join(' ');
      if (dl(nowy) > LIMITY.opis.max || (wspolne(lang, tytul, z.tekst).length && !(sprzetMimoPowtorzenia && z === sprzet) && !(rozrozniajaceMimoPowtorzenia && wspolneZdania && !wspolneZdania.has(z.tekst)))) continue;
      czesci.push(z);
      if (!pelny && dl(nowy) >= LIMITY.opis.min * 2) break; /* dość treści — nie dokładamy kolejnych zdań do granicy (pelny: dokładamy, gdy opis powtarza się z innym ćwiczeniem) */
    }
    czesci.sort((x, y) => kolejka0.indexOf(x) - kolejka0.indexOf(y)); /* wybrane zdania w zwykłej kolejności (ruch, mięśnie główne, sprzęt…) */
    const tekst = czesci.map(x => x.tekst).join(' ');
    const pominiete = kolejka.filter(z => !czesci.includes(z)).map(z => ({ ...z, powod: wspolne(lang, tytul, z.tekst).length ? 'powtórzenie' : 'długość' }));
    /* ocena wariantu: opis w limicie > dopisek w języku strony, gdy nazwa jest tylko angielska (Google: tytuł w języku treści) > zawiera zdanie ruchu > zawiera mięśnie > kolejność wariantu (dopisek rodziny, dopisek mięśni, sama nazwa) */
    const ocena = (dl(tekst) >= LIMITY.opis.min ? 16 : tekst ? dl(tekst) / LIMITY.opis.min * 12 : -100) + (jezykNazwy && tytul !== nazwa ? 4 + (tytul.endsWith(rodzina ?? '\u0000') ? 1 : 0) : 0) + (czesci.includes(kolejka0[0]) && kolejka0[0].zrodlo.startsWith('cues.') ? 2 : 0) + (czesci.includes(miesnie) ? 1 : 0);
    return { tytul, czesci, tekst, ocena, pominiete };
  };
  /* Tytuł: wariant, przy którym opis bez powtórzeń słów niesie najwięcej (zdanie ruchu, mięśnie); przy remisie wcześniejszy. */
  const wybor = warianty.map(zloz).reduce((a, b) => b.ocena > a.ocena ? b : a);
  const { tytul, czesci: czesciOpisu, tekst: opis, pominiete } = wybor;

  /* Krótka odpowiedź (akapit pod h1): co robisz (pierwsze zdanie ruchu, tylko własne wskazówki) i co pracuje. Bez wskazówek ogólnych — te są wspólne dla 28 grup i nie opisują tego ćwiczenia. */
  const ruch = cue('move', 0) ?? cue('setup', 0);
  const czesciOdpowiedzi = [ruch, miesnie, ruch ? null : sprzet].filter(Boolean);
  const odpowiedz = czesciOdpowiedzi.map(x => x.tekst).join(' ');

  /* Nagłówki-pytania: tylko sekcje, które strona pokazuje (pusta sekcja = brak nagłówka); bez nazwy ćwiczenia w nagłówku (nazwa raz, w h1). */
  const P = t.pytania, pytania = {};
  if (wlasne(e) && c.setup?.length) pytania.setup = P.setup;
  if (wlasne(e) && c.move?.length) pytania.move = P.move;
  if (e.regions.length) pytania.miesnie = P.miesnie;
  if (wlasne(e) ? c.tips?.length : c.ok?.length) pytania.tips = P.tips;
  if (c.mistakes?.length) pytania.mistakes = P.mistakes;
  if (e.requires.length) pytania.sprzet = P.sprzet;
  if (e.alternatives.length) pytania.zamienniki = P.zamienniki;
  const wyjatek = czesciOpisu.filter(z => wspolne(lang, tytul, z.tekst).length).map(z => z.zrodlo); /* zdania wpuszczone mimo powtórzenia słowa z tytułem (tylko przy rozdzielaniu powtórzonych opisów) */
  /* pusty opis (tylko strony noindex: wszystkie słowa danych są w tytule) → pominOpis: Z-34 nie wstawia <meta name="description"> (jak layout() przy pustym polu) */
  return { tytul, opis, pominOpis: opis === '', odpowiedz, pytania, czesciOpisu, czesciOdpowiedzi, pominiete, wyjatek };
}

/** Szablony wszystkich ćwiczeń języka (Map slug → wynik): opis, który powtarza się u innego ćwiczenia, dostaje kolejne zdania z danych do limitu (unikalność, Z-06 A10). */
export function szablonyCwiczen(d, ui, lang, opcje = {}) {
  const wynik = new Map(d.exercises.map(e => [e.slug, szablonyCwiczenia(d, ui, lang, e, opcje[e.slug])]));
  /* Unikalność liczona wśród stron indeksowanych (własne wskazówki, P-1): strony noindex nie pokazują się w wynikach, więc nie dostają wyjątków od zakazu powtórzeń. */
  const idx = d.exercises.filter(wlasne), policz = () => { const m = new Map(); for (const e of idx) { const o = wynik.get(e.slug).opis; m.set(o, (m.get(o) ?? 0) + 1); } return m; };
  const ile = policz();
  const rozdziel = (ile, dodatkowe = {}) => {
    const grupy = new Map(); for (const e of idx) { const o = wynik.get(e.slug).opis; if (ile.get(o) > 1) grupy.set(o, [...(grupy.get(o) ?? []), e]); }
    for (const grupa of grupy.values()) for (const e of grupa) {
      /* zdania obecne w danych pozostałych ćwiczeń grupy (te same wskazówki wzorca ruchu) idą na koniec kolejki */
      const inne = new Set(grupa.filter(x => x !== e).flatMap(x => { const w = szablonyCwiczenia(d, ui, lang, x, { ...opcje[x.slug], pelny: true, ...dodatkowe }); return [...w.czesciOpisu, ...w.pominiete].map(z => z.tekst); }));
      wynik.set(e.slug, szablonyCwiczenia(d, ui, lang, e, { ...opcje[e.slug], pelny: true, wspolneZdania: inne, ...dodatkowe }));
    }
  };
  rozdziel(ile);
  /* Ostatnia próba: ćwiczenia różnią się tylko sprzętem, a sprzęt jest w nazwie (Dumbbell…, Barbell…) — zdanie o sprzęcie wchodzi mimo powtórzenia słowa z tytułem
     (unikalność opisu ma źródło: Google, snippet; zakaz powtórzeń to zasada planu — wyjątek nazwany w polu `wyjatek` i w dokumencie). */
  const ile2 = policz();
  rozdziel(ile2, { sprzetMimoPowtorzenia: true });
  /* Gdy i to nie wystarcza (warianty różnią się tylko zdaniami ze słowem z nazwy, np. „kettlebell”, „dual”), wchodzi zdanie, którego nie ma u bliźniaka, mimo powtórzenia. */
  const ile3 = policz();
  rozdziel(ile3, { rozrozniajaceMimoPowtorzenia: true });
  return wynik;
}

const liczby = d => ({ n: d.exercises.length, f: d.exercises.filter(e => e.figure).length, c: d.exercises.filter(e => e.cues.scope !== 'none').length, z: d.exercises.filter(e => e.alternatives.length).length });
/** Strona główna języka: tytuł = nazwa witryny; opis z liczb eksportu (co strona ma i przy ilu pozycjach — bez twierdzenia, że każda ma wszystko). */
export function szablonyGlownej(d, ui, lang) {
  const t = teksty[lang], k = liczby(d);
  return { tytul: ui.siteName, opis: fill(t.opisGlownej, { ...k, opisow: plural(lang, t.opisow, k.n) }) };
}
/** Lista A–Z: tytuł bez nazwy witryny (powtarzałby „ćwiczenia/exercise”). */
export function szablonyListy(d, ui, lang) {
  const t = teksty[lang], n = d.exercises.length;
  return { tytul: ui.allExercises, opis: fill(t.opisListy, { n, pozycji: plural(lang, t.pozycji, n) }) };
}
/** Strony jednego filtra (partia, sprzęt, rodzaj ruchu): przykłady = pierwsze 3 nazwy A–Z bez słów tytułu. */
export function szablonyKategorii(d, ui, lang) {
  const t = teksty[lang], col = new Intl.Collator(lang), out = [];
  const grupy = [['group', d.labels.groups], ['equipment', d.labels.equipment], ['family', Object.fromEntries(Object.entries(ui.families ?? {}))]];
  for (const [klucz, etykiety] of grupy) for (const wartosc of [...new Set(d.exercises.map(e => e[klucz]))]) {
    const label = etykiety[wartosc]; if (!label) continue;
    const tytul = fill(ui.exercisesIn, { nazwa: label });
    const ex = d.exercises.filter(e => e[klucz] === wartosc).sort((a, b) => col.compare(a.name, b.name)), n = ex.length;
    const wolne = ex.map(e => e.name).filter(x => !wspolne(lang, tytul, x).length), przyklady = wolne.slice(0, 3);
    const zKategorii = lista => fill(t.opisKategorii, { n, pozycji: plural(lang, t.pozycji, n), lista: lista.join(', ') });
    for (const x of wolne.slice(3)) { if (dl(zKategorii(przyklady)) >= LIMITY.opis.min || dl(zKategorii([...przyklady, x])) > LIMITY.opis.max) break; przyklady.push(x); } /* krótkie nazwy: dokładamy przykład, aż opis osiągnie minimum */
    const bez = fill(t.opisKategoriiBezPrzykladow, { n, pozycji: plural(lang, t.pozycji, n), f: ex.filter(e => e.figure).length, c: ex.filter(e => e.cues.scope !== 'none').length });
    const zPrzykladami = n === 1 && przyklady.length ? fill(t.opisKategoriiJedna, { lista: przyklady[0] }) : przyklady.length ? zKategorii(przyklady) : '';
    /* przykłady nazw, a gdy za mało nazw bez słów tytułu — liczby z danych (rysunek, wskazówki) */
    const opis = dl(zPrzykladami) >= LIMITY.opis.min ? zPrzykladami : bez;
    out.push({ rodzaj: klucz, wartosc, label, tytul, opis });
  }
  /* Ta sama etykieta w dwóch rodzajach (np. „inne” jako partia i jako sprzęt): tytuł z nazwą filtra zamiast „Ćwiczenia: …”, żeby tytuły były unikalne. */
  const filtr = { group: ui.filterMuscle, equipment: ui.filterEquipment, family: ui.filterMovement };
  const powt = new Set(out.map(x => x.tytul).filter((x, i, a) => a.indexOf(x) !== i));
  for (const s of out) if (powt.has(s.tytul)) s.tytul = `${filtr[s.rodzaj]}: ${s.label}`;
  return out;
}

const kom = s => String(s).replace(/\|/g, '\\|');
/** Tabela wzorców (Markdown) dla 5 ćwiczeń × pl, en — wklejana do docs/teksty/szablony-stron.md. */
export function tabelaWzorcow(dane, ui) {
  const w = ['| Ćwiczenie (profil) | Język | Tytuł (znaki) | Opis (znaki) | Krótka odpowiedź | Nagłówki-pytania | Powtórzenia tytuł↔opis |', '|---|---|---|---|---|---|---|'];
  const wszystkie = Object.fromEntries(JEZYKI.map(l => [l, szablonyCwiczen(dane[l], ui[l], l)]));
  for (const { slug, profil } of WZORCE) for (const lang of JEZYKI) {
    const s = wszystkie[lang].get(slug);
    const p = wspolne(lang, s.tytul, s.opis);
    w.push(`| ${lang === 'pl' ? `\`${slug}\` — ${kom(profil)}` : ''} | ${lang} | ${kom(s.tytul)} (${dl(s.tytul)}) | ${kom(s.opis)} (${dl(s.opis)}) | ${kom(s.odpowiedz)} | ${kom(Object.values(s.pytania).join(' · '))} | ${p.length ? `${p.join(', ')} (wyjątek: ${s.wyjatek.join(', ')})` : 'brak'} |`);
  }
  return w.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dane = Object.fromEntries(JEZYKI.map(l => [l, readJson(`.cache/dane/atlas-${l}.json`)])), ui = Object.fromEntries(JEZYKI.map(l => [l, readJson(`src/ui/${l}.json`)]));
  console.log(tabelaWzorcow(dane, ui));
  if (process.argv.includes('--strony')) for (const l of JEZYKI) for (const s of [szablonyGlownej(dane[l], ui[l], l), szablonyListy(dane[l], ui[l], l), ...szablonyKategorii(dane[l], ui[l], l)]) console.log(`${l} | ${s.tytul} | ${s.opis} (${dl(s.opis)})`);
}
