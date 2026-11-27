// Z-12 · System „Arkusz”: szablony 3 ekranów, stany i katalog komponentów z prawdziwymi danymi (pl 1.1.1; jeden ekran ru do sprawdzenia krojów).
// Użycie (po `npm run dane` i `node src/build.mjs --jezyki pl,en --out <dist>`):
//   node docs/design/system/generuj.mjs <nazwy-pl.json z gałęzi strona/z24-nazwy-pl> <dist> <katalog @fontsource>
// Wynik: docs/design/system/szablony/*.html, zasoby/ (figury, sylwetka), fonty/ (OFL). Tylko makiety: src/ i assets/ bez zmian (wdrożenie Z-31, Z-33).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '../../..');
const [namesPath, distDir, fontDir] = process.argv.slice(2);
const J = p => JSON.parse(readFileSync(p, 'utf8'));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const sil = J(join(ROOT, '.cache/dane/sylwetka.json')), man = J(join(ROOT, '.cache/dane/manifest.json')), cfg = J(join(ROOT, 'config.json'));
const NPL = J(namesPath);
const DATA = {}, UI = {};
for (const l of ['pl', 'ru', cfg.jezykDomyslny]) { DATA[l] = J(join(ROOT, `.cache/dane/atlas-${l}.json`)); UI[l] = J(join(ROOT, `src/ui/${l}.json`)); }
const OUT = join(HERE, 'szablony'), Z = join(HERE, 'zasoby'), F = join(HERE, 'fonty');
for (const d of [OUT, Z, F]) mkdirSync(d, { recursive: true });

/* ---------- zasoby: figury z budowania, sylwetka, kroje ---------- */
const PRZYKLADY = { own: 'back-squat', general: 'decline-bench-press', nofig: 'bench-dip', none: 'sissy-squat' };
for (const s of [PRZYKLADY.own, PRZYKLADY.general]) copyFileSync(join(distDir, 'assets/poz', `${s}.svg`), join(Z, `${s}.svg`));
writeFileSync(join(Z, 'sylwetka.svg'), sil.sprite);
writeFileSync(join(Z, 'sylwetka.css'), sil.vars.muscle.flatMap((v, i) => [1, 2, 3, 4].map(l => `.sylwetki.s${i}-${l}{${v}:var(--mm-l${l})}`)).join('\n') + '\n');
let fonty = '/* IBM Plex Sans Condensed 500 i 600, latin + latin-ext (OFL, fonty/OFL-ibm-plex-sans-condensed.txt). Pliki lokalne: CSP font-src = default-src \'self\'. */\n';
for (const w of [500, 600]) for (const sub of ['latin-ext', 'latin']) {
  const pkg = 'ibm-plex-sans-condensed', file = `${pkg}-${sub}-${w}-normal.woff2`;
  const blk = readFileSync(join(fontDir, pkg, `${w}.css`), 'utf8').split('/* ').find(b => b.startsWith(file.replace('.woff2', ' ')));
  copyFileSync(join(fontDir, pkg, 'files', file), join(F, file));
  fonty += `@font-face{font-family:"Plex Cond";font-style:normal;font-weight:${w};font-display:swap;src:url(../fonty/${file}) format("woff2");unicode-range:${blk.match(/unicode-range:\s*([^;]+);/)[1]}}\n`;
}
copyFileSync(join(ROOT, 'docs/design/makiety-2026-11-27/zasoby/fonty/OFL-ibm-plex-sans-condensed.txt'), join(F, 'OFL-ibm-plex-sans-condensed.txt'));
writeFileSync(join(HERE, 'fonty.css'), fonty);

/* ---------- teksty spoza danych (pl; tłumaczenia: Z-22/Z-31) ---------- */
const RAMKA = ['W aplikacji dodasz to ćwiczenie do treningu albo do własnego szablonu.', 'W czasie treningu zapisujesz każdą serię, a obok widzisz wynik z poprzedniego razu.', 'Po odhaczeniu serii zaczyna się odliczanie przerwy.', 'Gdy nie masz sprzętu albo jest zajęty, aplikacja podsuwa zamienniki, także ten sam ruch na innym przyrządzie.', 'Po wybraniu miejsca treningu lista pokazuje ćwiczenia, które da się tam zrobić.', 'Na ekranie ćwiczenia widzisz swoje ostatnie treningi z nim, a w „Postępach” wykres i rekordy.', 'Z szablonów ułożysz plan tygodnia albo wygenerujesz szablony i plan z kilku założeń.', 'Historia, postępy, szablony i kopia zapasowa są dostępne zawsze, także bez płatnej wersji.'];
const WSPARCIE = 'Ta strona jest bezpłatna. Aplikacja: 5 dni treningowych w miesiącu bez opłat, pełna wersja płatna (subskrypcja albo dostęp dożywotni). To wspiera też rozwój tej strony.';
const APP = 'Trening'; /* [DO USTALENIA] nazwa aplikacji w sklepie */
/* nowe teksty interfejsu (do src/ui/<język>.json w Z-31; pl tu, inne języki: tłumacz po słowniku) */
const T = { pl: { menu: 'Menu', mainMenu: 'Menu główne', tempo: 'Tempo powtórzenia', razem: 'razem {t} na powtórzenie', klas: ['Nazwa', 'Partia', 'Sprzęt', 'Rodzaj ruchu'], miesnie: 'Mięśnie', bledy: 'Częste błędy:', jak: 'Jak zrobić {n}?', menuItems: ['Ćwiczenia', 'Partie mięśniowe', 'Sprzęt', 'Rodzaj ruchu', 'Aplikacja'], zmienJezyk: 'Język: polski. Zmień język', wszystkieJezyki: 'wszystkie języki ({n})', pusty: 'Zmień albo wyczyść filtry, żeby zobaczyć ćwiczenia.', nf: 'Adres mógł się zmienić. Wybierz język, a potem ćwiczenie z listy.', z: 'z' },
  ru: { menu: 'Меню', mainMenu: 'Главное меню', tempo: 'Темп повторения', razem: 'всего {t} на повторение', klas: ['Название', 'Группа', 'Оборудование', 'Тип движения'], miesnie: 'Мышцы', bledy: 'Частые ошибки:', menuItems: ['Упражнения', 'Группы мышц', 'Оборудование', 'Тип движения', 'Приложение'], zmienJezyk: 'Язык: русский. Сменить язык', wszystkieJezyki: 'все языки ({n})', z: 'из' } };

/* ---------- części wspólne ---------- */
const ZNAK = '<svg class="znak" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M4 8v16M28 8v16M4 16h24M4 16l6-3.5M4 16l6 3.5M28 16l-6-3.5M28 16l-6 3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const head = (lang, title, extra = '') => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title>
<link rel="icon" href="../ikona/favicon-96.png" type="image/png">
<link rel="stylesheet" href="../fonty.css">
<link rel="stylesheet" href="../tokeny.css">
<link rel="stylesheet" href="../komponenty.css">
<link rel="stylesheet" href="../zasoby/sylwetka.css">${extra}
</head>
<body>
<a class="skip" href="#tresc">${esc(UI[lang].skip)}</a>`;
const header = (lang, cur = -1) => { const t = T[lang], ui = UI[lang];
  const href = ['lista.html', 'glowna.html#partie', 'glowna.html#sprzet', 'glowna.html#ruch', 'cwiczenie.html#aplikacja'];
  const items = t.menuItems.map((x, i) => `<li><a href="${href[i]}"${i === cur ? ' aria-current="page"' : ''}>${esc(x)}</a></li>`).join('');
  return `<header class="glowka"><div class="glowka-w">
<a class="marka" href="glowna.html">${ZNAK}<span class="marka-t"><span class="marka-n" lang="en">Technique Atlas</span><span class="marka-p">${esc(ui.siteName)}</span></span></a>
<nav class="menu menu-w" aria-label="${esc(t.mainMenu)}"><ul>${items}</ul></nav>
<div class="glowka-n"><a class="jezyk" href="jezyki.html" aria-label="${esc(t.zmienJezyk)}">${lang.toUpperCase()}</a><details class="menu-d"><summary>${esc(t.menu)}</summary><nav class="menu" aria-label="${esc(t.mainMenu)}"><ul>${items}</ul></nav></details></div>
</div></header>`; };
const footer = lang => { const ui = UI[lang], t = T[lang];
  return `<footer class="stopka"><div class="stopka-w">
${lang === 'pl' ? `<p class="wsparcie">${esc(WSPARCIE)}</p>` : ''}
<p class="jezyki">${esc(ui.language)}: ${lang === 'pl' ? '<span aria-current="true">Polski</span> · <a href="#" lang="en">English</a>' : '<a href="#" lang="pl">Polski</a> · <span aria-current="true">Русский</span>'} · <a href="#" lang="de">Deutsch</a> · <a href="jezyki.html">${esc(t.wszystkieJezyki.replace('{n}', man.languages.length))}</a></p>
<p class="prawne"><a href="#">${esc(ui.privacy)}</a> · ${esc(ui.rights)}</p>
</div></footer>
</body>
</html>
`; };
const crumbs = (lang, items) => `<nav class="okruszki" aria-label="${esc(UI[lang].breadcrumbs)}"><ol>${items.map(([t, h, l]) => `<li>${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page"${l ? ` lang="${l}"` : ''}>${esc(t)}</span>`}</li>`).join('')}</ol></nav>`;
const ulist = a => `<ul>${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
const JEDN = { pl: 's', ru: 'с' }; /* symbol sekundy: tekst tłumaczenia (Z-31, słownik terminów); Intl daje formy niespójne między językami (pl „sek.”, en „2.5s”) */
const num = (ms, lang) => new Intl.NumberFormat(lang).format(ms / 1000);
const jedn = (ms, lang) => `\u00a0${JEDN[lang]}`; /* twarda spacja: liczba i jednostka w jednym wierszu */
const sec = (ms, lang) => num(ms, lang) + jedn(ms, lang);

function exercise(lang, slug, file, title) {
  const d = DATA[lang], L = d.labels, ui = UI[lang], t = T[lang], by = new Map(d.exercises.map(e => [e.slug, e])), E = by.get(slug);
  const pl = e => lang === 'pl' ? (NPL[e.id] ?? e.name) : e.name; /* poza pl nazwy angielskie (DEC-13) */
  const nameBlock = lang === 'pl' ? `<h1 class="nazwa"><span class="nazwa-pl">${esc(pl(E))}</span> <span class="nazwa-en" lang="en">${esc(E.name)}</span></h1>` : `<h1 class="nazwa" lang="en"><span class="nazwa-pl">${esc(E.name)}</span></h1>`;
  const grp = L.groups[E.group], eqp = L.equipment[E.equipment], fam = ui.families[E.family];
  const tab = `<dl class="tabliczka">${[[E.name, null, 'en'], [grp, 'lista.html'], [eqp, 'lista.html'], [fam, 'lista.html']].map(([v, h, l], i) => `<div><dt>${esc(t.klas[i])}</dt><dd${l ? ` lang="${l}"` : ''}>${h ? `<a href="${h}">${esc(v)}</a>` : esc(v)}</dd></div>`).join('')}</dl>`;
  const hasFig = !!E.figure && existsSync(join(Z, `${slug}.svg`));
  const scope = E.cues.scope, cue = k => scope === 'own' ? E.cues[k] : k === 'tips' ? E.cues.ok : k === 'mistakes' ? E.cues.mistakes : null;
  let fig = '';
  if (hasFig) {
    const vb = readFileSync(join(Z, `${slug}.svg`), 'utf8').match(/viewBox="([^"]+)"/)[1];
    const phases = E.figure.phases.filter(p => p.ms > 0), total = phases.reduce((s, p) => s + p.ms, 0), ph = n => L.phases[n] ?? n;
    const seq = phases.map(p => `${ph(p.name)} ${sec(p.ms, lang)}`).join(', ');
    const narrow = phases.some(p => p.ms / total < 0.2);
    const wymiar = `<div class="wymiar${narrow ? ' ma-waskie' : ''}" role="img" aria-label="${esc(`${t.tempo}: ${seq}; ${t.razem.replace('{t}', sec(total, lang))}`)}">
<div class="wymiar-l">${phases.map(p => `<div class="wymiar-s t${p.ms / 100}${p.ms / total < 0.2 ? ' waski' : ''}"><span class="wymiar-v">${esc(num(p.ms, lang))}<span class="jedn">${esc(jedn(p.ms, lang))}</span></span><span class="wymiar-n">${esc(ph(p.name))}</span></div>`).join('')}</div>
<p class="wymiar-r"><span class="wymiar-sek">${esc(seq)}</span>${esc(t.razem.replace('{t}', sec(total, lang)))}</p></div>`;
    const poses = `<div class="pozycje">${['start', 'end'].map(id => `<div class="poz"><svg role="img" aria-label="${esc(L.ui.figureLabel.replace('{opis}', `${pl(E)}, ${id === 'start' ? L.ui.startPose : L.ui.endPose}`))}" viewBox="${vb}"><use href="../zasoby/${slug}.svg#${id}"/></svg><p class="podpis">${esc(id === 'start' ? L.ui.startPose : L.ui.endPose)}</p></div>`).join('')}</div>`;
    const ster = `<div class="fig-ster"><button type="button" class="b-anim" aria-pressed="false">${esc(L.ui.resume)}</button>${E.figure.errors.length ? `<span class="fig-bledy-t">${esc(t.bledy)}</span>${E.figure.errors.map(x => `<button type="button" class="b-blad" aria-pressed="false">${esc(x.text.replace(/\.$/, ''))}</button>`).join('')}` : ''}</div>`;
    fig = `<figure class="fig">${poses}${wymiar}${ster}<p class="podpis">${esc(L.ui.schematic)}</p></figure>`;
  }
  const lst = (h, a) => a?.length ? `<section><h2>${esc(h)}</h2>${ulist(a)}</section>` : '';
  const note = scope === 'general' ? `<p class="nota">${esc(L.ui.generalNote)}</p>` : '';
  const tech = lst(L.ui.setup, cue('setup')) + lst(L.ui.move, cue('move'));
  const tips = lst(L.ui.tips, cue('tips')) + lst(L.ui.mistakes, cue('mistakes'));
  const needs = E.requires.length ? `<section><h2>${esc(ui.equipmentNeeded)}</h2>${ulist(E.requires.map(g => g.map(c => L.capabilities[c]).join(' / ')))}</section>` : '';
  const alts = E.alternatives.length ? `<section><h2>${esc(ui.alternatives)}</h2><ul class="zam">${E.alternatives.map(s => { const x = by.get(s); return `<li><a href="cwiczenie.html">${lang === 'pl' ? `<span class="nazwa-pl">${esc(pl(x))}</span> <span class="nazwa-en" lang="en">${esc(x.name)}</span>` : `<span class="nazwa-pl" lang="en">${esc(x.name)}</span>`}</a></li>`; }).join('')}</ul></section>` : '';
  const main = E.regions.filter(r => r.load >= 1).map(r => L.regions[r.id]), aux = E.regions.filter(r => r.load >= .5 && r.load < 1).map(r => L.regions[r.id]);
  const lv = sil.levels[slug] ?? [];
  const sylw = lv.some(Boolean) ? `<div class="sylwetki ${lv.map((v, i) => v ? `s${i}-${v}` : '').filter(Boolean).join(' ')}" aria-hidden="true">${[['front', L.ui.front], ['back', L.ui.back]].map(([id, c]) => `<div><svg viewBox="0 0 120 260" focusable="false"><use href="../zasoby/sylwetka.svg#${id}"/></svg><p class="podpis">${esc(c)}</p></div>`).join('')}</div>` : '';
  const muscles = `<section class="miesnie"><h2>${esc(t.miesnie)}</h2>${sylw}${main.length ? `<p>${esc(L.ui.musclesMain.replace('{lista}', main.join(', ')))}</p>` : ''}${aux.length ? `<p>${esc(L.ui.musclesAux.replace('{lista}', aux.join(', ')))}</p>` : ''}${E.roles?.length ? `<ul class="role">${E.roles.map(r => `<li><strong>${esc(L.regions[r.id])}</strong> — ${esc(r.text)}</li>`).join('')}</ul>` : ''}${E.musclesApproximate ? `<p class="podpis">${esc(L.ui.musclesApprox)}</p>` : ''}</section>`;
  /* krótka odpowiedź tylko z własnych wskazówek (pierwsze zdanie Ustawienia + Ruchu); przy ogólnych i ich braku jej nie ma — bez nowych słów (Z-22) */
  const answer = scope === 'own' && lang === 'pl' && E.cues.setup?.length && E.cues.move?.length ? `<section class="odp" aria-labelledby="odp-t"><h2 id="odp-t">${esc(t.jak.replace('{n}', pl(E).charAt(0).toLowerCase() + pl(E).slice(1)))}</h2><p>${esc(`${E.cues.setup[0]} ${E.cues.move[0]}`)}</p></section>` : '';
  const ramka = lang === 'pl' ? `<aside class="ramka" id="aplikacja" aria-labelledby="ramka-t">
<h2 id="ramka-t">W aplikacji ${APP}</h2>
<ul class="ramka-l">${RAMKA.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
<div class="plakietka" role="img" aria-label="Pobierz w App Store (miejsce na plakietkę)">plakietka App Store<br><span>grafika Apple, po nadaniu appStoreId</span></div>
</aside>` : '';
  let uk;
  if (hasFig) uk = `<div class="uk uk3">${fig}<div class="uk-p">${note}${tech}${tips}${needs}${alts}</div>${muscles}</div>`;
  else if (tech || tips) uk = `<div class="uk uk3 bez-fig"><div class="uk-p">${note}${tech}${tips}${needs}${alts}</div>${muscles}</div>`;
  else uk = `<div class="uk uk-skrot">${muscles}${needs ? `<div>${needs}</div>` : ''}${alts ? `<div>${alts}</div>` : ''}</div>`;
  const cr = crumbs(lang, [[ui.home, 'glowna.html'], [ui.library, 'lista.html'], [grp, 'lista.html'], [pl(E), null, lang === 'pl' ? '' : 'en']]);
  const body = `<div class="arkusz">${cr}<div class="arkusz-g">${nameBlock}${tab}</div>${answer}${uk}${ramka}<p class="zastrz">${esc(L.ui.disclaimer)}</p></div>`;
  writeFileSync(join(OUT, file), `${head(lang, title ?? `${pl(E)} — ${ui.siteName}`)}\n${header(lang)}\n<main id="tresc" class="tresc">${body}</main>\n${footer(lang)}`);
}

/* ---------- strona główna, lista, stany listy ---------- */
const d = DATA.pl, L = d.labels, ui = UI.pl, t = T.pl, ex = d.exercises, coll = new Intl.Collator('pl'), pl = e => NPL[e.id] ?? e.name;
const groupsCount = Object.entries(L.groups).map(([v, lab]) => ({ lab, n: ex.filter(e => e.group === v).length })).sort((a, b) => coll.compare(a.lab, b.lab));
const eqCount = Object.entries(L.equipment).map(([v, lab]) => ({ lab, n: ex.filter(e => e.equipment === v).length })).sort((a, b) => coll.compare(a.lab, b.lab));
const famCount = Object.entries(ui.families).map(([k, lab]) => ({ lab, n: ex.filter(e => e.family === k).length })).filter(x => x.n).sort((a, b) => coll.compare(a.lab, b.lab));
const search = () => `<div class="szukaj"><label for="szukaj">${esc(ui.searchLabel)}</label><input id="szukaj" type="search" autocomplete="off" placeholder="${esc(ui.searchPlaceholder)}"></div>`;
const select = (id, lab, items, val) => `<div class="pole"><label for="${id}"><span>${esc(lab)}</span></label><select id="${id}">${[`<option value="">${esc(ui.filterAll)}</option>`, ...items.map(x => `<option${x.lab === val ? ' selected' : ''}>${esc(x.lab)}</option>`)].join('')}</select></div>`;

function home() {
  const grid = (id, h, a) => `<section class="grupa" id="${id}"><h2>${esc(h)}</h2><ul class="grupa-l">${a.map(x => `<li><a href="lista.html"><span>${esc(x.lab)}</span> <span class="n">${x.n}</span></a></li>`).join('')}</ul></section>`;
  const basics = ex.filter(e => !e.niche).sort((a, b) => coll.compare(pl(a), pl(b)));
  const bas = `<section><h2>${esc(ui.basics)}</h2><ul class="wiersze">${basics.slice(0, 10).map(e => `<li><a href="cwiczenie.html"><span class="nazwa-pl">${esc(pl(e))}</span> <span class="nazwa-en" lang="en">${esc(e.name)}</span></a><span class="meta">${esc(L.groups[e.group])} · ${esc(L.equipment[e.equipment])}</span></li>`).join('')}</ul><p><a class="dalej" href="lista.html">${esc(ui.allExercises)} (${ex.length})</a></p></section>`;
  const intro = `<div class="wstep"><h1>${esc(ui.siteName)}</h1><p class="licznik">${esc(ui.countLine.many.replace('{n}', ex.length))}</p>${search()}</div>`;
  writeFileSync(join(OUT, 'glowna.html'), `${head('pl', ui.siteName)}\n${header('pl')}\n<main id="tresc" class="tresc"><div class="arkusz">${intro}<div class="grupy">${grid('partie', ui.byMuscle, groupsCount)}${grid('sprzet', ui.byEquipment, eqCount)}</div>${grid('ruch', ui.byMovement, famCount)}${bas}</div></main>\n${footer('pl')}`);
}

function list(file, f) {
  const hits = ex.filter(e => (!f.g || L.groups[e.group] === f.g) && (!f.e || L.equipment[e.equipment] === f.e) && (!f.r || ui.families[e.family] === f.r)).sort((a, b) => coll.compare(pl(a), pl(b)));
  const N = 24, items = hits.slice(0, N);
  const filt = `<div class="filtry" role="group" aria-label="Filtry">${select('f-g', ui.filterMuscle, groupsCount, f.g)}${select('f-e', ui.filterEquipment, eqCount, f.e)}${select('f-r', ui.filterMovement, famCount, f.r)}<button type="button" class="wyczysc">${esc(ui.clearFilters)}</button></div>`;
  const opis = [f.g && `partia: ${f.g}`, f.e && `sprzęt: ${f.e}`, f.r && `rodzaj ruchu: ${f.r}`].filter(Boolean).join(' · ');
  const count = `<p class="wynik" aria-live="polite"><strong>${hits.length}</strong> ${t.z} ${ex.length} ćwiczeń · ${esc(opis)}</p>`;
  const tab = hits.length ? `<table class="wykaz"><caption class="wizualnie-ukryte">${esc(ui.exercisesIn.replace('{nazwa}', opis))}</caption><thead><tr><th scope="col">${esc(t.klas[0])}</th><th scope="col">${esc(t.klas[2])}</th><th scope="col">${esc(t.klas[3])}</th></tr></thead><tbody>${items.map(e => `<tr><th scope="row"><a href="cwiczenie.html"><span class="nazwa-pl">${esc(pl(e))}</span> <span class="nazwa-en" lang="en">${esc(e.name)}</span></a></th><td>${esc(L.equipment[e.equipment])}</td><td>${esc(ui.families[e.family] ?? '')}</td></tr>`).join('')}</tbody></table><p class="dalej-w">Pokazano ${items.length} z ${hits.length} (fragment makiety)</p>`
    : `<div class="pusto"><h2>${esc(ui.noResults)}</h2><p>${esc(t.pusty)}</p><button type="button" class="wyczysc">${esc(ui.clearFilters)}</button></div>`;
  const cr = crumbs('pl', [[ui.home, 'glowna.html'], [ui.allExercises, null]]);
  writeFileSync(join(OUT, file), `${head('pl', `${ui.allExercises} — ${ui.siteName}`)}\n${header('pl', 0)}\n<main id="tresc" class="tresc"><div class="arkusz">${cr}<h1>${esc(ui.allExercises)}</h1>${search()}${filt}${count}${tab}</div></main>\n${footer('pl')}`);
}

/* ---------- wybór języka (/) i 404: teksty języka domyślnego (config.jezykDomyslny), lista 35 języków ---------- */
const langs = man.languages;
const langList = () => `<ul class="jezyki-l">${langs.map(m => `<li><a href="glowna.html" hreflang="${esc(m.code ?? m.lang)}" lang="${esc(m.code ?? m.lang)}">${esc(m.name)}</a></li>`).join('')}</ul>`;
function chooser() {
  const u = J(join(ROOT, `src/ui/${cfg.jezykDomyslny}.json`));
  writeFileSync(join(OUT, 'jezyki.html'), `${head(cfg.jezykDomyslny, u.siteName)}\n<header class="glowka"><div class="glowka-w"><span class="marka">${ZNAK}<span class="marka-t"><span class="marka-n" lang="en">Technique Atlas</span><span class="marka-p">${esc(u.siteName)}</span></span></span></div></header>\n<main id="tresc" class="tresc"><div class="arkusz"><h1>${esc(u.siteName)}</h1><h2>${esc(u.chooseLanguage)}</h2>${langList()}</div></main>\n</body>\n</html>\n`);
}
function notFound() {
  const u = J(join(ROOT, `src/ui/${cfg.jezykDomyslny}.json`));
  writeFileSync(join(OUT, '404.html'), `${head(cfg.jezykDomyslny, u.pageNotFound)}\n<header class="glowka"><div class="glowka-w"><a class="marka" href="jezyki.html">${ZNAK}<span class="marka-t"><span class="marka-n" lang="en">Technique Atlas</span><span class="marka-p">${esc(u.siteName)}</span></span></a></div></header>\n<main id="tresc" class="tresc"><div class="arkusz"><p class="blad-kod">404</p><h1>${esc(u.pageNotFound)}</h1><h2>${esc(u.chooseLanguage)}</h2>${langList()}</div></main>\n</body>\n</html>\n`);
}

/* ---------- katalog komponentów ---------- */
function catalog() {
  const tok = ['bg', 'sheet', 'ink', 'muted', 'rule', 'hair', 'accent', 'accent-bg', 'kontrola'];
  const w = (cls, segs, label) => `<div class="wymiar${segs.some(s => s[2]) ? ' ma-waskie' : ''} ${cls}" role="img" aria-label="${esc(label)}"><div class="wymiar-l">${segs.map(([ms, n, nar]) => `<div class="wymiar-s t${ms / 100}${nar ? ' waski' : ''}"><span class="wymiar-v">${num(ms, 'pl')}<span class="jedn">${jedn(ms, 'pl')}</span></span><span class="wymiar-n">${n}</span></div>`).join('')}</div><p class="wymiar-r"><span class="wymiar-sek">${segs.map(([ms, n]) => `${n} ${sec(ms, 'pl')}`).join(', ')}</span>razem ${sec(segs.reduce((s, x) => s + x[0], 0), 'pl')} na powtórzenie</p></div>`;
  const seg4 = [[2000, 'Opuszczanie'], [500, 'Pauza', 1], [1000, 'Wypychanie'], [500, 'Pauza', 1]];
  const lab4 = 'Tempo powtórzenia: Opuszczanie 2 s, Pauza 0,5 s, Wypychanie 1 s, Pauza 0,5 s; razem 4 s na powtórzenie';
  const body = `<div class="arkusz kat"><h1>Komponenty systemu „Arkusz”</h1><p class="licznik">Katalog do wdrożenia (Z-31). Każdy komponent używa tylko tokenów z <code>tokeny.css</code>.</p>
<h2>Kolory (tokeny)</h2><ul class="probki">${tok.map(k => `<li><span class="p-${k}"></span><code>--${k}</code></li>`).join('')}</ul>
<h2>Typografia</h2><h1 class="nazwa"><span class="nazwa-pl">Nagłówek 1 — nazwa ćwiczenia</span> <span class="nazwa-en" lang="en">English name</span></h1><h2>Nagłówek 2 — sekcja</h2><p>Treść krojem systemowym, 17 px, interlinia 1,55. Tekst ciągły ma najwyżej ok. 75 znaków w wierszu.</p><p class="podpis">Podpis i tekst drobny.</p>
<h2>Linia wymiarowa tempa (element firmowy)</h2><p>Długość odcinka = czas fazy z danych ruchu. Szeroko:</p>${w('kat-wymiar', seg4, lab4)}<p>Wąski kontener (telefon): nazwy faz chowają się, odcinki poniżej 20% tracą jednostkę, pełna sekwencja jest w wierszu pod linią:</p>${w('kat-waski', seg4, lab4)}<p>Jedna faza (np. skok, 2,5 s):</p>${w('kat-wymiar', [[2500, 'Skok']], 'Tempo powtórzenia: Skok 2,5 s; razem 2,5 s na powtórzenie')}
<h2>Tabliczka rysunkowa</h2><dl class="tabliczka"><div><dt>Nazwa</dt><dd lang="en">Back Squat</dd></div><div><dt>Partia</dt><dd><a href="lista.html">nogi</a></dd></div><div><dt>Sprzęt</dt><dd><a href="lista.html">sztanga</a></dd></div><div><dt>Rodzaj ruchu</dt><dd><a href="lista.html">Przysiady</a></dd></div></dl>
<h2>Przyciski i pola</h2><div class="kat-rzad fig-ster"><button type="button" aria-pressed="false">Wznów animację</button><button type="button" aria-pressed="true">Zatrzymaj animację</button><button type="button" class="b-blad" aria-pressed="false">Częsty błąd (wyłączony)</button><button type="button" class="b-blad" aria-pressed="true">Częsty błąd (pokazany)</button><button type="button" class="wyczysc">${esc(ui.clearFilters)}</button></div>
<div class="filtry">${select('k-g', ui.filterMuscle, groupsCount, 'nogi')}</div>${search()}
<h2>Krótka odpowiedź i nota</h2><section class="odp" aria-labelledby="k-odp"><h2 id="k-odp">Jak zrobić przysiad ze sztangą na plecach?</h2><p>Dwa pierwsze zdania techniki z danych.</p></section><p class="nota">${esc(L.ui.generalNote)}</p>
<h2>Stan pusty</h2><div class="pusto"><h2>${esc(ui.noResults)}</h2><p>${esc(t.pusty)}</p><button type="button" class="wyczysc">${esc(ui.clearFilters)}</button></div>
<h2>Plakietka App Store</h2><p>Tylko oryginalna grafika Apple (czarna), jedna na układ, co najmniej 40 px wysokości, bez zmian i animacji. Do nadania <code>appStoreId</code> miejsce:</p><div class="plakietka" role="img" aria-label="Pobierz w App Store (miejsce na plakietkę)">plakietka App Store<br><span>grafika Apple, po nadaniu appStoreId</span></div>
</div>`;
  writeFileSync(join(OUT, 'komponenty.html'), `${head('pl', 'Komponenty — system Arkusz')}\n${header('pl')}\n<main id="tresc" class="tresc">${body}</main>\n${footer('pl')}`);
}

exercise('pl', PRZYKLADY.own, 'cwiczenie.html');
exercise('pl', PRZYKLADY.general, 'cwiczenie-wskazowki-ogolne.html');
exercise('pl', PRZYKLADY.nofig, 'cwiczenie-bez-figury.html');
exercise('pl', PRZYKLADY.none, 'cwiczenie-bez-wskazowek.html');
exercise('ru', PRZYKLADY.own, 'cwiczenie-ru.html');
home(); list('lista.html', { g: 'nogi' }); list('lista-pusta.html', { g: 'łydki', e: 'linki', r: 'Przysiady' });
chooser(); notFound(); catalog();
console.log(`szablony: ${OUT}`);
