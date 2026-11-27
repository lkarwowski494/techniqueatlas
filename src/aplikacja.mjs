// Z-33: fakty o aplikacji, które strona bierze z kodu wydanej wersji (nie przepisuje): liczba dni bez opłat (lib/access.ts → PAYWALL.FREE_TRAINING_DAYS_PER_MONTH) i wersja,
// dla której sprawdzono zdania ramki „w aplikacji” (docs/teksty/ramka-w-aplikacji.md). Repo aplikacji jest w .cache/app na commicie z PIN.json (npm run dane).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { CACHE, ROOT } from './lib.mjs';

/** Liczba dni treningowych w miesiącu bez opłat z lib/access.ts aplikacji; brak pliku albo brak liczby = błąd (strona nie zgaduje liczby, która trafia do akapitu o wsparciu). */
export function dniBezOplat(cache = CACHE) {
  const f = join(cache, 'app/lib/access.ts'); if (!existsSync(f)) throw new Error('brak .cache/app/lib/access.ts — uruchom: npm run dane (liczba dni bez opłat pochodzi z kodu aplikacji)');
  const m = /FREE_TRAINING_DAYS_PER_MONTH\s*:\s*(\d+)\s*,/.exec(readFileSync(f, 'utf8')); if (!m) throw new Error('lib/access.ts: nie znaleziono PAYWALL.FREE_TRAINING_DAYS_PER_MONTH');
  return Number(m[1]);
}

const DOK_RAMKI = 'docs/teksty/ramka-w-aplikacji.md';
const wiersze = (md, od, do_, re) => md.slice(md.indexOf(od), do_ ? md.indexOf(do_) : undefined).split('\n').map(w => w.split('|').map(x => x.trim())).filter(k => re.test(k[1]));
/** Dokument ramki: wersja, dla której zdania sprawdzono („sprawdzony dla wersji **1.1.1**”), zdania wariantu A (pl, en) i akapitu o wsparciu (z {dni}). */
export function dokumentRamki(root = ROOT) {
  const md = readFileSync(join(root, DOK_RAMKI), 'utf8'), A = wiersze(md, '### Wariant A', '### Wariant B', /^A\d$/), W = wiersze(md, '## 2. Akapit o wsparciu', '### Odstępstwa', /^W\d$/);
  return { wersja: /sprawdzony dla wersji \*\*([\d.]+)\*\*/.exec(md)?.[1] ?? '', zdania: { pl: A.map(k => k[2]), en: A.map(k => k[3]) }, wsparcie: { pl: W.map(k => k[2]), en: W.map(k => k[3]) } };
}
