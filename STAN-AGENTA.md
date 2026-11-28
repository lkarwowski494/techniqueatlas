# Stan agenta — BQ2: domknięcie przeglądów tłumaczeń i licznika (09-lokalizacja, build)

Aktualizacja: 2026-11-28 · gałąź `strona/liczba-mnoga-el` (start bb10f4d; scalone `strona/integracja-start` b5d8db4 i `main` dbf4233) · polecenie: docs/koordynacja/polecenia/BQ2.md (repo trening, gałąź koordynacja)

## Zrobione
- a) Przegląd ramki (33 języki): batch msgbatch_01JtRNeh2fxFNEB65r9MyED7, run 46137398803, 0 krytycznych; 12 poprawek nałożonych skryptem (docs/przeklad/przeglad-ramka-2026-11-28.md); koszt rzeczywisty 0,57 USD (szacunek zlecenia 3,80 był zawyżony); testy ramki zielone.
- b) Przegląd szablonów cs, hr, sl, lv: msgbatch_016a8sMRukZNoccnuZsPmU7p, run 46141711071, 0,09 USD; 1 poprawka niska (sl) nałożona; tests/liczba-mnoga.test.mjs zielony dla 35 języków.
- c) KO-147 P3: `ui.countLine` z formami wg Intl.PluralRules w 18 językach (+ en). Test tests/liczba-mnoga-napisy.test.mjs czerwony (18 języków) → zielony. Przekład: msgbatch_01R3pxmosuVwH3q6UinC2Vj6 (run 46140513113), 0,23 USD. Opis i obejście (workflow nie czyta src/ui): docs/przeklad/przeglad-szablony-liczba-mnoga-2026-11-28.md.
- Scalono `main` (PR #8, pozycjeDlaJezyka) do gałęzi: bez niego źródło „ui” prosiło o formy few/many dla języków, które ich nie mają (test z34 „dokładnie klucze czekające”). Konflikt w rdzen.mjs rozwiązany (oba importy).
- tests/z34-przeklad-ui.test.mjs: w dwóch testach „napis zamiast drzewa” fixtura de → ja (de ma już formy; mechanizm i asercje bez zmian).

## Koszt API (docs/przeklad/wydatki.json): 28,13 z 80 USD (start sesji 27,24; ta sesja 0,89)

## Decyzje (analogia, do weta)
1. Wszystkie 12 poprawek ramki i 1 poprawka sl nałożone (nie tylko średnie).
2. Przekład countLine tylko dla 18 języków z >1 kategorią CLDR; ja, ko, zh-Hant, vi, id, ms zostają z jednym napisem.
3. Dwa pośrednie pushe z `[skip ci]` (workflow czyta teksty tylko z gałęzi zdalnej); końcowy push bez znacznika.
4. Bez przeglądu API form countLine (~0,1 USD) — do decyzji koordynatora.

## Otwarte
- Brak przeglądu człowieka dla jakiegokolwiek języka (przegląd modelu go nie zastępuje); w lv „ieraksts” i el „Lower Back Curl” bez zmian.
- Kolejka współbieżności `przeklad-api` ma jeden slot oczekujący: kolejne zlecenie wypiera poprzednie (mój pierwszy przegląd szablonów został tak anulowany; ponowiony).
- `{dni}` (5, stała z aplikacji) i `{m}` w „wynik” zakładają liczbę ≥ 2; zmiana wartości w aplikacji wymaga formy liczby mnogiej (teoretyczne).

---
## Wcześniej (BQ)

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

---
## Wcześniej (BN/BP — integracja-start)

# Stan agenta — BP: naprawa 2 czerwonych testów tests.yml #113 (08-programista, fix)

Aktualizacja: 2026-11-28 · gałąź `strona/plakietka-apple` (od 59eedd6)

## Zrobione
- CI113-1: `tests/z40-plakietka.test.mjs` używa `tmpDir()` z `tests/pomoc.mjs` zamiast `mkdtempSync`; asercje bez zmian. Przed: sprzatanie.test 5/6 (czerwony); po: z40-plakietka + sprzatanie 12/12.
- CI113-2: `src/build.mjs` usuwa `assets/plakietka/ZRODLA.json` z dist po kopiowaniu `assets/` (plik zostaje w repo). Nowy test w z40-plakietka: brak ZRODLA.json w dist, SVG są (czerwony przed poprawką). Po: z40-plakietka + straznik-dane 14/14. Strażnik bez zmian.
- Pełny `npm test`: NIE uruchomiony lokalnie (ciężki); weryfikacja przez tests.yml na SHA z gałęzi — wynik w raporcie PRZEKAZANIE.

## Decyzje (analogia, do weta)
1. Wykluczenie ZRODLA.json przez `rmSync` po `cpSync` (wzorzec jak MANIFEST.json silnika w tej samej linii), nie filtr `cpSync` ani przeniesienie pliku — najmniejszy diff, istniejący wzorzec.
2. Decyzja BN nr 3 (ZRODLA.json w dist) zastąpiona: nie trafia do dist.

---
## Wcześniej (BN)

# Stan agenta — BN: oficjalne plakietki App Store (08-programista, build)

Aktualizacja: 2026-11-28 · gałąź `strona/plakietka-apple` (od `strona/integracja-start`)

## Zrobione
- 35 oficjalnych czarnych plakietek SVG z Apple Marketing Tools w `assets/plakietka/<kod>.svg`, bajt w bajt; źródło, data i SHA-256 w `assets/plakietka/ZRODLA.json`; skrypt `scripts/plakietka-pobierz.mjs`. Opis i odwzorowania języków: `docs/teksty/plakietka-app-store.md`.
- `build()` dostał opcję `plakietkaDir` (test wariantu bez pliku). Generator bez zmian zachowania.
- `tests/z40-plakietka.test.mjs` (6 testów): komplet 35 plików, sumy niezmienione, SVG Apple, `<img alt height≥40>` + linia znaków tylko przy pliku, link tekstowy bez pliku, puste `appStoreId` = bez niczego. Czerwony przed (bez plików: padło na odczycie ZRODLA.json), zielony po.
- Zrzuty i kontrast: `pomiary/plakietka/` (pl, en; jasny, ciemny).

## Weryfikacja (stan na 09:26 UTC)
- Commit funkcji: d80df79 na `strona/plakietka-apple`. CI Tests run #113 (https://github.com/lkarwowski494/techniqueatlas/actions/runs/46129185148) w toku — wynik NIEZNANY. Lokalny `npm test` też w toku (ciężki, ~25+ min na tej maszynie); wynik niezweryfikowany. Przeszło lokalnie: tests/z40-plakietka.test.mjs 6/6.
- Źródło plików: https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/<język Apple> (35 plików: pl en cs sk hu ro bg hr sl sr lt lv et uk es es-419 pt pt-BR de fr it nl sv da nb fi tr el id ms vi ru ja ko zh-Hant), odczyt 2026-11-28.

## Następny krok
1. Sprawdzić wynik CI #113 (zielony = koniec); przy czerwonym: log zadania, ocenić, czy to plakietka, czy stan wyjściowy.
2. Powtórzyć `npm run dane` + `npm test` lokalnie nie jest konieczne, jeśli CI zielone.
3. Właściciel: weto do sr/es-419; `appStoreId` przy publikacji.

## Pułapki
- `npm ci` i `npm run dane` trzeba uruchomić przed testami; zrzuty: `ATLAS_CHROME=/opt/pw-browsers/chromium node pomiary/plakietka/zrzuty.mjs`.
- Pełny `npm test` buduje stronę wielokrotnie (GB RAM, dziesiątki minut) — nie uruchamiać dwa razy równolegle.
- Pliki SVG nie wolno przeformatowywać (suma SHA-256 w teście); hr i uk bez <title> to norma Apple.

## Decyzje (analogia, do weta)
1. `sr` → plakietka angielska; `es-419` → es-mx; `nb` → no-no; `zh-Hant` → zh-tw.
2. `appStoreId` zostaje puste (ustawia właściciel przy publikacji).
3. `ZRODLA.json` trafia też do dist (cały katalog assets/ jest kopiowany) — nieszkodliwe, do ewentualnego wykluczenia.

---

---
## Wcześniej (BO i integracja)

# STAN-AGENTA (sesja BO, 28.11.2026, rola 08-programista build)
Gałąź `strona/przeklad-poprawki`. Koordynator zakończył pracę przed końcem (limit konta); CI nie sprawdzone.

## Zrobione (kod i testy: tests/przeklad-api.test.mjs, 48 testów, wszystkie zielone; nowe 15 były czerwone przed zmianą)
1. `--jezyki` / wejście `jezyki` w obu workflowach (wzorzec w powłoce i w skrypcie, kody z config.json).
2. max_tokens: grecki współczynnik 2,6; podział źródła na części > 16 000 tokenów wyjścia (przegląd 30 000), custom_id `pr-<źródło>-p<N>-<język>`, scalanie raportów; granica kosztu dalej z sumy max_tokens, limity 6/80 USD nietknięte.
3. Spacje: przyczyna = `v.trim()` w parsujOdpowiedz (nie model). `zachowajSpacje` + zdanie w obu promptach + poprawki przeglądu.
4. Istniejące tłumaczenia pomijane (tylko brakujące pozycje), `--nadpisz` / wejście `nadpisz` (tylko przekład).
5. Licznik z gałęzi tekstów: `--wydatki-galaz`, scalanie po batch_id, nigdy nie obniża sumy, limit tylko ze stałej.
Opis: docs/przeklad/README.md (sekcja „Zmiany 28.11.2026”).

## Wynik testów
- tests/przeklad-api.test.mjs: 48/48 zielone.
- Cały `npm test` na czystym main (przed zmianami): 118 pass, 3 fail: build.test, jezyki-podglad.test, straznicy-startu.test (niezwiązane z przekładem; przyczyna niezbadana). Pełnego zestawu po zmianach nie dokończono (przerwany).

## Zostało / następny krok
- Sprawdzić tests.yml na gałęzi po pushu; ustalić, czy 3 testy wyżej padają też w CI na main.
- Brak pomiaru rzeczywistego zapotrzebowania greki: współczynnik 2,6 i podział to hipoteza [DO USTALENIA po przebiegu el].
- PR do main otwiera koordynator; płatnych przebiegów nie uruchamiano.

## Pułapki
- `--wznow` wymaga tego samego stanu plików celów co przy wysłaniu (podział i pomijanie od nich zależą).
- Przekład domyślnie pomija istniejące: stary `el` ma szablony i prawne, brak `nazwy/el`, więc ponowienie jest tylko dla nazw.
- Ponowienie nazw el: workflow przekładu z main, `galaz_tekstow`=gałąź z tekstami, `zrodlo`=nazwy, `jezyki`=el, najpierw `tylko_szacuj`=tak (ok. 0,5 USD).

---
## Wcześniej (integracja-start)

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
