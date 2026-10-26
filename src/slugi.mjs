// Adresy ćwiczeń (docs/54 pkt 4): zamrożenie w slugs.lock.json (klucz katalogu → slug), ręczne nadpisania i przekierowania w slug-overrides.json.
// Slug liczy eksport aplikacji z angielskiej nazwy, więc zmiana nazwy w aplikacji zmieniłaby adres. Dwie drogi: zachować stary adres (nadpisania: id → slug) albo przenieść świadomie
// (przekierowania: stary slug → id nowego adresu albo "lista"); bez jednego z nich build się zatrzymuje. Czyste funkcje (bez plików) — build i test podają dane.
// Plik zamrożenia powstaje przy pierwszej publikacji (`npm run slugi`); przy indeksowanie=true pusty lub niepełny jest błędem, przy false ostrzeżeniem.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readJson } from './lib.mjs';

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX = 80;
const LIST = 'lista';

/** Nadpisania sluga: id → slug z tabeli. Zwraca mapę id → slug po nadpisaniach (kolizje i niepoprawne wpisy to błędy). */
export function effectiveSlugs(exercises, overrides = {}) {
  const ids = new Set(exercises.map(e => e.id)), errors = [], out = new Map(exercises.map(e => [e.id, e.slug]));
  for (const [id, slug] of Object.entries(overrides)) {
    if (!ids.has(id)) { errors.push(`slug-overrides: nadpisanie dla nieistniejącego ćwiczenia „${id}”`); continue; }
    if (!SLUG_RE.test(slug) || slug.length > SLUG_MAX) { errors.push(`slug-overrides: „${slug}” (${id}) nie spełnia reguły adresu (a-z, 0-9, „-”, ≤ ${SLUG_MAX} znaków)`); continue; }
    out.set(id, slug);
  }
  const seen = new Map();
  for (const [id, slug] of out) { if (seen.has(slug)) errors.push(`kolizja adresów: „${slug}” ma ${seen.get(slug)} i ${id} — rozstrzygnij w slug-overrides.json (nadpisania)`); else seen.set(slug, id); }
  return { slugs: out, errors };
}

/**
 * Sprawdza zamrożenie adresów. `current`: Map id → slug (po nadpisaniach); `lock`: { id: slug }; `redirects`: { staryslug: id | "lista" }; `indexing`: config.indeksowanie.
 * Zwraca { errors, warnings, redirects: [{ from, to: slug | null }] } — `to` null = lista ćwiczeń (ćwiczenie usunięte).
 */
export function checkSlugLock({ current, lock = {}, redirects = {}, indexing = false }) {
  const errors = [], warnings = [], live = new Set(current.values()), idBySlug = new Map([...current].map(([id, s]) => [s, id]));
  const frozen = Object.keys(lock).length;
  if (!frozen) (indexing ? errors : warnings).push('slugs.lock.json jest pusty: adresy nie są zamrożone — przed pierwszą publikacją uruchom npm run slugi');
  for (const [id, old] of Object.entries(lock)) {
    const now = current.get(id);
    if (now === undefined) { if (!(old in redirects)) errors.push(`ćwiczenie „${id}” (adres ${old}) zniknęło z danych bez przekierowania — dopisz w slug-overrides.json przekierowania: "${old}": "lista" (albo id ćwiczenia zastępczego)`); }
    else if (now !== old && redirects[old] !== id) errors.push(`adres ćwiczenia „${id}” zmienił się z ${old} na ${now} bez przekierowania — zachowaj stary (slug-overrides.json, nadpisania: "${id}": "${old}") albo dopisz przekierowania: "${old}": "${id}"`);
  }
  for (const [id, slug] of current) if (frozen && !(id in lock)) (indexing ? errors : warnings).push(`ćwiczenie „${id}” (${slug}) nie ma zamrożonego adresu — uruchom npm run slugi`);
  const out = [];
  for (const [from, to] of Object.entries(redirects)) {
    if (!SLUG_RE.test(from)) { errors.push(`przekierowanie: „${from}” nie jest poprawnym adresem`); continue; }
    if (live.has(from)) { errors.push(`przekierowanie z „${from}” zasłania żywą stronę ćwiczenia ${idBySlug.get(from)}`); continue; }
    if (to === LIST) { out.push({ from, to: null }); continue; }
    if (!current.has(to)) { errors.push(`przekierowanie z „${from}”: cel „${to}” nie jest ćwiczeniem (ani „${LIST}”)`); continue; }
    out.push({ from, to: current.get(to) });
  }
  return { errors, warnings, redirects: out };
}

/** Nowy plik zamrożenia: dotychczasowe wpisy zostają (także usuniętych ćwiczeń), nowe dochodzą, zmienione adresy aktualizują się TYLKO z wpisem przekierowania (inaczej błąd — nic nie jest zapisane). */
export function freeze({ current, lock = {}, redirects = {} }) {
  const next = { ...lock }, errors = [];
  for (const [id, slug] of current) {
    if (!(id in lock) || lock[id] === slug) next[id] = slug;
    else if (redirects[lock[id]] === id) next[id] = slug;
    else errors.push(`adres „${id}” zmienił się z ${lock[id]} na ${slug} bez przekierowania`);
  }
  return { lock: Object.fromEntries(Object.entries(next).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)), errors };
}

/** Stosuje nadpisania do danych strony: slug w ćwiczeniach i zamiennikach (wszystkie języki), klucze figur i stopni sylwetki. Zwraca nowe obiekty (wejście bez zmian). */
export function remapSlugs({ data, figs, sil }, map /* stary slug → nowy */) {
  if (![...map].some(([a, b]) => a !== b)) return { data, figs, sil };
  const m = s => map.get(s) ?? s, rekey = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [m(k), v]));
  const nd = Object.fromEntries(Object.entries(data).map(([l, d]) => [l, { ...d, exercises: d.exercises.map(e => ({ ...e, slug: m(e.slug), alternatives: e.alternatives.map(m) })) }]));
  return { data: nd, figs: rekey(figs), sil: { ...sil, levels: rekey(sil.levels) } };
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const man = readJson('.cache/dane/manifest.json'), en = readJson(`.cache/dane/${man.languages.find(l => l.lang === 'en').file}`);
  const ov = readJson('slug-overrides.json'), lockFile = readJson('slugs.lock.json');
  const eff = effectiveSlugs(en.exercises, ov.nadpisania); if (eff.errors.length) { console.error(eff.errors.join('\n')); process.exit(1); }
  const r = freeze({ current: eff.slugs, lock: lockFile.slugi, redirects: ov.przekierowania });
  if (r.errors.length) { console.error(r.errors.join('\n')); process.exit(1); }
  writeFileSync(join(ROOT, 'slugs.lock.json'), JSON.stringify({ _opis: lockFile._opis, slugi: r.lock }, null, 1) + '\n');
  console.log(`slugs.lock.json: ${Object.keys(r.lock).length} adresów (${Object.keys(r.lock).length - Object.keys(lockFile.slugi).length} nowych)`);
}
