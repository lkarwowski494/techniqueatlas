# Stan agenta — Z-32 + Z-33 (08-programista, build), sesja BI

Aktualizacja: 2026-11-27 · gałąź `strona/z32-z33` (od `strona/integracja-start` @ e6bc66a)

## Zrobione
- **Z-32** (b3f228f): nazwy lokalne + angielskie (`nazwaLokalna`/`nazwaStrony` w `src/pages.mjs`, `ctx.nazwy` z `docs/nazwy/<język>.json`); indeks wyszukiwarki 4 pola; tytuł pl wg szablonu Z-22; 6 testów zielonych.
- **Z-31 NISKIE** (b3f228f): testy odp pl/en, klasy `t<ms/100>`, kolejność ról (etykieta w danych: „Secondary muscles”).
- **Z-33** (15a0938): strony prawne (`src/prawne.mjs`), stopka, ramka, akapit o wsparciu; `src/aplikacja.mjs` (dni z `.cache/app/lib/access.ts`); strażnicy S12/S13; teksty w `src/ui/{pl,en}.json`; `docs/teksty/ui-do-przekladu-z33.md`; `tests/z33-moduly.test.mjs`.
- Poprawki testów po CI: slugi.test (nazwa pl w przekierowaniu), straznik-analityka (`\bumami\b` — „z gumami”), parytet kluczy UI (lista kluczy czekających na przekład), z33-moduly (tmpDir). CI zielony na e15d336 (run 92).
- docs/55: Oczekujące Z-33 1, Z-34 15.

## Otwarte
- Test „Z-33 ramka w języku podglądu (de)” zostaje `CZEKA`: wymaga zdań ramki innych niż en w de, a decyzja właściciela to przekład API. Po nałożeniu przekładu zdjąć znacznik.
- `appStoreId` w config.json puste (test „puste” opisuje ten stan); przy publikacji ustawić 6819977165 i zmienić test „puste” na jawne `appStoreId: ''`.
- Wpis źródła `ui` do `docs/przeklad/zrodla.json` (na `main`, nie ma go w tej gałęzi): `docs/teksty/ui-do-przekladu-z33.md`.
- Dane administratora/kontakt: zmienne środowiska TA_ADMINISTRATOR, TA_KONTAKT w pages.yml; `config.json → dataObowiazywania` (Z-51).
- Zgłoszenie do roli 04: `a.plakietka` i `.tekst-prawny` dopisane w `src/css.mjs` (uzupełnienia).
- Poza zakresem: Z-34 (tytuły/opisy poza nazwą, og:, ikona).
