// Z-30 → Z-34: zasięg według badania docs/badanie-zasiegu-2026-11-27.md (A1–A13, decyzja KO-130) i szablonów Z-22 (src/szablony.mjs, docs/teksty/szablony-stron.md).
// Build pl + en z indeksowanie=true (bez warunków startu, jak w build.test) pod zegarem przestawionym na 2031-01-01: data budowania nie może trafić do <lastmod> (A13).
// Wyrocznia: badanie (cytaty dokumentacji robotów i Google), decyzja KO-130, specyfikacja wyglądu §7–§8 (adresy ikony i podglądu), szablony Z-22 jako zatwierdzone wzorce tekstu
// (szablony są osobnym modułem z własnymi testami; ten plik sprawdza, że strona ich używa). Testy z CZEKA('Z-34') są czerwone do wdrożenia; strategia: docs/55-strategia-testow-wdrozenia.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { build } from '../src/build.mjs';
import { urlOf } from '../src/pages.mjs';
import { GROUP_ID, EQUIPMENT_ID, familyId } from '../src/taksonomia.mjs';
import { szablonyCwiczen, szablonyGlownej, szablonyListy, szablonyKategorii } from '../src/szablony.mjs';
import { requireData, tmpDist, BEZ_STARTU, repoFiles, read, isText } from './pomoc.mjs';
import { CZEKA, czytaj, plikiHtml, element, elementy, tekst, rozwiaz, istnieje, meta, linki, jsonld, wymiaryPng, nazwyLokalne, nazwaLokalna } from './strona-html.mjs';

requireData();
const ZEGAR = Date.UTC(2031, 0, 1), Prawdziwa = Date;
class Przestawiona extends Prawdziwa { constructor(...a) { super(...(a.length ? a : [ZEGAR])); } static now() { return ZEGAR; } }
let r; globalThis.Date = Przestawiona;
try { r = await build({ out: tmpDist(), cfg: { jezyki: ['pl', 'en'], indeksowanie: true, indeksowanieOd: '2026-12-01' }, ...BEZ_STARTU }); } finally { globalThis.Date = Prawdziwa; }
const { out, ctx, pages } = r, D = ctx.cfg.domena, JEZ = ['pl', 'en'];
const N = { pl: nazwyLokalne('pl'), en: null };
const indeksowane = new Set(pages.filter(p => p.indexable).map(p => p.file));
const cw = l => ctx.data[l].exercises, plik = (l, e) => `${l}/exercises/${e.slug}/index.html`;
const zFigura = e => !!(e.figure && ctx.figs[e.slug]);
const nazwaStrony = (l, e) => nazwaLokalna(l, N[l], e) ?? e.name;
const SZ = Object.fromEntries(JEZ.map(l => [l, szablonyCwiczen(ctx.data[l], ctx.ui[l], l, Object.fromEntries(cw(l).map(e => [e.slug, { nazwaLokalna: N[l]?.[e.id] }])))]));
const tytul = h => tekst(element(h, 'title')?.wnetrze ?? '');

/* robots.txt: grupy User-agent → reguły (RFC 9309: kolejne linie User-agent tworzą jedną grupę) */
function grupy(txt) {
  const g = new Map(); let agenci = [], reguly = null;
  for (const w of txt.split('\n').map(x => x.replace(/#.*/, '').trim()).filter(Boolean)) {
    const [k, ...v] = w.split(':'), klucz = k.trim().toLowerCase(), wart = v.join(':').trim();
    if (klucz === 'user-agent') { if (reguly) { agenci = []; reguly = null; } agenci.push(wart); continue; }
    if (klucz === 'sitemap') continue;
    if (!reguly) { reguly = []; for (const a of agenci) g.set(a, reguly); }
    reguly.push(`${klucz}: ${wart}`);
  }
  return g;
}
const UCZENIE = ['GPTBot', 'ClaudeBot', 'CCBot', 'Applebot-Extended', '__usage_ai-training'], WYSZUKIWANIE = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Applebot'];

test('Z-34 robots.txt przy indeksowaniu (KO-130 wariant B): * Allow /; Disallow / dla GPTBot, ClaudeBot, CCBot, Applebot-Extended, __usage_ai-training; jawne Google-Extended Allow /; Sitemap; nic więcej', CZEKA('Z-34', 'robots.txt bez grup KO-130'), () => {
  const txt = czytaj(out, 'robots.txt'), g = grupy(txt);
  assert.deepEqual([...g.keys()].sort(), ['*', 'Google-Extended', ...UCZENIE].sort());
  assert.deepEqual(g.get('*'), ['allow: /']); assert.deepEqual(g.get('Google-Extended'), ['allow: /']);
  for (const a of UCZENIE) assert.deepEqual(g.get(a), ['disallow: /'], a);
  assert.match(txt, new RegExp(`^Sitemap: ${D}/sitemap\\.xml$`, 'm'));
});

test('Z-34 (A1, B9) roboty wyszukiwania i cytowań nie mają Disallow: Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot, Claude-User, PerplexityBot, Applebot (przechodzi dziś — strażnik przy dodawaniu grup KO-130)', () => {
  const g = grupy(czytaj(out, 'robots.txt'));
  for (const a of WYSZUKIWANIE) assert.ok(!(g.get(a) ?? g.get('*') ?? []).some(x => x.startsWith('disallow: /') && x !== 'disallow: '), a);
});

test('Z-34 (A3, A4) strony indeksowane: meta robots bez nosnippet, max-snippet, noarchive, nocache; w dist brak data-nosnippet (przechodzi dziś — strażnik)', () => {
  const zle = plikiHtml(out).filter(f => { const h = czytaj(out, f), m = meta(h, 'robots') ?? ''; return /data-nosnippet/.test(h) || (indeksowane.has(f) && /nosnippet|max-snippet|noarchive|nocache/.test(m)); });
  assert.deepEqual(zle, []);
});

test('Z-34 link kanoniczny: każda strona poza 404 i przekierowaniami ma dokładnie jeden <link rel="canonical"> na własny adres z domeną i „/” (przechodzi dziś — strażnik)', () => {
  const przek = new Set(pages.filter(p => p.kind === 'redirect').map(p => p.file));
  const zle = plikiHtml(out).filter(f => f !== '404.html' && !przek.has(f)).filter(f => { const c = linki(czytaj(out, f), 'canonical'); return c.length !== 1 || c[0].href !== `${D}/${urlOf(f)}`; });
  assert.deepEqual(zle, []);
});

test('Z-34 (A6) nazwa witryny: strona / ma WebSite JSON-LD (name, url = domena z „/”), name = <title> = h1 = og:site_name', CZEKA('Z-34', 'strona / bez JSON-LD'), () => {
  const h = czytaj(out, 'index.html'), ws = jsonld(h).find(j => j['@type'] === 'WebSite');
  assert.ok(ws, 'brak WebSite na /'); assert.equal(ws.url, `${D}/`);
  assert.equal(ws.name, tytul(h)); assert.equal(ws.name, tekst(element(h, 'h1').wnetrze)); assert.equal(meta(h, 'og:site_name'), ws.name);
});

test('Z-34 (A7) ikona: każda strona ma <link rel="icon"> na ten sam stały plik PNG w dist (kwadrat > 48 px), nie data:; /apple-touch-icon.png 180×180 (specyfikacja §7)', CZEKA('Z-34', 'ikona data:'), () => {
  const cele = new Set();
  for (const f of plikiHtml(out)) {
    const ik = linki(czytaj(out, f), 'icon'); assert.ok(ik.length, `${f}: brak ikony`);
    for (const i of ik) { assert.doesNotMatch(i.href, /^data:/, f); const p = rozwiaz(f, i.href, D); assert.ok(p && istnieje(out, p), `${f}: ${i.href}`); cele.add(p); }
  }
  for (const p of cele) { const w = wymiaryPng(readFileSync(join(out, p))); assert.ok(w && w.w === w.h && w.w > 48, `${p}: ${JSON.stringify(w)}`); }
  assert.ok(cele.size <= 2, `różne pliki ikony na stronach: ${[...cele]}`);
  assert.deepEqual(wymiaryPng(readFileSync(join(out, 'apple-touch-icon.png'))), { w: 180, h: 180 });
});

test('Z-34 (A8) obraz ćwiczenia: strona z figurą ma <img src alt> do istniejącego pliku, alt z nazwą ćwiczenia w języku strony; każdy <img> w dist ma alt i istniejący plik', CZEKA('Z-34', 'rysunek tylko jako <svg><use>'), () => {
  const zle = [];
  for (const l of JEZ) for (const e of cw(l).filter(zFigura)) {
    const f = plik(l, e), imgi = [...czytaj(out, f).matchAll(/<img\s[^>]*>/g)].map(m => m[0]);
    if (!imgi.some(t => { const src = t.match(/src="([^"]+)"/)?.[1], alt = t.match(/alt="([^"]*)"/)?.[1]; return src && istnieje(out, rozwiaz(f, src, D)) && alt?.includes(nazwaStrony(l, e).replace(/&/g, '&amp;').replace(/"/g, '&quot;')); })) zle.push(f);
  }
  for (const f of plikiHtml(out)) for (const m of czytaj(out, f).matchAll(/<img\s[^>]*>/g)) if (!/\salt="/.test(m[0]) || !istnieje(out, rozwiaz(f, m[0].match(/src="([^"]+)"/)?.[1] ?? '', D) ?? '')) zle.push(`${f}: ${m[0]}`);
  assert.equal(zle.length, 0, `${zle.length}, np. ${zle.slice(0, 2)}`);
});

const podglad = e => `${D}/assets/podglad/${e.slug}.png`;
test('Z-34 (A9) podgląd: strona z figurą ma og:image = /assets/podglad/<slug>.png (PNG 1200×630 w dist), og:image:alt = nazwa w języku strony, og:title = <title>, og:url = canonical, og:type i og:site_name', CZEKA('Z-34', 'brak og:*'), () => {
  const zle = [];
  for (const l of JEZ) for (const e of cw(l).filter(zFigura)) {
    const f = plik(l, e), h = czytaj(out, f), img = meta(h, 'og:image');
    const ok = img === podglad(e) && meta(h, 'og:image:alt') === nazwaStrony(l, e) && meta(h, 'og:title') === tytul(h) && meta(h, 'og:url') === linki(h, 'canonical')[0]?.href && meta(h, 'og:type') && meta(h, 'og:site_name');
    if (!ok) zle.push(f);
  }
  assert.equal(zle.length, 0, `${zle.length}, np. ${zle.slice(0, 2)}`);
});

test('Z-34 (A9, budżet §8 — decyzja Z-30 do weta): pliki podglądu — jeden PNG 1200×630 na ćwiczenie z figurą, każdy ≤ 30 KB, razem ≤ 10 MB (szacunek specyfikacji ok. 8 MB + 25%)', CZEKA('Z-34', 'brak assets/podglad'), () => {
  const kat = join(out, 'assets/podglad'), z = cw('en').filter(zFigura);
  const pliki = (() => { try { return readdirSync(kat); } catch { return []; } })();
  assert.deepEqual(z.filter(e => !pliki.includes(`${e.slug}.png`)).map(e => e.slug).slice(0, 5), []);
  let suma = 0; for (const p of pliki) { const b = readFileSync(join(kat, p)); suma += b.length; assert.deepEqual(wymiaryPng(b), { w: 1200, h: 630 }, p); assert.ok(b.length <= 30 * 1024, `${p}: ${b.length} B`); }
  assert.ok(suma <= 10 * 1024 * 1024, `razem ${suma} B`);
});

test('Z-34 podgląd bez figury (przypadek brzegowy, decyzja 4 specyfikacji [DO USTALENIA]): jeśli strona ma og:image, plik istnieje i nie jest ikoną witryny (przechodzi dziś — strażnik zakazu logo, A9)', () => {
  const zle = [];
  for (const l of JEZ) for (const e of cw(l).filter(e => !zFigura(e))) {
    const f = plik(l, e), h = czytaj(out, f), img = meta(h, 'og:image'); if (!img) continue;
    const p = rozwiaz(f, img, D); if (!p || !istnieje(out, p) || linki(h, 'icon').some(i => rozwiaz(f, i.href, D) === p) || /favicon|apple-touch|znak|logo/.test(p)) zle.push(f);
  }
  assert.deepEqual(zle, []);
});

test('Z-34 (A11) WebPage z primaryImageOfPage: strona z figurą ma WebPage JSON-LD (url = canonical), obraz = og:image; BreadcrumbList zostaje', CZEKA('Z-34', 'tylko BreadcrumbList'), () => {
  const zle = [];
  for (const l of JEZ) for (const e of cw(l).filter(zFigura)) {
    const f = plik(l, e), h = czytaj(out, f), j = jsonld(h), wp = j.find(x => x['@type'] === 'WebPage'), obraz = wp?.primaryImageOfPage;
    const url = typeof obraz === 'string' ? obraz : obraz?.url ?? obraz?.contentUrl;
    if (!wp || wp.url !== linki(h, 'canonical')[0]?.href || url !== podglad(e) || !j.some(x => x['@type'] === 'BreadcrumbList')) zle.push(f);
  }
  assert.equal(zle.length, 0, `${zle.length}, np. ${zle.slice(0, 2)}`);
});

test('Z-34 (B2) bez HowTo, FAQPage, Course, ExercisePlan, ClaimReview, LearningVideo w danych strukturalnych (przechodzi dziś — strażnik)', () => {
  const zle = plikiHtml(out).filter(f => jsonld(czytaj(out, f)).some(j => JSON.stringify(j).match(/"@type":"(HowTo|FAQPage|Course|ExercisePlan|ClaimReview|LearningVideo)"/)));
  assert.deepEqual(zle, []);
});

test('Z-34 (A10, Z-22) tytuł i opis strony ćwiczenia = szablony (pl z nazwami lokalnymi Z-32); pominOpis → brak <meta name="description">, nigdy na stronie indeksowanej', CZEKA('Z-34', 'tytuł „nazwa — witryna”, opis „nazwa: mięśnie”'), () => {
  const zle = [];
  for (const l of JEZ) for (const e of cw(l)) {
    const f = plik(l, e), h = czytaj(out, f), s = SZ[l].get(e.slug), opis = meta(h, 'description');
    if (s.pominOpis && indeksowane.has(f)) zle.push(`${f}: pominOpis na stronie indeksowanej`);
    if (tytul(h) !== s.tytul || (s.pominOpis ? opis !== null : opis !== s.opis)) zle.push(f);
  }
  assert.equal(zle.length, 0, `${zle.length}, np. ${zle.slice(0, 2)}`);
});

test('Z-34 przypadki brzegowe szablonów: istnieją strony z pominOpis (noindex) i tytuły > 60 znaków z nazwą lokalną w całości (przechodzi dziś — pilnuje, że test wyżej je obejmuje)', () => {
  assert.ok([...SZ.pl.values()].some(s => s.pominOpis) && [...SZ.en.values()].some(s => s.pominOpis));
  const dlugie = cw('pl').filter(e => [...(N.pl[e.id] ?? '')].length > 60);
  assert.ok(dlugie.length > 0); for (const e of dlugie) assert.equal(SZ.pl.get(e.slug).tytul, N.pl[e.id], e.slug);
});

test('Z-34 (Z-22) strona główna języka, lista A–Z i strony filtrów: tytuł i opis = szablony (szablonyGlownej, szablonyListy, szablonyKategorii)', CZEKA('Z-34', 'tytuły z ogonem nazwy witryny, opisy z licznika'), () => {
  const zle = [], DIR = { group: ['muscles', v => GROUP_ID[v]], equipment: ['equipment', v => EQUIPMENT_ID[v]], family: ['movements', v => familyId(v)] };
  for (const l of JEZ) {
    const d = ctx.data[l], ui = ctx.ui[l];
    const oczek = [[`${l}/index.html`, szablonyGlownej(d, ui, l)], [`${l}/exercises/index.html`, szablonyListy(d, ui, l)], ...szablonyKategorii(d, ui, l).map(s => [`${l}/${DIR[s.rodzaj][0]}/${DIR[s.rodzaj][1](s.wartosc)}/index.html`, s])];
    for (const [f, s] of oczek) { if (!istnieje(out, f)) { zle.push(`${f}: brak`); continue; } const h = czytaj(out, f); if (tytul(h) !== s.tytul || meta(h, 'description') !== s.opis) zle.push(f); }
  }
  assert.equal(zle.length, 0, `${zle.length}, np. ${zle.slice(0, 3)}`);
});

test('Z-34 (A10) strona / ma opis witryny: <meta name="description"> 50–160 znaków', CZEKA('Z-34', 'strona / bez opisu'), () => {
  const o = meta(czytaj(out, 'index.html'), 'description'); assert.ok(o, 'brak opisu'); assert.ok([...o].length >= 50 && [...o].length <= 160, o);
});

test('Z-34 (A10) unikalność: wśród stron indeksowanych języka każdy <title> i każdy opis występuje raz', CZEKA('Z-34', 'strona główna i lista mają ten sam opis'), () => {
  for (const l of JEZ) for (const [co, f] of [['tytuł', tytul], ['opis', h => meta(h, 'description')]]) {
    const w = [...indeksowane].filter(p => p.startsWith(`${l}/`)).map(p => f(czytaj(out, p))), powt = w.filter((x, i) => x && w.indexOf(x) !== i);
    assert.deepEqual([...new Set(powt)], [], `${l}: ${co}`);
  }
});

test('Z-34 (Z-22 2.3) krótka odpowiedź: strona z własnymi wskazówkami ma p.odp = szablon odpowiedzi (przy wskazówkach ogólnych i bez wskazówek — [DO USTALENIA], sprzeczność design-spec §5 z szablony-stron.md 2.3)', CZEKA('Z-34', 'brak krótkiej odpowiedzi'), () => {
  const zle = [];
  for (const l of JEZ) for (const e of cw(l).filter(e => e.cues.scope === 'own' && !e.cues.missing)) { const p = element(czytaj(out, plik(l, e)), 'p', 'odp'); if (!p || tekst(p.wnetrze) !== SZ[l].get(e.slug).odpowiedz) zle.push(plik(l, e)); }
  assert.equal(zle.length, 0, `${zle.length}, np. ${zle.slice(0, 2)}`);
});

test('Z-34 (Z-22 2.4) nagłówki-pytania: h2 strony ćwiczenia zawierają każde pytanie z szablonu, a nie ma pytania przy pustej sekcji', CZEKA('Z-34', 'h2 bez pytań'), () => {
  const zle = [], wszystkie = l => new Set([...SZ[l].values()].flatMap(s => Object.values(s.pytania)));
  for (const l of JEZ) { const P = wszystkie(l); for (const e of cw(l)) {
    const h2 = elementy(czytaj(out, plik(l, e)), 'h2').map(x => tekst(x.wnetrze)), oczek = Object.values(SZ[l].get(e.slug).pytania);
    if (oczek.some(p => !h2.includes(p)) || h2.some(t => P.has(t) && !oczek.includes(t))) zle.push(plik(l, e));
  } }
  assert.equal(zle.length, 0, `${zle.length}, np. ${zle.slice(0, 2)}`);
});

test('Z-34 (A13) mapy witryny: każdy <url> ma <lastmod> RRRR-MM-DD z danych, nie z zegara budowania (zegar przestawiony na 2031-01-01); bez changefreq i priority', CZEKA('Z-34', 'brak lastmod'), () => {
  for (const s of r.sitemaps.filter(s => s !== 'sitemap.xml')) {
    const xml = czytaj(out, s), urle = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
    assert.doesNotMatch(xml, /<changefreq>|<priority>/, s);
    for (const u of urle) { const lm = u.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/)?.[1]; assert.ok(lm, `${s}: brak lastmod`); assert.ok(lm < '2031-01-01', `${s}: lastmod ${lm} = data budowania`); }
  }
});

test('Z-34 (A12) IndexNow: przy indeksowaniu w korzeniu dist jest plik <klucz>.txt z treścią = klucz (8–128 znaków [A-Za-z0-9-])', CZEKA('Z-34', 'brak pliku klucza'), () => {
  const klucze = readdirSync(out).filter(f => f.endsWith('.txt') && f !== 'robots.txt').filter(f => readFileSync(join(out, f), 'utf8').trim() === basename(f, '.txt'));
  assert.equal(klucze.length, 1, `pliki klucza: ${klucze}`); assert.match(basename(klucze[0], '.txt'), /^[A-Za-z0-9-]{8,128}$/);
});

test('Z-34 (A12) wysyłka IndexNow nigdy z lokalnego budowania: src/ nie łączy się z api.indexnow.org ani innym punktem IndexNow (przechodzi dziś — strażnik; wysyłka tylko w pages.yml po zgodzie, Z-60/Z-62)', () => {
  const zle = repoFiles().filter(f => f.startsWith('src/') && isText(f)).filter(f => /indexnow\.org|\/indexnow\b/i.test(read(f)));
  assert.deepEqual(zle, []);
});
