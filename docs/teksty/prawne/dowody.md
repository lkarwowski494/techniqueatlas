# Teksty prawne strony: twierdzenie → dowód (Z-20)

Stan kodu: `main` @ 21e056c (ta gałąź nie zmienia `src/`, `assets/` ani `tests/`). Pomiary i odczyty: 27.11.2026.
Każde twierdzenie z polityki, regulaminu i licencji o tym, co robi strona, ma tu dowód. Recenzent Z-23 sprawdza każdy wiersz na kodzie z dnia recenzji. **Gdy Z-31…Z-34 zmienią kod, ta tabela wymaga ponownego sprawdzenia przed Z-33** (zasada roli M8 nr 2: dokument opisuje stronę, jaka jest).

| ID | Twierdzenie | Dowód | Uwagi |
|---|---|---|---|
| D-1 | Bez kont, logowania i reklam | brak formularzy i pól logowania: `grep -rn "<form" src assets` → 0 trafień (27.11); jedyne pole `<input>` to wyszukiwarka (`src/pages.mjs:82`, `type="search"`, `autocomplete="off"`); brak skryptów reklamowych: `tests/straznik-analityka.test.mjs:9` (wzorce `googlesyndication`, `doubleclick`, `adsbygoogle`) | — |
| D-2 | Bez ciasteczek i pamięci przeglądarki | `tests/straznik-analityka.test.mjs:10` (wzorzec `document.cookie`, `localStorage`, `sessionStorage`, `indexedDB`, `navigator.serviceWorker`), test na kodzie przeglądarki `:31` i na zbudowanej stronie `:39`; README, „Bez ciasteczek, pamięci przeglądarki, analityki i zasobów zewnętrznych” | serwer hostingu też mógłby ustawiać ciasteczka w nagłówkach; nie sprawdzone na żywej stronie: **sprawdzić w Z-52** (`curl -sI` bez `Set-Cookie`) |
| D-3 | Brak formularzy, także kontaktowego | jak D-1; CSP `form-action 'none'` (`src/pages.mjs:18`) | — |
| D-4 | Bez analityki i narzędzi śledzących | `tests/straznik-analityka.test.mjs:9` (lista skryptów śledzących), `:31` (repozytorium), `:39` (zbudowana strona); decyzja „bez analityki (26.10)” w planie, sekcja „Bez zmian” | — |
| D-5 | Strona ładuje tylko własne pliki | CSP `default-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'` (`src/pages.mjs:18`); ikona `data:,` zamiast pliku (`src/pages.mjs:23`); test zasobów zewnętrznych `tests/straznik-analityka.test.mjs:13` i `:39` | odnośniki `<a>` do innych stron są dozwolone (`tests/straznik-analityka.test.mjs:2`), patrz D-12 |
| D-6 | Wyszukiwarka i filtry w przeglądarce; tekst zapytania nie jest wysyłany; filtry nie zmieniają adresu | `assets/szukaj.js:1` („filtry łączone bez zmiany adresu”), `:2` („zero połączeń poza własnymi plikami”), `:22` (import własnego `./idx/<język>.js`), `:24-27` (filtrowanie lokalne, wynik to linki); `assets/szukaj.js` bez `fetch`/`location`/`history` (`grep`, 27.11) | — |
| D-7 | Animacja ładuje własny plik danych; „Ogranicz ruch” odczytuje tylko przeglądarka | `assets/figura-strona.js:10` (import `./fig/<id>.js`), `:6` (`matchMedia('(prefers-reduced-motion: reduce)')`), `:15` (`paused = reduce`) | — |
| D-8 | Hosting zapisuje IP odwiedzającego ze względów bezpieczeństwa | https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages (odczyt 27.11.2026): „When a GitHub Pages site is visited, the visitor's IP address is logged and stored for security purposes, regardless of whether the visitor has signed into GitHub or not.”; hosting = GitHub Pages: `.github/workflows/pages.yml:1`, README wiersz 3 | czas przechowywania logów: **[DO USTALENIA] T-3** (nie znalazłem go w przeczytanych stronach) |
| D-9 | Prowadzący nie widzi logów hostingu i nie dostaje z nich raportów | **[DO USTALENIA] T-4**: żadna przeczytana strona tego nie potwierdza ani nie przeczy | do czasu potwierdzenia Z-23 może zamienić zdanie na „Strona nie ma własnych statystyk odwiedzin” (dowód D-4) |
| D-10 | Dostawca hostingu z USA, Ramy ochrony danych UE–USA | https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement (odczyt 27.11.2026), sekcja „Data Privacy Framework (DPF)”: „GitHub also complies with the EU-U.S. Data Privacy Framework (EU-U.S. DPF) … as set forth by the U.S. Department of Commerce.”; sekcja „International data transfers”: „GitHub stores and processes Personal Data in a variety of locations, including your local region, the United States, and other countries” | nazwa dostawcy na stronie: **[DO KONSULTACJI] PP-3** |
| D-11 | Opisy i lista działają bez JavaScriptu | `assets/szukaj.js:1` („Bez JS lista działa w całości”); `assets/figura-strona.js:10` (bez danych zostaje obraz statyczny i tekst); plan, „Stan zmierzony 27.11”: „treść ćwiczenia w zwykłym HTML (czytelna bez JS)” | — |
| D-12 | Przycisk App Store z oznaczeniem `techniqueatlas-<język>`, bez danych osoby | `src/pages.mjs:29` (`?ct=techniqueatlas-${m.lang}`) | tylko gdy `config.json` → `appStoreId` niepuste; dziś puste, więc przycisku nie ma. Zdanie wchodzi na stronę razem z Z-33 (appStoreId) |
| D-13 | Baner aplikacji pokazuje przeglądarka na podstawie znacznika | `src/pages.mjs:22` (`<meta name="apple-itunes-app">`) | jak D-12; czy przeglądarka łączy się przy tym z serwerem sklepu: **[DO USTALENIA] T-2** |
| D-14 | Kod strony i historia zmian są publiczne | repozytorium `lkarwowski494/techniqueatlas`: `private: false` (API GitHub, 27.11.2026) | — |
| D-15 | Zakres usługi: biblioteka (opis, mięśnie, wskazówki, błędy, zamienniki, rysunek), lista z filtrami, wyszukiwarka, wiele języków; bezpłatnie, bez rejestracji | README wiersz 3; plan, „JUŻ ZROBIONE”; brak płatności i kont: D-1 | — |

## [DO KONSULTACJI] (pytania do prawnika, bezpieczniejsza opcja, decyzja właściciela)

| ID | Pytanie | Bezpieczniejsza opcja (w projekcie) |
|---|---|---|
| PP-1 | Czy prowadzący stronę jest administratorem danych z logów hostingu, skoro ich nie zbiera i (T-4) nie ma do nich dostępu? | podać dane prowadzącego i kontakt, opisać logi hostingu |
| PP-2 | Czy odesłanie do dostawcy hostingu w sprawie logów wystarcza wobec praw z art. 15–22 RODO? | prowadzący przyjmuje żądanie i wskazuje dostawcę |
| PP-3 | Czy w polityce trzeba podać nazwę dostawcy hostingu, czy wystarcza kategoria? Art. 13 ust. 1 lit. e RODO mówi o „odbiorcach lub kategoriach odbiorców” (sformułowanie z FOR-02 roli M8; tekst aktu nieczytany dziś). Konflikt z zasadą właściciela „bez nazw innych firm” na stronie. | w projekcie kategoria; nazwa do decyzji właściciela, jeśli prawnik uzna ją za konieczną |
| R-1 | Czy bezpłatna strona z treściami, bez kont i formularzy, wymaga regulaminu z art. 8 UŚUDE? | krótki regulamin (projekt) |
| R-2 | Termin odpowiedzi na reklamację (ustawa go nie podaje) | 14 dni |
| R-3 | Zakres wyłączenia odpowiedzialności wobec konsumentów | zapis informacyjny bez wyłączenia odpowiedzialności za szkody |
| L-1 | Interpretacja „bez kopiowania grafik” (docs/54:188): rysunek na wydruku całej strony dozwolony, osobno nie | jak w projekcie; do weta właściciela |
| L-2 | Klauzula bazy danych (dyrektywa 96/9/WE, ustawa o ochronie baz danych) przeniesiona z LICENSE aplikacji; akty nieczytane dziś | brzmienie zgodne z LICENSE aplikacji |

## [DO USTALENIA]

T-1 źródło wartości `{{administrator}}` dla Z-33 · T-2 baner aplikacji a połączenia przeglądarki · T-3 czas przechowywania logów hostingu · T-4 dostęp prowadzącego do logów hostingu.

## Nie sprawdzono

- Żywa strona: nagłówki serwera (ciasteczka, `Referrer-Policy`) przed publikacją nie istnieją. Sprawdzenie w Z-52.
- Teksty aktów (RODO, UŚUDE, ustawa o ochronie baz danych) nie były dziś czytane u źródła. Odwołania do artykułów pochodzą z listy formalności roli M8 (źródła przeczytane 20.10.2026) i z LICENSE aplikacji. Recenzja Z-23 albo konsultacja może wymagać odczytu u źródła.
- Inne funkcje strony z fali 1 (plan w adresie F-05, CSV F-04, druk F-17) jeszcze nie istnieją. Ich dodanie wymaga zmiany polityki przed publikacją.
