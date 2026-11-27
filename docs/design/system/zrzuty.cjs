// Z-12 · zrzuty szablonów: Playwright (Chromium), skala 2, „Ogranicz ruch”, pełna strona. Przy okazji: axe-core i przewijanie poziome.
// Użycie: node docs/design/system/zrzuty.cjs <katalog wyjściowy> [szerokości=320,390,768,1024,1440] [strony=*] [motywy=light,dark] [kontrast=no-preference]
// Wymaga serwera w docs/design/system (python3 -m http.server 8123). Wynik axe i przewijania: <wyjście>/sprawdzenie.json.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [out, w = '320,390,768,1024,1440', strony = '*', motywy = 'light,dark', kontrast = 'no-preference', skala = '2'] = process.argv.slice(2);
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js', { paths: [path.join(__dirname, '../../..')] }), 'utf8');
const dir = path.join(__dirname, 'szablony');
const pages = strony === '*' ? fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => f.slice(0, -5)) : strony.split(',');
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const wynik = [];
  for (const theme of motywy.split(',')) for (const width of w.split(',').map(Number)) {
    const ctx = await b.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: Number(skala), colorScheme: theme, reducedMotion: 'reduce', contrast: kontrast, bypassCSP: true });
    const p = await ctx.newPage(); const bledy = []; p.on('console', m => m.type() === 'error' && bledy.push(m.text())); p.on('requestfailed', r => bledy.push('nieudane: ' + r.url()));
    for (const name of pages) {
      await p.goto(`http://localhost:8123/szablony/${name}.html`); await p.evaluate(() => document.fonts.ready);
      const poziom = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      await p.addScriptTag({ content: AXE });
      const axe = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] })).violations.map(v => `${v.id}: ${v.nodes.length}`));
      const tag = `${name}-${width}-${theme === 'light' ? 'jasny' : 'ciemny'}${kontrast === 'more' ? '-kontrast' : ''}`;
      await p.screenshot({ path: path.join(out, `${tag}.png`), fullPage: true });
      wynik.push({ tag, poziom, axe, bledy: [...bledy] }); bledy.length = 0;
    }
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(path.join(out, 'sprawdzenie.json'), JSON.stringify(wynik, null, 1));
  const zle = wynik.filter(x => x.poziom > 0 || x.axe.length || x.bledy.length);
  console.log(`widoki: ${wynik.length}; z uwagami: ${zle.length}`); for (const x of zle) console.log(JSON.stringify(x));
})();
