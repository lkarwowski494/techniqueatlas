# Z-10: trzy kierunki wyglądu strony (makiety)

27.11.2026 · rola 04-studio-projektowe (build, moduł strona-www) · sesja AX. Inwentarz AS IS: `../inwentarz-2026-11-27.md`.
Status: **do wyboru właściciela okiem (Z-11)**. Decyzje w tym pliku są „analogią, do weta”.

## Co jest w katalogu

| Plik | Co to |
|---|---|
| `a-arkusz/`, `b-plansza/`, `c-karta/` | makiety HTML: `cwiczenie.html`, `glowna.html`, `lista.html` (otwierać przez serwer, np. `python3 -m http.server` w `docs/design/`) |
| `zasoby/` | wspólna baza CSS, figura i sylwetka przysiadu (wyrenderowane z silnika aplikacji 1.1.1), kroje OFL (woff2) |
| `arkusze/<k>-<ekran>.png` | **arkusz na kierunek × ekran** (9): komputer jasny i ciemny + telefon jasny i ciemny |
| `arkusze/porownanie-<ekran>-{komputer,telefon}.png` | ten sam ekran w A, B, C obok siebie (6) |
| `zrzuty/<k>-<ekran>-<tel|komp>-<jasny|ciemny>-<i>z<n>.png` | pełne zrzuty w pełnej rozdzielczości (skala 2: 780 / 2880 px szerokości), pocięte na pasy |
| `kontrast.md` | tabela kontrastu z `kontrast.mjs` (54 pary, 0 poniżej progu) |
| `generuj.mjs`, `kontrast.mjs`, `arkusze.py` | odtworzenie makiet, kontrastu i arkuszy |

Pasy zamiast jednego pliku: strażnik `tests/straznik-dane.test.mjs` nie przepuszcza plików > 300 KB, a pełny zrzut 2× ma do 1,3 MB. Każdy pas ma pełną rozdzielczość (paleta 256 kolorów, jak zrzut tekstu). Pełne pliki PNG mogę wygenerować poza repo na prośbę.

## Treść makiet (wspólna dla kierunków)

- Ćwiczenie: przysiad ze sztangą na plecach (`back-squat`), dane pl 1.1.1; nazwa pl z gałęzi `strona/z24-nazwy-pl` (`docs/nazwy/pl.json`), angielska z danych (P-7).
- Ramka „w aplikacji”: wariant A z `docs/teksty/ramka-w-aplikacji.md` (gałąź `strona/z21-ramka-akapit` @ 34d87bd3), 8 zdań jako lista; akapit o wsparciu W1–W3 w stopce (dni = 5).
- Krótka odpowiedź: pytanie „Jak zrobić …?” + pierwsze zdanie Ustawienia + pierwsze zdanie Ruchu, bez nowych słów. To tylko miejsce i forma; szablon robi Z-22.
- Nagłówek: znak + „Technique Atlas / Biblioteka ćwiczeń”, menu (Ćwiczenia, Partie mięśniowe, Sprzęt, Rodzaj ruchu, Aplikacja), język; na telefonie przycisk „Menu” (rozwinięcie w Z-12).
- Lista: stan z filtrem „partia: nogi” (103 z 708), pierwsze 24 pozycje.
- Figura i sylwetka mają kolory aplikacji (`--f-*`, `--mm-*`) bez zmian w każdym kierunku; zrzuty z „Ogranicz ruch” (pozycje statyczne).
- Ramka i krótka odpowiedź są na stronie ćwiczenia; na głównej i liście ich nie ma, bo tekst ramki mówi o „tym ćwiczeniu” (interpretacja polecenia, do weta).

## Kierunki

| | A „Arkusz” | B „Plansza” | C „Karta” |
|---|---|---|---|
| Przedmiot z dziedziny | arkusz rysunku technicznego (figura już jest „rysunkiem schematycznym”) | plansza atlasu anatomicznego | karta katalogu biblioteki („Biblioteka ćwiczeń”) |
| Element firmowy i dane | **linia wymiarowa tempa** pod figurą: fazy i sekundy z danych ruchu (528 ćwiczeń), opis dla czytnika „Tempo powtórzenia: …; razem 3,5 s”; **tabliczka rysunkowa**: nazwa EN, partia, sprzęt, rodzaj ruchu jako linki | **legenda obciążenia** przy sylwetce: stopnie mięśni z danych (612 ćwiczeń), opis tekstem „główne: …, pomocnicze: …” | **sygnatura** partia / sprzęt / rodzaj ruchu na karcie i przy każdej pozycji listy; **karty przewodnie liter** na liście |
| Układ ćwiczenia (komputer) | arkusz w podwójnej ramce; figura + mięśnie lewa kolumna, tekst prawa | dużo bieli, figura na jasnym polu, pionowa linia między kolumnami, ramka w prawej kolumnie | biała karta na tle szuflady; dwa rzędy: figura | technika, mięśnie | sprzęt i zamienniki |
| Paleta (jasny) | tło `#eef1f4`, arkusz `#ffffff`, tusz `#18202b`, akcent tusz niebieski `#1d4ea3` | `#ffffff`, tusz `#1b2533`, pole figury `#f3f6fa`, akcent = stopień 4 sylwetki `#1f5fd1` | szuflada `#e4e9e6`, karta `#ffffff`, tusz `#1a211d`, akcent zielony `#17604a` |
| Krój tytułów | IBM Plex Sans Condensed 600 (wąskie pismo techniczne, OFL) | Source Serif 4 600 (liternictwo plansz, OFL) | Courier Prime 700 (karta z maszyny do pisania, OFL) |
| Treść | krój systemowy | krój systemowy | krój systemowy |
| Kształty | kąty proste, linie 1,5 px, przerywana ramka przycisków błędów | pigułki, promień 6 px pola figury | promień 4 px, zakładki liter |
| Najmocniejszy argument | jedyny, w którym ekran pokazuje dane, których dziś nie widać jako grafiki (tempo); tabliczka daje 4 linki wewnętrzne na górze każdej strony | najspokojniejszy i najbardziej „czysty” (P-9); mięśnie są tym, czego ludzie szukają obok techniki | najlepsza nawigacja po 708 pozycjach (litery, sygnatura = filtry); najbardziej odróżnia się od stron fitness |
| Ryzyko | dwie ramki i linie mogą wyglądać „technicznie zimno”; 180 ćwiczeń bez figury traci linię wymiarową | na telefonie legenda dopiero pod techniką; serif na tytułach bywa „magazynowy” | krój maszynowy w długich nazwach jest szeroki (łamie się w 2–3 linie); ryzyko „retro” |

**Rekomendacja: A „Arkusz”** (do weta). Powód funkcjonalny, nie gust: element firmowy niesie dane ruchu, których użytkownik potrzebuje przy wykonaniu (ile sekund opuszczać, ile wstawać), metafora wynika z tego, co strona już pokazuje (rysunek schematyczny), a tabliczka porządkuje klasyfikację ćwiczenia w jednym miejscu. Do przeniesienia z innych kierunków przy łączeniu: litery A–Z z C na liście, legenda z B przy sylwetce.

## Test generyczności (wykonany)

Karty kontrolne napisane przed porównaniem (bez patrzenia na karty kierunków):
- (a) strona ćwiczeń bez wiedzy o dziedzinie: ciemne tło, akcent neonowa zieleń/pomarańcz, krój grotesk pogrubiony wersalikami, zdjęcie/ikona hantla w nagłówku, karty z cieniem i promieniem 12–16 px, ekran „duża liczba + etykieta”, fade-up na kartach.
- (b) inna dziedzina, ten sam przepływ (biblioteka przepisów): kremowe tło, szeryf + terakota, kafelki ze zdjęciem, chipy kategorii, numeracja kroków 01/02/03.

| Pole | Karta (a) | Karta (b) | A | B | C | Zmiana |
|---|---|---|---|---|---|---|
| Paleta | ciemne + neon | krem + terakota | szary arkusz + tusz | biel + błękit sylwetki | szałwiowa szuflada + zieleń | brak pokrycia; C zielony, nie neon (`#17604a`) |
| Krój tytułów | grotesk wersalikami | szeryf kontrastowy | wąski grotesk techniczny, zwykłe litery | szeryf tekstowy na bieli (nie krem) | maszynowy | B: odrzucony krem pod szeryfem |
| Element firmowy | ikona hantla | zdjęcie | linia wymiarowa (dane) | legenda (dane) | sygnatura (dane) | żaden nie jest ozdobą |
| Układ | siatka kart z cieniem | kafelki | arkusz z ramką | plansza dwukolumnowa | jedna karta | C: jedna karta zamiast siatki kart |
| Ruch | fade-up | — | brak ruchu poza figurą | brak | brak | ruch tylko w figurze (dane) |
| Kalibracja domyślnych wyborów | — | — | cienkie linie i zero zaokrągleń = „układ gazetowy” → zostaje, bo to ramka rysunku (decyzja do weta) | chipy pigułki → zostają jak w obecnej stronie | krój mono na etykiety = ślad szablonu → tu krój maszynowy jest nośnikiem metafory katalogu (decyzja do weta) | zapisane |

## Dostępność (sprawdzone, nie ocenione okiem)

- Kontrast: `kontrast.md`, 54 pary w obu motywach, 0 poniżej progów 4,5 / 3. Jedna poprawka po pomiarze: C ramki `#8e9a93` (2,92:1) → `#7d8982`.
- axe-core 4.13 (`wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice`) na 36 widokach: 0 naruszeń.
- 320 px: brak przewijania poziomego na 9 ekranach (po poprawce szerokości `select`); 390 i 1440 px: tak samo.
- Cele dotykowe ≥ 44 px (przyciski, linki menu, okruszki, litery); fokus 3 px w kolorze akcentu; nazwy EN z `lang="en"`.
- Linia wymiarowa A to `role="img"` z pełnym opisem tekstowym; legenda B ma tekst obok koloru; sygnatura C to tekst.

## Ograniczenia i otwarte

- Zrzuty z Chromium w Linuksie: krój systemowy treści renderuje się jako Inter; na iPhonie i Macu będzie SF. Kroje tytułów są lokalne (woff2), więc wyglądają tak samo.
- `[DO USTALENIA]` nazwa aplikacji w ramce („Trening”) i plakietka App Store (dziś miejsce; grafika Apple po nadaniu `appStoreId`).
- Kroje do produkcji: pliki woff2 w `assets/` (CSP `font-src` = `default-src 'self'`, bez zmian) — decyzja przy Z-12; po wyborze kierunku porównanie ok. 5 krojów tytułów (zasada roli, E2 pkt 6).
- Linia wymiarowa bez stylu w atrybucie (CSP): 6 wartości czasu w danych (0; 0,5; 1; 2; 2,5; 4 s) → klasy `.t5 … .t40`.
- Kierunki nie przechodziły testu z ludźmi; opcjonalnie test pięciosekundowy z 3–5 osobami (ok. 1 h właściciela).
- Pytanie z modułu strona-www: „Który kierunek robi »wow«?” — dla właściciela przy Z-11.
