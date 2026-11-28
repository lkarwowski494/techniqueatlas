# Przegląd API: szablony cs, hr, sl, lv po przekładzie z nowym rdzeniem (BQ2 b), 28.11.2026

Przegląd: batch `msgbatch_016a8sMRukZNoccnuZsPmU7p` (opus 5.5, 0,09 USD rzeczywiste), workflow „Przegląd tłumaczeń”, run 46141711071 (main @ dbf4233), teksty z gałęzi `strona/liczba-mnoga-el`.
Wynik: cs 29/29 ok, hr 27/27, lv 27/27, sl 28/29; 0 krytycznych, 0 średnich, 1 niska (sl `pytania.miesnie`: „delujejo” → „so aktivne”).
Decyzja (analogia, do weta): nałożona jedyna poprawka (sądu stylistycznego modelu; przegląd człowieka nie odbył się). Odrzucona opcja: brak nałożenia.

# Przekład API: `ui.countLine` z formami liczby mnogiej (BQ2 c / KO-147 P3), 28.11.2026

Powód: w 24 językach `countLine` był jednym napisem („{n} exercises”), poprawnym tylko dla 708; dla 18 języków z więcej niż jedną kategorią CLDR to błąd przy małych liczbach (np. „1 exercises”). Pozostałe 6 (ja, ko, zh-Hant, vi, id, ms) mają jedną kategorię (`other`), napis wystarcza.
Przekład: batch `msgbatch_01R3pxmosuVwH3q6UinC2Vj6` (opus 5.5, 0,23 USD, 17 języków, 40 form), run 46140513113; en: formy one/other dopisane ręcznie (źródło). Kategorie wg języka docelowego (rdzeń z PR #8, KO-146).
Obejście ograniczenia: workflow z `galaz_tekstow` czyta tylko `docs/nazwy`, `docs/teksty`, `src/szablony` (nie `src/ui`), więc formy przeszły tymczasowo jako klucz `countLine` w `src/szablony`; po przekładzie przeniesione do `src/ui`, klucz z szablonów usunięty (w gałęzi brak śladu).
Test: `tests/liczba-mnoga-napisy.test.mjs` (każdy napis z {n} w src/ui ma formy, jeśli język ma >1 kategorię; w szablonach {n} razem z rzeczownikiem z form). Czerwony przed: 18 języków; zielony po. Wyjątki nazwane w teście: `wszystkieJezyki` (liczba bez rzeczownika), `wynik` (rzeczownik zależy od {m} = całość, 708).
Przeglądu API przetłumaczonych form nie zlecono (koszt ~0,1 USD, wartość niska; do decyzji koordynatora). Brzmienie pierwszej formy bywa inne niż dawny napis (np. de „stöbere” zamiast „durchsuchen”): to nowy przekład modelu, nie przegląd człowieka.
