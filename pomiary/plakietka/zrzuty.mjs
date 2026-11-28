// Zrzuty ramki „w aplikacji” z plakietką Apple (pl, en; motyw jasny i ciemny) + kontrast czarnej plakietki z tłem ramki. Ręcznie: node pomiary/plakietka/zrzuty.mjs
import { build } from '../../src/build.mjs';
import { launch, serve } from '../../tests/przegladarka.mjs';
import { tmpDist } from '../../tests/pomoc.mjs';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url)), r = await build({ out: tmpDist(), cfg: { appStoreId: '123456789', jezyki: ['pl', 'en'] } }), srv = await serve(r.out), br = await launch(), wyniki = [];
const lum = ([R, G, B]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(R) + 0.7152 * f(G) + 0.0722 * f(B); };
const kontrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
for (const l of ['pl', 'en']) for (const k of ['light', 'dark']) {
  const c = await br.newContext({ viewport: { width: 900, height: 900 }, colorScheme: k, deviceScaleFactor: 2 }), p = await c.newPage();
  await p.goto(`${srv.url}/${l}/exercises/back-squat/`); await p.evaluate(() => document.fonts.ready);
  const el = p.locator('aside.ramka'); await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: join(DIR, `ramka-${l}-${k === 'dark' ? 'ciemny' : 'jasny'}.png`) });
  const img = p.locator('aside.ramka img'), m = await img.evaluate(e => { const b = e.getBoundingClientRect(); let t = e.parentElement, bg; for (; t; t = t.parentElement) { bg = getComputedStyle(t).backgroundColor; if (bg !== 'rgba(0, 0, 0, 0)') break; } return { h: b.height, w: b.width, tlo: bg, zaladowany: e.complete && e.naturalWidth > 0 }; });
  const tlo = m.tlo.match(/\d+/g).slice(0, 3).map(Number); /* czerń plakietki #000 (Apple) wobec tła ramki */
  wyniki.push({ jezyk: l, motyw: k, wysokoscPx: m.h, szerokoscPx: Math.round(m.w), zaladowany: m.zaladowany, tlo: m.tlo, kontrastCzerniZTlem: +kontrast([0, 0, 0], tlo).toFixed(2) });
  await c.close();
}
await br.close(); await srv.close();
writeFileSync(join(DIR, 'wyniki.json'), JSON.stringify(wyniki, null, 2) + '\n'); console.table(wyniki);
