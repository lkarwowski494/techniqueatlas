# Stan agenta — Z-34 zasięg (08-programista, build), sesja BJ

Aktualizacja: 2026-11-28 · gałąź `strona/z34-zasieg` (od `strona/integracja-start` @ 7a8dcb4)

## Zrobione
- **Z-34 wg A1–A15** (15 testów `tests/z34-zasieg.test.mjs` bez `CZEKA`, zielone):
  - tytuły, opisy, nagłówki-pytania `h2` i krótka odpowiedź (`p.odp`) z szablonów Z-22 dla pl i en (`ctx.sz` w `src/build.mjs`, `src/pages.mjs`); inne języki: dotychczasowe zachowanie do czasu przekładu szablonów;
  - `/`: `WebSite` JSON-LD, opis witryny, `og:site_name` (A6); linki wewnętrzne na adres kanoniczny — już były (test z31), bez zmian (A5);
  - ikona PNG 96/192 + `apple-touch-icon.png` (assets/, kopia w korzeniu dist) (A7);
  - `<img alt>` rysunku, `og:*`, `og:image` = `assets/podglad/<slug>.png`, `WebPage.primaryImageOfPage` (A8, A9, A11); 528 PNG 1200×630, 64 kolory, ≤ 16 KB, razem 6,3 MB, generator `scripts/podglad.mjs` (Chromium + ImageMagick, ręcznie), skróty w `src/podglad-skroty.json`, test świeżości w `tests/z34-indexnow-podglad.test.mjs`;
  - `robots.txt` wg KO-130 przy `indeksowanie=true` (`UCZENIE_MODELI` w `src/build.mjs`); przy `false` bez zmian;
  - mapy witryny: `<lastmod>` = data commitu aplikacji z PIN.json (`npm run dane` zapisuje `.cache/dane/data-wydania.json`), bez changefreq/priority (A13);
  - IndexNow: `config.json → indexNowKlucz`, plik `<klucz>.txt` w korzeniu dist, `scripts/indexnow.mjs` (próba na sucho; wysyłka tylko z `--wyslij`, ręcznie po publikacji i zgodzie; niczego nie wysłano).
- **Z-33 NISKIE**: niepełny blok ramki/wsparcia spada w całości na angielski z `lang="en"` (bez „undefined”); parytet kluczy UI sprawdza podklucze (`brakujacePodklucze`).
- **Źródło `ui`** w `docs/przeklad/zrodla.json` (zastąpiło `ramka`); test `tests/z34-przeklad-ui.test.mjs`. W trakcie wykryto i naprawiono: `countLine` (pl: 4 formy liczby mnogiej, de/ja/en: jeden napis) — bez poprawki przebieg prosiłby o formy few/many, a `zastosuj` zastąpiłby napis drzewem (utrata `countLine` → „undefined”); `zastosuj` zachowuje wcięcie istniejącego pliku (src/ui: 2 spacje).

## Decyzje (analogia, do weta)
1. `<img>` rysunku jest wizualnie ukryty (`.wizualnie-ukryte`), obok widocznych `<svg><use>`: testy build/slugi/figura-przegladarka wymagają `<use>`, a `<img>` nie dziedziczy motywu strony. Alternatywa: widoczne `<img>` z samodzielnym SVG per pozycja (zmiana wyglądu — rola 04, zmiana tych testów).
2. Obrazki podglądu commitowane w repo (6,3 MB), nie generowane przy budowaniu (budowanie zostaje bez przeglądarki; test świeżości pilnuje zgodności z danymi).
3. Bez figury (180 ćwiczeń): brak `og:image` (bez sylwetek, bez logo).
4. `lastmod` jedną datą wydania dla wszystkich adresów (data commitu aplikacji z PIN.json); przy każdej zmianie PIN-u `npm run dane` odświeża.
5. Klucz IndexNow 32 znaki szesnastkowe w `config.json`: strażnik sekretów go nie łapie (wzorzec 40 znaków), więc wyjątek strażnika nie był potrzebny.
6. Zmiany istniejących testów (powody w komentarzach): `z31` regex krótkiej odpowiedzi (`<p class="odp">`, wymóg testu Z-34); `szablony.test` i `src/szablony.mjs` — nagłówek mięśni tylko przy regionach o obciążeniu ≥ 0,5 (83 ćwiczenia pl i en miały pytanie bez sekcji; doc szablony-stron 2.4 zaktualizowany); Z-34 unikalność opisów dopuszcza bliźniaki o identycznych danych (jak `szablony.test`: seated-cable-row, seated-dual-cable-row); `przeklad-api` lista źródeł (`ui` zamiast `ramka`).

## Otwarte
- Plan startu (`docs/55-plan-startu.md`): stan Z-34 i innych zadań ustawia koordynator (nie zmieniałem); Z-33 nadal ma 1 test oczekujący (ramka w języku podglądu de — wymaga przekładu API).
- `appStoreId` puste, dane administratora/kontakt (TA_ADMINISTRATOR, TA_KONTAKT), `dataObowiazywania` — jak w Z-33.
- Po zmianie PIN.json: `npm run dane`, potem `node scripts/podglad.mjs` (ATLAS_CHROME=<chromium>), commit zmienionych PNG i `src/podglad-skroty.json`.
- Zgłoszenie do roli 04: `p.odp` i `.wizualnie-ukryte` na `<img>` w figurze (uzupełnienie w `src/css.mjs`); decyzja 1 wyżej.
