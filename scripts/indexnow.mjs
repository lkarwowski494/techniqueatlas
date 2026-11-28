// Z-34 (A12): wysyłka adresów do IndexNow po publikacji strony — RĘCZNIE, nigdy z budowania ani z testów (działanie zewnętrzne: wymaga zgody właściciela, Z-60/Z-62).
// Użycie: node scripts/indexnow.mjs [--dist dist] [--wyslij]   (bez --wyslij: tylko podsumowanie, nic nie jest wysyłane)
// Adresy bierze z map witryny w dist/ (te same, które widzi Google), klucz i domenę z config.json (indexNowKlucz — publiczny; plik <klucz>.txt leży w korzeniu strony).
// Jedno zgłoszenie trafia do wszystkich wyszukiwarek protokołu (indexnow.org/faq, odczyt 27.11.2026); limit: do 10 000 adresów w jednym żądaniu (indexnow.org/documentation).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../src/lib.mjs';

export const PUNKT = 'https://api.indexnow.org/indexnow', LIMIT = 10000;

/** Adresy <loc> stron z map witryny w katalogu dist (indeks sitemap.xml → mapy języków i strony głównej); bez adresów samych map. */
export function adresyZMap(dist) {
  const loc = xml => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replaceAll('&amp;', '&'));
  const indeks = join(dist, 'sitemap.xml'); if (!existsSync(indeks)) throw new Error(`brak ${indeks} — buduj z indeksowanie=true`);
  const mapy = loc(readFileSync(indeks, 'utf8')).map(u => u.slice(u.lastIndexOf('/') + 1));
  return [...new Set(mapy.flatMap(m => loc(readFileSync(join(dist, m), 'utf8'))))];
}

/** Żądania POST (porcje do LIMIT adresów): ciało JSON wg dokumentacji IndexNow (host, key, keyLocation, urlList). Adresy spoza domeny z configu są błędem. */
export function zbudujZadania({ domena, klucz, adresy }) {
  if (!/^[A-Za-z0-9-]{8,128}$/.test(klucz ?? '')) throw new Error('config.json → indexNowKlucz: 8–128 znaków [A-Za-z0-9-]');
  const obca = adresy.filter(u => !u.startsWith(`${domena}/`)); if (obca.length) throw new Error(`adresy spoza domeny ${domena}: ${obca.slice(0, 3).join(', ')}`);
  const host = new URL(domena).host, zad = [];
  for (let i = 0; i < adresy.length; i += LIMIT) zad.push({ host, key: klucz, keyLocation: `${domena}/${klucz}.txt`, urlList: adresy.slice(i, i + LIMIT) });
  return zad;
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const a = process.argv.slice(2), i = a.indexOf('--dist'), dist = i >= 0 ? a[i + 1] : join(ROOT, 'dist'), cfg = JSON.parse(readFileSync(join(ROOT, 'config.json'), 'utf8'));
  const zad = zbudujZadania({ domena: cfg.domena, klucz: cfg.indexNowKlucz, adresy: adresyZMap(dist) });
  console.log(`IndexNow: ${zad.reduce((s, z) => s + z.urlList.length, 0)} adresów w ${zad.length} żądaniu/żądaniach (host ${zad[0]?.host}, plik klucza ${zad[0]?.keyLocation})`);
  if (!a.includes('--wyslij')) console.log('Próba na sucho: nic nie wysłano. Dodaj --wyslij po publikacji strony i zgodzie właściciela.');
  else for (const z of zad) { const r = await fetch(PUNKT, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(z) }); console.log(`${PUNKT}: HTTP ${r.status}`); if (r.status >= 400) process.exitCode = 1; }
}
