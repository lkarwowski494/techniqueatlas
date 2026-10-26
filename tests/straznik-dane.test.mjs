// Strażnik przepływu danych (decyzja właściciela 26.10.2026, D5 A): w repo strony nie ma ŻADNYCH danych z aplikacji — ani eksportu (atlas-*.json), ani figur (figury.json), ani listy wzorców, ani silnika.
// Dane pobiera CI (i `npm run dane`) z publicznego repo aplikacji na przypiętym commicie do .cache/ (poza gitem); publikowany jest tylko wygenerowany HTML/SVG, bez czystego zbioru danych do pobrania.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { repoFiles, distFiles, buildOnce, ROOT } from './pomoc.mjs';

const DATA_FILE = /(^|\/)(atlas-[\w-]+\.json|figury\.json|manifest\.json|wzorce-zrodel\.json)$/;

test('w repozytorium nie ma plików danych z aplikacji (atlas-*.json, figury.json, manifest.json, wzorce-zrodel.json), katalogu dane/ ani zatwierdzonego silnika', () => {
  const files = repoFiles();
  assert.deepEqual(files.filter(f => DATA_FILE.test(f)), []);
  assert.deepEqual(files.filter(f => /^(dane|silnik|\.cache)\//.test(f)), []);
  assert.ok(!existsSync(join(ROOT, 'dane')) && !existsSync(join(ROOT, 'silnik')));
});
test('żaden plik repozytorium nie jest większy niż 300 KB (dane nie wracają pod inną nazwą)', () => {
  assert.deepEqual(repoFiles().filter(f => statSync(join(ROOT, f)).size > 300 * 1024), []);
});
test('.gitignore wyklucza .cache/ i dist/', () => { const g = readFileSync(join(ROOT, '.gitignore'), 'utf8'); assert.match(g, /^\.cache\/$/m); assert.match(g, /^dist\/$/m); });
test('PIN.json: repo aplikacji, ref i pełny skrót commitu; nic więcej (bez danych)', () => {
  const pin = JSON.parse(readFileSync(join(ROOT, 'PIN.json'), 'utf8'));
  assert.deepEqual(Object.keys(pin).filter(k => !k.startsWith('_')).sort(), ['commit', 'ref', 'repoAplikacji']); assert.match(pin.commit, /^[0-9a-f]{40}$/); assert.match(pin.repoAplikacji, /^[\w.-]+\/[\w.-]+$/);
});
test('workflowy pobierają dane z aplikacji przed testami i budowaniem (npm run dane) i nie wymagają sekretów', () => {
  for (const f of repoFiles().filter(f => /^\.github\/workflows\/(tests|pages)\.ya?ml$/.test(f))) {
    const t = readFileSync(join(ROOT, f), 'utf8'); const i = t.indexOf('npm run dane'); assert.ok(i > 0, `${f}: brak npm run dane`); assert.ok(i < t.indexOf('npm test') && i < t.indexOf('npm run build'), `${f}: dane po testach`);
  }
});
test('zbudowana strona nie zawiera plików danych do pobrania hurtem (JSON z katalogiem ćwiczeń, ZIP, CSV); są tylko HTML, CSS, moduły JS (figury i indeks nazw) i mapy witryny', async () => {
  const { out } = await buildOnce();
  const files = distFiles(out).map(p => p.slice(out.length + 1));
  assert.deepEqual(files.filter(f => /\.(zip|csv|tsv|xlsx|gz|tar)$/.test(f)), []);
  assert.deepEqual(files.filter(f => f.endsWith('.json')), []);
  assert.deepEqual(files.filter(f => DATA_FILE.test(f)), []);
});
