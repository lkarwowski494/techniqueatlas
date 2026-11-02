# 54. Strona z biblioteką ćwiczeń (techniqueatlas.com) — specyfikacja

## Kontrakt zakresu strony (03-zakres E3, 02.11.2026)

Stan: E3 · Aktualizacja: 2026-11-02 · Wejście: raporty E0, E1, E2 roli 03-zakres (repo trening, `docs/przekazanie/notatki/linia-1-1/03-zakres-strona-E{0,1,2}-2026-11-02.md`), decyzje właściciela z 02.11.2026 (repo trening, `docs/18-przekazanie.md`, wpisy „strona techniqueatlas jako darmowe narzędzie”, „wyślij plan do aplikacji w 1.2”, „zakres narzędzi po sprawdzeniu popytu”, „startuje stopniowo od 1.1”, bramki E0, E1, E2) · Decyzje: D-001, D-002, D-003 · Zmiany: ZM-01…ZM-07.

**Mapowanie identyfikatorów.** Skrypt kontroli (`zakres.mjs`, moduł `ciecie` roli 03) wymaga ID w formacie `F-nn`, więc F-01…F-22 odpowiadają kandydatom F-S01…F-S22 z raportów E0–E2 (ten sam numer; kolumna „Funkcja” podaje `(F-Snn)`). Hipotezy: H-01 = ZAL-001 = ZAL-S1 „narzędzia strony mają popyt” (hipoteza; raport popytu P2 przepadł), H-02 = ZAL-002 = ZAL-S2 „narzędzia przyprowadzają użytkowników do aplikacji” (hipoteza; token kampanii per narzędzie). Pozostałe założenia z raportów: ZAL-S3 (plany tym samym `generate()`) — podważone w obecnym kodzie; ZAL-S4 (druk dla trenerów a granica aplikacji ZP-08) — potwierdzone warunkowo; ZAL-S5 (pobranie CSV i druk przy CSP strony) — potwierdzone w Chromium, WebKit i Firefox `[DO USTALENIA]`. Decyzje (numeracja lokalna tego kontraktu, nie rejestru aplikacji): **D-001** = docs/18 repo trening, 02.11.2026, bramka E0 pkt 3 — dowód wartości narzędzi: wyjątek właściciela (MVP z dowodem H) i punkt kontrolny 8 tygodni po wejściu każdej fali; **D-002** = ta sama bramka, pkt 2 — właściciel niczego nie przegląda, zastępują go kontrole agentów (recenzent ≠ autor, strażniki buildu, przebieg w przeglądarce bezgłowej ze zrzutami ocenianymi przez innego agenta); **D-003** = bramka E2 — start W0, sylwetka PÓŹNIEJ, słownik jako tor treści po fali 2, CSV wariant A, gotowy plan PÓŹNIEJ → 1.2. BR: narzędzia strony nie mają wymagań w BRD aplikacji (persony odwiedzającego i trenera nie istnieją — errata ER-13, rola 01); jedyne BR strony to BR-BIB-006 (eksport figur z recenzją, repo trening `docs/brd/wymagania.md:551`), przypisane do F-01. **Wyjątek nazwany:** kontrakt sprawdzany bez `--brd` do czasu ER-13 — BRD aplikacji ma BR spoza strony, a BR strony jeszcze nie ma.

### Główna praca i pętla
- Główna praca (robocza **J-W1** — BR czeka na ER-13 w BRD aplikacji): „Kiedy szukam w sieci, jak zrobić ćwiczenie albo czym je zastąpić sprzętem, który mam, chcę od razu dostać technikę i gotowy do użycia wynik (zamiennik, plan na kartce albo w linku), bez konta i bez instalowania czegokolwiek, żeby zrobić trening dziś.” Praca druga (robocza J-W2, trener): „Kiedy układam trening podopiecznemu, chcę wydrukować czytelny plan z techniką i adresem strony, żeby podopieczny ćwiczył sam.”
- Pętla główna: wyszukiwarka → strona ćwiczenia (F-01) → co zamiast / co zrobię z tym sprzętem (F-02, F-03) → dodaj do planu (F-04) → wynik: druk/PDF, CSV, link (F-17, F-04, F-05) → aplikacja jako jedna z opcji po wyniku (F-11). Funkcja MVP spoza tej linii ma podłogę albo decyzję D-nnn.
- Poza pętlą (osobne wejścia z wyszukiwarki): F-07, F-08, F-19 (fala 2, D-003); F-06, F-09, F-10 — PÓŹNIEJ.
- Apetyt: właściciel niczego nie przegląda (D-002) — koszt w godzinach właściciela ≈ 0 dla każdej funkcji; linię cięcia wyznaczają podłogi, warunki merytoryczne i ryzyko (raport E2 §2). Kolumna „Koszt [h]” niżej to czas kontroli zastępczych agentów [OCENA] — uproszczenie, nie godziny właściciela.
- Wzorzec najlepszych (odczyt 02.11.2026, raport E1 §4; cudze treści na Dysku): zamienniki z filtrem sprzętu na własnym adresie, talerze z kg/lb, 1RM, sylwetka → lista, wszystko bez konta — standard; druku, PDF i CSV planu nie ma żaden z trzech serwisów (wyróżnik bez dowodu popytu).
- Darmowe i płatne: cała strona i narzędzia bezpłatne (WTP-0, docs/18 02.11.2026); płatna jest tylko aplikacja (akapit o wsparciu, F-12).

### Zakres
| ID | Funkcja | Wymagania | Decyzja | Dowód wartości | WTP | Intuicyjność | Podłoga | Zależy od | Uzasadnienie |
|---|---|---|---|---|---|---|---|---|---|
| F-01 | Biblioteka: indeksowane ćwiczenia z pełną kartą i własnymi wskazówkami, reszta `noindex,follow` (F-S01) | BR-BIB-006 | MVP | decyzje właściciela 25.10 i 02.11.2026 (docs/18); R: strona ćwiczenia z techniką u 3/3 serwisów (E1 §4) | WTP-0 (R) | jedno zdanie: „jak zrobić ćwiczenie”; wynik: czeka na 04 | sklep: S4 (tylko dane wydanej wersji) | F-16 | start W0 (D-003); reguła indeksowania A z bramki E1 (ZM-06). **Stan 02.11.2026:** reguła i strażnik S6 w kodzie strony (gałąź `claude/s6-pelna`); czeka na pole `pelna` (F-20) i PIN |
| F-02 | Co zamiast: zamienniki z filtrem sprzętu (F-S02) | H-01 | MVP | H-01 + R: 3/3 serwisy (E1 §4) | WTP-0 (H) | jedno zdanie, przycisk na karcie ćwiczenia; wynik: czeka na 04 | — | F-01, F-14, F-20 | fala 1; wyjątek właściciela D-001, ZAL-001 (hipoteza), punkt kontrolny 8 tyg. |
| F-03 | Co zrobię z tym sprzętem (kilka sprzętów naraz, presety miejsc) (F-S03) | H-01 | MVP | H-01 + R (E1 §4) | WTP-0 (H) | jedno zdanie, bez nowych pojęć; wynik: czeka na 04 | — | F-01, F-14, F-20 | fala 1; D-001, ZAL-001 |
| F-04 | Układanie planu z katalogu + CSV wariant A (jeden format: arkusz i import 1.2) + zapowiedź „wkrótce” ze strażnikiem (F-S04) | H-01 | MVP | H-01, bez R (wyróżnik, E1 §4) | WTP-0 (H) | jedno zdanie „dodaj do planu”; wynik: czeka na 04 | bezpieczeństwo: CSV bez formuł arkusza (OWASP); dane: plan tylko w adresie, bez pola imienia | F-01, F-14, F-18 | fala 1; D-001, ZAL-001; CSV A z D-003 (ZM-05); „wkrótce” z ZM-04 |
| F-05 | Plan w linku: część po #, przechodzi przez zmianę języka (F-S05) | H-01 | MVP | H-01; stan w adresie to znany wzorzec (serwis C, E1 §4) | WTP-0 (H) | wymaga zdania „zapisz ten adres — plan jest w nim”; wynik: czeka na 04 | prywatność: D4/S9 bez zmian (bez localStorage) | F-04, F-18 | fala 1; D-001, ZAL-001; zachowanie # przy zmianie języka — bramka E1 pkt 2 A |
| F-17 | Druk/PDF planu: stopka z adresem strony, zdanie „nie porada medyczna” (F-S17) | H-01 | MVP | H-01 (persona trenera J-W2), bez R | WTP-0 (H) | jedno zdanie „drukuj”; wynik: czeka na 04 | — | F-04, F-13 | fala 1; D-001, ZAL-001; warunek ZAL-S4 (bez pola imienia); przebieg WebKit przed wydaniem |
| F-18 | Wersjonowany format planu w # z dekoderem i przekierowaniami slugów (F-S18) | H-01 | MVP | podłoga danych odwiedzającego (stary link po roku) | WTP-0 (H) | niewidoczne dla odwiedzającego | dane: stary link działa → F-05, F-04 | F-16 | fala 1, przed F-04 i F-05; D-001, ZAL-001 |
| F-14 | Eksport słownika i tłumaczeń aplikacji na stronę (35 języków) (F-S14) | H-01 | MVP | warunek narzędzi (ponowne użycie tekstów zamiast nowych) | WTP-0 (H) | niewidoczne | jakość tekstów w 35 językach → F-02, F-03, F-04 | — | fala 1, przed narzędziami; D-001, ZAL-001; zmiana w repo aplikacji (linia 1.2 albo zapas limitu) |
| F-07 | Szacowany maks na 1 powtórzenie i talerze na sztangę (F-S07) | H-01 | MVP | H-01 + R: 3/3 serwisy | WTP-0 (H) | nowe pojęcia: granica ok. 10 powtórzeń, gryf, zaciski; wynik: czeka na 04 | merytoryka: RD-01 z wektorami (e1RM), talerze — rachunek | F-14, F-22 | fala 2 (D-003); D-001, ZAL-001; bez opcji „talerze w aplikacji” (kalkulator talerzy w aplikacji wycięty, DEC-06) |
| F-19 | Wybór kg/lb w F-07 (F-S19) | H-01 | MVP | R: 3/3 serwisy (E1 §4) | WTP-0 (R) | jedno ustawienie przy kalkulatorze; wynik: czeka na 04 | — | F-07 | fala 2 z F-07; D-003; potwierdzone przez właściciela 02.11.2026 na bramce E3: „Wybór kg/lb zostaje” |
| F-08 | Bilans serii na partię — tylko ocena „za mało” (F-S08) | H-01 | MVP | H-01 + R | WTP-0 (H) | nowe pojęcie: serie na tydzień; wynik: czeka na 04 | merytoryka: T-034, T-055, T-005, T-006 | F-04, F-22 | fala 2 (D-003); D-001, ZAL-001; „za dużo” nie pokazujemy (brak reguły) |
| F-11 | Komponent „w aplikacji” + token kampanii per narzędzie (F-S11) | H-02 | MVP | decyzja właściciela 02.11.2026; H-02 | WTP-0 (H) | jedna opcja obok druku/CSV/linku, nie zamiast wyniku | sklep: pkt 9 (zdania tylko o funkcjach wydanej wersji) | F-01, F-20 | start W0; D-001, ZAL-002; słownik bez odnośnika do aplikacji |
| F-12 | Akapit o wsparciu (brzmienie z docs/18, 02.11.2026) (F-S12) | H-02 | MVP | decyzja właściciela 02.11.2026 | WTP-0 (H) | jeden akapit w stopce albo „O stronie”, bez okna | prawo: bez „darmowa” przy płatnej części (art. 7 pkt 20 ustawy o przeciwdziałaniu nieuczciwym praktykom rynkowym, wg docs/18) | F-20 | start W0; D-001, ZAL-002; liczba dni z `PAYWALL.FREE_TRAINING_DAYS_PER_MONTH` |
| F-13 | Polityka prywatności, licencja (druk dla trenerów, adres w stopce), regulamin, nowa stopka w 35 językach (F-S13, łączy F-S21) | H-01 | MVP | podłoga prawna | WTP-0 (H) | stopka na każdej stronie | prawo: licencja i teksty prawne → F-17 | — | start W0; D-001, ZAL-001; teksty przygotowuje agent z przeczytanych źródeł (wyjątek „bez prawnika”, docs/18 02.11.2026) |
| F-16 | Przepięcie `PIN.json` na commit z nazwami EN, zamrożenie slugów 709 (F-S16) | H-01 | MVP | warunek indeksowania (raport E0 §4 pkt 1) | WTP-0 (H) | niewidoczne | indeksowanie: slugi zamrożone → F-01, F-18 | — | start W0, przed pierwszym indeksowaniem; D-001, ZAL-001. **Stan 02.11.2026: podgląd zrobiony** — PIN na `integracja-1-1` @ f3f6e16 (zawiera ZB-025 b, a0e06d7; eksport przechodzi, 709 ćwiczeń × 35 języków), `slugs.lock.json` 709 wpisów (test `tests/zamrozenie-slugow.test.mjs`); na PIN z fba531d 208 z 709 adresów byłoby innych. Warunek otwarty: przepięcie na tag wydania 1.1 (dziś brak tagu, najnowszy v1.0.1-b1035), do tego czasu bez indeksowania (S4) |
| F-20 | Eksport rozszerzony z repo aplikacji: lista funkcji wydania, `FREE_TRAINING_DAYS_PER_MONTH`, pole „pełna”, presety miejsc (F-S20) | H-01 | MVP | warunek pkt 9 i narzędzi | WTP-0 (H) | niewidoczne | sklep: pkt 9 → F-11, F-12 | — | na starcie część „lista funkcji wydania”, reszta przed falą 1; D-001, ZAL-001. **Stan 02.11.2026:** część „pole pełna” przyspieszona dla S6 (wariant A właściciela: `pelna` z `elementyKarty`) — nie zrobiona w repo aplikacji (brak dostępu do zapisu w tej sesji; definicja pełnej karty zmieniona 02.11.2026 ok. 15:30, docs/18 aplikacji) |
| F-22 | Strażnik tekstu dziedzinowego w `src/ui` + S5/S8 dla narzędzi (F-S22) | H-01 | MVP | luka rejestru twierdzeń (repo trening `scripts/claims.mjs:22`) | WTP-0 (H) | niewidoczne | merytoryka: rejestr twierdzeń → F-07, F-08 | — | przed falą 2; D-001, ZAL-001 |
| F-06 | Wyszukiwanie od sylwetki (F-S06) | H-01 | PÓŹNIEJ | H-01 + R częściowo | WTP-0 (H) | klikany rysunek | — | F-01 | kombajn: dubluje filtr partii (D-003). Powrót: w punkcie kontrolnym 8 tyg. strony list partii mają wejścia z wyszukiwarki — wtedy drugi widok filtra partii, bez osobnego narzędzia |
| F-09 | Gotowy plan z kilku pytań (`generate()` aplikacji) (F-S09) | H-01 | PÓŹNIEJ | H-01 | WTP-0 (H) | presety miejsc | merytoryka: T-050 zamknięte przed publikacją | F-04, F-20 | ZAL-S3 podważone: `generate()` czyta stan aplikacji. Powrót: czysty `generate()` wydzielony w aplikacji (linia 1.2) i T-050 zamknięte (D-003) |
| F-10 | Słownik pojęć (treść) (F-S10) | H-01 | PÓŹNIEJ | H-01 | WTP-0 (H) | tor treści, nie krok pętli | merytoryka: każda definicja przez rejestr twierdzeń | F-22 | tor treści roli 06 po fali 2, hasło po haśle, bez odnośnika do aplikacji (D-003). Powrót: fala 2 wydana i F-22 zielony; hasło publikowane po rejestrze twierdzeń i recenzji |
| F-15 | Import planu do aplikacji (aplikacja 1.2, bez zmiany SCHEMA_VERSION) (F-S15) | H-01 | PÓŹNIEJ | decyzja właściciela 02.11.2026 | WTP-0 (H) | — | dane: import bez nadpisania szablonów | F-04 | odłożone → 1.2 (ZM-04); strażnik „wkrótce” idzie z F-04. Powrót: wydanie aplikacji 1.2 z importem pliku CSV formatu A |

### NIE robimy
| ID | Funkcja | Wymagania | Decyzja | Dowód wartości | WTP | Intuicyjność | Podłoga | Zależy od | Uzasadnienie |
|---|---|---|---|---|---|---|---|---|---|
| F-21 | Licencja strony i stopka w 35 językach (F-S21) | H-01 | NIE | — | — | — | — | — | połączona z F-13 (ta sama treść, raport E2 §2a); ID nie wraca. Powrót: —, połączona z F-13 |

Odrzucone przez właściciela 02.11.2026 (bez ID F, nie wracają bez nowego ZM): mini karty techniki do druku, kod QR na wydruku, wydruk w innym języku jako osobny przycisk (wraca tylko jako skutek uboczny F-05), kalendarz `.ics`, RSS, „zgłoś uwagę”, przelicznik kg↔lb, strona jako sam katalog z wezwaniem do App Store, analityka B i C. Pętla opinii: wycięta z zapisanym powodem — sygnałem są tokeny kampanii i narzędzia webmastera (analityka A).

### Ranking ([OCENA]: wszystkie funkcje WTP-0 albo z podłogą, więc stałe — R, I, C nie rozróżniają; koszt = czas kontroli zastępczych agentów, D-002)
| ID | R | I | C | Koszt [h] | Metoda |
|---|---|---|---|---|---|
| F-16 | — | — | — | 1 | stała (podłoga); przebieg `npm run slugi` + S7, przegląd diffu lock przez drugiego agenta |
| F-13 | — | — | — | 4 | stała (podłoga); recenzja tekstów prawnych przez drugiego agenta + recenzent lokalizacji × 35 języków |
| F-20 | — | — | — | 2 | stała (podłoga); test eksportu w repo aplikacji + strażnik S4 |
| F-01 | — | — | — | 3 | stała (WTP-0); S6/S7/S8 + zrzuty z przeglądarki bezgłowej oceniane przez drugiego agenta |
| F-11 | — | — | — | 2 | stała (podłoga); strażnik zdań z listy funkcji wydania + zrzuty |
| F-12 | — | — | — | 2 | stała (podłoga); recenzent lokalizacji × 35, strażnik słowa „darmowy” |
| F-14 | — | — | — | 3 | stała (podłoga); test eksportu + S10 (brak kluczy) |
| F-18 | — | — | — | 3 | stała (podłoga); testy dekodera na starych wersjach linku i przekierowaniach slugów |
| F-02 | — | — | — | 4 | stała (WTP-0); recenzja autor ≠ recenzent, zrzuty, axe-core |
| F-03 | — | — | — | 3 | stała (WTP-0); jak F-02 |
| F-04 | — | — | — | 6 | stała (WTP-0); test CSV (BOM, separator, formuły), plik próbny w arkuszu, przebieg WebKit w CI macOS, strażnik „wkrótce” |
| F-05 | — | — | — | 2 | stała (WTP-0); test # przy zmianie języka, S9 (bez localStorage) |
| F-17 | — | — | — | 3 | stała (WTP-0); zrzut wydruku (`page.pdf`) oceniany przez drugiego agenta, WebKit |
| F-22 | — | — | — | 3 | stała (podłoga); test celowo podstawionego tekstu dziedzinowego |
| F-07 | — | — | — | 6 | stała (WTP-0); wektory RD-01, recenzja twierdzeń przez badacza, recenzent lokalizacji |
| F-19 | — | — | — | 1 | stała (WTP-0); testy przeliczeń talerzy w lb |
| F-08 | — | — | — | 5 | stała (WTP-0); wektory T-034, T-055, T-005, T-006, recenzja twierdzeń |
| F-06 | — | — | — | 6 | stała (WTP-0); recenzja anatomii rysunku, axe-core dla klikanego SVG |
| F-09 | — | — | — | 8 | stała (WTP-0); testy zgodności z `generate()` aplikacji, T-050 |
| F-10 | — | — | — | 10 | stała (WTP-0); `[DO USTALENIA]` liczba haseł — 10 h dotyczy pierwszej partii haseł (badacz + rejestr twierdzeń + recenzja) |
| F-15 | — | — | — | 4 | stała (WTP-0); praca w repo aplikacji 1.2 (test importu bez nadpisania szablonów) |

Wynik `node zakres.mjs docs/54-strona-biblioteki.md` (bez `--brd`, wyjątek do czasu ER-13; przebieg 02.11.2026). „Kolejność budowy MVP” ze skryptu to tylko porządek zależności (alfabetycznie w obrębie poziomu) — kolejność wdrożenia wyznaczają fale niżej (D-003); ranking nie rozróżnia funkcji, bo wszystkie są stałe (WTP-0):

```
Ranking (R × I × C ÷ koszt [h]; stałe: podłoga albo WTP-0; „razem” liczy MVP i ten wiersz):
  1. F-01 stała · 3 h, razem 3 h · MVP
  2. F-02 stała · 4 h, razem 7 h · MVP
  3. F-03 stała · 3 h, razem 10 h · MVP
  4. F-04 stała · 6 h, razem 16 h · MVP
  5. F-05 stała · 2 h, razem 18 h · MVP
  6. F-06 stała · 6 h, razem 24 h · PÓŹNIEJ
  7. F-07 stała · 6 h, razem 24 h · MVP
  8. F-08 stała · 5 h, razem 29 h · MVP
  9. F-09 stała · 8 h, razem 37 h · PÓŹNIEJ
  10. F-10 stała · 10 h, razem 39 h · PÓŹNIEJ
  11. F-11 stała · 2 h, razem 31 h · MVP
  12. F-12 stała · 2 h, razem 33 h · MVP
  13. F-13 stała · 4 h, razem 37 h · MVP
  14. F-14 stała · 3 h, razem 40 h · MVP
  15. F-15 stała · 4 h, razem 44 h · PÓŹNIEJ
  16. F-16 stała · 1 h, razem 41 h · MVP
  17. F-17 stała · 3 h, razem 44 h · MVP
  18. F-18 stała · 3 h, razem 47 h · MVP
  19. F-19 stała · 1 h, razem 48 h · MVP
  20. F-20 stała · 2 h, razem 50 h · MVP
  21. F-22 stała · 3 h, razem 53 h · MVP
Kolejność budowy MVP: F-16 → F-01 → F-14 → F-20 → F-02 → F-03 → F-18 → F-04 → F-05 → F-22 → F-07 → F-08 → F-11 → F-12 → F-13 → F-17 → F-19
22 funkcji (MVP 17, PÓŹNIEJ 4, TEST 0, NIE 1), 1 BR · 0 błędów, 0 uwag
kod wyjścia: 0
```

### Kolejność i przekazanie
- **Start W0 (z wydaniem 1.1, D-003):** F-16 (przepięcie PIN na commit z nazwami EN, potem `npm run slugi`) → F-13 (polityka, licencja, regulamin, stopka) → F-20 (część: lista funkcji wydania, `FREE_TRAINING_DAYS_PER_MONTH`) → F-01 (biblioteka, reguła indeksowania A) → F-11, F-12. Warunek: lista kontrolna „przed pierwszym indeksowaniem” (sekcja „Zasada infrastruktury a indeksowanie”) i S4 na tagu 1.1.
- **Fala 1 (pętla, gdy jej podłogi i kontrole zastępcze są zielone; bez czekania na wydanie aplikacji):** F-14, F-20 (reszta: pole „pełna”, presety miejsc), F-18 → F-02, F-03 → F-04 (z CSV A i strażnikiem „wkrótce”) → F-05, F-17.
- **Fala 2:** F-22 → F-07 (z F-19) → F-08.
- **Po fali 2:** F-10 jako tor treści (rola 06), hasło po haśle. **PÓŹNIEJ:** F-06 (punkt kontrolny), F-09 i F-15 (aplikacja 1.2).
- **Punkt kontrolny 8 tygodni (D-001):** liczony od wejścia każdej fali; sygnał: tokeny kampanii App Store per narzędzie i narzędzia webmastera; progi `[DO USTALENIA]` przy punkcie odniesienia (docs/18, analityka A). Warunek pomiaru: każde narzędzie ma własny adres.
- **Krok przed pierwszym narzędziem z CSV albo drukiem (F-04, F-17):** przebieg Playwright WebKit na maszynie macOS w CI (pobranie CSV przez `blob:` i `data:`, `@media print`, `window.print`). ZAL-S5 potwierdzone 02.11.2026 tylko w Chromium (raport E2 §1, 0 naruszeń CSP); WebKit (w tym Safari na iOS) i Firefox `[DO USTALENIA]`. Bez zielonego przebiegu WebKit F-04 i F-17 nie wchodzą.
- **Warunek ZAL-S4 (granica ZP-08 aplikacji):** strona nie ma listy podopiecznych, przypisywania planów, wglądu w wyniki ani pola imienia — w linku planu (F-05) i w CSV (F-04) nie ma pola imienia ani żadnego pola z danymi osoby; licencja na druk to zgoda prawna, nie funkcja relacji trener–podopieczny.
- **Ochrona CSV przed formułami arkusza (F-04):** OWASP, „CSV Injection” (https://owasp.org/www-community/attacks/CSV_Injection, przekierowanie na community.owasp.org/attacks/CSV_Injection, odczyt 02.11.2026, surowy tekst przez curl): „To remediate it, ensure that no cells begin with any of the following characters:” — lista: `=`, `+`, `-`, `@`, tabulator, CR, LF i ich odpowiedniki pełnej szerokości. Ta sama strona: „Note: The above techniques are not reliable in Microsoft Excel after saving and re-opening the CSV file.” Skutek dla kontraktu: każde pole tekstowe zaczynające się od tych znaków dostaje prefiks `'` i cudzysłów, separator i cudzysłowy w polu są escapowane; test na wszystkie znaki z listy. Pola liczbowe planu (serie, powtórzenia, przerwa) nie są ujemne. Ryzyko resztkowe (Excel po zapisie i ponownym otwarciu) — nazwane; plan nie ma pól wpisywanych dowolnie przez odwiedzającego poza nazwami z katalogu `[DO USTALENIA]` przy projektowaniu F-04 (rola 04).
- **Strażnik „wkrótce” (zadanie dla programisty, z F-04):** build strony zatrzymuje się, gdy `wersjaWydania` ≥ 1.2, a zapowiedź importu nie zamieniła się w działający przycisk (docs/18, 02.11.2026, ZM-04).
- **Przekazanie:** rola 01 — ER-13 (persony odwiedzającego i trenera, J-W1, J-W2, BR dla F-02…F-08, F-17…F-19) i ER-14 (reguła indeksowania); po ER-13 kontrakt przechodzi `zakres.mjs --brd` z BR strony. Rola 04 — ścieżki pierwszego użycia z kolumny „Intuicyjność” (wynik wraca tutaj). Rola 05 — format # (F-18), CSV A, eksport rozszerzony (F-20, F-14). Rola 06 — F-10 i twierdzenia F-07, F-08. Rola 07 — strażniki z kolumny „Metoda” rankingu.

### Zmiany zakresu
| ID | Data | Prośba (kto, skąd) | Bramka: praca i dowód · intuicyjność · koszt · co wypada | Decyzja (ID, słowa właściciela) |
|---|---|---|---|---|
| ZM-01 | 2026-11-02 | cel strony: z „katalog prowadzący do App Store” na „darmowe narzędzie, aplikacja jako jedna z opcji” (właściciel, rozmowa po lekturze posta praktyka — szczebel 5) | J-W1 robocza, dowód H (ZAL-001) · narzędzia przy karcie ćwiczenia · kontrole agentów (D-002) · wypada „strona jako sam katalog z wezwaniem do App Store” | przyjęte — docs/18 02.11.2026 „strona techniqueatlas jako darmowe narzędzie, aplikacja jako opcja”; pkt 1 przepisany |
| ZM-02 | 2026-11-02 | start stopniowy od wydania 1.1 zamiast startu przy 709/709 (właściciel) | J-W1 · bez zmiany pętli · start zależy od F-16, F-13, F-20, tagu 1.1 · wypada warunek 709/709 (DW-1, część) | przyjęte, wariant A — docs/18 02.11.2026 „startuje stopniowo od wydania 1.1”; pkt 2 i S6 przepisane |
| ZM-03 | 2026-11-02 | zakres narzędzi po sprawdzeniu popytu (właściciel) | H-01 (P2 przepadł) · plan w adresie, komponent „w aplikacji”, licencja dla trenerów · ok. 60–120 kluczy × 35 [OCENA, E1] · odrzucone: mini karty, QR, wydruk w innym języku, `.ics`, RSS, „zgłoś uwagę”, przelicznik kg↔lb | przyjęte z wyjątkiem D-001 (dowód H, punkt kontrolny 8 tyg.) — docs/18 02.11.2026 „zakres narzędzi … po sprawdzeniu popytu”; pkt 8, 10, 11 przepisane |
| ZM-04 | 2026-11-02 | import planu do aplikacji w 1.2 i zapowiedź „wkrótce” na stronie (właściciel) | H-01 · jedno zdanie bez daty · strażnik w buildzie · wyjątek od pkt 9 | przyjęte: F-15 PÓŹNIEJ → 1.2, wariant „wyjątek + strażnik” — docs/18 02.11.2026 „wyślij plan do aplikacji w wersji 1.2”; pkt 9 przepisany |
| ZM-05 | 2026-11-02 | format CSV: sprzeczność „format importu aplikacji” (decyzja 26.10) vs „CSV do arkusza” (02.11) (raport E1 §6) | H-01 · jedna kolumna techniczna `id` w arkuszu · ochrona przed formułami (OWASP) · wypada Excel jako osobny format i „Otwórz w aplikacji” | wariant A (jeden format) — docs/18 02.11.2026, bramka E2 pkt 3 (D-003); decyzja 26.10 opatrzona odnośnikiem |
| ZM-06 | 2026-11-02 | reguła indeksowania: „pełna karta i własne wskazówki” (raport E1 §7 pkt 1) | J-W1 · bez zmiany UI · mniej stron w indeksie na starcie · wypada „sama pełna karta” | wariant A — docs/18 02.11.2026, bramka E1 pkt 1; S6 przepisany; kod strony zrobiony 02.11.2026 (`claude/s6-pelna`), pole w eksporcie otwarte (F-20) |
| ZM-07 | 2026-11-02 | start W0, fale; sylwetka PÓŹNIEJ, słownik jako tor treści, gotowy plan → 1.2 (raport E2 §3, §5) | J-W1 · fale z własnymi bramkami · W0 najmniejsze ryzyko · wypadają W1, W2, sylwetka w fali 2, słownik tylko przy narzędziach | W0 i (a)/(a) — docs/18 02.11.2026, bramka E2 pkt 1–2 (D-003) |

Otwarte (`[DO USTALENIA]`): WebKit i Firefox dla CSV i druku; budżet JS narzędzi (pkt 10); progi punktu kontrolnego; format i limit długości tokenu kampanii per narzędzie (pkt 9); separator CSV w Excelu i Numbers według języka (plik próbny); liczba haseł F-10.


Stan: specyfikacja analityka z 26.10.2026 po decyzjach właściciela (sekcja niżej); implementacja szkieletu w tym repo. Decyzje właściciela: docs/18 (25.10 — strona, domena, anonimowość; 26.10 — osobne repo, start z 1.1). Liczby poniżej pochodzą z danych aplikacji na `main` (docs/50, docs/51). W stronie każda liczba ma być wyliczana z danych, nie wpisywana ręcznie.


## Decyzje właściciela 26.10.2026

Rozstrzygnięcia pytań z sekcji 16 (wszystkie zgodnie z rekomendacją analityka: D1 B, D2 A, D3 B, D4 A, D5 A, D6 A, D7 A, D8 A, D9 A, D10 B, D11 A, D12 A):

| Nr | Decyzja | Skutek w kodzie i testach |
|---|---|---|
| D1 | Indeksowane są tylko strony z własną treścią. Pozostałe istnieją i są linkowane, ale mają `noindex,follow`; reguła sama zdejmuje `noindex`, gdy ćwiczenie dostanie własną treść. | `src/pages.mjs` `robotsFor`: własna treść = wskazówki własne (`cues.scope = own`) kompletne w języku; testy w `tests/build.test.mjs` (D1, zdejmowanie noindex). |
| D2 | Nazwy ćwiczeń jak w aplikacji: angielskie w 34 językach poza PL (A). Segmenty adresów angielskie (D2b). | Nazwy z eksportu (`exName`), `lang="en"` na nazwach poza pl. |
| D3 | Publikujemy 35 języków; do indeksu idą PL, EN i języki po przeglądzie (konfiguracja per język). | `config.json` → `jezyki` (budowane) i `indeksujJezyki` (indeksowane). Dziś budowane 35, indeksowane pl i en; kolejny język w indeksie wymaga `src/ui/<język>.json` i przeglądu. |
| D4 | Bez analityki (A). | Strażnik `tests/straznik-analityka.test.mjs`; CSP `default-src 'self'`. |
| D5 | **A**: workflow strony pobiera publiczne repo aplikacji na przypiętym tagu lub commicie, uruchamia eksport i publikuje tylko HTML/SVG. Dane NIE są commitowane do repo strony. | `PIN.json` (repo, ref, commit), `src/sync-dane.mjs` (`npm run dane`), dane i silnik w `.cache/` (gitignore); strażnik `tests/straznik-dane.test.mjs`; lista wzorców źródeł pobierana razem z danymi. |
| D6 | A: filtr rodzin ruchu v2 (43 rodziny). | Strony `/{język}/movements/{rodzina}/`; etykiety: pl z aplikacji, en w `src/ui/en.json`; język bez etykiet rodzin nie pokazuje tego filtra (`.cache/raport-brakow.json`). |
| D7 | A: strona główna języka — wyszukiwarka i filtry na górze, „Podstawowe” poniżej. | `homePage`. |
| D8 | A: Smart App Banner bez `app-argument`. | `config.json` → `appStoreId` (puste = brak banera i linku); test. |
| D9 | A: `/` to wybór języka bez przekierowania. | `chooserPage`; test (brak refresh i skryptów). |
| D10 | B: bez znaczników pochodzenia w HTML. | Test: brak atrybutów `data-origin`/`data-key`/`data-id`/`data-source`. |
| D11 | A: lokalna wyszukiwarka nazw (indeks per język ≤ 25 KB gz). | `assets/szukaj.js`, `assets/idx/<język>.js`; test budżetu. |
| D12 | A: link do polityki prywatności `apps4brew.com/trening/privacy.html` w stopce. | `config.json` → `polityka`. |

Dodatkowo (koordynator, 26.10.2026): `indeksowanie = false` w `config.json` do startu z wersją 1.1 (noindex,nofollow na wszystkich stronach, `robots.txt` Disallow, brak map witryny); workflow Pages tylko ręcznie do tego czasu.

## Stan wdrożenia szkieletu (26.10.2026, po drugiej turze)

Zrobione w pierwszej turze: eksport z aplikacji (repo aplikacji, `scripts/strona/`), silnik figur v2 w przeglądarce, strona wyboru języka, strona główna języka, lista A–Z z filtrami, strony filtrów, strona ćwiczenia, 404, hreflang, canonical, mapy witryny per język, noindex (D1, D3, globalny), JSON-LD, CSP, wyszukiwarka, strażnicy anonimowości, sekretów i analityki.

Zrobione w drugiej turze:
- **Sylwetka mięśni przód/tył** (pkt 3.5.5): eksport aplikacji dostarcza `sylwetka.json` (arkusz SVG z `lib/musclemap.ts` + stopnie 0–4 dwunastu partii per ćwiczenie, ten sam wzór co mapa w aplikacji). Strona zapisuje `assets/sylwetka.svg` i wstawia `<use>`; stopnie to klasy CSS (CSP bez inline style), kolory w `assets/site.css` (jasny i ciemny). Sylwetka jest dekoracyjna (`aria-hidden`), informację niosą listy mięśni. Szablon pokazuje zdania o roli mięśnia (`ex.roles`: `{id regionu, text}`), gdy eksport je zawiera (gałąź `role-miesni` aplikacji — dane jeszcze nie scalone); bez nich sekcja ma tylko listy.
- **Pozycje statyczne przy „Ogranicz ruch” i bez JS**: dwie pozycje głównego widoku z podpisami „Pozycja wyjściowa” i „Pozycja końcowa” (teksty z aplikacji), figura statyczna — jedna pozycja bez podpisu (jak `staticPositions` aplikacji). Geometria leży w `assets/poz/<slug>.svg` (jeden plik na ćwiczenie, wspólny dla języków, `<use>` dziedziczy zmienne `--f-*`), więc HTML strony ćwiczenia ma ok. 6 KB (budżet ≤ 20 KB spełniony z zapasem, a opublikowana strona nie powiela geometrii w 35 językach). Animowane widoki (wszystkie widoki rodziny) odsłania dopiero skrypt, gdy ruch jest dozwolony, albo „Wznów animację” / wybór błędu przy ograniczeniu ruchu. Zmiana względem pierwszej tury: w HTML nie ma już obrazu skrajnego w animowanym widoku.
- **S3 znaki towarowe** (`trademark-check.json`), **S4 wersja** (`config.json` → `wersjaWydania` równe `manifest.app.version`, a `PIN.json` → `ref` to tag `v<wersja>…`; bez zapytań sieciowych — porównanie z App Store po ID zostaje krokiem wydania), **S6 warunek indeksowania** (zmienione 02.11.2026, ZM-06: strona ćwiczenia indeksowana — flaga albo meta robots bez `noindex` — wymaga `pelna === true` z eksportu i własnych wskazówek kompletnych w języku; eksport bez pola `pelna` = warunek startu niespełniony; `start-wyjatki.json` usunięty z warunkiem 709/709): przy `indeksowanie=true` przerywają build, przy `false` dają ostrzeżenia w logu (`src/straznicy.mjs`, `tests/straznicy-startu.test.mjs`).
- **S8 dostępność**: axe-core w przeglądarce bezgłowej (`tests/dostepnosc.test.mjs`): 35 języków × (strona główna, lista, filtr, 5 ćwiczeń) × motyw × „Ogranicz ruch”; pełna macierz 2×2 dla pl i en, dla reszty dwie przekątne; chooser i 404 osobno. Zależności tylko deweloperskie, zob. README.
- **Slugi**: `slugs.lock.json` (zamrożenie przy pierwszej publikacji: `npm run slugi`) i `slug-overrides.json` (nadpisania: zachowanie starego adresu; przekierowania: stary adres → nowy lub lista). Zmiana adresu bez wpisu przerywa build; przy `indeksowanie=true` pusty lub niepełny lock też. Przekierowanie to strona z meta refresh 0 s i canonical na nowy adres w każdym budowanym języku (`tests/slugi.test.mjs`).
- **hreflang `es-419` i `sr`** (pkt 5): decyzja programisty, do potwierdzenia przez badacza. `es-419` Google nie obsługuje, więc ta sama strona jest zgłaszana pod kodami es-XX dla 21 regionów (lista `ES_419_REGIONS` aplikacji bez „419”, BR i JP: tam nie ma społeczności hiszpańskojęzycznej, a pt-BR ma własną wersję; Hiszpania i reszta świata zostają przy `es`); test pilnuje zgodności z listą aplikacji. `sr` → `sr-Cyrl` (aplikacja pisze cyrylicą), także w `lang`. Otwarte: czy Google dopasuje `sr-Cyrl` do użytkowników z `sr`/`sr-RS`; tani wariant zapasowy to dopisanie drugiego kodu `sr` na ten sam adres.

Odstępstwa i otwarte:
- **Technika animacji:** silnik w przeglądarce zamiast prerenderu klatek (pomiary/wyniki.md).
- **Języki:** wszystkie 35 mają stałe teksty (`src/ui/`, pisane przez agenta, do przeglądu tłumacza i recenzenta); do indeksu idą języki z `indeksujJezyki` (dziś pl, en).
- **Podgląd w 35 językach (01.11.2026, plan linii 1.1, S3):** `config.json` → `jezyki` ma wszystkie 35 języków z eksportu, `indeksowanie` zostaje `false` (noindex,nofollow, robots.txt bez Disallow i Sitemap, brak map — badanie indeksowania, pkt 5). Żeby późniejsze przełączenie nie zepsuło indeksowania: znaczniki hreflang w HTML wymieniają tylko języki z `indeksujJezyki` (jak mapy witryny — jeden zestaw, bez rozjazdu HTML/mapy, badanie pkt 4), a wiersz przełącznika języków w stopce pokazuje wszystkie budowane. Test `tests/jezyki-podglad.test.mjs`; axe-core na 35 językach: `tests/dostepnosc.test.mjs`. Pomiar: ok. 25 tys. stron, 338 MB, ok. 10 s (limit Pages 1 GB).
- **Przypięcie danych (02.11.2026, F-16; poprzednio 01.11.2026, S2: `fba531d` sprzed nazw EN):** `PIN.json` → `integracja-1-1` @ `f3f6e16` (tylko podgląd, bez indeksowania, do tagu wydania 1.1); adresy zamrożone w `slugs.lock.json` (709); ponowne przypięcie: `npm run przypnij -- <pełny skrót>` (test `tests/przypnij.test.mjs`). Na `fba531d` eksport aplikacji miał 0 figur (rodziny czekają na recenzję) — testy figury w przeglądarce są pomijane z powodem, a ścieżka „bez figury” sprawdzana; wracają same po przypięciu do commitu z figurami. Zmiany kontraktu eksportu: `roles` to `[{id, text}]` (było `region`), zakres wskazówek `general` nie występuje.

- **Warunek indeksowania S6 (02.11.2026):** PIN f3f6e16 nie ma pola `pelna` w eksporcie — S6 ostrzega, żadne ćwiczenie nie byłoby indeksowane (fail-closed). Figury: 98 z 709 (informacyjnie, `.cache/raport-brakow.json`; poprzednio 87).
- **Drugi widok na pozycjach statycznych:** pokazany tylko główny widok (aplikacja pokazuje wszystkie widoki).
- **Przekierowania (zamknięte 01.11.2026):** meta refresh 0 s traktowany jest jak przekierowanie stałe — dokumentacja Google: „Google Search interprets instant meta refresh redirects as permanent redirects.” (https://developers.google.com/search/docs/crawling-indexing/301-redirects; adres i cytat: docs/badanie-indeksowania-2026-11-01.md, pkt 1). Serwerowe 301 jest zalecane, ale GitHub Pages go nie daje; canonical na cel wzmacnia sygnał. Adres w `url=` jest pełny, z domeną (dokumentacja nie rozstrzyga adresu względnego).
- **S1 w 33 językach, S10 w pełnym zakresie:** bez zmian, otwarte.

## 1. Cel
Publiczna biblioteka ćwiczeń aplikacji Trening w 35 językach i darmowe narzędzia przy niej (co zamiast, co zrobię z tym sprzętem, plan z drukiem/CSV/linkiem, potem kalkulatory i bilans) — dla odwiedzającego bez konta i bez aplikacji; aplikacja jest jedną z opcji po wyniku, nie warunkiem wyniku (zmienione 02.11.2026, ZM-01; zakres i kolejność: „Kontrakt zakresu strony” na początku dokumentu). Każda strona ma realną wartość: animacja ruchu, wskazówki, mięśnie, zamienniki, częsty błąd. Nie robimy masowych stron pod wyszukiwarkę.

Poprzednio (26.10.2026, zastąpione 02.11.2026, ZM-01): „Prowadzi ruch z wyszukiwarki do App Store.”

## 2. Założenia i warunek startu
- Start stopniowy od wydanej wersji 1.1 aplikacji: na starcie biblioteka, indeksowane tylko ćwiczenia z pełną kartą i własnymi wskazówkami (reguła A z bramki E1), pozostałe `noindex,follow` albo niepublikowane; narzędzia dochodzą falami (zmienione 02.11.2026, ZM-02, ZM-06, ZM-07). Warunek przed pierwszym indeksowaniem: lista kontrolna w sekcji „Zasada infrastruktury a indeksowanie” (w tym F-16: przepięcie PIN na commit z nazwami EN i zamrożenie slugów 709).
  Poprzednio (zastąpione 02.11.2026, ZM-02): „Start razem z wydaną wersją 1.1 aplikacji. Warunek: 709/709 ćwiczeń ma gotową rodzinę figur v2. Dziś gotowe są 3 z 43 rodzin, czyli 87 ćwiczeń (docs/51).”
- Hosting: osobne publiczne repo `techniqueatlas`, GitHub Pages publikowane przez workflow GitHub Actions, 0 zł poza domeną.
- Strona opisuje wyłącznie funkcje wydanej wersji. Dane są z tagu tej wersji.
- Publicznie zero wzmianek o źródłach, także ogólnych („sprawdzone”, „oparte na badaniach”, „według ekspertów”). Nie ma też poziomów pewności odwołujących się do badań.
- Licencja strony (F-13) pozwala drukować i rozdawać plany i treść strony podopiecznym, także w płatnej pracy trenera, bez sprzedaży samych wydruków i bez kopiowania grafik; wydruk ma w stopce adres strony (zmienione 02.11.2026, ZM-03; poprzednio: „Wszelkie prawa zastrzeżone”).
- Nie ma pliku z danymi katalogu do pobrania (zrzutu ćwiczeń, figur, tłumaczeń) ani API. Odwiedzający może pobrać tylko **własny plan** jako CSV (format A, F-04) i wydruk/PDF (F-17), wygenerowane w przeglądarce z planu w adresie — to nie jest plik danych strony (zmienione 02.11.2026, ZM-03, ZM-05).

**Ograniczenia hostingu** (przeczytane, docs.github.com „GitHub Pages limits”):
- opublikowana strona najwyżej 1 GB;
- miękki limit 100 GB transferu na miesiąc;
- wdrożenie przerywane po 10 min;
- limit 10 buildów na godzinę nie dotyczy publikacji własnym workflowem;
- Pages nie służy do prowadzenia „online business” ani SaaS — patrz ryzyko R7.

Strona nie wyśle własnych nagłówków HTTP. Dlatego hreflang trafia do HTML i sitemap, CSP do `<meta>`, a przekierowań serwerowych nie ma.

## 3. Struktura stron

Przy 709 ćwiczeniach i 35 językach jest 24 815 stron ćwiczeń, a do tego strony list.

**3.1 `/` — wybór języka (x-default)**
- Lista 35 języków, każdy we własnym zapisie (np. „Deutsch”, „日本語”).
- Logo i jedno zdanie po angielsku.
- Bez automatycznego przekierowania (decyzja D9).

**3.2 `/{lang}/` — strona główna języka**
- Kolejność: nagłówek z nazwą biblioteki → krótki akapit (co tu jest; wersja aplikacji z danych) → wyszukiwarka nazw (D11) → wejścia w filtry: partia, sprzęt, rodzina ruchu → „Podstawowe ćwiczenia” (flaga z aplikacji, ćwiczenia nie-niszowe; bez rankingu popularności, bo nie mamy danych) → przycisk App Store → stopka.
- Liczby (np. „709 ćwiczeń”) wyliczane z eksportu.

**3.3 `/{lang}/exercises/` — pełna lista A–Z**
- Sortowanie collatorem języka, tak jak w aplikacji.
- Każdy wiersz: nazwa, partia, główny sprzęt.
- Bez JS: pełna lista. Z JS: filtry łączone (partia × sprzęt × rodzina) bez zmiany adresu indeksowanego.

**3.4 Strony jednego filtra**
- Adresy: `/{lang}/muscles/{id}/`, `/{lang}/equipment/{id}/`, `/{lang}/movements/{id}/`.
- Tylko jeden wymiar naraz. Nie robimy stron kombinacji (ryzyko „doorway”).
- Partia: pole `group` ćwiczenia, etykiety jak w aplikacji (`t(group)`).
- Sprzęt: [DO WYJAŚNIENIA] które pole. Kandydaci: `loadSource` (12 wartości) albo grupy sprzętu `EQUIP_GROUPS` (8). Trzeba też sprawdzić, czy etykiety `loadSource` są przetłumaczone w aplikacji.
- Rodzina ruchu: decyzja D6.

**3.5 `/{lang}/exercises/{slug}/` — strona ćwiczenia (elementy w tej kolejności)**
1. Okruszki: Biblioteka › Partia › Ćwiczenie.
2. H1: nazwa wyświetlana tak jak w aplikacji w tym języku (`exName`). W 34 językach poza PL nazwa jest angielska, w znaczniku `lang="en"`.
3. Animacja figury v2:
   - przyciski „Zatrzymaj/Odtwórz”;
   - przełącznik widoku (bok/przód/góra), gdy rodzina ma więcej widoków;
   - „Pokaż częsty błąd”, gdy wariant ma błąd w `errors.ts` (7 błędów).
   - Bez liczb na rysunku. Napis „Kąt na rysunku” tylko jeśli jest w wydanej wersji — [DO WYJAŚNIENIA].
4. Opis tekstowy ruchu: sekcje „Ustawienie” i „Ruch” z wskazówek. Jest też tekstową alternatywą animacji.
5. Mięśnie:
   - sylwetka przód/tył (`lib/musclemap.ts` ma już `svgMarkup`) oraz lista „główne” (`muscleLoad` 1) i „pomocnicze” (0,5);
   - dopisek „Dobór mięśni: przybliżony” przy 105 ćwiczeniach, tak jak w aplikacji.
6. Wskazówki (sekcja „tips”). Przy wskazówkach wzorca ruchu dopisek „Ogólne wskazówki dla tego ruchu”, jak w aplikacji (CUE_POLICY A).
7. Częsty błąd: sekcja `mistakes` i skrót do animacji błędu.
8. Potrzebny sprzęt (`requires`, etykiety `capLabel`).
9. Zamienniki: 3 propozycje (`SWAP_TOP`) liczone tą samą funkcją rankingu co w aplikacji. Profil: nowy użytkownik, bez miejsca i historii, collator danego języka. Każda jest linkiem do strony zamiennika.
10. Wezwanie do App Store: jedno zdanie o tym, co aplikacja robi z tym ćwiczeniem (tylko funkcje z listy wydanej wersji, pkt 9) i oficjalna plakietka App Store.
11. Jedno zdanie: „W razie bólu lub urazu skonsultuj się ze specjalistą”.
12. Stopka: przełącznik języka (te same ćwiczenia w innych językach; plan w części po # przechodzi przez zmianę języka — bramka E1 pkt 2 A), © Apps4Brew, licencja strony (F-13; zamiast „Wszelkie prawa zastrzeżone” — zmienione 02.11.2026, ZM-03), prywatność (D12), akapit o wsparciu (F-12).

**3.6 `404.html`** — jedna w katalogu głównym, bo tak działa Pages. Krótki tekst w EN i lista linków do 35 stron głównych języków.

## 4. Adresy i slugi
- **Języki:** kody aplikacji (`LANGS`) małymi literami: `/pl/`, `/en/`, …, `/es-419/`, `/pt-br/`, `/zh-hant/`.
- **Segmenty:** stałe, angielskie, ASCII: `exercises`, `muscles`, `equipment`, `movements` (D2b).
- **Slug ćwiczenia:**
  - Jeden dla wszystkich języków, z angielskiej nazwy wyświetlanej (`exName` w `en`). Nazwy i tak są angielskie w 34 językach, a wspólny slug upraszcza hreflang.
  - Reguła: NFKD → bez znaków diakrytycznych → małe litery → „&” na „and” → apostrofy usunięte → każdy znak spoza `[a-z0-9]` na „-” → bez powtórzonych i skrajnych „-” → najwyżej 80 znaków.
  - Przykład: „Farmer's Walk (Farmers Handles)” → `farmers-walk-farmers-handles`.
- **Kolizje:** dwa ćwiczenia z tym samym slugiem przerywają build. Rozstrzyga ręczna tabela `slug-overrides.json`.
- **Stałość:**
  - Po publikacji slug jest zamrożony w `slugs.lock.json` (klucz: klucz katalogu → slug).
  - Zmiana nazwy w aplikacji nie zmienia sluga.
  - Usunięcie lub zmiana sluga: stara strona zostaje jako przekierowanie (meta refresh 0 s plus canonical na nowy adres) — [DO WYJAŚNIENIA, badacz: czy wyszukiwarka traktuje to jak przekierowanie].
- Id partii, sprzętu i rodziny to identyfikatory z kodu (`chest`, `barbell`, `squat`).

## 5. SEO
Źródła przeczytane:
- developers.google.com/search/docs/specialty/international/localized-versions
- …/essentials/spam-policies
- …/crawling-indexing/sitemaps/build-sitemap

**hreflang**
- Każda strona wymienia siebie i wszystkie wersje językowe. Google: „Each language version must list itself as well as all other language versions”.
- Wersje muszą linkować się wzajemnie. Do tego `x-default` → `/`.
- Kody: ISO 639-1, opcjonalnie region ISO 3166-1 alpha-2 lub pismo ISO 15924. `zh-Hant` jest poprawne.
- Google wprost nie obsługuje `es-419`: „such as es-419, aren't supported”. [DO WYJAŚNIENIA, badacz/programista] Proponuję dla strony `/es-419/` kilka wartości (`es-MX`, `es-AR`, `es-CO`, … `es-US`) na ten sam adres. Lista `ES_419_REGIONS` w aplikacji zawiera też BR i JP — nie przenosić jej bez sprawdzenia.
- `sr`: aplikacja pisze cyrylicą (`sr-Cyrl-RS`) → `sr-Cyrl` [do potwierdzenia].
- Google nie rozpoznaje języka po hreflang ani po `lang`, tylko po treści. Każda strona musi być naprawdę w swoim języku (pkt 7, „inny język”).

**Duplikaty**
- Google: „Localized versions of a page are only considered duplicates if the main content of the page remains untranslated”.
- Z tego wynika zasada: na stronie języka nie ma treści głównej w innym języku. Zastępczy tekst z en/pl jest zakazany (aplikacja ma taki fallback, strona nie).

**canonical** — na każdej stronie wskazuje ją samą (ten sam język). Nigdy nie wskazuje innego języka. Filtry JS nie tworzą adresów kanonicznych.

**Sitemap**
- Limit: „50MB (uncompressed) or 50,000 URLs” na plik.
- Przy 35 alternatywach `xhtml:link` na adres jeden plik przekroczy 50 MB. Dlatego indeks sitemap plus osobny plik na język.
- Do sitemap trafiają tylko strony indeksowane (D1, D3).
- `lastmod` = data wydania, z którego pochodzą dane, tylko gdy treść strony się zmieniła. Google używa `lastmod` tylko, gdy jest dokładne. `priority` i `changefreq` pomijamy, bo Google je ignoruje.

**Dane strukturalne (tylko uczciwe typy)**
- `BreadcrumbList` na stronach ćwiczeń i filtrów.
- `WebSite` (nazwa strony) na `/{lang}/`.
- Bez `HowTo`: według bloga Google z 08.2023 przestano pokazywać takie wyniki rozszerzone — przeczytałem tylko streszczenie wyszukiwarki, do potwierdzenia przez badacza.
- Bez `VideoObject`, bo to nie wideo.
- Bez `SoftwareApplication` z ocenami lub cenami, bo nie mamy takich danych na stronie.
- Bez `FAQPage`.

**`robots.txt`** — wszystko dozwolone plus adres indeksu sitemap. `noindex,follow` w `<meta>` dla stron wyłączonych z indeksu (D1, D3).

**Treści masowe** — Google definiuje nadużycie jako „many pages are generated for the primary purpose of manipulating search rankings and not helping users”. Wśród przykładów jest tłumaczenie automatyczne „where little value is provided”. Środki zaradcze:
- tylko własna treść z aplikacji;
- `noindex` dla stron bez własnej treści głównej (D1);
- bez stron kombinacji filtrów;
- bez tekstów generowanych pod frazy.

## 6. Dostępność (WCAG 2.2 AA)
- **Animacja:** przycisk pauzy widoczny od razu (2.2.2).
  - Przy `prefers-reduced-motion: reduce` animacja nie startuje sama. Pokazujemy pozycje kluczowe (wyjściową i skrajną) z podpisami, jak „Ogranicz ruch” w aplikacji.
  - Bez JS też widać pozycje statyczne.
- **Tekstowa alternatywa:** obraz z etykietą „Rysunek ruchu: {nazwa}” i odwołaniem do sekcji „Ustawienie” i „Ruch”.
  - [DO WYJAŚNIENIA] co z 69 ćwiczeniami bez tekstu wskazówek: tylko etykieta plus mięśnie i sprzęt? Patrz D1.
- **Kontrast:** tekst ≥ 4,5:1, elementy grafiki ≥ 3:1 (1.4.11). Kolory z tokenów aplikacji (`lib/theme`, `figurePalette`) w jasnej i ciemnej palecie. Do tego `forced-colors`.
- **Ciemny wygląd:** `prefers-color-scheme`, jak dziś w `site/index.html`.
- **Klawiatura:** cała strona obsługiwana z klawiatury, widoczny fokus. Przełączniki mają `aria-pressed`.
- **Języki i nagłówki:** `lang` na `<html>` i `lang="en"` na nazwach angielskich w innych językach, żeby VoiceOver przeczytał je poprawnie (jak DEC-13 w aplikacji). Hierarchia nagłówków h1 → h2 po sekcjach.
- **Układ:** przepływ przy 320 px CSS i powiększeniu 200% bez przewijania w poziomie (1.4.10). Długie słowa zawijane (`hyphens: auto` z `lang`).

## 7. Stany

| Stan | Zachowanie |
|---|---|
| Pusty | Strony statyczne nie bywają puste. Kombinacja filtrów JS z wynikiem 0 → „Brak ćwiczeń dla tych filtrów” i przycisk „Wyczyść filtry”. Wyszukiwanie bez wyniku → ten sam wzór. |
| Pierwszy raz | Każda wizyta jest „pierwsza” (bez ciasteczek i bez localStorage). Brak banera zgody, bo nie ma czego zgadzać. |
| Błąd | Zły adres → `404.html` (pkt 3.6). Animacja się nie wczyta → pozycje statyczne plus tekst; strona dalej użyteczna. |
| Offline | Strona statyczna, bez service workera (poza zakresem). Strona już otwarta działa dalej, łącznie z animacją (bez zapytań w tle). |
| Długi tekst | Najdłuższe nazwy (np. „Decline Close-Grip Bench To Skull Crusher”) i długie etykiety (de, fi, hu) zawijają się bez obcinania. W tytule i opisie meta obcina wyszukiwarka, nie my. |
| Inny język | 35 języków. Brak tekstu w danym języku → sekcja nie jest pokazywana, a strona dostaje `noindex`. Nigdy fallback na en/pl. Na `main` 52 id nie ma nawet tekstu PL (docs/50). Raport braków per język w buildzie. |
| Ciemny wygląd | Paleta ciemna z tokenów aplikacji, w tym figura. Kontrast sprawdzany w obu motywach i w `forced-colors`. |
| VoiceOver | Kolejność czytania = kolejność z pkt 3.5. Animacja to jeden obraz z etykietą; przyciski z nazwą i stanem. Plakietka App Store z etykietą tekstową. |

## 8. Prywatność
- **Stan wyjściowy:** bez ciasteczek, bez localStorage, bez skryptów i zasobów zewnętrznych (fonty systemowe, wszystko z tej samej domeny). CSP w `<meta>`: `default-src 'self'`.
- **Stan planu (F-04, F-05):** plan żyje wyłącznie w adresie, w części po # (nie trafia na serwer ani do logów hostingu), bez localStorage i bez ciasteczek — D4 i S9 bez zmian, strażnik `tests/straznik-analityka.test.mjs` bez zmian. Plan nie ma pola imienia ani innych danych osoby (warunek ZAL-S4). Kod narzędzi tylko w plikach `.js` z własnego źródła (CSP `default-src 'self'`). (zmienione 02.11.2026, ZM-03)
- **Pomiar** — decyzja D4.
- [DO WYJAŚNIENIA, badacz/prawnik] Hosting zapisuje adres IP w logach serwera. Czy potrzebna jest osobna informacja o prywatności strony i jak ją sformułować (D12).

## 9. Zgodność z wydaną wersją i powiązanie z App Store
- **Eksport z tagu wydania:**
  - `manifest`: wersja, build, `CATALOG_REV`, SHA tagu, lista języków, liczby.
  - Lista funkcji wydanej wersji: identyfikatory funkcji plus zatwierdzone zdania, w 35 językach przez `t()`.
  - Wezwanie do App Store bierze zdania tylko z tej listy. Ten sam komponent „w aplikacji” (F-11) stoi przy każdym narzędziu jako jedna z opcji obok druku/CSV/linku; słownik pojęć bez odnośnika do aplikacji (zmienione 02.11.2026, ZM-03).
  - **Wyjątek „wkrótce” (zmienione 02.11.2026, ZM-04):** przed wydaniem importu planu w aplikacji 1.2 (F-15) przy CSV wolno pokazać jedno zdanie zapowiedzi „wkrótce” bez daty. Kontrola: strażnik w buildzie strony zatrzymuje build, gdy `wersjaWydania` ≥ 1.2, a zapowiedź nie zamieniła się w działający przycisk (zadanie dla programisty, razem z F-04). Poza tym wyjątkiem strona nadal mówi tylko o funkcjach wydanej wersji.
  - Token kampanii: per narzędzie (decyzja 02.11.2026, analityka A; dziś per język — `src/pages.mjs:29`); format i limit długości `[DO USTALENIA]`.
- **Link:** `https://apps.apple.com/app/id{APPLE_ID}` plus token kampanii App Store Connect (`ct=techniqueatlas-{lang}`), żeby w ASC było widać ruch ze strony. Format adresu i tokenu — [DO WYJAŚNIENIA, badacz].
- **Smart App Banner:** `<meta name="apple-itunes-app" content="app-id=…">`, bez `app-argument` (D8). Strony Apple nie udało się przeczytać — szczegóły do potwierdzenia przez badacza. Działa tylko w Safari na iOS.
- **Plakietka:** oficjalna grafika Apple, lokalizowana. Zasady użycia do sprawdzenia przez badacza.
- **Ceny:** strona nie podaje cen, bo zależą od kraju i się zmieniają.
- **Tekst:** strona ma własne zdania, nie kopiuje opisu ze sklepu (pkt 12, R5).

## 10. Wydajność (budżet; liczby to konwencja produktu do zatwierdzenia, nie wiedza dziedzinowa)
- HTML strony ćwiczenia ≤ 20 KB bez kompresji. Same znaczniki hreflang to ok. 3 KB.
- Animacja jako osobny, wspólny dla języków plik `/assets/fig/{slug}…` ≤ 30 KB, z pamięcią podręczną przeglądarki.
- JS (pauza, przełączniki, filtry, wyszukiwarka) ≤ 15 KB na stronę, opcjonalny (strona działa bez niego). Indeks wyszukiwania ≤ 25 KB na język, ładowany dopiero po wejściu w pole.
- JS narzędzi (F-02…F-08, F-17, F-18, F-19): osobne pliki ładowane tylko na stronach narzędzi i przy akcji na karcie ćwiczenia; budżet w KB `[DO USTALENIA]` (ustala programista z pomiarem przed falą 1, zapis tutaj i w strażniku S9). Bez JS narzędzie pokazuje stan „wymaga JavaScript” zamiast pustej strony; karta ćwiczenia działa jak dotąd (zmienione 02.11.2026, ZM-03).
- Cała opublikowana strona ≤ 700 MB, build przerywany przy 800 MB (limit Pages 1 GB). Szacunek: 24 815 × 20 KB ≈ 0,5 GB.
- Zero zapytań do innych domen. Docelowo „dobre” Core Web Vitals — progi do podania przez badacza ze źródła.
- **Technika animacji w przeglądarce — decyzja programisty**, z wymaganiami: bez JS widać pozycje statyczne, pauza działa, reduced-motion respektowane, mieści się w budżecie. Warianty: (a) klatki policzone przy buildzie i zapisane jako SVG z animacją deklaratywną; (b) silnik v2 przeniesiony do przeglądarki (ok. 115 KB źródła). Rekomendacja: (a).

## 11. Czego strona NIE robi
- Nie ma kont ani logowania serii. Plany są (F-04: układanie z katalogu, w adresie), gotowego planu z generatora na razie nie ma — PÓŹNIEJ, po wydzieleniu czystego `generate()` w aplikacji (linia 1.2) i zamknięciu T-050 (F-09) (zmienione 02.11.2026, ZM-03, ZM-07; poprzednio: „Nie ma kont, logowania serii, planów ani generatora.”).
- Nie ma pobierania danych katalogu (JSON, API, ZIP, zrzut CSV ćwiczeń) ani komentarzy i treści użytkowników na serwerze. Wyjątek: CSV i wydruk **własnego planu** odwiedzającego (F-04, F-17), generowane w przeglądarce (zmienione 02.11.2026, ZM-03, ZM-05).
- Nie ma relacji trener–podopieczny: listy podopiecznych, przypisywania planów, wglądu w wyniki, pola imienia (warunek ZAL-S4; licencja na druk to zgoda prawna, nie funkcja) (zmienione 02.11.2026, ZM-03).
- Nie ma reklam (decyzja 25.10) ani newslettera.
- Nie ma ciasteczek i śledzenia (przy D4 A).
- Nie podaje źródeł, autorów, bibliografii, „sprawdzone przez”, poziomów pewności z odwołaniem do badań.
- Nie porównuje z innymi aplikacjami i nie używa nazw innych firm.
- Nie udziela porad medycznych.
- Nie podaje cen.
- Nie zapowiada funkcji z przyszłych wersji — z jednym wyjątkiem: „wkrótce” dla importu planu w 1.2, pilnowane strażnikiem (pkt 9; zmienione 02.11.2026, ZM-04).
- Nie ma tekstów pisanych pod frazy ani stron kombinacji filtrów.
- Nie tłumaczy automatycznie w czasie działania. Teksty pochodzą wyłącznie z wydania aplikacji, a teksty interfejsu strony — ze słownika przejrzanego przez tłumacza.

## 12. Strażnicy (każdy przerywa build; uruchamiani w workflow strony)
- **S1 anonimowość:**
  - skaner wygenerowanego HTML i SVG szuka nazw organizacji, autorów, tytułów i adresów z `data/zrodla/*.json` (tylko w czasie budowania, nigdy nie publikowane);
  - szuka też słów ogólnych o źródłach z istniejącego strażnika aplikacji;
  - [DO WYJAŚNIENIA] strażnik ma słowa ogólne tylko dla PL/EN — potrzebna lista dla 33 pozostałych języków (tłumacz plus recenzent).
- **S2 nazwy firm:** lista z `tests/forbidden-names.json` zastosowana do HTML.
- **S3 znaki towarowe (R-016):** każda nazwa ćwiczenia ma w `trademark-check.json` status „sprawdzone” z datą. Brak statusu → build przerwany.
- **S4 wersja:**
  - dane tylko z tagu wydania;
  - `manifest.appVersion` równa się wersji w App Store — sprawdzane publicznym wyszukiwaniem po ID, [DO WYJAŚNIENIA, badacz: czy ta usługa jest stabilna];
  - zdania o funkcjach tylko z listy funkcji wydania.
- **S5 liczby:** szablony nie zawierają liczb wpisanych na sztywno. Wszystkie liczby (ćwiczenia, języki, zamienniki) pochodzą z eksportu (test szuka cyfr w szablonach, z listą wyjątków z powodem).
- **S6 warunek indeksowania (zmienione 02.11.2026, ZM-02, ZM-06):** do indeksu idzie tylko ćwiczenie z pełną kartą **i** własnymi wskazówkami (warunek `own` z `src/pages.mjs` zostaje, dochodzi pole „pełna” z eksportu, F-20); pozostałe `noindex,follow` albo niepublikowane. **Stan 02.11.2026: kod strony zrobiony** (gałąź `claude/s6-pelna`): reguła w `src/pages.mjs` (`exercisePage`), strażnik `checkIndexingRule` w `src/straznicy.mjs` czyta zbudowane strony niezależnie od reguły; testy w `tests/straznicy-startu.test.mjs` i `tests/build.test.mjs`. Otwarte: pole `pelna` w eksporcie aplikacji (F-20) i przepięcie PIN. Poprzednio: „każde ćwiczenie ma gotową rodzinę v2 (709/709) albo build pierwszej publikacji jest przerwany.”
- **S7 SEO:**
  - hreflang wzajemny i kompletny, kody z dozwolonej listy;
  - canonical wskazuje stronę samą;
  - w sitemap tylko strony indeksowane;
  - strony `noindex` nie są w sitemap;
  - brak osieroconych stron;
  - wszystkie linki wewnętrzne działają;
  - slugi zgodne z `slugs.lock.json`.
- **S8 dostępność:** automatyczny skaner WCAG na próbce (wszystkie języki × 5 ćwiczeń × 2 motywy × reduced-motion). Kontrast palet. `lang` na `<html>`.
- **S9 prywatność i wydajność:** CSP obecne; zero zewnętrznych adresów w HTML; brak `document.cookie` i `localStorage` w JS; budżety z pkt 10.
- **S10 język:** zero kluczy bez tłumaczenia w języku strony (bez fallbacku). Raport braków.

## 13. Wymagania wobec repo aplikacji
- **Skrypt eksportu w repo aplikacji** (np. `scripts/site/export-atlas.mjs`):
  - używa tych samych funkcji co aplikacja (`exName`, `cuesFor`, ranking zamienników, `svgMarkup`, silnik v2), bez kopiowania logiki;
  - test w verify aplikacji: eksport się udaje, a jego zawartość zgadza się z tym, co pokazuje ekran ćwiczenia.
- **Zawartość per ćwiczenie:**
  - klucz katalogu, slug, nazwa per język;
  - `group`, mięśnie (główne i pomocnicze z `muscleLoad`), flaga „przybliżony”;
  - `requires`, `loadSource`, rodzina i widoki, flaga niszowe;
  - flagi: własne wskazówki / ogólne / brak;
  - teksty sekcji `setup`, `move`, `tips`, `mistakes` per język, błędy figury;
  - zamienniki top 3 per język;
  - klatki animacji lub gotowe SVG (normalnie, z błędem, pozycje statyczne).
- **Słowniki:** etykiety partii, sprzętu i rodzin oraz teksty interfejsu strony — nowe klucze przez `t()` i `lib/i18n.en.ts`, tłumacz dla 35 języków.
- **Wykluczone z eksportu:**
  - `data/zrodla`, `basis`, `CATALOG_RESEARCH`, poziomy pewności, komentarze;
  - znaczniki pochodzenia (D10).
- **Przypięcie wersji:** eksport wyłącznie z tagu `v1.1.0-b…` i kolejnych. Strona zapisuje w `manifest` i w `<meta name="generator">` wersję i SHA. Nowa wersja strony powstaje tylko przy nowym wydaniu aplikacji.
- **Przepływ danych:** decyzja D5.

## 14. Ryzyka
- **R1 dane już publiczne:** repo aplikacji jest publiczne. Widać w nim `lib/catalog.generated.ts`, `lib/cues/text/*.json` i `data/zrodla/` z pełnymi źródłami. Komentarz w `lib/swap.ts` nazywa bazę, z której pochodzi katalog. Zakaz pobierania hurtem chroni licencja (pkt „baza danych” w LICENSE, 25.10), nie technika. Strona nie pogarsza tego stanu, jeśli nie publikuje czystego pliku danych (D5).
- **R2 treści masowe:** 24 815 stron z jednego szablonu; 538 ćwiczeń ma wskazówki wspólne dla rodziny, a 69 nie ma tekstu (docs/50). Zaradczo: D1, D3, pkt 5.
- **R3 tłumaczenia bez przeglądu:** teksty w 33 językach są „do przeglądu native speakerów” (R-010). Publiczne teksty techniki w słabym tłumaczeniu szkodzą jakości i ocenie przez Google (D3).
- **R4 nazwy angielskie w 34 językach:** strony mogą nie odpowiadać na lokalne zapytania (np. de „Kniebeuge”). D2.
- **R5 duplikat z App Store:** kopiowanie opisu ze sklepu powiela treść i rozjeżdża się po zmianach. Własne zdania z listy funkcji.
- **R6 rozjazd z aplikacją:** zamienniki i teksty zmieniają się z wydaniem. S4 i eksport z tagu.
- **R7 regulamin Pages:** strona promuje płatną aplikację. Do oceny przez badacza, czy to „online business”. Plan zapasowy: inny darmowy hosting statyczny (bez nazw w repo).
- **R8 rozmiar i czas wdrożenia:** zbliżanie się do 1 GB i 10 min. Budżet z pkt 10 i pomiar w buildzie.
- **R9 anonimowość w 33 językach:** strażnik słów ogólnych nie pokrywa tych języków (S1).
- **R10 sprzeczność w zgłoszeniu 1.0:** tekst promocyjny w docs/48 mówi o „wskazówkach ze źródłami”, a od 25.10 obowiązuje anonimowość. To poza zakresem strony, ale do poprawy przed wysłaniem 1.0 (koordynator).
- **R11 slugi:** zmiana nazwy w katalogu nie może zmienić adresu (lock).
- **R12 przenosiny repo aplikacji:** jeśli repo aplikacji kiedyś stanie się prywatne, wariant D5 A przestaje działać bez sekretu.

## 15. Kryteria akceptacji (testowalne)
- **Wybór języka (`/`):** 35 linków; `x-default` wskazuje `/`; zero przekierowań; skaner WCAG bez błędów.
- **Strona główna języka:**
  - `lang` poprawny;
  - liczby równe eksportowi (S5);
  - linki do wszystkich wartości partii, sprzętu i rodzin z danych;
  - lista podstawowych równa zbiorowi nie-niszowych z eksportu.
- **Lista i filtry:**
  - lista A–Z ma wszystkie ćwiczenia z eksportu, posortowane collatorem języka (test porównuje z aplikacją);
  - każda strona filtra zawiera dokładnie ćwiczenia o tej wartości;
  - bez JS lista działa;
  - z JS kombinacja 0 wyników pokazuje komunikat i „Wyczyść filtry”;
  - adresy z parametrami filtrów nie trafiają do sitemap i mają canonical do strony listy.
- **Strona ćwiczenia:**
  - elementy w kolejności z pkt 3.5;
  - nazwa = `exName` aplikacji w danym języku;
  - mięśnie i dopisek „przybliżony” zgodne z aplikacją dla 100% ćwiczeń;
  - zamienniki = top 3 rankingu aplikacji (profil nowego użytkownika) dla każdego języka;
  - dopisek „Ogólne wskazówki dla tego ruchu” dokładnie tam, gdzie w aplikacji;
  - przełącznik błędu tylko przy wariantach z błędem;
  - brak sekcji bez tekstu w danym języku.
- **Animacja:**
  - pauza widoczna i działa klawiaturą;
  - przy reduced-motion brak autostartu i widoczne pozycje statyczne z podpisami;
  - bez JS pozycje statyczne;
  - kontrast elementów ≥ 3:1 w obu motywach;
  - plik ≤ 30 KB.
- **Slugi i adresy:** zgodne z regułą z pkt 4; brak kolizji; `slugs.lock.json` niezmieniony bez wpisu przekierowania; ten sam slug we wszystkich językach.
- **SEO:**
  - S7 zielony;
  - każdy plik sitemap ≤ 50 000 adresów i ≤ 50 MB;
  - dane strukturalne tylko z dozwolonych typów, poprawne w walidatorze;
  - strony `noindex` zgodnie z D1 i D3.
- **Prywatność:** zero zewnętrznych żądań przy otwarciu (test w przeglądarce bezgłowej); brak ciasteczek i `localStorage`; CSP obecne.
- **App Store:** link i baner zawierają poprawne ID z jednego pliku konfiguracji; zdania wezwania tylko z listy funkcji wydania (S4).
- **Strażnicy S1–S10:** każdy ma test, który celowo podstawiony błąd (nazwa źródła, nazwa firmy, liczba na sztywno, brak tłumaczenia, niesprawdzony znak towarowy, ćwiczenie indeksowane bez pełnej karty i własnych wskazówek) przerywa build (zmienione 02.11.2026, ZM-06; poprzednio: „ćwiczenie bez figury v2”).
- **Dostępność:** skaner WCAG 2.2 AA bez błędów na próbce z S8. VoiceOver na iPhonie: krótka lista „tylko telefon” — odczyt nazwy angielskiej, pauza animacji, baner.

## 16. Decyzje dla właściciela
Proponowana kolejność pytań, pojedynczo, od najbardziej blokujących: D1, D3, D2, D5, D4, D6, potem reszta.

**D1. Indeksowanie stron bez własnej treści** (538 z ogólnymi wskazówkami rodziny, 69 bez tekstu)
- A — indeksowane wszystkie 709. Kompromis: większy zasięg, ale ryzyko oceny jako treść masowa, bo setki stron mają ten sam tekst wskazówek.
- B — wszystkie strony istnieją i są linkowane; indeksowane tylko te z własnymi wskazówkami (dziś 102) lub własnym częstym błędem; reszta `noindex,follow`, a reguła zdejmuje `noindex`, gdy ćwiczenie dostanie własną treść. Kompromis: mniejszy zasięg na start, bezpieczna jakość.
- C — dla ćwiczeń z ogólnymi wskazówkami jedna strona rodziny zamiast stron ćwiczeń. Kompromis: mniej stron, ale gorzej odpowiada na zapytanie o konkretne ćwiczenie.
- **Rekomendacja: B.**

**D2. Nazwy ćwiczeń w 34 językach poza PL** (aplikacja pokazuje angielskie)
- A — tylko angielskie, jak w aplikacji. Kompromis: pełna zgodność z aplikacją, słabsze trafienia na lokalne zapytania.
- B — angielska nazwa plus lokalna nazwa zwyczajowa („także: …”). Kompromis: lepsze SEO, ale 709 × 33 nowych tekstów do tłumacza i recenzenta, sprawdzenie znaków towarowych dla każdej nazwy i rozjazd z aplikacją (chyba że aplikacja dostanie to samo).
- **Rekomendacja: A na start.** B ewentualnie później, razem z tą samą zmianą w aplikacji.
- D2b (mniejsze): segmenty adresów angielskie we wszystkich językach (rekomendacja) albo tłumaczone (więcej kolizji i tłumaczeń, minimalny zysk).

**D3. Języki bez przeglądu native speakera** (R-010)
- A — 35 języków indeksowanych od startu. Kompromis: pełny zasięg, ryzyko jakości i oceny tłumaczeń.
- B — 35 języków publikowanych; indeksowane PL, EN i języki po przeglądzie; reszta `noindex` do przeglądu. Kompromis: zasięg rośnie wraz z przeglądami.
- **Rekomendacja: B.** Jedna linijka w konfiguracji na język.

**D4. Pomiar**
- A — bez analityki. Darmowe narzędzie wyszukiwarki dla webmasterów (kliknięcia i wyświetlenia, bez skryptu na stronie; weryfikacja domeny przez DNS) plus token kampanii w linku App Store (wejścia i pobrania w App Store Connect). Kompromis: brak danych o zachowaniu na stronie, pełna prywatność, 0 zł.
- B — analityka bez ciasteczek. Kompromis: więcej danych, ale własny serwer (koszt) albo usługa firmy trzeciej (koszt lub prywatność, zmiana informacji o prywatności).
- **Rekomendacja: A.**

**D5. Przepływ danych do repo strony**
- A — workflow strony pobiera publiczne repo aplikacji na wskazanym tagu, uruchamia eksport i build, a publikuje tylko HTML/SVG przez Pages. W repo strony nie ma danych ani nowego sekretu. Kompromis: zależy od tego, czy repo aplikacji zostanie publiczne (R12).
- B — eksport JSON commitowany do repo strony. Kompromis: prostsze, ale publikuje czysty zbiór danych (wbrew „nie do pobrania hurtem”).
- C — workflow aplikacji pushuje do repo strony. Kompromis: wymaga nowego sekretu (klucz wdrożeniowy), wbrew zasadzie „bez nowych sekretów”.
- **Rekomendacja: A.**

**D6. „Rodzina ruchu” w filtrach**
- A — 43 rodziny figur v2. Kompromis: zgodne z animacjami; etykiety są dziś tylko po polsku i bywają długie, więc trzeba je skrócić i przetłumaczyć (43 × 34).
- B — 16 wzorców ruchu z katalogu (`pattern`). Kompromis: mniej pracy, ale „isolation”, „other” i „mobility” słabo pomagają w przeglądaniu; w aplikacji nie znalazłem dla nich etykiet.
- C — bez tego filtra na start.
- **Rekomendacja: A.**

**D7. Strona główna języka**
- A — wyszukiwarka i filtry na górze, „Podstawowe” poniżej. Kompromis: szybkie dojście do ćwiczenia.
- B — akapit o aplikacji i przycisk App Store na górze. Kompromis: mocniejsza promocja, słabsza użyteczność (a strona ma dawać realną wartość).
- **Rekomendacja: A.**

**D8. Smart App Banner**
- A — tak, bez `app-argument`. Kompromis: dodatkowe wejście do sklepu w Safari na iOS, zajmuje kawałek ekranu.
- B — nie, tylko przycisk w treści.
- **Rekomendacja: A.** Głębokie linki do ćwiczenia dopiero, gdy aplikacja je obsłuży — [DO WYJAŚNIENIA: dziś nie znalazłem takiej obsługi].

**D9. Adres `/`**
- A — strona wyboru języka bez przekierowania. Kompromis: jedno kliknięcie więcej; przewidywalne i zgodne z `x-default`.
- B — przekierowanie skryptem według języka przeglądarki. Kompromis: wygodniej, ale ryzyko złego języka, problemy z robotami i dodatkowy JS.
- **Rekomendacja: A.** Na `/` można wyróżnić język przeglądarki bez przekierowania.

**D10. Znaczniki pochodzenia w HTML** (niewidoczne identyfikatory z katalogu, 25.10)
- A — tak, jako atrybuty danych. Kompromis: dowód kopiowania przy sporze; rośnie rozmiar strony i znaczniki stają się publiczne (łatwo je usunąć).
- B — nie.
- **Rekomendacja: B.** Ochronę daje licencja; znaczniki zostają w danych aplikacji.

**D11. Wyszukiwarka na stronie**
- A — tak, lokalny indeks nazw per język (≤ 25 KB, ładowany na żądanie). Kompromis: wygoda, trochę JS.
- B — nie, wystarczą lista A–Z i filtry.
- **Rekomendacja: A.**

**D12. Informacja o prywatności strony**
- A — link w stopce do istniejącej polityki `apps4brew.com/trening/privacy.html` (PL/EN, zgodnie z decyzją o dwóch językach) plus akapit o stronie (brak ciasteczek, logi hostingu).
- B — osobna strona prywatności `techniqueatlas` w 35 językach. Kompromis: lepsza dla użytkownika, ale ryzyko rozjazdu wersji (powód odrzucenia 35 języków dla polityki).
- **Rekomendacja: A.** Treść do sprawdzenia przez badacza lub prawnika.

## 17. [DO WYJAŚNIENIA]
1. Wpisy właściciela z 26.10 (osobne repo, start z 1.1) i R-016 nie występują na `main` — dopisać do docs/18 i docs/40.
2. Stan sprawdzenia znaku towarowego dla domeny (TMview, klasy 9/41/44) i zakup domeny.
3. App Store ID (Apple ID) do jednego pliku konfiguracji strony.
4. Pole „sprzęt” w filtrze (`loadSource` czy `EQUIP_GROUPS`) i czy jego etykiety są tłumaczone w aplikacji.
5. hreflang dla `es-419` (lista regionów) i `sr` (pismo) — badacz i programista.
6. Napis „Kąt na rysunku” i dopiski poziomu pewności z odwołaniem do badań (np. „Przypisanie partii: przegląd badań.”): czy w 1.1 jeszcze istnieją i czy nie łamią anonimowości. Na stronie pominięte.
7. Słowa ogólne o źródłach dla 33 języków w strażniku (S1).
8. Badacz:
   - Smart App Banner (strona Apple nieprzeczytana);
   - zasady plakietki App Store;
   - format linku i tokenu kampanii;
   - publiczne wyszukiwanie wersji po ID (S4);
   - status `HowTo` i `BreadcrumbList`;
   - meta refresh jako przekierowanie;
   - progi Core Web Vitals;
   - regulamin Pages wobec strony promującej płatną aplikację;
   - logi IP hostingu.
9. Co pokazać przy 69 ćwiczeniach bez tekstu wskazówek, poza wariantem D1.
10. Nowe repo dostaje własny CLAUDE.md i własne verify. Macierz testów i Maestro z repo aplikacji go nie obejmują, ale eksport po stronie aplikacji — tak (test plus wpis w `tests/przeplywy.json` nie jest potrzebny, bo to nie przepływ w aplikacji; do potwierdzenia przez koordynatora).

## 18. Nakład
- **Praca agenta** (szacunek, z pracą równoległą):
  - eksport w repo aplikacji z testem zgodności: ok. 1 dzień;
  - generator stron i szablony: 1–2 dni;
  - animacja w przeglądarce, wariant (a): ok. 1 dzień;
  - strażnicy S1–S10: ok. 1 dzień;
  - słownik interfejsu strony, 35 języków przez API: kilka godzin plus przegląd.
- **Na co się czeka:** gotowość 709/709 figur v2 (ok. 126 h pracy agenta wg docs/51), wydanie 1.1, propagacja DNS i indeksowanie przez wyszukiwarkę (tygodnie).
- **Czas właściciela:** decyzje D1–D12, zakup domeny i wpis DNS, weryfikacja domeny w narzędziu dla webmasterów, ręczne sprawdzenie znaków towarowych nazw (R-016), krótka lista kontrolna na iPhonie.

---

## Przeczytane źródła i pliki
**Strony zewnętrzne (przeczytane):**
- [Spam policies — scaled content abuse](https://developers.google.com/search/docs/essentials/spam-policies)
- [Localized versions / hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

**Tylko ze streszczenia wyszukiwarki, nieprzeczytane (do sprawdzenia przez badacza):**
- [Changes to HowTo and FAQ rich results](https://developers.google.com/search/blog/2023/08/howto-faq-changes)
- [Smart App Banners](https://developer.apple.com/documentation/webkit/promoting-apps-with-smart-app-banners) — treść strony się nie wczytała.

**Repo z GitHuba (`lkarwowski494/trening`, `main`):**
- docs/18-przekazanie.md (wpisy 20–26.10), docs/50-figury-v2.md, docs/51-figury-v2-pokrycie.md, docs/48-zgloszenie-1-0.md, docs/41-droga-do-app-store.md
- lib/i18n.ts, lib/cues/index.ts, lib/cues/text/ (35 plików), lib/figures/v2/families.ts, data/zrodla/ (cues.json, figures.json)
- site/index.html, store/app-store-urls.json

**Repo lokalne (nieaktualne):**
- /home/user/trening/CLAUDE.md
- /home/user/trening/docs/18-przekazanie.md
- /home/user/trening/lib/swap.ts
- /home/user/trening/lib/i18n.ts
- /home/user/trening/lib/catalog.generated.ts
- /home/user/trening/lib/equipment.ts
- /home/user/trening/app/swap.tsx
- /home/user/trening/app/exercises.tsx
## Pytania do native speakerów (teksty stałe strony, recenzja 26.10.2026)

Teksty stałe `src/ui/<kod>.json` przeszły recenzję lokalizacji; poprawki wysokiej i średniej wagi wprowadzone. Poniższe czekają na native speakera i zostały bez zmian (jedno zdanie, dwie opcje):

1. el: rodzina przysiadów: „Squat” (jest) czy „Καθίσματα”?
2. el: rwanie kettlebell: „ταλαντεύσεις και τραβήγματα” (jest) czy „swing και αρασέ”?
3. fi: martwe ciągi: „Lonkkanivelen taivutus (maastavedot)” (jest) czy „Maastavedot ja lonkkasarana”?
4. fi: unoszenie ramion: „Hartianostot” (jest) czy „Vipunostot sivuille ja eteen”?
5. hu: martwe ciągi: „Csípőhajlítás (felhúzások)” (jest) czy „Felhúzások (hip hinge)”?
6. ro: wyciskanie leżąc: „Împins la bancă” (jest) czy „Împins la piept”?
7. ro: martwe ciągi: „Flexie de șold (îndreptări)” (jest) czy „Îndreptări (hip hinge)”?
8. sr: szrugsy: „Слегање раменима” (jest) czy „Слегања рамена (шрагови)”?
9. ms: czy „punggung” na liście partii czytasz jako pośladki, czy plecy (wtedy lepsze „glut” / „otot punggung”)? Strona używa „Punggung di lantai” zgodnie z aplikacją.
10. ja: stopka: „無断転載を禁じます。” (jest) czy „All rights reserved.”?
11. zh-Hant: thruster: „推舉蹲（Thruster）” (jest) czy „火箭推”?
12. fr / nl / tr: „hip hinge”: termin lokalny (jest) czy anglicyzm?
13. nl: unoszenie ramion: „Schouderheffen” (jest) czy „Lateral raises” / „Zijwaarts heffen”?
14. es-419: noszenie ciężaru: „Cargas caminando” (jest) czy „Acarreos” / „Caminatas con carga”?
15. et: wyciskanie leżąc: „Rinnalt surumine” (jest) czy „Lamades surumine”?
16. et: rozpiętki: „Ristitõmbed” (jest) czy „Hantlitega laiali viimine”?
17. lv: martwy ciąg: „vilkšana” (jest) czy „vilkme”?
18. lv: stożek rotatorów: „Rotatoru aproce” (jest) czy „Rotatoru manšete”?
19. uk: unoszenie ramion: „Підйоми на плечі” (jest) czy „Махи на плечі”?
20. vi: wiosłowanie: „Kéo xô” (jest) czy „Chèo thuyền / Gập người kéo tạ”?
21. ja: wiosłowanie: „ロウ” (jest) czy „ロウイング”?
22. cs: deska: „prkna” (jest) czy „planky”?

Niskiej wagi, niewprowadzone (do zbiorczej poprawki): apostrofy typograficzne w fr/it/tr/et, „Zamienniki” w `countLine` (alternatywy → termin z aplikacji), ja „プライバシーポリシー”, zh-Hant „隱私權政策”, hu „SMR hengerezés”, ro „Salt la conținut”, ko „랫 풀다운”, nazwy rodzin `kneeling_hinge` i `chest_press_machine` po zmianie wzorca en (przetłumaczyć ponownie), pl „Ścieżka nawigacji” wprowadzone.

### Odznaki App Store do porównania z oficjalnymi odznakami Apple

Tekst `appStore` jest własny; sprawdzić z zlokalizowanymi odznakami Apple (App Store Marketing Guidelines): pt („Transferir na App Store” — odznaka pt-PT może mieć „Descarregar”), pt-BR, es, es-419, tr, sl, hr, sr, bg, lt, lv, et. Pozostałe języki (cs, sk, hu, ro, uk, de, fr, it, nl, sv, da, nb, fi, el, id, ms, vi, ru, ja, ko, zh-Hant) też warto zestawić zbiorczo przy okazji.

## Strażnik terminów strony

`tests/straznik-terminy.test.mjs`: (1) wzorce „zakazane” ze słownika aplikacji (`docs/lokalizacja/slownik-terminow.json`, kopiowany przez `npm run dane` do `.cache/dane`, nie commitowany) nie mogą wystąpić w żadnym tekście `src/ui/<kod>.json`; (2) słownik strony `docs/slownik-strony.json` (nazwy rodzin ruchów): termin zalecany w kluczu, zakazane poza tekstem. `countLine` ma formy liczby (CLDR) wybierane w generatorze przez `Intl.PluralRules` (`plural` w `src/lib.mjs`).

## Decyzja 26.10.2026 (właściciel): kreator planów na stronie — wariant B, po 1.1
Kreator planu w przeglądarce (cel, miejsce, liczba sesji) na tych samych regułach co generator aplikacji (jedno źródło prawdy, eksport z repo aplikacji), eksport CSV (format importu aplikacji), PDF (wydruk) i Excel, oraz przycisk „Otwórz w aplikacji” (link przenoszący plan do aplikacji — wymaga domeny i osobnego wydania aplikacji). Strona nadal nic nie zbiera (przetwarzanie w przeglądarce). Uzasadnienie: zarabianie M5 S1 liczy dni treningowe, nie tworzenie planów — kreator nie zabiera przychodu, przyprowadza do aplikacji; [określenie o module trenerskim usunięte 02.11.2026, ZM-03 — warunek ZAL-S4: strona nie ma funkcji relacji trener–podopieczny]. Odrzucone: A (tylko CSV + PDF, import plikiem), C (bez kreatora). Zmienia wcześniejszą decyzję „strona = wyłącznie biblioteka ćwiczeń”. Termin: po starcie 1.1 (nie opóźnia 1.1). Otwarte: biblioteka do Excela (licencja, rozmiar), format linku do aplikacji.

**Zastąpione częściowo 02.11.2026 (ZM-03, ZM-04, ZM-05, ZM-07):** „eksport CSV (format importu aplikacji) … i Excel” → jeden format CSV wariant A (UTF-8 z BOM, separator według języka, kolumna `id` ćwiczenia, wersja formatu, ochrona przed formułami arkusza), czytany przez arkusz (także Excel — osobnego formatu Excel nie ma) i przez import w aplikacji 1.2; „przycisk „Otwórz w aplikacji”” → import planu w aplikacji 1.2 (F-15) i zapowiedź „wkrótce” ze strażnikiem; kreator z generatora (cel, miejsce, liczba sesji) → F-09 PÓŹNIEJ (czysty `generate()`, T-050); na stronie od fali 1 jest układanie planu z katalogu (F-04). Otwarte „biblioteka do Excela” i „format linku do aplikacji” — zamknięte tym samym (bez biblioteki; link `trening://` odrzucony w bramce E2, wariant B CSV).

## Zasada infrastruktury a indeksowanie (właściciel 01.11.2026)

Infrastruktura ma być ustawiona tak, by później nie zepsuć indeksowania w Google. Podstawa: `docs/badanie-indeksowania-2026-11-01.md` (cytaty i adresy źródeł tamże). Wdrożone tego dnia:
- Przy `indeksowanie=false` `robots.txt` zezwala na skanowanie (`Allow: /`, bez `Disallow`, bez `Sitemap`), a strony mają `noindex` — przy zablokowanym skanowaniu Google nie zobaczy `noindex` (test w `tests/build.test.mjs`).
- Strona `/` ma canonical na siebie i pełny zestaw hreflang (języki + x-default na siebie), wzajemnie ze stronami głównymi języków (`tests/hreflang.test.mjs`).
- `meta refresh` przekierowania ma pełny adres z domeną.
- Przekierowania w `slug-overrides.json` mają datę dodania (`od`); usunięcie wpisu młodszego niż 365 dni od startu indeksowania (`config.json` → `indeksowanieOd`) to błąd (`REDIRECT_MIN_DAYS` w `src/slugi.mjs`, `tests/slugi.test.mjs`); strażnik S8 wymaga `indeksowanieOd` przy `indeksowanie=true`.
- Workflow Pages po wdrożeniu sprawdza (ostrzega) robots.txt, noindex, HTTP→HTTPS i github.io→domena ze ścieżką (`tests/workflow-pages.test.mjs`).

### Decyzje właściciela 01.11.2026 (zamknięte)
- **Adres kanoniczny z `www`** (wariant A): `https://www.techniqueatlas.com`. Odrzucone: domena bez `www` (GitHub zaleca `www`; apex jest tylko przekierowaniem). Test: `tests/slugi.test.mjs` („domena kanoniczna zaczyna się od https://www.”).
- **Hosting: GitHub Pages** (wariant A). Odrzucone: Cloudflare Pages (Free: limit 20 000 plików, a strona ma ok. 24 815 stron przy 35 językach).

### Lista kontrolna startu — ustalić PRZED pierwszym indeksowaniem
(badanie, pkt 7; zmiana później = przenosiny witryny albo przekierowanie każdej strony × język)
- [ ] Domena kupiona i podpięta w ustawieniach Pages; DNS dla `www` (i apex jako przekierowanie); weryfikacja domeny.
- [ ] HTTPS wymuszone („Enforce HTTPS”, może być dostępne dopiero po 24 h) przed startem.
- [ ] Schemat adresów `/{lang}/exercises/{slug}/` zatwierdzony (bez zmian po starcie).
- [ ] Ukośnik końcowy: adresy z „/”; zachowanie Pages dla adresu bez „/” sprawdzone (`curl -sI`, otwarte).
- [ ] Małe litery i myślniki w adresach (reguła slugów).
- [ ] Canonical bezwzględny, ten sam język; `slugs.lock.json` zamrożony (`npm run slugi`).
- [ ] `x-default` i hreflang na stronie `/` (wdrożone).
- [ ] `indeksowanieOd` ustawione razem z `indeksowanie=true` (S8).
- [ ] Przebieg dowodowy Pages: `curl -sI` github.io→domena (kod i ścieżka), HTTP→HTTPS, robots.txt, noindex.
