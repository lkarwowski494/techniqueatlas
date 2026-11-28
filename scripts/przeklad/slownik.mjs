// Słowniki terminów w promptach i kontroli odpowiedzi:
//  1) słownik aplikacji (docs/lokalizacja/slownik-terminow.json w repo aplikacji; `npm run dane` kopiuje go do .cache/dane/) — terminy treningowe, wzorce zakazane;
//  2) słownik strony (docs/slownik-strony.json) — nazwy rodzin ruchów (klucze src/ui) z terminem zalecanym i zakazanymi wzorcami.
// Logika (wykrywaj/wyklucz/zakazane) jak w scripts/i18n/slownik.cjs repo aplikacji.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const PLIK_APLIKACJI = '.cache/dane/slownik-terminow.json';
export const PLIK_STRONY = 'docs/slownik-strony.json';
const re = (s) => new RegExp(s, 'iu');

/** Brak słownika aplikacji = błąd głośny (zasada 21): bez niego przekład traci wymagane terminy. */
export function wczytaj(root) {
  const a = join(root, PLIK_APLIKACJI);
  if (!existsSync(a)) throw new Error(`brak słownika terminów aplikacji: ${PLIK_APLIKACJI} (uruchom: npm run dane)`);
  const s = join(root, PLIK_STRONY);
  return { aplikacji: JSON.parse(readFileSync(a, 'utf8')), strony: existsSync(s) ? JSON.parse(readFileSync(s, 'utf8')) : { pojecia: [] } };
}

const wykryte = (p, pl) => re(p.wykrywaj).test(pl) && !(p.wyklucz && re(p.wyklucz).test(pl));

/** Naruszenia słownika aplikacji w tłumaczeniu: [{ pojecie, wzorzec, powod }]. */
export function sprawdz(slownik, kod, pl, tlumaczenie) {
  const w = [];
  for (const p of slownik?.aplikacji?.pojecia ?? []) {
    const zak = p.jezyki?.[kod]?.zakazane; if (!zak?.length || !wykryte(p, pl)) continue;
    for (const z of zak) if (re(z.wzorzec).test(tlumaczenie)) w.push({ pojecie: p.id, wzorzec: z.wzorzec, powod: z.powod });
  }
  return w;
}

const czysc = (w) => String(w).replace(/\(\?<!\\p\{L\}\)|\(\?!\\p\{L\}\)|\\b/g, '');
/** Blok promptu: wpisy języka docelowego z obu słowników; pusty, gdy brak wpisów. */
export function blokPromptu(slownik, kod) {
  const L = [];
  for (const p of slownik?.aplikacji?.pojecia ?? []) {
    const e = p.jezyki?.[kod]; if (!e) continue;
    let s = `- ${p.pl} (${p.znaczenie}) → ${e.zalecany}`;
    if (e.zakazane?.length) s += `; NIE używaj: ${e.zakazane.map((z) => `„${czysc(z.wzorzec)}” (${z.powod})`).join('; ')}`;
    L.push(s);
  }
  const S = [];
  for (const p of slownik?.strony?.pojecia ?? []) {
    const e = p.jezyki?.[kod]; if (!e) continue;
    let s = `- ${(Array.isArray(p.klucz) ? p.klucz : [p.klucz]).join(', ')} → ${e.zalecany}`;
    if (e.zakazane?.length) s += `; NIE używaj: ${e.zakazane.map((z) => `„${czysc(z)}”`).join('; ')}`;
    S.push(s);
  }
  const out = [];
  if (L.length) out.push('Słownik terminów treningowych (obowiązkowy; teksty mają brzmieć naturalnie, jak mówi trener albo kolega na siłowni w tym języku, nie jak podręcznik; odmieniaj termin według gramatyki):', ...L);
  if (S.length) out.push('Terminy strony (obowiązkowe; klucz = miejsce użycia):', ...S);
  return out.join('\n');
}
