# Plakietka App Store na stronie (Z-40 009, KO-138)

Stan: 28.11.2026 · 08-programista. Źródło zasad: https://developer.apple.com/app-store/marketing/guidelines/ (odczyt 28.11.2026, surowy HTML przez `curl`).

## Zasady Apple (cytaty z odczytu)
- „Minimum badge height is 10 mm for use in printed materials and 40 px for use onscreen.” → obraz ma `height="44"`.
- „Never translate App Store or create your own localized badge.” / „Don’t modify, angle, or animate the App Store badge.” → tylko pliki Apple, bez zmian.
- „Use only the badge artwork provided in these guidelines.”
- Grafikę wolno pobrać po zaakceptowaniu „App Store Marketing Artwork License Agreement” przez upoważnionego przedstawiciela konta deweloperskiego (pole zgody na stronie wytycznych) — **tylko właściciel konta może to zrobić; agent plików nie pobiera ani nie kopiuje**.
- „When the App Store badge is used, credit both Apple and the Apple Logo” → linia znaków towarowych (klucz UI `appleZnaki`) pod stopką, **wyłącznie na stronach z grafiką plakietki** (wyjątek od zasady „bez nazw innych firm” — wymóg licencji; KO-138, do weta właściciela).

## Co robi generator
- `config.json → appStoreId` puste: bez plakietki, bez linku (bez zmian).
- `appStoreId` ustawione i jest plik `assets/plakietka/<język>.svg`: w ramce „w aplikacji” link z `<img alt="Pobierz w App Store" height="44">`; w stopce linia `appleZnaki`.
- `appStoreId` ustawione, brak pliku dla języka: zwykły link tekstowy bez stylów (wariant b); budowanie wypisuje UWAGA z listą języków bez pliku.

## Pliki plakietek (Z-40 009, KO-139; odczyt 28.11.2026)
- 35 plików `assets/plakietka/<kod>.svg`: oficjalna czarna plakietka „Download on the App Store”, pobrana bajt w bajt z Apple Marketing Tools (https://toolbox.marketingtools.apple.com/app-store/), adres każdego pliku, język Apple, data i suma SHA-256 w `assets/plakietka/ZRODLA.json`. Pobranie: `node scripts/plakietka-pobierz.mjs` (ręcznie; właściciel zaakceptował licencję „App Store Marketing Artwork License Agreement” 28.11.2026, pobranie w jego imieniu). Zero modyfikacji; test `tests/z40-plakietka.test.mjs` porównuje sumy.
- Odwzorowania (decyzje „analogia, do weta”): `sr` → plakietka angielska (Apple nie ma serbskiej; adres en-us); `es-419` → es-mx (Apple nie ma es-419; hiszpański latynoamerykański); `nb` → no-no (Apple: norweski); `zh-Hant` → zh-tw; `pt` → pt-pt, `pt-BR` → pt-br; `sl` → sl-si; `et` → et-ee; `da` → da-dk; `sv` → sv-se; `el` → el-gr.
- Czarna plakietka na ciemnym tle: plik ma własną jasną ramkę Apple `#a6a6a6` (kontrast z tłem ≈ 7,3:1, rachunek z luminancji WCAG), wypełnienie czarne `#000` na tle ramki `rgb(18,25,34)` (kontrast samej czerni 1,19:1), ramka plakietki widoczna; zrzuty `pomiary/plakietka/` (pl, en, jasny i ciemny; skrypt `zrzuty.mjs`). Plakietki nie przerabiamy; jeśli Apple wymaga innej wersji na ciemne tło, zmiana tylko na inny plik Apple (biała), nie na zmianę koloru.
- `config.json → appStoreId` zostaje puste do publikacji aplikacji (wtedy bez plakietki i bez linku).

## Krok właściciela
1. Przy publikacji wpisać `appStoreId` w `config.json` (po wpisaniu pojawia się plakietka i linia znaków Apple).
2. Zdecydować o `sr` (plakietka angielska) i `es-419` (es-mx) — albo zażądać linku tekstowego (usunąć plik).
