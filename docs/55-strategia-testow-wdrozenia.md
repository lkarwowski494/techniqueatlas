# Strategia testów wdrożenia strony (Z-30): Z-31…Z-34, testy czerwone przed kodem

Stan: 27.11.2026 · rola 07-jakosc (build) · gałąź `strona/z30-testy` od `strona/integracja-start` @ 737359f · dane: eksport 1.1.1 (PIN.json, `npm run dane`).
Wejście: `docs/design/system/design-spec.md` (Z-12, „Arkusz”), `docs/teksty/szablony-stron.md` + `src/szablony.mjs` (Z-22), `docs/teksty/prawne/` (Z-20), `docs/teksty/ramka-w-aplikacji.md` (Z-21), `docs/nazwy/pl.json` (Z-24, recenzja Z-25), `docs/badanie-zasiegu-2026-11-27.md` (Z-06, A1–A15, B1–B9, KO-130), `docs/55-plan-startu.md`.
Zakres: tylko testy i ten dokument. `src/pages.mjs` i `assets/` bez zmian. Wdrożenie robią Z-31…Z-34.

Oczekujące: Z-33 8, Z-34 15

(Wiersz wyżej sprawdza `tests/z30-oczekujace.test.mjs`. Przy zdjęciu oznaczenia zmniejsz liczbę w tym samym commicie.)

## 1. Macierz możliwości środowiska (27.11.2026, kontener Linux)

| Metoda | Dostępna | Dowód |
|---|---|---|
| Node + `node --test` | tak | `node -v` → v22.23.5; `npm ci`, `npm run dane` → „dane: wersja 1.1.1, commit d9382db, języki: …35” |
| Build pl+en do katalogu tymczasowego | tak | `build({cfg:{jezyki:['pl','en'],indeksowanie:true}})` → 1544 strony, 9,8 s, 45 MB |
| Chromium + Playwright (axe) | tak, nieużyte w Z-30 | obraz kontenera; istniejące `dostepnosc.test`, `figura-przegladarka.test` |
| Porównanie zrzutów z `docs/design/system/wzorce-zrzuty/` | niedostępne w tym zadaniu | to audyt Z-40 (rola 04); tu tylko struktura HTML i CSS |
| GitHub (push, przebiegi CI) | tak | MCP GitHub; repo **publiczne** (`list_repos` → `visibility: public`) |
| Sieć do usług zewnętrznych (IndexNow, Search Console) | nie dotyczy | testy nie wysyłają niczego; wysyłka to Z-60/Z-62 |

## 2. Poziomy testów i mechanizm „oczekujących”

| Poziom | Co łapie | Gdzie | Pliki |
|---|---|---|---|
| Zbudowany `dist/` (build pl+en, przy Z-32/Z-33 też `de` jako język podglądu) | struktura stron, teksty, linki, pliki, robots.txt, mapy | Node, każdy push (tests.yml) | `tests/z31-wyglad`, `z32-nazwy`, `z33-prawne-ramka`, `z34-zasieg` |
| Jednostkowy na danych / źródłach | komplet nazw, klucze `src/ui/*.json` w 35 językach, brak przepisanej liczby dni, brak wysyłki IndexNow w `src/` | Node | jw. |
| Strażnik mechaniczny | oznaczenie oczekujące nie zostaje po wdrożeniu; liczby w tym dokumencie = kod | Node | `tests/z30-oczekujace.test.mjs` |
| Przeglądarka (axe, ruch) | dostępność i figura po zmianie wyglądu | Node + Chromium, każdy push | istniejące `dostepnosc.test`, `figura-przegladarka.test` (biegną dalej bez zmian) |
| Porównanie z wzorcem okiem | zgodność wyglądu z zrzutami | rola 04, audyt Z-40 | poza Z-30 |

**Oznaczenie testów czerwonych** (decyzja D-1 niżej): `test(nazwa, CZEKA('Z-3x', 'powód czerwieni'), fn)` z `tests/strona-html.mjs` = opcja `todo` w `node:test`. Test **biegnie** i w wyniku widać `# TODO` z powodem porażki, ale nie zmienia kodu wyjścia, więc `tests.yml` zostaje zielony. **Wdrażający** zadanie usuwa `CZEKA(...)` w commicie, który zazielenia test, i zmniejsza liczbę w wierszu „Oczekujące”. Gdy koordynator oznaczy zadanie `zrobione` w `docs/55-plan-startu.md`, a znacznik został, `z30-oczekujace.test.mjs` pada.
Testy, które **przechodzą dziś**, nie mają znacznika (strażnicy regresji przy wdrożeniu); w tabelach oznaczone „zielony (strażnik)”. Że potrafią paść, sprawdziłem mutacjami w kopii repo w scratchpadzie (pkt 6).

Uruchomienie: `node --test tests/z31-wyglad.test.mjs` (jeden plik, ok. 15 s) albo `npm test -- --test-concurrency=1` (całość po kolei; równolegle kontener ubija ciężkie buildy).
Procedura dla wdrażającego (08): testy istnieją, nie piszesz ich od nowa. Zdejmij `CZEKA` z testu, uruchom plik i zobacz czerwień na asercji, potem implementuj do zieleni. Błędny test (wyrocznia przeczy źródłu) zgłaszasz roli 07 z uzasadnieniem, nie dopasowujesz.

## 3. Wymaganie → test → plik (z wynikiem na 737359f + testy Z-30)

Wynik: przebieg pojedynczych plików `node --test tests/z3x-*.test.mjs` 27.11.2026, fragment komunikatu porażki.

### Z-31 wygląd wg design-spec (`tests/z31-wyglad.test.mjs`)

| Wymaganie (źródło) | Test | Wynik dziś |
|---|---|---|
| Tokeny kolorów, krojów, skali we wszystkich motywach (§3, `tokeny.css`) | `Z-31 tokeny` | czerwony — brakuje 70 z 70 deklaracji `tokeny.css` (pierwsza: `--bg:#eef1f4`) |
| Kroje Plex Cond. lokalnie, budżet = 4 pliki systemu (§3) | `Z-31 kroje i budżet` | czerwony — „brak ibm-plex-sans-condensed-latin-500-normal.woff2 w dist/assets” |
| Tytuły krojem systemowym w 8 językach (§3, §10.2) | `Z-31 kroje: … :lang()` | czerwony — brak reguł dla wszystkich 8 (ru, uk, bg, sr, el, ja, ko, zh-Hant) |
| Nagłówek z menu `<details>` (§5, §10.5, teksty §10.9) | `Z-31 nagłówek` | czerwony — strony pl bez `header.glowka` (np. `pl/equipment/barbell/`) |
| Nowe teksty interfejsu w 35 językach (§10.9) | `Z-31 nowe teksty interfejsu` | czerwony — „src/ui/pl.json: brak "Menu"” |
| Linia wymiarowa tempa: opis dla czytnika i odcinki z danych faz (§4) | `Z-31 linia wymiarowa tempa` | czerwony — każda strona pl z figurą (np. `bench-press`) |
| Stan bez figury: bez linii, `.bez-fig`, tabliczka zostaje (§4, §6) | `Z-31 stan bez figury` | czerwony — np. `pl/bench-dip` |
| Tabliczka z partią jako linkiem (§1, §5) | `Z-31 tabliczka rysunkowa` | czerwony — np. `pl/bench-press` |
| Wykaz jako tabela + stan pusty (§5, §6) | `Z-31 lista (wykaz)` | czerwony — „pl: brak table.wykaz” |
| Liczniki grup na stronie głównej (§6, §7) | `Z-31 strona główna języka` | czerwony — „muscles/shoulders: NaN ≠ 89” (89 = liczba z eksportu, zgodna z makietą `glowna.html`) |
| Linki wewnętrzne na adres kanoniczny (Z-06 A5, przypisane Z-31) | `Z-31 (Z-06 A5) linki wewnętrzne` | czerwony — 4490 linków `…/index.html` (ta sama liczba co pomiar badania Z-06) |
| CSP bez `style=` i skryptów w linii (§4 „bez stylu w atrybucie, CSP”) | `Z-31 CSP bez wyjątków` | zielony (strażnik) |
| Budżet HTML strony ćwiczenia ≤ 20 KB (docs/54:361) | istniejący `build.test.mjs:144` | zielony (bez nowego testu) |

### Z-32 nazwa lokalna + angielska (`tests/z32-nazwy.test.mjs`)

| Wymaganie (źródło) | Test | Wynik dziś |
|---|---|---|
| Komplet zrecenzowanych nazw pl (Z-24/Z-25) | `Z-32 nazwy pl` | zielony (strażnik) |
| h1 pl: `span.nazwa-pl` + `span.nazwa-en lang="en"` (makieta `cwiczenie.html`); nazwa różna tylko wielkością liter → sama angielska z `lang="en"` (szablony-stron 2.1) | `Z-32 h1 pl` | zielony po wdrożeniu Z-32 (27.11.2026; poprzednio: 708 stron (h1 tylko z nazwą angielską, bez `lang="en"`)) |
| Przypadek brzegowy „Face pull” (45 nazw) istnieje w danych | `Z-32 przypadek brzegowy` | zielony |
| en i język bez nazw (de): sama angielska | `Z-32 h1 en i język bez nazw` | zielony (strażnik: nazwa pl nie wycieka) |
| Każdy link do ćwiczenia na stronach pl z nazwą polską | `Z-32 każda strona pl: link` | zielony po wdrożeniu Z-32 (27.11.2026; poprzednio: 4622 linki) |
| Lista A–Z wg nazwy polskiej (Collator pl) | `Z-32 lista A–Z pl: kolejność` | zielony po wdrożeniu Z-32 (27.11.2026; poprzednio: kolejność wg nazwy angielskiej) |
| Okruszki i BreadcrumbList z nazwą polską | `Z-32 okruszki pl` | zielony po wdrożeniu Z-32 (27.11.2026; poprzednio: 663 strony) |
| Wyszukiwarka zna nazwę polską (D-4) | `Z-32 wyszukiwarka pl` | zielony po wdrożeniu Z-32 (27.11.2026; poprzednio: `bench-press` bez nazwy pl w `assets/idx/pl.js`) |
| Etykieta figury dla czytnika z nazwą polską (D-4) | `Z-32 opis rysunku pl` | zielony po wdrożeniu Z-32 (27.11.2026; poprzednio: 503 strony) |

### Z-33 strony prawne + stopka + ramka + akapit (`tests/z33-prawne-ramka.test.mjs`)

| Wymaganie (źródło) | Test | Wynik dziś |
|---|---|---|
| Wyrocznie wczytane z dokumentów (8 zdań A, 3 zdania W) | `Z-33 wyrocznie wczytane` | zielony |
| Stopka: polityka, regulamin, licencja strony; h1 i h2 jak w `docs/teksty/prawne/*.md`, `html lang` języka | `Z-33 strony prawne pl i en` | czerwony — „pl/index.html: brak linku do „Polityka prywatności strony Technique Atlas”” |
| Strony prawne w języku podglądu (de; 33 języki po Z-26/Z-27) | `Z-33 strony prawne w języku podglądu` | czerwony — 0 linków prawnych |
| Brak `{{wstawek}}`, `[DO KONSULTACJI]`, `[DO USTALENIA]` w dist | `Z-33 wstawki i znaczniki robocze` | zielony (strażnik; dziś trywialnie) |
| Ramka wariant A, 8 zdań w kolejności (Z-21) | `Z-33 ramka „w aplikacji”` | czerwony — 1416 stron bez `aside.ramka` |
| Ramka w języku podglądu, bez zdań pl/en | `Z-33 ramka w języku podglądu` | czerwony — 708 stron |
| `appStoreId` ustawione → plakietka w ramce (D8, §5) | `Z-33 appStoreId ustawione` | czerwony — 1416 stron (link sklepu dziś tylko w stopce) |
| `appStoreId` puste → ramka bez plakietki i bez `apple-itunes-app` | `Z-33 appStoreId puste` | czerwony — „brak ramki” |
| Akapit o wsparciu W1–W3, {dni} = 5 (Z-21 §2; `lib/access.ts:25` tagu 1.1.1) | `Z-33 akapit o wsparciu` | czerwony — 1542 strony |
| Liczba dni nie przepisana (wstawka `{dni}` w `src/`) | `Z-33 liczba dni nie jest przepisana` | czerwony — „src/: brak tekstu pl z {dni}” |
| Brak „darmowy” na stronach pl (F-12) | `Z-33 słowo „darmowy”` | zielony (strażnik) |

„Strażnik zdań ramki” z opisu Z-33 to kod wdrażającego; test wyżej jest jego testem akceptacyjnym (ramka = tabela dokumentu).

### Z-34 zasięg wg A1–A15 i Z-22 (`tests/z34-zasieg.test.mjs`)

Build z `indeksowanie=true` (bez warunków startu, jak `build.test`) pod zegarem przestawionym na 2031-01-01.

| Wymaganie (źródło) | Test | Wynik dziś |
|---|---|---|
| robots.txt wg KO-130 wariant B (A2, sekcja C) | `Z-34 robots.txt przy indeksowaniu` | czerwony — brak grup `GPTBot`, `ClaudeBot`, `CCBot`, `Applebot-Extended`, `__usage_ai-training`, `Google-Extended` |
| Roboty wyszukiwania bez `Disallow` (A1, B9) | `Z-34 (A1, B9)` | zielony (strażnik) |
| Bez `nosnippet`, `noarchive`, `nocache`, `data-nosnippet` (A3, A4) | `Z-34 (A3, A4)` | zielony (strażnik) |
| `<link rel="canonical">` na własny adres z „/” | `Z-34 link kanoniczny` | zielony (strażnik) |
| `WebSite` na `/`, nazwa = title = h1 = `og:site_name` (A6) | `Z-34 (A6) nazwa witryny` | czerwony — „brak WebSite na /” |
| Ikona PNG > 48 px, stała, nie `data:`; `apple-touch-icon.png` 180 (A7, §7) | `Z-34 (A7) ikona` | czerwony — `404.html`: `data:,` |
| `<img src alt>` rysunku ćwiczenia (A8) | `Z-34 (A8) obraz ćwiczenia` | czerwony — 1056 stron z figurą (pl+en) |
| `og:image` + `og:*` (A9, §7–§8) | `Z-34 (A9) podgląd` | czerwony — 1056 stron |
| Pliki podglądu 1200×630, budżet (A9, §8, D-5) | `Z-34 (A9, budżet §8)` | czerwony — brak `assets/podglad/<slug>.png` |
| Bez figury: `og:image` nie jest logo (A9; decyzja 4 spec. `[DO USTALENIA]`) | `Z-34 podgląd bez figury` | zielony (strażnik) |
| `WebPage` + `primaryImageOfPage` = `og:image` (A11) | `Z-34 (A11) WebPage` | czerwony — 1056 stron |
| Bez `HowTo`, `FAQPage`, `Course`… (B2) | `Z-34 (B2)` | zielony (strażnik) |
| Tytuł i opis ćwiczenia z szablonów (z nazwami pl), `pominOpis` → bez meta (A10, Z-22) | `Z-34 (A10, Z-22) tytuł i opis` | czerwony — 1416 stron (dziś „nazwa — witryna”, „nazwa: mięśnie”) |
| Przypadki brzegowe: `pominOpis` (pl 6, en > 0), tytuły > 60 z nazwą lokalną w całości (4) | `Z-34 przypadki brzegowe szablonów` | zielony |
| Strona główna, lista, filtry z szablonów (Z-22) | `Z-34 (Z-22) strona główna…` | czerwony — 124 strony |
| Opis witryny na `/` 50–160 znaków (A10) | `Z-34 (A10) strona /` | czerwony — „brak opisu” |
| Unikalne tytuły i opisy stron indeksowanych (A10) | `Z-34 (A10) unikalność` | czerwony — „Ćwiczenia: inne — Biblioteka ćwiczeń” dwa razy (partia i sprzęt; szablon Z-22 to rozwiązuje) |
| Krótka odpowiedź przy własnych wskazówkach (Z-22 2.3) | `Z-34 (Z-22 2.3)` | czerwony — 620 stron |
| Nagłówki-pytania tylko przy sekcjach z treścią (Z-22 2.4) | `Z-34 (Z-22 2.4)` | czerwony — 1416 stron |
| `<lastmod>` prawdziwy, bez `changefreq`/`priority` (A13, B8) | `Z-34 (A13)` | czerwony — „sitemap-pl.xml: brak lastmod” |
| Plik klucza IndexNow (A12) | `Z-34 (A12) IndexNow` | czerwony — 0 plików klucza |
| Wysyłka IndexNow nigdy z `src/` (A12) | `Z-34 (A12) wysyłka` | zielony (strażnik) |

Hreflang i `x-default`, `noindex` przy `indeksowanie=false` i reguła S6 mają już testy (`hreflang.test`, `build.test`); Z-30 ich nie powtarza.

## 4. Przypadki brzegowe i gdzie są

| Przypadek | Gdzie |
|---|---|
| Strona bez rysunku (180 ćwiczeń) | Z-31 stan bez figury; Z-34 podgląd bez figury (strażnik); Z-34 A8/A9/A11 sprawdzają tylko strony z figurą |
| Bez wskazówek (141) i wskazówki ogólne (257) | Z-34 krótka odpowiedź (tylko własne), nagłówki-pytania (brak pytania przy pustej sekcji) |
| `noindex` | Z-34: `pominOpis` nigdy na stronie indeksowanej; unikalność liczona tylko wśród indeksowanych |
| Język bez nazw lokalnych (de) | Z-32 h1 en/de (strażnik); Z-33 ramka i strony prawne w de |
| Pusty opis (`pominOpis`) | Z-34 tytuł i opis: brak `<meta name="description">` |
| Tytuł > 60 znaków (4 nazwy pl 61–69 znaków) | Z-34 przypadki brzegowe: tytuł = nazwa lokalna w całości |
| Nazwa pl = angielska poza wielkością liter (45) | Z-32 h1 pl: sama angielska z `lang="en"` |
| `appStoreId` puste i ustawione | Z-33 dwa testy |

## 5. CI i koszt

- `tests.yml` bez zmian: `npm test` uruchamia nowe pliki razem z resztą. Repo publiczne: „GitHub Actions usage is free for … public repositories that use standard GitHub-hosted runners” (docs.github.com/en/billing/concepts/product-billing/github-actions, zapis w prompcie roli z 18.10.2026; strona nie czytana ponownie dziś — przy publicznym repo koszt nie zależy od liczby minut).
- Dodatkowy czas: 5 buildów pl+en(+de) po ok. 10–15 s (pomiar lokalny 9,8 s dla pl+en). Ok. 45–70 MB na build, sprzątane przez `tmpDist()`.
- Testy oczekujące nie są bramką do wdrożenia; po zdjęciu znacznika stają się zwykłymi testami (bramka). `z30-oczekujace.test` jest bramką od razu.

## 6. Siła testów (czy strażnik potrafi paść)

Kopia repo w scratchpadzie (`…/scratchpad/mut`), cztery błędy naraz: `User-agent: Googlebot / Disallow: /` w robots.txt, `style="x" data-nosnippet` w `<main>`, „Pobierz darmową aplikację” w `src/ui/pl.json`. Wynik `node --test --test-name-pattern=…`: `not ok` dla `Z-31 CSP`, `Z-33 „darmowy”`, `Z-34 (A1, B9)`, `Z-34 (A3, A4)` (4/4 czerwone). Testy oczekujące są dziś czerwone, więc potrafią paść z definicji. Strażnika `z30-oczekujace` sprawdzono, ustawiając w kopii Z-31 na `zrobione` (pkt 7).
Nie sprawdzono mutacją: `Z-32 h1 en/de`, `Z-34 link kanoniczny`, `Z-34 (B2)`, `Z-34 podgląd bez figury`, `Z-34 (A12) wysyłka`.

## 7. Decyzje (analogia, do weta) i znaleziska

**Decyzje**
- **D-1 oznaczenie testów czerwonych:** `todo` z ID zadania w głównym zestawie (polecenie Z-30: „mechanizm jak w repo — todo/skip z ID zadania”) + strażnik `z30-oczekujace`. Odrzucone: `skip` (test nie biegnie, czerwieni nie widać), osobny katalog oczekujących (przenosiny plików, polecenie wskazało oznaczenie). Kompromis: czerwień jest w wyniku, ale nie blokuje; zapomnienie zdjęcia łapie strażnik dopiero przy `zrobione`.
- **D-2 zakres buildu:** pl+en (+de jako język podglądu w Z-32/Z-33), nie 35 języków. 35 języków sprawdzam na źródłach (klucze `src/ui/*.json`), a pełny build 35 mają już `jezyki-podglad.test` i `dostepnosc.test`. Powód: ok. 500 MB i minuty na build 35 języków na plik testu.
- **D-3 klasy CSS z makiet jako wyrocznia** (`glowka`, `menu-d`, `tabliczka`, `wymiar-s tNN`, `bez-fig`, `wykaz`, `pusto`, `ramka`, `wsparcie`, `odp`, `nazwa-pl`, `nazwa-en`): makiety zatwierdził właściciel (wzorzec zatwierdzony). Zmiana nazwy klasy przy wdrożeniu = zmiana testu w tym samym commicie z powodem.
- **D-4 nazwa polska w wyszukiwarce i w etykiecie figury:** analogia do h1 („nazwa w języku strony”); bez nazwy pl w indeksie użytkownik nie znajdzie „przysiadu”. Nazwa angielska zostaje w indeksie.
- **D-5 budżet podglądu:** ≤ 30 KB na plik, ≤ 10 MB razem (spec. §8: ok. 15 KB, ok. 8 MB; + ok. 25% zapasu). Liczba bez pomiaru wdrożenia — do zmiany po pierwszym buildzie Z-34.
- **D-6 `lastmod` bez daty budowania:** test przestawia zegar procesu na 2031-01-01; data z zegara byłaby ≥ 2031.
- **D-7 strony prawne szukane przez linki stopki**, nie przez adres (adresów nikt nie ustalił). Zgodność treści: h1 i wszystkie h2 z pliku `.md`.
- **D-8 test A5 (linki `index.html`) w Z-31**, jak przypisuje badanie Z-06 (ta sama linia `src/pages.mjs:27`); w Z-34 strażnik `rel=canonical`.

**Znaleziska i `[DO USTALENIA]`**
1. **Sprzeczność krótkiej odpowiedzi:** design-spec §5 i §10.7 — „tylko przy własnych wskazówkach … przy ogólnych i ich braku nie ma jej”; szablony-stron 2.3 — „Bez własnych wskazówek: `{zdanie mięśni} {zdanie sprzętu}`”. Test sprawdza tylko strony z własnymi wskazówkami. Do rozstrzygnięcia przez 04/koordynatora.
2. **Tytuł w makietach** (`cwiczenie.html`: „Przysiad … — Biblioteka ćwiczeń”) przeczy Z-22 pkt 1.5 (bez nazwy witryny). Test idzie za Z-22, bo ten opiera się na źródle (Google, title-link) i jest późniejszy.
3. **Źródło `lastmod`:** manifest eksportu nie ma daty (`app: {version, commit, catalogRev}`). Propozycja dla Z-34: data commitu z PIN.json zapisana w PIN.json przy przypięciu. Test nie zależy od źródła, sprawdza tylko „nie data budowania”.
4. **Klucz IndexNow:** skąd (propozycja: `config.json` → `indexNowKlucz`) i wyjątek w `straznik-sekrety` z powodem (A12).
5. **Podgląd ćwiczeń bez figury** — decyzja 4 specyfikacji, nadal `[DO USTALENIA]`; jest tylko strażnik zakazu logo.
6. **Wariant ramki:** test czyta tabelę „Wariant A”. Weto na B = zmiana jednej linii testu (`### Wariant A` → `### Wariant B`, `A\d` → `B\d`).
7. **Dziś zduplikowany tytuł** „Ćwiczenia: inne — Biblioteka ćwiczeń” (partia „inne” i sprzęt „inne”, pl) — wykrył test unikalności; szablon Z-22 ma już na to regułę, więc naprawi go wdrożenie Z-34.
8. Z-33 w de zależy od tłumaczeń Z-26/Z-27 (plan: Z-33 po Z-27).
