// Strażnik anonimowości (od pierwszego commita): publicznie nigdzie nie piszemy o źródłach wiedzy — ani nazw organizacji i autorów, ani odwołań ogólnych w tekstach dla czytelnika.
// Lista wzorców pochodzi z repo aplikacji (lib/sources.ts → .cache/dane/wzorce-zrodel.json, pobierana w CI; ta sama co tests/zrodla-wiedzy.test.ts), więc jest jedna lista na oba repozytoria i nie jest commitowana.
// Nazwy: całe repozytorium i zbudowana strona; odwołania ogólne: teksty dla czytelnika (zbudowane strony i dane z .cache).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { repoFiles, isText, read, distFiles, buildOnce, requireData, ROOT } from './pomoc.mjs';

requireData(); /* lista wzorców pochodzi z aplikacji (pobrana do .cache przez npm run dane) — nie jest commitowana */
const pat = JSON.parse(readFileSync(join(ROOT, '.cache/dane/wzorce-zrodel.json'), 'utf8'));
const NAME = new RegExp(`(?<![\\p{L}])(?:${pat.name.join('|')})`, 'u');
const GENERIC = new RegExp(`(?<![\\p{L}])(?:${pat.generic.join('|')})`, 'iu');
const strings = (o, out = []) => { if (typeof o === 'string') out.push(o); else if (Array.isArray(o)) o.forEach(x => strings(x, out)); else if (o && typeof o === 'object') Object.entries(o).forEach(([k, x]) => { if (!k.startsWith('_')) strings(x, out); }); return out; };
const visible = html => html.replace(/<!--[\s\S]*?-->|<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<[^>]+>/g, ' ');

test('wzorce istnieją i rozpoznają nazwy oraz odwołania ogólne (samokontrola strażnika; próbki składane w locie, by nie trafić w skan repozytorium)', () => {
  assert.ok(pat.name.length > 10 && pat.generic.length > 10);
  for (const s of ['He' + 'lms 2016', 'AC' + 'SM 2026', 'Pel' + 'land' + ' et al. 2026', 'Na podsta' + 'wie badań', 'Based on' + ' research']) assert.ok(NAME.test(s) || GENERIC.test(s), s);
  for (const s of ['Dumbbell row', 'Back Squat', 'Bar across your upper back']) assert.ok(!NAME.test(s) && !GENERIC.test(s), s);
});
test('żaden plik repozytorium nie zawiera nazwy źródła', () => {
  const bad = [];
  for (const f of repoFiles().filter(isText)) { const t = read(f); const m = t.match(NAME); if (m) bad.push(`${f}: ${m[0]}`); }
  assert.deepEqual(bad, []);
});
test('teksty dla czytelnika w danych z aplikacji (.cache/dane, pl i en) nie mają nazw źródeł ani odwołań ogólnych', () => {
  const bad = [];
  for (const f of readdirSync(join(ROOT, '.cache/dane')).filter(f => /^atlas-[\w-]+\.json$/.test(f))) { const l = f.match(/atlas-(.+)\.json/)[1]; for (const s of strings(JSON.parse(readFileSync(join(ROOT, '.cache/dane', f), 'utf8')))) if (NAME.test(s) || ((l === 'pl' || l === 'en') && GENERIC.test(s))) bad.push(`${f}: ${s.slice(0, 60)}`); }
  assert.deepEqual(bad, []);
});
test('zbudowana strona (wszystkie ćwiczenia i języki): HTML, JS i JSON bez nazw źródeł; tekst widoczny bez odwołań ogólnych', async () => {
  const { out } = await buildOnce();
  for (const p of distFiles(out)) {
    if (!['.html', '.js', '.json', '.txt', '.xml'].includes(extname(p))) continue;
    const t = readFileSync(p, 'utf8'); assert.ok(!NAME.test(t), `${p}: nazwa źródła`);
    if (extname(p) === '.html') assert.ok(!GENERIC.test(visible(t)), `${p}: odwołanie ogólne`);
  }
});
