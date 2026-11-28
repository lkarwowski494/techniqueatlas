// Licznik wydatków łącznych na API (słowa właściciela 27.11.2026: „Do 80 USD”). Plik docs/przeklad/wydatki.json jest w repo; workflow ma tylko odczyt repozytorium,
// więc wpis z artefaktu `wydatek.json` dopisuje się LOKALNIE: node scripts/przeklad/przeklad-api.mjs --zapisz-wydatek <katalog raportu> (idempotentnie po batch_id), potem commit.
// Ograniczenie: licznik zna tylko wpisy, które ktoś dopisał; niezaksięgowany przebieg nie zmniejsza zapasu (zob. docs/przeklad/README.md).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { LIMIT_LACZNY_USD } from './wspolne.mjs';

export const PLIK = 'docs/przeklad/wydatki.json';
const POLA = ['przebieg', 'batch_id', 'model', 'data', 'rodzaj_kosztu', 'tokeny_we', 'tokeny_wy', 'koszt_usd'];
const RODZAJE = ['szacunek', 'rzeczywisty'];

const sprawdz = (d, nazwa) => {
  if (!d || !Array.isArray(d.wpisy)) throw new Error(`${nazwa}: oczekiwane pole „wpisy” (tablica)`);
  for (const w of d.wpisy) if (typeof w.batch_id !== 'string' || !Number.isFinite(w.koszt_usd) || w.koszt_usd < 0) throw new Error(`${nazwa}: wpis bez batch_id albo z niepoprawnym kosztem`);
  return d;
};
const rodzaj = (w) => w.rodzaj_kosztu ?? 'rzeczywisty';
/** Scalenie wpisów z gałęzi tekstów z wpisami z main po batch_id. Nie zaniża sumy: nowy wpis dopisuje się; ten sam batch — koszt rzeczywisty zastępuje szacunek (jak --zapisz-wydatek), poza tym zostaje wyższy. */
export function scal(wpisy, zGalezi) {
  const wynik = wpisy.map((w) => ({ ...w }));
  for (const g of zGalezi) {
    const i = wynik.findIndex((w) => w.batch_id === g.batch_id);
    if (i < 0) wynik.push({ ...g });
    else if (rodzaj(wynik[i]) === 'szacunek' && rodzaj(g) === 'rzeczywisty') wynik[i] = { ...g };
    else if (rodzaj(wynik[i]) === rodzaj(g) && g.koszt_usd > wynik[i].koszt_usd) wynik[i] = { ...g };
  }
  return wynik;
}
/** `plikGalezi`: wydatki.json z gałęzi tekstów (opcjonalnie, tylko odczyt); jego pole limit_usd jest ignorowane. */
export function wczytaj(root, plikGalezi = null) {
  const p = join(root, PLIK);
  const d = existsSync(p) ? sprawdz(JSON.parse(readFileSync(p, 'utf8')), PLIK) : { limit_usd: LIMIT_LACZNY_USD, wpisy: [] };
  if (!plikGalezi) return d;
  if (!existsSync(plikGalezi)) throw new Error(`--wydatki-galaz: brak pliku ${plikGalezi}`);
  const g = sprawdz(JSON.parse(readFileSync(plikGalezi, 'utf8')), '--wydatki-galaz');
  return { ...d, wpisy: scal(d.wpisy, g.wpisy) };
}
/** Limit łączny: z pliku, ale nigdy powyżej stałej z kodu (plik wydatków nie podnosi limitu). */
export const limit = (root) => Math.min(Number.isFinite(wczytaj(root).limit_usd) ? wczytaj(root).limit_usd : LIMIT_LACZNY_USD, LIMIT_LACZNY_USD);
export const suma = (root, plikGalezi = null) => wczytaj(root, plikGalezi).wpisy.reduce((s, w) => s + w.koszt_usd, 0);

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
export const niezaksiegowane = (root, plikGalezi = null) => wczytaj(root, plikGalezi).wpisy.filter((w) => w.rodzaj_kosztu === 'szacunek');
