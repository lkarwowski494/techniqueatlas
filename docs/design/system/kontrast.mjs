// Z-12 · kontrast par tokenów systemu „Arkusz” w 4 wariantach: jasny, ciemny, jasny + zwiększony kontrast, ciemny + zwiększony kontrast.
// WCAG 2.2: 1.4.3 tekst 4,5:1; 1.4.11 elementy interfejsu i grafika z informacją 3:1. Czyta tokeny.css (bloki :root i @media); kaskada jak w przeglądarce.
// Użycie: node docs/design/system/kontrast.mjs > docs/design/system/kontrast.md  (kod wyjścia 1 przy parze poniżej progu)
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'tokeny.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
/* bloki: klucz = warunek @media ('' = :root bez warunku) */
const blocks = {}; let m; const re = /(@media\s*([^{]+)\{\s*)?:root\{([^}]*)\}/g;
while ((m = re.exec(css))) { const k = (m[2] ?? '').trim(); blocks[k] = { ...(blocks[k] ?? {}), ...Object.fromEntries([...m[3].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map(x => [x[1], x[2]])) }; }
const has = (k, ...w) => w.every(x => k.includes(x));
const variant = (dark, more) => Object.entries(blocks).filter(([k]) => k === '' || (has(k, 'prefers-color-scheme:dark') ? dark : true) && (has(k, 'prefers-contrast:more') ? more : true) && !has(k, 'reduced-motion'))
  .reduce((o, [, v]) => ({ ...o, ...v }), {});
const lum = hex => { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
/* [para, pierwszy plan, tło, próg]; próg 0 = informacyjnie (linia dekoracyjna bez informacji) */
const PAIRS = [
  ['tekst treści na arkuszu', 'ink', 'sheet', 4.5], ['tekst drugorzędny (nazwa EN, podpisy, etykiety)', 'muted', 'sheet', 4.5], ['link na arkuszu', 'accent', 'sheet', 4.5],
  ['tekst krótkiej odpowiedzi', 'ink', 'accent-bg', 4.5], ['link na tle odpowiedzi', 'accent', 'accent-bg', 4.5],
  ['tekst na tle strony (skip, poza arkuszem)', 'ink', 'bg', 4.5], ['tekst drugorzędny na tle strony', 'muted', 'bg', 4.5],
  ['przycisk wciśnięty: tekst arkusza na tuszu', 'sheet', 'ink', 4.5],
  ['linia wymiarowa (grafika z danymi)', 'accent', 'sheet', 3], ['fokus na arkuszu', 'accent', 'sheet', 3], ['fokus na tle strony', 'accent', 'bg', 3],
  ['ramka pól (input, select)', 'rule', 'sheet', 3], ['ramka przycisków częstych błędów', 'kontrola', 'sheet', 3], ['ramka arkusza i przycisków', 'ink', 'sheet', 3], ['ramka zewnętrzna arkusza na tle', 'rule', 'bg', 3],
  ['separator wierszy (dekoracyjny)', 'hair', 'sheet', 0],
];
const V = [['jasny', false, false], ['ciemny', true, false], ['jasny + zwiększony kontrast', false, true], ['ciemny + zwiększony kontrast', true, true]];
let bad = 0; const rows = [];
for (const [name, dark, more] of V) { const v = variant(dark, more);
  for (const [p, a, b, min] of PAIRS) { const r = ratio(v[a], v[b]), ok = r >= min; if (!ok) bad++;
    rows.push(`| ${name} | ${p} | \`--${a}\` \`${v[a]}\` na \`--${b}\` \`${v[b]}\` | ${r.toFixed(2)} | ${min || '—'} | ${min ? (ok ? 'tak' : '**NIE**') : 'informacyjnie'} |`); } }
console.log(`# Kontrast tokenów systemu „Arkusz” (wygenerowane: node docs/design/system/kontrast.mjs)

Wzór: WCAG 2.2, luminancja względna sRGB. Progi: 4,5 tekst (1.4.3 AA); 3 elementy interfejsu, fokus i grafika z informacją (1.4.11). Tekst ≥ 24 px albo ≥ 19 px pogrubiony mógłby mieć 3:1 — system tego nie wykorzystuje (każdy tekst ≥ 4,5).
Separator wierszy jest dekoracyjny (wiersz ma też odstęp i tekst), więc nie ma progu; przy „Zwiększ kontrast” rośnie do ≥ 3:1.

| Wariant | Para | Kolory | Kontrast | Próg | Spełnia |
|---|---|---|---|---|---|
${rows.join('\n')}

Par poniżej progu: ${bad}.`);
process.exitCode = bad ? 1 : 0;
