// Przeglądarka bezgłowa dla testów (S8 dostępność, zachowanie figury): Playwright (tylko devDependency `playwright-core`, bez pobierania przeglądarek — używa zainstalowanego Chrome/Chromium)
// i mały serwer plików z katalogu dist (bez zewnętrznych połączeń). Kolejność szukania przeglądarki: ATLAS_CHROME (ścieżka), dołączony Chromium Playwrighta, zainstalowany Google Chrome (runner GitHub Actions).
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const require = createRequire(import.meta.url);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain' };

/** Uruchamia przeglądarkę; brak przeglądarki to błąd z instrukcją (test dostępności nie jest pomijany po cichu). */
export async function launch() {
  const { chromium } = require('playwright-core'), tries = [];
  if (process.env.ATLAS_CHROME) tries.push({ executablePath: process.env.ATLAS_CHROME });
  tries.push({}, { channel: 'chrome' });
  const errs = [];
  for (const o of tries) { try { return await chromium.launch(o); } catch (e) { errs.push(String(e.message).split('\n')[0]); } }
  throw new Error(`brak przeglądarki do testów (S8): zainstaluj Google Chrome albo ustaw ATLAS_CHROME=<ścieżka>; próby: ${errs.join(' | ')}`);
}

/** Serwer plików dla zbudowanej strony: katalog → index.html, brak pliku → 404.html (jak GitHub Pages). */
export function serve(root) {
  const server = createServer((req, res) => {
    let p = normalize(join(root, decodeURIComponent(req.url.split('?')[0]))); if (!p.startsWith(root)) { res.statusCode = 403; return res.end(); }
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
    const found = existsSync(p); if (!found) { res.statusCode = 404; p = join(root, '404.html'); }
    res.setHeader('content-type', MIME[extname(p)] ?? 'application/octet-stream'); res.end(readFileSync(p));
  });
  return new Promise(ok => server.listen(0, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(r => server.close(r)) })));
}

export const axeSource = () => readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
export const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Uruchamia axe-core na stronie; zwraca listę naruszeń { id, impact, target, help }. */
export async function axeViolations(page, source) {
  await page.evaluate(source);
  const r = await page.evaluate(tags => globalThis.axe.run(document, { runOnly: { type: 'tag', values: tags } }), AXE_TAGS);
  return r.violations.flatMap(v => v.nodes.map(n => ({ id: v.id, impact: v.impact, target: n.target.join(' '), help: v.help })));
}
