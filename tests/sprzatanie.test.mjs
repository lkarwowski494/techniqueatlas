// Strażnik sprzątania (02.11.2026): katalogi z tmpDist()/tmpDir() znikają po zakończeniu pliku testów — przy sukcesie, porażce testu, wyjątku i SIGTERM.
// Powód: 01.11.2026 85 × atlas-dist-* (ok. 40 GB) zostało w katalogu tymczasowym i zapełniło dysk sesji. Cały przebieg `npm test` pilnuje dodatkowo tests/uruchom-testy.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from '../src/lib.mjs';

const pomoc = pathToFileURL(join(ROOT, 'tests/pomoc.mjs')).href;
/* Skrypt potomny: tworzy katalogi przez pomoc.mjs (z plikiem w środku, jak build), wypisuje ich ścieżki, potem kończy się wg `koniec`. */
const skrypt = koniec => `import { tmpDist, tmpDir } from ${JSON.stringify(pomoc)}; import { writeFileSync } from 'node:fs'; import { join } from 'node:path';
const a = tmpDist(), b = tmpDir('atlas-pin-'); writeFileSync(join(a, 'index.html'), 'x'); console.log(JSON.stringify([a, b]));
${koniec}`;
/* Każdy przypadek w osobnym TMPDIR — sprawdzamy też, że w katalogu tymczasowym nie zostaje nic. */
function wTmp(fn) { const t = mkdtempSync(join(tmpdir(), 'atlas-straznik-')); try { return fn(t); } finally { rmSync(t, { recursive: true, force: true }); } }
const env = t => ({ ...process.env, TMPDIR: t, TMP: t, TEMP: t });
const sprawdz = (t, stdout) => { const dirs = JSON.parse(stdout.split('\n').find(l => l.startsWith('['))); assert.equal(dirs.length, 2); for (const d of dirs) { assert.ok(d.startsWith(t), d); assert.ok(!existsSync(d), `został ${d}`); } assert.deepEqual(readdirSync(t), []); };

for (const [nazwa, koniec, oczekiwanyKod] of [
  ['zwykłe zakończenie', '', 0],
  ['wyjątek bez obsługi', "throw new Error('celowo');", 1],
  ['process.exit(3)', 'process.exit(3);', 3],
  ['porażka testu node:test', "const { default: test } = await import('node:test'); test('celowo czerwony', () => { throw new Error('x'); });", 1],
]) test(`sprzątanie katalogów tymczasowych: ${nazwa} → brak atlas-dist-*/atlas-pin-*`, () => wTmp(t => {
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', skrypt(koniec)], { env: env(t), encoding: 'utf8' });
  assert.equal(r.status, oczekiwanyKod, r.stderr); sprawdz(t, r.stdout);
}));

test('sprzątanie katalogów tymczasowych: SIGTERM w trakcie (np. przerwany przebieg) → brak pozostałości', async () => {
  const t = mkdtempSync(join(tmpdir(), 'atlas-straznik-'));
  try {
    const ch = spawn(process.execPath, ['--input-type=module', '-e', skrypt('setInterval(() => {}, 1000);')], { env: env(t) });
    let out = ''; await new Promise(res => ch.stdout.on('data', d => { out += d; if (out.includes('\n')) res(); }));
    ch.kill('SIGTERM'); const sig = await new Promise(res => ch.on('exit', (code, s) => res(s)));
    assert.equal(sig, 'SIGTERM'); sprawdz(t, out);
  } finally { rmSync(t, { recursive: true, force: true }); }
});

test('wszystkie katalogi tymczasowe testów powstają przez pomoc.mjs (tmpDist/tmpDir), nie bezpośrednio przez mkdtemp', () => {
  const pliki = readdirSync(join(ROOT, 'tests')).filter(f => /\.(mjs|js)$/.test(f) && !['pomoc.mjs', 'sprzatanie.test.mjs', 'uruchom-testy.mjs'].includes(f));
  const bezposrednio = pliki.filter(f => /mkdtemp/.test(readFileSync(join(ROOT, 'tests', f), 'utf8')));
  assert.deepEqual(bezposrednio, [], 'użyj tmpDir()/tmpDist() z tests/pomoc.mjs — tylko one sprzątają po sobie');
});
