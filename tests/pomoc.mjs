// Pomocnicze dla strażników: lista plików repozytorium (śledzone przez git; bez gita — przejście po katalogu), odczyt tekstu, budowanie do katalogu tymczasowego.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { ROOT, hasData } from '../src/lib.mjs';
import { build } from '../src/build.mjs';

const SKIP_DIR = new Set(['.git', 'node_modules', 'dist', '.cache']);
const walk = (d, out = []) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (SKIP_DIR.has(e.name)) continue; const p = join(d, e.name); if (e.isDirectory()) walk(p, out); else out.push(relative(ROOT, p)); } return out; };
/** Pliki repozytorium: śledzone + nieśledzone niewyłączone przez .gitignore (strażnik ma widzieć to, co trafi do commita). */
export function repoFiles() {
  if (existsSync(join(ROOT, '.git'))) { try { return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean).filter(f => existsSync(join(ROOT, f))); } catch { /* bez gita */ } }
  return walk(ROOT);
}
const TEXT = /\.(mjs|js|json|html|css|md|yml|yaml|txt|xml|svg)$|^\.gitignore$/;
export const isText = f => TEXT.test(f);
export const read = f => readFileSync(join(ROOT, f), 'utf8');
export function distFiles(dir) { const out = []; const w = d => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) w(p); else out.push(p); } }; w(dir); return out; }
/** Katalogi tymczasowe budowań: każdy proces testowy sprząta swoje przy wyjściu (inaczej kolejne przebiegi zapełniają dysk — ok. 170 MB na budowanie). */
const sprzatanie = new Set();
process.on('exit', () => { for (const d of sprzatanie) { try { rmSync(d, { recursive: true, force: true }); } catch { /* ignoruj */ } } });
export const tmpDist = () => { const d = mkdtempSync(join(tmpdir(), 'atlas-dist-')); sprzatanie.add(d); return d; };
export { ROOT, statSync };

/** Dane z aplikacji (npm run dane) są warunkiem testów generatora i strażników zbudowanej strony — brak danych to jasny błąd, nie pominięcie testu. */
export function requireData() { if (!hasData()) throw new Error('brak danych z aplikacji (.cache) — uruchom: npm run dane'); }
const memo = new Map();
/** Budowanie raz na wariant ustawień (testy współdzielą wynik); zwraca { out, pages, cfg, report }. */
export function buildOnce(name = 'domyslny', cfg = {}, opts = {}) { requireData(); if (!memo.has(name)) memo.set(name, build({ out: tmpDist(), cfg, ...opts })); return memo.get(name); }
/** Opcje dla testów, które włączają indeksowanie na danych sprzed wydania: bez warunków startu S3/S4/S6 i zamrożenia adresów (mają własne testy), reszta bez zmian. */
export const BEZ_STARTU = { pominStraznikowStartu: true };
/** Dane z polem `pelna: true` dla podanych slugów (we wszystkich językach) — dopóki PIN wskazuje eksport bez pola (F-20), testy indeksowanych stron ćwiczeń (hreflang, mapy) podstawiają je jawnie. */
export const zPelna = (...slugs) => ({ zmianaDanych: data => Object.fromEntries(Object.entries(data).map(([l, d]) => [l, { ...d, exercises: d.exercises.map(e => slugs.includes(e.slug) ? { ...e, pelna: true } : e) }])) });
/** Eksport bez pola `pelna` (jak PIN sprzed F-20): test ostrzeżenia/błędu S6 o braku pola nie zależy od tego, co mają aktualne dane. */
export const bezPelna = () => ({ zmianaDanych: data => Object.fromEntries(Object.entries(data).map(([l, d]) => [l, { ...d, exercises: d.exercises.map(({ pelna, ...e }) => e) }])) });
/** Dane, w których tylko podane slugi mają `pelna: true` (reszta false) — liczba indeksowanych stron nie zależy od stanu eksportu. */
export const tylkoPelna = (...slugs) => ({ zmianaDanych: data => Object.fromEntries(Object.entries(data).map(([l, d]) => [l, { ...d, exercises: d.exercises.map(e => ({ ...e, pelna: slugs.includes(e.slug) })) }])) });
