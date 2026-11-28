// Szablony stron (specyfikacja docs/54, pkt 3): wybór języka, strona główna języka, lista A–Z z filtrami, strony jednego filtra, strona ćwiczenia, 404. Czyste funkcje: dane → HTML.
// Wygląd: system „Arkusz” (docs/design/system/design-spec.md; assets/site.css = tokeny + komponenty + kroje); wszystkie teksty stałe z src/ui/<język>.json, treść ćwiczeń z eksportu aplikacji — bez zastępczych tekstów z innych języków.
import { esc, fill, plural, jsonForScript, relUrl } from './lib.mjs';
import { langPath, hreflang, hreflangCodes, GROUP_ID, EQUIPMENT_ID, familyId } from './taksonomia.mjs';
import { szablonyCwiczenia, szablonyGlownej, szablonyListy, szablonyKategorii, JEZYKI as JEZYKI_SZABLONOW } from './szablony.mjs';
import { DOKUMENTY } from './prawne.mjs';

const SECTION = ['setup', 'move'];
const abs = (cfg, path) => `${cfg.domena}/${path}`;
/** Blok tekstów stałych jest „własny” tylko w komplecie podkluczy; niepełny (np. ramka bez z5) spada w całości na wersję angielską z lang="en" — nigdy „undefined” w HTML (Z-33, recenzja). */
const komplet = (o, klucze) => !!o && klucze.every(k => typeof o[k] === 'string' && o[k] !== '');
const KLUCZE_RAMKI = ['tytul', ...Array.from({ length: 8 }, (_, i) => `z${i + 1}`)], KLUCZE_WSPARCIA = ['w1', 'w2', 'w3'];
const dirOf = file => file.replace(/index\.html$/, '');

const MARKA = 'Technique Atlas'; /* nazwa marki w nagłówku (design-spec §5); nazwa aplikacji w ramce: config.json → nazwaAplikacji */
const ZNAK = '<svg class="znak" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M4 8v16M28 8v16M4 16h24M4 16l6-3.5M4 16l6 3.5M28 16l-6-3.5M28 16l-6 3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Wspólny układ strony (system „Arkusz”): nagłówek z menu → arkusz (okruszki + treść) → stopka.
 * `meta`: { file, lang, title, description, robots, canonical, alternates: [{lang, path}], jsonld: [], scripts: [rel→assets], styles, generator, appStoreId, csp, menu (nagłówek z menu języka), current ('list'), bezWierszaJezykow } */
export function layout(ctx, m, bodyHtml) {
  const { cfg } = ctx; const is404 = m.file === '404.html'; const u = to => is404 ? `/${to}` : relUrl(m.file, to); /* 404.html jest serwowana pod dowolnym adresem (Pages) — tylko adresy od korzenia */ const lang = m.lang ?? cfg.jezykDomyslny, ui = ctx.ui[lang];
  /* hreflang tylko dla języków indeksowanych (indeksujJezyki): zestaw w HTML = zestaw w mapach witryny, a wersje noindex (podgląd 35 języków) nie wchodzą do klastra; przełącznik języków w stopce pokazuje wszystkie budowane */
  const alt = (m.alternates ?? []).filter(a => cfg.indeksujJezyki.includes(a.lang)).flatMap(a => hreflangCodes(a.lang).map(c => `<link rel="alternate" hreflang="${esc(c)}" href="${esc(abs(cfg, a.path))}">`));
  if (m.xDefault !== undefined) alt.push(`<link rel="alternate" hreflang="x-default" href="${esc(abs(cfg, m.xDefault))}">`);
  /* Open Graph (A9): tytuł, adres i typ dla każdej strony z adresem kanonicznym; obrazek tylko tam, gdzie jest rysunek ćwiczenia (nie logo, nie ikona — A9) */
  const og = m.canonical === undefined || m.refresh ? [] : [['og:site_name', ui.siteName], ['og:type', m.ogType ?? 'website'], ['og:title', m.title], ['og:url', abs(cfg, m.canonical)], ...(m.description ? [['og:description', m.description]] : []), ...(m.ogImage ? [['og:image', m.ogImage.url], ['og:image:width', '1200'], ['og:image:height', '630'], ['og:image:alt', m.ogImage.alt]] : [])].map(([k, v]) => `<meta property="${k}" content="${esc(v)}">`);
  const head = [
    '<meta charset="utf-8">', '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'">`,
    `<title>${esc(m.title)}</title>`, m.description ? `<meta name="description" content="${esc(m.description)}">` : '',
    `<meta name="generator" content="techniqueatlas app ${esc(ctx.man.app.version)} ${esc(ctx.man.app.commit.slice(0, 7))}">`,
    ...og,
    m.refresh ? `<meta http-equiv="refresh" content="0;url=${esc(m.refresh)}">` : '', m.robots ? `<meta name="robots" content="${m.robots}">` : '', m.canonical !== undefined ? `<link rel="canonical" href="${esc(abs(cfg, m.canonical))}">` : '', ...alt,
    cfg.appStoreId ? `<meta name="apple-itunes-app" content="app-id=${esc(cfg.appStoreId)}">` : '',
    /* ikona (A7): PNG, stałe adresy (Google: „The favicon URL must be stable”); apple-touch-icon 180 px w korzeniu (specyfikacja §7) */
    `<link rel="icon" type="image/png" sizes="96x96" href="${u('assets/favicon-96.png')}">`, `<link rel="icon" type="image/png" sizes="192x192" href="${u('assets/favicon-192.png')}">`, `<link rel="apple-touch-icon" href="${u('apple-touch-icon.png')}">`,
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
  /* Z-40 006: stopka — język bieżący, angielski i link „wszystkie języki (N)” do wyboru języka (wzorzec z szablonu; pełna lista hreflang jest w <head>). Tekst linku bez przekładu → angielski z lang="en" (przekład API) */
  const wszystkie = ui.wszystkieJezyki ? { t: ui.wszystkieJezyki, l: '' } : { t: ctx.uiEn.wszystkieJezyki, l: ' lang="en"' };
  const jezykiStopki = (m.alternates ?? []).filter(a => a.lang === m.lang || a.lang === 'en');
  const langs = (m.alternates ?? []).length > 1 && !m.bezWierszaJezykow ? `<p class="jezyki">${esc(ui.language)}: ${[...jezykiStopki.map(a => a.lang === m.lang ? `<span aria-current="true">${esc(ctx.names[a.lang])}</span>` : `<a href="${u(a.path)}" hreflang="${esc(hreflang(a.lang))}" lang="${esc(hreflang(a.lang))}">${esc(ctx.names[a.lang])}</a>`), `<a href="${u('./')}"${wszystkie.l}>${esc(fill(wszystkie.t, { n: ctx.langs.length }))}</a>`].join(' · ')}</p>` : '';
  /* stopka (Z-33): akapit o wsparciu, link do sklepu, języki, dokumenty prawne; teksty bez przekładu (jeszcze) = angielskie z lang="en" (przekład API, docs/przeklad) */
  const wsp = komplet(ui.wsparcie, KLUCZE_WSPARCIA) ? { ui: ui.wsparcie, lang: '' } : { ui: ctx.uiEn.wsparcie, lang: ' lang="en"' };
  const wsparcie = `<p class="wsparcie"${wsp.lang}>${esc(['w1', 'w2', 'w3'].map(k => fill(wsp.ui[k], { dni: ctx.dni })).join(' '))}</p>\n`;
  const prawneTekst = k => ui.prawne?.[k] ? { t: ui.prawne[k], lang: '' } : { t: ctx.uiEn.prawne[k], lang: ' lang="en"' };
  const prawneLinki = DOKUMENTY.map(d => { const tt = d.klucz === 'privacy' && !ui.prawne?.privacy ? { t: ui.privacy, lang: '' } : prawneTekst(d.klucz); /* „Prywatność” z tekstów stałych, gdy język nie ma jeszcze pełnej nazwy dokumentu */ return `<a href="${u(urlOf(paths.legal(lang, d.slug)))}"${tt.lang}>${esc(tt.t)}</a>`; }).join(' · ');
  const store = cfg.appStoreId ? `<p><a href="https://apps.apple.com/app/id${esc(cfg.appStoreId)}?ct=techniqueatlas-${esc(m.lang ?? 'x')}">${esc(ui.appStore)}</a></p>` : '';
  const znaki = ui.appleZnaki ? { t: ui.appleZnaki, l: '' } : { t: ctx.uiEn.appleZnaki, l: ' lang="en"' }; /* wymóg licencji plakietki Apple (KO-138): linia tylko przy plakietce graficznej na stronie */
  const scripts = (m.scripts ?? []).map(s => `<script type="module" src="${u(s)}"></script>`).join('\n');
  return `<!doctype html>\n<html lang="${esc(hreflang(lang))}">\n<head>\n${head}\n</head>\n<body>\n<a class="skip" href="#tresc">${esc(ui.skip)}</a>\n${header}\n<main id="tresc" class="tresc"><div class="arkusz">${crumbs}\n${bodyHtml}\n</div></main>\n<footer class="stopka"><div class="stopka-w">\n${wsparcie}${store}${langs}<p class="prawne">${prawneLinki} · © ${esc(String(ctx.cfg.rokStrony))} ${esc(ctx.cfg.prowadzacy)} · <a href="mailto:${esc(ctx.cfg.kontakt)}">${esc(ctx.cfg.kontakt)}</a></p>\n${m.znakiApple ? `<p class="zastrz"${znaki.l}>${esc(znaki.t)}</p>\n` : ''}</div></footer>\n${scripts}\n</body>\n</html>\n`;
}

const P = lang => langPath(lang);
export const paths = {
  chooser: () => 'index.html', home: l => `${P(l)}/index.html`, list: l => `${P(l)}/exercises/index.html`,
  exercise: (l, slug) => `${P(l)}/exercises/${slug}/index.html`, legal: (l, slug) => `${P(l)}/${slug}/index.html`, muscle: (l, id) => `${P(l)}/muscles/${id}/index.html`, equipment: (l, id) => `${P(l)}/equipment/${id}/index.html`, movement: (l, id) => `${P(l)}/movements/${id}/index.html`,
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
  /* A6: nazwa witryny na stronie `/` (domena); nazwa = <title> = h1 = og:site_name; opis witryny z szablonu strony głównej języka domyślnego (Z-22), gdy język ma szablony */
  const dl = ctx.cfg.jezykDomyslny, opis = ctx.data[dl] && JEZYKI_SZABLONOW.includes(dl) ? szablonyGlownej(ctx.data[dl], ui, dl).opis : '';
  const webSite = { '@context': 'https://schema.org', '@type': 'WebSite', name: ui.siteName, url: `${ctx.cfg.domena}/` };
  const html = layout(ctx, { file, lang: ctx.cfg.jezykDomyslny, title: ui.siteName, description: opis, robots: robotsFor(ctx, ctx.cfg.jezykDomyslny), canonical: urlOf(file), alternates: alternatesFor(ctx, paths.home), xDefault: urlOf(file), jsonld: [webSite], bezWierszaJezykow: true },
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
  const sz = ctx.sz[lang] ? szablonyGlownej(d, ui, lang) : null; /* Z-22; język bez szablonów — dotychczasowy opis (licznik) */
  return { file, lang, kind: 'home', indexable: !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang), html: layout(ctx, { file, lang, title: sz?.tytul ?? ui.siteName, description: sz?.opis ?? count, robots: robotsFor(ctx, lang), canonical: urlOf(file),
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

/** Licznik wyniku (Z-40 002, WCAG 4.1.3): „N z M ćwiczeń”, aria-live=polite i aria-atomic (czytnik odczytuje całe zdanie); liczbę N w <strong> aktualizuje assets/szukaj.js. Język bez własnego tekstu → angielski z lang="en". */
function wynikHtml(ctx, lang, n, razem) {
  const o = ctx.ui[lang].wynik ? { t: ctx.ui[lang].wynik, l: '' } : { t: ctx.uiEn.wynik, l: ' lang="en"' };
  return `<p class="wynik" aria-live="polite" aria-atomic="true" data-wynik${o.l}>${esc(fill(o.t, { n: '\u0001', m: razem })).replace('\u0001', `<strong>${n}</strong>`)}</p>`;
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
${wynikHtml(ctx, lang, sorted.length, d.exercises.length)}
${wykaz(ctx, lang, file, sorted, kolumny, ui.allExercises, true)}`;
  const crumbs = [...crumbBase(ctx, lang), { name: ui.allExercises, path: file }];
  const sz = ctx.sz[lang] ? szablonyListy(d, ui, lang) : null;
  return { file, lang, kind: 'list', indexable: !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang), html: layout(ctx, { file, lang, title: sz?.tytul ?? ui.allExercises, description: sz?.opis ?? fill(plural(lang, ui.countLine, d.exercises.length), { n: d.exercises.length }), robots: robotsFor(ctx, lang), canonical: urlOf(file),
    alternates: alternatesFor(ctx, paths.list), xDefault: defaultOf(ctx, paths.list), jsonld: [bcJson(ctx, crumbs)], scripts: ['assets/szukaj.js'], crumbs, menu: true, current: 'list' }, body) };
}

export function filterPage(ctx, lang, kind, x) {
  const d = ctx.data[lang], ui = ctx.ui[lang], file = paths[kind](lang, x.id), u = to => relUrl(file, to), g = groupsOf(ctx, lang);
  const key = { muscle: 'group', equipment: 'equipment', movement: 'family' }[kind];
  const sorted = d.exercises.filter(e => e[key] === x.value).sort((a, b) => ctx.collators[lang].compare(nazwaStrony(ctx, lang, a), nazwaStrony(ctx, lang, b)));
  const parent = { muscle: ui.byMuscle, equipment: ui.byEquipment, movement: ui.byMovement }[kind];
  const crumbs = [...crumbBase(ctx, lang), { name: parent, path: paths.home(lang) }, { name: x.label, path: file }];
  const title = fill(ui.exercisesIn, { nazwa: x.label });
  const sz = ctx.sz[lang] ? szablonyKategorii(d, ui, lang).find(k => k.rodzaj === key && k.wartosc === x.value) : null; /* Z-22: opis z licznika i przykładów */
  const kolumny = ['muscle', 'equipment', ...(g.movements.length ? ['movement'] : [])].filter(k => k !== kind); /* kolumna wymiaru, po którym filtrujemy, nic nie wnosi */
  return { file, lang, kind, indexable: !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang), html: layout(ctx, { file, lang, title: sz?.tytul ?? title, description: sz?.opis ?? title, robots: robotsFor(ctx, lang), canonical: urlOf(file),
    alternates: alternatesFor(ctx, l => paths[kind](l, x.id)), xDefault: defaultOf(ctx, l => paths[kind](l, x.id)), jsonld: [bcJson(ctx, crumbs)], crumbs, menu: true },
    `<h1>${esc(title)}</h1>\n${wynikHtml(ctx, lang, sorted.length, d.exercises.length)}\n${wykaz(ctx, lang, file, sorted, kolumny, title)}\n<p><a class="dalej" href="${u(urlOf(paths.list(lang)))}">${esc(ui.allExercises)}</a></p>`) };
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
  const main = views[0], positions = poseIds(fig); /* jak staticPositions aplikacji: figura statyczna ma tylko pozycję skrajną (bez podpisu) */
  const caption = id => id === 'start' ? ui.startPose : ui.endPose;
  const poses = positions.map(id => `<div class="poz"><svg role="img" aria-label="${esc(positions.length > 1 ? `${label}, ${caption(id)}` : label)}" viewBox="${E.viewBox(main.box)}"><use href="${relUrl(file, `assets/poz/${ex.slug}.svg`)}#${id}"/></svg>${positions.length > 1 ? `<p class="podpis">${esc(caption(id))}</p>` : ''}</div>`).join('');
  const html = `<figure class="fig" data-figure data-fig="${esc(ex.slug)}">
<div class="pozycje" data-poses>${poses}</div>
<div class="widoki" data-views hidden>${views.map(v => `<svg role="img" aria-label="${esc(label)}" viewBox="${E.viewBox(v.box)}" data-view="${v.name}"><g transform="${E.groupTransform(v.box)}" data-g></g></svg>`).join('')}</div>
${wymiarHtml(lang, site, f.phases)}
<div class="fig-ster"><button type="button" class="b-anim" data-pause hidden>${esc(ui.pause)}</button>${f.errors.length ? `<span class="fig-bledy-t">${esc(site.commonErrors)}</span>` : ''}${f.errors.map(e => `<button type="button" class="b-blad" data-error="${esc(e.id)}" aria-label="${esc(ui.showError)}: ${esc(e.text.replace(/\.\s*$/, ''))}" aria-pressed="false" hidden>${esc(e.text.replace(/\.\s*$/, ''))}</button>`).join('')}</div>
<p class="podpis" data-error-text hidden aria-live="polite"></p>
<figcaption class="drobne">${esc(ui.schematic)}</figcaption>
<script type="application/json" data-errors>${jsonForScript(f.errors)}</script>
<script type="application/json" data-labels>${jsonForScript({ pause: ui.pause, resume: ui.resume, errorLine: ui.errorLine })}</script>
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

/** Ramka „w aplikacji” (Z-33, wariant A z docs/teksty/ramka-w-aplikacji.md; nie tekst z makiet — N-1): 8 zdań, nazwa aplikacji z config.json, plakietka sklepu tylko przy appStoreId.
 * Język bez własnych zdań (przekład API jeszcze nie nałożony) pokazuje zdania angielskie z lang="en" na tytule i liście. */
function ramkaHtml(ctx, lang, file) {
  const own = komplet(ctx.ui[lang].ramka, KLUCZE_RAMKI), r = own ? ctx.ui[lang].ramka : ctx.uiEn.ramka, k = own ? '' : ' lang="en"', ui = ctx.ui[lang], id = ctx.cfg.appStoreId;
  const zdania = Array.from({ length: 8 }, (_, i) => `<li>${esc(r[`z${i + 1}`])}</li>`).join('');
  /* Z-40 009 (KO-138): oficjalna grafika Apple (assets/plakietka/<język>.svg, dostarcza właściciel po akceptacji licencji Apple — docs/teksty/plakietka-app-store.md) jako <img alt> w linku, wysokość 44 px (min. 40 px wg wytycznych);
     bez pliku dla języka — zwykły link tekstowy bez stylów (wariant b). Nazwa „App Store” nie jest tłumaczona; grafiki nie wolno modyfikować (stąd tylko atrybut height). */
  const href = `https://apps.apple.com/app/id${esc(id)}?ct=techniqueatlas-${esc(lang)}`, grafika = !!id && !!ctx.plakietki?.has(lang);
  const plakietka = !id ? '' : grafika ? `<p><a href="${href}"><img src="${relUrl(file, `assets/plakietka/${lang}.svg`)}" alt="${esc(ui.appStore)}" height="44"></a></p>` : `<p><a href="${href}">${esc(ui.appStore)}</a></p>`;
  return { grafika, html: `<aside class="ramka" id="aplikacja" aria-labelledby="ramka-t">\n<h2 id="ramka-t"${k}>${esc(fill(r.tytul, { nazwa: ctx.cfg.nazwaAplikacji }))}</h2>\n<ul class="ramka-l"${k}>${zdania}</ul>\n${plakietka}</aside>` };
}

export function exercisePage(ctx, lang, ex) {
  const d = ctx.data[lang], ui = d.labels.ui, site = ctx.ui[lang], file = paths.exercise(lang, ex.slug), u = to => relUrl(file, to), L = d.labels;
  const fig = ctx.figs[ex.slug] && ex.figure ? ctx.figs[ex.slug] : null;
  const cue = k => ex.cues.scope === 'own' ? ex.cues[k] : k === 'tips' ? ex.cues.ok : k === 'mistakes' ? ex.cues.mistakes : null;
  const sz = ctx.sz[lang]?.get(ex.slug), Q = (k, domyslny) => sz?.pytania[k] ?? domyslny; /* nagłówki-pytania (Z-22 2.4): tylko pl i en; pozostałe języki — dotychczasowe nagłówki */
  const list = (title, items) => items?.length ? `<section><h2>${esc(title)}</h2><ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>` : '';
  const main = ex.regions.filter(r => r.load >= 1).map(r => L.regions[r.id]), aux = ex.regions.filter(r => r.load >= 0.5 && r.load < 1).map(r => L.regions[r.id]);
  const figure = fig ? figureBlock(ctx, lang, ex, fig, file) : null;
  const text = SECTION.map(k => cue(k)).some(x => x?.length) ? SECTION.map(k => list(Q(k, ui[k]), cue(k))).join('\n') : '';
  const roles = ex.roles?.length ? `<ul class="role">${ex.roles.map(r => `<li><strong>${esc(L.regions[r.id])}</strong> — ${esc(r.text)}</li>`).join('')}</ul>` : ''; /* zdania o roli mięśnia: tylko gdy eksport je zawiera (bez zastępczych) */
  const silhouette = silhouetteBlock(ctx, lang, ex, file);
  const muscleText = (main.length ? `<p>${esc(fill(ui.musclesMain, { lista: main.join(', ') }))}</p>` : '') + (aux.length ? `<p>${esc(fill(ui.musclesAux, { lista: aux.join(', ') }))}</p>` : '') + roles + (ex.musclesApproximate ? `<p class="drobne">${esc(ui.musclesApprox)}</p>` : '');
  const muscles = silhouette + muscleText ? `<section class="miesnie"><h2>${esc(Q('miesnie', site.muscles))}</h2>${silhouette}${muscleText}</section>` : '';
  const needs = ex.requires.length ? `<section><h2>${esc(Q('sprzet', site.equipmentNeeded))}</h2><ul>${ex.requires.map(g => `<li>${esc(g.map(c => L.capabilities[c]).join(' / '))}</li>`).join('')}</ul></section>` : '';
  const bySlug = ctx.bySlug[lang];
  const alts = ex.alternatives.length ? `<section><h2>${esc(Q('zamienniki', site.alternatives))}</h2><ul class="zam">${ex.alternatives.map(s => `<li><a href="${u(urlOf(paths.exercise(lang, s)))}">${nazwaLokalna(ctx, lang, bySlug.get(s)) ? nazwaHtml(ctx, lang, bySlug.get(s)) : `<span class="nazwa-pl"${nameAttr(lang)}>${esc(bySlug.get(s).name)}</span>`}</a></li>`).join('')}</ul></section>` : '';
  const cueSections = [text, list(Q('tips', ui.tips), cue('tips')), list(Q('mistakes', ui.mistakes), cue('mistakes'))].filter(Boolean).join('\n');
  /* tabliczka rysunkowa: klasyfikacja jako linki do stron filtrów; nazwa angielska (w polskim — z eksportu en, gdy jest budowany) */
  const enName = ctx.bySlug.en?.get(ex.slug)?.name ?? ex.name, family = ctx.familyLabel(lang, ex.family);
  const tabRow = (label, inner) => `<div><dt>${esc(label)}</dt><dd>${inner}</dd></div>`;
  const tabliczka = `<dl class="tabliczka"><div><dt>${esc(site.nameLabel)}</dt><dd lang="en">${esc(enName)}</dd></div>${tabRow(site.filterMuscle, `<a href="${u(urlOf(paths.muscle(lang, GROUP_ID[ex.group])))}">${esc(L.groups[ex.group])}</a>`)}${tabRow(site.filterEquipment, `<a href="${u(urlOf(paths.equipment(lang, EQUIPMENT_ID[ex.equipment])))}">${esc(L.equipment[ex.equipment])}</a>`)}${family ? tabRow(site.filterMovement, `<a href="${u(urlOf(paths.movement(lang, familyId(ex.family))))}">${esc(family)}</a>`) : ''}</dl>`;
  /* krótka odpowiedź (KO-135): tylko przy własnych wskazówkach; szablon Z-22 (pl, en) — pozostałe języki dostaną ją z tłumaczeniem szablonów (Z-26/Z-34) */
  const own = ex.cues.scope === 'own' && !ex.cues.missing;
  const odpowiedz = own && JEZYKI_SZABLONOW.includes(lang) ? szablonyCwiczenia(d, site, lang, ex).odpowiedz : '';
  const odp = odpowiedz ? `<section class="odp" aria-labelledby="odp-t"><h2 id="odp-t">${esc(site.howTo)}</h2><p class="odp">${esc(odpowiedz)}</p></section>` : '';
  const nota = ex.cues.scope === 'general' ? `<p class="nota">${esc(ui.generalNote)}</p>` : '';
  const tekstowa = (nota || cueSections) ? `<div class="uk-p">${nota}${cueSections}${needs}${alts}</div>` : '';
  const uklad = fig || tekstowa
    ? `<div class="uk uk3${fig ? '' : ' bez-fig'}">${figure ? figure.html : ''}${tekstowa || (needs || alts ? `<div class="uk-p">${needs}${alts}</div>` : '')}${muscles}</div>`
    : `<div class="uk uk-skrot bez-fig">${muscles}${needs ? `<div>${needs}</div>` : ''}${alts ? `<div>${alts}</div>` : ''}</div>`;
  const ramka = ramkaHtml(ctx, lang, file);
  const body = `<div class="arkusz-g"><h1 class="nazwa"${nazwaAttr(ctx, lang, ex)}>${nazwaLokalna(ctx, lang, ex) ? nazwaHtml(ctx, lang, ex) : esc(ex.name)}</h1>${tabliczka}</div>
${odp}${uklad}
${ramka.html}
<p class="zastrz">${esc(ui.disclaimer)}</p>`;
  const group = { name: L.groups[ex.group], path: paths.muscle(lang, GROUP_ID[ex.group]) };
  const crumbs = [...crumbBase(ctx, lang), { name: site.library, path: paths.list(lang) }, group, { name: nazwaStrony(ctx, lang, ex), path: file, lang: nazwaLokalna(ctx, lang, ex) ? '' : 'en' }];
  /* S6/ZM-08 (27.11.2026, P-1; odwraca ZM-06): do indeksu ćwiczenia z własnymi wskazówkami kompletnymi w tym języku (D1), bez wymogu pełnej karty (`pelna` nie ma znaczenia);
     reszta noindex,follow. Reguła sama zdejmuje noindex, gdy ćwiczenie spełni warunek. Strażnik S6 sprawdza wynik niezależnie. */
  const indexable = !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang) && own;
  /* tytuł i opis: szablony Z-22 (pl, en; pominOpis → bez <meta name="description">); pozostałe języki — nazwa i mięśnie, do czasu przekładu szablonów przez API */
  const tytul = sz ? sz.tytul : ex.name, opis = sz ? (sz.pominOpis ? '' : sz.opis) : `${nazwaStrony(ctx, lang, ex)}${main.length ? ': ' + main.join(', ') : ''}`;
  /* podgląd (A9, A11): ten sam rysunek ćwiczenia (obie pozycje) jako PNG 1200×630 z assets/podglad/ — wspólny dla języków; bez rysunku brak obrazka (nie logo, nie ikona) */
  const obraz = fig ? { url: abs(ctx.cfg, `assets/podglad/${ex.slug}.png`), alt: nazwaStrony(ctx, lang, ex) } : null;
  const webPage = obraz ? { '@context': 'https://schema.org', '@type': 'WebPage', url: abs(ctx.cfg, urlOf(file)), name: tytul, inLanguage: hreflang(lang), primaryImageOfPage: { '@type': 'ImageObject', url: obraz.url, width: 1200, height: 630 } } : null;
  return { file, lang, kind: 'exercise', slug: ex.slug, indexable, obraz: obraz?.url, /* adres PNG podglądu → <image:image> w mapie witryny */ html: layout(ctx, { file, lang, title: tytul, description: opis, robots: robotsFor(ctx, lang, own), canonical: urlOf(file), ogType: 'article', ogImage: obraz, znakiApple: ramka.grafika,
    alternates: alternatesFor(ctx, l => paths.exercise(l, ex.slug)), xDefault: defaultOf(ctx, l => paths.exercise(l, ex.slug)), jsonld: [bcJson(ctx, crumbs), ...(webPage ? [webPage] : [])], scripts: figure ? [figure.script] : [], styles: silhouette ? ['assets/sylwetka.css'] : [], crumbs, menu: true }, body) };
}

/** Strona prawna (Z-33): dokument z docs/teksty/prawne/ w języku strony; język bez przekładu → wersja angielska z lang="en" (przekład API: docs/przeklad, źródło „prawne”). */
export function legalPage(ctx, lang, doc) {
  const own = ctx.prawne[doc.id][lang], d = own ?? ctx.prawne[doc.id].en, k = own ? '' : ' lang="en"', file = paths.legal(lang, doc.slug);
  const crumbs = [...crumbBase(ctx, lang), { name: d.h1, path: file, lang: own ? '' : 'en' }];
  const body = `<h1${k}>${esc(d.h1)}</h1>\n<div class="tekst-prawny"${k}>\n${d.html}\n</div>`;
  return { file, lang, kind: 'legal', indexable: !!ctx.cfg.indeksowanie && ctx.cfg.indeksujJezyki.includes(lang) && !!own, html: layout(ctx, { file, lang, title: d.h1, robots: robotsFor(ctx, lang, !!own), canonical: urlOf(file),
    alternates: alternatesFor(ctx, l => paths.legal(l, doc.slug)), xDefault: defaultOf(ctx, l => paths.legal(l, doc.slug)), jsonld: [bcJson(ctx, crumbs)], crumbs, menu: true }, body) };
}

/** Stary adres ćwiczenia po przeniesieniu albo usunięciu (slug-overrides.json → przekierowania): meta refresh 0 s + canonical na nowy adres, w każdym budowanym języku; `to` null = lista ćwiczeń.
 * Strona ma widoczny link (nazwa ćwiczenia albo „Wszystkie ćwiczenia”), więc działa też bez przekierowania przeglądarki; poza mapami witryny i bez hreflang. */
export function redirectPage(ctx, lang, from, to) {
  const file = paths.exercise(lang, from), ui = ctx.ui[lang], target = to === null ? paths.list(lang) : paths.exercise(lang, to), ex = to === null ? null : ctx.bySlug[lang].get(to);
  const name = ex ? nazwaStrony(ctx, lang, ex) : ui.allExercises, href = relUrl(file, urlOf(target));
  return { file, lang, kind: 'redirect', indexable: false, html: layout(ctx, { file, lang, title: name, robots: ctx.cfg.indeksowanie ? '' : 'noindex,nofollow', canonical: urlOf(target), refresh: abs(ctx.cfg, urlOf(target)) /* pełny adres z domeną: dokumentacja Google nie rozstrzyga adresu względnego (badanie 01.11.2026, pkt 1) */ },
    `<h1${ex ? nazwaAttr(ctx, lang, ex) : ''}><a href="${href}">${esc(name)}</a></h1>`) };
}
