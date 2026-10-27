// Szablony stron (specyfikacja docs/54, pkt 3): wybór języka, strona główna języka, lista A–Z z filtrami, strony jednego filtra, strona ćwiczenia, 404. Czyste funkcje: dane → HTML.
// Minimalny wygląd (assets/site.css); wszystkie teksty stałe z src/ui/<język>.json, treść ćwiczeń z eksportu aplikacji — bez zastępczych tekstów z innych języków.
import { esc, fill, plural, jsonForScript, relUrl } from './lib.mjs';
import { langPath, hreflang, hreflangCodes, GROUP_ID, EQUIPMENT_ID, familyId } from './taksonomia.mjs';

const SECTION = ['setup', 'move'];
const abs = (cfg, path) => `${cfg.domena}/${path}`;
const dirOf = file => file.replace(/index\.html$/, '');

/** Wspólny układ strony. `meta`: { file, lang, title, description, robots, canonical, alternates: [{lang, path}], jsonld: [], scripts: [rel→assets], generator, appStoreId, csp } */
export function layout(ctx, m, bodyHtml) {
  const { cfg } = ctx; const u = to => m.file === '404.html' ? `/${to}` : relUrl(m.file, to); /* 404.html jest serwowana pod dowolnym adresem (Pages) — tylko adresy od korzenia */ const ui = ctx.ui[m.lang ?? cfg.jezykDomyslny];
  const alt = (m.alternates ?? []).flatMap(a => hreflangCodes(a.lang).map(c => `<link rel="alternate" hreflang="${esc(c)}" href="${esc(abs(cfg, a.path))}">`));
  if (m.xDefault !== undefined) alt.push(`<link rel="alternate" hreflang="x-default" href="${esc(abs(cfg, m.xDefault))}">`);
  const head = [
    '<meta charset="utf-8">', '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'">`,
    `<title>${esc(m.title)}</title>`, m.description ? `<meta name="description" content="${esc(m.description)}">` : '',
    `<meta name="generator" content="techniqueatlas app ${esc(ctx.man.app.version)} ${esc(ctx.man.app.commit.slice(0, 7))}">`,
    m.refresh ? `<meta http-equiv="refresh" content="0;url=${esc(m.refresh)}">` : '', m.robots ? `<meta name="robots" content="${m.robots}">` : '', m.canonical ? `<link rel="canonical" href="${esc(abs(cfg, m.canonical))}">` : '', ...alt,
    cfg.appStoreId ? `<meta name="apple-itunes-app" content="app-id=${esc(cfg.appStoreId)}">` : '',
    `<link rel="stylesheet" href="${u('assets/site.css')}">`, ...(m.styles ?? []).map(c => `<link rel="stylesheet" href="${u(c)}">`),
    ...(m.jsonld ?? []).map(j => `<script type="application/ld+json">${jsonForScript(j)}</script>`),
  ].filter(Boolean).join('\n');
  const crumbs = m.crumbs?.length ? `<nav aria-label="${esc(ui.breadcrumbs)}"><ol>${m.crumbs.map((c, i) => `<li>${c.path && i < m.crumbs.length - 1 ? `<a href="${u(c.path)}">${esc(c.name)}</a>` : `<span aria-current="page"${c.lang ? ` lang="${c.lang}"` : ''}>${esc(c.name)}</span>`}</li>`).join('')}</ol></nav>` : '';
  const langs = (m.alternates ?? []).length > 1 ? `<p>${esc(ui.language)}: ${m.alternates.map(a => a.lang === m.lang ? `<span aria-current="true">${esc(ctx.names[a.lang])}</span>` : `<a href="${u(a.path)}" hreflang="${esc(hreflang(a.lang))}" lang="${esc(hreflang(a.lang))}">${esc(ctx.names[a.lang])}</a>`).join(' · ')}</p>` : '';
  const store = cfg.appStoreId ? `<p><a href="https://apps.apple.com/app/id${esc(cfg.appStoreId)}?ct=techniqueatlas-${esc(m.lang ?? 'x')}">${esc(ui.appStore)}</a></p>` : '';
  const scripts = (m.scripts ?? []).map(s => `<script type="module" src="${u(s)}"></script>`).join('\n');
  return `<!doctype html>\n<html lang="${esc(hreflang(m.lang ?? cfg.jezykDomyslny))}">\n<head>\n${head}\n</head>\n<body>\n<a class="skip" href="#tresc">${esc(ui.skip)}</a>\n<header>${crumbs}</header>\n<main id="tresc">\n${bodyHtml}\n</main>\n<footer>\n${store}${langs}<p class="drobne"><a href="${esc(cfg.polityka)}">${esc(ui.privacy)}</a> · ${esc(ui.rights)}</p>\n</footer>\n${scripts}\n</body>\n</html>\n`;
}

const P = lang => langPath(lang);
export const paths = {
  chooser: () => 'index.html', home: l => `${P(l)}/index.html`, list: l => `${P(l)}/exercises/index.html`,
  exercise: (l, slug) => `${P(l)}/exercises/${slug}/index.html`, muscle: (l, id) => `${P(l)}/muscles/${id}/index.html`, equipment: (l, id) => `${P(l)}/equipment/${id}/index.html`, movement: (l, id) => `${P(l)}/movements/${id}/index.html`,
};
/** Adres katalogu strony (z końcowym „/”) dla alternatyw, canonical i sitemap. */
export const urlOf = file => dirOf(file);
const nameAttr = (lang, ex) => lang === 'pl' ? '' : ' lang="en"'; /* nazwy ćwiczeń są angielskie we wszystkich językach poza polskim (jak w aplikacji, DEC-13) */

function alternatesFor(ctx, make) { return ctx.langs.map(l => ({ lang: l, path: urlOf(make(l)) })); }
const crumbBase = (ctx, lang) => [{ name: ctx.ui[lang].home, path: paths.home(lang) }];
const bcJson = (ctx, items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(ctx.cfg, urlOf(c.path)) })) });

/** Czy strona trafia do indeksu: globalny wyłącznik, język w indeksujJezyki (D3) i własna treść (D1). */
export function robotsFor(ctx, lang, ownContent = true) {
  if (!ctx.cfg.indeksowanie) return 'noindex,nofollow';
  return ctx.cfg.indeksujJezyki.includes(lang) && ownContent ? '' : 'noindex,follow';
}

export function chooserPage(ctx) {
  const file = paths.chooser(); const ui = ctx.ui[ctx.cfg.jezykDomyslny];
  const items = ctx.langs.map(l => `<li><a href="${relUrl(file, urlOf(paths.home(l)))}" hreflang="${esc(hreflang(l))}" lang="${esc(hreflang(l))}">${esc(ctx.names[l])}</a></li>`).join('');
  const html = layout(ctx, { file, lang: ctx.cfg.jezykDomyslny, title: ui.siteName, description: '', robots: robotsFor(ctx, ctx.cfg.jezykDomyslny), canonical: '', alternates: [], xDefault: '' },
    `<h1>${esc(ui.siteName)}</h1>\n<h2>${esc(ui.chooseLanguage)}</h2>\n<ul class="chipy">${items}</ul>`);
  return { file, html, lang: null, kind: 'chooser', indexable: !!ctx.cfg.indeksowanie };
}

export function notFoundPage(ctx) {
  const file = '404.html'; const ui = ctx.ui[ctx.cfg.jezykDomyslny];
  const items = ctx.langs.map(l => `<li><a href="/${urlOf(paths.home(l))}" lang="${esc(hreflang(l))}">${esc(ctx.names[l])}</a></li>`).join('');
  return { file, html: layout(ctx, { file, lang: ctx.cfg.jezykDomyslny, title: ui.pageNotFound, robots: 'noindex,nofollow' }, `<h1>${esc(ui.pageNotFound)}</h1>\n<ul class="chipy">${items}</ul>`), kind: '404', indexable: false };
}

function groupsOf(ctx, lang) {
  const d = ctx.data[lang]; const ex = d.exercises;
  const by = (key, idMap, labels) => [...new Set(ex.map(e => e[key]))].map(v => { if (!(v in idMap)) throw new Error(`brak identyfikatora adresu dla ${key} = ${v} (src/taksonomia.mjs)`); return { id: idMap[v], value: v, label: labels[v], n: ex.filter(e => e[key] === v).length }; }).sort((a, b) => ctx.collators[lang].compare(a.label, b.label));
  const fam = [...new Set(ex.map(e => e.family))].map(f => ({ id: familyId(f), value: f, label: ctx.familyLabel(lang, f), n: ex.filter(e => e.family === f).length })).filter(x => x.label).sort((a, b) => ctx.collators[lang].compare(a.label, b.label));
  return { muscles: by('group', GROUP_ID, d.labels.groups), equipment: by('equipment', EQUIPMENT_ID, d.labels.equipment), movements: fam };
}

export function homePage(ctx, lang) {
  const d = ctx.data[lang], ui = ctx.ui[lang], file = paths.home(lang), g = groupsOf(ctx, lang), u = to => relUrl(file, to);
  const chip = (kind, x) => `<li><a href="${u(urlOf(paths[kind](lang, x.id)))}">${esc(x.label)}</a></li>`;
  const basics = d.exercises.filter(e => !e.niche).sort((a, b) => ctx.collators[lang].compare(a.name, b.name));
  const body = `<h1>${esc(ui.siteName)}</h1>
<p>${esc(fill(plural(lang, ui.countLine, d.exercises.length), { n: d.exercises.length }))}</p>
<div hidden><label for="szukaj">${esc(ui.searchLabel)}</label><br><input id="szukaj" type="search" autocomplete="off" placeholder="${esc(ui.searchPlaceholder)}" data-szukaj data-lang="${esc(lang)}" data-base="${u(urlOf(paths.list(lang)))}" data-brak="${esc(ui.noResults)}"><ul class="lista" data-wyniki aria-live="polite"></ul></div>
<p><a href="${u(urlOf(paths.list(lang)))}">${esc(ui.allExercises)}</a></p>
<h2>${esc(ui.byMuscle)}</h2><ul class="chipy">${g.muscles.map(x => chip('muscle', x)).join('')}</ul>
<h2>${esc(ui.byEquipment)}</h2><ul class="chipy">${g.equipment.map(x => chip('equipment', x)).join('')}</ul>
${g.movements.length ? `<h2>${esc(ui.byMovement)}</h2><ul class="chipy">${g.movements.map(x => chip('movement', x)).join('')}</ul>` : ''}
<h2>${esc(ui.basics)}</h2><ul class="lista">${basics.map(e => `<li><a href="${u(urlOf(paths.exercise(lang, e.slug)))}"${nameAttr(lang, e)}>${esc(e.name)}</a></li>`).join('')}</ul>`;
  const webSite = { '@context': 'https://schema.org', '@type': 'WebSite', name: ui.siteName, url: abs(ctx.cfg, urlOf(file)), inLanguage: hreflang(lang) };
  return { file, lang, kind: 'home', indexable: !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang), html: layout(ctx, { file, lang, title: ui.siteName, description: fill(plural(lang, ui.countLine, d.exercises.length), { n: d.exercises.length }), robots: robotsFor(ctx, lang), canonical: urlOf(file),
    alternates: alternatesFor(ctx, paths.home), xDefault: urlOf(paths.chooser()), jsonld: [webSite], scripts: ['assets/szukaj.js'], crumbs: [{ name: ui.home, path: file }] }, body) };
}

function listItems(ctx, lang, file, exercises) {
  const u = to => relUrl(file, to);
  return exercises.map(e => `<li data-muscle="${GROUP_ID[e.group]}" data-equipment="${EQUIPMENT_ID[e.equipment]}" data-movement="${familyId(e.family)}"><a href="${u(urlOf(paths.exercise(lang, e.slug)))}"${nameAttr(lang, e)}>${esc(e.name)}</a> <span class="drobne">${esc(ctx.data[lang].labels.groups[e.group])} · ${esc(ctx.data[lang].labels.equipment[e.equipment])}</span></li>`).join('');
}
export function listPage(ctx, lang) {
  const d = ctx.data[lang], ui = ctx.ui[lang], file = paths.list(lang), g = groupsOf(ctx, lang);
  const sorted = [...d.exercises].sort((a, b) => ctx.collators[lang].compare(a.name, b.name));
  const sel = (key, label, items) => `<label>${esc(label)} <select data-filtr="${key}"><option value="">${esc(ui.filterAll)}</option>${items.map(x => `<option value="${x.id}">${esc(x.label)}</option>`).join('')}</select></label>`;
  const body = `<h1>${esc(ui.allExercises)}</h1>
<div class="filtry" data-filtry hidden>${sel('muscle', ui.filterMuscle, g.muscles)}${sel('equipment', ui.filterEquipment, g.equipment)}${g.movements.length ? sel('movement', ui.filterMovement, g.movements) : ''}<button type="button" data-wyczysc hidden>${esc(ui.clearFilters)}</button></div>
<p data-brak hidden>${esc(ui.noResults)}</p>
<ul class="lista" data-lista>${listItems(ctx, lang, file, sorted)}</ul>`;
  const crumbs = [...crumbBase(ctx, lang), { name: ui.allExercises, path: file }];
  return { file, lang, kind: 'list', indexable: !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang), html: layout(ctx, { file, lang, title: `${ui.allExercises} — ${ui.siteName}`, description: fill(plural(lang, ui.countLine, d.exercises.length), { n: d.exercises.length }), robots: robotsFor(ctx, lang), canonical: urlOf(file),
    alternates: alternatesFor(ctx, paths.list), xDefault: urlOf(paths.chooser()), jsonld: [bcJson(ctx, crumbs)], scripts: ['assets/szukaj.js'], crumbs }, body) };
}

export function filterPage(ctx, lang, kind, x) {
  const d = ctx.data[lang], ui = ctx.ui[lang], file = paths[kind](lang, x.id);
  const key = { muscle: 'group', equipment: 'equipment', movement: 'family' }[kind];
  const sorted = d.exercises.filter(e => e[key] === x.value).sort((a, b) => ctx.collators[lang].compare(a.name, b.name));
  const parent = { muscle: ui.byMuscle, equipment: ui.byEquipment, movement: ui.byMovement }[kind];
  const crumbs = [...crumbBase(ctx, lang), { name: parent, path: paths.home(lang) }, { name: x.label, path: file }];
  const title = fill(ui.exercisesIn, { nazwa: x.label });
  return { file, lang, kind, indexable: !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang), html: layout(ctx, { file, lang, title: `${title} — ${ui.siteName}`, description: title, robots: robotsFor(ctx, lang), canonical: urlOf(file),
    alternates: alternatesFor(ctx, l => paths[kind](l, x.id)), xDefault: urlOf(paths.chooser()), jsonld: [bcJson(ctx, crumbs)], crumbs },
    `<h1>${esc(title)}</h1>\n<ul class="lista">${listItems(ctx, lang, file, sorted)}</ul>`) };
}

const poseIds = fig => fig.static ? ['end'] : ['start', 'end'];
/** Arkusz pozycji statycznych figury (wspólny dla języków, jeden plik na ćwiczenie): grupy #start i #end głównego widoku; kolory przez zmienne --f-* ze strony (dziedziczą się do <use>). Poza HTML, żeby strony 35 języków nie powielały geometrii. */
export function poseSheet(ctx, fig) {
  const E = ctx.engine, lists = [fig.frames, ...fig.errors.filter(e => e.kind === 'pose').map(e => e.frames)], box = E.boxOf(lists, fig.views[0]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${E.viewBox(box)}">${poseIds(fig).map(id => `<g id="${id}" transform="${E.groupTransform(box)}">${E.innerAt(fig.frames, id === 'start' ? 0 : 1, fig.views[0])}</g>`).join('\n')}</svg>\n`;
}

/** Figura: pozycje statyczne głównego widoku (wyjściowa i skrajna, z podpisami — jak „Ogranicz ruch” w aplikacji) wyrenderowane przy budowaniu + dane tekstowe animacji; dane klatek leżą w assets/fig/<slug>.js
 * (wspólne dla języków). Bez JS i przy „Ogranicz ruch” widać pozycje; animowane widoki (wszystkie widoki rodziny) odsłania i rysuje dopiero skrypt. Rysunek ruchu ruchomy nie jest w HTML (budżet 20 KB). */
function figureBlock(ctx, lang, ex, fig, file) {
  const ui = ctx.data[lang].labels.ui, E = ctx.engine, f = ex.figure;
  const lists = [fig.frames, ...fig.errors.filter(e => e.kind === 'pose').map(e => e.frames)];
  const views = fig.views.map(name => ({ name, box: E.boxOf(lists, name) }));
  const label = fill(ui.figureLabel, { opis: ex.name });
  const phases = f.phases.map(p => p.name === ctx.data[lang].labels.phases.Pauza ? p.name : `${p.name} ${Math.round(p.ms / 100) / 10} s`).join(' · ');
  const main = views[0], positions = poseIds(fig); /* jak staticPositions aplikacji: figura statyczna ma tylko pozycję skrajną (bez podpisu) */
  const caption = id => id === 'start' ? ui.startPose : ui.endPose;
  const poses = positions.map(id => `<div><svg role="img" aria-label="${esc(positions.length > 1 ? `${label}, ${caption(id)}` : label)}" viewBox="${E.viewBox(main.box)}"><use href="${relUrl(file, `assets/poz/${ex.slug}.svg`)}#${id}"/></svg>${positions.length > 1 ? `<p class="drobne">${esc(caption(id))}</p>` : ''}</div>`).join('');
  const html = `<figure data-figure data-fig="${esc(ex.slug)}">
<div class="pozycje" data-poses>${poses}</div>
<div class="widoki" data-views hidden>${views.map(v => `<svg role="img" aria-label="${esc(label)}" viewBox="${E.viewBox(v.box)}" data-view="${v.name}"><g transform="${E.groupTransform(v.box)}" data-g></g></svg>`).join('')}</div>
<figcaption class="drobne">${esc(phases)} · ${esc(ui.schematic)}</figcaption>
<p><button type="button" data-pause aria-pressed="false" hidden>${esc(ui.pause)}</button> ${f.errors.map(e => `<button type="button" data-error="${esc(e.id)}" aria-pressed="false" hidden>${esc(ui.showError)}: ${esc(e.text)}</button>`).join(' ')}</p>
<p class="drobne" data-error-text hidden aria-live="polite"></p>
<script type="application/json" data-errors>${jsonForScript(f.errors)}</script>
<script type="application/json" data-labels>${jsonForScript({ pause: ui.pause, resume: ui.resume, showError: ui.showError, hideError: ui.hideError, errorLine: ui.errorLine })}</script>
</figure>`;
  return { html, views, script: 'assets/figura-strona.js' };
}

/** Sylwetka mięśni przód/tył: arkusz assets/sylwetka.svg (kształty z aplikacji), stopień każdej partii przez klasy s<partia>-<stopień> (CSP bez inline style) → zmienne CSS w assets/sylwetka.css. Dekoracyjna (aria-hidden) — informację niosą listy. */
export function silhouetteBlock(ctx, lang, ex, file) {
  const levels = ctx.sil?.levels[ex.slug]; if (!levels?.some(v => v > 0)) return '';
  const ui = ctx.data[lang].labels.ui, u = to => relUrl(file, to);
  const side = (id, cap) => `<div><svg viewBox="0 0 120 260" focusable="false"><use href="${u('assets/sylwetka.svg')}#${id}"/></svg><p class="drobne">${esc(cap)}</p></div>`;
  return `<div class="sylwetki ${levels.map((v, i) => v ? `s${i}-${v}` : '').filter(Boolean).join(' ')}" aria-hidden="true">${side('front', ui.front)}${side('back', ui.back)}</div>`;
}

/** Plik danych figury (moduł ES, wspólny dla języków): próbki klatek, błędy, tempo i kadr widoków. */
export function figureModule(ctx, slug, fig) {
  const E = ctx.engine; const lists = [fig.frames, ...fig.errors.filter(e => e.kind === 'pose').map(e => e.frames)];
  const data = { views: fig.views.map(name => ({ name, box: E.boxOf(lists, name) })), static: fig.static, lowerFirst: fig.lowerFirst, tempo: fig.tempo, frames: fig.frames,
    errors: fig.errors.map(e => ({ id: e.id, kind: e.kind, ...(e.kind === 'tempo' ? { tempo: e.tempo } : {}) })), errorFrames: fig.errors.map(e => e.frames ?? null) };
  return `export default ${JSON.stringify(data)};\n`;
}

export function exercisePage(ctx, lang, ex) {
  const d = ctx.data[lang], ui = d.labels.ui, site = ctx.ui[lang], file = paths.exercise(lang, ex.slug), u = to => relUrl(file, to), L = d.labels;
  const fig = ctx.figs[ex.slug] && ex.figure ? ctx.figs[ex.slug] : null;
  const cue = k => ex.cues.scope === 'own' ? ex.cues[k] : k === 'tips' ? ex.cues.ok : k === 'mistakes' ? ex.cues.mistakes : null;
  const list = (title, items) => items?.length ? `<section><h2>${esc(title)}</h2><ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>` : '';
  const main = ex.regions.filter(r => r.load >= 1).map(r => L.regions[r.id]), aux = ex.regions.filter(r => r.load >= 0.5 && r.load < 1).map(r => L.regions[r.id]);
  const figure = fig ? figureBlock(ctx, lang, ex, fig, file) : null;
  const text = SECTION.map(k => cue(k)).some(x => x?.length) ? SECTION.map(k => list(ui[k], cue(k))).join('\n') : '';
  const roles = ex.roles?.length ? `<ul class="role">${ex.roles.map(r => `<li><strong>${esc(L.regions[r.region])}</strong> — ${esc(r.text)}</li>`).join('')}</ul>` : ''; /* zdania o roli mięśnia: tylko gdy eksport je zawiera (bez zastępczych) */
  const silhouette = silhouetteBlock(ctx, lang, ex, file);
  const muscles = silhouette + (main.length ? `<p>${esc(fill(ui.musclesMain, { lista: main.join(', ') }))}</p>` : '') + (aux.length ? `<p>${esc(fill(ui.musclesAux, { lista: aux.join(', ') }))}</p>` : '') + roles + (ex.musclesApproximate ? `<p class="drobne">${esc(ui.musclesApprox)}</p>` : '');
  const needs = ex.requires.length ? `<section><h2>${esc(site.equipmentNeeded)}</h2><ul>${ex.requires.map(g => `<li>${esc(g.map(c => L.capabilities[c]).join(' / '))}</li>`).join('')}</ul></section>` : '';
  const bySlug = ctx.bySlug[lang];
  const alts = ex.alternatives.length ? `<section><h2>${esc(site.alternatives)}</h2><ul>${ex.alternatives.map(s => `<li><a href="${u(urlOf(paths.exercise(lang, s)))}"${nameAttr(lang)}>${esc(bySlug.get(s).name)}</a></li>`).join('')}</ul></section>` : '';
  const body = `<h1${nameAttr(lang)}>${esc(ex.name)}</h1>
${figure ? figure.html : ''}
${ex.cues.scope === 'general' ? `<p class="drobne">${esc(ui.generalNote)}</p>` : ''}
${text}
${muscles}
${list(ui.tips, cue('tips'))}
${list(ui.mistakes, cue('mistakes'))}
${needs}
${alts}
<p class="drobne">${esc(ui.disclaimer)}</p>`;
  const group = { name: L.groups[ex.group], path: paths.muscle(lang, GROUP_ID[ex.group]) };
  const crumbs = [...crumbBase(ctx, lang), { name: site.library, path: paths.list(lang) }, group, { name: ex.name, path: file, lang: lang === 'pl' ? '' : 'en' }];
  /* D1: do indeksu tylko ćwiczenia z własną treścią (własne wskazówki) i kompletne w tym języku; reszta noindex,follow (reguła sama zdejmuje noindex, gdy ćwiczenie dostanie własną treść) */
  const own = ex.cues.scope === 'own' && !ex.cues.missing;
  const indexable = !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang) && own;
  return { file, lang, kind: 'exercise', slug: ex.slug, indexable, html: layout(ctx, { file, lang, title: `${ex.name} — ${site.siteName}`, description: `${ex.name}${main.length ? ': ' + main.join(', ') : ''}`, robots: robotsFor(ctx, lang, own), canonical: urlOf(file),
    alternates: alternatesFor(ctx, l => paths.exercise(l, ex.slug)), xDefault: urlOf(paths.chooser()), jsonld: [bcJson(ctx, crumbs)], scripts: figure ? [figure.script] : [], styles: silhouette ? ['assets/sylwetka.css'] : [], crumbs }, body) };
}

/** Stary adres ćwiczenia po przeniesieniu albo usunięciu (slug-overrides.json → przekierowania): meta refresh 0 s + canonical na nowy adres, w każdym budowanym języku; `to` null = lista ćwiczeń.
 * Strona ma widoczny link (nazwa ćwiczenia albo „Wszystkie ćwiczenia”), więc działa też bez przekierowania przeglądarki; poza mapami witryny i bez hreflang. */
export function redirectPage(ctx, lang, from, to) {
  const file = paths.exercise(lang, from), ui = ctx.ui[lang], target = to === null ? paths.list(lang) : paths.exercise(lang, to), ex = to === null ? null : ctx.bySlug[lang].get(to);
  const name = ex ? ex.name : ui.allExercises, href = relUrl(file, urlOf(target));
  return { file, lang, kind: 'redirect', indexable: false, html: layout(ctx, { file, lang, title: `${name} — ${ui.siteName}`, robots: ctx.cfg.indeksowanie ? '' : 'noindex,nofollow', canonical: urlOf(target), refresh: href },
    `<h1${ex ? nameAttr(lang) : ''}><a href="${href}">${esc(name)}</a></h1>`) };
}
