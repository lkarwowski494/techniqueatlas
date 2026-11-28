// BQ3 b): żaden klucz src/ui/en.json nie spada na angielski zapas w żadnym z 33 języków obcych (pl i en są źródłami).
// Język z jednym napisem w miejscu drzewa form liczby mnogiej (np. countLine w ja) liczy się jako kompletny dla tego klucza.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { ROOT, read } from './pomoc.mjs';
import { join } from 'node:path';

const ui = (k) => JSON.parse(read(join('src/ui', `${k}.json`)));
const liscie = (o, p = [], w = []) => { for (const [k, v] of Object.entries(o)) v && typeof v === 'object' ? liscie(v, [...p, k], w) : w.push([...p, k]); return w; };
const na = (o, s) => s.reduce((a, k) => (a && typeof a === 'object' ? a[k] : undefined), o);

test('src/ui: każdy klucz angielski ma tekst w każdym z 33 języków obcych (brak spadku na zapas angielski)', () => {
  const en = ui('en'), jezyki = readdirSync(join(ROOT, 'src/ui')).map((f) => f.slice(0, -5)).filter((k) => k !== 'pl' && k !== 'en');
  assert.equal(jezyki.length, 33);
  const braki = [];
  for (const j of jezyki) {
    const d = ui(j);
    for (const s of liscie(en)) {
      const w = na(d, s), nadrzedny = s.length > 1 ? na(d, s.slice(0, -1)) : undefined;
      if (!(typeof w === 'string' && w.trim()) && !(typeof nadrzedny === 'string' && nadrzedny.trim())) braki.push(`${j} ${s.join('.')}`);
    }
  }
  assert.deepEqual(braki, [], `${braki.length} braków, np.: ${braki.slice(0, 8).join(', ')}`);
});
