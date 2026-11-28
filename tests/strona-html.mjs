// Z-30: wspólne narzędzia testów akceptacyjnych wdrożenia strony (Z-31…Z-34): odczyt zbudowanego dist/, proste wyciąganie elementów z HTML, rozwiązywanie linków, wymiary PNG
// i znacznik testu oczekującego. Bez zależności (HTML generatora jest przewidywalny: atrybuty w cudzysłowach, bez zagnieżdżonych elementów tego samego rodzaju w miejscach, które testy czytają).
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, posix } from 'node:path';
import { distFiles } from './pomoc.mjs';

/** Test oczekujący (decyzja Z-30, wariant b strategii: w głównym zestawie, oznaczony): `todo` z ID zadania — test biegnie i pokazuje czerwień w wyniku, ale nie blokuje CI.
 * Wdrażający zadanie usuwa `CZEKA(...)` z testu w commicie, który go zazielenia; tests/z30-oczekujace.test.mjs pada, gdy zadanie jest `zrobione` w docs/55, a znacznik został. */
export const CZEKA = (zadanie, co) => ({ todo: `${zadanie} (czerwony do wdrożenia: ${co}) — zdejmij przy wdrożeniu` });

const ENC = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
export const dekoduj = s => String(s).replace(/&(amp|lt|gt|quot|#39|nbsp);/g, m => ENC[m]);
/** Tekst elementu: bez znaczników, z encjami, spacje zwinięte. */
export const tekst = html => dekoduj(String(html).replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
export const czytaj = (out, f) => readFileSync(join(out, f), 'utf8');
export const plikiHtml = out => distFiles(out).filter(p => p.endsWith('.html')).map(p => p.slice(out.length + 1)).sort();
/** Wartość `<meta name|property="…" content="…">` albo null. */
export function meta(html, klucz) {
  for (const m of html.matchAll(/<meta\s[^>]*>/g)) { const t = m[0]; if (new RegExp(`(?:name|property)="${klucz.replace(/[.:]/g, c => '\\' + c)}"`).test(t)) return dekoduj(t.match(/content="([^"]*)"/)?.[1] ?? ''); }
  return null;
}
/** Wszystkie `<link rel="…">` danego rel: lista atrybutów { href, type, sizes }. */
export const linki = (html, rel) => [...html.matchAll(/<link\s[^>]*>/g)].map(m => m[0]).filter(t => new RegExp(`rel="${rel}"`).test(t)).map(t => ({ href: dekoduj(t.match(/href="([^"]*)"/)?.[1] ?? ''), type: t.match(/type="([^"]*)"/)?.[1] ?? null }));
/** Obiekty JSON-LD strony (każdy `<script type="application/ld+json">`). */
export const jsonld = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
/** Pierwszy element o danym znaczniku (i opcjonalnie klasie): { otwarcie, wnetrze } albo null. Nie obsługuje zagnieżdżenia tego samego znacznika. */
export function element(html, tag, klasa) {
  const re = new RegExp(`<${tag}(\\s[^>]*)?>`, 'g');
  for (const m of html.matchAll(re)) {
    if (klasa && !new RegExp(`class="(?:[^"]*\\s)?${klasa}(?:\\s[^"]*)?"`).test(m[0])) continue;
    const koniec = html.indexOf(`</${tag}>`, m.index); return { otwarcie: m[0], wnetrze: html.slice(m.index + m[0].length, koniec < 0 ? undefined : koniec) };
  }
  return null;
}
export const elementy = (html, tag, klasa) => { const out = []; let reszta = html; for (;;) { const e = element(reszta, tag, klasa); if (!e) return out; out.push(e); reszta = reszta.slice(reszta.indexOf(e.otwarcie) + e.otwarcie.length); } };
export const h1 = html => { const e = element(html, 'h1'); return e ? tekst(e.wnetrze) : null; };
export const hrefy = html => [...html.matchAll(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map(m => ({ href: dekoduj(m[1]), tekst: tekst(m[2]), html: m[0] }));
/** Plik w dist/, do którego prowadzi `href` ze strony `zPliku` (adres względny, od korzenia albo z domeną `domena`); null dla linków zewnętrznych i kotwic. */
export function rozwiaz(zPliku, href, domena) {
  let h = href.split('#')[0].split('?')[0]; if (!h) return null;
  if (domena && h.startsWith(domena + '/')) h = h.slice(domena.length);
  if (/^[a-z]+:/i.test(h) || h.startsWith('//')) return null;
  let p = h.startsWith('/') ? h.slice(1) : posix.join(posix.dirname(zPliku), h);
  p = posix.normalize(p); if (p === '.' || p === '' || p.endsWith('/')) p = (p === '.' ? '' : p) + 'index.html';
  return p.replace(/^\.\//, '');
}
export const istnieje = (out, f) => existsSync(join(out, f)) && statSync(join(out, f)).isFile();
/** Wymiary PNG z nagłówka IHDR; null, gdy plik nie jest PNG. */
export function wymiaryPng(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47 || buf.readUInt32BE(4) !== 0x0d0a1a0a) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
/** Nazwy ćwiczeń w języku strony (Z-24/Z-25, zrecenzowane): docs/nazwy/<język>.json, klucz = id ćwiczenia; null, gdy język nie ma pliku. */
export function nazwyLokalne(lang) { const f = join(new URL('..', import.meta.url).pathname, `docs/nazwy/${lang}.json`); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null; }
/** Nazwa w języku strony tak, jak ma ją pokazać h1 (szablony-stron.md 2.1): lokalna różna od angielskiej nie tylko wielkością liter, inaczej angielska. */
export const nazwaLokalna = (lang, N, e) => N?.[e.id] && N[e.id].toLocaleLowerCase(lang) !== e.name.toLocaleLowerCase(lang) ? N[e.id] : null;

/** Parytet podkluczy (Z-33, recenzja): dla kluczy czekających na przekład — jeśli język ma klucz, ma mieć dokładnie te podklucze co pl; brak klucza to nie błąd. */
export const brakujacePodklucze = (u, pl, klucze) => klucze.filter(k => k in u).flatMap(k => { const a = Object.keys(pl[k] ?? {}), b = Object.keys(u[k] ?? {}); return [...a.filter(x => !b.includes(x)).map(x => `${k}: brak ${x}`), ...b.filter(x => !a.includes(x)).map(x => `${k}: nadmiarowy ${x}`)]; });
