// Z-31: zrzuty zbudowanej strony (Chromium, „Ogranicz ruch”, skala 1) i sprawdzenia: axe-core (wcag2a/aa, 2.1, 2.2 + best-practice), przewijanie poziome, błędy konsoli.
// Użycie: node pomiary/z31/zrzuty.mjs <dist> <katalog wyjściowy> [szerokości=390,1440]
// Strony wzorcowe = te z docs/design/system/wzorce-zrzuty (ten sam przykład z danych); nazwy plików jak we wzorcach: <strona>-<szerokość>-<jasny|ciemny>[-kontrast].png.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, serve, axeSource } from '../../tests/przegladarka.mjs';

const [dist, out, szer = '390,1440'] = process.argv.slice(2);
if (!dist || !out) throw new Error('użycie: node pomiary/z31/zrzuty.mjs <dist> <katalog> [szerokości]');
const STRONY = [
  ['cwiczenie', 'pl/exercises/back-squat/'], ['cwiczenie-wskazowki-ogolne', 'pl/exercises/decline-bench-press/'], ['cwiczenie-bez-figury', 'pl/exercises/bench-dip/'], ['cwiczenie-bez-wskazowek', 'pl/exercises/sissy-squat/'],
  ['glowna', 'pl/'], ['lista', 'pl/exercises/'], ['lista-pusta', 'pl/exercises/?pusto'], ['404', 'nie-ma-takiej-strony/'], ['jezyki', ''],
];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const MAX_H = 1400; /* strony z listą 708 pozycji i długą stroną główną: tylko początek (pliki repozytorium ≤ 300 KB) */
mkdirSync(out, { recursive: true });
const srv = await serve(dist), b = await launch(), axe = axeSource(), wynik = [];
try {
  for (const motyw of ['light', 'dark']) for (const kontrast of ['no-preference', 'more']) for (const szerokosc of szer.split(',').map(Number)) {
    const ctx = await b.newContext({ viewport: { width: szerokosc, height: 900 }, deviceScaleFactor: 1, colorScheme: motyw, reducedMotion: 'reduce', contrast: kontrast });
    const p = await ctx.newPage(), bledy = []; p.on('console', m => m.type() === 'error' && bledy.push(m.text())); p.on('requestfailed', r => bledy.push('nieudane: ' + r.url()));
    for (const [nazwa, adres] of STRONY) {
      if (kontrast === 'more' && !['cwiczenie', 'lista'].includes(nazwa)) continue;
      await p.goto(`${srv.url}/${adres.replace('?pusto', '')}`); await p.evaluate(() => document.fonts.ready);
      if (adres.endsWith('?pusto')) { /* filtry z wzorca: łydki + linki + Przysiady = 0 wyników */
        await p.selectOption('#f-muscle', 'calves'); await p.selectOption('#f-equipment', 'cable'); await p.selectOption('#f-movement', 'squat');
      }
      const poziom = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      await p.evaluate(axe);
      const naruszenia = await p.evaluate(tags => globalThis.axe.run(document, { runOnly: { type: 'tag', values: tags } }).then(r => r.violations.map(v => `${v.id}: ${v.nodes.length}`)), AXE_TAGS);
      const wysokosc = await p.evaluate(() => document.documentElement.scrollHeight);
      const tag = `${nazwa}-${szerokosc}-${motyw === 'light' ? 'jasny' : 'ciemny'}${kontrast === 'more' ? '-kontrast' : ''}`;
      await p.screenshot({ path: join(out, `${tag}.png`), fullPage: true, ...(wysokosc > MAX_H ? { clip: { x: 0, y: 0, width: szerokosc, height: MAX_H } } : {}) });
      wynik.push({ tag, wysokosc, poziom, axe: naruszenia, bledy: [...bledy] }); bledy.length = 0;
    }
    await ctx.close();
  }
} finally { await b.close(); await srv.close(); }
writeFileSync(join(out, 'sprawdzenie.json'), JSON.stringify(wynik, null, 1) + '\n');
const zle = wynik.filter(x => x.poziom > 0 || x.axe.length || x.bledy.length);
console.log(`widoki: ${wynik.length}; z uwagami: ${zle.length}`); for (const x of zle) console.log(JSON.stringify(x));
