# Plan startu strony — odhaczanie zadań (Z-00)

Stan: 2026-11-28 · Źródło: plan zatwierdzony przez właściciela 27.11.2026 (repo trening, `docs/koordynacja/plan-strony-2026-11-27.md`, gałąź `koordynacja`; decyzje P-1…P-12 zapisane w `docs/54-strona-biblioteki.md`, ZM-08…ZM-19).

Jak to działa:
- Kolumna **Stan**: `otwarte` / `w toku` / `zrobione` / `odpada` (wycofane decyzją właściciela; wymaga Daty i identyfikatora decyzji w Dowodzie: `ZM-nn` albo `KO-nn`; test odrzuca wolny tekst). Stan zmienia koordynator w tym samym commicie co scalenie pracy zadania.
- `zrobione` wymaga **Daty** (RRRR-MM-DD) i **Dowodu** (SHA commitu, przebieg `tests.yml`, ścieżka pliku). Zadanie nie może być `zrobione`, gdy zadanie z kolumny **Po** nie jest.
- Test `tests/plan-startu.test.mjs` pilnuje formatu i tych reguł. Strażnik S11 (`src/plan-startu.mjs`, `src/straznicy.mjs`): przy `config.json → indeksowanie=true` build zatrzymuje się, dopóki wszystkie zadania etapów 0–5 (Z-00…Z-52) nie są `zrobione` albo `odpada`. Etap 6 (Z-60…Z-65) robi się po włączeniu indeksowania (Z-60 je włącza), więc sam nie blokuje, **z jednym wyjątkiem: Z-61 (zgoda właściciela na włączenie Google) musi być `zrobione`**, z cytatem słów właściciela w Dowodzie („…”). Kolejność: PR Z-60 zmienia `indeksowanie` na true; w commicie tego PR koordynator odhacza Z-60 i Z-61 (data zgody, cytat), więc build z indeksowaniem bez zgody właściciela pada; Z-62…Z-65 zostają `otwarte` do publikacji. Bez indeksowania to ostrzeżenie.
- Etap 7 (Z-70…Z-75, po starcie) idzie do `docs/zobowiazania.md` repo trening, nie do tej tabeli.
- Dzień rozpoczęcia pracy nad zadaniem w kolumnie Data przy `w toku` jest informacją, nie dowodem.

| ID | Zadanie | Rola | Model | Czas | Po | Stan | Data | Dowód |
|---|---|---|---|---|---|---|---|---|
| Z-00 | Plik planu docs/55-plan-startu.md + test odhaczania; wpis decyzji P-1…P-12 w docs/54 (ZM-08…) | 08-programista (build) | sonnet/medium | 1 h | — | zrobione | 2026-11-27 | strona/z00-z03-plan-dane-regula @ 10155604; tests.yml 46032249443 |
| Z-01 | Przegląd 12 starych gałęzi strony (git diff main...gałąź); raport w docs/, nic nieusunięte bez zgody właściciela | 07-jakosc (audit) | opus/high | 1 h | — | zrobione | 2026-11-27 | strona/z01-przeglad-galezi @ efc69dd6; tests.yml 46017953936; docs/przeglad-galezi-2026-11-27.md |
| Z-02 | PIN.json → v1.1.1-b1042 (d9382dbe), wersjaWydania 1.1.1; parytet adresów; liczby do pomiary/start-1-1-1.md | 08-programista (build) | sonnet/medium | 1 h | Z-00 | zrobione | 2026-11-27 | strona/z00-z03-plan-dane-regula @ 10155604; tests.yml 46032249443; pomiary/start-1-1-1.md |
| Z-03 | Reguła Google wg P-1: src/pages.mjs, strażnik S6, testy w tym samym commicie | 08-programista (build) | sonnet/medium | 1 h | Z-02 | zrobione | 2026-11-27 | strona/z00-z03-plan-dane-regula @ 10155604; tests.yml 46032249443 |
| Z-04 | Instrukcja docs/strona-kroki-wlasciciela.md (Porkbun, GitHub, narzędzia webmastera) | M8-formalnosci (build, zawężona) | opus/high | 1,5 h | — | zrobione | 2026-11-27 | strona/z04-z07-z20-formalnosci @ ad5264c4; docs/strona-kroki-wlasciciela.md |
| Z-05 | WŁAŚCICIEL: DNS w Porkbun + włączenie Pages wg Z-04 | właściciel | — | 25 min + do 24 h | Z-04 | zrobione | 2026-11-27 | właściciel 27.11 ~16:00 „gotowe” (Enforce HTTPS); curl http://www.techniqueatlas.com → 301 |
| Z-06 | Badanie zasięgu u źródeł (AI, roboty, dane strukturalne, obrazki, adresy); raport w docs/ | 11-wzrost (audit) + badacz | opus/medium | 2,5 h | — | zrobione | 2026-11-27 | strona/z06-badanie-zasiegu @ 72d53ce2; tests.yml 46029824334; docs/badanie-zasiegu-2026-11-27.md |
| Z-07 | Metoda sprawdzenia znaków towarowych (≥ 2 metody → PYTANIE) | M8-formalnosci (build, zawężona) | opus/high | 1,5 h | — | zrobione | 2026-11-27 | strona/z04-z07-z20-formalnosci @ c76182b8; docs/znaki-towarowe-metoda.md |
| Z-08 | WŁAŚCICIEL: wybór metody znaków towarowych | właściciel | — | 5 min | Z-07 | odpada | 2026-11-27 | ZM-20 (decyzja właściciela 27.11.2026: „Nie robimy tego.”) |
| Z-10 | Inwentarz strony i 2–3 kierunki wyglądu jako makiety | M6-strona-www + 04-studio-projektowe (build) | opus/high | 4 h | Z-02 | zrobione | 2026-11-27 | strona/z10-makiety @ eb4a9ca9; tests.yml 46035081018; docs/design/makiety-2026-11-27/ |
| Z-11 | WŁAŚCICIEL: wybór kierunku okiem | właściciel | — | 15 min | Z-10 | zrobione | 2026-11-27 | właściciel 27.11 ~17:05: „A „Arkusz” (Rekomendowane)” |
| Z-12 | System wyglądu: tokeny, komponenty, szablony, stany; docs/design/ | 04-studio-projektowe (build) | opus/high | 3 h | Z-11, Z-06 | zrobione | 2026-11-27 | strona/z10-makiety @ 24a19270; tests.yml 46048957875; docs/design/system/design-spec.md |
| Z-20 | Teksty pl + en: polityka prywatności, regulamin, licencja treści | M8-formalnosci (build, zawężona) | opus/high | 2 h | — | zrobione | 2026-11-27 | strona/z04-z07-z20-formalnosci @ c76182b8; tests.yml 46019852421; docs/teksty/prawne/ |
| Z-21 | Ramka „w aplikacji” i akapit o wsparciu, pl + en; tabela zdanie → dowód | 04-studio-projektowe (build) | opus/high | 1,5 h | — | zrobione | 2026-11-27 | strona/z21-ramka-akapit @ 34d87bd3; docs/teksty/ramka-w-aplikacji.md |
| Z-22 | Szablony tytułu, opisu, nagłówków-pytań i krótkiej odpowiedzi; pl + en | 04-studio-projektowe (build) | opus/high | 2 h | Z-06 | zrobione | 2026-11-27 | strona/z22-szablony @ 5340a4f5; tests.yml 46040735422; docs/teksty/szablony-stron.md |
| Z-23 | Niezależna recenzja Z-20, Z-21, Z-22 | 06-tresci (audit) | opus/high | 1,5 h | Z-20, Z-21, Z-22 | zrobione | 2026-11-27 | strona/z23-recenzja-tekstow @ 04ef2f0f; tests.yml 46057465363; docs/teksty/recenzja-z23-2026-11-27.md |
| Z-24 | Polskie nazwy 708 ćwiczeń (tłumaczenie własne, P-7) | 09-lokalizacja (build) | sonnet/medium | 2 h | — | zrobione | 2026-11-27 | strona/z24-nazwy-pl @ 17400396; tests.yml 46040595906; docs/nazwy/pl.json |
| Z-25 | Niezależna recenzja nazw pl | 09-lokalizacja (audit) | opus/medium | 1,5 h | Z-24 | zrobione | 2026-11-27 | strona/z25-recenzja-nazw-pl @ b9ec7694; tests.yml 46037174854; docs/nazwy/recenzja-pl-2026-11-27.md |
| Z-26 | Tłumaczenie Z-20…Z-22 na 33 języki | 09-lokalizacja (build) | sonnet/medium | 3 h | Z-23 | zrobione | 2026-11-28 | strona/przeklad-api @ fd03e38; tests.yml 46130462211; docs/przeklad/pelny-przebieg-2026-11-28.md (przekład API, KO-133) |
| Z-27 | Niezależna recenzja 33 języków | 09-lokalizacja (audit) | opus/medium | 2,5 h | Z-26 | zrobione | 2026-11-28 | strona/przeklad-api @ fd03e38; przegląd API 46126901328 (model, bez człowieka — decyzja właściciela KO-133; 7 uwag krytycznych nałożonych); scalenie 074e3f8 tests.yml 46132213306 |
| Z-28 | Znaki towarowe wg Z-08: trademark-check.json dla EN i pl | M8-formalnosci (build, zawężona) | opus/high | — | Z-08, Z-25 | odpada | 2026-11-27 | ZM-20 (decyzja właściciela 27.11.2026: „Nie robimy tego.”) |
| Z-30 | Strategia testów nowego zakresu przed kodem (testy czerwone) | 07-jakosc (build) | opus/medium | 2 h | Z-12, Z-22 | zrobione | 2026-11-27 | strona/z30-testy @ 8720007; tests.yml 46056881459; docs/55-strategia-testow-wdrozenia.md |
| Z-31 | Wygląd wg docs/design/; budżety wagi | 08-programista (build) | sonnet/medium | 5 h | Z-30 | zrobione | 2026-11-27 | strona/z31-wyglad @ e6bc66ad; tests.yml 46071430442 |
| Z-32 | Nazwa lokalna + angielska na każdej stronie | 08-programista (build) | sonnet/medium | 2 h | Z-31, Z-25 | zrobione | 2026-11-28 | strona/z32-z33 @ e15d336; tests.yml 46090643290 |
| Z-33 | Strony prawne + stopka + ramka + akapit (35 języków); appStoreId; strażnik zdań ramki | 08-programista (build) | sonnet/medium | 4 h | Z-31, Z-27 | w toku | 2026-11-28 | strony prawne, stopka, ramka pl/en: strona/z32-z33 @ e15d336, tests.yml 46090643290; brak zdań ramki w 33 językach (CZEKA Z-33 w tests/z33-prawne-ramka.test.mjs:64) |
| Z-34 | Zasięg wg Z-06 i Z-22: tytuły, opisy, dane strukturalne, robots.txt, pliki dla robotów AI | 08-programista (build) | sonnet/medium | 4 h | Z-32, Z-33 | w toku | 2026-11-28 | wdrożone: strona/z34-zasieg @ 7a227e3, tests.yml 46103668314; „zrobione” po Z-33 (kolumna Po) |
| Z-35 | Przegląd lokalizacji zbudowanych stron (pl, en + próbka 33) | 09-lokalizacja (audit) | opus/medium | 1,5 h | Z-34 | otwarte | — | — |
| Z-40 | Audyt zgodności wyglądu z projektem | 04-studio-projektowe (audit) | opus/high | 1,5 h | Z-35 | w toku | 2026-11-28 | audyt i poprawki zrobione: strona/z40-poprawki @ 7294775, tests.yml 46119581733; „zrobione” po Z-35 (kolumna Po) |
| Z-41 | Jeden audyt gotowości na jednym commicie (lista „przed pierwszym indeksowaniem”) | 07-jakosc (audit) | opus/high | 2,5 h | Z-40 | otwarte | — | — |
| Z-50 | WŁAŚCICIEL: zgoda na pierwszą publikację (z blokadą Google) | właściciel | — | 2 min | Z-41, Z-05 | otwarte | — | — |
| Z-51 | Ręczne pages.yml; przebieg dowodowy na żywej stronie | 10-wydanie (build) | sonnet/medium | 1 h + pages.yml | Z-50 | otwarte | — | — |
| Z-52 | Niezależne sprawdzenie żywej strony (20 stron × pl/en) | 07-jakosc (reaudit) | opus/high | 1 h | Z-51 | otwarte | — | — |
| Z-60 | Jeden PR: indeksowanie true, indeksowanieOd, push w pages.yml; test planu wymaga etapów 0–5 i Z-61; Z-60 i Z-61 odhaczane w commicie tego PR | 08-programista (build) | sonnet/medium | 0,5 h | Z-52 | otwarte | — | — |
| Z-61 | WŁAŚCICIEL: zgoda na włączenie Google | właściciel | — | 2 min | Z-60 | otwarte | — | — |
| Z-62 | Publikacja + sprawdzenie na żywo | 10-wydanie (build) | sonnet/medium | 1 h | Z-61 | otwarte | — | — |
| Z-63 | WŁAŚCICIEL: weryfikacja domeny i mapy w Google i drugiej wyszukiwarce | właściciel | — | 20 min | Z-62 | otwarte | — | — |
| Z-64 | Linki do strony: adres marketingowy w ASC i link na apps4brew.com (za zgodą) | 10-wydanie (build) | sonnet/medium | 1 h | Z-62 | otwarte | — | — |
| Z-65 | Zapis w repo trening: P-1…P-12 w docs/18, docs/49 §5, ZB-017, zobowiązania etapu 7 | M9-koordynator-sesji | opus/medium | 1 h | Z-62 | otwarte | — | — |
