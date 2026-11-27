# Stan agenta — Z-31 (08-programista, build), sesja BF

Aktualizacja: 2026-11-27 · gałąź `strona/z31-wyglad` (od `strona/integracja-start` @ 8720007; scalone d63f4a1)

## Zrobione
- `src/pages.mjs`: układ „Arkusz” (nagłówek z menu `<details>`, arkusz, okruszki, tabliczka, krótka odpowiedź tylko przy własnych wskazówkach, linia wymiarowa tempa, układy bez figury i bez wskazówek, wykaz-tabela, stan pusty, strona główna z licznikami, 404, wybór języka); linki na adresy kanoniczne; tytuły bez nazwy witryny.
- `assets/site.css` (`node src/css.mjs` = fonty + tokeny + komponenty), `assets/fonty/` (4 woff2), `assets/szukaj.js` (wykaz).
- `src/ui/*.json`: 11 nowych tekstów w 35 językach (do przeglądu native speakera) + `countLine` bez twierdzenia o wskazówkach/zamiennikach przy wszystkich (06-tresci-002).
- Testy: 11 Z-31 zielonych (bez CZEKA), nowy `z31-opis-glownej`, selektory w `build.test.mjs` dostosowane do nowego znacznika.
- Zrzuty i opis różnic: `pomiary/z31/` (axe 0 naruszeń na 44 widokach).

## Następny krok
- Zielony `tests.yml` na końcowym SHA; PRZEKAZANIE do koordynatora (session_01BM51ofp4DMHDkCDaVVg49P).
- Poza zakresem (Z-32…Z-34): nazwa lokalna + angielska, ramka „w aplikacji”, akapit wsparcia (użyć tekstu z `docs/teksty/ramka-w-aplikacji.md`), ikona i podgląd.
