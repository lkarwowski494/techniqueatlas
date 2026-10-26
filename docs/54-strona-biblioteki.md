# 54. Strona z biblioteką ćwiczeń (techniqueatlas.com) — specyfikacja

Stan: specyfikacja analityka z 26.10.2026 po decyzjach właściciela (sekcja niżej); implementacja szkieletu w tym repo. Decyzje właściciela: docs/18 (25.10 — strona, domena, anonimowość; 26.10 — osobne repo, start z 1.1). Liczby poniżej pochodzą z danych aplikacji na `main` (docs/50, docs/51). W stronie każda liczba ma być wyliczana z danych, nie wpisywana ręcznie.


## Decyzje właściciela 26.10.2026

Rozstrzygnięcia pytań z sekcji 16 (wszystkie zgodnie z rekomendacją analityka: D1 B, D2 A, D3 B, D4 A, D5 A, D6 A, D7 A, D8 A, D9 A, D10 B, D11 A, D12 A):

| Nr | Decyzja | Skutek w kodzie i testach |
|---|---|---|
| D1 | Indeksowane są tylko strony z własną treścią. Pozostałe istnieją i są linkowane, ale mają `noindex,follow`; reguła sama zdejmuje `noindex`, gdy ćwiczenie dostanie własną treść. | `src/pages.mjs` `robotsFor`: własna treść = wskazówki własne (`cues.scope = own`) kompletne w języku; testy w `tests/build.test.mjs` (D1, zdejmowanie noindex). |
| D2 | Nazwy ćwiczeń jak w aplikacji: angielskie w 34 językach poza PL (A). Segmenty adresów angielskie (D2b). | Nazwy z eksportu (`exName`), `lang="en"` na nazwach poza pl. |
| D3 | Publikujemy 35 języków; do indeksu idą PL, EN i języki po przeglądzie (konfiguracja per język). | `config.json` → `jezyki` (budowane) i `indeksujJezyki` (indeksowane). Dziś pl i en; kolejny język wymaga `src/ui/<język>.json` i przeglądu. |
| D4 | Bez analityki (A). | Strażnik `tests/straznik-analityka.test.mjs`; CSP `default-src 'self'`. |
| D5 | **A**: workflow strony pobiera publiczne repo aplikacji na przypiętym tagu lub commicie, uruchamia eksport i publikuje tylko HTML/SVG. Dane NIE są commitowane do repo strony. | `PIN.json` (repo, ref, commit), `src/sync-dane.mjs` (`npm run dane`), dane i silnik w `.cache/` (gitignore); strażnik `tests/straznik-dane.test.mjs`; lista wzorców źródeł pobierana razem z danymi. |
| D6 | A: filtr rodzin ruchu v2 (43 rodziny). | Strony `/{język}/movements/{rodzina}/`; etykiety: pl z aplikacji, en w `src/ui/en.json`; język bez etykiet rodzin nie pokazuje tego filtra (`.cache/raport-brakow.json`). |
| D7 | A: strona główna języka — wyszukiwarka i filtry na górze, „Podstawowe” poniżej. | `homePage`. |
| D8 | A: Smart App Banner bez `app-argument`. | `config.json` → `appStoreId` (puste = brak banera i linku); test. |
| D9 | A: `/` to wybór języka bez przekierowania. | `chooserPage`; test (brak refresh i skryptów). |
| D10 | B: bez znaczników pochodzenia w HTML. | Test: brak atrybutów `data-origin`/`data-key`/`data-id`/`data-source`. |
| D11 | A: lokalna wyszukiwarka nazw (indeks per język ≤ 25 KB gz). | `assets/szukaj.js`, `assets/idx/<język>.js`; test budżetu. |
| D12 | A: link do polityki prywatności `apps4brew.com/trening/privacy.html` w stopce. | `config.json` → `polityka`. |

Dodatkowo (koordynator, 26.10.2026): `indeksowanie = false` w `config.json` do startu z wersją 1.1 (noindex,nofollow na wszystkich stronach, `robots.txt` Disallow, brak map witryny); workflow Pages tylko ręcznie do tego czasu.

## Stan wdrożenia szkieletu (spike, 26.10.2026)

Zrobione: eksport z aplikacji (repo aplikacji, `scripts/strona/`), silnik figur v2 w przeglądarce, strona wyboru języka, strona główna języka, lista A–Z z filtrami, strony filtrów (partia, sprzęt, rodzina), strona ćwiczenia, 404, hreflang, canonical, mapy witryny per język, noindex (D1, D3, globalny), JSON-LD (BreadcrumbList, WebSite), CSP, meta generator, wyszukiwarka, strażnicy anonimowości, sekretów i analityki.

Odstępstwa i otwarte (do decyzji lub dalszej pracy):
- **Technika animacji:** w pkt 10 analityk oznaczył jako (a) prerender klatek SVG, (b) silnik w przeglądarce. Pomiar (pomiary/wyniki.md) wypadł odwrotnie: prerender to 360–2200 KB gz na figurę i 56 MB gz dla 87 figur (270 MB surowo), silnik w przeglądarce to 0,6–2 KB danych + 9,6 KB silnika; wybrany jest **silnik w przeglądarce** (rekomendacja programisty), obraz statyczny głównego widoku jest renderowany przy budowaniu.
- **Budżet HTML ≤ 20 KB:** spełniony (maks. ok. 20,3 KB przy ćwiczeniach z figurą — obraz statyczny tylko głównego widoku; drugi widok rysuje JS). Moduł danych figury ≤ 30 KB gz (test).
- **Języki:** zbudowane pl i en. Pozostałe 33 wymagają `src/ui/<język>.json` (słownik przez tłumacza) i przeglądu; do tego czasu nie są budowane (brak tekstu zastępczego, S10).
- **Warunek startu S6 (709/709 figur):** dziś 87 figur; `raport-brakow.json` w `.cache/` pokazuje liczby. Szkielet buduje strony także bez figury (do indeksu wchodzą tylko ze własną treścią — D1).
- **Sylwetka mięśni (pkt 3.5.5):** na razie tylko lista „główne / pomocnicze” i dopisek „Dobór mięśni: przybliżony”.
- **Stałe teksty „Zamienniki”, „Potrzebny sprzęt”, filtry itd.:** pl i en napisane przez agenta (`src/ui/`), do przeglądu tłumacza.
- **Pozycje statyczne (start i koniec) przy „Ogranicz ruch”:** obraz statyczny to pozycja skrajna; pełny wariant z dwiema pozycjami i podpisami — do zrobienia.
- **Strażniki S3 (znaki towarowe nazw), S4 (wersja w App Store), S6, S8 (skaner WCAG), S10 w pełnym zakresie:** niezrobione; zrobione S1 (anonimowość), S5 (liczby), S7 (hreflang, canonical, mapy, linki), S9 (prywatność, budżety).
- **hreflang `es-419` i `sr`:** otwarte (pkt 5); `src/taksonomia.mjs` oznacza je jako otwarte.
- **Slugi:** reguła z pkt 4 bez `slugs.lock.json` (zamrożenie przy pierwszej publikacji) i bez `slug-overrides.json`.

## 1. Cel
Pełna, publiczna biblioteka ćwiczeń aplikacji Trening w 35 językach. Prowadzi ruch z wyszukiwarki do App Store. Każda strona ma realną wartość: animacja ruchu, wskazówki, mięśnie, zamienniki, częsty błąd. Nie robimy masowych stron pod wyszukiwarkę.

## 2. Założenia i warunek startu
- Start razem z wydaną wersją 1.1 aplikacji. Warunek: 709/709 ćwiczeń ma gotową rodzinę figur v2. Dziś gotowe są 3 z 43 rodzin, czyli 87 ćwiczeń (docs/51).
- Hosting: osobne publiczne repo `techniqueatlas`, GitHub Pages publikowane przez workflow GitHub Actions, 0 zł poza domeną.
- Strona opisuje wyłącznie funkcje wydanej wersji. Dane są z tagu tej wersji.
- Publicznie zero wzmianek o źródłach, także ogólnych („sprawdzone”, „oparte na badaniach”, „według ekspertów”). Nie ma też poziomów pewności odwołujących się do badań.
- Wszelkie prawa zastrzeżone. Nie ma pliku danych do pobrania ani API.

**Ograniczenia hostingu** (przeczytane, docs.github.com „GitHub Pages limits”):
- opublikowana strona najwyżej 1 GB;
- miękki limit 100 GB transferu na miesiąc;
- wdrożenie przerywane po 10 min;
- limit 10 buildów na godzinę nie dotyczy publikacji własnym workflowem;
- Pages nie służy do prowadzenia „online business” ani SaaS — patrz ryzyko R7.

Strona nie wyśle własnych nagłówków HTTP. Dlatego hreflang trafia do HTML i sitemap, CSP do `<meta>`, a przekierowań serwerowych nie ma.

## 3. Struktura stron

Przy 709 ćwiczeniach i 35 językach jest 24 815 stron ćwiczeń, a do tego strony list.

**3.1 `/` — wybór języka (x-default)**
- Lista 35 języków, każdy we własnym zapisie (np. „Deutsch”, „日本語”).
- Logo i jedno zdanie po angielsku.
- Bez automatycznego przekierowania (decyzja D9).

**3.2 `/{lang}/` — strona główna języka**
- Kolejność: nagłówek z nazwą biblioteki → krótki akapit (co tu jest; wersja aplikacji z danych) → wyszukiwarka nazw (D11) → wejścia w filtry: partia, sprzęt, rodzina ruchu → „Podstawowe ćwiczenia” (flaga z aplikacji, ćwiczenia nie-niszowe; bez rankingu popularności, bo nie mamy danych) → przycisk App Store → stopka.
- Liczby (np. „709 ćwiczeń”) wyliczane z eksportu.

**3.3 `/{lang}/exercises/` — pełna lista A–Z**
- Sortowanie collatorem języka, tak jak w aplikacji.
- Każdy wiersz: nazwa, partia, główny sprzęt.
- Bez JS: pełna lista. Z JS: filtry łączone (partia × sprzęt × rodzina) bez zmiany adresu indeksowanego.

**3.4 Strony jednego filtra**
- Adresy: `/{lang}/muscles/{id}/`, `/{lang}/equipment/{id}/`, `/{lang}/movements/{id}/`.
- Tylko jeden wymiar naraz. Nie robimy stron kombinacji (ryzyko „doorway”).
- Partia: pole `group` ćwiczenia, etykiety jak w aplikacji (`t(group)`).
- Sprzęt: [DO WYJAŚNIENIA] które pole. Kandydaci: `loadSource` (12 wartości) albo grupy sprzętu `EQUIP_GROUPS` (8). Trzeba też sprawdzić, czy etykiety `loadSource` są przetłumaczone w aplikacji.
- Rodzina ruchu: decyzja D6.

**3.5 `/{lang}/exercises/{slug}/` — strona ćwiczenia (elementy w tej kolejności)**
1. Okruszki: Biblioteka › Partia › Ćwiczenie.
2. H1: nazwa wyświetlana tak jak w aplikacji w tym języku (`exName`). W 34 językach poza PL nazwa jest angielska, w znaczniku `lang="en"`.
3. Animacja figury v2:
   - przyciski „Zatrzymaj/Odtwórz”;
   - przełącznik widoku (bok/przód/góra), gdy rodzina ma więcej widoków;
   - „Pokaż częsty błąd”, gdy wariant ma błąd w `errors.ts` (7 błędów).
   - Bez liczb na rysunku. Napis „Kąt na rysunku” tylko jeśli jest w wydanej wersji — [DO WYJAŚNIENIA].
4. Opis tekstowy ruchu: sekcje „Ustawienie” i „Ruch” z wskazówek. Jest też tekstową alternatywą animacji.
5. Mięśnie:
   - sylwetka przód/tył (`lib/musclemap.ts` ma już `svgMarkup`) oraz lista „główne” (`muscleLoad` 1) i „pomocnicze” (0,5);
   - dopisek „Dobór mięśni: przybliżony” przy 105 ćwiczeniach, tak jak w aplikacji.
6. Wskazówki (sekcja „tips”). Przy wskazówkach wzorca ruchu dopisek „Ogólne wskazówki dla tego ruchu”, jak w aplikacji (CUE_POLICY A).
7. Częsty błąd: sekcja `mistakes` i skrót do animacji błędu.
8. Potrzebny sprzęt (`requires`, etykiety `capLabel`).
9. Zamienniki: 3 propozycje (`SWAP_TOP`) liczone tą samą funkcją rankingu co w aplikacji. Profil: nowy użytkownik, bez miejsca i historii, collator danego języka. Każda jest linkiem do strony zamiennika.
10. Wezwanie do App Store: jedno zdanie o tym, co aplikacja robi z tym ćwiczeniem (tylko funkcje z listy wydanej wersji, pkt 9) i oficjalna plakietka App Store.
11. Jedno zdanie: „W razie bólu lub urazu skonsultuj się ze specjalistą”.
12. Stopka: przełącznik języka (te same ćwiczenia w innych językach), © Apps4Brew, „Wszelkie prawa zastrzeżone”, prywatność (D12), wsparcie.

**3.6 `404.html`** — jedna w katalogu głównym, bo tak działa Pages. Krótki tekst w EN i lista linków do 35 stron głównych języków.

## 4. Adresy i slugi
- **Języki:** kody aplikacji (`LANGS`) małymi literami: `/pl/`, `/en/`, …, `/es-419/`, `/pt-br/`, `/zh-hant/`.
- **Segmenty:** stałe, angielskie, ASCII: `exercises`, `muscles`, `equipment`, `movements` (D2b).
- **Slug ćwiczenia:**
  - Jeden dla wszystkich języków, z angielskiej nazwy wyświetlanej (`exName` w `en`). Nazwy i tak są angielskie w 34 językach, a wspólny slug upraszcza hreflang.
  - Reguła: NFKD → bez znaków diakrytycznych → małe litery → „&” na „and” → apostrofy usunięte → każdy znak spoza `[a-z0-9]` na „-” → bez powtórzonych i skrajnych „-” → najwyżej 80 znaków.
  - Przykład: „Farmer's Walk (Farmers Handles)” → `farmers-walk-farmers-handles`.
- **Kolizje:** dwa ćwiczenia z tym samym slugiem przerywają build. Rozstrzyga ręczna tabela `slug-overrides.json`.
- **Stałość:**
  - Po publikacji slug jest zamrożony w `slugs.lock.json` (klucz: klucz katalogu → slug).
  - Zmiana nazwy w aplikacji nie zmienia sluga.
  - Usunięcie lub zmiana sluga: stara strona zostaje jako przekierowanie (meta refresh 0 s plus canonical na nowy adres) — [DO WYJAŚNIENIA, badacz: czy wyszukiwarka traktuje to jak przekierowanie].
- Id partii, sprzętu i rodziny to identyfikatory z kodu (`chest`, `barbell`, `squat`).

## 5. SEO
Źródła przeczytane:
- developers.google.com/search/docs/specialty/international/localized-versions
- …/essentials/spam-policies
- …/crawling-indexing/sitemaps/build-sitemap

**hreflang**
- Każda strona wymienia siebie i wszystkie wersje językowe. Google: „Each language version must list itself as well as all other language versions”.
- Wersje muszą linkować się wzajemnie. Do tego `x-default` → `/`.
- Kody: ISO 639-1, opcjonalnie region ISO 3166-1 alpha-2 lub pismo ISO 15924. `zh-Hant` jest poprawne.
- Google wprost nie obsługuje `es-419`: „such as es-419, aren't supported”. [DO WYJAŚNIENIA, badacz/programista] Proponuję dla strony `/es-419/` kilka wartości (`es-MX`, `es-AR`, `es-CO`, … `es-US`) na ten sam adres. Lista `ES_419_REGIONS` w aplikacji zawiera też BR i JP — nie przenosić jej bez sprawdzenia.
- `sr`: aplikacja pisze cyrylicą (`sr-Cyrl-RS`) → `sr-Cyrl` [do potwierdzenia].
- Google nie rozpoznaje języka po hreflang ani po `lang`, tylko po treści. Każda strona musi być naprawdę w swoim języku (pkt 7, „inny język”).

**Duplikaty**
- Google: „Localized versions of a page are only considered duplicates if the main content of the page remains untranslated”.
- Z tego wynika zasada: na stronie języka nie ma treści głównej w innym języku. Zastępczy tekst z en/pl jest zakazany (aplikacja ma taki fallback, strona nie).

**canonical** — na każdej stronie wskazuje ją samą (ten sam język). Nigdy nie wskazuje innego języka. Filtry JS nie tworzą adresów kanonicznych.

**Sitemap**
- Limit: „50MB (uncompressed) or 50,000 URLs” na plik.
- Przy 35 alternatywach `xhtml:link` na adres jeden plik przekroczy 50 MB. Dlatego indeks sitemap plus osobny plik na język.
- Do sitemap trafiają tylko strony indeksowane (D1, D3).
- `lastmod` = data wydania, z którego pochodzą dane, tylko gdy treść strony się zmieniła. Google używa `lastmod` tylko, gdy jest dokładne. `priority` i `changefreq` pomijamy, bo Google je ignoruje.

**Dane strukturalne (tylko uczciwe typy)**
- `BreadcrumbList` na stronach ćwiczeń i filtrów.
- `WebSite` (nazwa strony) na `/{lang}/`.
- Bez `HowTo`: według bloga Google z 08.2023 przestano pokazywać takie wyniki rozszerzone — przeczytałem tylko streszczenie wyszukiwarki, do potwierdzenia przez badacza.
- Bez `VideoObject`, bo to nie wideo.
- Bez `SoftwareApplication` z ocenami lub cenami, bo nie mamy takich danych na stronie.
- Bez `FAQPage`.

**`robots.txt`** — wszystko dozwolone plus adres indeksu sitemap. `noindex,follow` w `<meta>` dla stron wyłączonych z indeksu (D1, D3).

**Treści masowe** — Google definiuje nadużycie jako „many pages are generated for the primary purpose of manipulating search rankings and not helping users”. Wśród przykładów jest tłumaczenie automatyczne „where little value is provided”. Środki zaradcze:
- tylko własna treść z aplikacji;
- `noindex` dla stron bez własnej treści głównej (D1);
- bez stron kombinacji filtrów;
- bez tekstów generowanych pod frazy.

## 6. Dostępność (WCAG 2.2 AA)
- **Animacja:** przycisk pauzy widoczny od razu (2.2.2).
  - Przy `prefers-reduced-motion: reduce` animacja nie startuje sama. Pokazujemy pozycje kluczowe (wyjściową i skrajną) z podpisami, jak „Ogranicz ruch” w aplikacji.
  - Bez JS też widać pozycje statyczne.
- **Tekstowa alternatywa:** obraz z etykietą „Rysunek ruchu: {nazwa}” i odwołaniem do sekcji „Ustawienie” i „Ruch”.
  - [DO WYJAŚNIENIA] co z 69 ćwiczeniami bez tekstu wskazówek: tylko etykieta plus mięśnie i sprzęt? Patrz D1.
- **Kontrast:** tekst ≥ 4,5:1, elementy grafiki ≥ 3:1 (1.4.11). Kolory z tokenów aplikacji (`lib/theme`, `figurePalette`) w jasnej i ciemnej palecie. Do tego `forced-colors`.
- **Ciemny wygląd:** `prefers-color-scheme`, jak dziś w `site/index.html`.
- **Klawiatura:** cała strona obsługiwana z klawiatury, widoczny fokus. Przełączniki mają `aria-pressed`.
- **Języki i nagłówki:** `lang` na `<html>` i `lang="en"` na nazwach angielskich w innych językach, żeby VoiceOver przeczytał je poprawnie (jak DEC-13 w aplikacji). Hierarchia nagłówków h1 → h2 po sekcjach.
- **Układ:** przepływ przy 320 px CSS i powiększeniu 200% bez przewijania w poziomie (1.4.10). Długie słowa zawijane (`hyphens: auto` z `lang`).

## 7. Stany

| Stan | Zachowanie |
|---|---|
| Pusty | Strony statyczne nie bywają puste. Kombinacja filtrów JS z wynikiem 0 → „Brak ćwiczeń dla tych filtrów” i przycisk „Wyczyść filtry”. Wyszukiwanie bez wyniku → ten sam wzór. |
| Pierwszy raz | Każda wizyta jest „pierwsza” (bez ciasteczek i bez localStorage). Brak banera zgody, bo nie ma czego zgadzać. |
| Błąd | Zły adres → `404.html` (pkt 3.6). Animacja się nie wczyta → pozycje statyczne plus tekst; strona dalej użyteczna. |
| Offline | Strona statyczna, bez service workera (poza zakresem). Strona już otwarta działa dalej, łącznie z animacją (bez zapytań w tle). |
| Długi tekst | Najdłuższe nazwy (np. „Decline Close-Grip Bench To Skull Crusher”) i długie etykiety (de, fi, hu) zawijają się bez obcinania. W tytule i opisie meta obcina wyszukiwarka, nie my. |
| Inny język | 35 języków. Brak tekstu w danym języku → sekcja nie jest pokazywana, a strona dostaje `noindex`. Nigdy fallback na en/pl. Na `main` 52 id nie ma nawet tekstu PL (docs/50). Raport braków per język w buildzie. |
| Ciemny wygląd | Paleta ciemna z tokenów aplikacji, w tym figura. Kontrast sprawdzany w obu motywach i w `forced-colors`. |
| VoiceOver | Kolejność czytania = kolejność z pkt 3.5. Animacja to jeden obraz z etykietą; przyciski z nazwą i stanem. Plakietka App Store z etykietą tekstową. |

## 8. Prywatność
- **Stan wyjściowy:** bez ciasteczek, bez localStorage, bez skryptów i zasobów zewnętrznych (fonty systemowe, wszystko z tej samej domeny). CSP w `<meta>`: `default-src 'self'`.
- **Pomiar** — decyzja D4.
- [DO WYJAŚNIENIA, badacz/prawnik] Hosting zapisuje adres IP w logach serwera. Czy potrzebna jest osobna informacja o prywatności strony i jak ją sformułować (D12).

## 9. Zgodność z wydaną wersją i powiązanie z App Store
- **Eksport z tagu wydania:**
  - `manifest`: wersja, build, `CATALOG_REV`, SHA tagu, lista języków, liczby.
  - Lista funkcji wydanej wersji: identyfikatory funkcji plus zatwierdzone zdania, w 35 językach przez `t()`.
  - Wezwanie do App Store bierze zdania tylko z tej listy.
- **Link:** `https://apps.apple.com/app/id{APPLE_ID}` plus token kampanii App Store Connect (`ct=techniqueatlas-{lang}`), żeby w ASC było widać ruch ze strony. Format adresu i tokenu — [DO WYJAŚNIENIA, badacz].
- **Smart App Banner:** `<meta name="apple-itunes-app" content="app-id=…">`, bez `app-argument` (D8). Strony Apple nie udało się przeczytać — szczegóły do potwierdzenia przez badacza. Działa tylko w Safari na iOS.
- **Plakietka:** oficjalna grafika Apple, lokalizowana. Zasady użycia do sprawdzenia przez badacza.
- **Ceny:** strona nie podaje cen, bo zależą od kraju i się zmieniają.
- **Tekst:** strona ma własne zdania, nie kopiuje opisu ze sklepu (pkt 12, R5).

## 10. Wydajność (budżet; liczby to konwencja produktu do zatwierdzenia, nie wiedza dziedzinowa)
- HTML strony ćwiczenia ≤ 20 KB bez kompresji. Same znaczniki hreflang to ok. 3 KB.
- Animacja jako osobny, wspólny dla języków plik `/assets/fig/{slug}…` ≤ 30 KB, z pamięcią podręczną przeglądarki.
- JS (pauza, przełączniki, filtry, wyszukiwarka) ≤ 15 KB na stronę, opcjonalny (strona działa bez niego). Indeks wyszukiwania ≤ 25 KB na język, ładowany dopiero po wejściu w pole.
- Cała opublikowana strona ≤ 700 MB, build przerywany przy 800 MB (limit Pages 1 GB). Szacunek: 24 815 × 20 KB ≈ 0,5 GB.
- Zero zapytań do innych domen. Docelowo „dobre” Core Web Vitals — progi do podania przez badacza ze źródła.
- **Technika animacji w przeglądarce — decyzja programisty**, z wymaganiami: bez JS widać pozycje statyczne, pauza działa, reduced-motion respektowane, mieści się w budżecie. Warianty: (a) klatki policzone przy buildzie i zapisane jako SVG z animacją deklaratywną; (b) silnik v2 przeniesiony do przeglądarki (ok. 115 KB źródła). Rekomendacja: (a).

## 11. Czego strona NIE robi
- Nie ma kont, logowania serii, planów ani generatora.
- Nie ma pobierania danych (JSON, CSV, API, ZIP) ani komentarzy i treści użytkowników.
- Nie ma reklam (decyzja 25.10) ani newslettera.
- Nie ma ciasteczek i śledzenia (przy D4 A).
- Nie podaje źródeł, autorów, bibliografii, „sprawdzone przez”, poziomów pewności z odwołaniem do badań.
- Nie porównuje z innymi aplikacjami i nie używa nazw innych firm.
- Nie udziela porad medycznych.
- Nie podaje cen.
- Nie zapowiada funkcji z przyszłych wersji.
- Nie ma tekstów pisanych pod frazy ani stron kombinacji filtrów.
- Nie tłumaczy automatycznie w czasie działania. Teksty pochodzą wyłącznie z wydania aplikacji, a teksty interfejsu strony — ze słownika przejrzanego przez tłumacza.

## 12. Strażnicy (każdy przerywa build; uruchamiani w workflow strony)
- **S1 anonimowość:**
  - skaner wygenerowanego HTML i SVG szuka nazw organizacji, autorów, tytułów i adresów z `data/zrodla/*.json` (tylko w czasie budowania, nigdy nie publikowane);
  - szuka też słów ogólnych o źródłach z istniejącego strażnika aplikacji;
  - [DO WYJAŚNIENIA] strażnik ma słowa ogólne tylko dla PL/EN — potrzebna lista dla 33 pozostałych języków (tłumacz plus recenzent).
- **S2 nazwy firm:** lista z `tests/forbidden-names.json` zastosowana do HTML.
- **S3 znaki towarowe (R-016):** każda nazwa ćwiczenia ma w `trademark-check.json` status „sprawdzone” z datą. Brak statusu → build przerwany.
- **S4 wersja:**
  - dane tylko z tagu wydania;
  - `manifest.appVersion` równa się wersji w App Store — sprawdzane publicznym wyszukiwaniem po ID, [DO WYJAŚNIENIA, badacz: czy ta usługa jest stabilna];
  - zdania o funkcjach tylko z listy funkcji wydania.
- **S5 liczby:** szablony nie zawierają liczb wpisanych na sztywno. Wszystkie liczby (ćwiczenia, języki, zamienniki) pochodzą z eksportu (test szuka cyfr w szablonach, z listą wyjątków z powodem).
- **S6 warunek startu:** każde ćwiczenie ma gotową rodzinę v2 (709/709) albo build pierwszej publikacji jest przerwany.
- **S7 SEO:**
  - hreflang wzajemny i kompletny, kody z dozwolonej listy;
  - canonical wskazuje stronę samą;
  - w sitemap tylko strony indeksowane;
  - strony `noindex` nie są w sitemap;
  - brak osieroconych stron;
  - wszystkie linki wewnętrzne działają;
  - slugi zgodne z `slugs.lock.json`.
- **S8 dostępność:** automatyczny skaner WCAG na próbce (wszystkie języki × 5 ćwiczeń × 2 motywy × reduced-motion). Kontrast palet. `lang` na `<html>`.
- **S9 prywatność i wydajność:** CSP obecne; zero zewnętrznych adresów w HTML; brak `document.cookie` i `localStorage` w JS; budżety z pkt 10.
- **S10 język:** zero kluczy bez tłumaczenia w języku strony (bez fallbacku). Raport braków.

## 13. Wymagania wobec repo aplikacji
- **Skrypt eksportu w repo aplikacji** (np. `scripts/site/export-atlas.mjs`):
  - używa tych samych funkcji co aplikacja (`exName`, `cuesFor`, ranking zamienników, `svgMarkup`, silnik v2), bez kopiowania logiki;
  - test w verify aplikacji: eksport się udaje, a jego zawartość zgadza się z tym, co pokazuje ekran ćwiczenia.
- **Zawartość per ćwiczenie:**
  - klucz katalogu, slug, nazwa per język;
  - `group`, mięśnie (główne i pomocnicze z `muscleLoad`), flaga „przybliżony”;
  - `requires`, `loadSource`, rodzina i widoki, flaga niszowe;
  - flagi: własne wskazówki / ogólne / brak;
  - teksty sekcji `setup`, `move`, `tips`, `mistakes` per język, błędy figury;
  - zamienniki top 3 per język;
  - klatki animacji lub gotowe SVG (normalnie, z błędem, pozycje statyczne).
- **Słowniki:** etykiety partii, sprzętu i rodzin oraz teksty interfejsu strony — nowe klucze przez `t()` i `lib/i18n.en.ts`, tłumacz dla 35 języków.
- **Wykluczone z eksportu:**
  - `data/zrodla`, `basis`, `CATALOG_RESEARCH`, poziomy pewności, komentarze;
  - znaczniki pochodzenia (D10).
- **Przypięcie wersji:** eksport wyłącznie z tagu `v1.1.0-b…` i kolejnych. Strona zapisuje w `manifest` i w `<meta name="generator">` wersję i SHA. Nowa wersja strony powstaje tylko przy nowym wydaniu aplikacji.
- **Przepływ danych:** decyzja D5.

## 14. Ryzyka
- **R1 dane już publiczne:** repo aplikacji jest publiczne. Widać w nim `lib/catalog.generated.ts`, `lib/cues/text/*.json` i `data/zrodla/` z pełnymi źródłami. Komentarz w `lib/swap.ts` nazywa bazę, z której pochodzi katalog. Zakaz pobierania hurtem chroni licencja (pkt „baza danych” w LICENSE, 25.10), nie technika. Strona nie pogarsza tego stanu, jeśli nie publikuje czystego pliku danych (D5).
- **R2 treści masowe:** 24 815 stron z jednego szablonu; 538 ćwiczeń ma wskazówki wspólne dla rodziny, a 69 nie ma tekstu (docs/50). Zaradczo: D1, D3, pkt 5.
- **R3 tłumaczenia bez przeglądu:** teksty w 33 językach są „do przeglądu native speakerów” (R-010). Publiczne teksty techniki w słabym tłumaczeniu szkodzą jakości i ocenie przez Google (D3).
- **R4 nazwy angielskie w 34 językach:** strony mogą nie odpowiadać na lokalne zapytania (np. de „Kniebeuge”). D2.
- **R5 duplikat z App Store:** kopiowanie opisu ze sklepu powiela treść i rozjeżdża się po zmianach. Własne zdania z listy funkcji.
- **R6 rozjazd z aplikacją:** zamienniki i teksty zmieniają się z wydaniem. S4 i eksport z tagu.
- **R7 regulamin Pages:** strona promuje płatną aplikację. Do oceny przez badacza, czy to „online business”. Plan zapasowy: inny darmowy hosting statyczny (bez nazw w repo).
- **R8 rozmiar i czas wdrożenia:** zbliżanie się do 1 GB i 10 min. Budżet z pkt 10 i pomiar w buildzie.
- **R9 anonimowość w 33 językach:** strażnik słów ogólnych nie pokrywa tych języków (S1).
- **R10 sprzeczność w zgłoszeniu 1.0:** tekst promocyjny w docs/48 mówi o „wskazówkach ze źródłami”, a od 25.10 obowiązuje anonimowość. To poza zakresem strony, ale do poprawy przed wysłaniem 1.0 (koordynator).
- **R11 slugi:** zmiana nazwy w katalogu nie może zmienić adresu (lock).
- **R12 przenosiny repo aplikacji:** jeśli repo aplikacji kiedyś stanie się prywatne, wariant D5 A przestaje działać bez sekretu.

## 15. Kryteria akceptacji (testowalne)
- **Wybór języka (`/`):** 35 linków; `x-default` wskazuje `/`; zero przekierowań; skaner WCAG bez błędów.
- **Strona główna języka:**
  - `lang` poprawny;
  - liczby równe eksportowi (S5);
  - linki do wszystkich wartości partii, sprzętu i rodzin z danych;
  - lista podstawowych równa zbiorowi nie-niszowych z eksportu.
- **Lista i filtry:**
  - lista A–Z ma wszystkie ćwiczenia z eksportu, posortowane collatorem języka (test porównuje z aplikacją);
  - każda strona filtra zawiera dokładnie ćwiczenia o tej wartości;
  - bez JS lista działa;
  - z JS kombinacja 0 wyników pokazuje komunikat i „Wyczyść filtry”;
  - adresy z parametrami filtrów nie trafiają do sitemap i mają canonical do strony listy.
- **Strona ćwiczenia:**
  - elementy w kolejności z pkt 3.5;
  - nazwa = `exName` aplikacji w danym języku;
  - mięśnie i dopisek „przybliżony” zgodne z aplikacją dla 100% ćwiczeń;
  - zamienniki = top 3 rankingu aplikacji (profil nowego użytkownika) dla każdego języka;
  - dopisek „Ogólne wskazówki dla tego ruchu” dokładnie tam, gdzie w aplikacji;
  - przełącznik błędu tylko przy wariantach z błędem;
  - brak sekcji bez tekstu w danym języku.
- **Animacja:**
  - pauza widoczna i działa klawiaturą;
  - przy reduced-motion brak autostartu i widoczne pozycje statyczne z podpisami;
  - bez JS pozycje statyczne;
  - kontrast elementów ≥ 3:1 w obu motywach;
  - plik ≤ 30 KB.
- **Slugi i adresy:** zgodne z regułą z pkt 4; brak kolizji; `slugs.lock.json` niezmieniony bez wpisu przekierowania; ten sam slug we wszystkich językach.
- **SEO:**
  - S7 zielony;
  - każdy plik sitemap ≤ 50 000 adresów i ≤ 50 MB;
  - dane strukturalne tylko z dozwolonych typów, poprawne w walidatorze;
  - strony `noindex` zgodnie z D1 i D3.
- **Prywatność:** zero zewnętrznych żądań przy otwarciu (test w przeglądarce bezgłowej); brak ciasteczek i `localStorage`; CSP obecne.
- **App Store:** link i baner zawierają poprawne ID z jednego pliku konfiguracji; zdania wezwania tylko z listy funkcji wydania (S4).
- **Strażnicy S1–S10:** każdy ma test, który celowo podstawiony błąd (nazwa źródła, nazwa firmy, liczba na sztywno, brak tłumaczenia, niesprawdzony znak towarowy, ćwiczenie bez figury v2) przerywa build.
- **Dostępność:** skaner WCAG 2.2 AA bez błędów na próbce z S8. VoiceOver na iPhonie: krótka lista „tylko telefon” — odczyt nazwy angielskiej, pauza animacji, baner.

## 16. Decyzje dla właściciela
Proponowana kolejność pytań, pojedynczo, od najbardziej blokujących: D1, D3, D2, D5, D4, D6, potem reszta.

**D1. Indeksowanie stron bez własnej treści** (538 z ogólnymi wskazówkami rodziny, 69 bez tekstu)
- A — indeksowane wszystkie 709. Kompromis: większy zasięg, ale ryzyko oceny jako treść masowa, bo setki stron mają ten sam tekst wskazówek.
- B — wszystkie strony istnieją i są linkowane; indeksowane tylko te z własnymi wskazówkami (dziś 102) lub własnym częstym błędem; reszta `noindex,follow`, a reguła zdejmuje `noindex`, gdy ćwiczenie dostanie własną treść. Kompromis: mniejszy zasięg na start, bezpieczna jakość.
- C — dla ćwiczeń z ogólnymi wskazówkami jedna strona rodziny zamiast stron ćwiczeń. Kompromis: mniej stron, ale gorzej odpowiada na zapytanie o konkretne ćwiczenie.
- **Rekomendacja: B.**

**D2. Nazwy ćwiczeń w 34 językach poza PL** (aplikacja pokazuje angielskie)
- A — tylko angielskie, jak w aplikacji. Kompromis: pełna zgodność z aplikacją, słabsze trafienia na lokalne zapytania.
- B — angielska nazwa plus lokalna nazwa zwyczajowa („także: …”). Kompromis: lepsze SEO, ale 709 × 33 nowych tekstów do tłumacza i recenzenta, sprawdzenie znaków towarowych dla każdej nazwy i rozjazd z aplikacją (chyba że aplikacja dostanie to samo).
- **Rekomendacja: A na start.** B ewentualnie później, razem z tą samą zmianą w aplikacji.
- D2b (mniejsze): segmenty adresów angielskie we wszystkich językach (rekomendacja) albo tłumaczone (więcej kolizji i tłumaczeń, minimalny zysk).

**D3. Języki bez przeglądu native speakera** (R-010)
- A — 35 języków indeksowanych od startu. Kompromis: pełny zasięg, ryzyko jakości i oceny tłumaczeń.
- B — 35 języków publikowanych; indeksowane PL, EN i języki po przeglądzie; reszta `noindex` do przeglądu. Kompromis: zasięg rośnie wraz z przeglądami.
- **Rekomendacja: B.** Jedna linijka w konfiguracji na język.

**D4. Pomiar**
- A — bez analityki. Darmowe narzędzie wyszukiwarki dla webmasterów (kliknięcia i wyświetlenia, bez skryptu na stronie; weryfikacja domeny przez DNS) plus token kampanii w linku App Store (wejścia i pobrania w App Store Connect). Kompromis: brak danych o zachowaniu na stronie, pełna prywatność, 0 zł.
- B — analityka bez ciasteczek. Kompromis: więcej danych, ale własny serwer (koszt) albo usługa firmy trzeciej (koszt lub prywatność, zmiana informacji o prywatności).
- **Rekomendacja: A.**

**D5. Przepływ danych do repo strony**
- A — workflow strony pobiera publiczne repo aplikacji na wskazanym tagu, uruchamia eksport i build, a publikuje tylko HTML/SVG przez Pages. W repo strony nie ma danych ani nowego sekretu. Kompromis: zależy od tego, czy repo aplikacji zostanie publiczne (R12).
- B — eksport JSON commitowany do repo strony. Kompromis: prostsze, ale publikuje czysty zbiór danych (wbrew „nie do pobrania hurtem”).
- C — workflow aplikacji pushuje do repo strony. Kompromis: wymaga nowego sekretu (klucz wdrożeniowy), wbrew zasadzie „bez nowych sekretów”.
- **Rekomendacja: A.**

**D6. „Rodzina ruchu” w filtrach**
- A — 43 rodziny figur v2. Kompromis: zgodne z animacjami; etykiety są dziś tylko po polsku i bywają długie, więc trzeba je skrócić i przetłumaczyć (43 × 34).
- B — 16 wzorców ruchu z katalogu (`pattern`). Kompromis: mniej pracy, ale „isolation”, „other” i „mobility” słabo pomagają w przeglądaniu; w aplikacji nie znalazłem dla nich etykiet.
- C — bez tego filtra na start.
- **Rekomendacja: A.**

**D7. Strona główna języka**
- A — wyszukiwarka i filtry na górze, „Podstawowe” poniżej. Kompromis: szybkie dojście do ćwiczenia.
- B — akapit o aplikacji i przycisk App Store na górze. Kompromis: mocniejsza promocja, słabsza użyteczność (a strona ma dawać realną wartość).
- **Rekomendacja: A.**

**D8. Smart App Banner**
- A — tak, bez `app-argument`. Kompromis: dodatkowe wejście do sklepu w Safari na iOS, zajmuje kawałek ekranu.
- B — nie, tylko przycisk w treści.
- **Rekomendacja: A.** Głębokie linki do ćwiczenia dopiero, gdy aplikacja je obsłuży — [DO WYJAŚNIENIA: dziś nie znalazłem takiej obsługi].

**D9. Adres `/`**
- A — strona wyboru języka bez przekierowania. Kompromis: jedno kliknięcie więcej; przewidywalne i zgodne z `x-default`.
- B — przekierowanie skryptem według języka przeglądarki. Kompromis: wygodniej, ale ryzyko złego języka, problemy z robotami i dodatkowy JS.
- **Rekomendacja: A.** Na `/` można wyróżnić język przeglądarki bez przekierowania.

**D10. Znaczniki pochodzenia w HTML** (niewidoczne identyfikatory z katalogu, 25.10)
- A — tak, jako atrybuty danych. Kompromis: dowód kopiowania przy sporze; rośnie rozmiar strony i znaczniki stają się publiczne (łatwo je usunąć).
- B — nie.
- **Rekomendacja: B.** Ochronę daje licencja; znaczniki zostają w danych aplikacji.

**D11. Wyszukiwarka na stronie**
- A — tak, lokalny indeks nazw per język (≤ 25 KB, ładowany na żądanie). Kompromis: wygoda, trochę JS.
- B — nie, wystarczą lista A–Z i filtry.
- **Rekomendacja: A.**

**D12. Informacja o prywatności strony**
- A — link w stopce do istniejącej polityki `apps4brew.com/trening/privacy.html` (PL/EN, zgodnie z decyzją o dwóch językach) plus akapit o stronie (brak ciasteczek, logi hostingu).
- B — osobna strona prywatności `techniqueatlas` w 35 językach. Kompromis: lepsza dla użytkownika, ale ryzyko rozjazdu wersji (powód odrzucenia 35 języków dla polityki).
- **Rekomendacja: A.** Treść do sprawdzenia przez badacza lub prawnika.

## 17. [DO WYJAŚNIENIA]
1. Wpisy właściciela z 26.10 (osobne repo, start z 1.1) i R-016 nie występują na `main` — dopisać do docs/18 i docs/40.
2. Stan sprawdzenia znaku towarowego dla domeny (TMview, klasy 9/41/44) i zakup domeny.
3. App Store ID (Apple ID) do jednego pliku konfiguracji strony.
4. Pole „sprzęt” w filtrze (`loadSource` czy `EQUIP_GROUPS`) i czy jego etykiety są tłumaczone w aplikacji.
5. hreflang dla `es-419` (lista regionów) i `sr` (pismo) — badacz i programista.
6. Napis „Kąt na rysunku” i dopiski poziomu pewności z odwołaniem do badań (np. „Przypisanie partii: przegląd badań.”): czy w 1.1 jeszcze istnieją i czy nie łamią anonimowości. Na stronie pominięte.
7. Słowa ogólne o źródłach dla 33 języków w strażniku (S1).
8. Badacz:
   - Smart App Banner (strona Apple nieprzeczytana);
   - zasady plakietki App Store;
   - format linku i tokenu kampanii;
   - publiczne wyszukiwanie wersji po ID (S4);
   - status `HowTo` i `BreadcrumbList`;
   - meta refresh jako przekierowanie;
   - progi Core Web Vitals;
   - regulamin Pages wobec strony promującej płatną aplikację;
   - logi IP hostingu.
9. Co pokazać przy 69 ćwiczeniach bez tekstu wskazówek, poza wariantem D1.
10. Nowe repo dostaje własny CLAUDE.md i własne verify. Macierz testów i Maestro z repo aplikacji go nie obejmują, ale eksport po stronie aplikacji — tak (test plus wpis w `tests/przeplywy.json` nie jest potrzebny, bo to nie przepływ w aplikacji; do potwierdzenia przez koordynatora).

## 18. Nakład
- **Praca agenta** (szacunek, z pracą równoległą):
  - eksport w repo aplikacji z testem zgodności: ok. 1 dzień;
  - generator stron i szablony: 1–2 dni;
  - animacja w przeglądarce, wariant (a): ok. 1 dzień;
  - strażnicy S1–S10: ok. 1 dzień;
  - słownik interfejsu strony, 35 języków przez API: kilka godzin plus przegląd.
- **Na co się czeka:** gotowość 709/709 figur v2 (ok. 126 h pracy agenta wg docs/51), wydanie 1.1, propagacja DNS i indeksowanie przez wyszukiwarkę (tygodnie).
- **Czas właściciela:** decyzje D1–D12, zakup domeny i wpis DNS, weryfikacja domeny w narzędziu dla webmasterów, ręczne sprawdzenie znaków towarowych nazw (R-016), krótka lista kontrolna na iPhonie.

---

## Przeczytane źródła i pliki
**Strony zewnętrzne (przeczytane):**
- [Spam policies — scaled content abuse](https://developers.google.com/search/docs/essentials/spam-policies)
- [Localized versions / hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

**Tylko ze streszczenia wyszukiwarki, nieprzeczytane (do sprawdzenia przez badacza):**
- [Changes to HowTo and FAQ rich results](https://developers.google.com/search/blog/2023/08/howto-faq-changes)
- [Smart App Banners](https://developer.apple.com/documentation/webkit/promoting-apps-with-smart-app-banners) — treść strony się nie wczytała.

**Repo z GitHuba (`lkarwowski494/trening`, `main`):**
- docs/18-przekazanie.md (wpisy 20–26.10), docs/50-figury-v2.md, docs/51-figury-v2-pokrycie.md, docs/48-zgloszenie-1-0.md, docs/41-droga-do-app-store.md
- lib/i18n.ts, lib/cues/index.ts, lib/cues/text/ (35 plików), lib/figures/v2/families.ts, data/zrodla/ (cues.json, figures.json)
- site/index.html, store/app-store-urls.json

**Repo lokalne (nieaktualne):**
- /home/user/trening/CLAUDE.md
- /home/user/trening/docs/18-przekazanie.md
- /home/user/trening/lib/swap.ts
- /home/user/trening/lib/i18n.ts
- /home/user/trening/lib/catalog.generated.ts
- /home/user/trening/lib/equipment.ts
- /home/user/trening/app/swap.tsx
- /home/user/trening/app/exercises.tsx