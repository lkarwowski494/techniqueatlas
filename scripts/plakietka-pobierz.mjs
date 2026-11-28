/* Pobranie oficjalnych czarnych plakietek „Download on the App Store” z Apple Marketing Tools (Z-40 009, KO-139).
 * Ręcznie, nie z budowania: node scripts/plakietka-pobierz.mjs. Pliki zapisywane bajt w bajt (bez zmian); suma SHA-256 i data odczytu
 * trafiają do assets/plakietka/ZRODLA.json. Zasady Apple: docs/teksty/plakietka-app-store.md. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), BAZA = 'https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/';
/* kod strony → język w generatorze Apple. sr: Apple nie ma plakietki serbskiej → angielska (decyzja do weta); es-419 → es-mx (Apple nie ma es-419);
 * nb → no-no (Apple: „Norwegian”); zh-Hant → zh-tw. */
export const MAPA = { pl: 'pl-pl', en: 'en-us', cs: 'cs-cz', sk: 'sk-sk', hu: 'hu-hu', ro: 'ro-ro', bg: 'bg-bg', hr: 'hr-hr', sl: 'sl-si', sr: 'en-us', lt: 'lt-lt', lv: 'lv-lv', et: 'et-ee', uk: 'uk-ua', es: 'es-es', 'es-419': 'es-mx', pt: 'pt-pt', 'pt-BR': 'pt-br', de: 'de-de', fr: 'fr-fr', it: 'it-it', nl: 'nl-nl', sv: 'sv-se', da: 'da-dk', nb: 'no-no', fi: 'fi-fi', tr: 'tr-tr', el: 'el-gr', id: 'id-id', ms: 'ms-my', vi: 'vi-vn', ru: 'ru-ru', ja: 'ja-jp', ko: 'ko-kr', 'zh-Hant': 'zh-tw' };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = join(ROOT, 'assets/plakietka'), data = new Date().toISOString().slice(0, 10), zrodla = {};
  mkdirSync(dir, { recursive: true });
  for (const [kod, loc] of Object.entries(MAPA)) {
    const url = BAZA + loc, buf = execFileSync('curl', ['-fsSL', '--max-time', '60', url], { maxBuffer: 1 << 24 });
    if (!buf.subarray(0, 400).toString('utf8').includes('<svg')) throw new Error(`${kod}: odpowiedź nie jest SVG`);
    writeFileSync(join(dir, `${kod}.svg`), buf);
    zrodla[kod] = { url, jezykApple: loc, data, sha256: createHash('sha256').update(buf).digest('hex') };
  }
  writeFileSync(join(dir, 'ZRODLA.json'), JSON.stringify({ _opis: 'Oficjalne pliki Apple, bez zmian. Źródło: Apple Marketing Tools (https://toolbox.marketingtools.apple.com/app-store/), kolor czarny, SVG. Test tests/z40-plakietka.test.mjs sprawdza sumy.', zrodla }, null, 2) + '\n');
  console.log(`zapisano ${Object.keys(zrodla).length} plików`);
}
