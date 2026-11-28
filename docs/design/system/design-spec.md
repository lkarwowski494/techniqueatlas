# Specyfikacja wyglądu strony — system „Arkusz” (Z-12)

27.11.2026 · rola 04-studio-projektowe (build, moduł strona-www) · sesja BD · gałąź `strona/z10-makiety`.
Kierunek: **A „Arkusz”**, wybór właściciela „A „Arkusz” (Rekomendowane)” (27.11.2026, 17:05 UTC; `../makiety-2026-11-27/README.md`).
Zakres: tylko `docs/design/`. Wdrożenie do `src/` i `assets/` robią Z-31 (szablony, CSS) i Z-33 (pliki ikony, podglądu, krojów).

## 1. Idea w jednym zdaniu
Strona ćwiczenia to arkusz rysunku technicznego: figura jest „rysunkiem schematycznym”, pod nią **linia wymiarowa tempa** pokazuje z danych ruchu, ile sekund trwa każda faza, a **tabliczka rysunkowa** zbiera klasyfikację ćwiczenia jako linki.

## 2. Pliki

| Plik | Co to |
|---|---|
| [`tokeny.css`](tokeny.css) | zmienne CSS: kolory (jasny, ciemny, zwiększony kontrast w obu), kroje, skala tekstu, odstępy 4 px, linie, promienie, czasy |
| [`komponenty.css`](komponenty.css) | komponenty wyłącznie na tokenach; propozycja zawartości `assets/site.css` |
| [`fonty.css`](fonty.css), [`fonty/`](fonty/) | IBM Plex Sans Condensed 500 i 600 (latin, latin-ext; OFL), pliki lokalne |
| [`szablony/`](szablony/) | makiety HTML z prawdziwymi danymi pl 1.1.1 (otwierać przez serwer: `python3 -m http.server 8123` w `docs/design/system`) |
| [`kontrast.md`](kontrast.md) | tabela z `kontrast.mjs`: 64 pary w 4 wariantach, 0 poniżej progów |
| [`wzorce-zrzuty/`](wzorce-zrzuty/) | zrzuty wzorcowe (linia bazowa audytu SP-13), arkusze `arkusz-*.png`, wyniki axe `sprawdzenie-*.json` |
| [`ikona/`](ikona/) | znak SVG (jasny, ciemny), PNG 96/192/512, `apple-touch-icon.png` 180, arkusz kontrolny, warianty znaku |
| [`podglad/`](podglad/) | szablon obrazka podglądu i dwa przykłady PNG 1200×630 |
| [`kroje/`](kroje/) | arkusz 5 krojów tytułowych i jego generator |
| `generuj.mjs`, `zrzuty.cjs`, `arkusze.py` | odtworzenie szablonów, zrzutów (z axe) i arkuszy — polecenia w §11 |

## 3. Tokeny (skrót; wartości w `tokeny.css`)

| Token | Jasny | Ciemny | Rola |
|---|---|---|---|
| `--bg` | `#eef1f4` | `#0b1016` | stół: tło poza arkuszem |
| `--sheet` | `#ffffff` | `#121922` | arkusz: tło treści, pól, przycisków |
| `--ink` | `#18202b` | `#e3e9f0` | tusz: tekst, ramka arkusza, linie główne |
| `--muted` | `#4f5b6b` | `#a3afbf` | tekst drugorzędny |
| `--rule` | `#6b7686` | `#7d8a9c` | linia cienka: ramki pól, podział tabliczki |
| `--hair` | `#c9d0d9` | `#2c3644` | separator wierszy (dekoracyjny) |
| `--accent` | `#1d4ea3` | `#8fb3ff` | jedyny akcent: linki, fokus, linia wymiarowa |
| `--accent-bg` | `#e8eef9` | `#1a2639` | tło krótkiej odpowiedzi |
| `--kontrola` | `#5d6878` | `#7d8a9c` | ramka przerywana przycisków częstych błędów |

- **Zwiększony kontrast** (`prefers-contrast: more`): ciemniejszy tekst drugorzędny i linie, separatory ≥ 3:1, grubsza linia cienka. **Wymuszone kolory**: komponenty rysują ramki kolorem tekstu; figura i sylwetka zachowują kolory (`forced-color-adjust: none`, jak dziś).
- **Kroje:** tytuły IBM Plex Sans Condensed 600 (nazwa EN i etykiety 500), treść krojem systemowym. W `ru, uk, bg, sr, el, ja, ko, zh-Hant` tytuły krojem systemowym (krój nie ma podstawowej cyrylicy U+0400–045F ani greki; sprawdzone w `unicode-range` pakietu). Waga: 2 pliki latin po ok. 20 KB + 2 latin-ext po ok. 16 KB, ładowane według `unicode-range`.
- **Skala:** baza 106,25% (17 px przy domyślnych 16 px i rośnie z ustawieniem przeglądarki); `h1` `clamp(1.9rem…2.9rem)`, `h2` `clamp(1.15rem…1.3rem)`, treść 1rem, drobne .85rem, etykiety .8rem (najmniejszy tekst 13,6 px). Interlinia treści 1,55, tytułów 1,1. Bez odmian cienkich.
- **Odstępy:** jednostka 4 px (`--o1` … `--o12`); na telefonie wcięcia arkusza i figury w px, żeby przy dużym tekście nie zjadały wiersza.
- **Linie i promienie:** hierarchia grubości zamiast cieni: 1,5 px tusz (ramki główne), 1 px (podziały), 2 px akcent (linia wymiarowa). Promień 0 wszędzie, 2 px tylko na kontrolkach.
- **Ruch:** interfejs bez animacji przejść; ruch ma tylko figura i respektuje „Ogranicz ruch” (bez zmian względem `assets/figura-strona.js`).

## 4. Element firmowy: linia wymiarowa tempa
- **Dane:** `figure.phases` z eksportu aplikacji, fazy z czasem > 0. Długość odcinka = czas fazy; w danych występuje 5 wartości (0,5; 1; 2; 2,5; 4 s) → klasy `.t5 .t10 .t20 .t25 .t40` (bez stylu w atrybucie, CSP). 528 ćwiczeń z figurą, 28 układów faz.
- **VoiceOver / czytnik:** `role="img"` + `aria-label` „Tempo powtórzenia: Opuszczanie 2 s, Wstawanie 1 s, Pauza 0,5 s; razem 3,5 s na powtórzenie”.
- **Wąski kontener** (zapytanie kontenera < 26rem), gdy któryś odcinek ma < 20% czasu (najczęstszy układ ma dwie pauzy po 12,5%): nazwy faz chowają się, krótkie odcinki tracą jednostkę, a pełna sekwencja pojawia się tekstem pod linią. Bardzo wąsko (< 15rem, duży tekst): zostaje sama linia z proporcjami i sekwencja tekstem.
- **Stan bez figury** (180 z 708): linii nie ma i nie ma pustego miejsca po niej; tabliczka zostaje, kolumna figury znika (`.uk3.bez-fig`).

## 5. Komponenty (katalog: [`szablony/komponenty.html`](szablony/komponenty.html))

| Komponent | Systemowy / własny | Uwagi |
|---|---|---|
| Nagłówek: znak, nazwa, menu, język | własny układ, zwykłe linki | menu w linii od 960 px; niżej `<details>` „Menu” (bez JS), panel pod nagłówkiem, kolejność fokusu naturalna |
| Arkusz (podwójna ramka) | własny | jedyny kontener strony; bez kart i cieni |
| Okruszki | zwykła lista linków | na telefonie bez ostatniego elementu (jest w `h1`) |
| Tabliczka rysunkowa | własny (`dl`) | 2 kolumny; jedna kolumna w kontenerze < 18rem (rośnie z tekstem) |
| Krótka odpowiedź | własny | tylko przy własnych wskazówkach (Z-22); przy ogólnych i ich braku nie ma jej |
| Nota „wskazówki ogólne” | własny | tekst z danych (`generalNote`), linia z lewej w kolorze `--rule` |
| Figura + linia wymiarowa + sterowanie | figura z aplikacji, reszta własna | przycisk wciśnięty: odwrócone kolory; błąd do sprawdzenia: ramka przerywana |
| Przycisk, pole, wybór | natywne `button`, `input`, `select` | cel ≥ 44 px, fokus 3 px akcentem |
| Wykaz (lista ćwiczeń) | tabela HTML | na telefonie wiersze ułożone w stos |
| Stan pusty | własny | ramka przerywana `--rule`, tytuł, zdanie, przycisk wyjścia |
| Ramka „w aplikacji” | własny | jak w Z-10; plakietka: tylko grafika Apple po nadaniu `appStoreId` |
| Stopka | zwykłe linki | wsparcie, języki, prawne |

## 6. Ekrany i stany (wszystkie w `szablony/`, zrzuty w `wzorce-zrzuty/`)

| Ekran / stan | Plik | Przykład z danych |
|---|---|---|
| Ćwiczenie (typowe) | `cwiczenie.html` | back-squat: własne wskazówki, figura, tempo 3 fazy |
| Wskazówki ogólne (257 ćwiczeń) | `cwiczenie-wskazowki-ogolne.html` | decline-bench-press: nota, „Wskazówki” i „Czego unikać”, tempo 4 fazy z pauzami |
| Bez figury (180) | `cwiczenie-bez-figury.html` | bench-dip: tekst w prawej kolumnie, mięśnie w lewej |
| Bez wskazówek (141) | `cwiczenie-bez-wskazowek.html` | sissy-squat: mięśnie, sprzęt, zamienniki w trzech kolumnach |
| Ćwiczenie w cyrylicy | `cwiczenie-ru.html` | ten sam przysiad po rosyjsku: tytuły krojem systemowym, jednostka „с” |
| Strona główna języka | `glowna.html` | liczniki partii, sprzętu, rodzajów ruchu |
| Lista z filtrem | `lista.html` | partia: nogi (103 z 708) |
| Pusty wynik filtra | `lista-pusta.html` | łydki + linki + Przysiady = 0 |
| 404 | `404.html` | teksty języka domyślnego, lista 35 języków |
| Wybór języka (`/`) | `jezyki.html` | 35 języków, każdy z `lang` |
| Menu otwarte (telefon) | zrzut `menu-otwarte-390-*.png` | — |

Strony jednego filtra (`/<język>/muscles|equipment|movements/<id>/`) używają szablonu listy z ustawionym filtrem.

## 7. Strona AS IS → TO BE (adresy bez zmian)

| Adres | AS IS (dziś) | TO BE |
|---|---|---|
| `/` | `h1` + lista języków jako chipy | arkusz, lista 35 języków w kolumnach |
| `/<język>/` | nagłówek z okruszkami, chipy | nagłówek z menu, arkusz: tytuł, licznik, szukaj, grupy z licznikami |
| `/<język>/exercises/` | lista A–Z z filtrami | arkusz: szukaj, filtry, wynik, wykaz (tabela) |
| `/<język>/muscles|equipment|movements/<id>/` | lista jednego filtra | jak wyżej, filtr ustawiony |
| `/<język>/exercises/<slug>/` | nazwa, figura, sekcje jedna pod drugą | arkusz: tabliczka, krótka odpowiedź, figura z linią wymiarową, dwie kolumny od 960 px, ramka „w aplikacji” |
| `/404.html` | `h1` + chipy języków | arkusz z kodem 404 i listą języków |
| ikona | `<link rel="icon" href="data:,">` | PNG; propozycja adresów: `/apple-touch-icon.png` (180), `/assets/favicon-96.png`, `/assets/favicon-192.png` — stałe (Google: „The favicon URL must be stable”) |
| podgląd | brak `og:image` | `/assets/podglad/<slug>.png` 1200×630 (jeden plik na ćwiczenie, wspólny dla języków) |
| `robots.txt`, mapy witryny, `CNAME` | bez zmian | bez zmian |

## 8. Ikona i podgląd
- **Znak:** linia wymiarowa (dwa znaczniki, strzałki), biały na kafelku w kolorze akcentu; ciemny wariant: akcent ciemny na arkuszu ciemnym. Wybrany wariant A z trzech (`ikona/warianty-znaku.png`): B i C (łańcuch 2:1) zlewają się w 16–32 px. Kąty proste jak w całym systemie.
- **Rozmiary:** Google zaleca ikonę kwadratową „larger than 48x48px”, format PNG lub ICO (developers.google.com/search/docs/appearance/favicon-in-search, aktualizacja 2026-10-27, odczyt 27.11.2026) → 96 i 192 px; iOS: `apple-touch-icon.png` 180 px.
- **Podgląd (A9):** obie pozycje figury na arkuszu z podwójną ramką, motyw jasny, bez tekstu. PNG w palecie 64 kolorów: 13 KB (przysiad), 13 KB (wyciskanie poziome). Budżet: ok. 528 plików × ok. 15 KB ≈ 8 MB, wspólne dla 35 języków. `og:image:alt` = nazwa ćwiczenia w języku strony.

## 9. Dostępność (sprawdzone, nie ocenione okiem)
- Kontrast: [`kontrast.md`](kontrast.md) — 64 pary, 4 warianty, 0 poniżej progów 4,5 (tekst) i 3 (linie, fokus, grafika z danymi).
- axe-core 4.13 (`wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice`): 0 naruszeń na 70 widokach (3 ekrany × 5 szerokości × 2 motywy; 8 stanów × 2 szerokości × 2 motywy; 2 ekrany ze zwiększonym kontrastem × 2 × 2). Wyniki: `wzorce-zrzuty/sprawdzenie-*.json`.
- Brak przewijania poziomego na wszystkich widokach; przy tekście 200% (WCAG 1.4.4) na 320 i 390 px też 0 px (pomiar Playwright).
- Cele ≥ 44 px, fokus 3 px akcentem, `lang="en"` na nazwach angielskich, nazwy faz i tempo tekstem dla czytnika, nic tylko kolorem (stan przycisku: wypełnienie i ramka, nie kolor).

## 10. Decyzje (analogia, do weta)
1. **Krój tytułów zostaje IBM Plex Sans Condensed** (arkusz `kroje/porownanie-krojow.png`, 5 krojów). Różnice są małe, więc arkusz nie idzie do koordynatora. Pomiar długich nazw przy 30 px: szerokość względem Plex: Barlow −5%, Saira −2%, Archivo Narrow −8%, Overpass +10%; na 320 px najdłuższa nazwa ma 5 wierszy (Archivo 4, Overpass 6). Cyrylicę z kandydatów ma tylko Overpass, ale jest najszerszy. Plex: bez zmiany względem zatwierdzonej makiety, czytelne cyfry tabelaryczne. Odrzucone: Barlow (charakter tablic drogowych Kalifornii — „highway signs, busses, and trains”, README Barlow), Overpass („Inspired by Highway Gothic”, README Overpass; za szeroki), Archivo Narrow („reminiscent of late nineteenth century”, README Archivo; drukarski, nie techniczny), Saira (prawie nieodróżnialna od Plex).
2. **Tytuły w cyrylicy, grece i CJK krojem systemowym** (8 języków), zamiast mieszania znaków w słowie.
3. **Ikona: znak A** na kafelku akcentu (czytelność 16–32 px przed kodowaniem proporcji 2:1).
4. **Podgląd dla 180 ćwiczeń bez figury** `[DO USTALENIA]`: propozycja — sylwetka mięśni z aplikacji (dane ćwiczenia, bez tekstu); alternatywa — brak `og:image`. Logo odpada (A9: „Avoid using a generic image (for example, your site logo)”).
5. **Menu na telefonie przez `<details>`**, w linii od 960 px (na 768 px pięć pozycji wypychało przełącznik języka).
6. **Symbol sekundy jako tekst tłumaczenia** (`s`, w cyrylicy `с`): `Intl.NumberFormat` daje formy niespójne (pl „sek.”, en „2.5s”).
7. **Krótka odpowiedź tylko przy własnych wskazówkach**, bez nowych słów (zgodnie z Z-22).
8. **Ciemne tło `#0b1016`** to przyciemniona czerń z listy kalibracji: zostaje jako granatowa czerń arkusza w ciemnym motywie (Z-10, przyjęte z kierunkiem).
9. **Nowe teksty interfejsu** do `src/ui/<język>.json` (35 języków, Z-31): „Menu”, „Menu główne”, „Tempo powtórzenia”, „razem {t} na powtórzenie”, symbol sekundy, etykiety tabliczki (Nazwa, Partia, Sprzęt, Rodzaj ruchu), „Mięśnie”, „Częste błędy:”, „Jak zrobić to ćwiczenie?” (Z-40 011, analogia, do weta: tekst stały zamiast wzorca z nazwą ćwiczenia — formy nazwy ćwiczenia w 35 językach byłyby ryzykowne w przekładzie; szablony w `szablony/*.html` pokazują nazwę jako przykład wzorca, nie obowiązek), zdanie stanu pustego („Zmień albo wyczyść filtry, żeby zobaczyć ćwiczenia.”), etykieta „Język: … Zmień język”.

## 11. Odtworzenie
```
npm ci && npm run dane
git show origin/strona/z24-nazwy-pl:docs/nazwy/pl.json > <scratch>/nazwy.json
npm i --prefix <scratch>/f @fontsource/ibm-plex-sans-condensed@5
node src/build.mjs --jezyki pl,en --out <scratch>/dist
node docs/design/system/generuj.mjs <scratch>/nazwy.json <scratch>/dist <scratch>/f/node_modules/@fontsource
node docs/design/system/kontrast.mjs > docs/design/system/kontrast.md
(cd docs/design/system && python3 -m http.server 8123 &)
node docs/design/system/zrzuty.cjs <scratch>/wz/klucz 320,390,768,1024,1440 cwiczenie,glowna,lista light,dark no-preference 1
node docs/design/system/zrzuty.cjs <scratch>/wz/stany 390,1440 cwiczenie-wskazowki-ogolne,cwiczenie-bez-figury,cwiczenie-bez-wskazowek,cwiczenie-ru,lista-pusta,404,jezyki,komponenty light,dark no-preference 1
node docs/design/system/zrzuty.cjs <scratch>/wz/kontrast 390,1440 cwiczenie,lista light,dark more 1
python3 -I docs/design/system/arkusze.py <scratch>/wz docs/design/system/wzorce-zrzuty
node docs/design/system/ikona/generuj-ikone.cjs pliki ; node docs/design/system/podglad/generuj-podglad.cjs <plik.png>
```
Menu otwarte: `node docs/design/system/zrzut-menu.cjs <katalog>`. Zrzuty: Chromium w Linuksie, skala 1, „Ogranicz ruch”; krój systemowy treści renderuje się tu jako Inter (na Apple będzie SF). Pliki > 300 KB są pocięte na pasy (strażnik repo).

## 12. Otwarte
- `[DO USTALENIA]` nazwa aplikacji w ramce („Trening”) i plakietka App Store (po `appStoreId`).
- `[DO USTALENIA]` podgląd dla ćwiczeń bez figury (decyzja 4).
- Tłumaczenia nowych tekstów (decyzja 9) i symbolu sekundy w 35 językach — Z-31 przez słownik terminów.
- Brak testu z ludźmi (opcjonalnie test pięciosekundowy z 3–5 osobami, ok. 1 h właściciela).
- Po wdrożeniu (Z-31/Z-33) ta rola wraca w trybie `audit` i porównuje zbudowane strony ze `wzorce-zrzuty/`.
