// Ponowne przypięcie danych strony do commitu aplikacji jednym poleceniem: npm run przypnij -- <pełny skrót 40 znaków> [--ref <gałąź lub tag>]
// Zmienia tylko PIN.json (commit, opcjonalnie ref); reszta pliku bez zmian. Potem: npm run dane && npm test.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

/** Zwraca nową treść PIN.json z podmienionym commitem (i refem); błąd przy skrócie innym niż 40 znaków szesnastkowych małymi literami. */
export function przypnij(pin, commit, ref) {
  if (!/^[0-9a-f]{40}$/.test(commit ?? '')) throw new Error('podaj pełny skrót commitu (40 znaków szesnastkowych, małe litery)');
  if (ref !== undefined && !/^[A-Za-z0-9._\/-]+$/.test(ref)) throw new Error('ref: dozwolone litery, cyfry oraz . _ / -');
  return { ...pin, ...(ref !== undefined ? { ref } : {}), commit };
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], 'file://').href) {
  const a = process.argv.slice(2), i = a.indexOf('--ref'), ref = i >= 0 ? a[i + 1] : undefined, commit = a.find((x, k) => !x.startsWith('--') && (i < 0 || k !== i + 1));
  const file = join(ROOT, 'PIN.json'), next = przypnij(JSON.parse(readFileSync(file, 'utf8')), commit, ref);
  writeFileSync(file, JSON.stringify(next, null, 2) + '\n');
  console.log(`PIN.json: ${next.repoAplikacji} ${next.ref} @ ${commit.slice(0, 7)} — uruchom: npm run dane`);
}
