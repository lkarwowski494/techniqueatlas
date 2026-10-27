// Generator (docs/54): przypięcie do commitu, indeksowanie (noindex do startu z 1.1; D1 własna treść; D3 języki), hreflang i canonical, mapy witryny, struktura stron, figura, budżety, linki wewnętrzne.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, posix } from 'node:path';
import { checkPin, build } from '../src/build.mjs';
import { readJson, CACHE } from '../src/lib.mjs';
import { buildOnce, requireData, distFiles, tmpDist, BEZ_STARTU } from './pomoc.mjs';
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
  const { out } = await buildOnce('idx', INDEXING, BEZ_STARTU);
  for (const [l, d] of [['pl', PL], ['en', EN]]) for (const e of d.exercises) {
    const r = robots(read(out, `${l}/exercises/${e.slug}/index.html`)); const own = e.cues.scope === 'own' && !e.cues.missing;
    assert.equal(r, own ? null : 'noindex,follow', `${l} ${e.id} (${e.cues.scope})`);
  }
  for (const f of ['pl/index.html', 'pl/exercises/index.html', 'en/muscles/chest/index.html', 'index.html']) assert.equal(robots(read(out, f)), null, f);
  assert.equal(robots(read(out, '404.html')), 'noindex,nofollow');
  const only = await build({ out: tmpDist(), cfg: { ...INDEXING, indeksujJezyki: ['pl'] }, ...BEZ_STARTU });
  assert.equal(robots(read(only.out, 'en/exercises/back-squat/index.html')), 'noindex,follow'); assert.equal(robots(read(only.out, 'pl/exercises/back-squat/index.html')), null);
  assert.ok(!existsSync(join(only.out, 'sitemap-en.xml')) && existsSync(join(only.out, 'sitemap-pl.xml')));
});
test('reguła D1 sama zdejmuje noindex, gdy ćwiczenie dostanie własną treść: ćwiczenie ogólne → noindex,follow; ten sam wpis z własnymi wskazówkami → indeksowane', async () => {
  const general = EN.exercises.find(e => e.cues.scope === 'general'); assert.ok(general);
  const { out } = await buildOnce('idx', INDEXING, BEZ_STARTU); assert.equal(robots(read(out, `en/exercises/${general.slug}/index.html`)), 'noindex,follow');
  const own = EN.exercises.find(e => e.cues.scope === 'own' && !e.cues.missing); assert.equal(robots(read(out, `en/exercises/${own.slug}/index.html`)), null);
});

test('robots.txt i mapy witryny przy włączonym indeksowaniu: Allow + indeks map; mapa na język tylko ze stronami indeksowanymi, ≤ 50 000 adresów i ≤ 50 MB; strony noindex nie są w mapach', async () => {
  const { out, pages } = await buildOnce('idx', INDEXING, BEZ_STARTU);
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
  const { out } = await buildOnce('idx', INDEXING, BEZ_STARTU);
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
  const order = ['<h1', 'data-figure', '>Setup<', '>Movement<', 'Main muscles', '>Tips<', '>Common mistakes<', '>Equipment needed<', '>Substitutes<', 'medical advice']; let at = -1;
  for (const m of order) { const i = h.indexOf(m); assert.ok(i > at, `kolejność: ${m}`); at = i; }
  for (const s of e.alternatives) assert.match(h, new RegExp(`<a href="\\.\\./${s}/" lang="en">`));
  const none = EN.exercises.find(x => x.cues.scope === 'none'); const hn = read(out, `en/exercises/${none.slug}/index.html`); assert.doesNotMatch(hn, />Setup<|>Tips<|>Common mistakes<|General tips/);
  const gen = EN.exercises.find(x => x.cues.scope === 'general' && x.cues.ok?.length); assert.match(read(out, `en/exercises/${gen.slug}/index.html`), /General tips for this movement/);
});
test('wszystkie linki wewnętrzne (href i src, względne) we wszystkich zbudowanych stronach prowadzą do istniejących plików (S7)', async () => {
  const { out } = await buildOnce(); const bad = [];
  for (const f of htmlFiles(out)) {
    const h = read(out, f); const dir = posix.dirname(f);
    for (const m of h.matchAll(/\b(?:href|src)="([^"#]+)"/g)) { const u = m[1]; if (/^(https?:|\/\/|mailto:|data:)/.test(u)) continue; const t = posix.normalize(posix.join(dir === '.' ? '' : dir, u)); const p = join(out, t); if (!(existsSync(p) && (statSync(p).isFile() || existsSync(join(p, 'index.html'))))) bad.push(`${f} → ${u}`); }
    for (const m of h.matchAll(/<(?:a|link)[^>]*?\bhref="(https?:\/\/[^"]+)"/g)) { const u = m[1]; if (!/^https:\/\/(techniqueatlas\.com|apps4brew\.com|apps\.apple\.com)\//.test(u)) bad.push(`${f} → ${u}`); }
  }
  assert.deepEqual(bad.slice(0, 5), []);
});
test('figura: ćwiczenia z figurą mają dwie pozycje statyczne z podpisami (wyjściowa, skrajna; figura statyczna — tylko skrajna, bez podpisu) z arkusza assets/poz/, ukryte animowane widoki, przyciski, moduł danych i skrypt; bez figury — brak figury; budżety', async () => {
  const { out } = await buildOnce(); const withFig = EN.exercises.filter(e => e.figure); const figs = JSON.parse(readFileSync(join(CACHE, 'dane/figury.json'), 'utf8')).figures;
  assert.equal(withFig.length, readdirSync(join(out, 'assets/fig')).length); assert.equal(withFig.length, readdirSync(join(out, 'assets/poz')).length);
  let single = 0;
  for (const e of withFig) {
    const h = read(out, `en/exercises/${e.slug}/index.html`), fig = figs[e.slug], poses = h.match(/<div class="pozycje" data-poses>(.*?)<\/div><\/div>\n/s)[1];
    const uses = [...poses.matchAll(/<use href="\.\.\/\.\.\/\.\.\/assets\/poz\/([^"#]+)\.svg#(start|end)"\/>/g)].map(m => [m[1], m[2]]);
    assert.deepEqual(uses, fig.static ? [[e.slug, 'end']] : [[e.slug, 'start'], [e.slug, 'end']], e.slug);
    if (fig.static) { single++; assert.doesNotMatch(poses, /<p class="drobne">/); } else assert.deepEqual([...poses.matchAll(/<p class="drobne">([^<]*)<\/p>/g)].map(m => m[1]), ['Starting position', 'End position'], e.slug);
    assert.match(poses, /<svg role="img" aria-label="Movement drawing: [^"]*"/); assert.doesNotMatch(h, /<path|<circle/); /* geometria poza HTML (budżet, wspólna dla języków) */
    assert.match(h, /<div class="widoki" data-views hidden>(<svg role="img"[^>]*data-view="[a-z]+"><g [^>]*data-g><\/g><\/svg>)+<\/div>/); assert.match(h, /data-pause/); assert.match(h, /assets\/figura-strona\.js/);
    const sheet = read(out, `assets/poz/${e.slug}.svg`); assert.equal([...sheet.matchAll(/<g id="(start|end)"/g)].map(m => m[1]).join(), fig.static ? 'end' : 'start,end'); assert.match(sheet, /var\(--f-skin/); assert.doesNotMatch(sheet, /#[0-9a-f]{6}/i);
    assert.ok(gzipSync(readFileSync(join(out, `assets/fig/${e.slug}.js`))).length <= 30 * 1024, `${e.slug}: moduł figury > 30 KB gz`); assert.ok(gzipSync(sheet).length <= 30 * 1024, `${e.slug}: arkusz pozycji > 30 KB gz`);
  }
  const pl = read(out, 'pl/exercises/back-squat/index.html'); assert.match(pl, />Pozycja wyjściowa<\/p>/); assert.match(pl, />Pozycja końcowa<\/p>/);
  for (const e of EN.exercises.filter(x => !x.figure).slice(0, 50)) { const h = read(out, `en/exercises/${e.slug}/index.html`); assert.doesNotMatch(h, /data-figure|figura-strona|data-poses/); }
  const big = htmlFiles(out).filter(f => /exercises\/[^/]+\/index\.html$/.test(f)).filter(f => statSync(join(out, f)).size > 20 * 1024); assert.deepEqual(big, []);
});
test('sylwetka mięśni: arkusz assets/sylwetka.svg + klasy stopni partii (bez inline style — CSP), przód i tył z podpisami, dekoracyjna (aria-hidden); zgodna z danymi eksportu; arkusz klas CSS dla wszystkich partii i stopni', async () => {
  const { out } = await buildOnce(); const sil = JSON.parse(readFileSync(join(CACHE, 'dane/sylwetka.json'), 'utf8'));
  assert.equal(read(out, 'assets/sylwetka.svg'), sil.sprite);
  const css = read(out, 'assets/sylwetka.css'); for (let i = 0; i < sil.muscles.length; i++) for (const l of [1, 2, 3, 4]) assert.ok(css.includes(`.sylwetki.s${i}-${l}{--mm-${i}:var(--mm-l${l})}`), `${i}-${l}`);
  for (const [l, d] of [['pl', PL], ['en', EN]]) for (const e of d.exercises) {
    const h = read(out, `${l}/exercises/${e.slug}/index.html`), lv = sil.levels[e.slug], m = h.match(/<div class="sylwetki ([^"]*)" aria-hidden="true">(.*?)<\/div><\/div>/s);
    if (!lv.some(v => v > 0)) { assert.equal(m, null, e.id); assert.doesNotMatch(h, /sylwetka\.css/); continue; }
    assert.deepEqual(m[1].split(' ').sort(), lv.map((v, i) => v ? `s${i}-${v}` : '').filter(Boolean).sort(), e.id);
    assert.match(m[2], /<use href="\.\.\/\.\.\/\.\.\/assets\/sylwetka\.svg#front"\/>.*>(Front|Przód)<\/p>.*<use href="\.\.\/\.\.\/\.\.\/assets\/sylwetka\.svg#back"\/>.*>(Back|Tył)<\/p>/s);
    assert.match(h, /<link rel="stylesheet" href="\.\.\/\.\.\/\.\.\/assets\/sylwetka\.css">/); assert.doesNotMatch(h, /\sstyle="/);
    if (l === 'en' && h.includes('Main muscles')) assert.ok(h.indexOf('class="sylwetki') < h.indexOf('Main muscles'), e.id); /* sylwetka przed listą mięśni */
  }
  const sq = read(out, 'en/exercises/back-squat/index.html'); assert.match(sq, /class="sylwetki s5-4 s7-2 s11-2"/);
});
test('role mięśni: sekcja pokazuje zdania o roli mięśnia dopiero, gdy eksport je zawiera (ex.roles, etykieta regionu + zdanie, z ucieczką HTML); bez danych — tylko listy główne / pomocnicze, bez pustej listy', async () => {
  const { exercisePage } = await import('../src/pages.mjs'); const { out, ctx } = await buildOnce();
  assert.match(read(out, 'en/exercises/back-squat/index.html'), /<ul class="role"><li><strong>quads<\/strong> — Straightens your knee as you stand up\.<\/li><li><strong>glutes<\/strong>/); /* eksport aplikacji 1.1: roles = [{ region, text }] */
  assert.doesNotMatch(read(out, 'en/exercises/back-squat/index.html'), /<strong>undefined</);
  const ex = ctx.data.en.exercises.find(e => e.slug === 'back-squat');
  const withRoles = exercisePage(ctx, 'en', { ...ex, roles: [{ region: 'quads', text: 'Straightens the knee <when> you stand up.' }, { region: 'glutes', text: 'Helps extend the hip.' }] }).html;
  assert.match(withRoles, /<ul class="role"><li><strong>quads<\/strong> — Straightens the knee &lt;when&gt; you stand up\.<\/li><li><strong>glutes<\/strong> — Helps extend the hip\.<\/li><\/ul>/);
  assert.ok(withRoles.indexOf('Supporting muscles') < withRoles.indexOf('class="role"') && withRoles.indexOf('class="role"') < withRoles.indexOf('>Tips<'));
  for (const none of [undefined, []]) assert.doesNotMatch(exercisePage(ctx, 'en', { ...ex, roles: none }).html, /class="role"/);
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
    assert.match(h, /<link rel="icon" href="data:,">/, f); /* bez żądania /favicon.ico (404 w konsoli przeglądarki) */
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

test('countLine: forma liczby wg Intl.PluralRules (pl, cs, lt, ro) dla 1, 2, 5, 21 i 709', async () => {
  const { plural, fill } = await import('../src/lib.mjs');
  const { readFileSync } = await import('node:fs');
  const ui = l => JSON.parse(readFileSync(new URL(`../src/ui/${l}.json`, import.meta.url), 'utf8')).countLine;
  const line = (l, n) => fill(plural(l, ui(l), n), { n });
  const want = {
    pl: { 1: '1 ćwiczenie', 2: '2 ćwiczenia', 5: '5 ćwiczeń', 21: '21 ćwiczeń', 709: '709 ćwiczeń' },
    cs: { 1: '1 cvik', 2: '2 cviky', 5: '5 cviků', 21: '21 cviků', 709: '709 cviků' },
    lt: { 1: '1 pratimas', 2: '2 pratimai', 5: '5 pratimai', 21: '21 pratimas', 709: '709 pratimai' },
    ro: { 1: '1 exercițiu', 2: '2 exerciții', 5: '5 exerciții', 21: '21 de exerciții', 709: '709 exerciții' },
  };
  for (const [l, o] of Object.entries(want)) for (const [n, start] of Object.entries(o)) assert.ok(line(l, +n).startsWith(start + ' '), `${l} ${n}: ${line(l, +n)}`);
  assert.equal(plural('en', 'tekst', 3), 'tekst');
});
