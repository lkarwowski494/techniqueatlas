// Z-34 (A9): generuje assets/podglad/<slug>.png (1200×630, paleta 64 kolorów) i src/podglad-skroty.json. Ręcznie, po zmianie danych (npm run dane) albo szablonu obrazka.
// Wymaga: Chromium (ATLAS_CHROME=<ścieżka> albo przeglądarka Playwrighta/Chrome) i ImageMagick (`convert`). Użycie: node scripts/podglad.mjs [--wszystkie] [--slug a,b]
// Domyślnie dopisuje tylko brakujące albo nieaktualne (skrót rysunku ≠ zapisany); --wszystkie wymusza całość.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';
import { tmpdir } from 'node:os';
import { ROOT } from '../src/lib.mjs';
import { build } from '../src/build.mjs';
import { skrotPodgladu, htmlPodgladu } from '../src/podglad.mjs';

const a = process.argv.slice(2), arg = n => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : undefined; };
const KAT = join(ROOT, 'assets/podglad'), SKROTY = join(ROOT, 'src/podglad-skroty.json'), MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.js': 'text/javascript' };
const tmp = mkdtempSync(join(tmpdir(), 'atlas-podglad-')); let server, browser;
try {
  const r = await build({ out: join(tmp, 'dist'), cfg: { jezyki: ['en'] }, pominStraznikowStartu: true }), { ctx } = r;
  const ssk = existsSync(SKROTY) ? JSON.parse(readFileSync(SKROTY, 'utf8')) : {}, wybrane = arg('--slug')?.split(',');
  const lista = ctx.data.en.exercises.filter(e => e.figure && ctx.figs[e.slug] && (!wybrane || wybrane.includes(e.slug)));
  const nowe = {}, doZrobienia = lista.filter(e => { nowe[e.slug] = skrotPodgladu(ctx, ctx.figs[e.slug]); return a.includes('--wszystkie') || ssk[e.slug] !== nowe[e.slug] || !existsSync(join(KAT, `${e.slug}.png`)); });
  console.log(`podgląd: ${lista.length} ćwiczeń z rysunkiem, do wygenerowania ${doZrobienia.length}`);
  if (doZrobienia.length) {
    server = createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]), m = u.match(/^\/__og\/(.+)\.html$/);
      if (m) { res.setHeader('content-type', MIME['.html']); return res.end(htmlPodgladu(ctx, m[1], ctx.figs[m[1]])); }
      const p = normalize(join(tmp, 'dist', u)); if (!p.startsWith(join(tmp, 'dist')) || !existsSync(p)) { res.statusCode = 404; return res.end(); }
      res.setHeader('content-type', MIME[extname(p)] ?? 'application/octet-stream'); res.end(readFileSync(p));
    });
    await new Promise(ok => server.listen(0, '127.0.0.1', ok));
    const base = `http://127.0.0.1:${server.address().port}`, { chromium } = createRequire(import.meta.url)('playwright-core');
    browser = await chromium.launch(process.env.ATLAS_CHROME ? { executablePath: process.env.ATLAS_CHROME } : {});
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce' });
    mkdirSync(KAT, { recursive: true });
    for (const [i, e] of doZrobienia.entries()) {
      await page.goto(`${base}/__og/${e.slug}.html`, { waitUntil: 'load' });
      const surowy = join(tmp, 'surowy.png'); await page.screenshot({ path: surowy });
      execFileSync('convert', [surowy, '-dither', 'None', '-colors', '64', '-define', 'png:compression-level=9', '-strip', `PNG8:${join(KAT, `${e.slug}.png`)}`]);
      if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${doZrobienia.length}`);
    }
  }
  /* skróty tylko dla istniejących ćwiczeń z rysunkiem; usunięte ćwiczenia: ich pliki PNG usuwa się ręcznie (test świeżości zgłosi nadmiarowe) */
  const wszystkie = ctx.data.en.exercises.filter(e => e.figure && ctx.figs[e.slug]);
  writeFileSync(SKROTY, JSON.stringify(Object.fromEntries(wszystkie.map(e => [e.slug, nowe[e.slug] ?? ssk[e.slug] ?? skrotPodgladu(ctx, ctx.figs[e.slug])]).sort(([x], [y]) => x < y ? -1 : 1)), null, 0).replace(/,"/g, ',\n"') + '\n');
  const nadmiar = readdirSync(KAT).filter(f => !wszystkie.some(e => `${e.slug}.png` === f)); if (nadmiar.length) console.warn(`UWAGA: pliki bez ćwiczenia: ${nadmiar.join(', ')}`);
} finally { await browser?.close(); server?.close(); rmSync(tmp, { recursive: true, force: true }); }
