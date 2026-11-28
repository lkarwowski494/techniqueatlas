// Strażnicy warunków startu strony (docs/54 pkt 12): S3 znaki towarowe nazw (od 27.11.2026 tylko status „ryzyko”, ZM-20), S4 wersja danych, S6 reguła indeksowania ćwiczeń (ZM-06, od 27.11.2026 P-1), S8 start indeksowania, S11 plan startu (docs/55). Czyste funkcje: dane → { errors, warnings }.
// Zasada wspólna: przy config.indeksowanie=true każde naruszenie przerywa build (błąd); przy false to tylko ostrzeżenie — strona przed startem z wersją 1.1 ma być budowalna,
// ale nie może zostać upubliczniona (włączenie indeksowania) z lukami. Bez zapytań sieciowych (sprawdzenie wersji w App Store po ID to osobny krok wydania, nie test).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';
import { parsePlan, checkPlanStartu } from './plan-startu.mjs';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TAG = /^v(\d+\.\d+\.\d+)(?:-[0-9A-Za-z.]+)?$/;
const sample = (xs, n = 5) => xs.slice(0, n).join(', ') + (xs.length > n ? `, … (+${xs.length - n})` : '');
const verdict = (indexing, errors, warnings, msg) => (indexing ? errors : warnings).push(msg);

/**
 * S3 znaki towarowe (R-016) — WYŁĄCZONY przez właściciela 27.11.2026 (KO-128, ZM-20): o sprawdzaniu znaków towarowych nazw ćwiczeń właściciel powiedział „Nie robimy tego.”
 * Brak wpisu w trademark-check.json (ani status „do-sprawdzenia”, zła data) nie blokuje indeksowania i nie daje ostrzeżenia. Zostaje jedna blokada: wpisany status „ryzyko”
 * (ktoś znalazł kolidujące zgłoszenie — nazwa do zmiany); zapis „przez analogię do weta”, do cofnięcia słowami właściciela. Poprzednio: każda nazwa wymagała wpisu „sprawdzone” z datą.
 */
export function checkTrademarks({ names, checked = {}, indexing }) {
  const errors = [], warnings = [], risky = new Set();
  for (const n of new Set(names)) if (checked[n]?.status === 'ryzyko') risky.add(n);
  if (risky.size) verdict(indexing, errors, warnings, `S3 znaki towarowe: ${risky.size} nazw ze statusem „ryzyko” (${sample([...risky])}) — zmień nazwę albo zamknij ryzyko`);
  return { errors, warnings };
}

/** S4 wersja: manifest.app.version równa wersji wydania z config.json (wersjaWydania), a dane pochodzą z tagu tej wersji (PIN.json → ref `v<wersja>…`). */
export function checkVersion({ manifestVersion, releaseVersion = '', pinRef = '', indexing }) {
  const errors = [], warnings = [];
  if (!releaseVersion) { verdict(indexing, errors, warnings, 'S4 wersja: config.json → wersjaWydania jest puste (wersja aplikacji, z której pochodzi strona)'); return { errors, warnings }; }
  if (manifestVersion !== releaseVersion) verdict(indexing, errors, warnings, `S4 wersja: dane są z wersji aplikacji ${manifestVersion}, a config.json → wersjaWydania to ${releaseVersion}`);
  const tag = TAG.exec(pinRef);
  if (indexing && (!tag || tag[1] !== releaseVersion)) errors.push(`S4 wersja: PIN.json → ref „${pinRef}” nie jest tagiem wydania v${releaseVersion} (strona publikuje tylko dane z tagu wydania)`);
  return { errors, warnings };
}

/** S6 warunek indeksowania (ZM-08, decyzja właściciela 27.11.2026, P-1 „310: wszystkie z własnym tekstem”; odwraca ZM-06 z 02.11.2026): do indeksu idzie ćwiczenie z własnymi wskazówkami
 *  kompletnymi w języku strony (`cues.scope === 'own'`, `cues.missing` = 0); pełna karta (`pelna`, F-20) nie jest wymagana. Sprawdza ZBUDOWANE strony, niezależnie od reguły w pages.mjs:
 *  strona ćwiczenia jest indeksowana, gdy ma flagę `indexable` ALBO jej HTML nie ma `noindex` w meta robots. Naruszenie przy indeksowaniu przerywa build (bez trybu pominięcia —
 *  reguła musi trzymać na każdych danych). */
export function checkIndexingRule({ pages, data, indexing }) {
  const errors = [], warnings = [], bad = [];
  const robots = html => /<meta name="robots" content="([^"]*)">/.exec(html ?? '')?.[1] ?? '';
  let indexed = 0;
  for (const p of pages) {
    if (p.kind !== 'exercise') continue;
    if (!p.indexable && /(^|,)\s*noindex\s*(,|$)/.test(robots(p.html))) continue;
    indexed++;
    const ex = data[p.lang]?.exercises.find(e => e.slug === p.slug);
    if (!(ex && ex.cues?.scope === 'own' && !ex.cues.missing)) bad.push(`${p.lang}/${p.slug}`);
  }
  if (bad.length) verdict(indexing, errors, warnings, `S6 warunek indeksowania: ${bad.length} stron ćwiczeń indeksowanych bez własnych wskazówek kompletnych w języku (${sample(bad)})`);
  return { errors, warnings, info: `indeksowane ćwiczenia: ${indexed - bad.length}` };
}

/** S8 start indeksowania: przy indeksowanie=true config.json → indeksowanieOd (RRRR-MM-DD) musi być ustawione — od tej daty liczy się minimum trzymania przekierowań (slugi.mjs → REDIRECT_MIN_DAYS). Przed startem nic do sprawdzenia. */
export function checkIndexingStart({ indexing, from }) {
  const errors = indexing && !/^\d{4}-\d{2}-\d{2}$/.test(from ?? '') ? ['S8 start indeksowania: indeksowanie=true wymaga config.json → indeksowanieOd (RRRR-MM-DD) — od niej liczy się minimum 365 dni trzymania przekierowań'] : [];
  return { errors, warnings: [] };
}
const optional = rel => existsSync(join(ROOT, rel)) ? JSON.parse(readFileSync(join(ROOT, rel), 'utf8')) : {};
/** S11 plan startu (Z-00): docs/55-plan-startu.md — przy indeksowanie=true wszystkie zadania etapów 0–5 „zrobione” albo „odpada” z datą i dowodem (etap 6 po włączeniu Google nie blokuje); błędy formatu zawsze błędem. */
export function checkPlan({ text, indexing }) {
  const p = parsePlan(text), c = checkPlanStartu({ rows: p.rows, indexing });
  return { errors: [...p.errors, ...c.errors], warnings: c.warnings };
}
const optionalText = rel => existsSync(join(ROOT, rel)) ? readFileSync(join(ROOT, rel), 'utf8') : '';
/** Strażniki przed budowaniem stron (S3, S4, S8, S11): `data` per język, `langs` budowane języki. Pliki ustawień czytane stąd, chyba że podane (test). S6 działa na zbudowanych stronach (build.mjs). */
export function startGuards({ cfg, pin, manifest, data, langs, files = {} }) {
  const indexing = !!cfg.indeksowanie;
  const checked = files.trademark ?? optional('trademark-check.json').nazwy;
  const names = langs.flatMap(l => data[l].exercises.map(e => e.name));
  const parts = [checkTrademarks({ names, checked, indexing }), checkVersion({ manifestVersion: manifest.app.version, releaseVersion: cfg.wersjaWydania, pinRef: pin.ref, indexing }),
    checkIndexingStart({ indexing, from: cfg.indeksowanieOd }), checkPlan({ text: files.plan ?? optionalText('docs/55-plan-startu.md'), indexing })];
  return { errors: parts.flatMap(p => p.errors), warnings: parts.flatMap(p => p.warnings) };
}

/**
 * S12 wstawka stron prawnych: {{dataObowiazywania}} musi być wypełniona przy indeksowaniu (BR, 28.11.2026: administrator i kontakt wpisane wprost, bez wstawek);
 * przed startem to ostrzeżenie (strona pokazuje jawny tekst zastępczy).
 */
export function checkPrawne({ wartosci, indexing }) {
  const errors = [], warnings = [], brak = ['dataObowiazywania'].filter(k => !String(wartosci[k] ?? '').trim());
  if (brak.length) verdict(indexing, errors, warnings, `S12 strony prawne: brak wartości wstawek ${brak.map(k => `{{${k}}}`).join(', ')} (config.json → dataObowiazywania)`);
  return { errors, warnings };
}

/**
 * S13 ramka „w aplikacji”: zdania na stronach (src/ui/<pl|en>.json → ramka, wsparcie) są zdaniami z docs/teksty/ramka-w-aplikacji.md, a dokument był sprawdzony dla wersji
 * równej config.json → wersjaWydania (zdania o funkcjach aplikacji są prawdziwe tylko dla wydanej wersji; po zmianie wersji trzeba je sprawdzić ponownie).
 */
export function checkRamka({ doc, ui, wersjaWydania, indexing }) {
  const errors = [], warnings = [];
  if (doc.wersja !== wersjaWydania) verdict(indexing, errors, warnings, `S13 ramka: zdania sprawdzono dla wersji ${doc.wersja || '(brak wpisu)'}, a config.json → wersjaWydania to ${wersjaWydania} — sprawdź zdania ramki z kodem tej wersji i zaktualizuj docs/teksty/ramka-w-aplikacji.md`);
  for (const l of ['pl', 'en']) {
    const r = ui[l]?.ramka ?? {}, w = ui[l]?.wsparcie ?? {};
    const zle = [...doc.zdania[l].map((z, i) => [`ramka.z${i + 1}`, r[`z${i + 1}`], z]), ...doc.wsparcie[l].map((z, i) => [`wsparcie.w${i + 1}`, w[`w${i + 1}`], z])].filter(([, a, b]) => a !== b).map(([k]) => k);
    if (zle.length || doc.zdania[l].length !== 8 || doc.wsparcie[l].length !== 3) errors.push(`S13 ramka: src/ui/${l}.json (${zle.join(', ') || 'liczba zdań'}) różni się od docs/teksty/ramka-w-aplikacji.md`);
  }
  return { errors, warnings };
}
