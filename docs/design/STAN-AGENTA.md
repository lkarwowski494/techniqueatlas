# Stan agenta — Z-10 (sesja AX)

Rola 04-studio-projektowe, tryb build, moduł strona-www · 27.11.2026 · gałąź `strona/z10-makiety` (od `strona/z00-z03-plan-dane-regula` @ cca7ab5).

- Zadanie 1 (inwentarz): zrobione — `docs/design/inwentarz-2026-11-27.md` + `inwentarz-2026-11-27/` (22 zrzuty).
- Zadanie 2 (3 kierunki): zrobione — `docs/design/makiety-2026-11-27/` (README z tabelą kierunków, rekomendacją A, testem generyczności, kontrastem, axe).
- Zadanie 3 (arkusze): zrobione — `docs/design/makiety-2026-11-27/arkusze/` (9 kierunek × ekran + 6 porównań).
- Zadanie 4: push i tests.yml na końcowym SHA (wynik w PRZEKAZANIU do koordynatora).

Następny krok: Z-11 — właściciel wybiera kierunek okiem (koordynator pokazuje arkusze). Po wyborze: rola 04 w Z-12 (system: porównanie ~5 krojów tytułów, tokeny, stany, ikona).

Odtworzenie: `npm ci && npm run dane`; nazwy pl z `git show origin/strona/z24-nazwy-pl:docs/nazwy/pl.json > /tmp/nazwy.json`; kroje `npm i @fontsource/{ibm-plex-sans-condensed,source-serif-4,courier-prime}@5` w katalogu roboczym; `node src/build.mjs --jezyki pl --out /tmp/dist` (figura); `node docs/design/makiety-2026-11-27/generuj.mjs /tmp/nazwy.json <node_modules/@fontsource> /tmp/dist`.
