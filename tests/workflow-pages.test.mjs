// Workflow Pages (badanie indeksowania 01.11.2026, pkt 2, 5 i 7): po wdrożeniu krok sprawdzający, który tylko ostrzega (nic nie wdraża i nie przerywa publikacji).
// Sprawdza: robots.txt bez Disallow przy indeksowanie=false, noindex w HTML strony ćwiczenia, przy ustawionej domenie przekierowania HTTP→HTTPS i github.io→domena ze ścieżką.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../src/lib.mjs';

const yml = readFileSync(join(ROOT, '.github/workflows/pages.yml'), 'utf8');
const lines = yml.split('\n'), at = re => lines.findIndex(l => re.test(l));
const stepStart = at(/^\s+- name: Sprawdzenie po wdrożeniu/);
const step = stepStart < 0 ? '' : lines.slice(stepStart).join('\n'); /* krok jest ostatni */

test('pages.yml: krok „Sprawdzenie po wdrożeniu” istnieje i następuje po wdrożeniu (deploy-pages)', () => {
  assert.ok(stepStart > 0, 'brak kroku');
  assert.ok(stepStart > at(/uses: actions\/deploy-pages@/), 'krok sprawdzający musi być po deploy-pages');
});
test('pages.yml: krok sprawdza robots.txt (brak Disallow przy indeksowanie=false), noindex w HTML ćwiczenia, HTTP→HTTPS i github.io→domena ze ścieżką', () => {
  assert.match(step, /curl -sI/);
  assert.match(step, /robots\.txt/); assert.match(step, /Disallow/);
  assert.match(step, /noindex/); assert.match(step, /exercises\//);
  assert.match(step, /http:\/\//); assert.match(step, /github\.io/); assert.match(step, /Location/i);
  assert.match(step, /indeksowanie/); assert.match(step, /domena/);
});
test('pages.yml: krok tylko ostrzega (::warning::, continue-on-error), nie przerywa i niczego nie wdraża; brak sekretów', () => {
  assert.match(step, /::warning::/); assert.match(step, /continue-on-error: true/);
  assert.doesNotMatch(step, /secrets\.|deploy-pages|git push/);
});
test('pages.yml: komentarz nagłówka nie mówi o „Disallow” jako ustawieniu robots (robots.txt przy indeksowanie=false zezwala, noindex w HTML)', () => {
  const head = lines.filter(l => l.startsWith('#')).join('\n');
  assert.doesNotMatch(head, /robots Disallow|„Disallow: \/”/);
  assert.match(head, /Allow/);
});
