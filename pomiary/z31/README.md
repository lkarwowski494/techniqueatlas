# Z-31 — zrzuty strony „Arkusz” a makiety (27.11.2026)

Zrzuty: `zrzuty/` (Chromium, „Ogranicz ruch”, skala 1, pl; 390 i 1440 px, jasny i ciemny; `-kontrast` = `prefers-contrast: more` dla ćwiczenia i listy). Odtworzenie:
`node src/build.mjs --jezyki pl,en --out <dist> && node pomiary/z31/zrzuty.mjs <dist> pomiary/z31/zrzuty 390,1440`. Wyniki sprawdzeń: `zrzuty/sprawdzenie.json` (axe-core wcag2a/aa/21/22 + best-practice, przewijanie poziome, błędy konsoli).
Wzorce: `docs/design/system/wzorce-zrzuty/` (te same przykłady: back-squat, decline-bench-press, bench-dip, sissy-squat, strona główna, lista, stan pusty, 404, wybór języka). Strony z listą 708 pozycji obcięte do 1400 px wysokości (pliki repozytorium ≤ 300 KB).

## Wynik sprawdzeń (44 widoki)
- axe: 0 naruszeń we wszystkich 44 widokach. Przewijanie poziome: 0 px we wszystkich.
- Błąd konsoli tylko na 404 (4 widoki): „404 Not Found” — to sama strona 404 serwowana ze statusem 404, nie błąd zasobu.

## Różnice względem makiet (sprawdzone na parach plików, np. `cwiczenie-1440-jasny.png` ↔ `wzorce-zrzuty/cwiczenie-1440-jasny.png`)
Zgodne: nagłówek ze znakiem i przyciskiem języka, podwójna ramka arkusza, okruszki, tabliczka 2×2 z linkami, krótka odpowiedź w niebieskim polu, dwie kolumny od 960 px, figura z pozycjami, linia wymiarowa (2 s · 1 s · 0,5 s; „razem 3,5 s na powtórzenie”), sterowanie, sylwetka, wykaz, stan pusty (ramka przerywana), układ bez figury i bez wskazówek.
Różnice (świadome):
1. **Nazwa**: w eksporcie nazwa ćwiczenia po polsku jest angielska (np. „Back Squat”); makieta ma nazwę lokalną i angielską pod nią — Z-32.
2. **Zamienniki** bez drugiej, angielskiej nazwy pod linkiem — Z-32.
3. **Ramka „W aplikacji”, pasek wsparcia i pozycja „Aplikacja” w menu** — Z-33; stopka ma dziś linię języków i prywatność.
4. **Krótka odpowiedź**: tekst z generatora Z-22 (`szablonyCwiczenia`), więc inny niż ręczny w makiecie; nagłówek „Jak zrobić to ćwiczenie?” bez nazwy (odmiana polskiej nazwy w bierniku nie da się zbudować mechanicznie).
5. **Przyciski błędów**: „Pokaż częsty błąd: …” (tekst z danych figury, skrypt `figura-strona.js` przestawia go przy kliknięciu), w makiecie sama treść błędu.
6. **Przycisk animacji** ciemny (wciśnięty): w zrzutach jest „Ogranicz ruch”, więc animacja stoi i przycisk to „Wznów”.
7. **Podpis figury** powtarza kolejność faz (wymóg testu pętli: fazy bez sekund przy ćwiczeniach `untimed`); przy ćwiczeniach z linią wymiarową duplikuje ją — do decyzji roli 04.
8. **Strona główna 1440**: obcięta do 1400 px; lista „Podstawowe ćwiczenia” i grupy bez zmian.
9. **Wykaz** ma kolumnę „Partia” (makieta filtrowana po partii ma 3 kolumny): na liście niefiltrowanej partia jest potrzebna.
10. **Strona jednego filtra** (np. `muscles/legs/`) to wykaz bez pól wyboru; makieta „lista ustawiony filtr” ma pola — filtrów po stronie przeglądarki nie da się tam zawęzić do widoku z jednym filtrem.
