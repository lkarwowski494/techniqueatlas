// Szablony stron (specyfikacja docs/54, pkt 3): wybór języka, strona główna języka, lista A–Z z filtrami, strony jednego filtra, strona ćwiczenia, 404. Czyste funkcje: dane → HTML.
// Wygląd: system „Arkusz” (docs/design/system/design-spec.md; assets/site.css = tokeny + komponenty + kroje); wszystkie teksty stałe z src/ui/<język>.json, treść ćwiczeń z eksportu aplikacji — bez zastępczych tekstów z innych języków.
import { esc, fill, plural, jsonForScript, relUrl } from './lib.mjs';
import { langPath, hreflang, hreflangCodes, GROUP_ID, EQUIPMENT_ID, familyId } from './taksonomia.mjs';
import { szablonyCwiczenia, JEZYKI as JEZYKI_SZABLONOW } from './szablony.mjs';

const SECTION = ['setup', 'move'];
const abs = (cfg, path) => `${cfg.domena}/${path}`;
const dirOf = file => file.replace(/index\.html$/, '');

const MARKA = 'Technique Atlas'; /* nazwa marki w nagłówku (design-spec §5; nazwa aplikacji w ramce [DO USTALENIA] należy do Z-33) */
const ZNAK = '<svg class="znak" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M4 8v16M28 8v16M4 16h24M4 16l6-3.5M4 16l6 3.5M28 16l-6-3.5M28 16l-6 3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Wspólny układ strony (system „Arkusz”): nagłówek z menu → arkusz (okruszki + treść) → stopka.
 * `meta`: { file, lang, title, description, robots, canonical, alternates: [{lang, path}], jsonld: [], scripts: [rel→assets], styles, generator, appStoreId, csp, menu (nagłówek z menu języka), current ('list'), bezWierszaJezykow } */
export function layout(ctx, m, bodyHtml) {
  const { cfg } = ctx; const is404 = m.file === '404.html'; const u = to => is404 ? `/${to}` : relUrl(m.file, to); /* 404.html jest serwowana pod dowolnym adresem (Pages) — tylko adresy od korzenia */ const lang = m.lang ?? cfg.jezykDomyslny, ui = ctx.ui[lang];
  /* hreflang tylko dla języków indeksowanych (indeksujJezyki): zestaw w HTML = zestaw w mapach witryny, a wersje noindex (podgląd 35 języków) nie wchodzą do klastra; przełącznik języków w stopce pokazuje wszystkie budowane */
  const alt = (m.alternates ?? []).filter(a => cfg.indeksujJezyki.includes(a.lang)).flatMap(a => hreflangCodes(a.lang).map(c => `<link rel="alternate" hreflang="${esc(c)}" href="${esc(abs(cfg, a.path))}">`));
  if (m.xDefault !== undefined) alt.push(`<link rel="alternate" hreflang="x-default" href="${esc(abs(cfg, m.xDefault))}">`);
  const head = [
    '<meta charset="utf-8">', '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'">`,
    `<title>${esc(m.title)}</title>`, m.description ? `<meta name="description" content="${esc(m.description)}">` : '',
    `<meta name="generator" content="techniqueatlas app ${esc(ctx.man.app.version)} ${esc(ctx.man.app.commit.slice(0, 7))}">`,
    m.refresh ? `<meta http-equiv="refresh" content="0;url=${esc(m.refresh)}">` : '', m.robots ? `<meta name="robots" content="${m.robots}">` : '', m.canonical !== undefined ? `<link rel="canonical" href="${esc(abs(cfg, m.canonical))}">` : '', ...alt,
    cfg.appStoreId ? `<meta name="apple-itunes-app" content="app-id=${esc(cfg.appStoreId)}">` : '',
    '<link rel="icon" href="data:,">', /* bez pliku ikony: przeglądarka nie prosi o /favicon.ico (404 w konsoli); pliki ikony wpina Z-33 */
    `<link rel="stylesheet" href="${u('assets/site.css')}">`, ...(m.styles ?? []).map(c => `<link rel="stylesheet" href="${u(c)}">`),
    ...(m.jsonld ?? []).map(j => `<script type="application/ld+json">${jsonForScript(j)}</script>`),
  ].filter(Boolean).join('\n');
  /* nagłówek: znak + nazwa marki, menu w linii od 960 px (niżej <details>, bez JS), przycisk języka → wybór języka */
  const homeHref = m.menu ? u(urlOf(paths.home(lang))) : is404 ? '/' : null;
  const marka = `${ZNAK}<span class="marka-t"><span class="marka-n" lang="en">${MARKA}</span><span class="marka-p">${esc(ui.siteName)}</span></span>`;
  const menuItems = m.menu ? [[ui.allExercises, urlOf(paths.list(lang)), m.current === 'list'], [ui.byMuscle, `${urlOf(paths.home(lang))}#partie`], [ui.byEquipment, `${urlOf(paths.home(lang))}#sprzet`], [ui.byMovement, `${urlOf(paths.home(lang))}#ruch`]] : [];
  const menuUl = `<ul>${menuItems.map(([n, to, cur]) => `<li><a href="${u(to)}"${cur ? ' aria-current="page"' : ''}>${esc(n)}</a></li>`).join('')}</ul>`;
  const nav = m.menu ? `<nav class="menu menu-w" aria-label="${esc(ui.menuMain)}">${menuUl}</nav>\n<div class="glowka-n"><a class="jezyk" href="${u('./')}" aria-label="${esc(fill(ui.changeLanguage, { nazwa: ctx.names[lang] }))}">${esc(hreflang(lang).toUpperCase())}</a><details class="menu-d"><summary>${esc(ui.menu)}</summary><nav class="menu" aria-label="${esc(ui.menuMain)}">${menuUl}</nav></details></div>` : '';
  const header = `<header class="glowka"><div class="glowka-w">\n${homeHref ? `<a class="marka" href="${homeHref}">${marka}</a>` : `<span class="marka">${marka}</span>`}\n${nav}\n</div></header>`;
  const crumbs = m.crumbs?.length ? `<nav class="okruszki" aria-label="${esc(ui.breadcrumbs)}"><ol>${m.crumbs.map((c, i) => `<li>${c.path && i < m.crumbs.length - 1 ? `<a href="${u(urlOf(c.path))}">${esc(c.name)}</a>` : `<span aria-current="page"${c.lang ? ` lang="${c.lang}"` : ''}>${esc(c.name)}</span>`}</li>`).join('')}</ol></nav>` : '';
  const langs = (m.alternates ?? []).length > 1 && !m.bezWierszaJezykow ? `<p class="jezyki">${esc(ui.language)}: ${m.alternates.map(a => a.lang === m.lang ? `<span aria-current="true">${esc(ctx.names[a.lang])}</span>` : `<a href="${u(a.path)}" hreflang="${esc(hreflang(a.lang))}" lang="${esc(hreflang(a.lang))}">${esc(ctx.names[a.lang])}</a>`).join(' · ')}</p>` : '';
  const store = cfg.appStoreId ? `<p><a href="https://apps.apple.com/app/id${esc(cfg.appStoreId)}?ct=techniqueatlas-${esc(m.lang ?? 'x')}">${esc(ui.appStore)}</a></p>` : '';
  const scripts = (m.scripts ?? []).map(s => `<script type="module" src="${u(s)}"></script>`).join('\n');
  return `<!doctype html>\n<html lang="${esc(hreflang(lang))}">\n<head>\n${head}\n</head>\n<body>\n<a class="skip" href="#tresc">${esc(ui.skip)}</a>\n${header}\n<main id="tresc" class="tresc"><div class="arkusz">${crumbs}\n${bodyHtml}\n</div></main>\n<footer class="stopka"><div class="stopka-w">\n${store}${langs}<p class="prawne"><a href="${esc(cfg.polityka)}">${esc(ui.privacy)}</a> · ${esc(ui.rights)}</p>\n</div></footer>\n${scripts}\n</body>\n</html>\n`;
}

const P = lang => langPath(lang);
export const paths = {
  chooser: () => 'index.html', home: l => `${P(l)}/index.html`, list: l => `${P(l)}/exercises/index.html`,
  exercise: (l, slug) => `${P(l)}/exercises/${slug}/index.html`, muscle: (l, id) => `${P(l)}/muscles/${id}/index.html`, equipment: (l, id) => `${P(l)}/equipment/${id}/index.html`, movement: (l, id) => `${P(l)}/movements/${id}/index.html`,
};
/** Adres katalogu strony (z końcowym „/”) dla alternatyw, canonical i sitemap. */
export const urlOf = file => dirOf(file);
const nameAttr = (lang, ex) => lang === 'pl' ? '' : ' lang="en"'; /* nazwy ćwiczeń są angielskie we wszystkich językach poza polskim (jak w aplikacji, DEC-13) */

/** Nazwa lokalna (Z-32): zrecenzowana nazwa z docs/nazwy/<język>.json (ctx.nazwy), gdy różni się od angielskiej nie tylko wielkością liter (szablony-stron.md 2.1); inaczej null → sama nazwa angielska. */
export const nazwaLokalna = (ctx, lang, e) => { const n = ctx.nazwy?.[lang]?.[e.id]; return n && n.toLocaleLowerCase(lang) !== e.name.toLocaleLowerCase(lang) ? n : null; };
/** Nazwa do wyświetlenia w języku strony (lokalna albo angielska) — do sortowania, okruszków, etykiet. */
export const nazwaStrony = (ctx, lang, e) => nazwaLokalna(ctx, lang, e) ?? e.name;
/** Nazwa w treści linku albo nagłówka: lokalna + angielska w osobnych spanach (lang="en" przy angielskiej) albo sama angielska (z lang="en" poza polskim). */
const nazwaHtml = (ctx, lang, e) => { const l = nazwaLokalna(ctx, lang, e); return l ? `<span class="nazwa-pl">${esc(l)}</span> <span class="nazwa-en" lang="en">${esc(e.name)}</span>` : esc(e.name); };
const nazwaAttr = (ctx, lang, e) => nazwaLokalna(ctx, lang, e) ? '' : ' lang="en"'; /* angielska nazwa bez lokalnej: lang="en" także w polskim (Face pull itd.) */

/** x-default stron poza stroną główną: ta sama strona w języku domyślnym (jezykDomyslny) — należy do własnego zestawu hreflang, więc wzajemność jest zachowana; strony główne języków wskazują `/` (wybór języka), które wymienia je wszystkie. */
function defaultOf(ctx, make) { return urlOf(make(ctx.langs.includes(ctx.cfg.jezykDomyslny) ? ctx.cfg.jezykDomyslny : ctx.langs[0])); }
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
  const html = layout(ctx, { file, lang: ctx.cfg.jezykDomyslny, title: ui.siteName, description: '', robots: robotsFor(ctx, ctx.cfg.jezykDomyslny), canonical: urlOf(file), alternates: alternatesFor(ctx, paths.home), xDefault: urlOf(file), bezWierszaJezykow: true },
    `<h1>${esc(ui.siteName)}</h1>\n<h2>${esc(ui.chooseLanguage)}</h2>\n<ul class="jezyki-l">${items}</ul>`);
  return { file, html, lang: null, kind: 'chooser', indexable: !!ctx.cfg.indeksowanie };
}

export function notFoundPage(ctx) {
  const file = '404.html'; const ui = ctx.ui[ctx.cfg.jezykDomyslny];
  const items = ctx.langs.map(l => `<li><a href="/${urlOf(paths.home(l))}" lang="${esc(hreflang(l))}">${esc(ctx.names[l])}</a></li>`).join('');
  return { file, html: layout(ctx, { file, lang: ctx.cfg.jezykDomyslny, title: ui.pageNotFound, robots: 'noindex,nofollow' }, `<p class="blad-kod">404</p>\n<h1>${esc(ui.pageNotFound)}</h1>\n<h2>${esc(ui.chooseLanguage)}</h2>\n<ul class="jezyki-l">${items}</ul>`), kind: '404', indexable: false };
}

function groupsOf(ctx, lang) {
  const d = ctx.data[lang]; const ex = d.exercises;
  const by = (key, idMap, labels) => [...new Set(ex.map(e => e[key]))].map(v => { if (!(v in idMap)) throw new Error(`brak identyfikatora adresu dla ${key} = ${v} (src/taksonomia.mjs)`); return { id: idMap[v], value: v, label: labels[v], n: ex.filter(e => e[key] === v).length }; }).sort((a, b) => ctx.collators[lang].compare(a.label, b.label));
  const fam = [...new Set(ex.map(e => e.family))].map(f => ({ id: familyId(f), value: f, label: ctx.familyLabel(lang, f), n: ex.filter(e => e.family === f).length })).filter(x => x.label).sort((a, b) => ctx.collators[lang].compare(a.label, b.label));
  return { muscles: by('group', GROUP_ID, d.labels.groups), equipment: by('equipment', EQUIPMENT_ID, d.labels.equipment), movements: fam };
}

/** Pole wyszukiwania nazw (JS odsłania blok; bez JS wyszukiwarki nie ma — lista i grupy działają w całości). */
const searchBlock = (ui, lang, u) => `<div class="szukaj" hidden><label for="szukaj">${esc(ui.searchLabel)}</label><input id="szukaj" type="search" autocomplete="off" placeholder="${esc(ui.searchPlaceholder)}" data-szukaj data-lang="${esc(lang)}" data-base="${u(urlOf(paths.list(lang)))}" data-brak="${esc(ui.noResults)}"></div>\n<ul class="wiersze" data-wyniki aria-live="polite"></ul>`;

export function homePage(ctx, lang) {
  const d = ctx.data[lang], ui = ctx.ui[lang], file = paths.home(lang), g = groupsOf(ctx, lang), u = to => relUrl(file, to);
  const item = (kind, x) => `<li><a href="${u(urlOf(paths[kind](lang, x.id)))}"><span>${esc(x.label)}</span> <span class="n">${x.n}</span></a></li>`;
  const basics = d.exercises.filter(e => !e.niche).sort((a, b) => ctx.collators[lang].compare(nazwaStrony(ctx, lang, a), nazwaStrony(ctx, lang, b)));
  const count = fill(plural(lang, ui.countLine, d.exercises.length), { n: d.exercises.length });
  const body = `<div class="wstep"><h1>${esc(ui.siteName)}</h1><p class="licznik">${esc(count)}</p>\n${searchBlock(ui, lang, u)}</div>
<div class="grupy"><section class="grupa" id="partie"><h2>${esc(ui.byMuscle)}</h2><ul class="grupa-l">${g.muscles.map(x => item('muscle', x)).join('')}</ul></section>
<section class="grupa" id="sprzet"><h2>${esc(ui.byEquipment)}</h2><ul class="grupa-l">${g.equipment.map(x => item('equipment', x)).join('')}</ul></section></div>
${g.movements.length ? `<section class="grupa" id="ruch"><h2>${esc(ui.byMovement)}</h2><ul class="grupa-l">${g.movements.map(x => item('movement', x)).join('')}</ul></section>` : ''}
<section><h2>${esc(ui.basics)}</h2><ul class="wiersze">${basics.map(e => `<li><a href="${u(urlOf(paths.exercise(lang, e.slug)))}"${nazwaAttr(ctx, lang, e)}>${nazwaHtml(ctx, lang, e)}</a><span class="meta">${esc(d.labels.groups[e.group])} · ${esc(d.labels.equipment[e.equipment])}</span></li>`).join('')}</ul>
<p><a class="dalej" href="${u(urlOf(paths.list(lang)))}">${esc(ui.allExercises)} (${d.exercises.length})</a></p></section>`;
  const webSite = { '@context': 'https://schema.org', '@type': 'WebSite', name: ui.siteName, url: abs(ctx.cfg, urlOf(file)), inLanguage: hreflang(lang) };
  return { file, lang, kind: 'home', indexable: !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang), html: layout(ctx, { file, lang, title: ui.siteName, description: count, robots: robotsFor(ctx, lang), canonical: urlOf(file),
    alternates: alternatesFor(ctx, paths.home), xDefault: urlOf(paths.chooser()), jsonld: [webSite], scripts: ['assets/szukaj.js'], crumbs: [{ name: ui.home, path: file }], menu: true }, body) };
}

/** Wykaz (tabela): wiersz = ćwiczenie; kolumny z listy `kolumny` (muscle, equipment, movement); atrybuty data-* na wierszu dla filtrów w przeglądarce. */
function wykaz(ctx, lang, file, exercises, kolumny, caption, filtrowany = false) {
  const d = ctx.data[lang], ui = ctx.ui[lang], u = to => relUrl(file, to);
  const cell = { muscle: e => d.labels.groups[e.group], equipment: e => d.labels.equipment[e.equipment], movement: e => ctx.familyLabel(lang, e.family) ?? '' };
  const head = { muscle: ui.filterMuscle, equipment: ui.filterEquipment, movement: ui.filterMovement };
  const rows = exercises.map(e => `<tr${filtrowany ? ` data-muscle="${GROUP_ID[e.group]}" data-equipment="${EQUIPMENT_ID[e.equipment]}" data-movement="${familyId(e.family)}"` : ''}><th scope="row"><a href="${u(urlOf(paths.exercise(lang, e.slug)))}"${nazwaAttr(ctx, lang, e)}>${nazwaHtml(ctx, lang, e)}</a></th>${kolumny.map(k => `<td>${esc(cell[k](e))}</td>`).join('')}</tr>`).join('');
  return `<table class="wykaz"><caption class="wizualnie-ukryte">${esc(caption)}</caption><thead><tr><th scope="col">${esc(ui.nameLabel)}</th>${kolumny.map(k => `<th scope="col">${esc(head[k])}</th>`).join('')}</tr></thead><tbody${filtrowany ? ' data-lista' : ''}>${rows}</tbody></table>`;
}

export function listPage(ctx, lang) {
  const d = ctx.data[lang], ui = ctx.ui[lang], file = paths.list(lang), g = groupsOf(ctx, lang), u = to => relUrl(file, to);
  const sorted = [...d.exercises].sort((a, b) => ctx.collators[lang].compare(nazwaStrony(ctx, lang, a), nazwaStrony(ctx, lang, b)));
  const sel = (key, label, items) => `<div class="pole"><label for="f-${key}"><span>${esc(label)}</span></label><select id="f-${key}" data-filtr="${key}"><option value="">${esc(ui.filterAll)}</option>${items.map(x => `<option value="${x.id}">${esc(x.label)}</option>`).join('')}</select></div>`;
  const kolumny = ['muscle', 'equipment', ...(g.movements.length ? ['movement'] : [])];
  const body = `<h1>${esc(ui.allExercises)}</h1>
${searchBlock(ui, lang, u)}
<div class="filtry" data-filtry hidden>${sel('muscle', ui.filterMuscle, g.muscles)}${sel('equipment', ui.filterEquipment, g.equipment)}${g.movements.length ? sel('movement', ui.filterMovement, g.movements) : ''}<button type="button" class="wyczysc" data-wyczysc hidden>${esc(ui.clearFilters)}</button></div>
<div class="pusto" data-pusto hidden><h2>${esc(ui.noResults)}</h2><p>${esc(ui.emptyHint)}</p><button type="button" class="wyczysc" data-wyczysc>${esc(ui.clearFilters)}</button></div>
${wykaz(ctx, lang, file, sorted, kolumny, ui.allExercises, true)}`;
  const crumbs = [...crumbBase(ctx, lang), { name: ui.allExercises, path: file }];
  return { file, lang, kind: 'list', indexable: !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang), html: layout(ctx, { file, lang, title: ui.allExercises, description: fill(plural(lang, ui.countLine, d.exercises.length), { n: d.exercises.length }), robots: robotsFor(ctx, lang), canonical: urlOf(file),
    alternates: alternatesFor(ctx, paths.list), xDefault: defaultOf(ctx, paths.list), jsonld: [bcJson(ctx, crumbs)], scripts: ['assets/szukaj.js'], crumbs, menu: true, current: 'list' }, body) };
}

export function filterPage(ctx, lang, kind, x) {
  const d = ctx.data[lang], ui = ctx.ui[lang], file = paths[kind](lang, x.id), u = to => relUrl(file, to), g = groupsOf(ctx, lang);
  const key = { muscle: 'group', equipment: 'equipment', movement: 'family' }[kind];
  const sorted = d.exercises.filter(e => e[key] === x.value).sort((a, b) => ctx.collators[lang].compare(nazwaStrony(ctx, lang, a), nazwaStrony(ctx, lang, b)));
  const parent = { muscle: ui.byMuscle, equipment: ui.byEquipment, movement: ui.byMovement }[kind];
  const crumbs = [...crumbBase(ctx, lang), { name: parent, path: paths.home(lang) }, { name: x.label, path: file }];
  const title = fill(ui.exercisesIn, { nazwa: x.label });
  const kolumny = ['muscle', 'equipment', ...(g.movements.length ? ['movement'] : [])].filter(k => k !== kind); /* kolumna wymiaru, po którym filtrujemy, nic nie wnosi */
  return { file, lang, kind, indexable: !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang), html: layout(ctx, { file, lang, title, description: title, robots: robotsFor(ctx, lang), canonical: urlOf(file),
    alternates: alternatesFor(ctx, l => paths[kind](l, x.id)), xDefault: defaultOf(ctx, l => paths[kind](l, x.id)), jsonld: [bcJson(ctx, crumbs)], crumbs, menu: true },
    `<h1>${esc(title)}</h1>\n${wykaz(ctx, lang, file, sorted, kolumny, title)}\n<p><a class="dalej" href="${u(urlOf(paths.list(lang)))}">${esc(ui.allExercises)}</a></p>`) };
}

const poseIds = fig => fig.static ? ['end'] : ['start', 'end'];
/** Arkusz pozycji statycznych figury (wspólny dla języków, jeden plik na ćwiczenie): grupy #start i #end głównego widoku; kolory przez zmienne --f-* ze strony (dziedziczą się do <use>). Poza HTML, żeby strony 35 języków nie powielały geometrii. */
export function poseSheet(ctx, fig) {
  const E = ctx.engine, lists = [fig.frames, ...fig.errors.filter(e => e.kind === 'pose').map(e => e.frames)], box = E.boxOf(lists, fig.views[0]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${E.viewBox(box)}">${poseIds(fig).map(id => `<g id="${id}" transform="${E.groupTransform(box)}">${E.innerAt(fig.frames, id === 'start' ? 0 : 1, fig.views[0])}</g>`).join('\n')}</svg>\n`;
}

/** Linia wymiarowa tempa (element firmowy, design-spec §4): odcinek = faza z czasem > 0, długość z klas t<ms/100> (bez stylu w atrybucie, CSP); opis dla czytnika i sekwencja tekstem pod linią. Czysta funkcja: dane faz → HTML. */
export function wymiarHtml(lang, ui, phases) {
  /* fazy `untimed` (ćwiczenia balistyczne, chód: czas w danych jest zastępczy, nie opisuje ruchu) — bez linii: nie podajemy czasu, którego ćwiczenie nie ma */
  if (phases.some(p => p.untimed)) return '';
  const fazy = phases.filter(p => p.ms > 0); if (!fazy.length) return '';
  const sek = ms => new Intl.NumberFormat(hreflang(lang)).format(ms / 1000), razem = fazy.reduce((s, p) => s + p.ms, 0), czas = ms => `${sek(ms)} ${ui.sec}`;
  const opis = `${ui.tempo}: ${fazy.map(p => `${p.name} ${czas(p.ms)}`).join(', ')}; ${fill(ui.tempoTotal, { t: czas(razem) })}`;
  const waskie = fazy.some(p => p.ms / razem < 0.2);
  const odcinki = fazy.map(p => `<div class="wymiar-s t${p.ms / 100}${p.ms / razem < 0.2 ? ' waski' : ''}"><span class="wymiar-v">${sek(p.ms)}<span class="jedn"> ${esc(ui.sec)}</span></span><span class="wymiar-n">${esc(p.name)}</span></div>`).join('');
  return `<div class="wymiar${waskie ? ' ma-waskie' : ''}" role="img" aria-label="${esc(opis)}">\n<div class="wymiar-l">${odcinki}</div>\n<p class="wymiar-r"><span class="wymiar-sek">${esc(fazy.map(p => `${p.name} ${czas(p.ms)}`).join(', '))}</span>${esc(fill(ui.tempoTotal, { t: czas(razem) }))}</p></div>`;
}

/** Figura: pozycje statyczne głównego widoku (wyjściowa i skrajna, z podpisami — jak „Ogranicz ruch” w aplikacji) wyrenderowane przy budowaniu + linia wymiarowa tempa z danych faz + dane tekstowe animacji; dane klatek leżą w assets/fig/<slug>.js
 * (wspólne dla języków). Bez JS i przy „Ogranicz ruch” widać pozycje; animowane widoki (wszystkie widoki rodziny) odsłania i rysuje dopiero skrypt. Rysunek ruchu ruchomy nie jest w HTML (budżet 20 KB). */
function figureBlock(ctx, lang, ex, fig, file) {
  const ui = ctx.data[lang].labels.ui, site = ctx.ui[lang], E = ctx.engine, f = ex.figure;
  const lists = [fig.frames, ...fig.errors.filter(e => e.kind === 'pose').map(e => e.frames)];
  const views = fig.views.map(name => ({ name, box: E.boxOf(lists, name) }));
  const label = fill(ui.figureLabel, { opis: nazwaStrony(ctx, lang, ex) });
  const phases = f.phases.map(p => p.name === ctx.data[lang].labels.phases.Pauza || p.untimed ? p.name : `${p.name} ${Math.round(p.ms / 100) / 10} s`).join(' · '); /* podpis: kolejność faz; bez sekund przy pauzie i fazach untimed (BA, 27.11.2026) */
  const main = views[0], positions = poseIds(fig); /* jak staticPositions aplikacji: figura statyczna ma tylko pozycję skrajną (bez podpisu) */
  const caption = id => id === 'start' ? ui.startPose : ui.endPose;
  const poses = positions.map(id => `<div class="poz"><svg role="img" aria-label="${esc(positions.length > 1 ? `${label}, ${caption(id)}` : label)}" viewBox="${E.viewBox(main.box)}"><use href="${relUrl(file, `assets/poz/${ex.slug}.svg`)}#${id}"/></svg>${positions.length > 1 ? `<p class="podpis">${esc(caption(id))}</p>` : ''}</div>`).join('');
  const html = `<figure class="fig" data-figure data-fig="${esc(ex.slug)}">
<div class="pozycje" data-poses>${poses}</div>
<div class="widoki" data-views hidden>${views.map(v => `<svg role="img" aria-label="${esc(label)}" viewBox="${E.viewBox(v.box)}" data-view="${v.name}"><g transform="${E.groupTransform(v.box)}" data-g></g></svg>`).join('')}</div>
${wymiarHtml(lang, site, f.phases)}
<div class="fig-ster"><button type="button" class="b-anim" data-pause aria-pressed="false" hidden>${esc(ui.pause)}</button>${f.errors.length ? `<span class="fig-bledy-t">${esc(site.commonErrors)}</span>` : ''}${f.errors.map(e => `<button type="button" class="b-blad" data-error="${esc(e.id)}" aria-pressed="false" hidden>${esc(ui.showError)}: ${esc(e.text)}</button>`).join('')}</div>
<p class="podpis" data-error-text hidden aria-live="polite"></p>
<figcaption class="drobne">${esc(phases)} · ${esc(ui.schematic)}</figcaption>
<script type="application/json" data-errors>${jsonForScript(f.errors)}</script>
<script type="application/json" data-labels>${jsonForScript({ pause: ui.pause, resume: ui.resume, showError: ui.showError, hideError: ui.hideError, errorLine: ui.errorLine })}</script>
</figure>`;
  return { html, views, script: 'assets/figura-strona.js' };
}

/** Sylwetka mięśni przód/tył: arkusz assets/sylwetka.svg (kształty z aplikacji), stopień każdej partii przez klasy s<partia>-<stopień> (CSP bez inline style) → zmienne CSS w assets/sylwetka.css. Dekoracyjna (aria-hidden) — informację niosą listy. */
export function silhouetteBlock(ctx, lang, ex, file) {
  const levels = ctx.sil?.levels[ex.slug]; if (!levels?.some(v => v > 0)) return '';
  const ui = ctx.data[lang].labels.ui, u = to => relUrl(file, to);
  const side = (id, cap) => `<div><svg viewBox="0 0 120 260" focusable="false"><use href="${u('assets/sylwetka.svg')}#${id}"/></svg><p class="podpis">${esc(cap)}</p></div>`;
  return `<div class="sylwetki ${levels.map((v, i) => v ? `s${i}-${v}` : '').filter(Boolean).join(' ')}" aria-hidden="true">${side('front', ui.front)}${side('back', ui.back)}</div>`;
}

/** Plik danych figury (moduł ES, wspólny dla języków): próbki klatek, błędy, tempo i kadr widoków. */
export function figureModule(ctx, slug, fig) {
  const E = ctx.engine; const lists = [fig.frames, ...fig.errors.filter(e => e.kind === 'pose').map(e => e.frames)];
  const data = { views: fig.views.map(name => ({ name, box: E.boxOf(lists, name) })), static: fig.static, lowerFirst: fig.lowerFirst, ...(fig.loop ? { loop: fig.loop } : {}), ...(fig.loop === 'jednokierunkowa' && fig.pose?.cwiczenie ? { key: fig.pose.cwiczenie } : {}), tempo: fig.tempo, frames: fig.frames,
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
  const roles = ex.roles?.length ? `<ul class="role">${ex.roles.map(r => `<li><strong>${esc(L.regions[r.id])}</strong> — ${esc(r.text)}</li>`).join('')}</ul>` : ''; /* zdania o roli mięśnia: tylko gdy eksport je zawiera (bez zastępczych) */
  const silhouette = silhouetteBlock(ctx, lang, ex, file);
  const muscleText = (main.length ? `<p>${esc(fill(ui.musclesMain, { lista: main.join(', ') }))}</p>` : '') + (aux.length ? `<p>${esc(fill(ui.musclesAux, { lista: aux.join(', ') }))}</p>` : '') + roles + (ex.musclesApproximate ? `<p class="drobne">${esc(ui.musclesApprox)}</p>` : '');
  const muscles = silhouette + muscleText ? `<section class="miesnie"><h2>${esc(site.muscles)}</h2>${silhouette}${muscleText}</section>` : '';
  const needs = ex.requires.length ? `<section><h2>${esc(site.equipmentNeeded)}</h2><ul>${ex.requires.map(g => `<li>${esc(g.map(c => L.capabilities[c]).join(' / '))}</li>`).join('')}</ul></section>` : '';
  const bySlug = ctx.bySlug[lang];
  const alts = ex.alternatives.length ? `<section><h2>${esc(site.alternatives)}</h2><ul class="zam">${ex.alternatives.map(s => `<li><a href="${u(urlOf(paths.exercise(lang, s)))}">${nazwaLokalna(ctx, lang, bySlug.get(s)) ? nazwaHtml(ctx, lang, bySlug.get(s)) : `<span class="nazwa-pl"${nameAttr(lang)}>${esc(bySlug.get(s).name)}</span>`}</a></li>`).join('')}</ul></section>` : '';
  const cueSections = [text, list(ui.tips, cue('tips')), list(ui.mistakes, cue('mistakes'))].filter(Boolean).join('\n');
  /* tabliczka rysunkowa: klasyfikacja jako linki do stron filtrów; nazwa angielska (w polskim — z eksportu en, gdy jest budowany) */
  const enName = ctx.bySlug.en?.get(ex.slug)?.name ?? ex.name, family = ctx.familyLabel(lang, ex.family);
  const tabRow = (label, inner) => `<div><dt>${esc(label)}</dt><dd>${inner}</dd></div>`;
  const tabliczka = `<dl class="tabliczka"><div><dt>${esc(site.nameLabel)}</dt><dd lang="en">${esc(enName)}</dd></div>${tabRow(site.filterMuscle, `<a href="${u(urlOf(paths.muscle(lang, GROUP_ID[ex.group])))}">${esc(L.groups[ex.group])}</a>`)}${tabRow(site.filterEquipment, `<a href="${u(urlOf(paths.equipment(lang, EQUIPMENT_ID[ex.equipment])))}">${esc(L.equipment[ex.equipment])}</a>`)}${family ? tabRow(site.filterMovement, `<a href="${u(urlOf(paths.movement(lang, familyId(ex.family))))}">${esc(family)}</a>`) : ''}</dl>`;
  /* krótka odpowiedź (KO-135): tylko przy własnych wskazówkach; szablon Z-22 (pl, en) — pozostałe języki dostaną ją z tłumaczeniem szablonów (Z-26/Z-34) */
  const own = ex.cues.scope === 'own' && !ex.cues.missing;
  const odpowiedz = own && JEZYKI_SZABLONOW.includes(lang) ? szablonyCwiczenia(d, site, lang, ex).odpowiedz : '';
  const odp = odpowiedz ? `<section class="odp" aria-labelledby="odp-t"><h2 id="odp-t">${esc(site.howTo)}</h2><p>${esc(odpowiedz)}</p></section>` : '';
  const nota = ex.cues.scope === 'general' ? `<p class="nota">${esc(ui.generalNote)}</p>` : '';
  const tekstowa = (nota || cueSections) ? `<div class="uk-p">${nota}${cueSections}${needs}${alts}</div>` : '';
  const uklad = fig || tekstowa
    ? `<div class="uk uk3${fig ? '' : ' bez-fig'}">${figure ? figure.html : ''}${tekstowa || (needs || alts ? `<div class="uk-p">${needs}${alts}</div>` : '')}${muscles}</div>`
    : `<div class="uk uk-skrot bez-fig">${muscles}${needs ? `<div>${needs}</div>` : ''}${alts ? `<div>${alts}</div>` : ''}</div>`;
  const body = `<div class="arkusz-g"><h1 class="nazwa"${nazwaAttr(ctx, lang, ex)}>${nazwaLokalna(ctx, lang, ex) ? nazwaHtml(ctx, lang, ex) : esc(ex.name)}</h1>${tabliczka}</div>
${odp}${uklad}
<p class="zastrz">${esc(ui.disclaimer)}</p>`;
  const group = { name: L.groups[ex.group], path: paths.muscle(lang, GROUP_ID[ex.group]) };
  const crumbs = [...crumbBase(ctx, lang), { name: site.library, path: paths.list(lang) }, group, { name: nazwaStrony(ctx, lang, ex), path: file, lang: nazwaLokalna(ctx, lang, ex) ? '' : 'en' }];
  /* S6/ZM-08 (27.11.2026, P-1; odwraca ZM-06): do indeksu ćwiczenia z własnymi wskazówkami kompletnymi w tym języku (D1), bez wymogu pełnej karty (`pelna` nie ma znaczenia);
     reszta noindex,follow. Reguła sama zdejmuje noindex, gdy ćwiczenie spełni warunek. Strażnik S6 sprawdza wynik niezależnie. */
  const indexable = !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang) && own;
  /* tytuł: z lokalną nazwą wg szablonu Z-22 („lokalna (angielska)”, sama lokalna przy limicie 60, SZ-7); bez niej sama angielska — dopiski i opisy dochodzą w Z-34 */
  const lokalna = nazwaLokalna(ctx, lang, ex), title = lokalna && JEZYKI_SZABLONOW.includes(lang) ? szablonyCwiczenia(d, site, lang, ex, { nazwaLokalna: lokalna }).tytul : ex.name;
  return { file, lang, kind: 'exercise', slug: ex.slug, indexable, html: layout(ctx, { file, lang, title, description: `${nazwaStrony(ctx, lang, ex)}${main.length ? ': ' + main.join(', ') : ''}`, robots: robotsFor(ctx, lang, own), canonical: urlOf(file),
    alternates: alternatesFor(ctx, l => paths.exercise(l, ex.slug)), xDefault: defaultOf(ctx, l => paths.exercise(l, ex.slug)), jsonld: [bcJson(ctx, crumbs)], scripts: figure ? [figure.script] : [], styles: silhouette ? ['assets/sylwetka.css'] : [], crumbs, menu: true }, body) };
}

/** Stary adres ćwiczenia po przeniesieniu albo usunięciu (slug-overrides.json → przekierowania): meta refresh 0 s + canonical na nowy adres, w każdym budowanym języku; `to` null = lista ćwiczeń.
 * Strona ma widoczny link (nazwa ćwiczenia albo „Wszystkie ćwiczenia”), więc działa też bez przekierowania przeglądarki; poza mapami witryny i bez hreflang. */
export function redirectPage(ctx, lang, from, to) {
  const file = paths.exercise(lang, from), ui = ctx.ui[lang], target = to === null ? paths.list(lang) : paths.exercise(lang, to), ex = to === null ? null : ctx.bySlug[lang].get(to);
  const name = ex ? nazwaStrony(ctx, lang, ex) : ui.allExercises, href = relUrl(file, urlOf(target));
  return { file, lang, kind: 'redirect', indexable: false, html: layout(ctx, { file, lang, title: name, robots: ctx.cfg.indeksowanie ? '' : 'noindex,nofollow', canonical: urlOf(target), refresh: abs(ctx.cfg, urlOf(target)) /* pełny adres z domeną: dokumentacja Google nie rozstrzyga adresu względnego (badanie 01.11.2026, pkt 1) */ },
    `<h1${ex ? nazwaAttr(ctx, lang, ex) : ''}><a href="${href}">${esc(name)}</a></h1>`) };
}
