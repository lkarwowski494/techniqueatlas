// Strażnicy warunków startu strony (docs/54 pkt 12): S3 znaki towarowe nazw, S4 wersja danych, S6 komplet figur. Czyste funkcje: dane → { errors, warnings }.
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

/** S6 warunek startu: każde ćwiczenie ma figurę v2 (709/709) albo wyjątek z powodem w start-wyjatki.json; wyjątek dla ćwiczenia z figurą lub nieznanego id to błąd (nieaktualny). */
export function checkStartCondition({ exercises, exceptions = {}, indexing }) {
  const errors = [], warnings = [], ids = new Set(exercises.map(e => e.id));
  const missing = exercises.filter(e => !e.figure && !(typeof exceptions[e.id] === 'string' && exceptions[e.id].trim())).map(e => e.id);
  const withFigure = exercises.filter(e => e.figure).length;
  if (missing.length) verdict(indexing, errors, warnings, `S6 warunek startu: figury ma ${withFigure} z ${exercises.length} ćwiczeń; brak figury i wyjątku z powodem: ${missing.length} (${sample(missing)})`);
  for (const [id, why] of Object.entries(exceptions)) {
    if (!ids.has(id)) verdict(indexing, errors, warnings, `S6 warunek startu: wyjątek dla nieznanego ćwiczenia „${id}”`);
    else if (exercises.find(e => e.id === id).figure) verdict(indexing, errors, warnings, `S6 warunek startu: wyjątek dla „${id}” jest zbędny — ćwiczenie ma figurę`);
    else if (!String(why).trim()) verdict(indexing, errors, warnings, `S6 warunek startu: wyjątek dla „${id}” bez powodu`);
  }
  return { errors, warnings, info: `figury: ${withFigure}/${exercises.length}` };
}

const optional = rel => existsSync(join(ROOT, rel)) ? JSON.parse(readFileSync(join(ROOT, rel), 'utf8')) : {};
/** Wszystkie trzy strażniki dla budowania: `data` per język, `langs` budowane języki. Pliki ustawień czytane stąd, chyba że podane (test). */
export function startGuards({ cfg, pin, manifest, data, langs, files = {} }) {
  const indexing = !!cfg.indeksowanie;
  const checked = files.trademark ?? optional('trademark-check.json').nazwy, exceptions = files.wyjatki ?? optional('start-wyjatki.json').wyjatki;
  const names = langs.flatMap(l => data[l].exercises.map(e => e.name));
  const parts = [checkTrademarks({ names, checked, indexing }), checkVersion({ manifestVersion: manifest.app.version, releaseVersion: cfg.wersjaWydania, pinRef: pin.ref, indexing }),
    checkStartCondition({ exercises: data[langs[0]].exercises, exceptions, indexing })];
  return { errors: parts.flatMap(p => p.errors), warnings: parts.flatMap(p => p.warnings), info: parts[2].info };
}
