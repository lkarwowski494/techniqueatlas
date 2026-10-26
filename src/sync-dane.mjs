// Pobranie danych z publicznego repo aplikacji (D5 A): checkout przypiętego commitu (PIN.json) → eksport (.cache/dane) + silnik figur (.cache/silnik). Nic z tego nie trafia do gita.
// Użycie: npm run dane [-- --app <ścieżka do lokalnego repo aplikacji na tym samym commicie>]   (bez --app: klon płytki do .cache/app)
// Narzędzia: eksport aplikacji potrzebuje tylko `typescript` i `terser` — instalowane (wersje z package.json / package-lock.json aplikacji) do .cache/tools, bez instalowania całej aplikacji.
import { execFileSync } from 'node:child_process';
import { copyFileSync } from 'node:fs';
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, lstatSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readJson } from './lib.mjs';

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'inherit', ...opts });
const out = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', ...opts }).trim();
const a = process.argv.slice(2), arg = n => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : undefined; };

const pin = readJson('PIN.json'), cfg = readJson('config.json'), cache = join(ROOT, '.cache');
if (!/^[0-9a-f]{40}$/.test(pin.commit)) throw new Error('PIN.json: commit musi być pełnym skrótem (40 znaków)');
mkdirSync(cache, { recursive: true });

/* 1. repo aplikacji w przypiętym commicie */
let app = arg('--app');
if (app) { const head = out('git', ['rev-parse', 'HEAD'], { cwd: app }); if (head !== pin.commit) throw new Error(`repo aplikacji (${head.slice(0, 7)}) ≠ PIN.json (${pin.commit.slice(0, 7)})`); if (out('git', ['status', '--porcelain'], { cwd: app })) throw new Error('repo aplikacji ma niezatwierdzone zmiany'); }
else {
  app = join(cache, 'app');
  const have = existsSync(join(app, '.git')) && (() => { try { return out('git', ['rev-parse', 'HEAD'], { cwd: app }) === pin.commit; } catch { return false; } })();
  if (!have) {
    rmSync(app, { recursive: true, force: true }); mkdirSync(app, { recursive: true });
    run('git', ['init', '-q'], { cwd: app }); run('git', ['remote', 'add', 'origin', `https://github.com/${pin.repoAplikacji}.git`], { cwd: app });
    run('git', ['fetch', '--depth', '1', '-q', 'origin', pin.commit], { cwd: app }); run('git', ['checkout', '-q', 'FETCH_HEAD'], { cwd: app });
    if (out('git', ['rev-parse', 'HEAD'], { cwd: app }) !== pin.commit) throw new Error('pobrany commit ≠ PIN.json');
  }
}

/* 2. narzędzia eksportu: tylko typescript i terser, w wersjach aplikacji */
const pkg = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8')), lock = JSON.parse(readFileSync(join(app, 'package-lock.json'), 'utf8'));
const ver = n => lock.packages?.[`node_modules/${n}`]?.version ?? (pkg.devDependencies?.[n] ?? pkg.dependencies?.[n] ?? '').replace(/^[~^]/, '');
const tools = join(cache, 'tools'); mkdirSync(tools, { recursive: true });
const want = { typescript: ver('typescript'), terser: ver('terser') };
if (!want.typescript || !want.terser) throw new Error('nie znaleziono wersji typescript/terser w package.json lub package-lock.json aplikacji');
writeFileSync(join(tools, 'package.json'), JSON.stringify({ name: 'atlas-tools', private: true, dependencies: want }, null, 1));
run('npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts', '--loglevel=error'], { cwd: tools });
const nm = join(app, 'node_modules');
if (!existsSync(nm) || lstatSync(nm).isSymbolicLink()) { rmSync(nm, { recursive: true, force: true }); symlinkSync(join(tools, 'node_modules'), nm, 'dir'); }
else if (!existsSync(join(nm, 'typescript')) || !existsSync(join(nm, 'terser'))) throw new Error('lokalne repo aplikacji bez typescript/terser w node_modules');

/* 3. eksport i silnik */
rmSync(join(cache, 'dane'), { recursive: true, force: true }); rmSync(join(cache, 'silnik'), { recursive: true, force: true });
run('node', [join(app, 'scripts/strona/eksport.mjs'), '--out', join(cache, 'dane'), '--langs', cfg.jezyki.join(',')]);
run('node', [join(app, 'scripts/strona/silnik-build.mjs'), '--out', cache]);
/* słownik terminów aplikacji (wzorce zakazane) dla strażnika terminów strony — jak wzorce źródeł: do .cache, nie do gita */
copyFileSync(join(app, 'docs/lokalizacja/slownik-terminow.json'), join(cache, 'dane/slownik-terminow.json'));
const man = readJson('.cache/dane/manifest.json');
if (man.app.commit !== pin.commit) throw new Error(`eksport (${man.app.commit}) ≠ PIN.json (${pin.commit})`);
console.log(`dane: wersja ${man.app.version}, commit ${pin.commit.slice(0, 7)}, języki: ${cfg.jezyki.join(',')}`);
