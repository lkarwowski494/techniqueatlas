// Licznik wydatków łącznych na API (słowa właściciela 27.11.2026: „Do 80 USD”). Plik docs/przeklad/wydatki.json jest w repo; workflow ma tylko odczyt repozytorium,
// więc wpis z artefaktu `wydatek.json` dopisuje się LOKALNIE: node scripts/przeklad/przeklad-api.mjs --zapisz-wydatek <katalog raportu> (idempotentnie po batch_id), potem commit.
// Ograniczenie: licznik zna tylko wpisy, które ktoś dopisał; niezaksięgowany przebieg nie zmniejsza zapasu (zob. docs/przeklad/README.md).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { LIMIT_LACZNY_USD } from './wspolne.mjs';

export const PLIK = 'docs/przeklad/wydatki.json';
const POLA = ['przebieg', 'batch_id', 'model', 'data', 'rodzaj_kosztu', 'tokeny_we', 'tokeny_wy', 'koszt_usd'];
const RODZAJE = ['szacunek', 'rzeczywisty'];

export function wczytaj(root) {
  const p = join(root, PLIK);
  if (!existsSync(p)) return { limit_usd: LIMIT_LACZNY_USD, wpisy: [] };
  const d = JSON.parse(readFileSync(p, 'utf8'));
  if (!Array.isArray(d.wpisy)) throw new Error(`${PLIK}: oczekiwane pole „wpisy” (tablica)`);
  for (const w of d.wpisy) if (typeof w.batch_id !== 'string' || !Number.isFinite(w.koszt_usd) || w.koszt_usd < 0) throw new Error(`${PLIK}: wpis bez batch_id albo z niepoprawnym kosztem`);
  return d;
}
/** Limit łączny: z pliku, ale nigdy powyżej stałej z kodu (plik wydatków nie podnosi limitu). */
export const limit = (root) => Math.min(Number.isFinite(wczytaj(root).limit_usd) ? wczytaj(root).limit_usd : LIMIT_LACZNY_USD, LIMIT_LACZNY_USD);
export const suma = (root) => wczytaj(root).wpisy.reduce((s, w) => s + w.koszt_usd, 0);

/** Wpis z artefaktu `wydatek.json` → dopisany do licznika; ten sam batch_id nie dubluje wpisu (zastępuje go). Zwraca { dopisano, suma }. */
export function dopisz(root, wpis) {
  for (const k of POLA) if (wpis?.[k] === undefined || wpis[k] === null) throw new Error(`wydatek.json: brak pola „${k}”`);
  if (!['przeklad', 'przeglad'].includes(wpis.przebieg)) throw new Error('wydatek.json: pole „przebieg” = przeklad | przeglad');
  if (!RODZAJE.includes(wpis.rodzaj_kosztu)) throw new Error('wydatek.json: pole „rodzaj_kosztu” = szacunek | rzeczywisty');
  const d = wczytaj(root); d.limit_usd = LIMIT_LACZNY_USD;
  const nowy = Object.fromEntries(POLA.map((k) => [k, wpis[k]])); const i = d.wpisy.findIndex((w) => w.batch_id === wpis.batch_id); const juz = i >= 0;
  if (juz) d.wpisy[i] = nowy; /* ten sam batch: dokładniejszy koszt (rzeczywisty zamiast szacunku) zastępuje wpis, nie dubluje */
  else d.wpisy.push(nowy);
  mkdirSync(dirname(join(root, PLIK)), { recursive: true });
  writeFileSync(join(root, PLIK), JSON.stringify(d, null, 1) + '\n');
  return { dopisano: !juz, suma: d.wpisy.reduce((s, w) => s + w.koszt_usd, 0) };
}

/** Wpisy, których koszt jest tylko szacowany (batch wysłany, ale niezaksięgowany jako rzeczywisty): blokują nowy przebieg płatny, dopóki nie zostaną odebrane (--wznow) i zaksięgowane. Wpisy bez pola (starsze) = rzeczywiste. */
export const niezaksiegowane = (root) => wczytaj(root).wpisy.filter((w) => w.rodzaj_kosztu === 'szacunek');
