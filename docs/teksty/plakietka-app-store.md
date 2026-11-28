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

## Krok właściciela
1. Zaakceptować licencję na stronie wytycznych (konto Apps4Brew), pobrać plakietkę „Download on the App Store”, czarną (preferowana), w wersjach językowych.
2. Zapisać jako `assets/plakietka/<kod>.svg`, gdzie `<kod>` to nazwa pliku z `src/ui/` bez `.json`: `pl`, `en`, `cs`, `sk`, `hu`, `ro`, `bg`, `hr`, `sl`, `sr`, `lt`, `lv`, `et`, `uk`, `es`, `es-419`, `pt`, `pt-BR`, `de`, `fr`, `it`, `nl`, `sv`, `da`, `nb`, `fi`, `tr`, `el`, `id`, `ms`, `vi`, `ru`, `ja`, `ko`, `zh-Hant`.
3. Apple nie ma (wg listy z odczytu) plakietki w języku serbskim: dla `sr` zostaje link tekstowy albo angielska plakietka pod nazwą `sr.svg` — decyzja właściciela.
4. Dopiero potem wpisać `appStoreId`.
