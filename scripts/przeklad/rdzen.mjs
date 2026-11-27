// Rdzeń przekładu i przeglądu tekstów strony przez API Anthropic (Message Batches). Dwa przebiegi, dwa skrypty (przeklad-api.mjs, przeglad-api.mjs):
//  - przekład: tłumaczy źródła z docs/przeklad/zrodla.json na 33 języki (config.json → jezyki bez pl i en); wynik = PROPOZYCJE w artefakcie, cele nietknięte;
//  - przegląd: osobny przebieg, który ocenia istniejące tłumaczenia (pliki celów w repo) i zwraca LISTĘ POPRAWEK; sam niczego nie poprawia.
// Jedno żądanie na parę (źródło, język). Zabezpieczenia: szacunek bez klucza; stop powyżej 6 USD na przebieg bez --zgoda-koszt (kod 3); stop powyżej 80 USD łącznie
// wg docs/przeklad/wydatki.json, bez wyjątku (kod 5); klucz tylko z ANTHROPIC_API_KEY i zawsze maskowany w logu. Kody: 0 ok, 1 błąd, 2 brak klucza, 3 koszt przebiegu, 4 czas oczekiwania, 5 limit łączny.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MODELE, CENY, RABAT_BATCH, DOMYSLNY_MODEL, DOMYSLNY_EFFORT, EFFORTY, LIMIT_PRZEBIEGU_USD, LIMIT_LACZNY_USD, MAX_TOKENS, CZEKAJ_MIN_DOMYSLNIE, INTERWAL_S,
  ZALOZENIA_PRZEKLADU, ZALOZENIA_PRZEGLADU, WSPOLCZYNNIK, REJESTR, nazwaJezyka, zmienne, typografia, maskuj, przyblizTokeny, tekstZadania, kosztUsd, klient, czekajNaBatch,
} from './wspolne.mjs';
import { wczytajZrodla, sciezkaCelu, pobierz, ustaw } from './zrodla.mjs';
import * as slownik from './slownik.mjs';
import * as wydatki from './wydatki.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const czytaj = (p) => JSON.parse(readFileSync(p, 'utf8'));
const PREFIKS = { przeklad: 'pr', przeglad: 'pg' };
const WAGI = ['krytyczna', 'średnia', 'niska'];

export const wczytajSlowniki = slownik.wczytaj;

/** Języki do przekładu: config.json → jezyki bez PL i EN (w repo strony 33). */
export function jezykiDoPrzekladu(root) {
  const p = join(root, 'config.json'); if (!existsSync(p)) throw new Error('brak config.json');
  const k = czytaj(p); if (!Array.isArray(k.jezyki)) throw new Error('config.json: oczekiwane pole „jezyki”');
  return k.jezyki.filter((x) => x !== 'pl' && x !== 'en');
}

/* ---------- prompty ---------- */
const WSPOLNE = [
  'Pisz naturalnie, tak jak powiedziałby trener albo kolega na siłowni w tym języku: potoczny termin siłowni zamiast naukowego żargonu i stylu podręcznikowego, bez zbędnych zastrzeżeń.',
  'Terminy treningowe tłumacz WYŁĄCZNIE według słownika terminów podanego dla języka (termin zalecany; terminów oznaczonych „NIE używaj” nie używaj nigdy, bo znaczą co innego albo brzmią jak przerwa w pracy).',
];
export const SYSTEM_PRZEKLAD = [
  'Jesteś doświadczonym tłumaczem tekstów strony internetowej z biblioteką ćwiczeń siłowych (technika wykonania ćwiczeń). Tłumaczysz z polskiego na język docelowy; angielski jest drugim tekstem odniesienia, jeśli jest podany.',
  'Zachowaj sens, liczby oraz wszystkie zmienne {…} i wstawki {{…}} bez zmian (te same nazwy, bez tłumaczenia, bez dodanych przyrostków tam, gdzie rejestr tego zabrania). Pisz krótko, w rejestrze podanym dla języka.',
  'To teksty dla zwykłych odwiedzających, nie dla naukowców: nie dodawaj nazw źródeł, autorów, organizacji, firm ani marek, lat ani oznaczeń pewności („wstępne”, „potwierdzone”, „jedno źródło”, „uproszczenie”), jeśli nie ma ich w polskim tekście.',
  'Zdania ostrzegawcze (zdrowie, bezpieczeństwo, asekuracja) tłumacz wiernie, bez złagodzenia i bez wzmocnienia.',
  ...WSPOLNE,
  'Dokumenty Markdown: zachowaj strukturę i znaczniki (nagłówki, listy, tabele, wyróżnienia) oraz wstawki {{…}}; komentarze HTML <!-- … --> pomiń; teksty prawne tłumacz wiernie, bez upraszczania i bez dodawania własnych zaleceń.',
  'Formy liczby mnogiej oddzielone znakiem | zachowaj w liczbie i kolejności wymaganej przez język. Odpowiedz WYŁĄCZNIE jednym obiektem JSON, bez komentarza i bez bloku kodu: kluczem jest numer pozycji (tekst), wartością tłumaczenie (tekst).',
].join(' ');
export const SYSTEM_PRZEGLAD = [
  'Jesteś doświadczonym tłumaczem i redaktorem tekstów strony internetowej z biblioteką ćwiczeń siłowych. Przeglądasz gotowe tłumaczenia z polskiego; angielski jest drugim tekstem odniesienia, jeśli jest podany. Sam niczego nie poprawiasz w plikach: zwracasz listę poprawek.',
  'Dla każdej pozycji oceń: (1) poprawność znaczenia względem polskiego źródła; (2) czy nie złagodzono ani nie wzmocniono twierdzeń medycznych, bezpieczeństwa i prawnych; (3) formę grzecznościową zgodną z podanym rejestrem języka;',
  '(4) naturalność dla rodzimego użytkownika (jak powiedziałby trener albo kolega na siłowni); (5) zgodność zmiennych {…} i wstawek {{…}} (te same nazwy, bez tłumaczenia ani zmiany); (6) liczbę mnogą; (7) zgodność ze słownikiem terminów języka (terminy „NIE używaj” to osobna uwaga);',
  '(8) obecność w tłumaczeniu nazw źródeł, autorów, organizacji, firm lub marek, których nie ma w polskim tekście (to uwaga krytyczna).',
  'Nie zgłaszaj różnic czysto stylistycznych bez powodu. Nie oceniaj merytorycznej prawdziwości zaleceń treningowych ani prawnej poprawności — tylko wierność przekładu.',
  'Wagi: „krytyczna” = zmiana lub utrata znaczenia, złagodzenie/wzmocnienie twierdzenia medycznego, bezpieczeństwa lub prawnego, uszkodzona zmienna, nazwa źródła lub firmy dodana w tłumaczeniu;',
  '„średnia” = niejasność, błędny rejestr, nienaturalne sformułowanie, niespójna terminologia, termin zakazany; „niska” = drobny styl, interpunkcja, typografia.',
  'Odpowiedz WYŁĄCZNIE jednym obiektem JSON, bez komentarza i bez bloku kodu. Kluczem jest numer pozycji (tekst), wartością albo "ok", albo obiekt',
  '{"poprawka": "<proponowany pełny tekst w języku docelowym>", "powod": "<krótko, po polsku>", "waga": "krytyczna" | "średnia" | "niska"}. Każda pozycja musi mieć wpis.',
].join(' ');

/** Zadanie dla pary (źródło, język). tryb: 'przeklad' | 'przeglad'. W przeglądzie pozycje bez pola `tlumaczenie` są pomijane (zgłasza je kontrola lokalna). */
export function budujZadanie(tryb, zrodlo, kod, slowniki) {
  const przeglad = tryb === 'przeglad';
  const lista = zrodlo.pozycje.filter((p) => !przeglad || (typeof p.tlumaczenie === 'string' && p.tlumaczenie.trim())).map((p) => {
    const o = { id: String(p.id), pl: p.pl }; if (p.en) o.en = p.en; if (przeglad) o.tlumaczenie = p.tlumaczenie; return o;
  });
  const user = [
    `Język docelowy: ${nazwaJezyka(kod)} (${kod}).`,
    `Rejestr i konwencje tego języka: ${REJESTR[kod] ?? 'jak w iOS danego języka'}.`,
    `Rodzaj tekstów: ${zrodlo.opis}.${zrodlo.wskazowka ? ` ${zrodlo.wskazowka}` : ''}`,
    ...(slowniki ? [slownik.blokPromptu(slowniki, kod)].filter(Boolean) : []),
    przeglad ? `Pozycji: ${lista.length}. Pole „pl” to tekst źródłowy, „en” angielski tekst odniesienia (jeśli jest), „tlumaczenie” — tekst do oceny.` : `Pozycji: ${lista.length}. Pole „pl” to tekst źródłowy, „en” angielski tekst odniesienia (jeśli jest).`,
    '', JSON.stringify(lista),
  ].join('\n');
  return { system: przeglad ? SYSTEM_PRZEGLAD : SYSTEM_PRZEKLAD, messages: [{ role: 'user', content: user }] };
}
export function budujZadanieBatcha(tryb, zrodlo, kod, slowniki, { model, effort }) {
  const z = budujZadanie(tryb, zrodlo, kod, slowniki);
  return { custom_id: `${PREFIKS[tryb]}-${zrodlo.id}-${kod}`, params: { model, max_tokens: MAX_TOKENS, system: z.system, messages: z.messages, output_config: { effort } } };
}

/* ---------- odpowiedzi ---------- */
/** Indeks klamry zamykającej pierwszy obiekt JSON od `a` (z łańcuchami i ucieczkami); komentarz modelu po obiekcie nie przesuwa końca. */
export function zamknieciaObiektu(s, a) {
  if (a < 0) return -1;
  let g = 0, w = false, u = false;
  for (let i = a; i < s.length; i++) {
    const c = s[i];
    if (w) { if (u) u = false; else if (c === '\\') u = true; else if (c === '"') w = false; continue; }
    if (c === '"') w = true; else if (c === '{') g++; else if (c === '}' && --g === 0) return i;
  }
  return s.lastIndexOf('}');
}
function obiektZOdpowiedzi(tekst) {
  const s = String(tekst ?? '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const a = s.indexOf('{'); const b = zamknieciaObiektu(s, a);
  if (a < 0 || b <= a) return { blad: 'brak obiektu JSON w odpowiedzi' };
  try { return { obj: JSON.parse(s.slice(a, b + 1)) }; } catch (e) { return { blad: `niepoprawny JSON: ${e.message}` }; }
}

/** Odpowiedź przekładu → { blad, propozycje: {klucz: tłumaczenie}, odrzucone }. Bez zgodnych zmiennych {…}, puste albo z terminem zakazanym → „odrzucone”. */
export function parsujOdpowiedz(tekst, pozycje, kod = null, slowniki = null) {
  const { obj, blad } = obiektZOdpowiedzi(tekst);
  if (blad) return { blad, propozycje: {}, odrzucone: pozycje.map((p) => ({ klucz: p.klucz, powod: 'brak odpowiedzi' })) };
  const propozycje = {}; const odrzucone = [];
  for (const p of pozycje) {
    const v = obj[String(p.id)];
    if (typeof v !== 'string' || !v.trim()) { odrzucone.push({ klucz: p.klucz, powod: 'brak tłumaczenia w odpowiedzi' }); continue; }
    if (zmienne(p.pl).join('') !== zmienne(v).join('')) { odrzucone.push({ klucz: p.klucz, powod: `zmienne: źródło ${zmienne(p.pl).join('') || '—'}, tłumaczenie ${zmienne(v).join('') || '—'}`, tlumaczenie: v }); continue; }
    const n = kod && slowniki ? slownik.sprawdz(slowniki, kod, p.pl, v) : [];
    if (n.length) { odrzucone.push({ klucz: p.klucz, powod: `słownik terminów: ${n.map((x) => `${x.pojecie} /${x.wzorzec}/ — ${x.powod}`).join('; ')}`, tlumaczenie: v }); continue; }
    propozycje[p.klucz] = typografia(kod, v.trim());
  }
  return { blad: null, propozycje, odrzucone };
}
const normWaga = (w) => { const s = String(w ?? '').toLowerCase().trim().replace('srednia', 'średnia'); return WAGI.includes(s) ? s : 'średnia'; };
/** Odpowiedź przeglądu → { blad, wyniki: {id: {ocena, poprawka, powod, waga}}, brak: [id] }. */
export function parsujOdpowiedzPrzegladu(tekst, idy) {
  const { obj, blad } = obiektZOdpowiedzi(tekst);
  if (blad) return { blad, wyniki: {}, brak: [...idy] };
  const wyniki = {}; const brak = [];
  for (const id of idy) {
    const v = obj[String(id)];
    if (v === undefined) { brak.push(id); continue; }
    if (typeof v === 'string' && v.trim().toLowerCase() === 'ok') { wyniki[id] = { ocena: 'ok' }; continue; }
    if (v && typeof v === 'object') { wyniki[id] = { ocena: 'poprawka', poprawka: typeof v.poprawka === 'string' ? v.poprawka : null, powod: String(v.powod ?? ''), waga: normWaga(v.waga) }; continue; }
    wyniki[id] = { ocena: 'poprawka', poprawka: null, powod: `nierozpoznana odpowiedź: ${String(v).slice(0, 120)}`, waga: 'średnia' };
  }
  return { blad: null, wyniki, brak };
}

/** Jedna linia wyniku batcha → { zrodlo, kod, blad, tekst, uzycie }. Nie zachowuje nagłówków ani surowej odpowiedzi; komunikaty błędów maskowane. */
export function odczytajLinie(linia, klucz = '') {
  const r = JSON.parse(linia); const m0 = /^(?:pr|pg)-([a-z0-9]+)-(.+)$/.exec(String(r.custom_id)); const zrodlo = m0?.[1] ?? ''; const kod = m0?.[2] ?? String(r.custom_id); const res = r.result ?? {};
  if (res.type !== 'succeeded') return { zrodlo, kod, blad: maskuj(`${res.type}${res.error?.error?.message ? `: ${res.error.error.message}` : res.error?.message ? `: ${res.error.message}` : ''}`, klucz), tekst: null, uzycie: null };
  const m = res.message ?? {};
  const tekst = (m.content ?? []).filter((c) => c.type === 'text').map((c) => c.text).join('\n');
  if (m.stop_reason === 'max_tokens') return { zrodlo, kod, blad: 'odpowiedź ucięta (max_tokens)', tekst: null, uzycie: m.usage ?? null };
  if (m.stop_reason === 'refusal') return { zrodlo, kod, blad: 'odmowa modelu (refusal)', tekst: null, uzycie: m.usage ?? null };
  return { zrodlo, kod, blad: null, tekst, uzycie: m.usage ?? null };
}

/* ---------- raporty ---------- */
export function raportPrzekladu(zad, odczyt, meta, slowniki) {
  const p = odczyt.blad ? { blad: odczyt.blad, propozycje: {}, odrzucone: zad.pozycje.map((x) => ({ klucz: x.klucz, powod: 'brak odpowiedzi' })) } : parsujOdpowiedz(odczyt.tekst, zad.pozycje, zad.kod, slowniki);
  return { jezyk: zad.kod, zrodlo: zad.zrodlo.id, ...meta, pozycji: zad.pozycje.length, przyjete: Object.keys(p.propozycje).length, blad: p.blad, odrzucone: p.odrzucone, propozycje: p.propozycje };
}
/** Kontrola lokalna (bez API): brak tłumaczenia i niezgodność zmiennych. */
export function kontrolaLokalna(pozycje) {
  const w = [];
  for (const p of pozycje) {
    if (!(typeof p.tlumaczenie === 'string' && p.tlumaczenie.trim())) { w.push({ klucz: p.klucz, problem: 'brak tłumaczenia', waga: 'krytyczna' }); continue; }
    const a = zmienne(p.pl).join(''); const b = zmienne(p.tlumaczenie).join('');
    if (a !== b) w.push({ klucz: p.klucz, problem: `zmienne: źródło ${a || '—'}, tłumaczenie ${b || '—'}`, waga: 'krytyczna' });
  }
  return w;
}
export function raportPrzegladu(zad, odczyt, meta) {
  const sprawdzane = zad.pozycje.filter((p) => typeof p.tlumaczenie === 'string' && p.tlumaczenie.trim()); const idy = sprawdzane.map((p) => p.id);
  const p = odczyt.blad ? { blad: odczyt.blad, wyniki: {}, brak: idy } : parsujOdpowiedzPrzegladu(odczyt.tekst, idy);
  const uwagi = []; let ok = 0;
  for (const x of sprawdzane) {
    const w = p.wyniki[x.id]; if (!w) continue;
    if (w.ocena === 'ok') { ok++; continue; }
    uwagi.push({ klucz: x.klucz, pl: x.pl, tlumaczenie: x.tlumaczenie, poprawka: w.poprawka, powod: w.powod, waga: w.waga });
  }
  uwagi.sort((a, b) => WAGI.indexOf(a.waga) - WAGI.indexOf(b.waga));
  return { jezyk: zad.kod, zrodlo: zad.zrodlo.id, ...meta, pozycji: zad.pozycje.length, ok, uwagi, brak_odpowiedzi: p.brak.map((id) => sprawdzane.find((x) => x.id === id)?.klucz), blad: p.blad, kontrola_lokalna: kontrolaLokalna(zad.pozycje) };
}
const ob = (s, n = 160) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, n);
export function podsumowanieMd(tryb, raporty, meta) {
  const L = [`# ${tryb === 'przeklad' ? 'Przekład' : 'Przegląd'} tekstów strony przez API (${tryb === 'przeklad' ? 'propozycje' : 'lista poprawek'})`, '',
    `Model: \`${meta.model}\`, effort: \`${meta.effort}\`, batch: \`${meta.batch_id ?? '—'}\`. Żądań: ${raporty.length}.`,
    tryb === 'przeklad' ? 'Propozycje do przeglądu — pliki w repo nie zostały zmienione. Nałożenie po przeglądzie: `node scripts/przeklad/przeklad-api.mjs --zastosuj <katalog>`.' : 'Raport informacyjny — pliki w repo nie zostały zmienione; poprawki nanosi człowiek po przejrzeniu (propozycje modelu bywają błędne).', ''];
  if (tryb === 'przeklad') {
    L.push('| źródło | język | pozycji | przyjęte | odrzucone | błąd |', '|---|---|---|---|---|---|');
    for (const r of raporty) L.push(`| ${r.zrodlo} | ${r.jezyk} | ${r.pozycji} | ${r.przyjete} | ${r.odrzucone.length} | ${r.blad ?? ''} |`);
    const odrz = raporty.flatMap((r) => r.odrzucone.map((o) => ({ jezyk: r.jezyk, zrodlo: r.zrodlo, ...o })));
    if (odrz.length) { L.push('', `## Odrzucone (${odrz.length})`, ''); for (const o of odrz) L.push(`- **${o.zrodlo}/${o.jezyk}** „${ob(o.klucz, 120)}”: ${ob(o.powod, 200)}`); }
  } else {
    const licz = (r, w) => r.uwagi.filter((u) => u.waga === w).length;
    L.push('| źródło | język | pozycji | ok | krytyczne | średnie | niskie | bez odpowiedzi | kontrola lokalna | błąd |', '|---|---|---|---|---|---|---|---|---|---|');
    for (const r of raporty) L.push(`| ${r.zrodlo} | ${r.jezyk} | ${r.pozycji} | ${r.ok} | ${licz(r, 'krytyczna')} | ${licz(r, 'średnia')} | ${licz(r, 'niska')} | ${r.brak_odpowiedzi.length} | ${r.kontrola_lokalna.length} | ${r.blad ?? ''} |`);
    const kryt = raporty.flatMap((r) => r.uwagi.filter((u) => u.waga === 'krytyczna').map((u) => ({ jezyk: r.jezyk, zrodlo: r.zrodlo, ...u })));
    L.push('', `## Uwagi krytyczne (${kryt.length})`, '');
    for (const u of kryt) L.push(`- **${u.zrodlo}/${u.jezyk}** „${ob(u.klucz, 100)}”: obecnie „${ob(u.tlumaczenie)}” → propozycja „${ob(u.poprawka)}”; powód: ${ob(u.powod, 200)}`);
    const lok = raporty.flatMap((r) => r.kontrola_lokalna.map((k) => ({ jezyk: r.jezyk, zrodlo: r.zrodlo, ...k })));
    if (lok.length) { L.push('', `## Kontrola lokalna (bez API) (${lok.length})`, ''); for (const k of lok) L.push(`- **${k.zrodlo}/${k.jezyk}** „${ob(k.klucz, 100)}”: ${k.problem}`); }
  }
  return L.join('\n') + '\n';
}

/* ---------- szacunek kosztu ---------- */
const nad = (p) => Math.max(przyblizTokeny(p.pl), przyblizTokeny(p.en ?? ''));
export function wierszSzacunku(tryb, zad, we) {
  const pozycje = tryb === 'przeglad' ? zad.pozycje.filter((p) => typeof p.tlumaczenie === 'string' && p.tlumaczenie.trim()) : zad.pozycje;
  let wy;
  if (tryb === 'przeklad') wy = Math.ceil(pozycje.reduce((s, p) => s + nad(p) * WSPOLCZYNNIK(zad.kod) + ZALOZENIA_PRZEKLADU.obwiednia, 0)) + ZALOZENIA_PRZEKLADU.myslenie;
  else { const z = ZALOZENIA_PRZEGLADU; wy = Math.ceil(pozycje.reduce((s, p) => s + (1 - z.udzialPoprawek) * z.tokenyOk + z.udzialPoprawek * Math.max(z.tokenyPoprawka, przyblizTokeny(p.tlumaczenie)), 0)) + z.myslenie; }
  return { zrodlo: zad.zrodlo.id, jezyk: zad.kod, pozycji: pozycje.length, we, wy };
}
export function szacunek(wiersze, model) {
  const we = wiersze.reduce((s, w) => s + w.we, 0); const wy = wiersze.reduce((s, w) => s + w.wy, 0);
  return { zadan: wiersze.length, pozycji: wiersze.reduce((s, w) => s + w.pozycji, 0), tokeny_we: we, tokeny_wy: wy, koszt_usd: kosztUsd(we, wy, model), koszt_wg_modelu: Object.fromEntries(Object.values(MODELE).map((m) => [m, kosztUsd(we, wy, m)])) };
}

/* ---------- cele: odczyt (przegląd) i nałożenie (przekład) ---------- */
/** Pozycje źródła z dopisanym tłumaczeniem w języku `kod` (czytane z plików celów w repo); brak pliku celu → `tlumaczenie: null`. Zwraca też, czy jakikolwiek plik celu istnieje. */
export function zTlumaczeniem(root, zrodlo, kod) {
  let jest = false; let pozycje;
  if (zrodlo.rodzaj === 'mapa') {
    const p = join(root, sciezkaCelu(zrodlo, kod)); const d = existsSync(p) ? czytaj(p) : null; jest = d !== null;
    pozycje = zrodlo.pozycje.map((x) => ({ ...x, tlumaczenie: d ? pobierz(d, x.sciezka) ?? null : null }));
  } else {
    pozycje = zrodlo.pozycje.map((x) => { const p = join(root, sciezkaCelu(zrodlo, kod, x.klucz)); const e = existsSync(p); jest ||= e; return { ...x, tlumaczenie: e ? readFileSync(p, 'utf8') : null }; });
  }
  return { pozycje, jest };
}

/** Nakłada propozycje z katalogu raportu przekładu na pliki celów (lokalnie, po przeglądzie; bez sieci i klucza). Klucze spoza źródła i tłumaczenia z innymi zmiennymi są pomijane. */
export function zastosuj(root, katalog) {
  const zrodla = wczytajZrodla(root); const kody = jezykiDoPrzekladu(root); const wynik = { zapisanych: 0, plikow: 0, pominietych: [] };
  for (const z of zrodla) for (const kod of kody) {
    const f = join(katalog, z.id, `${kod}.json`); if (!existsSync(f)) continue;
    const r = czytaj(f); const wg = new Map(z.pozycje.map((x) => [x.klucz, x])); const cel = join(root, sciezkaCelu(z, kod));
    let d = z.rodzaj === 'mapa' ? (existsSync(cel) ? czytaj(cel) : {}) : null; let zmienione = 0;
    for (const [klucz, tl] of Object.entries(r.propozycje ?? {})) {
      const poz = wg.get(klucz);
      if (!poz) { wynik.pominietych.push(`${z.id}/${kod}: klucz spoza źródła „${klucz.slice(0, 40)}”`); continue; }
      if (typeof tl !== 'string' || !tl.trim() || zmienne(poz.pl).join('') !== zmienne(tl).join('')) { wynik.pominietych.push(`${z.id}/${kod}: zmienne „${klucz.slice(0, 40)}”`); continue; }
      if (z.rodzaj === 'mapa') ustaw(d, poz.sciezka, typografia(kod, tl));
      else { const p = join(root, sciezkaCelu(z, kod, klucz)); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, tl.endsWith('\n') ? tl : `${tl}\n`); wynik.plikow++; }
      zmienione++; wynik.zapisanych++;
    }
    if (z.rodzaj === 'mapa' && zmienione) { mkdirSync(dirname(cel), { recursive: true }); writeFileSync(cel, JSON.stringify(d, null, 1) + '\n'); wynik.plikow++; }
  }
  return wynik;
}

/* ---------- argumenty i przebieg ---------- */
export function parsujArgumenty(tryb, argv) {
  const o = { model: DOMYSLNY_MODEL, effort: DOMYSLNY_EFFORT, szacuj: false, limit: null, wyjscie: tryb === 'przeklad' ? 'raport-przekladu' : 'raport-przegladu', zrodla: [], zgodaKoszt: false, wznow: null, czekajMin: CZEKAJ_MIN_DOMYSLNIE, zastosuj: null, zapiszWydatek: null };
  const wart = (i, n) => { if (i + 1 >= argv.length) throw new Error(`brak wartości dla ${n}`); return argv[i + 1]; };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--szacuj') o.szacuj = true;
    else if (a === '--zgoda-koszt') o.zgodaKoszt = true;
    else if (a === '--model') { const v = wart(i++, a); o.model = MODELE[v] ?? v; }
    else if (a === '--effort') o.effort = wart(i++, a);
    else if (a === '--limit') { const v = wart(i++, a); if (v !== '') { const n = Number(v); if (!Number.isInteger(n) || n < 1) throw new Error('--limit: liczba całkowita ≥ 1'); o.limit = n; } }
    else if (a === '--wyjscie') o.wyjscie = wart(i++, a);
    else if (a === '--zrodlo') o.zrodla = wart(i++, a).split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--wznow') { const v = wart(i++, a); if (v !== '') { if (!/^msgbatch_[A-Za-z0-9]+$/.test(v)) throw new Error('--wznow: oczekiwany identyfikator msgbatch_…'); o.wznow = v; } }
    else if (a === '--czekaj-min') o.czekajMin = Number(wart(i++, a));
    else if (a === '--zastosuj' && tryb === 'przeklad') o.zastosuj = wart(i++, a);
    else if (a === '--zapisz-wydatek') o.zapiszWydatek = wart(i++, a);
    else throw new Error(`nieznany argument: ${a}`);
  }
  if (!CENY[o.model]) throw new Error(`nieznany model: ${o.model} (dozwolone: ${Object.values(MODELE).join(', ')})`);
  if (!EFFORTY.includes(o.effort)) throw new Error(`nieznany effort: ${o.effort} (dozwolone: ${EFFORTY.join(', ')})`);
  return o;
}

export async function main(tryb, argv, env, { fetchFn = fetch, log = console.log, root = ROOT, spij } = {}) {
  const o = parsujArgumenty(tryb, argv); const klucz = env.ANTHROPIC_API_KEY || '';
  const wyp = (s) => log(maskuj(s, klucz));
  try { return await przebieg(tryb, o, klucz, { fetchFn, wyp, root, spij }); }
  catch (e) { wyp(`błąd: ${e.message}`); return e.kodWyjscia ?? 1; }
}

async function przebieg(tryb, o, klucz, { fetchFn, wyp, root, spij }) {
  const wyj = resolve(root, o.wyjscie);
  if (o.zapiszWydatek) {
    const w = czytaj(join(resolve(root, o.zapiszWydatek), 'wydatek.json')); const r = wydatki.dopisz(root, w);
    wyp(`${r.dopisano ? 'dopisano' : 'już zaksięgowano'}: ${w.przebieg} ${w.batch_id}, ${Number(w.koszt_usd).toFixed(2)} USD; wydano łącznie ${r.suma.toFixed(2)} z ${LIMIT_LACZNY_USD} USD. Dalej: git add docs/przeklad/wydatki.json i commit.`);
    return 0;
  }
  if (o.zastosuj) {
    const p = zastosuj(root, resolve(root, o.zastosuj));
    wyp(`nałożono ${p.zapisanych} tłumaczeń w ${p.plikow} plikach; pominięte: ${p.pominietych.length}`); for (const x of p.pominietych) wyp(`  pominięto: ${x}`);
    wyp('Dalej: przegląd (workflow „Przegląd tłumaczeń”), npm test, commit.');
    return 0;
  }
  const api = klucz ? klient(fetchFn, klucz) : null;
  const zrodla = wczytajZrodla(root, o.zrodla); const kody = jezykiDoPrzekladu(root).slice(0, o.limit ?? undefined); const slowniki = slownik.wczytaj(root);
  for (const id of zrodla.pominiete ?? []) wyp(`pominięto źródło „${id}”: oczekuje na pliki (zob. docs/przeklad/zrodla.json, pole oczekuje)`);
  const zadania = [];
  for (const z of zrodla) for (const kod of kody) {
    let pozycje = z.pozycje;
    if (tryb === 'przeglad') { const t = zTlumaczeniem(root, z, kod); if (!t.jest) { wyp(`pominięto ${z.id}/${kod}: brak pliku celu (nie ma czego przeglądać)`); continue; } pozycje = t.pozycje; }
    zadania.push({ zrodlo: { ...z, pozycje }, kod, pozycje, batch: budujZadanieBatcha(tryb, { ...z, pozycje }, kod, slowniki, o) });
  }
  if (!zadania.length) throw new Error('brak zadań (źródła/języki/cele puste)');
  wyp(`${tryb}: źródeł ${zrodla.length}, języków ${kody.length}, żądań ${zadania.length}; model ${o.model}, effort ${o.effort}`);
  mkdirSync(wyj, { recursive: true });

  if (!o.wznow) {
    const wiersze = [];
    for (const z of zadania) {
      const we = api ? await api.liczTokeny(o.model, z.batch.params) : przyblizTokeny(tekstZadania(z.batch.params));
      const w = wierszSzacunku(tryb, z, we);
      if (w.wy > MAX_TOKENS) throw new Error(`żądanie ${z.zrodlo.id}/${z.kod} ma szacowane wyjście ${w.wy} tokenów (> ${MAX_TOKENS}); podziel źródło na mniejsze`);
      wiersze.push(w);
    }
    const s = szacunek(wiersze, o.model); const wydane = wydatki.suma(root); const limit = Math.min(wydatki.limit(root), LIMIT_LACZNY_USD);
    const zrodloSz = api ? 'count_tokens (wejście), wyjście z założeń' : 'przybliżenie (bez klucza), wyjście z założeń';
    wyp(`szacunek (${zrodloSz}, Batch −${RABAT_BATCH * 100}%): wejście ${s.tokeny_we}, wyjście ${s.tokeny_wy} tokenów; ${Object.entries(s.koszt_wg_modelu).map(([m, c]) => `${m} ≈ ${c.toFixed(2)} USD`).join(', ')}`);
    writeFileSync(join(wyj, 'szacunek.json'), JSON.stringify({ tryb, zrodlo: zrodloSz, model: o.model, effort: o.effort, zalozenia: tryb === 'przeklad' ? ZALOZENIA_PRZEKLADU : ZALOZENIA_PRZEGLADU, ...s, wydano_dotad_usd: wydane, limit_laczny_usd: limit, wiersze }, null, 1) + '\n');
    if (wydane + s.koszt_usd > limit) { wyp(`STOP: limit łączny ${limit} USD: wydano dotąd ${wydane.toFixed(2)} USD, ten przebieg ≈ ${s.koszt_usd.toFixed(2)} USD. Limit łączny nie ma zgody-wyjątku; podniesienie wymaga decyzji właściciela i zmiany w kodzie.`); return 5; }
    if (s.koszt_usd > LIMIT_PRZEBIEGU_USD && !o.zgodaKoszt) { wyp(`STOP: szacowany koszt ${s.koszt_usd.toFixed(2)} USD przekracza limit ${LIMIT_PRZEBIEGU_USD} USD; uruchom ponownie z zgodą na koszt (--zgoda-koszt / zgoda_koszt=tak)`); return 3; }
    if (o.szacuj) return 0;
  }
  if (!api) { wyp('brak ANTHROPIC_API_KEY — przebieg płatny niemożliwy (użyj --szacuj)'); return 2; }

  let id = o.wznow;
  if (!id) { const b = await api.utworz(zadania.map((z) => z.batch)); id = b.id; wyp(`wysłano batch ${id}`); }
  const batch = await czekajNaBatch(api, id, { czekajMin: o.czekajMin, interwalS: INTERWAL_S, log: wyp, spij });
  const linie = (await api.wyniki(batch.results_url)).split('\n').filter((l) => l.trim());
  const odczyty = new Map(linie.map((l) => { const r = odczytajLinie(l, klucz); return [`${r.zrodlo}/${r.kod}`, r]; }));
  const meta = { model: o.model, effort: o.effort, batch_id: id };
  const raporty = zadania.map((z) => { const od = odczyty.get(`${z.zrodlo.id}/${z.kod}`) ?? { blad: 'brak wyniku w batchu', tekst: null }; const zad = { zrodlo: z.zrodlo, kod: z.kod, pozycje: z.pozycje }; return tryb === 'przeklad' ? raportPrzekladu(zad, od, meta, slowniki) : raportPrzegladu(zad, od, meta); });
  for (const r of raporty) { mkdirSync(join(wyj, r.zrodlo), { recursive: true }); writeFileSync(join(wyj, r.zrodlo, `${r.jezyk}.json`), JSON.stringify(r, null, 1) + '\n'); }
  writeFileSync(join(wyj, 'podsumowanie.md'), podsumowanieMd(tryb, raporty, meta));
  const we = [...odczyty.values()].reduce((s, r) => s + (r.uzycie?.input_tokens ?? 0), 0); const wy = [...odczyty.values()].reduce((s, r) => s + (r.uzycie?.output_tokens ?? 0), 0);
  const koszt = kosztUsd(we, wy, o.model);
  writeFileSync(join(wyj, 'wydatek.json'), JSON.stringify({ przebieg: tryb, batch_id: id, model: o.model, data: new Date().toISOString().slice(0, 10), tokeny_we: we, tokeny_wy: wy, koszt_usd: koszt }, null, 1) + '\n');
  wyp(`raport: ${o.wyjscie}/ (${raporty.length} żądań); koszt wg użycia ${koszt.toFixed(2)} USD — zaksięguj: node scripts/przeklad/${tryb}-api.mjs --zapisz-wydatek ${o.wyjscie}`);
  return raporty.some((r) => r.blad) ? 1 : 0;
}
