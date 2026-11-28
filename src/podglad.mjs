// Z-34 (A9, A11): obrazek podglądu strony ćwiczenia (og:image, primaryImageOfPage) — PNG 1200×630, jeden na ćwiczenie z rysunkiem, wspólny dla języków.
// Pliki leżą w assets/podglad/<slug>.png (commitowane, ok. 13 KB każdy); generuje je ręcznie scripts/podglad.mjs (Chromium + ImageMagick), bo budowanie strony ma zostać bez przeglądarki.
// Test świeżości (tests/z34-podglad.test.mjs) porównuje skrót rysunku ćwiczenia z src/podglad-skroty.json: zmiana danych figury albo szablonu = test czerwony do czasu ponownego wygenerowania.
import { createHash } from 'node:crypto';
import { poseSheet } from './pages.mjs';

/** Szablon obrazka (docs/design/system/podglad/podglad.css, Z-12): arkusz z podwójną ramką, motyw jasny, bez tekstu. Zmiana szablonu zmienia skrót wszystkich obrazków. */
export const CSS_PODGLADU = `.og{margin:0;width:1200px;height:630px;background:var(--bg);display:flex;align-items:center;justify-content:center;color-scheme:light}
.og-arkusz{width:1120px;height:550px;background:var(--sheet);border:3px solid var(--ink);outline:2px solid var(--rule);outline-offset:10px;display:flex;align-items:center;justify-content:center;gap:48px;padding:40px 64px}
.og-arkusz svg{height:100%;width:auto;flex:0 1 auto}`;

/** Skrót (16 znaków) rysunku, z którego powstaje obrazek: arkusz pozycji ćwiczenia (geometria i kadr) + szablon. */
export const skrotPodgladu = (ctx, fig) => createHash('sha256').update(poseSheet(ctx, fig)).update(CSS_PODGLADU).digest('hex').slice(0, 16);

/** HTML obrazka dla jednego ćwiczenia: pozycje (start i koniec, a figura statyczna — tylko koniec) z arkusza assets/poz/<slug>.svg, kadr z arkusza. */
export function htmlPodgladu(ctx, slug, fig) {
  const arkusz = poseSheet(ctx, fig), vb = arkusz.match(/viewBox="([^"]+)"/)[1], ids = [...arkusz.matchAll(/<g id="(start|end)"/g)].map(m => m[1]);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="/assets/site.css"><style>${CSS_PODGLADU}</style></head><body class="og"><div class="og-arkusz">${ids.map(id => `<svg viewBox="${vb}" aria-hidden="true"><use href="/assets/poz/${slug}.svg#${id}"/></svg>`).join('')}</div></body></html>`;
}
