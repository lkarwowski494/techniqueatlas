// Strażnicy warunków startu strony (docs/54 pkt 12): S3 znaki towarowe nazw, S4 wersja danych, S6 reguła indeksowania ćwiczeń (ZM-06), S8 start indeksowania. Czyste funkcje: dane → { errors, warnings }.
// Zasada wspólna: przy config.indeksowanie=true każde naruszenie przerywa build (błąd); przy false to tylko ostrzeżenie — strona przed startem z wersją 1.1 ma być budowalna,
// ale nie może zostać upubliczniona (włączenie indeksowania) z lukami. Bez zapytań sieciowych (sprawdzenie wersji w App Store po ID to osobny krok wydania, nie test).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TAG = /^v(\d+\.\d+\.\d+)(?:-[0-9A-Za-z.]+)?$/;
const sample = (xs, n = 5) => xs.slice(0, n).join(', ') + (xs.length > n ? `, … (+${xs.length - n})` : '');
const verdict = (indexing, errors, warnings, msg) => (indexing ? errors : warnings).push(msg);

/**
 * S3 znaki towarowe (R-016): każda nazwa ćwiczenia widoczna na stronie ma w trademark-check.json wpis { status: "sprawdzone", data: "RRRR-MM-DD" }.
 * Statusy: "sprawdzone" (zamknięte), "ryzyko" (znalezione kolidujące zgłoszenie — nazwa do zmiany), "do-sprawdzenia" (jak brak).
 */
export function checkTrademarks({ names, checked = {}, indexing }) {
  const errors = [], warnings = [], bad = new Set(), risky = new Set();
  for (const n of new Set(names)) {
    const e = checked[n];
    if (e?.status === 'ryzyko') risky.add(n);
    else if (e?.status !== 'sprawdzone' || !ISO_DATE.test(e?.data ?? '')) bad.add(n);
  }
  if (risky.size) verdict(indexing, errors, warnings, `S3 znaki towarowe: ${risky.size} nazw ze statusem „ryzyko” (${sample([...risky])}) — zmień nazwę albo zamknij ryzyko`);
  if (bad.size) verdict(indexing, errors, warnings, `S3 znaki towarowe: ${bad.size} nazw bez statusu „sprawdzone” z datą w trademark-check.json (${sample([...bad])})`);
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

/** S6 warunek indeksowania (ZM-06, decyzja właściciela 02.11.2026, bramka E1 wariant A; zastępuje „figura v2 dla 709/709”, ZM-02): do indeksu idzie tylko ćwiczenie z pełną kartą
 *  (`pelna === true` z eksportu aplikacji, F-20) i własnymi wskazówkami kompletnymi w języku strony. Sprawdza ZBUDOWANE strony, niezależnie od reguły w pages.mjs: strona ćwiczenia jest
 *  indeksowana, gdy ma flagę `indexable` ALBO jej HTML nie ma `noindex` w meta robots. Naruszenie przy indeksowaniu przerywa build (bez trybu pominięcia — reguła musi trzymać na każdych danych).
 *  `startCondition` (domyślnie tak): eksport bez pola `pelna` w żadnym ćwiczeniu (PIN sprzed F-20) — błąd przy indeksowaniu, ostrzeżenie bez; testy na danych sprzed wydania mogą go wyłączyć. */
export function checkIndexingRule({ pages, data, indexing, startCondition = true }) {
  const errors = [], warnings = [], bad = [];
  const robots = html => /<meta name="robots" content="([^"]*)">/.exec(html ?? '')?.[1] ?? '';
  let indexed = 0;
  for (const p of pages) {
    if (p.kind !== 'exercise') continue;
    if (!p.indexable && /(^|,)\s*noindex\s*(,|$)/.test(robots(p.html))) continue;
    indexed++;
    const ex = data[p.lang]?.exercises.find(e => e.slug === p.slug);
    if (!(ex && ex.pelna === true && ex.cues?.scope === 'own' && !ex.cues.missing)) bad.push(`${p.lang}/${p.slug}`);
  }
  if (bad.length) verdict(indexing, errors, warnings, `S6 warunek indeksowania: ${bad.length} stron ćwiczeń indeksowanych bez pełnej karty (pelna === true) i własnych wskazówek (${sample(bad)})`);
  const all = Object.values(data).flatMap(d => d.exercises);
  if (startCondition && all.length && !all.some(e => Object.prototype.hasOwnProperty.call(e, 'pelna'))) verdict(indexing, errors, warnings, 'S6 warunek indeksowania: eksport bez pola „pelna” (PIN sprzed F-20) — żadne ćwiczenie nie trafi do indeksu; przepnij PIN na commit aplikacji z polem');
  return { errors, warnings, info: `indeksowane ćwiczenia: ${indexed - bad.length}` };
}

/** S8 start indeksowania: przy indeksowanie=true config.json → indeksowanieOd (RRRR-MM-DD) musi być ustawione — od tej daty liczy się minimum trzymania przekierowań (slugi.mjs → REDIRECT_MIN_DAYS). Przed startem nic do sprawdzenia. */
export function checkIndexingStart({ indexing, from }) {
  const errors = indexing && !/^\d{4}-\d{2}-\d{2}$/.test(from ?? '') ? ['S8 start indeksowania: indeksowanie=true wymaga config.json → indeksowanieOd (RRRR-MM-DD) — od niej liczy się minimum 365 dni trzymania przekierowań'] : [];
  return { errors, warnings: [] };
}
const optional = rel => existsSync(join(ROOT, rel)) ? JSON.parse(readFileSync(join(ROOT, rel), 'utf8')) : {};
/** Strażniki przed budowaniem stron (S3, S4, S8): `data` per język, `langs` budowane języki. Pliki ustawień czytane stąd, chyba że podane (test). S6 działa na zbudowanych stronach (build.mjs). */
export function startGuards({ cfg, pin, manifest, data, langs, files = {} }) {
  const indexing = !!cfg.indeksowanie;
  const checked = files.trademark ?? optional('trademark-check.json').nazwy;
  const names = langs.flatMap(l => data[l].exercises.map(e => e.name));
  const parts = [checkTrademarks({ names, checked, indexing }), checkVersion({ manifestVersion: manifest.app.version, releaseVersion: cfg.wersjaWydania, pinRef: pin.ref, indexing }),
    checkIndexingStart({ indexing, from: cfg.indeksowanieOd })];
  return { errors: parts.flatMap(p => p.errors), warnings: parts.flatMap(p => p.warnings) };
}
