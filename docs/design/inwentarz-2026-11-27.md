# Inwentarz obecnej strony (Z-10, zadanie 1)

Stan: 27.11.2026 · rola 04-studio-projektowe (build, moduł strona-www) · sesja AX.
Podstawa: gałąź `strona/z10-makiety` od `strona/z00-z03-plan-dane-regula` @ `cca7ab5` (polecenie wskazywało `0cbb5cf4`; `cca7ab5` to ta sama gałąź dwa commity dalej, bez zmian w `src/pages.mjs` i `assets/`). Dane aplikacji 1.1.1 (`d9382db`), budowanie `node src/build.mjs --jezyki pl,en,de`.

Ten inwentarz to treść i AS IS, nie wzorzec: kierunki w `makiety-2026-11-27/` nie powtarzają obecnego wyglądu (moduł strona-www, pkt 1).

## Zrzuty obecnego wyglądu

Katalog `docs/design/inwentarz-2026-11-27/`. Telefon 390×844, komputer 1440×900, skala 1, „Ogranicz ruch” włączone (strona pokazuje wtedy pozycje statyczne). Długie strony (lista, główna) przycięte do 2400 px wysokości.

| Ekran | Adres | Zrzuty |
|---|---|---|
| Wybór języka | `/` | `wybor-jezyka-{tel,komp}-jasny.png` |
| Główna języka | `/pl/` | `glowna-pl-{tel,komp}-{jasny,ciemny}.png` |
| Lista A–Z z filtrami | `/pl/exercises/` | `lista-pl-{tel,komp}-{jasny,ciemny}.png` |
| Strona jednego filtra | `/pl/muscles/legs/` | `filtr-miesien-pl-{tel,komp}-jasny.png` |
| Ćwiczenie z figurą | `/pl/exercises/back-squat/` | `cwiczenie-pl-{tel,komp}-{jasny,ciemny}.png` |
| Ćwiczenie, wersja en | `/en/exercises/back-squat/` | `cwiczenie-en-{tel,komp}-jasny.png` |
| Ćwiczenie bez figury | `/pl/exercises/ab-wheel/` | `cwiczenie-bez-figury-pl-{tel,komp}-jasny.png` |
| 404 | `/404.html` | `404-{tel,komp}-jasny.png` |

## Elementy (źródło: `src/pages.mjs`, `assets/site.css`)

Układ wspólny (`layout`, `src/pages.mjs:11-34`):
- Nagłówek: tylko ścieżka nawigacji (okruszki). **Brak marki, logo i menu** (plan Z-10: „szkielet bez nagłówka, marki, menu”).
- Link „Przejdź do treści”, CSP `default-src 'self'` (bez zewnętrznych fontów i obrazów), ikona `data:,`.
- Stopka: przycisk App Store (tylko gdy `appStoreId`; dziś puste), wiersz języków „Język: Polski · English · Deutsch”, „Prywatność · © Apps4Brew…”.
- Jedna kolumna `max-width: 44rem`, także na komputerze (1440 px: ok. 70% ekranu pusta).

Wygląd (`assets/site.css`, 18 linii): krój systemowy 16 px/1.55; kolory `--fg #1a1d23`, `--link #1a4fa0`, tło białe; ciemny wygląd przez `prefers-color-scheme` (`--bg #14171c`). Chipy (pigułki) z ramką 1 px, cele 44 px, fokus 3 px. Kolory figury (`--f-*`) i stopnie mięśni sylwetki (`--mm-l1…l4`, niebieskie) przychodzą z aplikacji i zostają w każdym kierunku.

Ekrany i stany:
- **Główna języka** (`homePage`, `:75`): H1 „Biblioteka ćwiczeń”, licznik „708 ćwiczeń…”, wyszukiwarka (ukryta bez JS), link „Wszystkie ćwiczenia”, trzy grupy chipów (partie 11, sprzęt 6, rodzaj ruchu 43), lista „Podstawowe ćwiczenia” (305 pozycji nie-niszowych w jednym ciągu).
- **Lista** (`listPage`, `:98`): H1, trzy `select` (partia, sprzęt, rodzaj ruchu) i „Wyczyść filtry” (tylko z JS), komunikat „Brak ćwiczeń dla tych filtrów”, 708 pozycji: nazwa + „partia · sprzęt” drobnym drukiem. Brak licznika wyników i liter A–Z.
- **Filtr** (`filterPage`, `:112`): H1 „Ćwiczenia: nogi”, lista bez filtrów.
- **Ćwiczenie** (`exercisePage`, `:167`): H1 nazwa (dziś angielska także w pl), figura (dwie pozycje statyczne + przyciski „Wznów animację”, „Pokaż częsty błąd: …”), fazy z czasem („Opuszczanie 2 s · Pauza · Wstawanie 1 s”), Ustawienie, Ruch, sylwetka przód/tył, mięśnie główne/pomocnicze, rola mięśni, Wskazówki, Czego unikać, Potrzebny sprzęt, Zamienniki, zastrzeżenie medyczne.
- Stany ćwiczenia w danych pl 1.1.1 (708): figura 528; własne wskazówki 310 (z figurą 263); wskazówki ogólne ruchu 257 (nota „Ogólne wskazówki dla tego ruchu”); bez wskazówek 150; zdania o roli mięśni 513.
- **Wybór języka** i **404**: H1 + chipy języków.

## Czego brakuje względem Z-10 / planu

| Element | Dziś | Wymaganie |
|---|---|---|
| Marka i menu w nagłówku | brak | Z-10 |
| Nazwa lokalna + angielska | tylko angielska (pl też) | P-7, Z-24/Z-32 |
| Ramka „w aplikacji” | brak | P-2, tekst Z-21 wariant A |
| Akapit o wsparciu | brak | P-6, Z-21 |
| Krótka odpowiedź pod tytułem | brak | Z-22/Z-34 (szablon później; makiety pokazują miejsce) |
| Układ na komputerze | jedna wąska kolumna | do decyzji w kierunku |
| Hierarchia na stronie ćwiczenia | sekcje o równej wadze, figura bez ramy, przyciski błędów jako pełne szerokie pola | P-9 „czysta, czytelna i świetnie wykonana” |

## Obserwacje (usterki AS IS, dla Z-12)
1. Przyciski „Pokaż częsty błąd: …” zawierają całe zdanie błędu, na telefonie łamią się w dwie linie i wyglądają jak pola formularza (`cwiczenie-pl-tel-jasny.png`).
2. Okruszki na telefonie łamią się w dwie linie; ostatnia pozycja powtarza H1.
3. Główna: 43 chipy „Rodzaj ruchu” tworzą ścianę etykiet bez hierarchii (`glowna-pl-komp-ciemny.png`).
4. Sylwetka stoi w środku sekcji „Ruch” bez nagłówka „Mięśnie”.
5. Ciemny wygląd: `--accent #e8dcc0` (beż) nieużywany w tekście, tylko w figurze.
