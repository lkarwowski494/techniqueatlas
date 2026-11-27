// Z-30: pilnowanie testów oczekujących (CZEKA(<zadanie>) z tests/strona-html.mjs, `todo` w node:test). Oznaczenie nie blokuje CI do wdrożenia, więc mechanicznie pilnujemy,
// że nie zostanie po wdrożeniu (zasada 21: kontrola wymuszona testem, nie linią w dokumencie): zadanie `zrobione` w docs/55-plan-startu.md → w tests/ nie ma już CZEKA('<to zadanie>').
// Każde oznaczenie todo w testach ma ID zadania planu, a liczby oczekujących testów w docs/55-strategia-testow-wdrozenia.md zgadzają się z kodem (tabela nie rozjedzie się z testami).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { parsePlan } from '../src/plan-startu.mjs';
import { read } from './pomoc.mjs';

const pliki = readdirSync(new URL('.', import.meta.url)).filter(f => f.endsWith('.mjs') && f !== 'z30-oczekujace.test.mjs' && f !== 'strona-html.mjs');
const znaczniki = pliki.flatMap(f => [...read(`tests/${f}`).matchAll(/,\s*CZEKA\('([^']*)'/g)].map(m => ({ f, id: m[1] })));
const policz = () => znaczniki.reduce((a, z) => ({ ...a, [z.id]: (a[z.id] ?? 0) + 1 }), {});

test('Z-30 testy oczekujące: każde CZEKA ma ID zadania Z-NN z planu startu, a w testach nie ma gołego todo bez CZEKA', () => {
  const { rows } = parsePlan(read('docs/55-plan-startu.md')), ids = new Set(rows.map(r => r.id));
  assert.deepEqual(znaczniki.filter(z => !ids.has(z.id)).map(z => `${z.f}: ${z.id}`), []);
  assert.deepEqual(pliki.filter(f => /\btodo\s*:/.test(read(`tests/${f}`))), []);
});

test('Z-30 zadanie „zrobione” w docs/55-plan-startu.md nie ma już testów oczekujących (wdrażający zdejmuje CZEKA w commicie, który zazielenia test)', () => {
  const zrobione = new Set(parsePlan(read('docs/55-plan-startu.md')).rows.filter(r => r.stan === 'zrobione').map(r => r.id));
  assert.deepEqual(znaczniki.filter(z => zrobione.has(z.id)).map(z => `${z.f}: ${z.id}`), []);
});

test('Z-30 liczby testów oczekujących w docs/55-strategia-testow-wdrozenia.md (wiersz „Oczekujące:”) zgadzają się z testami', () => {
  const doc = read('docs/55-strategia-testow-wdrozenia.md'), w = doc.match(/^Oczekujące: (.+)$/m)?.[1]; assert.ok(w, 'brak wiersza „Oczekujące: Z-31 n, …”');
  const zDoc = Object.fromEntries([...w.matchAll(/(Z-\d{2}) (\d+)/g)].map(m => [m[1], Number(m[2])]));
  assert.deepEqual(zDoc, policz());
});
