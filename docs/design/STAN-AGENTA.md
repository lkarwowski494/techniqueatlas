# Stan agenta — Z-10 zrobione, Z-12 do zrobienia (rola 04)

Rola 04-studio-projektowe, tryb build, moduł strona-www · 27.11.2026 · gałąź `strona/z10-makiety` (od `strona/z00-z03-plan-dane-regula` @ cca7ab5). Sesja AX zamknęła krok, bo przekroczyła 30% kontekstu.

## Zrobione (Z-10, sesja AX)
- Inwentarz AS IS: `docs/design/inwentarz-2026-11-27.md` + `inwentarz-2026-11-27/`.
- Trzy kierunki: `docs/design/makiety-2026-11-27/` (README, arkusze, zrzuty, `kontrast.md`); tests.yml zielony na eb4a9ca (run 46035081018).
- **Z-11:** właściciel wybrał **A „Arkusz”**, słowami „A „Arkusz” (Rekomendowane)” (27.11.2026, 17:05 UTC, przekazał koordynator). Decyzje 2–6 przyjęte do weta (KO-132).

## Następny krok: Z-12, system wyglądu dla A (polecenie koordynatora z 27.11 17:14 UTC)
Zakres: tokeny (kolory w obu motywach, typografia, odstępy), komponenty, szablony 3 ekranów, stany (brak rysunku, brak wskazówek, 404), ikona, obrazek podglądu (PNG). Tylko `docs/design/`, bez `src/` i `assets/` (wdrożenie w Z-31 i Z-33). Kontynuacja na `strona/z10-makiety`. Kontrast i axe jak w Z-10. Na koniec push, tests.yml zielony, PRZEKAZANIE do koordynatora `session_01BM51ofp4DMHDkCDaVVg49P`.

Plan:
1. Arkusz ok. 5 krojów tytułowych na stronie ćwiczenia A (dziś IBM Plex Sans Condensed). Kandydaci z liternictwa rysunku technicznego, wszystkie OFL przez @fontsource: Plex Sans Condensed, Barlow Semi Condensed, Saira Semi Condensed, Archivo Narrow, Overpass. Wybór należy do mnie według rekomendacji, do weta. Gdy różnica jest duża, arkusz idzie do koordynatora.
2. Tokeny: `docs/design/tokeny.css` jako zmienne CSS (`--bg`, `--sheet`, `--ink`, `--muted`, `--rule`, `--hair`, `--accent`, `--accent-bg`, `--kontrola` z `a-arkusz/styl.css`) plus wariant `prefers-contrast: more`; typografia przez `clamp()`; jednostka odstępu 4 px; promienie 0/2 px; klasy tempa `.t5…t40` (wartości faz w danych: 0; 0,5; 1; 2; 2,5; 4 s).
3. Komponenty: nagłówek z menu (z rozwinięciem na telefonie bez JS, przez `details`), okruszki, tabliczka, odpowiedź, figura z linią wymiarową, wykaz (tabela listy), ramka „w aplikacji”, stopka, przycisk/pole/select, plakietka App Store (tylko grafika Apple).
4. Stany: ćwiczenie bez figury (180 z 708; bez linii wymiarowej, tabliczka zostaje), wskazówki ogólne (257; nota), brak wskazówek (150), 404, wybór języka, pusty wynik filtra.
5. Ikona/favicon (znak: linia wymiarowa) i obrazek podglądu według A9 z `docs/badanie-zasiegu-2026-11-27.md` (gałąź `strona/z06-badanie-zasiegu`): ten sam rysunek ćwiczenia, PNG, bez tekstu na obrazku; budżet wagi dla ~700 plików.
6. `docs/design/design-spec.md` (tabela strona AS IS → TO BE, adresy bez zmian) i zrzuty wzorcowe 320/390/768/1024/1440 w obu motywach (pasy ≤ 300 KB, `arkusze.py`).

## Odtworzenie makiet
`npm ci && npm run dane`; nazwy pl: `git show origin/strona/z24-nazwy-pl:docs/nazwy/pl.json > /tmp/nazwy.json`; kroje: `npm i @fontsource/{ibm-plex-sans-condensed,source-serif-4,courier-prime}@5` w katalogu roboczym; `node src/build.mjs --jezyki pl --out /tmp/dist`; `node docs/design/makiety-2026-11-27/generuj.mjs /tmp/nazwy.json <node_modules/@fontsource> /tmp/dist`; zrzuty: serwer w `docs/design/`, Playwright skala 2 (skrypt w README), potem `python3 -I arkusze.py <zrzuty> .`.
Uwaga: pełny `npm test` lokalnie ginie na SIGKILL (pamięć przy 35 językach); strażników uruchamiaj pojedynczo z `--test-concurrency=1`, a za dowód bierz CI.
