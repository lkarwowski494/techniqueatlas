// Plan startu strony (docs/55-plan-startu.md, Z-00): tabela zadań z wymuszonym odhaczaniem. Czyste funkcje: tekst → { rows, errors }, wiersze → { errors, warnings }.
// Reguły: (a) format; (b) „zrobione” wymaga daty RRRR-MM-DD i dowodu; (c) nie „zrobione”, gdy zadanie z „Po” nie jest; (d) przy indeksowanie=true wszystkie zadania etapów 0–5 „zrobione” albo „odpada” (S11); etap 6 (Z-60…Z-65) dzieje się po włączeniu Google, więc nie blokuje (ZM-20, zadanie 4 koordynatora).
// „odpada”: zadanie wycofane decyzją właściciela; wymaga daty i powodu (ID decyzji albo ścieżka), liczy się jako załatwione dla S11 i dla „Po” następników, a własnego „Po” nie sprawdza.
export const KOLUMNY = ['ID', 'Zadanie', 'Rola', 'Model', 'Czas', 'Po', 'Stan', 'Data', 'Dowód'];
export const STANY = ['otwarte', 'w toku', 'zrobione', 'odpada'];
/** Ostatni etap, który S11 wymaga załatwić przed indeksowanie=true. */
export const PROG_ETAP = 5;
const ID = /^Z-\d{2}$/, ISO_DATE = /^\d{4}-\d{2}-\d{2}$/, PUSTE = new Set(['', '—', '-', '–']);
const cells = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
/** Etap zadania z jego ID: Z-0x → 0, Z-6x → 6, Z-7x → 7 (po starcie, poza bramką). */
export const etap = id => Number(id.slice(2, 3));

export function parsePlan(md) {
  const lines = String(md ?? '').split('\n'), errors = [], rows = [];
  const h = lines.findIndex(l => l.trim().startsWith('|') && cells(l).join('|') === KOLUMNY.join('|'));
  if (h < 0) return { rows, errors: [`plan startu: brak tabeli z kolumnami ${KOLUMNY.join(' | ')}`] };
  for (const l of lines.slice(h + 2)) {
    if (!l.trim().startsWith('|')) break;
    const c = cells(l);
    if (c.length !== KOLUMNY.length) { errors.push(`plan startu: wiersz „${l.slice(0, 40)}” ma ${c.length} kolumn zamiast ${KOLUMNY.length}`); continue; }
    const [id, zadanie, rola, model, czas, po, stan, data, dowod] = c;
    if (!ID.test(id)) { errors.push(`plan startu: „${id}” — ID nie ma postaci Z-NN`); continue; }
    if (rows.some(r => r.id === id)) { errors.push(`plan startu: ${id} zduplikowany`); continue; }
    if (!STANY.includes(stan)) errors.push(`plan startu: ${id} ma Stan „${stan}” (dozwolone: ${STANY.join(', ')})`);
    rows.push({ id, zadanie, rola, model, czas, po: PUSTE.has(po) ? [] : po.split(/\s*,\s*/), stan, data: PUSTE.has(data) ? '' : data, dowod: PUSTE.has(dowod) ? '' : dowod });
  }
  const ids = new Set(rows.map(r => r.id));
  for (const r of rows) for (const p of r.po) {
    if (p === r.id) errors.push(`plan startu: ${r.id} ma w „Po” samo siebie`);
    else if (!ids.has(p)) errors.push(`plan startu: ${r.id} ma w „Po” nieznane zadanie ${p}`);
  }
  return { rows, errors };
}

const sample = (xs, n = 6) => xs.slice(0, n).join(', ') + (xs.length > n ? `, … (+${xs.length - n})` : '');
/** S11: reguły (b), (c), (d); „odpada” jak „zrobione” (data i powód), bez sprawdzania „Po” zadania, które odpadło. Przy indeksowaniu naruszenia (b) i (c) są też błędami; bez indeksowania „niezrobione etapy 0–6” to ostrzeżenie, a (b) i (c) zawsze błąd (plan musi być spójny). */
export function checkPlanStartu({ rows, indexing }) {
  const errors = [], warnings = [], done = new Set(rows.filter(r => r.stan === 'zrobione' || r.stan === 'odpada').map(r => r.id));
  if (!rows.length) { (indexing ? errors : warnings).push('plan startu: pusty (docs/55-plan-startu.md bez zadań)'); return { errors, warnings }; }
  for (const r of rows) {
    if (r.stan !== 'zrobione' && r.stan !== 'odpada') continue;
    if (!ISO_DATE.test(r.data)) errors.push(`plan startu: ${r.id} „${r.stan}” bez daty RRRR-MM-DD`);
    if (!r.dowod) errors.push(`plan startu: ${r.id} „${r.stan}” bez ${r.stan === 'odpada' ? 'powodu/dowodu (ID decyzji albo ścieżka pliku)' : 'dowodu (SHA, przebieg tests.yml albo ścieżka pliku)'}`);
    if (r.stan === 'odpada') continue;
    const brak = r.po.filter(p => !done.has(p));
    if (brak.length) errors.push(`plan startu: ${r.id} „zrobione”, a zadanie z „Po” nie jest zrobione (${brak.join(', ')})`);
  }
  const open = rows.filter(r => etap(r.id) <= PROG_ETAP && !done.has(r.id)).map(r => r.id);
  if (open.length) (indexing ? errors : warnings).push(`plan startu: ${open.length} zadań etapów 0–${PROG_ETAP} niezrobionych (${sample(open)}) — indeksowanie=true wymaga wszystkich „zrobione” albo „odpada” z datą i dowodem`);
  return { errors, warnings };
}
