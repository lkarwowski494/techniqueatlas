// Z-30 → Z-32: nazwa lokalna + angielska na stronach. Wyrocznia: zrecenzowane nazwy docs/nazwy/pl.json (Z-24, recenzja Z-25), zasady nazwy z docs/teksty/szablony-stron.md 2.1
// (lokalna różna od angielskiej nie tylko wielkością liter) i wzorzec h1 z docs/design/system/szablony/cwiczenie.html. Język bez pliku nazw (tu: de) pokazuje nazwę angielską.
// Testy oznaczone CZEKA('Z-32') są czerwone do wdrożenia; strategia: docs/55-strategia-testow-wdrozenia.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildOnce, requireData } from './pomoc.mjs';
import { czytaj, plikiHtml, element, tekst, hrefy, rozwiaz, jsonld, nazwyLokalne, nazwaLokalna } from './strona-html.mjs';

requireData();
const { out, ctx } = await buildOnce('z32', { jezyki: ['pl', 'en', 'de'] });
const N = nazwyLokalne('pl'), PL = ctx.data.pl.exercises;
const strona = (l, slug) => czytaj(out, `${l}/exercises/${slug}/index.html`);
const lok = e => nazwaLokalna('pl', N, e);
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('Z-32 nazwy pl: docs/nazwy/pl.json ma niepustą nazwę dla każdego ćwiczenia eksportu i nic ponad nie (przechodzi dziś — strażnik kompletności)', () => {
  const ids = new Set(PL.map(e => e.id));
  assert.deepEqual(PL.filter(e => !N[e.id]?.trim()).map(e => e.id), []);
  assert.deepEqual(Object.keys(N).filter(k => !ids.has(k)), []);
});

test('Z-32 h1 pl: nazwa polska (span.nazwa-pl) i angielska (span.nazwa-en lang="en"); gdy polska różni się tylko wielkością liter — sama angielska z lang="en"', () => {
  const zle = [];
  for (const e of PL) {
    const h = element(strona('pl', e.slug), 'h1'), l = lok(e);
    const ok = l ? new RegExp(`<span class="nazwa-pl">${esc(l)}</span>`).test(h.wnetrze) && new RegExp(`<span class="nazwa-en" lang="en">${esc(e.name)}</span>`).test(h.wnetrze)
      : !/nazwa-pl/.test(h.wnetrze) && tekst(h.wnetrze) === e.name && /lang="en"/.test(h.otwarcie + h.wnetrze);
    if (!ok) zle.push(e.slug);
  }
  assert.equal(zle.length, 0, `${zle.length} stron, np. ${zle.slice(0, 3)}`);
});

test('Z-32 przypadek brzegowy: ćwiczenia, których nazwa polska różni się od angielskiej tylko wielkością liter (np. Face pull), istnieją w danych — test wyżej je obejmuje (przechodzi dziś)', () => {
  assert.ok(PL.filter(e => !lok(e)).length > 0);
});

test('Z-32 h1 en i język bez nazw lokalnych (de): sama nazwa angielska, bez span.nazwa-pl (przechodzi dziś — strażnik, że nazwa pl nie wycieka do innych języków)', () => {
  const zle = [];
  for (const l of ['en', 'de']) for (const e of ctx.data[l].exercises) { const h = element(strona(l, e.slug), 'h1'); if (/nazwa-pl/.test(h.wnetrze) || tekst(h.wnetrze) !== e.name) zle.push(`${l}/${e.slug}`); }
  assert.deepEqual(zle, []);
  for (const e of ctx.data.de.exercises.slice(0, 50)) assert.match(element(strona('de', e.slug), 'h1').otwarcie + element(strona('de', e.slug), 'h1').wnetrze, /lang="en"/, e.slug);
});

test('Z-32 każda strona pl: link do ćwiczenia (lista A–Z, filtry, strona główna, zamienniki) pokazuje nazwę polską', () => {
  const bySlug = new Map(PL.map(e => [e.slug, e])), zle = new Set();
  for (const f of plikiHtml(out).filter(f => f.startsWith('pl/'))) for (const a of hrefy(czytaj(out, f))) {
    const cel = rozwiaz(f, a.href)?.match(/^pl\/exercises\/([^/]+)\/index\.html$/)?.[1]; if (!cel || cel === f.split('/')[2]) continue;
    const e = bySlug.get(cel); if (e && lok(e) && !a.tekst.includes(lok(e))) zle.add(`${f.split('/').slice(1, 3).join('/')} → ${cel}`);
  }
  assert.equal(zle.size, 0, `${zle.size} linków, np. ${[...zle].slice(0, 3)}`);
});

test('Z-32 lista A–Z pl: kolejność według nazwy polskiej (Intl.Collator pl)', () => {
  const f = 'pl/exercises/index.html', bySlug = new Map(PL.map(e => [e.slug, e]));
  const kolejnosc = hrefy(czytaj(out, f)).map(a => rozwiaz(f, a.href)?.match(/^pl\/exercises\/([^/]+)\/index\.html$/)?.[1]).filter(Boolean).map(s => bySlug.get(s)).filter(Boolean);
  const nazwa = e => lok(e) ?? e.name, c = new Intl.Collator('pl');
  assert.equal(kolejnosc.length, PL.length);
  assert.deepEqual(kolejnosc.map(nazwa), [...kolejnosc].sort((a, b) => c.compare(nazwa(a), nazwa(b))).map(nazwa));
});

test('Z-32 okruszki pl: ostatni element i BreadcrumbList w JSON-LD mają nazwę polską', () => {
  const zle = [];
  for (const e of PL.filter(lok)) {
    const h = strona('pl', e.slug), bc = jsonld(h).find(j => j['@type'] === 'BreadcrumbList'), ost = bc?.itemListElement.at(-1)?.name;
    const nav = [...h.matchAll(/<span aria-current="page"[^>]*>([\s\S]*?)<\/span>/g)].map(m => tekst(m[1]));
    if (ost !== lok(e) || !nav.some(t => t.includes(lok(e)))) zle.push(e.slug);
  }
  assert.equal(zle.length, 0, `${zle.length}, np. ${zle.slice(0, 3)}`);
});

test('Z-32 wyszukiwarka pl (decyzja analogią, do weta): indeks assets/idx/pl.js zawiera nazwę polską każdego ćwiczenia, a nazwa angielska dalej prowadzi do strony', () => {
  const idx = readFileSync(join(out, 'assets/idx/pl.js'), 'utf8');
  assert.deepEqual(PL.filter(e => lok(e) && !idx.includes(JSON.stringify(lok(e)))).map(e => e.slug).slice(0, 5), []);
  assert.deepEqual(PL.filter(e => !idx.includes(JSON.stringify(e.name))).map(e => e.slug).slice(0, 5), []);
});

test('Z-32 opis rysunku pl (decyzja analogią, do weta): etykieta figury dla czytnika ma nazwę polską', () => {
  const zle = PL.filter(e => lok(e) && e.figure && ctx.figs[e.slug]).filter(e => !/<svg role="img" aria-label="([^"]*)"/.exec(element(strona('pl', e.slug), 'figure')?.wnetrze ?? '')?.[1].includes(lok(e).replace(/&/g, '&amp;').replace(/"/g, '&quot;'))).map(e => e.slug);
  assert.equal(zle.length, 0, `${zle.length}, np. ${zle.slice(0, 3)}`);
});
