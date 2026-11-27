// Z-12 · render obrazka podglądu: 1200×630 PNG, skala 1, motyw jasny, paleta 256 kolorów (budżet wagi). Wymaga serwera w docs/design/system na porcie 8123.
// Użycie: node generuj-podglad.cjs <plik.png>
const { chromium } = require('playwright'); const { execFileSync } = require('child_process');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 }, colorScheme: 'light', reducedMotion: 'reduce' });
  await p.goto('http://localhost:8123/podglad/' + (process.argv[3] ?? 'podglad') + '.html'); await p.screenshot({ path: process.argv[2] }); await b.close(); })();
