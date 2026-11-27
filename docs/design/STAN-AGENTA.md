# Stan agenta — Z-12 zrobione (rola 04)

Rola 04-studio-projektowe, tryb build, moduł strona-www · 27.11.2026 · gałąź `strona/z10-makiety`. Sesja BD (po AX).

## Zrobione
- **Z-10** (sesja AX): inwentarz AS IS, trzy kierunki, `makiety-2026-11-27/`.
- **Z-11:** właściciel wybrał **A „Arkusz”** słowami „A „Arkusz” (Rekomendowane)” (27.11.2026, 17:05 UTC).
- **Z-12** (sesja BD): system wyglądu w `system/` — specyfikacja `system/design-spec.md` (start tutaj): tokeny (jasny, ciemny, zwiększony kontrast w obu), komponenty, szablony 3 ekranów i 7 stanów, katalog komponentów, ikona, obrazek podglądu, arkusz 5 krojów, kontrast (64 pary, 0 poniżej progu), axe 0 naruszeń na 70 widokach, zrzuty wzorcowe 320/390/768/1024/1440.

## Decyzje do weta (szczegóły: `system/design-spec.md` §10)
Krój tytułów zostaje Plex Sans Condensed; tytuły w cyrylicy/grece/CJK krojem systemowym; ikona: znak A; podgląd bez figury `[DO USTALENIA]` (propozycja: sylwetka); menu `<details>` do 960 px; symbol sekundy jako tekst tłumaczenia; krótka odpowiedź tylko przy własnych wskazówkach; 11 nowych tekstów interfejsu do `src/ui` w Z-31.

## Następny krok
Wdrożenie: Z-31 (szablony i CSS w `src/`, `assets/site.css` z `tokeny.css` + `komponenty.css`, teksty w 35 językach), Z-33 (ikona, podgląd, kroje w `assets/`). Potem rola 04 w trybie `audit` porównuje zbudowane strony z `system/wzorce-zrzuty/`.
Uwaga: pełny `npm test` lokalnie ginie na SIGKILL (pamięć przy 35 językach); strażników uruchamiaj pojedynczo z `--test-concurrency=1`, a za dowód bierz CI.
