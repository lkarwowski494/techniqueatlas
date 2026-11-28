# Stan agenta — BQ: liczba mnoga w 4 językach, test nazw, nazwy greckie, ramka (09-lokalizacja, build)

Aktualizacja: 2026-11-28 · gałąź `strona/liczba-mnoga-el` (od `strona/integracja-start` @ 074e3f8) · polecenie: docs/koordynacja/polecenia/BQ.md (repo trening, gałąź koordynacja)

## Zrobione (test czerwony przed, zielony po)
- a) `tests/liczba-mnoga.test.mjs`: każdy język z config.json × frazy z formami liczby (szablony + ui): formy wg `Intl.PluralRules`, liczby próbne 0, 1, 2, 3, 5, 11, 21, 22, 25, 101, 102, 708. Czerwony: sl bez `two`, lv bez `zero`. Zielony dla 35 języków po przekładzie API: cs/hr (zamienione many/other), sl, lv. Przekład sl/lv wymagał zmiany rdzenia (PR #8, KO-146: formy wg kategorii języka docelowego).
- b) `tests/z32-nazwy.test.mjs`: `en` = sama nazwa angielska (h1 lang="en"), gałąź „bez pliku nazw” przez opcję build `bezNazw` (src/build.mjs:44) na fixture (de), de i ja = nazwa lokalna + angielska; 0 skip; czerwony po zepsuciu gałęzi (sprawdzone).
- c) `docs/nazwy/el.json` 708/708 (batch msgbatch_01KQVj9LbwLRxZAne5oog1zZ), przegląd API (msgbatch_01Rthee1AgDCN64Tfxs9DVBU): 0 krytycznych, 57 poprawek nałożonych (docs/przeklad/przeglad-el-2026-11-28.md).
- e) ramka „w aplikacji”: źródło `docs/teksty/ramka/{pl,en}.json` (kopia ramki z src/ui), przekład 33 języków (msgbatch_014brBTYuygaYCcBK6dmK484), `build.mjs` czyta ramkę z docs/teksty/ramka dla języków bez niej w src/ui, zdjęte CZEKA('Z-33') z testu de, „Oczekujące: brak”, test `tests/z33-ramka-przeklad.test.mjs`.

## Koszt API (docs/przeklad/wydatki.json): 27,24 z 80 USD (start sesji 25,68; ta sesja 1,57)

## Otwarte
- Przegląd API ramki (33 języki, ok. 3,8 USD) zlecony workflowem, wynik NIEPRZEJRZANY ani nienałożony; przegląd szablonów po finalnym przekładzie (cs, hr, sl, lv) niezrobiony.
- `ui.countLine` w 24 językach to napis bez form (np. „{n} exercises”): poprawne tylko dla n=708; przy małych liczbach błędne; test sprawdza tylko frazy z formami.
- Wybór nazwy w lv: model użył „ieraksts” (wpis) zamiast „vingrinājums”; do przeglądu rodzimego użytkownika. Brak przeglądu człowieka dla żadnego języka (przegląd modelu go nie zastępuje).
- Przegląd el: „Lower Back Curl” zmieniony przez model na „κάμψη μέσης”; do sprawdzenia przez rodzimego użytkownika.

# Stan agenta — BL: poprawki po audycie wyglądu Z-40 (08-programista, build)

Aktualizacja: 2026-11-28 · gałąź `strona/z40-poprawki` (od `strona/z40-audyt-wygladu` @ 6b78851)

## Zrobione (każde: test akceptacyjny czerwony przed, zielony po; `tests/z40-poprawki.test.mjs`, `tests/z40-przewijanie.test.mjs`)
- 001 nagłówek: zawijanie marki, podtytuł znika w nagłówku < 22rem (zapytanie kontenera); przy teście 35 języków wyszły jeszcze: wykaz, `.grupy`, przyciski figury, linki stopki — `overflow-wrap`/`minmax(0,1fr)` w `komponenty.css`. 35 języków × 3 strony: 0 px.
- 002 licznik `p.wynik` (aria-live, aria-atomic) na liście i stronach filtra, aktualizowany w `szukaj.js`; klucz UI `wynik` (pl, en).
- 003 przycisk animacji bez `aria-pressed`; 004 podpis figury = „rysunek schematyczny”; 005 przyciski błędów: tekst = nazwa bez kropki, `aria-label` „Pokaż częsty błąd: …”; 006 stopka: bieżący + angielski + „wszystkie języki (N)”; 007 wykaz w zapytaniu kontenera (35rem); 008 `a.jezyk` min-height 44 px; 011 design-spec dostosowany do tekstu strony.
- 009 plakietka: `assets/plakietka/<język>.svg` (od właściciela) → `<img alt height=44>`; brak pliku → zwykły link tekstowy + UWAGA w budowaniu; linia znaków Apple (`appleZnaki`) tylko przy grafice. Instrukcja: `docs/teksty/plakietka-app-store.md`. Apple, odczyt 28.11.2026, https://developer.apple.com/app-store/marketing/guidelines/.
- Pomiary: `pomiary/z40/` (40 widoków: axe 0, przewijanie 0 px przy 320 px/200%).

## Decyzje (analogia, do weta)
1. KO-138 (koordynator): wariant (a) ze spadkiem do (b); pliki Apple tylko od właściciela po akceptacji licencji.
2. 007: próg wykazu jako zapytanie kontenera `.arkusz` 35rem (≈ dawne 640 px), bo `@media` w em nie skaluje się z ustawieniem tekstu w teście 200%.
3. 011: zostaje tekst stały „Jak zrobić to ćwiczenie?”; design-spec poprawiony (opcja b raportu).
4. Dodatkowo w systemie `overflow-wrap:anywhere` i `minmax(0,1fr)` (reszta przewijania wykryta testem 35 języków).
5. Istniejące testy zmienione z powodem (komentarze): figura-przegladarka, petla-jednokierunkowa (podpis → linia), hreflang i jezyki-podglad (stopka), z31 i z34-przeklad-ui (nowe klucze UI).

## Nie zrobione
- 010 (OG i opis na listach, stronach prawnych, 404; 180 ćwiczeń bez figury): wymaga zasobu graficznego i decyzji właściciela (`[DO USTALENIA]`, design-spec §10 pkt 4).
- Przyjęte zgłoszenia (`[hidden]`, `.widoki`, `.drobne`, `.tekst-prawny`, `p.odp`) nie przeniesione z `src/css.mjs` do systemu — zadanie roli 04 (fix).
- Przekład kluczy `wynik`, `wszystkieJezyki`, `appleZnaki` na 33 języki: przekład API (`docs/teksty/ui-do-przekladu-z33.md`).

---
## Wcześniej (Z-34, sesja BJ)

Aktualizacja: 2026-11-28 · gałąź `strona/z34-zasieg` (od `strona/integracja-start` @ 7a8dcb4)

## Zrobione
- **Z-34 wg A1–A15** (15 testów `tests/z34-zasieg.test.mjs` bez `CZEKA`, zielone):
  - tytuły, opisy, nagłówki-pytania `h2` i krótka odpowiedź (`p.odp`) z szablonów Z-22 dla pl i en (`ctx.sz` w `src/build.mjs`, `src/pages.mjs`); inne języki: dotychczasowe zachowanie do czasu przekładu szablonów;
  - `/`: `WebSite` JSON-LD, opis witryny, `og:site_name` (A6); linki wewnętrzne na adres kanoniczny — już były (test z31), bez zmian (A5);
  - ikona PNG 96/192 + `apple-touch-icon.png` (assets/, kopia w korzeniu dist) (A7);
  - `og:*`, `og:image` = `assets/podglad/<slug>.png`, `WebPage.primaryImageOfPage` (A8, A9, A11); 528 PNG 1200×630, 64 kolory, ≤ 16 KB, razem 6,3 MB, generator `scripts/podglad.mjs` (Chromium + ImageMagick, ręcznie), skróty w `src/podglad-skroty.json`, test świeżości w `tests/z34-indexnow-podglad.test.mjs`;
  - `robots.txt` wg KO-130 przy `indeksowanie=true` (`UCZENIE_MODELI` w `src/build.mjs`); przy `false` bez zmian;
  - mapy witryny: `<lastmod>` = data commitu aplikacji z PIN.json (`npm run dane` zapisuje `.cache/dane/data-wydania.json`), bez changefreq/priority (A13);
  - IndexNow: `config.json → indexNowKlucz`, plik `<klucz>.txt` w korzeniu dist, `scripts/indexnow.mjs` (próba na sucho; wysyłka tylko z `--wyslij`, ręcznie po publikacji i zgodzie; niczego nie wysłano).
- **Z-33 NISKIE**: niepełny blok ramki/wsparcia spada w całości na angielski z `lang="en"` (bez „undefined”); parytet kluczy UI sprawdza podklucze (`brakujacePodklucze`).
- **Źródło `ui`** w `docs/przeklad/zrodla.json` (zastąpiło `ramka`); test `tests/z34-przeklad-ui.test.mjs`. W trakcie wykryto i naprawiono: `countLine` (pl: 4 formy liczby mnogiej, de/ja/en: jeden napis) — bez poprawki przebieg prosiłby o formy few/many, a `zastosuj` zastąpiłby napis drzewem (utrata `countLine` → „undefined”); `zastosuj` zachowuje wcięcie istniejącego pliku (src/ui: 2 spacje).

## Decyzje (analogia, do weta)
1. KO-137 (koordynator, do weta): wizualnie ukryty `<img>` rysunku usunięty (B4, czytnik ekranu, `<figure>`). Obraz ćwiczenia: `og:image`, `WebPage.primaryImageOfPage` i `<image:image>` w mapach witryny (strony z rysunkiem); test A8 dostosowany z powodem (czerwony przed zmianą). Zgłoszenie do roli 04 o `.wizualnie-ukryte` na `<img>` odpada.
2. Obrazki podglądu commitowane w repo (6,3 MB), nie generowane przy budowaniu (budowanie zostaje bez przeglądarki; test świeżości pilnuje zgodności z danymi).
3. Bez figury (180 ćwiczeń): brak `og:image` (bez sylwetek, bez logo).
4. `lastmod` jedną datą wydania dla wszystkich adresów (data commitu aplikacji z PIN.json); przy każdej zmianie PIN-u `npm run dane` odświeża.
5. Klucz IndexNow 32 znaki szesnastkowe w `config.json`: strażnik sekretów go nie łapie (wzorzec 40 znaków), więc wyjątek strażnika nie był potrzebny.
6. Zmiany istniejących testów (powody w komentarzach): `z31` regex krótkiej odpowiedzi (`<p class="odp">`, wymóg testu Z-34); `szablony.test` i `src/szablony.mjs` — nagłówek mięśni tylko przy regionach o obciążeniu ≥ 0,5 (83 ćwiczenia pl i en miały pytanie bez sekcji; doc szablony-stron 2.4 zaktualizowany); Z-34 unikalność opisów dopuszcza bliźniaki o identycznych danych (jak `szablony.test`: seated-cable-row, seated-dual-cable-row); `przeklad-api` lista źródeł (`ui` zamiast `ramka`).

## Otwarte
- Plan startu (`docs/55-plan-startu.md`): stan Z-34 i innych zadań ustawia koordynator (nie zmieniałem); Z-33 nadal ma 1 test oczekujący (ramka w języku podglądu de — wymaga przekładu API).
- `appStoreId` puste, dane administratora/kontakt (TA_ADMINISTRATOR, TA_KONTAKT), `dataObowiazywania` — jak w Z-33.
- Po zmianie PIN.json: `npm run dane`, potem `node scripts/podglad.mjs` (ATLAS_CHROME=<chromium>), commit zmienionych PNG i `src/podglad-skroty.json`.
- Zgłoszenie do roli 04: `p.odp` (uzupełnienie w `src/css.mjs`).
- `zastosuj` pomija węzeł, który język ma jako napis (countLine), także z `--nadpisz`.
