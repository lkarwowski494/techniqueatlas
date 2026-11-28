// Przekład i przegląd tekstów strony przez API Anthropic (decyzja właściciela 27.11.2026: „Tłumaczenie i sprawdzanie i wszystko wokół tego ma być przez API Claude”;
// kopia mechanizmu z repo aplikacji: .github/workflows/przeklad-tlumaczen.yml, przeglad-tlumaczen.yml, scripts/i18n/przeklad-api.mjs). Bez sieci i bez klucza: atrapa fetch.
// Pilnowane: limity (6 USD na przebieg, 80 USD łącznie), brak klucza w logach i artefaktach, format artefaktów, brak zapisu w źródłach, zabezpieczenia workflowów.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { ROOT } from '../src/lib.mjs';
import * as rdzen from '../scripts/przeklad/rdzen.mjs';
import * as wydatki from '../scripts/przeklad/wydatki.mjs';
import * as zrodla from '../scripts/przeklad/zrodla.mjs';

/* klucz składany w locie, żeby strażnik sekretów nie widział w repo napisu w kształcie klucza */
const KLUCZ = ['sk', 'ant', 'api03', 'TESTOWYKLUCZ1234567890abcdefghij'].join('-');
const sprzatanie = [];
process.on('exit', () => { for (const d of sprzatanie) rmSync(d, { recursive: true, force: true }); });
const zapisz = (root, f, tresc) => { mkdirSync(dirname(join(root, f)), { recursive: true }); writeFileSync(join(root, f), typeof tresc === 'string' ? tresc : JSON.stringify(tresc, null, 1) + '\n'); };
const czytaj = (p) => JSON.parse(readFileSync(p, 'utf8'));

/** Fixture: projekt z 3 językami do przekładu (fr, de, pt), trzema źródłami (mapa płaska, mapa zagnieżdżona, dokumenty) i słownikiem terminów. */
function fixture({ nazw = 3, jezykow = 3 } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'przeklad-')); sprzatanie.push(root);
  const kody = ['fr', 'de', 'pt']; for (let i = 4; i <= jezykow; i++) kody.push(`x${String(i).padStart(2, '0')}`);
  zapisz(root, 'config.json', { jezyki: ['pl', 'en', ...kody] });
  const nazwy = {}; for (let i = 1; i <= nazw; i++) nazwy[`Press ${i}`] = `Wyciskanie ${i}`;
  zapisz(root, 'docs/nazwy/pl.json', nazwy);
  zapisz(root, 'src/szablony/pl.json', { _opis: 'opis roboczy, nie do przekładu', sprzet: 'Potrzebny sprzęt: {lista}.', pytania: { setup: 'Jak się ustawić?', move: 'Jak wykonać ruch?' } });
  zapisz(root, 'src/szablony/en.json', { _opis: 'x', sprzet: 'Equipment needed: {lista}.', pytania: { setup: 'How do you set up?', move: 'How do you perform the movement?' } });
  zapisz(root, 'docs/teksty/prawne/regulamin.pl.md', '# Regulamin\n\nStrona {{adresStrony}} jest bezpłatna.\n');
  zapisz(root, 'docs/teksty/prawne/regulamin.en.md', '# Terms\n\nThe site {{adresStrony}} is free.\n');
  zapisz(root, 'docs/teksty/prawne/README.md', 'nie jest tekstem do przekładu');
  zapisz(root, 'docs/przeklad/zrodla.json', { zrodla: [
    { id: 'nazwy', rodzaj: 'mapa', pl: 'docs/nazwy/pl.json', en_z_klucza: true, cel: 'docs/nazwy/{kod}.json', opis: 'nazwy ćwiczeń' },
    { id: 'szablony', rodzaj: 'mapa', pl: 'src/szablony/pl.json', en: 'src/szablony/en.json', cel: 'src/szablony/{kod}.json', opis: 'szablony tytułów i opisów' },
    { id: 'prawne', rodzaj: 'dokumenty', katalog: 'docs/teksty/prawne', koncowka_pl: '.pl.md', koncowka_en: '.en.md', cel: 'docs/teksty/prawne/{nazwa}.{kod}.md', opis: 'teksty prawne strony' },
  ] });
  zapisz(root, '.cache/dane/slownik-terminow.json', { pojecia: [{ id: 'przerwa', pl: 'przerwa między seriami', znaczenie: 'odpoczynek między seriami', wykrywaj: '(?<![\\p{L}])przerw(a|y)(?![\\p{L}])', jezyki: { fr: { zalecany: 'repos', zakazane: [{ wzorzec: '\\bpause\\b', powod: 'pause to przerwa w pracy' }] } } }] });
  zapisz(root, 'docs/slownik-strony.json', { pojecia: [{ id: 'dipy', klucz: ['families.dip'], powod: 'x', zakres: 'plik', jezyki: { fr: { zalecany: 'dips' } } }] });
  return root;
}

/** Atrapa API: count_tokens, tworzenie batcha (odpowiedzi generowane z żądań), odczyt statusu i wyników. `tryb`: 'ok' | 'blad-z-kluczem' | 'przeglad'. */
function atrapa({ tryb = 'ok', uzycie = { input_tokens: 10000, output_tokens: 5000 }, modelWyniku = null, status = 'ended' } = {}) {
  const wywolania = []; let zadania = [];
  const odp = (z) => {
    const user = z.params.messages[0].content; const lista = JSON.parse(user.split('\n').pop());
    const tekst = z.custom_id.startsWith('pg-')
      ? JSON.stringify(Object.fromEntries(lista.map((p, i) => [p.id, i === 0 ? { poprawka: `POPRAWKA ${p.tlumaczenie}`, powod: 'test', waga: 'krytyczna' } : 'ok'])))
      : JSON.stringify(Object.fromEntries(lista.map((p) => [p.id, `T:${p.pl}`])));
    return JSON.stringify({ custom_id: z.custom_id, result: { type: 'succeeded', message: { ...(modelWyniku ? { model: modelWyniku } : {}), content: [{ type: 'text', text: tekst }], stop_reason: 'end_turn', usage: uzycie } } });
  };
  const fetchFn = async (url, opts = {}) => {
    wywolania.push({ url, metoda: opts.method, naglowki: opts.headers });
    const u = new URL(url); const odpowiedz = (cialo, status = 200) => ({ ok: status < 400, status, json: async () => cialo, text: async () => (typeof cialo === 'string' ? cialo : JSON.stringify(cialo)) });
    if (tryb === 'blad-z-kluczem') return odpowiedz({ error: { message: `invalid x-api-key ${opts.headers['x-api-key']}` } }, 401);
    if (u.pathname.endsWith('/count_tokens')) return odpowiedz({ input_tokens: 12000 });
    if (u.pathname.endsWith('/messages/batches') && opts.method === 'POST') { zadania = JSON.parse(opts.body).requests; return odpowiedz({ id: 'msgbatch_TEST123' }); }
    if (u.pathname.endsWith('/results')) return odpowiedz(zadania.map(odp).join('\n'));
    if (u.pathname.includes('/messages/batches/')) return odpowiedz({ id: 'msgbatch_TEST123', processing_status: status, results_url: 'https://api.anthropic.com/v1/messages/batches/msgbatch_TEST123/results' });
    return odpowiedz({}, 404);
  };
  return { fetchFn, wywolania, zadania: () => zadania };
}
const uruchom = async (tryb, argv, { root, env = {}, api = atrapa() }) => { const logi = []; const kod = await rdzen.main(tryb, argv, env, { fetchFn: api.fetchFn, log: (s) => logi.push(String(s)), root, spij: async () => {} }); return { kod, logi, api }; };
const wszystkiePliki = (d) => readdirSync(d, { withFileTypes: true, recursive: true }).filter((e) => e.isFile()).map((e) => join(e.parentPath ?? e.path, e.name));

/* ---------- źródła ---------- */
test('źródła: mapa płaska i zagnieżdżona (klucze „_” pomijane), dokumenty parami pl/en bez README; en z klucza dla nazw', () => {
  const root = fixture(); const z = zrodla.wczytajZrodla(root);
  assert.deepEqual(z.map((x) => x.id), ['nazwy', 'szablony', 'prawne']);
  const nazwy = z.find((x) => x.id === 'nazwy');
  assert.deepEqual(nazwy.pozycje.map((p) => [p.klucz, p.pl, p.en]), [['Press 1', 'Wyciskanie 1', 'Press 1'], ['Press 2', 'Wyciskanie 2', 'Press 2'], ['Press 3', 'Wyciskanie 3', 'Press 3']]);
  const szab = z.find((x) => x.id === 'szablony');
  assert.deepEqual(szab.pozycje.map((p) => p.klucz), ['sprzet', 'pytania.setup', 'pytania.move']);
  assert.equal(szab.pozycje[1].en, 'How do you set up?');
  const pr = z.find((x) => x.id === 'prawne');
  assert.deepEqual(pr.pozycje.map((p) => p.klucz), ['regulamin']);
  assert.match(pr.pozycje[0].pl, /^# Regulamin/); assert.match(pr.pozycje[0].en, /^# Terms/);
});
test('źródła: brak pliku źródłowego i identyfikator spoza [a-z0-9] → czytelny błąd', () => {
  const root = fixture(); rmSync(join(root, 'src/szablony/en.json'));
  assert.throws(() => zrodla.wczytajZrodla(root), /src\/szablony\/en\.json/);
  const r2 = fixture(); const k = czytaj(join(r2, 'docs/przeklad/zrodla.json')); k.zrodla[0].id = 'Zle-Id'; zapisz(r2, 'docs/przeklad/zrodla.json', k);
  assert.throws(() => zrodla.wczytajZrodla(r2), /identyfikator/);
});
test('języki do przekładu = config.json → jezyki bez pl i en', () => { assert.deepEqual(rdzen.jezykiDoPrzekladu(fixture()), ['fr', 'de', 'pt']); });

/* ---------- prompty ---------- */
test('żądanie przekładu: zasady tekstów (bez źródeł i firm, „jak trener na siłowni”), słownik terminów języka, rejestr, zmienne bez zmian', () => {
  const root = fixture(); const z = zrodla.wczytajZrodla(root).find((x) => x.id === 'szablony');
  const s = rdzen.wczytajSlowniki(root); const zad = rdzen.budujZadanie('przeklad', z, 'fr', s);
  assert.match(zad.system, /nie dodawaj nazw źródeł/); assert.match(zad.system, /firm/); assert.match(zad.system, /trener albo kolega na siłowni/);
  const u = zad.messages[0].content;
  assert.match(u, /Język docelowy: .*\(fr\)/); assert.match(u, /vous/); assert.match(u, /przerwa między seriami.*→ repos/); assert.match(u, /NIE używaj/); assert.match(u, /families\.dip.*dips/);
  assert.deepEqual(JSON.parse(u.split('\n').pop()).map((p) => p.id), ['1', '2', '3']);
});
test('żądanie przeglądu: nie poprawia sam, zwraca listę poprawek; waga; pozycje z tłumaczeniem', () => {
  const root = fixture(); const z = zrodla.wczytajZrodla(root).find((x) => x.id === 'nazwy'); const s = rdzen.wczytajSlowniki(root);
  const zad = rdzen.budujZadanie('przeglad', { ...z, pozycje: z.pozycje.map((p) => ({ ...p, tlumaczenie: `fr ${p.pl}` })) }, 'fr', s);
  assert.match(zad.system, /krytyczna/); assert.match(zad.system, /poprawka/); assert.match(zad.system, /WYŁĄCZNIE jednym obiektem JSON/);
  assert.equal(JSON.parse(zad.messages[0].content.split('\n').pop())[0].tlumaczenie, 'fr Wyciskanie 1');
});

/* ---------- limity kosztu ---------- */
test('limit 6 USD na przebieg: szacunek powyżej limitu bez zgody → kod 3 i komunikat STOP; ze zgodą (--zgoda-koszt) → kod 0', async () => {
  const root = fixture({ nazw: 1500, jezykow: 33 }); /* 33 języki × 1500 nazw: koszt > 6 USD */
  const bez = await uruchom('przeklad', ['--szacuj', '--zrodlo', 'nazwy'], { root });
  assert.equal(bez.kod, 3); assert.match(bez.logi.join('\n'), /STOP: górna granica kosztu .* USD .*przekracza limit 6 USD/);
  const sz = czytaj(join(root, 'raport-przekladu/szacunek.json')); assert.ok(sz.koszt_usd > 6, `koszt ${sz.koszt_usd}`);
  const ze = await uruchom('przeklad', ['--szacuj', '--zrodlo', 'nazwy', '--zgoda-koszt'], { root });
  assert.equal(ze.kod, 0);
});
test('limit 6 USD obowiązuje także przegląd; bez klucza szacunek nie wysyła niczego do sieci', async () => {
  const root = fixture({ nazw: 1500, jezykow: 33 }); const api = atrapa();
  for (const kod of rdzen.jezykiDoPrzekladu(root)) zapisz(root, `docs/nazwy/${kod}.json`, Object.fromEntries(Object.entries(czytaj(join(root, 'docs/nazwy/pl.json'))).map(([k, v]) => [k, `${kod} ${v}`])));
  const r = await uruchom('przeglad', ['--szacuj', '--zrodlo', 'nazwy'], { root, api });
  assert.equal(r.kod, 3); assert.equal(api.wywolania.length, 0, 'bez klucza żadnego połączenia');
});
test('limit 80 USD łącznie: dotychczasowe wydatki + szacunek > 80 → kod 5, także ze zgodą na koszt; poniżej limitu przechodzi', async () => {
  const root = fixture();
  zapisz(root, 'docs/przeklad/wydatki.json', { limit_usd: 80, wpisy: [{ data: '2026-11-28', przebieg: 'przeklad', batch_id: 'msgbatch_A', koszt_usd: 79.99 }] });
  const r = await uruchom('przeklad', ['--szacuj', '--zgoda-koszt'], { root });
  assert.equal(r.kod, 5); assert.match(r.logi.join('\n'), /STOP: limit łączny 80 USD/); assert.match(r.logi.join('\n'), /79\.99/);
  zapisz(root, 'docs/przeklad/wydatki.json', { limit_usd: 80, wpisy: [{ data: '2026-11-28', przebieg: 'przeklad', batch_id: 'msgbatch_A', koszt_usd: 10 }] });
  assert.equal((await uruchom('przeklad', ['--szacuj', '--zgoda-koszt'], { root })).kod, 0);
});
test('limit łączny: bez wpisów suma 0; limit z pliku nie może przekroczyć 80 (nie da się go podnieść plikiem wydatków)', () => {
  const root = fixture(); assert.equal(wydatki.suma(root), 0);
  zapisz(root, 'docs/przeklad/wydatki.json', { limit_usd: 500, wpisy: [] });
  assert.equal(wydatki.limit(root), 80);
});
test('ledger: --zapisz-wydatek dopisuje koszt z artefaktu raz (idempotentnie po batch_id); zły plik → błąd', async () => {
  const root = fixture(); const wyj = join(root, 'raport');
  mkdirSync(wyj, { recursive: true }); zapisz(root, 'raport/wydatek.json', { przebieg: 'przeklad', batch_id: 'msgbatch_Z', model: 'claude-opus-5-5', data: '2026-11-28', rodzaj_kosztu: 'rzeczywisty', tokeny_we: 1000, tokeny_wy: 2000, koszt_usd: 0.022 });
  assert.equal((await uruchom('przeklad', ['--zapisz-wydatek', wyj], { root })).kod, 0);
  assert.equal((await uruchom('przeklad', ['--zapisz-wydatek', wyj], { root })).kod, 0);
  const w = czytaj(join(root, 'docs/przeklad/wydatki.json')); assert.equal(w.wpisy.length, 1); assert.equal(w.wpisy[0].batch_id, 'msgbatch_Z'); assert.equal(wydatki.suma(root), 0.022);
  zapisz(root, 'raport/wydatek.json', { batch_id: 'zly' });
  assert.notEqual((await uruchom('przeklad', ['--zapisz-wydatek', wyj], { root })).kod, 0);
});

/* ---------- klucz API ---------- */
test('brak klucza: przebieg płatny niemożliwy (kod 2), żadnego połączenia; klucz nie jest argumentem wiersza poleceń', async () => {
  const root = fixture(); const api = atrapa();
  const r = await uruchom('przeklad', ['--zrodlo', 'szablony', '--limit', '1'], { root, api });
  assert.equal(r.kod, 2); assert.equal(api.wywolania.length, 0);
  await assert.rejects(() => rdzen.main('przeklad', ['--klucz', KLUCZ], {}, { fetchFn: api.fetchFn, log() {}, root }), /nieznany argument/);
});
test('klucz nie trafia do logu ani do żadnego pliku artefaktu: przebieg udany i błąd API z kluczem w treści odpowiedzi', async () => {
  for (const [tryb, kodOczekiwany] of [['ok', 0], ['blad-z-kluczem', null]]) {
    const root = fixture(); const wyj = join(root, 'raport'); const api = atrapa({ tryb });
    let kod, logi;
    try { ({ kod, logi } = await uruchom('przeklad', ['--zrodlo', 'szablony', '--limit', '2', '--wyjscie', wyj], { root, env: { ANTHROPIC_API_KEY: KLUCZ }, api })); }
    catch (e) { kod = 'wyjatek'; logi = [e.message]; }
    if (kodOczekiwany !== null) assert.equal(kod, kodOczekiwany);
    assert.ok(!logi.join('\n').includes(KLUCZ), `klucz w logu (${tryb})`);
    assert.ok(!logi.join('\n').includes('TESTOWYKLUCZ'), `fragment klucza w logu (${tryb})`);
    if (existsSync(wyj)) for (const p of wszystkiePliki(wyj)) assert.ok(!readFileSync(p, 'utf8').includes('TESTOWYKLUCZ'), `klucz w ${p}`);
    if (tryb === 'ok') assert.ok(api.wywolania.every((w) => w.naglowki['x-api-key'] === KLUCZ), 'klucz tylko w nagłówku x-api-key');
  }
});
test('klucz nie jest zapisywany do raportu także w błędzie wyniku pojedynczej linii batcha', () => {
  const linia = JSON.stringify({ custom_id: 'pr-nazwy-fr', result: { type: 'errored', error: { error: { message: `zły klucz ${KLUCZ}` } } } });
  const o = rdzen.odczytajLinie(linia, KLUCZ); assert.ok(!o.blad.includes('TESTOWYKLUCZ')); assert.equal(o.zrodlo, 'nazwy'); assert.equal(o.kod, 'fr');
});

/* ---------- format artefaktów ---------- */
test('artefakt przekładu: <wyjscie>/<źródło>/<język>.json (propozycje), podsumowanie.md, szacunek.json, wydatek.json z kosztem z użycia; źródła i cele nietknięte', async () => {
  const root = fixture(); const wyj = join(root, 'raport'); const przed = readFileSync(join(root, 'docs/nazwy/pl.json'), 'utf8');
  const r = await uruchom('przeklad', ['--limit', '2', '--wyjscie', wyj], { root, env: { ANTHROPIC_API_KEY: KLUCZ }, api: atrapa({ uzycie: { input_tokens: 10000, output_tokens: 5000 } }) });
  assert.equal(r.kod, 0, r.logi.join('\n'));
  const fr = czytaj(join(wyj, 'szablony/fr.json'));
  assert.deepEqual(Object.keys(fr).sort(), ['blad', 'effort', 'jezyk', 'model', 'batch_id', 'odrzucone', 'pozycji', 'propozycje', 'przyjete', 'zrodlo'].sort());
  assert.equal(fr.jezyk, 'fr'); assert.equal(fr.zrodlo, 'szablony'); assert.equal(fr.batch_id, 'msgbatch_TEST123'); assert.equal(fr.blad, null);
  assert.equal(fr.pozycji, 3); assert.equal(fr.przyjete, 3);
  assert.match(fr.propozycje['pytania.setup'], /^T:/); assert.match(fr.propozycje.sprzet, /\{lista\}/);
  assert.ok(existsSync(join(wyj, 'nazwy/fr.json')) && existsSync(join(wyj, 'nazwy/de.json')), 'limit 2: fr i de');
  assert.ok(!existsSync(join(wyj, 'nazwy/pt.json')), 'limit 2: bez pt');
  assert.ok(existsSync(join(wyj, 'podsumowanie.md')) && existsSync(join(wyj, 'szacunek.json')));
  const w = czytaj(join(wyj, 'wydatek.json'));
  assert.deepEqual(Object.keys(w).sort(), ['batch_id', 'data', 'koszt_usd', 'model', 'przebieg', 'rodzaj_kosztu', 'tokeny_we', 'tokeny_wy'].sort());
  assert.equal(w.rodzaj_kosztu, 'rzeczywisty');
  assert.equal(w.przebieg, 'przeklad'); assert.equal(w.batch_id, 'msgbatch_TEST123');
  const zadan = 3 * 2; /* 3 źródła × 2 języki */ assert.equal(w.tokeny_we, 10000 * zadan); assert.equal(w.tokeny_wy, 5000 * zadan);
  assert.ok(Math.abs(w.koszt_usd - ((w.tokeny_we * 4 + w.tokeny_wy * 20) / 1e6) * 0.5) < 1e-9, 'koszt = tokeny × cena Opus × rabat batcha 50%');
  assert.equal(readFileSync(join(root, 'docs/nazwy/pl.json'), 'utf8'), przed, 'źródło nietknięte');
  assert.ok(!existsSync(join(root, 'docs/nazwy/fr.json')) && !existsSync(join(root, 'src/szablony/fr.json')), 'przebieg nie zapisuje celów');
});
test('odrzucenie: tłumaczenie bez zmiennych {…} z źródła albo z terminem zakazanym ze słownika trafia do „odrzucone”, nie do „propozycje”', () => {
  const root = fixture(); const s = rdzen.wczytajSlowniki(root);
  const poz = [{ id: 1, klucz: 'a', pl: 'Ustaw {n} serii', en: 'x' }, { id: 2, klucz: 'b', pl: 'Przerwa między seriami' , en: 'x' }, { id: 3, klucz: 'c', pl: 'Dobry tekst', en: 'x' }];
  const o = rdzen.parsujOdpowiedz(JSON.stringify({ 1: 'Régler séries', 2: 'La pause entre séries', 3: 'Bon texte' }), poz, 'fr', s);
  assert.deepEqual(Object.keys(o.propozycje), ['c']); assert.equal(o.odrzucone.length, 2);
  assert.match(o.odrzucone[0].powod, /zmienne/); assert.match(o.odrzucone[1].powod, /słownik/);
});
test('artefakt przeglądu: <wyjscie>/<źródło>/<język>.json z listą uwag (poprawka, powód, waga); cele i źródła nietknięte; brak tłumaczenia = uwaga lokalna', async () => {
  const root = fixture(); const wyj = join(root, 'raport-przegladu');
  zapisz(root, 'docs/nazwy/fr.json', { 'Press 1': 'Développé 1', 'Press 2': 'Développé 2' }); /* brak „Press 3” */
  const przed = readFileSync(join(root, 'docs/nazwy/fr.json'), 'utf8');
  const r = await uruchom('przeglad', ['--zrodlo', 'nazwy', '--limit', '1', '--wyjscie', wyj], { root, env: { ANTHROPIC_API_KEY: KLUCZ }, api: atrapa() });
  assert.equal(r.kod, 0, r.logi.join('\n'));
  const fr = czytaj(join(wyj, 'nazwy/fr.json'));
  assert.deepEqual(Object.keys(fr).sort(), ['batch_id', 'blad', 'brak_odpowiedzi', 'effort', 'jezyk', 'kontrola_lokalna', 'model', 'ok', 'pozycji', 'uwagi', 'zrodlo'].sort());
  assert.equal(fr.uwagi.length, 1); assert.deepEqual(Object.keys(fr.uwagi[0]).sort(), ['klucz', 'pl', 'poprawka', 'powod', 'tlumaczenie', 'waga'].sort());
  assert.equal(fr.uwagi[0].waga, 'krytyczna'); assert.match(fr.uwagi[0].poprawka, /^POPRAWKA/);
  assert.deepEqual(fr.kontrola_lokalna.map((k) => [k.klucz, k.waga]), [['Press 3', 'krytyczna']]);
  assert.equal(readFileSync(join(root, 'docs/nazwy/fr.json'), 'utf8'), przed, 'przegląd niczego nie poprawia');
  assert.equal(czytaj(join(wyj, 'wydatek.json')).przebieg, 'przeglad');
  assert.ok(existsSync(join(wyj, 'podsumowanie.md')));
});

/* ---------- nałożenie (lokalnie, po przeglądzie) ---------- */
test('--zastosuj: nakłada propozycje na cele (mapa płaska, zagnieżdżona z kluczami „a.b”, dokument), pomija klucze spoza źródła; bez sieci i bez klucza', async () => {
  const root = fixture(); const wyj = join(root, 'raport');
  await uruchom('przeklad', ['--limit', '1', '--wyjscie', wyj], { root, env: { ANTHROPIC_API_KEY: KLUCZ } });
  const fr = czytaj(join(wyj, 'szablony/fr.json')); fr.propozycje['obcy.klucz'] = 'x'; zapisz(root, 'raport/szablony/fr.json', fr);
  const api = atrapa(); const r = await uruchom('przeklad', ['--zastosuj', wyj], { root, api });
  assert.equal(r.kod, 0, r.logi.join('\n')); assert.equal(api.wywolania.length, 0);
  assert.deepEqual(Object.keys(czytaj(join(root, 'docs/nazwy/fr.json'))), ['Press 1', 'Press 2', 'Press 3']);
  const s = czytaj(join(root, 'src/szablony/fr.json')); assert.match(s.pytania.setup, /^T:/); assert.ok(!('obcy.klucz' in s));
  assert.match(readFileSync(join(root, 'docs/teksty/prawne/regulamin.fr.md'), 'utf8'), /\{\{adresStrony\}\}/);
  assert.match(r.logi.join('\n'), /pominięto: .*obcy\.klucz/);
});

/* ---------- workflowy ---------- */
for (const [plik, tryb] of [['przeklad-tlumaczen.yml', 'przeklad'], ['przeglad-tlumaczen.yml', 'przeglad']]) {
  const sciezka = join(ROOT, '.github/workflows', plik); const yml = existsSync(sciezka) ? readFileSync(sciezka, 'utf8') : ''; const linie = yml.split('\n');
  test(`${plik}: tylko workflow_dispatch, permissions contents: read, bez push/PR/GITHUB_TOKEN z zapisem`, () => {
    assert.match(yml, /^on:\n  workflow_dispatch:/m); assert.doesNotMatch(yml, /^\s{2}(push|pull_request|schedule)\s*:/m);
    assert.match(yml, /^permissions:\n  contents: read\s*$/m); assert.doesNotMatch(yml, /contents: write|pull-requests: write|git push|gh pr |--no-verify/);
  });
  test(`${plik}: ANTHROPIC_API_KEY tylko jako zmienna środowiskowa jednego kroku, nigdy w run/echo/argumencie`, () => {
    const wystapienia = linie.map((l, i) => [i, l]).filter(([, l]) => /ANTHROPIC_API_KEY/.test(l) && !l.trim().startsWith('#'));
    assert.equal(wystapienia.length, 1, 'klucz w dokładnie jednym miejscu'); assert.match(wystapienia[0][1], /ANTHROPIC_API_KEY: \$\{\{ secrets\.ANTHROPIC_API_KEY \}\}/);
    const poczatek = linie.slice(0, wystapienia[0][0]).map((l, i) => [i, l]).filter(([, l]) => /^\s+- name:/.test(l)).pop()[0];
    const koniec = linie.findIndex((l, i) => i > poczatek && /^\s+- name:/.test(l) && i > wystapienia[0][0]);
    const krok = linie.slice(poczatek, koniec < 0 ? undefined : koniec).join('\n');
    assert.match(krok, /env:/); assert.doesNotMatch(krok.split('run:')[1] ?? '', /\$\{?ANTHROPIC_API_KEY|secrets\./);
    assert.doesNotMatch(yml.replace(/^\s*ANTHROPIC_API_KEY:.*$/m, ''), /secrets\./);
  });
  test(`${plik}: krok szacunku bez klucza poprzedza krok płatny; zgoda_koszt i limit 6 USD; artefakt tylko raportów (7 dni); wejścia przez env, nie przez wstawianie do skryptu`, () => {
    const iSz = linie.findIndex((l) => /name: Szacunek kosztu bez klucza/.test(l)); const iKlucz = linie.findIndex((l) => /ANTHROPIC_API_KEY:/.test(l));
    assert.ok(iSz > 0 && iSz < iKlucz, 'szacunek przed krokiem z kluczem');
    assert.ok(!/secrets\./.test(linie.slice(iSz, iKlucz - 3).join('\n')), 'krok szacunku bez sekretów');
    assert.match(yml, /zgoda_koszt:/); assert.match(yml, /6 USD/); assert.match(yml, /type: choice/);
    assert.match(yml, /retention-days: 7/); assert.match(yml, /actions\/upload-artifact@v4/); assert.match(yml, /wydatek\.json/);
    const bloki = []; linie.forEach((l, i) => { const m = /^(\s+)run:/.exec(l); if (!m) return; const w = [l]; for (let j = i + 1; j < linie.length && (linie[j].trim() === '' || linie[j].search(/\S/) > m[1].length); j++) w.push(linie[j]); bloki.push(w.join('\n')); });
    assert.ok(bloki.length >= 3); assert.doesNotMatch(bloki.join('\n'), /\$\{\{ *(inputs|secrets)\./, 'wejścia i sekrety tylko przez env (bez wstrzykiwania do powłoki)');
    assert.match(yml, new RegExp(`scripts/przeklad/${tryb}-api\\.mjs`)); assert.match(yml, /npm run dane/);
    assert.match(yml, /concurrency:/);
  });
}

test('workflowy: pliki przeklad-tlumaczen.yml i przeglad-tlumaczen.yml nie są ujęte w publikacji (pages.yml ich nie woła) i nie mają wyzwalacza automatycznego', () => {
  const pages = readFileSync(join(ROOT, '.github/workflows/pages.yml'), 'utf8'); assert.doesNotMatch(pages, /przeklad|przeglad/);
});
test('repo strony: docs/przeklad/zrodla.json istnieje, jest poprawny i wskazuje cele zgodne z ustaleniami (nazwy 33 języków, szablony, teksty prawne)', () => {
  const k = czytaj(join(ROOT, 'docs/przeklad/zrodla.json')); assert.deepEqual(k.zrodla.map((z) => z.id), ['nazwy', 'szablony', 'prawne', 'ui']);
  const w = czytaj(join(ROOT, 'docs/przeklad/wydatki.json')); assert.equal(w.limit_usd, 80); assert.ok(Array.isArray(w.wpisy));
});

/* ---------- poprawki z przeglądu P0/P1 (niezależny przegląd, 27.11.2026) ---------- */
test('--wznow: koszt księgowany wg modelu z wyniku batcha, nie z argumentu --model (nie da się zaniżyć licznika parametrem)', async () => {
  const root = fixture(); const wyj = join(root, 'raport'); const api = atrapa({ modelWyniku: 'claude-opus-5-5' });
  await uruchom('przeklad', ['--zrodlo', 'szablony', '--limit', '1', '--wyjscie', wyj], { root, env: { ANTHROPIC_API_KEY: KLUCZ }, api });
  const r = await uruchom('przeklad', ['--zrodlo', 'szablony', '--limit', '1', '--wyjscie', wyj, '--wznow', 'msgbatch_TEST123', '--model', 'sonnet'], { root, env: { ANTHROPIC_API_KEY: KLUCZ }, api });
  assert.equal(r.kod, 0, r.logi.join('\n')); const w = czytaj(join(wyj, 'wydatek.json'));
  assert.equal(w.model, 'claude-opus-5-5'); assert.ok(Math.abs(w.koszt_usd - ((10000 * 4 + 5000 * 20) / 1e6) * 0.5) < 1e-9, `koszt ${w.koszt_usd}`);
});
test('batch wysłany, ale odbiór przerwany (czas oczekiwania, kod 4): wydatek.json ze szacunkiem istnieje już po wysłaniu, więc da się go zaksięgować', async () => {
  const root = fixture(); const wyj = join(root, 'raport'); const api = atrapa({ status: 'in_progress' });
  const r = await uruchom('przeklad', ['--zrodlo', 'szablony', '--limit', '1', '--wyjscie', wyj, '--czekaj-min', '0'], { root, env: { ANTHROPIC_API_KEY: KLUCZ }, api });
  assert.equal(r.kod, 4, r.logi.join('\n')); const w = czytaj(join(wyj, 'wydatek.json'));
  assert.equal(w.batch_id, 'msgbatch_TEST123'); assert.ok(w.koszt_usd > 0); assert.equal(w.przebieg, 'przeklad'); assert.equal(w.rodzaj_kosztu, 'szacunek');
});
test('ledger: ten sam batch_id z dokładniejszym kosztem aktualizuje wpis (szacunek → rzeczywisty), nie dubluje', () => {
  const root = fixture(); const base = { przebieg: 'przeklad', batch_id: 'msgbatch_U', model: 'claude-opus-5-5', data: '2026-11-28', tokeny_we: 1, tokeny_wy: 1 };
  const szac = { ...base, rodzaj_kosztu: 'szacunek' };
  wydatki.dopisz(root, { ...szac, koszt_usd: 5 }); wydatki.dopisz(root, { ...base, rodzaj_kosztu: 'rzeczywisty', koszt_usd: 3 });
  assert.equal(czytaj(join(root, 'docs/przeklad/wydatki.json')).wpisy.length, 1); assert.equal(wydatki.suma(root), 3);
});
test('--zastosuj nie nadpisuje istniejących tłumaczeń (mapa i dokument) bez --nadpisz; z --nadpisz nadpisuje', async () => {
  const root = fixture(); const wyj = join(root, 'raport');
  await uruchom('przeklad', ['--limit', '1', '--wyjscie', wyj], { root, env: { ANTHROPIC_API_KEY: KLUCZ } });
  zapisz(root, 'docs/nazwy/fr.json', { 'Press 1': 'RĘCZNIE 1' }); zapisz(root, 'docs/teksty/prawne/regulamin.fr.md', 'RĘCZNIE DOKUMENT\n');
  const r = await uruchom('przeklad', ['--zastosuj', wyj], { root });
  assert.equal(r.kod, 0, r.logi.join('\n')); const n = czytaj(join(root, 'docs/nazwy/fr.json'));
  assert.equal(n['Press 1'], 'RĘCZNIE 1'); assert.match(n['Press 2'], /^T:/, 'brakujące klucze uzupełnione');
  assert.equal(readFileSync(join(root, 'docs/teksty/prawne/regulamin.fr.md'), 'utf8'), 'RĘCZNIE DOKUMENT\n'); assert.match(r.logi.join('\n'), /istnieje.*--nadpisz/);
  await uruchom('przeklad', ['--zastosuj', wyj, '--nadpisz'], { root });
  assert.match(czytaj(join(root, 'docs/nazwy/fr.json'))['Press 1'], /^T:/); assert.match(readFileSync(join(root, 'docs/teksty/prawne/regulamin.fr.md'), 'utf8'), /^# T:|T:# /m);
});
test('szacunek niepoprawny (NaN z count_tokens) zatrzymuje przebieg zamiast przejść oba limity', async () => {
  const root = fixture(); const api = atrapa(); const f = api.fetchFn;
  api.fetchFn = async (u, o) => (String(u).endsWith('/count_tokens') ? { ok: true, status: 200, json: async () => ({}) } : f(u, o));
  const r = await uruchom('przeklad', ['--szacuj', '--zrodlo', 'szablony'], { root, env: { ANTHROPIC_API_KEY: KLUCZ }, api });
  assert.notEqual(r.kod, 0); assert.match(r.logi.join('\n'), /szacunek niepoprawny/);
});

/* ---------- recenzja bezpieczeństwa koordynatora (27.11.2026): limit łączny twardszy, górna granica kosztu ---------- */
test('niezaksięgowany batch w wydatki.json (koszt tylko szacowany) blokuje nowy przebieg płatny (kod 6) bez wysłania czegokolwiek; --wznow i --szacuj nadal działają', async () => {
  const root = fixture(); const api = atrapa();
  zapisz(root, 'docs/przeklad/wydatki.json', { limit_usd: 80, wpisy: [{ przebieg: 'przeklad', batch_id: 'msgbatch_OLD', model: 'claude-opus-5-5', data: '2026-11-28', rodzaj_kosztu: 'szacunek', tokeny_we: 1, tokeny_wy: 1, koszt_usd: 1 }] });
  const r = await uruchom('przeklad', ['--zrodlo', 'szablony', '--limit', '1'], { root, env: { ANTHROPIC_API_KEY: KLUCZ }, api });
  assert.equal(r.kod, 6); assert.match(r.logi.join('\n'), /msgbatch_OLD/); assert.match(r.logi.join('\n'), /--wznow/);
  assert.ok(!api.wywolania.some((w) => w.metoda === 'POST' && /\/messages\/batches$/.test(w.url)), 'żaden batch nie został utworzony');
  assert.equal((await uruchom('przeklad', ['--szacuj', '--zrodlo', 'szablony', '--limit', '1'], { root })).kod, 0);
});
test('górna granica kosztu: max_tokens żądania z szacunku (nie 64000), szacunek.json ma koszt_gorny_usd ≥ koszt_usd; limity 6 i 80 USD liczone od górnej granicy', async () => {
  const root = fixture({ nazw: 1000, jezykow: 33 });
  const z = await uruchom('przeklad', ['--szacuj', '--zrodlo', 'nazwy', '--zgoda-koszt'], { root }); assert.equal(z.kod, 0);
  const sz = czytaj(join(root, 'raport-przekladu/szacunek.json')); assert.ok(sz.koszt_gorny_usd > sz.koszt_usd, `${sz.koszt_gorny_usd} > ${sz.koszt_usd}`);
  const sr = (sz.koszt_usd + sz.koszt_gorny_usd) / 2; const n = Math.round(1000 * 6 / sr);
  const root2 = fixture({ nazw: n, jezykow: 33 });
  const r = await uruchom('przeklad', ['--szacuj', '--zrodlo', 'nazwy'], { root: root2 });
  const s2 = czytaj(join(root2, 'raport-przekladu/szacunek.json'));
  assert.ok(s2.koszt_usd < 6 && s2.koszt_gorny_usd > 6, `szacunek ${s2.koszt_usd}, górna granica ${s2.koszt_gorny_usd}`);
  assert.equal(r.kod, 3, 'limit 6 USD sprawdzany wobec górnej granicy'); assert.match(r.logi.join('\n'), /górn/);
  const api = atrapa(); await uruchom('przeklad', ['--zrodlo', 'szablony', '--limit', '1'], { root, env: { ANTHROPIC_API_KEY: KLUCZ }, api });
  assert.ok(api.zadania().every((x) => x.params.max_tokens < 64000 && x.params.max_tokens >= 4000), 'max_tokens z szacunku z zapasem');
});
test('workflowy: wspólna grupa concurrency, start tylko z main, teksty z gałęzi z wejścia (walidacja wzorcem, przez env), bez zapisu do repo', () => {
  const yml = ['przeklad-tlumaczen.yml', 'przeglad-tlumaczen.yml'].map((f) => readFileSync(join(ROOT, '.github/workflows', f), 'utf8'));
  for (const y of yml) {
    assert.match(y, /concurrency:\n  group: przeklad-api\n  cancel-in-progress: false/);
    assert.match(y, /github\.ref != 'refs\/heads\/main'/); assert.match(y, /galaz_tekstow:/); assert.match(y, /WEJ_GALAZ: \$\{\{ inputs\.galaz_tekstow \}\}/);
    assert.match(y, /\^\[A-Za-z0-9\._\/-\]\+\$/); assert.match(y, /git fetch/); assert.doesNotMatch(y, /git (push|commit)/);
  }
});
