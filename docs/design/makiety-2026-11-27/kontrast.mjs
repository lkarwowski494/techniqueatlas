// Kontrast par kolorów kierunków A–C (WCAG 2.2: 1.4.3 tekst 4,5:1; 1.4.11 elementy interfejsu i grafika 3:1), oba motywy.
// Czyta zmienne z <kierunek>/styl.css i zasoby/baza.css (blok :root i blok prefers-color-scheme:dark). Wynik: tabela Markdown na stdout; kod wyjścia 1 przy parze poniżej progu.
// Użycie: node docs/design/makiety-2026-11-27/kontrast.mjs > docs/design/makiety-2026-11-27/kontrast.md
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const vars = css => { const out = { light: {}, dark: {} }; const dark = css.indexOf('prefers-color-scheme:dark');
  for (const m of css.matchAll(/--([\w-]+):(#[0-9a-fA-F]{6})/g)) (dark >= 0 && m.index > dark ? out.dark : out.light)[m[1]] = m[2];
  return out; };
const lum = hex => { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
/* [nazwa, tekst/obiekt, tło, próg, rola] */
const PAIRS = {
  'a-arkusz': [['tekst', 'ink', 'sheet', 4.5], ['tekst drugorzędny', 'muted', 'sheet', 4.5], ['link, akcent', 'accent', 'sheet', 4.5], ['tekst w krótkiej odpowiedzi', 'ink', 'accent-bg', 4.5], ['link na tle odpowiedzi', 'accent', 'accent-bg', 4.5], ['tekst drugorzędny na tle strony', 'muted', 'bg', 4.5], ['ramka pól i przycisków', 'rule', 'sheet', 3], ['ramka przycisków błędów', 'kontrola', 'sheet', 3], ['linia wymiarowa (grafika z danymi)', 'accent', 'sheet', 3]],
  'b-plansza': [['tekst', 'ink', 'bg', 4.5], ['tekst drugorzędny', 'muted', 'bg', 4.5], ['link', 'accent', 'bg', 4.5], ['tekst na tle figury', 'ink', 'tint', 4.5], ['tekst drugorzędny na tle figury', 'muted', 'tint', 4.5], ['przycisk główny (tekst tła na tuszu)', 'bg', 'ink', 4.5], ['ramka pól i przycisków', 'frame-ui', 'bg', 3], ['ramka przycisków na tle figury', 'frame-ui', 'tint', 3], ['legenda: mięśnie główne', 'mm-l4', 'bg', 3], ['legenda: mięśnie pomocnicze', 'mm-l2', 'bg', 3]],
  'c-karta': [['tekst', 'ink', 'card', 4.5], ['tekst drugorzędny', 'muted', 'card', 4.5], ['link', 'accent', 'card', 4.5], ['tekst na tle strony', 'ink', 'bg', 4.5], ['link na tle strony (okruszki, stopka)', 'accent', 'bg', 4.5], ['tekst drugorzędny na tle strony', 'muted', 'bg', 4.5], ['tekst w krótkiej odpowiedzi i literach', 'ink', 'tab', 4.5], ['ramka kart, pól i przycisków', 'edge', 'card', 3]],
};
const base = vars(readFileSync(join(HERE, 'zasoby/baza.css'), 'utf8'));
let bad = 0; const rows = [];
for (const [k, pairs] of Object.entries(PAIRS)) {
  const v = vars(readFileSync(join(HERE, k, 'styl.css'), 'utf8'));
  for (const t of ['light', 'dark']) {
    const get = n => v[t][n] ?? v.light[n] ?? base[t][n] ?? base.light[n];
    for (const [name, a, b, min] of pairs) { const r = ratio(get(a), get(b)); const ok = r >= min; if (!ok) bad++;
      rows.push(`| ${k} | ${t === 'light' ? 'jasny' : 'ciemny'} | ${name} | \`${get(a)}\` na \`${get(b)}\` | ${r.toFixed(2)} | ${min} | ${ok ? 'tak' : '**NIE**'} |`); }
  }
}
console.log(`# Kontrast kierunków Z-10 (wygenerowane: node kontrast.mjs)\n\nWzór: WCAG 2.2, luminancja względna sRGB. Progi: 4,5 tekst (1.4.3 AA), 3 elementy interfejsu i grafika z informacją (1.4.11).\n\n| Kierunek | Motyw | Para | Kolory | Kontrast | Próg | Spełnia |\n|---|---|---|---|---|---|---|\n${rows.join('\n')}\n\nPar poniżej progu: ${bad}.`);
process.exitCode = bad ? 1 : 0;
