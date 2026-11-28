// Strażnik terminów (zasada właściciela 25.10.2026, słownik aplikacji): teksty stałe strony nie używają terminów zakazanych ze słownika aplikacji
// (.cache/dane/slownik-terminow.json, pobierany przez npm run dane, nie commitowany) ani ze słownika strony (docs/slownik-strony.json).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, requireData } from './pomoc.mjs';

requireData();
const app = JSON.parse(readFileSync(join(ROOT, '.cache/dane/slownik-terminow.json'), 'utf8'));
const site = JSON.parse(readFileSync(join(ROOT, 'docs/slownik-strony.json'), 'utf8'));
const langs = readdirSync(join(ROOT, 'src/ui')).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
const ui = Object.fromEntries(langs.map(l => [l, JSON.parse(readFileSync(join(ROOT, `src/ui/${l}.json`), 'utf8'))]));
const strings = (o, out = []) => { if (typeof o === 'string') out.push(o); else if (Array.isArray(o)) o.forEach(x => strings(x, out)); else if (o && typeof o === 'object') Object.entries(o).forEach(([k, x]) => { if (!k.startsWith('_')) strings(x, out); }); return out; };
const at = (o, path) => path.split('.').reduce((a, k) => a?.[k], o);

// Wyjątki (decyzja właściciela 09.11.2026, docs/54): nazwy grup z danych aplikacji, w których wzorzec zakazany innego pojęcia trafia
// na poprawny termin. Klucz: `${język}/${pojęcie}: tekst`; każdy z powodem. Wyjątek nieużyty = błąd (lista nie puchnie).
const WYJATKI = {
  'en/nozyce: Lunges and step-ups': 'nazwa grupy ćwiczeń — wykroki to wykroki; zakaz „lunge” dotyczy pozycji nożyc w opisie techniki',
  'pl/nozyce: Wykroki i wejścia na skrzynię': 'nazwa grupy ćwiczeń — zakaz „wykrok” dotyczy pozycji nożyc w opisie techniki, nie nazwy grupy',
  /* analogia do wyjątków z 09.11.2026 (zapis „do weta”, 27.11.2026, dane z tagu 1.1.1): nazwy grup ćwiczeń z aplikacji, w których zakaz innego pojęcia trafia na poprawny termin */
  'es/pozycja_pompki: Flexiones y planchas': 'nazwa grupy ćwiczeń — „plancha” = deska (plank) w grupie „pompki i deski”; zakaz dotyczy pozycji pompki w opisie techniki',
  'pt-BR/pozycja_pompki: Flexões e pranchas': 'nazwa grupy ćwiczeń — „prancha” = deska (plank) w grupie „pompki i deski”; zakaz dotyczy pozycji pompki w opisie techniki',
  'pt/pozycja_pompki: Flexões e pranchas': 'nazwa grupy ćwiczeń — „prancha” = deska (plank) w grupie „pompki i deski”; zakaz dotyczy pozycji pompki w opisie techniki',
  'zh-Hant/pozycja_pompki: 雙槓撐體': 'nazwa grupy ćwiczeń — „雙槓撐體” = dipy na poręczach; zakaz dotyczy pozycji pompki w opisie techniki',
  'ja/sanki_treningowe: ソリとスロー': 'nazwa grupy ćwiczeń — „ソリとスロー” = sanie i rzuty (grupa ćwiczeń); zakaz dotyczy sanek treningowych jako sprzętu w opisie techniki',
  'uk/biodra: Відведення й приведення стегна': 'nazwa grupy — „стегно” = udo (odwodzenie/przywodzenie uda), poprawnie; zakaz dotyczy stawu biodrowego',
  /* analogia do wyjątków z 09.11.2026 (KO-151, zapis „do weta”, 28.11.2026): zdania ramki opisujące aplikację, w których zakaz innego pojęcia trafia w termin zalecany */
  'cs/dzien_wolny: Po odškrtnutí série se spustí odpočet pauzy.': 'ramka opisuje aplikację — „Pauza” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy dnia wolnego (dzien_wolny)',
  'sk/dzien_wolny: Po odškrtnutí série sa spustí odpočítavanie pauzy.': 'ramka opisuje aplikację — „Pauza” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy dnia wolnego (dzien_wolny)',
  'ro/dzien_wolny: După ce bifați o serie, pornește cronometrul pentru pauză.': 'ramka opisuje aplikację — „Pauză” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy dnia wolnego (dzien_wolny)',
  'cs/pauza_treningu: Po odškrtnutí série se spustí odpočet pauzy.': 'ramka opisuje aplikację — „Pauza” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy wstrzymania treningu (pauza_treningu)',
  'sk/pauza_treningu: Po odškrtnutí série sa spustí odpočítavanie pauzy.': 'ramka opisuje aplikację — „Pauza” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy wstrzymania treningu (pauza_treningu)',
  'ro/pauza_treningu: După ce bifați o serie, pornește cronometrul pentru pauză.': 'ramka opisuje aplikację — „Pauză” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy wstrzymania treningu (pauza_treningu)',
  'de/pauza_treningu: Sobald du einen Satz abhakst, läuft der Timer für die Pause.': 'ramka opisuje aplikację — „Pause” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy wstrzymania treningu (pauza_treningu)',
  'et/pauza_treningu: Kui märgid seeria tehtuks, algab pausi loendus.': 'ramka opisuje aplikację — „Paus” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy wstrzymania treningu (pauza_treningu)',
  'cs/faza_pauza: Po odškrtnutí série se spustí odpočet pauzy.': 'ramka opisuje aplikację — „Pauza” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy fazy pauzy w ćwiczeniu (faza_pauza)',
  'sk/faza_pauza: Po odškrtnutí série sa spustí odpočítavanie pauzy.': 'ramka opisuje aplikację — „Pauza” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy fazy pauzy w ćwiczeniu (faza_pauza)',
  'ro/faza_pauza: După ce bifați o serie, pornește cronometrul pentru pauză.': 'ramka opisuje aplikację — „Pauză” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy fazy pauzy w ćwiczeniu (faza_pauza)',
  'de/faza_pauza: Sobald du einen Satz abhakst, läuft der Timer für die Pause.': 'ramka opisuje aplikację — „Pause” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy fazy pauzy w ćwiczeniu (faza_pauza)',
  'et/faza_pauza: Kui märgid seeria tehtuks, algab pausi loendus.': 'ramka opisuje aplikację — „Paus” to termin zalecany pojęcia przerwa (przerwa między seriami); zakaz dotyczy fazy pauzy w ćwiczeniu (faza_pauza)',
  'el/plan_subskrypcji: Από τα πρότυπα φτιάχνεις το εβδομαδιαίο πρόγραμμα ή δημιουργείς πρότυπα και πρόγραμμα με βάση λίγες επιλογές.': 'ramka opisuje aplikację — „πρόγραμμα” to termin zalecany pojęcia plan (plan tygodnia); zakaz dotyczy planu subskrypcji (plan_subskrypcji)',
  'et/plan_subskrypcji: Mallidest saad koostada nädalaplaani või lasta mõne valiku põhjal luua mallid ja plaani.': 'ramka opisuje aplikację — „plaan” to termin zalecany pojęcia plan (plan tygodnia); zakaz dotyczy planu subskrypcji (plan_subskrypcji)',
  'ko/plan_subskrypcji: 루틴으로 주간 플랜을 짜거나, 몇 가지 조건만 정해 루틴과 플랜을 자동으로 만들 수 있습니다.': 'ramka opisuje aplikację — „플랜” to termin zalecany pojęcia plan (plan tygodnia); zakaz dotyczy planu subskrypcji (plan_subskrypcji)',
  'sl/plan_subskrypcji: Iz predlog sestavite tedenski načrt ali pa predloge in načrt ustvarite na podlagi nekaj izbir.': 'ramka opisuje aplikację — „načrt” to termin zalecany pojęcia plan (plan tygodnia); zakaz dotyczy planu subskrypcji (plan_subskrypcji)',
};
test('słownik aplikacji: wzorce zakazane nie występują w tekstach strony (wszystkie języki)', () => {
  const bad = []; const uzyte = new Set();
  for (const p of app.pojecia) for (const l of langs) for (const z of p.jezyki[l]?.zakazane ?? []) {
    const re = new RegExp(z.wzorzec, 'iu');
    for (const s of strings(ui[l])) if (re.test(s)) { const k = `${l}/${p.id}: ${s}`; if (WYJATKI[k]) uzyte.add(k); else bad.push(`${l}/${p.id}: „${s}” ~ ${z.wzorzec}`); }
  }
  assert.deepEqual(bad, []);
  assert.deepEqual(Object.keys(WYJATKI).filter(k => !uzyte.has(k)), [], 'wyjątek nieużyty — usuń z WYJATKI');
  for (const [k, v] of Object.entries(WYJATKI)) assert.ok(v.length > 20, `wyjątek bez powodu: ${k}`);
});
test('słownik strony: struktura, zalecany termin w kluczu, zakazane poza tekstami', () => {
  const bad = [];
  for (const p of site.pojecia) {
    assert.ok(p.powod.length > 10 && ['plik', 'klucz'].includes(p.zakres), p.id);
    for (const [l, e] of Object.entries(p.jezyki)) {
      assert.ok(ui[l], `${p.id}: brak języka ${l}`);
      const vals = p.klucz.map(k => at(ui[l], k)); const hay = vals.join(' | ').toLowerCase();
      if (vals.some(v => typeof v !== 'string')) bad.push(`${p.id}/${l}: brak klucza`);
      if (!hay.includes(e.zalecany.toLowerCase())) bad.push(`${p.id}/${l}: brak „${e.zalecany}” w ${p.klucz.join(', ')}`);
      for (const z of e.zakazane ?? []) { const re = new RegExp(z, 'iu'); const scope = p.zakres === 'plik' ? strings(ui[l]) : vals; for (const s of scope) if (re.test(s)) bad.push(`${p.id}/${l}: „${s}” ~ ${z}`); }
    }
  }
  assert.deepEqual(bad, []);
});
test('samokontrola: wzorzec zakazany rzeczywiście wykrywa kalkę', () => {
  assert.ok(new RegExp('zanožen', 'iu').test('Zanožení v kyčlích'));
  assert.ok(app.pojecia.some(p => Object.values(p.jezyki).some(e => (e.zakazane ?? []).length)));
});
