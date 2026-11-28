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
/** Tekst na ścieżce; gdy plik ma na niej albo wyżej zwykły napis zamiast drzewa, to ten napis. Przykład: pl ma `countLine` jako formy liczby mnogiej (one, few, many, other), a en, de i ja — jeden napis;
 *  napis na wyższym poziomie oznacza, że język ma już tłumaczenie całego węzła (nie wolno go zastępować drzewem ani prosić o przekład jego form). */
export function tekstNaSciezce(obj, sciezka) {
  let o = obj; for (const k of sciezka) { if (typeof o === 'string') return o; if (!o || typeof o !== 'object') return undefined; o = o[k]; }
  return typeof o === 'string' ? o : undefined;
}
/** Ustawia liść na ścieżce (tworzy pośrednie obiekty). */
export function ustaw(obj, sciezka, wartosc) {
  let o = obj; for (const k of sciezka.slice(0, -1)) { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }
  o[sciezka.at(-1)] = wartosc;
}

function plikiZrodla(root, z) {
  const wymagany = (p) => { if (!existsSync(join(root, p))) throw new Error(`źródło „${z.id}”: brak pliku ${p}`); return join(root, p); };
  if (z.rodzaj === 'mapa') {
    const pl = czytaj(wymagany(z.pl)); const en = z.en ? czytaj(wymagany(z.en)) : null;
    return liscie(pl).map((l, i) => ({ id: i + 1, klucz: l.sciezka.join('.'), sciezka: l.sciezka, pl: l.tekst, en: z.en_z_klucza ? l.sciezka.at(-1) : (en ? tekstNaSciezce(en, l.sciezka) ?? null : null) }));
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

/* ---------- liczba mnoga: formy według kategorii CLDR języka DOCELOWEGO ---------- */
const KATEGORIE = ['zero', 'one', 'two', 'few', 'many', 'other'];
/** Kategorie liczby mnogiej języka (Intl.PluralRules, kolejność CLDR); nieznany język → one, other. */
export function kategoriePl(kod) { try { const k = new Intl.PluralRules(kod).resolvedOptions().pluralCategories; return KATEGORIE.filter((c) => k.includes(c)); } catch { return ['one', 'other']; } }
/** Liczby przykładowe kategorii w języku: do 3 pierwszych całkowitych 0…1000, a gdy brak (np. „many” w pl to liczby całkowite, „other” w cs to ułamki) — ułamki 0,5…; */
export function przykladyKategorii(kod, kategoria) {
  const pr = new Intl.PluralRules(kod); const w = [];
  for (let n = 0; n <= 1000 && w.length < 3; n++) if (pr.select(n) === kategoria) w.push(n);
  for (const n of [0.5, 1.5, 2.5]) if (!w.length && pr.select(n) === kategoria) w.push(n);
  return w;
}
/** Pozycje źródła „mapa” przepisane na język `kod`: każda fraza liczby mnogiej (rodzeństwo liści, których klucze to kategorie CLDR, z „other”) ma tyle pozycji, ile kategorii ma język docelowy
 *  (sl: one, two, few, other; lv: zero, one, other; ja: other), a nie tyle, ile polskie źródło. Pozycja ma `kategoria` i `przyklady` (liczby, po których stoi forma); `pl` to polska forma dla pierwszej liczby przykładowej. Inne pozycje bez zmian; id zachowane lub nowe. */
export function pozycjeDlaJezyka(zrodlo, kod) {
  if (zrodlo.rodzaj !== 'mapa' || zrodlo.pozycje.some((p) => p.kategoria)) return zrodlo.pozycje; /* dokumenty i pozycje już przepisane na język: bez zmian */
  const rodzic = (p) => p.sciezka.slice(0, -1).join('.'); const grupy = new Map();
  for (const p of zrodlo.pozycje) if (p.sciezka.length > 1 && KATEGORIE.includes(p.sciezka.at(-1))) { const g = grupy.get(rodzic(p)) ?? []; g.push(p); grupy.set(rodzic(p), g); }
  for (const [k, g] of [...grupy]) if (!g.some((p) => p.sciezka.at(-1) === 'other')) grupy.delete(k);
  if (!grupy.size) return zrodlo.pozycje;
  const plPr = new Intl.PluralRules('pl'); let nastepne = Math.max(0, ...zrodlo.pozycje.map((p) => Number(p.id) || 0)) + 1; const gotowe = new Set(); const wynik = [];
  for (const p of zrodlo.pozycje) {
    const r = rodzic(p); if (!grupy.has(r)) { wynik.push(p); continue; }
    if (gotowe.has(r)) continue; gotowe.add(r); const g = grupy.get(r); const wg = (c) => g.find((x) => x.sciezka.at(-1) === c) ?? g.find((x) => x.sciezka.at(-1) === 'other');
    for (const kat of kategoriePl(kod)) {
      const przyklady = przykladyKategorii(kod, kat); const zr = wg(przyklady.length ? plPr.select(przyklady[0]) : 'other');
      wynik.push({ id: nastepne++, klucz: `${r}.${kat}`, sciezka: [...p.sciezka.slice(0, -1), kat], pl: zr.pl, en: zr.en ?? null, kategoria: kat, przyklady });
    }
  }
  return wynik;
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
