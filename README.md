# Technique Atlas — strona z pełną biblioteką ćwiczeń

Statyczna strona (GitHub Pages, 0 zł) z biblioteką ćwiczeń aplikacji Trening: opis, mięśnie, wskazówki techniki, częste błędy, zamienniki i animowana figura ruchu, w 35 językach.
Specyfikacja: [docs/54-strona-biblioteki.md](docs/54-strona-biblioteki.md) (z sekcją „Decyzje właściciela 26.10.2026”). Start razem z wersją 1.1 aplikacji.
**Stan: szkielet techniczny.** Do startu: `config.json` → `indeksowanie: false` (noindex,nofollow na każdej stronie, `robots.txt` „Disallow: /”, brak map witryny), Pages wyłączone, workflow publikacji tylko ręczny.

## Szybki start

```
npm run dane            # pobiera publiczne repo aplikacji w commicie z PIN.json → .cache/ (eksport + silnik figur); wymaga sieci i git
npm test                # strażnicy + generator (Node ≥ 22; bez zależności; wymaga wcześniejszego npm run dane)
npm run build           # dist/ — wszystkie ćwiczenia w językach z config.json (dziś pl, en: ok. 1500 stron, ok. 5 s)
```

## Przepływ danych (D5 A: dane nie są commitowane)

```
repo aplikacji (publiczne), commit z PIN.json
   │  npm run dane  (CI robi to samo przed testami i budowaniem)
   ▼
.cache/ (poza gitem)   app/ (klon płytki), tools/ (typescript + terser w wersjach aplikacji),
                       dane/  = atlas-<język>.json, figury.json, manifest.json, wzorce-zrodel.json   (scripts/strona/eksport.mjs aplikacji)
                       silnik/ = silnik figur v2 jako moduły ES (scripts/strona/silnik-build.mjs aplikacji)
   │  npm run build
   ▼
dist/  = HTML, CSS, SVG, moduły JS (figury, indeks nazw), mapy witryny   ← jedyne, co jest publikowane
```

- W repo jest tylko `PIN.json` (repo, ref, pełny skrót commitu). Zmiana wersji strony = zmiana tego pliku. Nie ma `dane/`, `atlas-*.json`, `figury.json` ani listy wzorców źródeł — pilnuje tego `tests/straznik-dane.test.mjs`.
- Dane pochodzą z RUNTIME aplikacji (te same moduły i pliki, które trafiają do paczki), nie z rejestru źródeł; eksport ma bramkę anonimowości na wzorcach `lib/sources.ts` (pobierana razem z danymi, używa jej też strażnik w tym repo).
- Zamienniki liczy ten sam kod co arkusz zamiany w aplikacji (top 3 dla nowego użytkownika, remisy po nazwie w języku strony; test parytetu po stronie aplikacji). Teksty interfejsu przy ćwiczeniu przychodzą z aplikacji w 35 językach; stałe teksty strony — `src/ui/<język>.json` (dziś pl i en).
- Lokalnie można użyć własnego checkoutu aplikacji na tym samym commicie: `npm run dane -- --app ../trening`.
- Zależność: wymaga, by repo aplikacji pozostało publiczne (R12 w specyfikacji).

## Struktura

`src/build.mjs` (orkiestracja, mapy witryny) · `src/pages.mjs` (szablony stron) · `src/taksonomia.mjs` (adresy filtrów, hreflang) · `src/sync-dane.mjs` · `src/ui/` (teksty stałe) ·
`assets/` (CSS, `figura-strona.js` — animacja, `szukaj.js` — filtry i wyszukiwarka) · `tests/` (strażnicy i generator) · `pomiary/` (wyniki pomiaru opcji renderowania figury).

## Decyzje techniczne

- **Generator:** własny skrypt Node bez zależności (vs Eleventy/Astro): brak łańcucha dostaw, prosty strażnik; ok. 25 tys. stron (709 × 35) szacunkowo ok. 1 min i 220 MB (zmierzone: 1544 stron w 5 s). SEO (sitemap, hreflang, canonical) zrobione ręcznie i pilnowane testami. Powrót do decyzji, gdy specyfikacja UI wymusi paginację lub wiele typów stron.
- **Figura v2 w przeglądarce:** silnik z aplikacji w przeglądarce (dane = 25 próbek klatek, 0,6–2 KB gz na figurę, silnik 9,6 KB gz) zamiast klatek SVG z budowania (360–2200 KB gz na figurę, 56 MB gz dla 87 figur). Pomiar i uzasadnienie: `pomiary/wyniki.md`. Test w aplikacji pilnuje zero rozjazdu rysunku. Obraz statyczny głównego widoku jest w HTML (bez JS, robot, „Ogranicz ruch”).
- **Indeksowanie:** `robotsFor` w `src/pages.mjs`: globalny wyłącznik (`indeksowanie`), język w `indeksujJezyki` (D3), własna treść ćwiczenia (D1). Mapy witryny: indeks + plik na język, tylko strony indeksowane.
- **Bez ciasteczek, pamięci przeglądarki, analityki i zasobów zewnętrznych;** CSP w `<meta>`: `default-src 'self'`. Jedyne połączenia przeglądarki: własne moduły danych (dynamiczny `import`).

## Strażnicy (`npm test`, workflow Tests)

- `straznik-zrodla` — brak nazw źródeł/organizacji (lista z aplikacji) w całym repo i w zbudowanej stronie; brak odwołań ogólnych w tekstach dla czytelnika.
- `straznik-sekrety` — klucze, tokeny, certyfikaty, e-maile (tylko noreply), UDID, pliki `.env/.p8/.p12`, workflowy bez sekretów, autorzy commitów neutralni.
- `straznik-analityka` — brak skryptów śledzących, pikseli, cookies, pamięci przeglądarki, wywołań sieciowych i zewnętrznych zasobów (kod i zbudowana strona).
- `straznik-dane` — w repo i w `dist/` brak danych z aplikacji (D5 A), PIN bez danych, workflowy pobierają dane przed testami.
- `build` — przypięcie do commitu, noindex/robots/mapy witryny (D1, D3), hreflang wzajemny i canonical, struktura stron, figura, budżety (HTML ≤ 20 KB, moduł figury ≤ 30 KB gz, indeks ≤ 25 KB gz), linki wewnętrzne, JSON-LD, CSP, baner App Store.

## Workflowy

- `tests.yml` — na każdy push: `npm run dane` (pobranie aplikacji), `npm test`, `npm run build`. Bez publikacji, bez sekretów.
- `pages.yml` — budowanie i wdrożenie na Pages, **tylko ręcznie** do startu z 1.1. Pierwszy przebieg po włączeniu Pages to przebieg dowodowy (lekcja L-001 aplikacji): sprawdzić na wdrożonej stronie noindex, `robots.txt`, figurę bez błędów w konsoli, adres.

## Otwarte

Lista odstępstw i brakujących elementów: sekcja „Stan wdrożenia szkieletu” w [docs/54](docs/54-strona-biblioteki.md) (m.in. 33 języków bez słownika stałych tekstów, sylwetka mięśni, strażnicy S3/S4/S6/S8, `es-419` i `sr` w hreflang, `slugs.lock.json`).
