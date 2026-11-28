// Składa assets/site.css z plików systemu „Arkusz” (docs/design/system/: fonty.css, tokeny.css, komponenty.css) i kopiuje kroje woff2 do assets/fonty/. Uruchomienie: node src/css.mjs
// Źródłem prawdy zostają pliki systemu (rola 04); site.css jest wynikiem commitowanym, a test Z-31 sprawdza zgodność tokenów i krojów z źródłem.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const DS = join(ROOT, 'docs/design/system');
const czytaj = f => readFileSync(join(DS, f), 'utf8');
const NAGLOWEK = `/* assets/site.css — system „Arkusz” (docs/design/system/design-spec.md, kierunek A, wybór właściciela 27.11.2026).
   Złożone z: fonty.css (adresy ../fonty/ → fonty/), tokeny.css, komponenty.css, uzupełnienia Z-31 na końcu. Źródło prawdy: docs/design/system/; test Z-31 pilnuje zgodności tokenów i krojów.
   Odtworzenie: node src/css.mjs */\n`;
const UZUPELNIENIA = `
/* --- Z-31: uzupełnienia spoza systemu (zgłoszone roli 04: [hidden] i widoki animacji figury nie mają komponentu w komponenty.css) --- */
[hidden]{display:none!important}
.widoki{display:flex;flex-wrap:wrap;gap:var(--o4)}.widoki svg{flex:1 1 12rem;max-height:20rem;min-width:0}
.drobne{font-size:var(--fs-drobne);color:var(--muted)}
/* --- Z-33: uzupełnienie spoza systemu (do zgłoszenia roli 04): szerokość tekstu stron prawnych (Z-40: a.plakietka usunięte — plakietka to grafika Apple albo zwykły link, bez własnego stylu) --- */
.tekst-prawny{max-width:var(--szer-tekst)}
/* --- Z-34: akapit krótkiej odpowiedzi ma klasę .odp (wymóg testu), ramka .odp jest na sekcji --- */
p.odp{margin:0;padding:0;background:none;border:0;max-width:none}.tekst-prawny ul{padding-left:var(--o5)}
`;
export function zlozCss() { return NAGLOWEK + czytaj('fonty.css').split('url(../fonty/').join('url(fonty/') + '\n' + czytaj('tokeny.css') + '\n' + czytaj('komponenty.css') + UZUPELNIENIA; }
if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  writeFileSync(join(ROOT, 'assets/site.css'), zlozCss());
  mkdirSync(join(ROOT, 'assets/fonty'), { recursive: true });
  for (const f of readdirSync(join(DS, 'fonty')).filter(f => f.endsWith('.woff2'))) copyFileSync(join(DS, 'fonty', f), join(ROOT, 'assets/fonty', f));
  console.log('assets/site.css i assets/fonty/ zapisane');
}
