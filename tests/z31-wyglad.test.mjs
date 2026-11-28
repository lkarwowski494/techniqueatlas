// Z-30 → Z-31: testy akceptacyjne wyglądu „Arkusz” (docs/design/system/design-spec.md) na zbudowanej stronie pl + en. Wyrocznia: specyfikacja i pliki systemu (tokeny.css, fonty/,
// szablony/*.html zatwierdzone przez właściciela 27.11.2026), dane eksportu (fazy ruchu, liczby) — nie kod generatora. Wdrożone w Z-31: wszystkie testy zielone.
// Strategia i lista: docs/55-strategia-testow-wdrozenia.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildOnce, requireData, distFiles, ROOT } from './pomoc.mjs';
import { readJson } from '../src/lib.mjs';
import { GROUP_ID, EQUIPMENT_ID, familyId } from '../src/taksonomia.mjs';
import { czytaj, plikiHtml, element, elementy, hrefy, rozwiaz, istnieje, brakujacePodklucze } from './strona-html.mjs';

requireData();
const { out, ctx } = await buildOnce('z31', { jezyki: ['pl', 'en'] });
const DS = join(ROOT, 'docs/design/system');
const css = () => distFiles(join(out, 'assets')).filter(p => p.endsWith('.css')).map(p => readFileSync(p, 'utf8')).join('\n');
const bezSpacji = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '');
const PL = ctx.data.pl.exercises, EN = ctx.data.en.exercises;
const strona = (l, slug) => czytaj(out, `${l}/exercises/${slug}/index.html`);

test('Z-31 tokeny: każda deklaracja zmiennej z docs/design/system/tokeny.css (wszystkie motywy) jest w CSS zbudowanej strony z tą samą wartością', () => {
  const zrodlo = bezSpacji(readFileSync(join(DS, 'tokeny.css'), 'utf8')), strona = bezSpacji(css());
  const deklaracje = [...new Set(zrodlo.match(/--[\w-]+:[^;}]+/g))];
  assert.ok(deklaracje.length > 30, 'tokeny.css: za mało deklaracji — zmienił się format pliku?');
  assert.deepEqual(deklaracje.filter(d => !strona.includes(d)), []);
});

test('Z-31 kroje i budżet: 4 pliki IBM Plex Sans Condensed z docs/design/system/fonty są w dist bajt w bajt (budżet = suma tych plików), każdy url() z @font-face prowadzi do istniejącego pliku', () => {
  const wzorce = readdirSync(join(DS, 'fonty')).filter(f => f.endsWith('.woff2'));
  const wDist = distFiles(join(out, 'assets')).filter(p => p.endsWith('.woff2'));
  assert.equal(wzorce.length, 4);
  for (const f of wzorce) assert.ok(wDist.some(p => readFileSync(p).equals(readFileSync(join(DS, 'fonty', f)))), `brak ${f} w dist/assets`);
  assert.equal(wDist.length, 4, 'w dist są dodatkowe kroje ponad budżet systemu');
  const pliki = distFiles(join(out, 'assets')).filter(p => p.endsWith('.css'));
  for (const p of pliki) for (const m of readFileSync(p, 'utf8').matchAll(/url\(["']?([^"')]+\.woff2)["']?\)/g)) assert.ok(istnieje(out, rozwiaz(p.slice(out.length + 1), m[1])), `${p}: ${m[1]}`);
});

test('Z-31 kroje: tytuły krojem systemowym w 8 językach bez pokrycia znaków (ru, uk, bg, sr, el, ja, ko, zh-Hant) — selektor :lang() każdego z nich w CSS', () => {
  const c = css(); assert.deepEqual(['ru', 'uk', 'bg', 'sr', 'el', 'ja', 'ko', 'zh-Hant'].filter(l => !new RegExp(`:lang\\(${l}\\)`).test(c)), []);
});

test('Z-31 nagłówek: każda strona pl ma nagłówek systemu (header.glowka) z menu <details> „Menu” i nawigacją „Menu główne” (teksty §10.9); wybór języka i 404 mają nagłówek bez menu (szablony jezyki.html, 404.html: strony w języku domyślnym, bez nawigacji)', () => {
  const proba = [...plikiHtml(out).filter(f => f.startsWith('pl/') && !/exercises\/[^/]+\/index\.html$/.test(f)), 'pl/exercises/back-squat/index.html'];
  const zle = proba.filter(f => {
    const h = czytaj(out, f), g = element(h, 'header', 'glowka'); return !g || !/<details class="menu-d"><summary>Menu<\/summary>/.test(g.wnetrze) || !/<nav class="menu[^"]*" aria-label="Menu główne">/.test(g.wnetrze);
  });
  assert.deepEqual(zle, []);
  for (const f of ['index.html', '404.html']) assert.ok(element(czytaj(out, f), 'header', 'glowka'), `${f}: brak header.glowka`);
});

test('Z-31 nowe teksty interfejsu (§10.9) w 35 językach: pl ma „Menu”, „Menu główne”, „Tempo powtórzenia”, zdanie stanu pustego; każdy src/ui/<język>.json ma te same klucze co pl.json, bez pustych wartości', () => {
  const pl = readJson('src/ui/pl.json'), wartosci = JSON.stringify(Object.values(pl));
  for (const t of ['"Menu"', '"Menu główne"', 'Tempo powtórzenia', 'Zmień albo wyczyść filtry, żeby zobaczyć ćwiczenia.']) assert.ok(wartosci.includes(t), `src/ui/pl.json: brak ${t}`);
  const klucze = o => Object.keys(o).sort().join(','), pliki = readdirSync(join(ROOT, 'src/ui')).filter(f => f.endsWith('.json'));
  assert.equal(pliki.length, 35);
  /* Z-33: klucze czekające na przekład API (docs/teksty/ui-do-przekladu-z33.md): tylko pl i en je mają, pozostałe 33 języków pokazuje wersję angielską z lang="en"; po nałożeniu przekładu lista się kurczy (test pilnuje, że wyjątek nie zostaje, gdy język ma już klucz) */
  const CZEKA_NA_PRZEKLAD = ['prawne', 'prawneBrak', 'wsparcie', 'ramka'], bez = o => Object.fromEntries(Object.entries(o).filter(([k]) => !CZEKA_NA_PRZEKLAD.includes(k)));
  for (const f of pliki) { const u = readJson(`src/ui/${f}`), wlasny = ['pl.json', 'en.json'].includes(f); assert.equal(klucze(bez(u)), klucze(bez(pl)), f); if (wlasny) assert.deepEqual(CZEKA_NA_PRZEKLAD.filter(k => !(k in u)), [], f); assert.deepEqual(brakujacePodklucze(u, pl, CZEKA_NA_PRZEKLAD), [], f); for (const [k, v] of Object.entries(u)) assert.ok(v !== '' && v !== null, `${f}: ${k} pusty`); }
});

/* Wyrocznia linii wymiarowej: §4 specyfikacji — fazy z czasem > 0 z eksportu, klasa t<ms/100>, opis dla czytnika z czasem łącznym (przykład z szablonu: „Tempo powtórzenia: Opuszczanie 2 s, Wstawanie 1 s, Pauza 0,5 s; razem 3,5 s na powtórzenie”). */
const sek = ms => new Intl.NumberFormat('pl').format(ms / 1000);
test('Z-31 linia wymiarowa tempa: każda strona pl z figurą ma role="img" z opisem faz i czasu łącznego z danych oraz odcinki .wymiar-s t<ms/100> w kolejności faz', () => {
  const zle = [];
  for (const e of PL.filter(e => e.figure && ctx.figs[e.slug])) {
    const h = strona('pl', e.slug);
    /* fazy z `untimed` (dane od 27.11.2026, integracja-start): czas jest zastępczy — strona nie rysuje linii ani nie podaje sekund (poprawka testu Z-31, powód w PRZEKAZANIU) */
    if (e.figure.phases.some(p => p.untimed)) { if (/class="wymiar[ "]/.test(h) || /Tempo powtórzenia/.test(h)) zle.push(`${e.slug} (untimed)`); continue; }
    const fazy = e.figure.phases.filter(p => p.ms > 0), razem = fazy.reduce((s, p) => s + p.ms, 0);
    const opis = `Tempo powtórzenia: ${fazy.map(p => `${p.name} ${sek(p.ms)} s`).join(', ')}; razem ${sek(razem)} s na powtórzenie`;
    const klasy = [...h.matchAll(/class="wymiar-s (t\d+)/g)].map(m => m[1]);
    if (!h.includes(`role="img" aria-label="${opis}"`) || klasy.join() !== fazy.map(p => `t${p.ms / 100}`).join()) zle.push(e.slug);
  }
  assert.deepEqual(zle, []);
});

test('Z-31 stan bez figury (§4, §6): strona ćwiczenia bez figury nie ma linii wymiarowej ani pustego miejsca po figurze — układ .bez-fig, tabliczka zostaje (pl i en)', () => {
  const zle = [];
  for (const [l, lista] of [['pl', PL], ['en', EN]]) for (const e of lista.filter(e => !(e.figure && ctx.figs[e.slug]))) {
    const h = strona(l, e.slug); if (/class="wymiar[ "]/.test(h) || !/class="[^"]*\bbez-fig\b/.test(h) || !element(h, 'dl', 'tabliczka')) zle.push(`${l}/${e.slug}`);
  }
  assert.deepEqual(zle, []);
});

test('Z-31 tabliczka rysunkowa: strona ćwiczenia ma dl.tabliczka z partią jako linkiem do strony tej partii (pl i en)', () => {
  const zle = [];
  for (const [l, lista] of [['pl', PL], ['en', EN]]) for (const e of lista) {
    const f = `${l}/exercises/${e.slug}/index.html`, t = element(czytaj(out, f), 'dl', 'tabliczka');
    if (!t || !hrefy(t.wnetrze).some(a => rozwiaz(f, a.href) === `${l}/muscles/${GROUP_ID[e.group]}/index.html`)) zle.push(`${l}/${e.slug}`);
  }
  assert.deepEqual(zle, []);
});

test('Z-31 lista (wykaz): strona „Wszystkie ćwiczenia” ma table.wykaz z jednym wierszem na ćwiczenie i ukryty stan pusty (tytuł, zdanie, przycisk wyjścia)', () => {
  for (const [l, lista] of [['pl', PL], ['en', EN]]) {
    const h = czytaj(out, `${l}/exercises/index.html`), t = element(h, 'table', 'wykaz'); assert.ok(t, `${l}: brak table.wykaz`);
    assert.equal(elementy(element(t.wnetrze, 'tbody')?.wnetrze ?? '', 'tr').length, lista.length, l);
    const p = element(h, 'div', 'pusto'); assert.ok(p && /<h2>/.test(p.wnetrze) && /<button type="button"/.test(p.wnetrze), `${l}: brak stanu pustego`);
  }
  assert.match(element(czytaj(out, 'pl/exercises/index.html'), 'div', 'pusto').wnetrze, /Zmień albo wyczyść filtry, żeby zobaczyć ćwiczenia\./);
});

test('Z-31 strona główna języka: każda partia, sprzęt i rodzaj ruchu ma licznik (span.n w linku grupy) równy liczbie ćwiczeń z eksportu', () => {
  for (const [l, lista] of [['pl', PL], ['en', EN]]) {
    const f = `${l}/index.html`, h = czytaj(out, f), zle = [];
    for (const [rodzaj, id] of [['muscles', e => GROUP_ID[e.group]], ['equipment', e => EQUIPMENT_ID[e.equipment]], ['movements', e => familyId(e.family)]]) {
      const linkiGrup = hrefy(h).filter(a => rozwiaz(f, a.href)?.startsWith(`${l}/${rodzaj}/`)); if (!linkiGrup.length) zle.push(`${rodzaj}: brak linków`);
      for (const a of linkiGrup) {
        const g = rozwiaz(f, a.href).split('/')[2], n = Number(a.html.match(/<span class="n">(\d+)<\/span>/)?.[1]), oczekiwane = lista.filter(e => id(e) === g).length;
        if (n !== oczekiwane) zle.push(`${rodzaj}/${g}: ${n} ≠ ${oczekiwane}`);
      }
    }
    assert.deepEqual(zle, [], l);
  }
});

test('Z-31 (Z-06 A5) linki wewnętrzne na adres kanoniczny: żaden href w dist nie kończy się na index.html (poza /404.html)', () => {
  const zle = plikiHtml(out).flatMap(f => hrefy(czytaj(out, f)).filter(a => /(^|\/)index\.html$/.test(a.href.split('#')[0])).map(a => `${f} → ${a.href}`));
  assert.equal(zle.length, 0, `${zle.length} linków, np. ${zle.slice(0, 3).join('; ')}`);
});

test('Z-31 CSP bez wyjątków: żadna strona nie ma atrybutu style ani skryptu w linii poza danymi JSON (przechodzi dziś — strażnik regresji przy wdrożeniu wyglądu)', () => {
  const zle = plikiHtml(out).filter(f => { const h = czytaj(out, f); return /\sstyle="/.test(h) || /<script(?![^>]*\b(src=|type="application\/(ld\+)?json"))[^>]*>/.test(h); });
  assert.deepEqual(zle, []);
});


/* --- uzupełnienia po recenzji Z-31 (znaleziska NISKIE, Z-32/Z-33): krótka odpowiedź i klasy linii wymiarowej --- */
test('Z-31 krótka odpowiedź (KO-135): section.odp z h2 i akapitem na stronach pl i en tylko przy własnych wskazówkach kompletnych; przy wskazówkach ogólnych, brakach i bez wskazówek jej nie ma', () => {
  const stan = { z: 0, bez: 0 };
  for (const l of ['pl', 'en']) for (const e of ctx.data[l].exercises) {
    const h = strona(l, e.slug), s = element(h, 'section', 'odp'), wlasne = e.cues.scope === 'own' && !e.cues.missing;
    if (wlasne) { stan.z++; assert.ok(s, `${l}/${e.slug}: brak section.odp`); assert.match(s.wnetrze, /<h2 id="odp-t">[^<]+<\/h2><p class="odp">[^<]{20,}<\/p>/, `${l}/${e.slug}`); assert.match(s.otwarcie, /aria-labelledby="odp-t"/); }
    else { stan.bez++; assert.equal(s, null, `${l}/${e.slug}: section.odp przy wskazówkach spoza zakresu own (scope ${e.cues.scope}, missing ${e.cues.missing})`); }
  }
  assert.ok(stan.z > 100 && stan.bez > 0, `próba za mała albo brak ćwiczeń ze wskazówkami ogólnymi: ${JSON.stringify(stan)}`);
});

test('Z-31 klasy linii wymiarowej: każda klasa t<ms/100> użyta na stronach pl i en ma regułę .t<N>{flex:N} w CSS strony (długość odcinka = czas fazy)', () => {
  const uzyte = new Set();
  for (const f of plikiHtml(out).filter(f => /^(pl|en)\/exercises\//.test(f))) for (const m of czytaj(out, f).matchAll(/class="wymiar-s t(\d+)[" ]/g)) uzyte.add(Number(m[1]));
  assert.ok(uzyte.size >= 3, `użytych klas: ${[...uzyte]}`);
  const style = bezSpacji(css());
  assert.deepEqual([...uzyte].filter(n => !style.includes(`.t${n}{flex:${n}}`)).sort((a, b) => a - b), []);
  const zdanych = new Set(ctx.data.pl.exercises.flatMap(e => (e.figure && ctx.figs[e.slug] && !e.figure.phases.some(p => p.untimed) ? e.figure.phases : []).filter(p => p.ms > 0).map(p => p.ms / 100)));
  assert.deepEqual([...zdanych].filter(n => !uzyte.has(n)), [], 'czas fazy z danych bez odcinka na stronie');
});
