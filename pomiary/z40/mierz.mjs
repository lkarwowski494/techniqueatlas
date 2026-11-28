// Z-40: zrzuty i sprawdzenia po poprawkach audytu wyglądu: axe-core (wcag2a/aa/21/22 + best-practice), przewijanie poziome, błędy konsoli.
// Warianty: 320 px z tekstem 200% (font-size korzenia ×2 jak w audycie, dowody/tekst-200.txt), 390 px z tekstem 100%, 768 px z tekstem 200% (wykaz).
// Użycie: node pomiary/z40/mierz.mjs <dist> <katalog wyjściowy>   (dist zbudowany z językami pl, en, ru, de, nl, uk)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { launch, serve, axeSource } from '../../tests/przegladarka.mjs';

const [dist, out] = process.argv.slice(2);
if (!dist || !out) throw new Error('użycie: node pomiary/z40/mierz.mjs <dist> <katalog>');
const STRONY = [
  ['cwiczenie-pl', 'pl/exercises/back-squat/'], ['cwiczenie-ru', 'ru/exercises/back-squat/'], ['cwiczenie-uk', 'uk/exercises/back-squat/'], ['glowna-nl', 'nl/'], ['lista-de', 'de/exercises/'], ['lista-pl', 'pl/exercises/'],
  ['filtr-nogi-pl', 'pl/muscles/legs/'], ['jezyki', ''], ['404', 'nie-ma-takiej-strony/'],
];
const WARIANTY = [{ szer: 320, tekst: 2 }, { szer: 390, tekst: 1 }, { szer: 768, tekst: 2 }];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'], MAX_H = 1400;
mkdirSync(join(out, 'zrzuty'), { recursive: true });
const srv = await serve(dist), b = await launch(), axe = axeSource(), wynik = [];
try {
  for (const motyw of ['light', 'dark']) for (const { szer, tekst } of WARIANTY) {
    const ctx = await b.newContext({ viewport: { width: szer, height: 900 }, deviceScaleFactor: 1, colorScheme: motyw, reducedMotion: 'reduce', bypassCSP: true }), p = await ctx.newPage(), bledy = [];
    p.on('console', m => m.type() === 'error' && bledy.push(m.text())); p.on('requestfailed', r => bledy.push('nieudane: ' + r.url()));
    for (const [nazwa, adres] of STRONY) {
      if (szer === 768 && !nazwa.startsWith('lista')) continue;
      await p.goto(`${srv.url}/${adres}`); await p.evaluate(() => document.fonts.ready);
      if (tekst === 2) await p.evaluate(() => document.documentElement.style.setProperty('font-size', 'calc(106.25% * 2)', 'important'));
      if (nazwa === 'lista-pl' && szer !== 768) await p.selectOption('#f-muscle', 'legs'); /* licznik wyniku po filtrze */
      const poziom = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      await p.evaluate(axe);
      const axeW = await p.evaluate(tags => globalThis.axe.run(document, { runOnly: { type: 'tag', values: tags } }).then(r => r.violations.map(v => `${v.id}: ${v.nodes.length}`)), AXE_TAGS);
      const live = await p.evaluate(() => document.querySelector('p.wynik[aria-live]')?.textContent.replace(/\s+/g, ' ').trim() ?? null);
      const wysokosc = await p.evaluate(() => document.documentElement.scrollHeight);
      const tag = `${nazwa}-${szer}-t${tekst * 100}-${motyw === 'light' ? 'jasny' : 'ciemny'}`;
      if (motyw === 'light' || szer === 320) await p.screenshot({ path: join(out, 'zrzuty', `${tag}.png`), fullPage: true, ...(wysokosc > MAX_H ? { clip: { x: 0, y: 0, width: szer, height: MAX_H } } : {}) });
      wynik.push({ tag, poziom, axe: axeW, bledy: [...bledy], ...(live ? { licznik: live } : {}) }); bledy.length = 0;
    }
    await ctx.close();
  }
} finally { await b.close(); await srv.close(); }
writeFileSync(join(out, 'sprawdzenie.json'), JSON.stringify(wynik, null, 1) + '\n');
const zle = wynik.filter(x => x.poziom > 0 || x.axe.length || x.bledy.some(e => !/404/.test(e)));
console.log(`widoki: ${wynik.length}; z uwagami: ${zle.length}`); for (const x of zle) console.log(JSON.stringify(x));
process.exit(zle.length ? 1 : 0);
