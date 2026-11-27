# Stan agenta AQ i plan Z-02a dla następcy (27.11.2026)

Gałąź: `strona/z00-z03-plan-dane-regula` (od `main` @ 21e056c). Zrobione: Z-00, Z-02, Z-03, Z-03b (commity: Z-00, Z-02 ×3, Z-03, Z-03b w `git log`). Czeka: **Z-02a** (poniżej). Zakazy i zasady jak w poleceniu AQ (bez PR i scalania do `main`, bez zmian `pages.yml` ani `config.json → indeksowanie/indeksowanieOd/domena`, nie pisać na gałąź `koordynacja`).

## Z-02a: obsługa trybów pętli figur (BR-BIB-007), po Z-02
Problem: eksport tagu v1.1.1 niesie `loop` (`jednokierunkowa`, `wahadlo`, `cykl_lustro`) i fazy `untimed`; `main` ich nie obsługuje, więc skoki i rzuty grałyby wahadłem (skok wstecz) i pokazywały sekundy przy fazach bez czasu. Źródło pracy: gałąź `figury/petla-jednokierunkowa`, commit `e29555f` (5 plików, +85/−5). Raport: `docs/przeglad-galezi-2026-11-27.md` na gałęzi `strona/z01-przeglad-galezi` (sekcja 12).

Co jest w e29555f (przenieść, nie pisać od nowa; `git diff main...origin/figury/petla-jednokierunkowa`):
- `assets/figura-czas.js` (nowy): `uOf(data, ms, tempo)` wybiera `oneWayAt(ms)` dla `loop === 'jednokierunkowa'`, inaczej `uAt` (wahadło z tempem); brak pola `loop` = wahadło jak dotąd.
- `assets/figura-strona.js`: używa `uOf` zamiast `uAt`.
- `src/pages.mjs`: `figureModule` przekazuje `loop`, jeśli jest; podpis faz pomija sekundy dla `p.untimed` (obok „Pauza”).
- `tests/petla-jednokierunkowa.test.mjs`: dane modułu, zgodność wstecz, podpisy. Testy zależne od nowego eksportu miały `skip` do przepięcia PIN: **PIN jest już przepięty (Z-02), zdejmij `skip`**.

Braki względem 1.1.1 (do zrobienia przy przeniesieniu):
1. Czas przebiegu per ćwiczenie: aplikacja używa `oneWayAt(ms, oneWayRepMs(spec.key))` (`components/ExerciseFigureV2.tsx:92`, `ONE_WAY_REP_MS` w `lib/figures/v2/anim.ts:22` repo aplikacji); gałąź używa domyślnego 1500 ms. Sprawdź, czy `figura.entry.js` z 1.1.1 (`.cache/silnik/`) eksportuje `oneWayRepMs`; jeśli nie — nie zmieniaj eksportu aplikacji (plan nie robi nowego wydania przed startem): wyznacz czas z danych figury albo zgłoś PYTANIE z opcjami.
2. Tryb `cykl_lustro` (marsz: carry, sled_throw, strongman; `lib/figures/v2/figure.ts:142`, `cycleAt` w `ExerciseFigureV2.tsx:92`): gałąź go nie obsługuje, a `figura.entry.js` 1.1.1 może nie eksportować `cycleAt` [DO USTALENIA: policz w `.cache/dane/figury.json` ile figur ma każdy `loop` i `untimed`, odczytaj eksporty silnika].
Kod tagu do odczytu: `git clone --depth 1 --branch v1.1.1-b1042 https://github.com/lkarwowski494/trening <scratchpad>/trening-1-1-1`.
Gotowe, gdy: test odtwarzania jednokierunkowego zielony na danych 1.1.1 (skok i rzut raz, bez cofania, faza bez sekund; wahadło balistyczne bez sekund), tryb `cykl_lustro` obsłużony albo opisany w PYTANIU, `npm run dane && npm test && npm run build` kod 0.

## Pułapki (pamięć testów i adresy)
- `npm test` na danych 1.1.1 uruchamiany równolegle zabija ciężkie pliki (`build.test.mjs`, `jezyki-podglad.test.mjs`, `dostepnosc.test.mjs`) sygnałem SIGKILL (pamięć: pojedyncze procesy 2,5–3,3 GB). Uruchamiaj je po kolei: `node --test --test-concurrency=1 tests/build.test.mjs tests/jezyki-podglad.test.mjs`. Pełny przebieg trwa kilkanaście minut; wynik czytaj z pliku logu, nie z potoku.
- `npm run dane` czyści `.cache/`; logów nie zapisuj w `.cache/` przed jego uruchomieniem.
- Eksport ma surowe slugi; build stosuje nadpisania z `slug-overrides.json` (14 wpisów od Z-02). Testy czytające `.cache/dane/*.json` muszą mapować slugi jak `tests/build.test.mjs` (`MAP`, `rekey`); `figury.json` i `sylwetka.json` są kluczowane surowym slugiem. Slugi `power-clean`, `snatch-balance`, `block-power-snatch`, `clean-pull`, `back-squat` sprawdź, czy nie należą do 14 nadpisań.
- Strażnik sekretów flaguje 40 znaków szesnastkowych w plikach tekstowych: pełne skróty commitów tylko w `PIN.json`.
- Strażnik terminów: 5 wyjątków z powodem w `tests/straznik-terminy.test.mjs` (nazwy grup z 1.1.1, do weta); wyjątek nieużyty = błąd.
- S11: `docs/55-plan-startu.md` zmienia koordynator przy scaleniu, nie agent.

## Do weta właściciela (przyjęte przez koordynatora, KO-131)
- 14 nadpisań adresów w `slug-overrides.json` (stare adresy zostają; alternatywa: nowe adresy + 14 przekierowań).
- 5 wyjątków słownika terminów (es, pt, pt-BR, zh-Hant, ja).
- S3 (ZM-20): blokuje tylko status „ryzyko”.
