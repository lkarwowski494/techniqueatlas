// Generator statyczny: dane z repo aplikacji (.cache/dane, .cache/silnik — pobrane przez `npm run dane` na commicie z PIN.json) → dist/ (HTML, SVG, JS, mapy witryny).
// Bez frameworka i zależności (decyzja i opcje: README). Użycie: node src/build.mjs [--out dist]
import { mkdirSync, writeFileSync, cpSync, rmSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, CACHE, readJson, hasData, esc } from './lib.mjs';
import { chooserPage, notFoundPage, homePage, listPage, filterPage, exercisePage, figureModule, poseSheet, redirectPage, paths, urlOf } from './pages.mjs';
import { effectiveSlugs, checkSlugLock, remapSlugs } from './slugi.mjs';
import { startGuards } from './straznicy.mjs';
import { GROUP_ID, EQUIPMENT_ID, familyId, hreflangCodes } from './taksonomia.mjs';

/** Sprawdza, że pobrane dane i silnik pochodzą z commitu z PIN.json. */
export function checkPin(src = {}) {
  const pin = src.pin ?? readJson('PIN.json'), man = src.manifest ?? readJson('.cache/dane/manifest.json'), fig = src.figury ?? readJson('.cache/dane/figury.json'), eng = src.silnik ?? readJson('.cache/silnik/MANIFEST.json');
  for (const [k, a] of Object.entries({ manifest: man.app, figury: fig.app, silnik: eng.app })) if (a.commit !== pin.commit) throw new Error(`PIN.json (${pin.commit.slice(0, 7)}) ≠ ${k} (${String(a.commit).slice(0, 7)}) — uruchom npm run dane`);
  return pin;
}

const write = (out, file, text) => { const p = join(out, file); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };

/** `slugi` i `pominStraznikowStartu` to wejścia dla testów: pierwsze podaje zamrożenie i tabelę adresów zamiast plików, drugie wyłącza warunki startu: S3/S4/S6 i wymóg zamrożonych adresów (testy sitemap przy indeksowanie=true na danych przed wydaniem); CLI nie przekazuje żadnego. */
export async function build({ out = join(ROOT, 'dist'), cfg: over = {}, slugi, pominStraznikowStartu = false } = {}) {
  const cfg = { ...readJson('config.json'), ...over };
  if (!hasData()) throw new Error('brak danych z aplikacji — uruchom: npm run dane');
  checkPin();
  const man = readJson('.cache/dane/manifest.json'); let figs = readJson('.cache/dane/figury.json').figures, sil = readJson('.cache/dane/sylwetka.json');
  const engine = await import(pathToFileURL(join(CACHE, 'silnik/figura.js')).href);
  let data = {}; const langs = cfg.jezyki, ui = {}, collators = {}, bySlug = {}, names = {};
  for (const l of langs) {
    const m = man.languages.find(x => x.lang === l); if (!m) throw new Error(`język ${l} nie został wyeksportowany (manifest)`);
    if (!existsSync(join(ROOT, `src/ui/${l}.json`))) throw new Error(`brak src/ui/${l}.json — język nie ma tekstów stałych strony (bez zastępczego tekstu)`);
    names[l] = m.name; data[l] = readJson(`.cache/dane/${m.file}`); ui[l] = readJson(`src/ui/${l}.json`); collators[l] = new Intl.Collator(l); bySlug[l] = new Map(data[l].exercises.map(e => [e.slug, e]));
  }
  /* adresy: nadpisania, zamrożenie i przekierowania (S7); potem guardy startu S3/S4/S6 */
  const warnings = [], pin = readJson('PIN.json'), sl = slugi ?? { lock: readJson('slugs.lock.json').slugi, overrides: readJson('slug-overrides.json') };
  const eff = effectiveSlugs(data[langs[0]].exercises, sl.overrides.nadpisania), lockCheck = checkSlugLock({ current: eff.slugs, lock: sl.lock, redirects: sl.overrides.przekierowania, indexing: !!cfg.indeksowanie && !pominStraznikowStartu });
  if (eff.errors.length || lockCheck.errors.length) throw new Error([...eff.errors, ...lockCheck.errors].join('\n'));
  warnings.push(...lockCheck.warnings);
  ({ data, figs, sil } = remapSlugs({ data, figs, sil }, new Map(data[langs[0]].exercises.map(e => [e.slug, eff.slugs.get(e.id)]))));
  for (const l of langs) bySlug[l] = new Map(data[l].exercises.map(e => [e.slug, e]));
  if (!pominStraznikowStartu) { const g = startGuards({ cfg, pin, manifest: man, data, langs }); if (g.errors.length) throw new Error(g.errors.join('\n')); warnings.push(...g.warnings); }
  const familyLabel = (l, f) => ui[l].families?.[f];
  if (sil.app.commit !== pin.commit) throw new Error('sylwetka.json pochodzi z innego commitu niż PIN.json — uruchom npm run dane');
  const ctx = { cfg, man, figs, sil, data, ui, collators, bySlug, names, langs, engine, familyLabel };
  const pages = [chooserPage(ctx), notFoundPage(ctx)];
  const groups = l => ({ muscle: [...new Set(data[l].exercises.map(e => e.group))].map(v => ({ id: GROUP_ID[v], value: v, label: data[l].labels.groups[v] })), equipment: [...new Set(data[l].exercises.map(e => e.equipment))].map(v => ({ id: EQUIPMENT_ID[v], value: v, label: data[l].labels.equipment[v] })), movement: [...new Set(data[l].exercises.map(e => e.family))].map(f => ({ id: familyId(f), value: f, label: familyLabel(l, f) })).filter(x => x.label) });
  const report = { languages: {} };
  for (const l of langs) {
    pages.push(homePage(ctx, l), listPage(ctx, l));
    const g = groups(l); for (const kind of ['muscle', 'equipment', 'movement']) for (const x of g[kind]) { if (!x.id) throw new Error(`brak identyfikatora adresu: ${kind} ${x.value}`); pages.push(filterPage(ctx, l, kind, x)); }
    for (const ex of data[l].exercises) pages.push(exercisePage(ctx, l, ex));
    report.languages[l] = { exercises: data[l].exercises.length, withoutFigure: data[l].exercises.filter(e => !e.figure).length, cuesWithoutText: data[l].meta.cuesWithoutText, missingFamilyLabels: [...new Set(data[l].exercises.map(e => e.family))].filter(f => !familyLabel(l, f)) };
  }
  for (const l of langs) for (const r of lockCheck.redirects) pages.push(redirectPage(ctx, l, r.from, r.to));
  rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
  for (const p of pages) write(out, p.file, p.html);
  /* zasoby: własne pliki strony, silnik figur z aplikacji, dane figur i indeks nazw per język */
  cpSync(join(ROOT, 'assets'), join(out, 'assets'), { recursive: true }); cpSync(join(CACHE, 'silnik'), join(out, 'assets/silnik'), { recursive: true }); rmSync(join(out, 'assets/silnik/MANIFEST.json'), { force: true });
  write(out, 'assets/sylwetka.svg', sil.sprite);
  /* klasy stopni sylwetki (s<partia>-<stopień>) → zmienne CSS arkusza; kolory zmiennych --mm-* są w site.css (jasny/ciemny wygląd) */
  write(out, 'assets/sylwetka.css', sil.vars.muscle.flatMap((v, i) => [1, 2, 3, 4].map(l => `.sylwetki.s${i}-${l}{${v}:var(--mm-l${l})}`)).join('\n') + '\n');
  for (const [slug, f] of Object.entries(figs)) if (data[langs[0]].exercises.some(e => e.slug === slug)) { write(out, `assets/fig/${slug}.js`, figureModule(ctx, slug, f)); write(out, `assets/poz/${slug}.svg`, poseSheet(ctx, f)); }
  for (const l of langs) write(out, `assets/idx/${l}.js`, `export default ${JSON.stringify(data[l].exercises.map(e => [e.name, e.slug]))};\n`);
  /* robots.txt i mapy witryny zależą od jednego ustawienia; w mapach tylko strony indeksowane, alternatywy tylko z indeksowanych wersji */
  const sitemaps = [];
  if (cfg.indeksowanie) {
    const key = p => p.file.replace(/^[^/]+\//, ''), idx = pages.filter(p => p.indexable);
    const altOf = p => idx.filter(q => q.lang && q.lang !== null && key(q) === key(p));
    const url = p => `${cfg.domena}/${urlOf(p.file)}`;
    for (const l of langs) {
      const mine = idx.filter(p => p.lang === l); if (!mine.length) continue;
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${mine.map(p => `<url><loc>${esc(url(p))}</loc>${altOf(p).flatMap(q => hreflangCodes(q.lang).map(c => `<xhtml:link rel="alternate" hreflang="${esc(c)}" href="${esc(url(q))}"/>`)).join('')}</url>`).join('\n')}\n</urlset>\n`;
      write(out, `sitemap-${l}.xml`, xml); sitemaps.push(`sitemap-${l}.xml`);
    }
    write(out, 'sitemap-glowna.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${esc(cfg.domena)}/</loc></url></urlset>\n`); sitemaps.push('sitemap-glowna.xml');
    write(out, 'sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps.map(s => `<sitemap><loc>${esc(cfg.domena)}/${s}</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`);
    write(out, 'robots.txt', `User-agent: *\nAllow: /\nSitemap: ${cfg.domena}/sitemap.xml\n`);
  } else write(out, 'robots.txt', 'User-agent: *\nDisallow: /\n');
  write(out, '.nojekyll', '');
  mkdirSync(CACHE, { recursive: true }); writeFileSync(join(CACHE, 'raport-brakow.json'), JSON.stringify({ app: man.app, ...report }, null, 1) + '\n'); /* raport poza dist: nie jest publikowany */
  return { out, pages, cfg, report, sitemaps, warnings, ctx };
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  /* --out <katalog>; --jezyki pl,en,… albo --wszystkie (wszystkie języki z eksportu; config.json bez zmian — do sprawdzenia 35 języków lokalnie i w CI) */
  const a = process.argv.slice(2), arg = n => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : undefined; };
  const jezyki = a.includes('--wszystkie') ? readJson('.cache/dane/manifest.json').languages.map(l => l.lang) : arg('--jezyki')?.split(',');
  const r = await build({ ...(arg('--out') ? { out: arg('--out') } : {}), ...(jezyki ? { cfg: { jezyki } } : {}) });
  console.log(`build: ${r.pages.length} stron → ${r.out} (indeksowanie: ${r.cfg.indeksowanie}; języki: ${r.cfg.jezyki.length > 6 ? r.cfg.jezyki.length : r.cfg.jezyki.join(',')}; wersja aplikacji ${readJson('.cache/dane/manifest.json').app.version})`);
  for (const w of r.warnings ?? []) console.warn(`UWAGA: ${w}`);
}
