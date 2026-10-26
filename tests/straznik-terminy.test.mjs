// Strażnik terminów (zasada właściciela 25.10.2026, słownik aplikacji): teksty stałe strony nie używają terminów zakazanych ze słownika aplikacji
// (.cache/dane/slownik-terminow.json, pobierany przez npm run dane, nie commitowany) ani ze słownika strony (docs/slownik-strony.json).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, requireData } from './pomoc.mjs';

requireData();
const app = JSON.parse(readFileSync(join(ROOT, '.cache/dane/slownik-terminow.json'), 'utf8'));
const site = JSON.parse(readFileSync(join(ROOT, 'docs/slownik-strony.json'), 'utf8'));
const langs = readdirSync(join(ROOT, 'src/ui')).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
const ui = Object.fromEntries(langs.map(l => [l, JSON.parse(readFileSync(join(ROOT, `src/ui/${l}.json`), 'utf8'))]));
const strings = (o, out = []) => { if (typeof o === 'string') out.push(o); else if (Array.isArray(o)) o.forEach(x => strings(x, out)); else if (o && typeof o === 'object') Object.entries(o).forEach(([k, x]) => { if (!k.startsWith('_')) strings(x, out); }); return out; };
const at = (o, path) => path.split('.').reduce((a, k) => a?.[k], o);

test('słownik aplikacji: wzorce zakazane nie występują w tekstach strony (wszystkie języki)', () => {
  const bad = [];
  for (const p of app.pojecia) for (const l of langs) for (const z of p.jezyki[l]?.zakazane ?? []) {
    const re = new RegExp(z.wzorzec, 'iu');
    for (const s of strings(ui[l])) if (re.test(s)) bad.push(`${l}/${p.id}: „${s}” ~ ${z.wzorzec}`);
  }
  assert.deepEqual(bad, []);
});
test('słownik strony: struktura, zalecany termin w kluczu, zakazane poza tekstami', () => {
  const bad = [];
  for (const p of site.pojecia) {
    assert.ok(p.powod.length > 10 && ['plik', 'klucz'].includes(p.zakres), p.id);
    for (const [l, e] of Object.entries(p.jezyki)) {
      assert.ok(ui[l], `${p.id}: brak języka ${l}`);
      const vals = p.klucz.map(k => at(ui[l], k)); const hay = vals.join(' | ').toLowerCase();
      if (vals.some(v => typeof v !== 'string')) bad.push(`${p.id}/${l}: brak klucza`);
      if (!hay.includes(e.zalecany.toLowerCase())) bad.push(`${p.id}/${l}: brak „${e.zalecany}” w ${p.klucz.join(', ')}`);
      for (const z of e.zakazane ?? []) { const re = new RegExp(z, 'iu'); const scope = p.zakres === 'plik' ? strings(ui[l]) : vals; for (const s of scope) if (re.test(s)) bad.push(`${p.id}/${l}: „${s}” ~ ${z}`); }
    }
  }
  assert.deepEqual(bad, []);
});
test('samokontrola: wzorzec zakazany rzeczywiście wykrywa kalkę', () => {
  assert.ok(new RegExp('zanožen', 'iu').test('Zanožení v kyčlích'));
  assert.ok(app.pojecia.some(p => Object.values(p.jezyki).some(e => (e.zakazane ?? []).length)));
});
