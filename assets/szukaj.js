// Filtry listy ćwiczeń i lokalna wyszukiwarka nazw (D11 A). Bez JS lista działa w całości (A–Z, linki do stron filtrów); z JS — filtry łączone bez zmiany adresu i szukanie po nazwie.
// Indeks nazw danego języka (assets/idx/<język>.js) ładowany dopiero po wejściu w pole; zero połączeń poza własnymi plikami.
const fold = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[łđøß]/g, c => ({ ł: 'l', đ: 'd', ø: 'o', ß: 'ss' })[c]).replace(/\s+/g, ' ').trim();

/* lista z filtrami */
const list = document.querySelector('[data-lista]');
if (list) {
  const bar = document.querySelector('[data-filtry]'), sel = [...bar.querySelectorAll('select')], empty = document.querySelector('[data-brak]'), clear = document.querySelector('[data-wyczysc]');
  const items = [...list.children]; bar.hidden = false;
  const apply = () => {
    const f = Object.fromEntries(sel.map(s => [s.dataset.filtr, s.value])); let n = 0;
    for (const li of items) { const ok = Object.entries(f).every(([k, v]) => !v || li.dataset[k] === v); li.hidden = !ok; if (ok) n++; }
    empty.hidden = n > 0; clear.hidden = !Object.values(f).some(Boolean) && n > 0;
  };
  sel.forEach(s => s.addEventListener('change', apply)); clear.addEventListener('click', () => { sel.forEach(s => { s.value = ''; }); apply(); }); apply();
}

/* wyszukiwarka nazw */
const box = document.querySelector('[data-szukaj]');
if (box) {
  const out = document.querySelector('[data-wyniki]'), lang = box.dataset.lang, base = box.dataset.base; let idx = null; box.parentElement.hidden = false;
  const load = async () => { if (!idx) idx = (await import(`./idx/${lang}.js`)).default.map(([name, slug]) => [name, slug, fold(name)]); return idx; };
  box.addEventListener('focus', load);
  box.addEventListener('input', async () => {
    const q = fold(box.value); out.replaceChildren(); if (!q) return; const all = await load();
    const hits = all.filter(r => r[2].includes(q)).sort((a, b) => (b[2].startsWith(q) - a[2].startsWith(q)) || a[2].localeCompare(b[2], lang)).slice(0, 20);
    if (!hits.length) { const li = document.createElement('li'); li.textContent = box.dataset.brak; out.append(li); return; }
    for (const [name, slug] of hits) { const li = document.createElement('li'), a = document.createElement('a'); a.href = `${base}${slug}/`; a.textContent = name; if (lang !== 'pl') a.lang = 'en'; li.append(a); out.append(li); }
  });
}
