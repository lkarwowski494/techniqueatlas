#!/usr/bin/env node
// przeglad tekstów strony przez API Anthropic (Message Batches). Opis, limity i kody wyjścia: scripts/przeklad/rdzen.mjs, docs/przeklad/README.md.
// Użycie: node scripts/przeklad/przeglad-api.mjs --szacuj [--zrodlo nazwy,szablony,prawne] [--limit N] [--model opus|sonnet] [--zgoda-koszt] | --wznow msgbatch_… | --zapisz-wydatek <katalog>
import { pathToFileURL } from 'node:url';
import { main } from './rdzen.mjs';
import { maskuj } from './wspolne.mjs';

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main('przeglad', process.argv.slice(2), process.env).then((c) => process.exit(c), (e) => { console.error(`błąd: ${maskuj(e.message, process.env.ANTHROPIC_API_KEY ?? '')}`); process.exit(1); });
}
