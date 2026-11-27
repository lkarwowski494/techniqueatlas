# Teksty stałe Z-33 do przekładu przez API (33 języki)

Stan: 27.11.2026 · Z-33 (08-programista, build). Właściciel: tłumaczenia przez API Claude (przebieg z `docs/przeklad/`, gałąź `main`; tego pliku i `zrodla.json` nie ma jeszcze w gałęzi `strona/z32-z33`).

## Co jest przetłumaczone, a co czeka

Napisane przez agenta, tylko pl i en (`src/ui/pl.json`, `src/ui/en.json`). W pozostałych 33 plikach `src/ui/<język>.json` tych kluczy **nie ma**; strona pokazuje wtedy wersję angielską z `lang="en"` (stopka, ramka, strony prawne), nie zdania zastępcze w innym języku niż angielski.

| Klucz | Treść | Zmienne | Uwagi do przekładu |
|---|---|---|---|
| `prawne.nav`, `prawne.privacy`, `prawne.terms`, `prawne.license` | nazwy dokumentów prawnych w stopce | — | `prawne.privacy` bez przekładu zastępuje się istniejącym kluczem `privacy` |
| `prawneBrak.administrator`, `.kontakt`, `.dataObowiazywania` | tekst zastępczy wstawek, dopóki nie ma danych administratora (przed publikacją) | — | nie dla indeksowania: S12 przerywa build przy `indeksowanie=true`, jeśli wstawki są puste |
| `wsparcie.w1`, `w2`, `w3` | akapit o wsparciu w stopce (3 zdania) | `{dni}` w `w2` | liczba dni z `lib/access.ts` aplikacji; **w żadnym języku „darmowy” / „free” przy aplikacji** (F-12, `docs/teksty/ramka-w-aplikacji.md`, odstępstwo 3); strona jest „bezpłatna”, aplikacja ma „dni bez opłat” |
| `ramka.tytul` | nagłówek ramki | `{nazwa}` | nazwa aplikacji zostaje bez przekładu (`config.json → nazwaAplikacji`) |
| `ramka.z1` … `ramka.z8` | 8 zdań ramki „w aplikacji”, wariant A | — | nazwy ekranów jak w aplikacji: „Postępy” (z6), „Poprzednio” (z2), „Propozycje” (z4) z `lib/locales/*.json` aplikacji; zdania o funkcjach wydania 1.1.1 |

Klucze są **osobnymi tekstami**, nie tablicami, bo mechanizm przekładu (`scripts/przeklad/zrodla.mjs`, `liscie()`) pomija tablice.

## Wpis do `docs/przeklad/zrodla.json` (na `main`)

Mechanizm pozwala na to bez zmian w workflowach (rodzaj „mapa”, wynik do istniejących plików `src/ui/<kod>.json`, istniejące niepuste tłumaczenia są pomijane). Zastępuje nieużywane źródło `ramka` (`docs/teksty/ramka/*.json`, `oczekuje: true`): teksty ramki leżą w `src/ui/`, bo test Z-33 „liczba dni nie jest przepisana” wymaga wstawki `{dni}` w `src/`.

```json
{
 "id": "ui",
 "rodzaj": "mapa",
 "pl": "src/ui/pl.json",
 "en": "src/ui/en.json",
 "cel": "src/ui/{kod}.json",
 "opis": "teksty stałe strony (stopka, strony prawne, ramka „w aplikacji”, akapit o wsparciu)",
 "wskazowka": "Zmienne {…} (np. {dni}, {nazwa}) zostaw bez zmian. Przy aplikacji nie używaj odpowiednika słowa „darmowy”. Klucze z nazwami ekranów aplikacji (Postępy, Poprzednio, Propozycje) tłumacz tak jak w aplikacji w tym języku."
}
```

Uwaga: źródło `ui` obejmuje wszystkie klucze `src/ui/pl.json`; w plikach językowych są już przetłumaczone (pomijane), więc przebieg dotyczy tylko kluczy z tabeli wyżej. Przed przebiegiem płatnym sprawdź szacunek (`szacunek.json`).

## Strony prawne

Źródło „prawne” (`docs/teksty/prawne/*.pl.md` + `*.en.md` → `<nazwa>.<kod>.md`) już jest w `zrodla.json`. Build bierze przekład z `docs/teksty/prawne/<dokument>.<kod>.md`, gdy plik istnieje; bez niego strona prawna w danym języku jest angielska (`lang="en"`, `noindex` poza językami z `indeksujJezyki`).
