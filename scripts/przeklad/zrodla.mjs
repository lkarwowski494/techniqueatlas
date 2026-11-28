// Źródła tekstów do przekładu, opisane w docs/przeklad/zrodla.json. Trzy rodzaje:
//  - „mapa”: plik JSON polski (i opcjonalnie angielski) o kluczach tekstowych, także zagnieżdżonych (klucze z „_” na początku są opisami roboczymi i nie są tłumaczone);
//    en: plik angielski o tej samej strukturze albo „en_z_klucza”: true (klucz mapy jest angielską nazwą, jak w docs/nazwy/pl.json);
//  - „dokumenty”: katalog plików Markdown <nazwa>.pl.md (+ opcjonalnie <nazwa>.en.md); jedna pozycja = jeden dokument; README.md i inne pliki bez końcówki pl są pomijane.
// Wynik: [{ id, rodzaj, opis, cel, pozycje: [{ id, klucz, sciezka, pl, en }] }]; id pozycji numerowane od 1 w obrębie źródła.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const PLIK_ZRODEL = 'docs/przeklad/zrodla.json';
const ID = /^[a-z0-9]+$/;
const czytaj = (p) => JSON.parse(readFileSync(p, 'utf8'));

/** Liście tekstowe drzewa JSON w kolejności pliku: [{ sciezka: [..], tekst }]; klucze zaczynające się od „_” pomijane, wartości nietekstowe też. */
export function liscie(obj, sciezka = []) {
  const out = [];
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (k.startsWith('_')) continue;
    if (typeof v === 'string') { if (v.trim()) out.push({ sciezka: [...sciezka, k], tekst: v }); }
    else if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...liscie(v, [...sciezka, k]));
  }
  return out;
}
export const pobierz = (obj, sciezka) => sciezka.reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);
/** Ustawia liść na ścieżce (tworzy pośrednie obiekty). */
export function ustaw(obj, sciezka, wartosc) {
  let o = obj; for (const k of sciezka.slice(0, -1)) { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }
  o[sciezka.at(-1)] = wartosc;
}

function plikiZrodla(root, z) {
  const wymagany = (p) => { if (!existsSync(join(root, p))) throw new Error(`źródło „${z.id}”: brak pliku ${p}`); return join(root, p); };
  if (z.rodzaj === 'mapa') {
    const pl = czytaj(wymagany(z.pl)); const en = z.en ? czytaj(wymagany(z.en)) : null;
    return liscie(pl).map((l, i) => ({ id: i + 1, klucz: l.sciezka.join('.'), sciezka: l.sciezka, pl: l.tekst, en: z.en_z_klucza ? l.sciezka.at(-1) : (en ? pobierz(en, l.sciezka) ?? null : null) }));
  }
  if (z.rodzaj === 'dokumenty') {
    const dir = join(root, z.katalog); if (!existsSync(dir)) throw new Error(`źródło „${z.id}”: brak katalogu ${z.katalog}`);
    return readdirSync(dir).filter((f) => f.endsWith(z.koncowka_pl)).sort().map((f, i) => {
      const nazwa = f.slice(0, -z.koncowka_pl.length); const en = join(dir, `${nazwa}${z.koncowka_en}`);
      return { id: i + 1, klucz: nazwa, sciezka: [nazwa], pl: readFileSync(join(dir, f), 'utf8'), en: existsSync(en) ? readFileSync(en, 'utf8') : null };
    });
  }
  throw new Error(`źródło „${z.id}”: nieznany rodzaj „${z.rodzaj}” (mapa | dokumenty)`);
}

/** Wszystkie źródła z konfiguracji; `tylko` = lista id do wybrania (puste = wszystkie). */
export function wczytajZrodla(root, tylko = []) {
  const p = join(root, PLIK_ZRODEL);
  if (!existsSync(p)) throw new Error(`brak konfiguracji źródeł: ${PLIK_ZRODEL}`);
  const k = czytaj(p); if (!Array.isArray(k.zrodla)) throw new Error(`${PLIK_ZRODEL}: oczekiwane pole „zrodla”`);
  for (const z of k.zrodla) if (!ID.test(z.id ?? '')) throw new Error(`${PLIK_ZRODEL}: identyfikator źródła „${z.id}” musi pasować do [a-z0-9]+ (trafia do custom_id batcha)`);
  const nieznane = tylko.filter((t) => !k.zrodla.some((z) => z.id === t)); if (nieznane.length) throw new Error(`nieznane źródło: ${nieznane.join(', ')} (dostępne: ${k.zrodla.map((z) => z.id).join(', ')})`);
  const brakuje = (z) => z.oczekuje === true && !tylko.length && [z.pl, z.en, z.katalog].filter(Boolean).some((p) => !existsSync(join(root, p)));
  const wybrane = k.zrodla.filter((z) => !tylko.length || tylko.includes(z.id));
  const wynik = wybrane.filter((z) => !brakuje(z)).map((z) => ({ id: z.id, rodzaj: z.rodzaj, opis: z.opis ?? z.id, wskazowka: z.wskazowka ?? '', cel: z.cel, pozycje: plikiZrodla(root, z) }));
  wynik.pominiete = wybrane.filter(brakuje).map((z) => z.id); /* źródła „oczekuje”, których plików jeszcze nie ma — rdzeń zgłasza je w logu */
  return wynik;
}

/** Plik celu dla pozycji i języka (mapa: jeden plik na język; dokumenty: jeden na dokument i język). */
export const sciezkaCelu = (zrodlo, kod, klucz) => zrodlo.cel.replaceAll('{kod}', kod).replaceAll('{nazwa}', klucz ?? '');
