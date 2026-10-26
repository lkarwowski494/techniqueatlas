// Generator (docs/54): przypięcie do commitu, indeksowanie (noindex do startu z 1.1; D1 własna treść; D3 języki), hreflang i canonical, mapy witryny, struktura stron, figura, budżety, linki wewnętrzne.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, posix } from 'node:path';
import { checkPin, build } from '../src/build.mjs';
import { readJson, CACHE } from '../src/lib.mjs';
import { buildOnce, requireData, distFiles, tmpDist } from './pomoc.mjs';
import { GROUP_ID, EQUIPMENT_ID, familyId } from '../src/taksonomia.mjs';

requireData();
const atlas = l => JSON.parse(readFileSync(join(CACHE, `dane/atlas-${l}.json`), 'utf8'));
const EN = atlas('en'), PL = atlas('pl');
const read = (out, f) => readFileSync(join(out, f), 'utf8');
const robots = html => html.match(/<meta name="robots" content="([^"]*)">/)?.[1] ?? null;
const htmlFiles = out => distFiles(out).filter(p => p.endsWith('.html')).map(p => p.slice(out.length + 1));
const INDEXING = { indeksowanie: true };

test('config: indeksowanie wyłączone do startu z wersją 1.1 (zmiana tej wartości to decyzja właściciela — zmień ten test w tym samym commicie)', () => { assert.equal(readJson('config.json').indeksowanie, false); });
test('przypięcie: dane z .cache pochodzą z commitu z PIN.json; rozjazd commitu w manifeście, figurach lub silniku przerywa budowanie', () => {
  const pin = checkPin(); assert.match(pin.commit, /^[0-9a-f]{40}$/);
  const a = 'a'.repeat(40), b = 'b'.repeat(40), ok = { pin: { commit: a }, manifest: { app: { commit: a } }, figury: { app: { commit: a } }, silnik: { app: { commit: a } } };
  assert.doesNotThrow(() => checkPin(ok));
  for (const k of ['manifest', 'figury', 'silnik']) assert.throws(() => checkPin({ ...ok, [k]: { app: { commit: b } } }), new RegExp(k));
});
test('język bez tekstów stałych (src/ui/<język>.json) nie jest budowany — błąd zamiast tekstu zastępczego (S10)', async () => {
  await assert.rejects(build({ out: tmpDist(), cfg: { jezyki: ['pl', 'xx'] } }), /brak src\/ui\/xx\.json|nie został wyeksportowany/);
});

test('noindex do startu: każda strona ma robots noindex,nofollow, robots.txt zabrania wszystkiego, brak map witryny', async () => {
  const { out } = await buildOnce();
  for (const f of htmlFiles(out)) assert.equal(robots(read(out, f)), 'noindex,nofollow', f);
  assert.equal(read(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  assert.deepEqual(readdirSync(out).filter(f => /^sitemap/.test(f)), []);
});

test('indeksowanie włączone: D1 — indeksowane tylko ćwiczenia z własnymi wskazówkami (kompletnymi w języku), reszta noindex,follow; strony list i filtrów indeksowane; D3 — tylko języki z indeksujJezyki', async () => {
  const { out } = await buildOnce('idx', INDEXING);
  for (const [l, d] of [['pl', PL], ['en', EN]]) for (const e of d.exercises) {
    const r = robots(read(out, `${l}/exercises/${e.slug}/index.html`)); const own = e.cues.scope === 'own' && !e.cues.missing;
    assert.equal(r, own ? null : 'noindex,follow', `${l} ${e.id} (${e.cues.scope})`);
  }
  for (const f of ['pl/index.html', 'pl/exercises/index.html', 'en/muscles/chest/index.html', 'index.html']) assert.equal(robots(read(out, f)), null, f);
  assert.equal(robots(read(out, '404.html')), 'noindex,nofollow');
  const only = await build({ out: tmpDist(), cfg: { ...INDEXING, indeksujJezyki: ['pl'] } });
  assert.equal(robots(read(only.out, 'en/exercises/back-squat/index.html')), 'noindex,follow'); assert.equal(robots(read(only.out, 'pl/exercises/back-squat/index.html')), null);
  assert.ok(!existsSync(join(only.out, 'sitemap-en.xml')) && existsSync(join(only.out, 'sitemap-pl.xml')));
});
test('reguła D1 sama zdejmuje noindex, gdy ćwiczenie dostanie własną treść: ćwiczenie ogólne → noindex,follow; ten sam wpis z własnymi wskazówkami → indeksowane', async () => {
  const general = EN.exercises.find(e => e.cues.scope === 'general'); assert.ok(general);
  const { out } = await buildOnce('idx', INDEXING); assert.equal(robots(read(out, `en/exercises/${general.slug}/index.html`)), 'noindex,follow');
  const own = EN.exercises.find(e => e.cues.scope === 'own' && !e.cues.missing); assert.equal(robots(read(out, `en/exercises/${own.slug}/index.html`)), null);
});

test('robots.txt i mapy witryny przy włączonym indeksowaniu: Allow + indeks map; mapa na język tylko ze stronami indeksowanymi, ≤ 50 000 adresów i ≤ 50 MB; strony noindex nie są w mapach', async () => {
  const { out, pages } = await buildOnce('idx', INDEXING);
  assert.equal(read(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${readJson('config.json').domena}/sitemap.xml\n`);
  const index = read(out, 'sitemap.xml'); for (const l of ['pl', 'en', 'glowna']) assert.match(index, new RegExp(`sitemap-${l}\\.xml`));
  const noindex = new Set(pages.filter(p => !p.indexable).map(p => p.file.replace(/index\.html$/, '')));
  for (const l of ['pl', 'en']) {
    const xml = read(out, `sitemap-${l}.xml`); const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    assert.ok(locs.length > 0 && locs.length <= 50000 && Buffer.byteLength(xml) <= 50 * 1024 * 1024);
    assert.equal(locs.length, pages.filter(p => p.lang === l && p.indexable).length);
    for (const loc of locs) { const path = loc.replace(/^https:\/\/[^/]+\//, ''); assert.ok(!noindex.has(path), `${loc} jest noindex`); assert.ok(existsSync(join(out, path, 'index.html')), loc); }
    assert.ok(!/<priority>|<changefreq>/.test(xml));
  }
});
test('mapa witryny: alternatywy językowe (xhtml:link) są wzajemne i dotyczą tylko wersji indeksowanych', async () => {
  const { out } = await buildOnce('idx', INDEXING);
  const parse = l => new Map([...read(out, `sitemap-${l}.xml`).matchAll(/<url><loc>([^<]+)<\/loc>((?:<xhtml:link[^>]*\/>)*)<\/url>/g)].map(m => [m[1], [...m[2].matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map(x => [x[1], x[2]])]));
  const pl = parse('pl'), en = parse('en');
  for (const [loc, alts] of pl) { const mine = alts.find(a => a[0] === 'pl'); assert.equal(mine[1], loc); for (const [lg, href] of alts.filter(a => a[0] === 'en')) assert.ok((en.get(href) ?? []).some(a => a[1] === loc), `${loc} ↔ ${href}`); }
});

test('hreflang i canonical (S7): każda strona wymienia wszystkie języki wzajemnie i x-default, canonical wskazuje ją samą i nigdy inny język', async () => {
  const { out } = await buildOnce(); const dom = readJson('config.json').domena;
  for (const f of htmlFiles(out).filter(f => /^(pl|en)\//.test(f))) {
    const h = read(out, f), lang = f.split('/')[0], dir = f.replace(/index\.html$/, '');
    assert.equal(h.match(/<link rel="canonical" href="([^"]+)">/)?.[1], `${dom}/${dir}`, f);
    const alts = Object.fromEntries([...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map(m => [m[1], m[2]]));
    assert.deepEqual(Object.keys(alts).sort(), ['en', 'pl', 'x-default'], f); assert.equal(alts[lang], `${dom}/${dir}`); assert.equal(alts['x-default'], `${dom}/`);
    const other = lang === 'pl' ? 'en' : 'pl'; assert.ok(existsSync(join(out, alts[other].slice(dom.length + 1), 'index.html')), `${f} → ${alts[other]}`);
    assert.ok(read(out, alts[other].slice(dom.length + 1) + 'index.html').includes(`hreflang="${lang}" href="${dom}/${dir}"`), `wzajemność ${f}`);
  }
});
test('strona wyboru języka: linki do wszystkich budowanych języków we własnym zapisie, bez przekierowania (D9), x-default = ta strona', async () => {
  const { out } = await buildOnce(); const h = read(out, 'index.html');
  assert.match(h, /<a href="pl\/" hreflang="pl" lang="pl">Polski<\/a>/); assert.match(h, /<a href="en\/" hreflang="en" lang="en">English<\/a>/);
  assert.doesNotMatch(h, /http-equiv="refresh"|location\.(replace|href)/i); assert.doesNotMatch(h, /<script(?![^>]*type="application\/ld\+json")/);
  assert.ok(existsSync(join(out, '404.html')));
});

test('strona ćwiczenia: nazwa jak w aplikacji, h1 z lang=en dla języków poza pl, sekcje w kolejności, mięśnie, sprzęt, zamienniki jako działające linki, bez sekcji bez tekstu', async () => {
  const { out } = await buildOnce(); const h = read(out, 'en/exercises/back-squat/index.html'); const e = EN.exercises.find(x => x.slug === 'back-squat');
  assert.match(h, /<h1 lang="en">Back Squat<\/h1>/); assert.match(read(out, 'pl/exercises/back-squat/index.html'), /<h1>Back Squat<\/h1>/);
  const order = ['<h1', 'data-figure', '>Setup<', '>Movement<', 'Main muscles', '>Tips<', '>Common mistakes<', '>Equipment needed<', '>Alternatives<', 'medical advice']; let at = -1;
  for (const m of order) { const i = h.indexOf(m); assert.ok(i > at, `kolejność: ${m}`); at = i; }
  for (const s of e.alternatives) assert.match(h, new RegExp(`<a href="\\.\\./${s}/" lang="en">`));
  const none = EN.exercises.find(x => x.cues.scope === 'none'); const hn = read(out, `en/exercises/${none.slug}/index.html`); assert.doesNotMatch(hn, />Setup<|>Tips<|>Common mistakes<|General tips/);
  const gen = EN.exercises.find(x => x.cues.scope === 'general' && x.cues.ok?.length); assert.match(read(out, `en/exercises/${gen.slug}/index.html`), /General tips for this movement/);
});
test('wszystkie linki wewnętrzne (href i src, względne) we wszystkich zbudowanych stronach prowadzą do istniejących plików (S7)', async () => {
  const { out } = await buildOnce(); const bad = [];
  for (const f of htmlFiles(out)) {
    const h = read(out, f); const dir = posix.dirname(f);
    for (const m of h.matchAll(/\b(?:href|src)="([^"#]+)"/g)) { const u = m[1]; if (/^(https?:|\/\/|mailto:)/.test(u)) continue; const t = posix.normalize(posix.join(dir === '.' ? '' : dir, u)); const p = join(out, t); if (!(existsSync(p) && (statSync(p).isFile() || existsSync(join(p, 'index.html'))))) bad.push(`${f} → ${u}`); }
    for (const m of h.matchAll(/<(?:a|link)[^>]*?\bhref="(https?:\/\/[^"]+)"/g)) { const u = m[1]; if (!/^https:\/\/(techniqueatlas\.com|apps4brew\.com|apps\.apple\.com)\//.test(u)) bad.push(`${f} → ${u}`); }
  }
  assert.deepEqual(bad.slice(0, 5), []);
});
test('figura: ćwiczenia z figurą mają obraz statyczny głównego widoku, przyciski, moduł danych w assets/fig/ i skrypt; ćwiczenia bez figury — brak figury i skryptu animacji; budżety HTML i modułu danych', async () => {
  const { out } = await buildOnce(); const withFig = EN.exercises.filter(e => e.figure);
  assert.equal(withFig.length, readdirSync(join(out, 'assets/fig')).length);
  for (const e of withFig) {
    const h = read(out, `en/exercises/${e.slug}/index.html`); assert.match(h, /<svg role="img"[^>]*><g transform="matrix\(1 0 0 -1[^"]*" data-g><(path|circle)/); assert.match(h, /data-pause/); assert.match(h, /assets\/figura-strona\.js/);
    assert.ok(gzipSync(readFileSync(join(out, `assets/fig/${e.slug}.js`))).length <= 30 * 1024, `${e.slug}: moduł figury > 30 KB gz`);
  }
  for (const e of EN.exercises.filter(x => !x.figure).slice(0, 50)) { const h = read(out, `en/exercises/${e.slug}/index.html`); assert.doesNotMatch(h, /data-figure|figura-strona/); }
  const big = htmlFiles(out).filter(f => /exercises\/[^/]+\/index\.html$/.test(f)).filter(f => statSync(join(out, f)).size > 20 * 1024); assert.deepEqual(big, []);
});
test('lokalna wyszukiwarka (D11): indeks nazw per język ≤ 25 KB gz, działa z pliku modułu; lista A–Z działa bez JS (pełna lista w HTML, filtry ukryte do uruchomienia skryptu)', async () => {
  const { out } = await buildOnce();
  for (const l of ['pl', 'en']) { const raw = read(out, `assets/idx/${l}.js`); assert.ok(gzipSync(raw).length <= 25 * 1024); assert.equal(JSON.parse(raw.replace(/^export default /, '').replace(/;\s*$/, '')).length, 709); }
  const h = read(out, 'en/exercises/index.html'); assert.equal((h.match(/<li data-muscle=/g) ?? []).length, 709); assert.match(h, /data-filtry hidden/); assert.match(h, /<p data-brak hidden>No exercises match these filters<\/p>/);
});
test('lista A–Z posortowana collatorem języka; strony filtrów zawierają dokładnie ćwiczenia o tej wartości; identyfikatory adresów pokrywają wszystkie wartości z danych', async () => {
  const { out } = await buildOnce();
  for (const [l, d] of [['pl', PL], ['en', EN]]) {
    const names = [...read(out, `${l}/exercises/index.html`).matchAll(/<li data-muscle="[^"]*"[^>]*><a href="[^"]*"[^>]*>([^<]*)<\/a>/g)].map(m => m[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'"));
    const c = new Intl.Collator(l); assert.deepEqual(names, [...d.exercises.map(e => e.name)].sort((a, b) => c.compare(a, b)));
    for (const g of new Set(d.exercises.map(e => e.group))) { assert.ok(g in GROUP_ID, g); const h = read(out, `${l}/muscles/${GROUP_ID[g]}/index.html`); assert.equal((h.match(/<li data-muscle=/g) ?? []).length, d.exercises.filter(e => e.group === g).length); }
    for (const q of new Set(d.exercises.map(e => e.equipment))) { assert.ok(q in EQUIPMENT_ID, q); assert.equal((read(out, `${l}/equipment/${EQUIPMENT_ID[q]}/index.html`).match(/<li data-muscle=/g) ?? []).length, d.exercises.filter(e => e.equipment === q).length); }
  }
  for (const f of new Set(EN.exercises.map(e => e.family))) assert.equal((read(out, `en/movements/${familyId(f)}/index.html`).match(/<li data-muscle=/g) ?? []).length, EN.exercises.filter(e => e.family === f).length);
});
test('strona główna języka: liczba ćwiczeń z danych, wyszukiwarka, linki do wszystkich wartości filtrów, lista podstawowych = ćwiczenia nie-niszowe z eksportu; WebSite w JSON-LD', async () => {
  const { out } = await buildOnce(); const h = read(out, 'en/index.html');
  assert.match(h, /709 exercises with technique notes/); assert.match(h, /data-szukaj data-lang="en"/);
  const basics = [...h.slice(h.indexOf('Basic exercises')).matchAll(/<li><a href="exercises\/([^/]+)\/"/g)].map(m => m[1]).sort();
  assert.deepEqual(basics, EN.exercises.filter(e => !e.niche).map(e => e.slug).sort());
  for (const g of new Set(EN.exercises.map(e => e.group))) assert.ok(h.includes(`href="muscles/${GROUP_ID[g]}/"`));
  assert.match(h, /"@type":"WebSite"/);
});
test('JSON-LD: tylko BreadcrumbList i WebSite, poprawny JSON; meta generator z wersją i skrótem aplikacji; CSP bez zasobów zewnętrznych (D4: bez analityki)', async () => {
  const { out } = await buildOnce(); const man = JSON.parse(readFileSync(join(CACHE, 'dane/manifest.json'), 'utf8'));
  for (const f of htmlFiles(out)) {
    const h = read(out, f); for (const m of h.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)) assert.ok(['BreadcrumbList', 'WebSite'].includes(JSON.parse(m[1])['@type']), f);
    assert.match(h, /<meta http-equiv="Content-Security-Policy" content="default-src 'self'/); assert.ok(h.includes(`<meta name="generator" content="techniqueatlas app ${man.app.version} ${man.app.commit.slice(0, 7)}">`), f);
    assert.doesNotMatch(h, /data-(origin|key|id|source)=/); /* D10 B: bez znaczników pochodzenia */
  }
});
test('Smart App Banner i wezwanie do App Store (D8): bez appStoreId brak obu; z appStoreId meta bez app-argument i link z tokenem kampanii per język', async () => {
  const { out } = await buildOnce(); assert.doesNotMatch(read(out, 'en/index.html'), /apple-itunes-app|apps\.apple\.com/);
  const r = await build({ out: tmpDist(), cfg: { appStoreId: '123456789' } }); const h = read(r.out, 'pl/exercises/back-squat/index.html');
  assert.match(h, /<meta name="apple-itunes-app" content="app-id=123456789">/); assert.doesNotMatch(h, /app-argument/); assert.match(h, /https:\/\/apps\.apple\.com\/app\/id123456789\?ct=techniqueatlas-pl/);
});
test('liczby w szablonach pochodzą z danych (S5): w src/pages.mjs i src/ui nie ma liczby ćwiczeń wpisanej na sztywno', () => {
  for (const f of ['src/pages.mjs', 'src/ui/pl.json', 'src/ui/en.json']) assert.doesNotMatch(readFileSync(join(import.meta.dirname, '..', f), 'utf8'), /\b709\b|\b87\b/);
});
