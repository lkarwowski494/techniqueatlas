// Z-33, uproszczone w BR (28.11.2026): dwie strony prawne (Prywatność, Warunki) z docs/teksty/prawne/<dokument>.<język>.md. Czyste funkcje: markdown (podzbiór: #, ##, listy „- ”, **pogrubienie**, `kod`) → HTML.
// Prowadzący (Apps4Brew, Warszawa) i kontakt są wpisane wprost w tekstach i w config.json (decyzja właściciela 28.11.2026: „Jak apps4brew”); jedyna wstawka to {{dataObowiazywania}}
// (bez niej tekst zastępczy z src/ui/<język>.json → prawneBrak, a przy indeksowanie=true strażnik S12 przerywa build).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, esc } from './lib.mjs';

/** Dokumenty: id = nazwa pliku w docs/teksty/prawne/, slug = adres strony (angielski we wszystkich językach, jak adresy ćwiczeń), klucz = nazwa linku w stopce (src/ui/<język>.json → prawne). */
export const DOKUMENTY = [
  { id: 'prywatnosc', slug: 'privacy-policy', klucz: 'privacy' },
  { id: 'warunki', slug: 'terms', klucz: 'terms' },
];
/** Języki, w których teksty prawne istnieją (po zrecenzowaniu Z-23); pozostałe języki pokazują wersję angielską z oznaczeniem języka do czasu przekładu (Z-26). */
export const JEZYKI_PRAWNE = ['pl', 'en'];

/** Usuwa komentarze HTML, także zagnieżdżone (README: „<!-- Komentarze <!-- D-n --> … -->”): od najgłębszego. */
export function bezKomentarzy(md) { let s = md, prev; do { prev = s; s = s.replace(/<!--(?:(?!<!--)[\s\S])*?-->/g, ''); } while (s !== prev); return s; }

/** Zastępuje {{klucz}} wartościami; brak wartości → tekst zastępczy `brak[klucz]`. Wartości są tekstem (escapowanie dopiero przy renderze). */
export function wstaw(md, wartosci, brak) { return md.replace(/\{\{(\w+)\}\}/g, (_, k) => (wartosci[k] || brak[k] || `(${k})`)); }

const inline = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');

/** Markdown dokumentu prawnego → { h1, naglowki (h2), html } — html bez h1 (h1 daje szablon strony). Każda niepusta linia poza listą to osobny akapit (tak są pisane teksty); „- ” zaczyna element listy. */
export function mdDoHtml(md) {
  const wiersze = bezKomentarzy(md).split('\n').map(w => w.replace(/\s+$/, '')), out = []; let h1 = null, lista = false; const naglowki = [];
  const zamknij = () => { if (lista) { out.push('</ul>'); lista = false; } };
  for (const w of wiersze) {
    if (!w.trim()) { zamknij(); continue; }
    let m;
    if ((m = /^# (.+)$/.exec(w))) { zamknij(); h1 = m[1].trim(); continue; }
    if ((m = /^## (.+)$/.exec(w))) { zamknij(); naglowki.push(m[1].trim()); out.push(`<h2>${inline(m[1].trim())}</h2>`); continue; }
    if ((m = /^- (.+)$/.exec(w))) { if (!lista) { out.push('<ul>'); lista = true; } out.push(`<li>${inline(m[1].trim())}</li>`); continue; }
    zamknij(); out.push(`<p>${inline(w.trim())}</p>`);
  }
  zamknij();
  if (!h1) throw new Error('dokument prawny bez nagłówka # (h1)');
  return { h1, naglowki, html: out.join('\n') };
}

/** Wczytuje 2 dokumenty (wstawki podmienione) → { <id>: { <język>: { h1, naglowki, html } } } dla pl, en i każdego z `langs`, który ma plik przekładu (docs/teksty/prawne/<id>.<język>.md,
 * z przebiegu przekładu API). Brak pliku pl albo en = błąd (strona prawna nie może być pusta); brak przekładu = język pokaże wersję angielską z oznaczeniem lang="en". */
export function wczytajPrawne({ langs, wartosci, brak, root = ROOT }) {
  const wynik = {};
  for (const d of DOKUMENTY) { wynik[d.id] = {}; for (const l of new Set([...JEZYKI_PRAWNE, ...langs])) {
    const f = join(root, `docs/teksty/prawne/${d.id}.${l}.md`);
    if (!existsSync(f)) { if (JEZYKI_PRAWNE.includes(l)) throw new Error(`brak ${f.slice(root.length + 1)} — tekst prawny w języku ${l}`); continue; }
    wynik[d.id][l] = mdDoHtml(wstaw(readFileSync(f, 'utf8'), wartosci, brak[l] ?? brak.en));
  } }
  return wynik;
}
