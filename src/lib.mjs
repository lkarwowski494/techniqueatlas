// Wspólne drobiazgi generatora: czytanie JSON, ucieczka HTML, ścieżki względne, szablony.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, posix } from 'node:path';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const CACHE = join(ROOT, '.cache');
export const readJson = rel => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
export const hasData = () => existsSync(join(CACHE, 'dane/manifest.json')) && existsSync(join(CACHE, 'silnik/figura.js'));
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = s => String(s).replace(/[&<>"']/g, c => ESC[c]);
/** JSON do wstawienia w <script type="application/json">: bez sekwencji kończącej znacznik. */
export const jsonForScript = o => JSON.stringify(o).replace(/</g, '\\u003c');
/** Szablon {klucz}. */
export const fill = (tpl, vars) => Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), tpl);
/** Adres względny z pliku `from` (np. "pl/exercises/x/index.html") do pliku/katalogu `to` (np. "pl/exercises/y/"). */
export function relUrl(from, to) {
  const dir = posix.dirname(from); let r = posix.relative(dir === '.' ? '' : dir, to.replace(/\/$/, '') || '.');
  if (to.endsWith('/')) r = (r ? r + '/' : './'); return r || './';
}
