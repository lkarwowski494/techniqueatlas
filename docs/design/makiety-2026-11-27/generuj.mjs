// Makiety Z-10: trzy kierunki wyglądu × trzy ekrany (ćwiczenie, główna języka, lista z filtrem), pl.
// Treść z danych aplikacji 1.1.1 (.cache/dane po `npm run dane`) i nazw pl z gałęzi strona/z24-nazwy-pl (ścieżka w argumencie).
// Wynik: statyczne pliki HTML w tym katalogu (próbka treści jednego ćwiczenia i fragment listy — nie pełny zbiór danych, D5 A).
// Użycie: node docs/design/makiety-2026-11-27/generuj.mjs <nazwy-pl.json> <katalog-fontsource> [<dist z build>]
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '../../..');
const [namesPath, fontDir, distDir = '/tmp/claude-0/dist'] = process.argv.slice(2); /* distDir: wynik `node src/build.mjs --jezyki pl` (figura przysiadu) */
const J = p => JSON.parse(readFileSync(p, 'utf8'));
const d = J(join(ROOT, '.cache/dane/atlas-pl.json')), sil = J(join(ROOT, '.cache/dane/sylwetka.json')), ui = J(join(ROOT, 'src/ui/pl.json')), NPL = J(namesPath);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const L = d.labels, coll = new Intl.Collator('pl'), ex = d.exercises, by = new Map(ex.map(e => [e.slug, e]));
const pl = e => NPL[e.id] ?? e.name;
const E = by.get('back-squat');

/* ---------- zasoby wspólne: figura, sylwetka, kroje (OFL) ---------- */
const Z = join(HERE, 'zasoby'); mkdirSync(join(Z, 'fonty'), { recursive: true });
copyFileSync(join(distDir, 'assets/poz/back-squat.svg'), join(Z, 'back-squat.svg'));
writeFileSync(join(Z, 'sylwetka.svg'), sil.sprite);
const POSE_VB = readFileSync(join(Z, 'back-squat.svg'), 'utf8').match(/viewBox="([^"]+)"/)[1];
const levels = sil.levels['back-squat'];
writeFileSync(join(Z, 'sylwetka.css'), sil.vars.muscle.flatMap((v, i) => [1, 2, 3, 4].map(l => `.sylwetki.s${i}-${l}{${v}:var(--mm-l${l})}`)).join('\n') + '\n');
const FONTS = { a: ['ibm-plex-sans-condensed', [500, 600], 'Plex Cond'], b: ['source-serif-4', [600], 'Serif4'], c: ['courier-prime', [400, 700], 'Courier Prime'] };
const fontFaces = k => { const [pkg, ws, fam] = FONTS[k]; let css = '';
  for (const w of ws) for (const sub of ['latin-ext', 'latin']) {
    const file = `${pkg}-${sub}-${w}-normal.woff2`, all = readFileSync(join(fontDir, pkg, `${w}.css`), 'utf8'), blk = all.split('/* ').find(b => b.startsWith(file.replace('.woff2', ' '))), range = blk.match(/unicode-range:\s*([^;]+);/)[1];
    copyFileSync(join(fontDir, pkg, 'files', file), join(Z, 'fonty', file));
    css += `@font-face{font-family:"${fam}";font-style:normal;font-weight:${w};font-display:swap;src:url(../zasoby/fonty/${file}) format("woff2");unicode-range:${range}}\n`;
  }
  return css; };

/* ---------- teksty spoza danych ---------- */
const RAMKA = ['W aplikacji dodasz to ćwiczenie do treningu albo do własnego szablonu.', 'W czasie treningu zapisujesz każdą serię, a obok widzisz wynik z poprzedniego razu.', 'Po odhaczeniu serii zaczyna się odliczanie przerwy.', 'Gdy nie masz sprzętu albo jest zajęty, aplikacja podsuwa zamienniki, także ten sam ruch na innym przyrządzie.', 'Po wybraniu miejsca treningu lista pokazuje ćwiczenia, które da się tam zrobić.', 'Na ekranie ćwiczenia widzisz swoje ostatnie treningi z nim, a w „Postępach” wykres i rekordy.', 'Z szablonów ułożysz plan tygodnia albo wygenerujesz szablony i plan z kilku założeń.', 'Historia, postępy, szablony i kopia zapasowa są dostępne zawsze, także bez płatnej wersji.'];
const WSPARCIE = 'Ta strona jest bezpłatna. Aplikacja: 5 dni treningowych w miesiącu bez opłat, pełna wersja płatna (subskrypcja albo dostęp dożywotni). To wspiera też rozwój tej strony.';
const APP = 'Trening'; /* [DO USTALENIA] nazwa aplikacji w sklepie */
const MENU = [['Ćwiczenia', 'lista.html'], ['Partie mięśniowe', 'glowna.html#partie'], ['Sprzęt', 'glowna.html#sprzet'], ['Rodzaj ruchu', 'glowna.html#ruch'], ['Aplikacja', 'cwiczenie.html#aplikacja']];

/* ---------- dane ćwiczenia ---------- */
const main = E.regions.filter(r => r.load >= 1).map(r => L.regions[r.id]), aux = E.regions.filter(r => r.load >= .5 && r.load < 1).map(r => L.regions[r.id]);
const phases = E.figure.phases.filter(p => p.ms > 0), total = phases.reduce((s, p) => s + p.ms, 0);
const sec = ms => `${String(Math.round(ms / 100) / 10).replace('.', ',')} s`;
const ANSWER_Q = `Jak zrobić ${pl(E).charAt(0).toLowerCase() + pl(E).slice(1)}?`;
const ANSWER = `${E.cues.setup[0]} ${E.cues.move[0]}`; /* próbka: pierwsze zdanie Ustawienia + pierwsze zdanie Ruchu (szablon: Z-22) */
const fam = ui.families[E.family], grp = L.groups[E.group], eqp = L.equipment[E.equipment];
const legsList = ex.filter(e => e.group === 'nogi').sort((a, b) => coll.compare(pl(a), pl(b)));
const groupsCount = Object.entries(L.groups).map(([v, lab]) => ({ lab, n: ex.filter(e => e.group === v).length })).sort((a, b) => coll.compare(a.lab, b.lab));
const eqCount = Object.entries(L.equipment).map(([v, lab]) => ({ lab, n: ex.filter(e => e.equipment === v).length })).sort((a, b) => coll.compare(a.lab, b.lab));
const famCount = Object.entries(ui.families).map(([k, lab]) => ({ lab, n: ex.filter(e => e.family === k).length })).filter(x => x.n).sort((a, b) => coll.compare(a.lab, b.lab));
const basics = ex.filter(e => !e.niche).sort((a, b) => coll.compare(pl(a), pl(b)));

/* ---------- części wspólne ---------- */
const MARK = {
  a: '<svg class="znak" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 9v14M29 9v14M3 16h26M3 16l5-3M3 16l5 3M29 16l-5-3M29 16l-5 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  b: '<svg class="znak" viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="3" width="26" height="26" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="8" y="20" width="4" height="5" fill="currentColor" opacity=".35"/><rect x="14" y="16" width="4" height="9" fill="currentColor" opacity=".65"/><rect x="20" y="10" width="4" height="15" fill="currentColor"/></svg>',
  c: '<svg class="znak" viewBox="0 0 32 32" aria-hidden="true"><path d="M4 10h24v17H4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10V5h9v5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="23" r="1.8" fill="currentColor"/></svg>',
};
const head = (k, title) => `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)} — makieta ${k.toUpperCase()}</title>
<link rel="icon" href="data:,">
<link rel="stylesheet" href="../zasoby/baza.css">
<link rel="stylesheet" href="fonty.css">
<link rel="stylesheet" href="styl.css">
<link rel="stylesheet" href="../zasoby/sylwetka.css">
</head>
<body>
<a class="skip" href="#tresc">${esc(ui.skip)}</a>`;
const header = (k, cur) => `<header class="glowka"><div class="glowka-w">
<a class="marka" href="glowna.html">${MARK[k]}<span class="marka-t"><span class="marka-n" lang="en">Technique Atlas</span><span class="marka-p">${esc(ui.siteName)}</span></span></a>
<nav class="menu" aria-label="Menu główne"><ul>${MENU.map(([t, h], i) => `<li><a href="${h}"${i === cur ? ' aria-current="page"' : ''}>${esc(t)}</a></li>`).join('')}</ul></nav>
<div class="glowka-n"><a class="jezyk" href="../../inwentarz-2026-11-27.md" aria-label="Język: polski. Zmień język">PL</a><button type="button" class="menu-p" aria-expanded="false" aria-controls="menu-tel">Menu</button></div>
</div></header>`;
const footer = () => `<footer class="stopka"><div class="stopka-w">
<p class="wsparcie">${esc(WSPARCIE)}</p>
<p class="jezyki">${esc(ui.language)}: <span aria-current="true">Polski</span> · <a href="#" lang="en">English</a> · <a href="#" lang="de">Deutsch</a> · <a href="#">wszystkie języki (35)</a></p>
<p class="prawne"><a href="#">${esc(ui.privacy)}</a> · ${esc(ui.rights)}</p>
</div></footer>
</body>
</html>
`;
const crumbs = items => `<nav class="okruszki" aria-label="${esc(ui.breadcrumbs)}"><ol>${items.map(([t, h]) => `<li>${h ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>`;
const names = (e, tag = 'h1') => `<${tag} class="nazwa"><span class="nazwa-pl">${esc(pl(e))}</span> <span class="nazwa-en" lang="en">${esc(e.name)}</span></${tag}>`;
const poses = () => `<div class="pozycje">${['start', 'end'].map(id => `<div class="poz"><svg role="img" aria-label="${esc(`Rysunek ruchu: ${pl(E)}, ${id === 'start' ? L.ui.startPose : L.ui.endPose}`)}" viewBox="${POSE_VB}"><use href="../zasoby/back-squat.svg#${id}"/></svg><p class="podpis">${esc(id === 'start' ? L.ui.startPose : L.ui.endPose)}</p></div>`).join('')}</div>`;
const figControls = () => `<div class="fig-ster"><button type="button" class="b-anim" aria-pressed="true">${esc(L.ui.resume)}</button><span class="fig-bledy-t">Częste błędy:</span>${E.figure.errors.map(x => `<button type="button" class="b-blad" aria-pressed="false">${esc(x.text.replace(/\.$/, ''))}</button>`).join('')}</div>`;
const silhouette = () => `<div class="sylwetki ${levels.map((v, i) => v ? `s${i}-${v}` : '').filter(Boolean).join(' ')}" aria-hidden="true">${[['front', L.ui.front], ['back', L.ui.back]].map(([id, c]) => `<div><svg viewBox="0 0 120 260" focusable="false"><use href="../zasoby/sylwetka.svg#${id}"/></svg><p class="podpis">${esc(c)}</p></div>`).join('')}</div>`;
const ulist = a => `<ul>${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
const roles = () => `<ul class="role">${E.roles.map(r => `<li><strong>${esc(L.regions[r.id])}</strong> — ${esc(r.text)}</li>`).join('')}</ul>`;
const musclesText = () => `<p>${esc(L.ui.musclesMain.replace('{lista}', main.join(', ')))}</p><p>${esc(L.ui.musclesAux.replace('{lista}', aux.join(', ')))}</p>`;
const needs = () => `<ul>${E.requires.map(g => `<li>${esc(g.map(c => L.capabilities[c]).join(' / '))}</li>`).join('')}</ul>`;
const alts = () => `<ul class="zam">${E.alternatives.map(s => { const x = by.get(s); return `<li><a href="cwiczenie.html"><span class="nazwa-pl">${esc(pl(x))}</span> <span class="nazwa-en" lang="en">${esc(x.name)}</span></a></li>`; }).join('')}</ul>`;
const ramka = (k) => `<aside class="ramka" id="aplikacja" aria-labelledby="ramka-t">
<h2 id="ramka-t">W aplikacji ${APP}</h2>
<ul class="ramka-l">${RAMKA.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
<div class="plakietka" role="img" aria-label="Pobierz w App Store (miejsce na plakietkę)">plakietka App Store<br><span>grafika Apple, po nadaniu appStoreId</span></div>
</aside>`;
const answer = () => `<section class="odp" aria-labelledby="odp-t"><h2 id="odp-t">${esc(ANSWER_Q)}</h2><p>${esc(ANSWER)}</p></section>`;
const select = (lab, items, val) => `<label class="pole"><span>${esc(lab)}</span><select>${[`<option value="">${esc(ui.filterAll)}</option>`, ...items.map(x => `<option${x.lab === val ? ' selected' : ''}>${esc(x.lab)}</option>`)].join('')}</select></label>`;
const search = () => `<div class="szukaj"><label for="szukaj">${esc(ui.searchLabel)}</label><input id="szukaj" type="search" autocomplete="off" placeholder="${esc(ui.searchPlaceholder)}"></div>`;
const LIST_N = 24;

/* ---------- sygnatury kierunków ---------- */
// A: linia wymiarowa tempa (fazy figury z danymi czasu)
const wymiar = () => `<div class="wymiar" role="img" aria-label="${esc(`Tempo powtórzenia: ${phases.map(p => `${p.name} ${sec(p.ms)}`).join(', ')}; razem ${sec(total)}`)}">
<div class="wymiar-l">${phases.map(p => `<div class="wymiar-s t${p.ms / 100}"><span class="wymiar-v">${esc(sec(p.ms))}</span><span class="wymiar-n">${esc(p.name)}</span></div>`).join('')}</div>
<p class="wymiar-r">razem ${esc(sec(total))} na powtórzenie</p></div>`;
const tabliczka = () => `<dl class="tabliczka"><div><dt>Nazwa</dt><dd lang="en">${esc(E.name)}</dd></div><div><dt>Partia</dt><dd><a href="lista.html">${esc(grp)}</a></dd></div><div><dt>Sprzęt</dt><dd><a href="lista.html">${esc(eqp)}</a></dd></div><div><dt>Rodzaj ruchu</dt><dd><a href="lista.html">${esc(fam)}</a></dd></div></dl>`;
// B: legenda obciążenia mięśni (te same stopnie co sylwetka)
const legenda = () => `<div class="legenda"><p class="legenda-t">Legenda</p><ul>${[[4, 'główne', main], [2, 'pomocnicze', aux]].map(([l, t, a]) => `<li><span class="pole-l l${l}" aria-hidden="true"></span><span><strong>${t}</strong>: ${esc(a.join(', '))}</span></li>`).join('')}</ul></div>`;
// C: sygnatura katalogowa (partia / sprzęt / rodzaj ruchu, każda część to filtr)
const sygnatura = (e = E, links = true) => { const p = [L.groups[e.group], L.equipment[e.equipment], ui.families[e.family]]; return `<p class="sygn"><span class="sygn-t">Sygnatura</span> ${p.map(x => links ? `<a href="lista.html">${esc(x)}</a>` : `<span>${esc(x)}</span>`).join('<span class="sygn-k" aria-hidden="true">/</span>')}</p>`; };

/* ---------- ekrany ---------- */
function exercise(k) {
  const fig = `<figure class="fig">${poses()}${k === 'a' ? wymiar() : `<figcaption class="podpis">${esc(phases.map(p => `${p.name} ${sec(p.ms)}`).join(' · '))}</figcaption>`}${figControls()}<p class="podpis">${esc(L.ui.schematic)}</p></figure>`;
  const tech = `<section><h2>${esc(L.ui.setup)}</h2>${ulist(E.cues.setup)}</section><section><h2>${esc(L.ui.move)}</h2>${ulist(E.cues.move)}</section>`;
  const tips = `<section><h2>${esc(L.ui.tips)}</h2>${ulist(E.cues.tips)}</section><section><h2>${esc(L.ui.mistakes)}</h2>${ulist(E.cues.mistakes)}</section>`;
  const misc = `<section><h2>${esc(ui.equipmentNeeded)}</h2>${needs()}</section><section><h2>${esc(ui.alternatives)}</h2>${alts()}</section>`;
  const muscles = `<section class="miesnie"><h2>Mięśnie</h2>${k === 'b' ? `<div class="plansza-m">${silhouette()}${legenda()}</div>` : silhouette() + musclesText()}${roles()}</section>`;
  const cr = crumbs([[ui.home, 'glowna.html'], [ui.library, 'lista.html'], [grp, 'lista.html'], [pl(E), null]]);
  let body;
  if (k === 'a') body = `<div class="arkusz">${cr}<div class="arkusz-g">${names(E)}${tabliczka()}</div>${answer()}<div class="uk uk3">${fig}<div class="uk-p">${tech}${tips}${misc}</div>${muscles}</div>${ramka(k)}<p class="zastrz">${esc(L.ui.disclaimer)}</p></div>`;
  if (k === 'b') body = `${cr}<div class="plansza">${names(E)}${answer()}<div class="uk uk3">${fig}<div class="uk-p">${tech}${tips}${misc}${ramka(k)}</div>${muscles}</div><p class="zastrz">${esc(L.ui.disclaimer)}</p></div>`;
  if (k === 'c') body = `${cr}<article class="karta">${sygnatura()}${names(E)}${answer()}<div class="uk"><div class="uk-l">${fig}</div><div class="uk-p">${tech}${tips}</div></div><div class="uk uk2"><div class="uk-l">${muscles}</div><div class="uk-p">${misc}</div></div></article>${ramka(k)}<p class="zastrz">${esc(L.ui.disclaimer)}</p>`;
  return `${head(k, pl(E))}\n${header(k, -1)}\n<main id="tresc" class="tresc">${body}</main>\n${footer()}`;
}

function home(k) {
  const grid = (id, t, a) => `<section class="grupa" id="${id}"><h2>${esc(t)}</h2><ul class="grupa-l">${a.map(x => `<li><a href="lista.html"><span>${esc(x.lab)}</span> <span class="n">${x.n}</span></a></li>`).join('')}</ul></section>`;
  const bas = `<section class="podst"><h2>${esc(ui.basics)}</h2><ul class="wiersze">${basics.slice(0, 10).map(e => `<li><a href="cwiczenie.html"><span class="nazwa-pl">${esc(pl(e))}</span> <span class="nazwa-en" lang="en">${esc(e.name)}</span></a>${k === 'c' ? sygnatura(e, false) : `<span class="meta">${esc(L.groups[e.group])} · ${esc(L.equipment[e.equipment])}</span>`}</li>`).join('')}</ul><p><a class="dalej" href="lista.html">${esc(ui.allExercises)} (${ex.length})</a></p></section>`;
  const intro = `<div class="wstep"><h1>${esc(ui.siteName)}</h1><p class="licznik">${esc(ui.countLine.many.replace('{n}', ex.length))}</p>${search()}</div>`;
  return `${head(k, ui.siteName)}\n${header(k, -1)}\n<main id="tresc" class="tresc glowna">${intro}<div class="grupy">${grid('partie', ui.byMuscle, groupsCount)}${grid('sprzet', ui.byEquipment, eqCount)}</div>${grid('ruch', ui.byMovement, famCount)}${bas}</main>\n${footer()}`;
}

function list(k) {
  const items = legsList.slice(0, LIST_N);
  const letters = [...new Set(legsList.map(e => pl(e)[0].toUpperCase()))];
  const filt = `<div class="filtry" role="group" aria-label="Filtry">${select(ui.filterMuscle, groupsCount, 'nogi')}${select(ui.filterEquipment, eqCount, '')}${select(ui.filterMovement, famCount, '')}<button type="button" class="wyczysc">${esc(ui.clearFilters)}</button></div>`;
  const count = `<p class="wynik" aria-live="polite"><strong>${legsList.length}</strong> z ${ex.length} ćwiczeń · partia: nogi</p>`;
  const row = e => `<li><a href="cwiczenie.html"><span class="nazwa-pl">${esc(pl(e))}</span> <span class="nazwa-en" lang="en">${esc(e.name)}</span></a>${k === 'c' ? sygnatura(e, false) : k === 'a' ? '' : `<span class="meta">${esc(L.equipment[e.equipment])} · ${esc(ui.families[e.family] ?? '')}</span>`}</li>`;
  let lst;
  if (k === 'a') lst = `<table class="wykaz"><caption class="wizualnie-ukryte">Ćwiczenia: nogi</caption><thead><tr><th scope="col">Nazwa</th><th scope="col">Sprzęt</th><th scope="col">Rodzaj ruchu</th></tr></thead><tbody>${items.map(e => `<tr><th scope="row"><a href="cwiczenie.html"><span class="nazwa-pl">${esc(pl(e))}</span> <span class="nazwa-en" lang="en">${esc(e.name)}</span></a></th><td>${esc(L.equipment[e.equipment])}</td><td>${esc(ui.families[e.family] ?? '')}</td></tr>`).join('')}</tbody></table>`;
  else if (k === 'c') { const g = {}; for (const e of items) (g[pl(e)[0].toUpperCase()] ??= []).push(e); lst = `<nav class="litery" aria-label="Litery">${letters.map(l => `<a href="#l-${l}">${l}</a>`).join('')}</nav>${Object.entries(g).map(([l, a]) => `<section class="przewodnik" id="l-${l}"><h2 class="litera">${l}</h2><ul class="wiersze">${a.map(row).join('')}</ul></section>`).join('')}`; }
  else lst = `<ul class="wiersze">${items.map(row).join('')}</ul>`;
  const more = `<p class="dalej-w">Pokazano ${LIST_N} z ${legsList.length} (fragment makiety)</p>`;
  const cr = crumbs([[ui.home, 'glowna.html'], [ui.allExercises, null]]);
  return `${head(k, ui.allExercises)}\n${header(k, 0)}\n<main id="tresc" class="tresc lista">${cr}<h1>${esc(ui.allExercises)}</h1>${search()}${filt}${count}${lst}${more}</main>\n${footer()}`;
}

for (const k of ['a', 'b', 'c']) {
  const dir = join(HERE, { a: 'a-arkusz', b: 'b-plansza', c: 'c-karta' }[k]); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'fonty.css'), fontFaces(k));
  writeFileSync(join(dir, 'cwiczenie.html'), exercise(k)); writeFileSync(join(dir, 'glowna.html'), home(k)); writeFileSync(join(dir, 'lista.html'), list(k));
}
console.log('makiety: 3 kierunki × 3 ekrany');
