# Znaki towarowe nazw ćwiczeń: metoda sprawdzenia (Z-07)

Autor: sesja AS (M8-formalnosci, build, zakres zawężony), 27.11.2026. Dokument przygotowuje decyzję właściciela Z-08 i nie jest poradą prawną. Kwestie prawne są oznaczone **[DO KONSULTACJI]**, a niepotwierdzone fakty **[DO USTALENIA]**.
`trademark-check.json` zostaje pusty. Wypełnia go Z-28 po decyzji Z-08.

## 1. Co sprawdza strażnik dziś (kod)

- `src/straznicy.mjs:17-27` (`checkTrademarks`): każda nazwa z listy musi mieć w `trademark-check.json` wpis `status: "sprawdzone"` z datą `RRRR-MM-DD`. Status `ryzyko` albo brak wpisu daje błąd, gdy `indeksowanie=true`, a ostrzeżenie, gdy `false`.
- `src/straznicy.mjs:67-70` (`startGuards`): nazwy to `langs.flatMap(l => data[l].exercises.map(e => e.name))`, czyli pole `name` ze **wszystkich budowanych języków**. `src/build.mjs:43` przekazuje `langs`, czyli budowane języki (dziś 35, `config.json` → `jezyki`).
- Pomiar 27.11.2026 na danych z `PIN.json` (ab59dd5, manifest 1.0.1):
  - 708 unikalnych nazw we wszystkich 35 językach razem;
  - pl = en (każda nazwa pl jest w en), więc dziś liczba języków **nie zmienia** liczby nazw do sprawdzenia;
  - nazwy rozbite na słowa dają 411 unikalnych słów.

  Polecenie: skrypt `node -e` na `.cache/dane/atlas-*.json`, wynik w raporcie sesji.
- Nazwy lokalne (P-7, Z-24, Z-32) jeszcze nie istnieją w danych. S3 czyta tylko `e.name`. **Gdy nazwy lokalne trafią do innego pola, S3 ich nie zobaczy.** To zadanie dla Z-32 (rola 08): przekazać nazwę lokalną do `checkTrademarks`. Zmiana kodu wymaga osobnego zadania.

## 2. Bazy znaków: co przeczytałem 27.11.2026

| Baza | Adres (odczyt 27.11.2026) | Odpytywanie automatyczne | Zasięg |
|---|---|---|---|
| WIPO Global Brand Database | https://www.wipo.int/en/web/global-brand-database/terms_and_conditions („Terms of Use (November 2022)”) | **Zakazane.** Pkt 2.1: „the User is forbidden to: … perform automated queries; perform bulk acquisition, bulk downloading, and bulk storing of data; … perform web scraping”. Także: „more than 10 search related actions per minute from a single IP address can be considered excessive”. Dodatkowo `branddb.wipo.int/robots.txt` zwraca stronę z zabezpieczeniem przed robotami (captcha), a nie plik robots. | „International trademarks under the Madrid System … Trademarks from participating national and regional offices” (https://www.wipo.int/en/web/global-brand-database) |
| USPTO, wyszukiwarka znaków | https://www.uspto.gov/terms-use-uspto-websites, sekcja „Use of USPTO databases” | **Nie do pobierania hurtem przez stronę.** „USPTO's online databases are not designed or intended to be a source for bulk downloads of USPTO data when accessed through the website's interfaces.” Kto generuje „unusually high numbers of database accesses … whether generated manually or in an automated fashion, may be denied access”. Dane hurtowe są osobno: „Bulk data products may be separately obtained from the USPTO, either for free or at the cost of dissemination.” | znaki federalne USA zgłoszone i zarejestrowane: „Our database includes every mark that's been registered or applied for.” (https://tmsearch.uspto.gov/help) |
| USPTO, dane hurtowe | https://www.uspto.gov/learning-and-resources/bulk-data-products, https://data.uspto.gov/bulkdata/datasets | **[DO USTALENIA] Z7-1:** obie strony wyrenderowały się 27.11 bez treści (aplikacja JS). Format, rozmiar i warunki zbioru znaków nieprzeczytane. | — |
| EUIPO, API „Trademark search” | https://dev.euipo.europa.eu/product („Trademark search 1.1.0 … Perform searches within EUIPO's database and retrieve all available information on a given trade mark.”); warunki: „Conditions of Use of APIs and of the API Portal (Version 2)”, data 29/01/2026, PDF z odnośnika „Conditions of Use” na dev.euipo.europa.eu | **Dozwolone przez oficjalne API, po rejestracji.** Pkt 3.1 c: „To subscribe to an API, a user must provide proof of identity”. Pkt 3.1 d: „The Office may, at its discretion, reject a subscription request.” Pkt 3.6 c: „The Office may, at its sole discretion, limit the frequency of API transactions … The user must not attempt to circumvent rate limits”. Ścieżka na portalu: „Register, build & test … request access to our sandbox environment”, potem „Apply … for access to production”. | baza EUIPO, czyli znaki unijne (EUTM); bez znaków krajowych |
| EUIPO, strona i wyszukiwarka eSearch | https://euipo.europa.eu/robots.txt | `disallow: /eSearch/` w robots.txt, czyli wyszukiwarka nie jest dla robotów. | znaki unijne |
| TMview | https://www.tmdn.org/tmview/ | **[DO USTALENIA] Z7-2:** aplikacja JS nie wyrenderowała treści, a `www.tmdn.org/robots.txt` nie odpowiedział. Warunków użycia nie przeczytałem. | USPTO (strona „Comprehensive clearance search”, odczyt 27.11.2026): „TMview, a database of trademark applications and registered trademarks from all EU national IP offices, the EUIPO, and several international partner offices outside the EU” (także Urząd Patentowy RP jako urząd krajowy UE) |

Klasy towarów i usług do zawężenia wyników: docs/54:535 podaje „TMview, klasy 9/41/44” dla domeny. Dla nazw ćwiczeń te same klasy (9 aplikacja, 41 nauka i treningi, 44 [DO KONSULTACJI]: czy potrzebna) plus 28 (sprzęt, bo część nazw zawiera sprzęt) to propozycja do potwierdzenia **[DO KONSULTACJI] Z7-K1**.
Zakres sprawdzenia według USPTO (strona „Comprehensive clearance search”): „You should search for trademarks that are confusingly similar to yours when used with goods and services that are the same as or related to yours.” Ta strona opisuje jednak zgłaszanie własnego znaku. My nie zgłaszamy znaku, tylko używamy nazw ćwiczeń w opisie. Czy to „użycie opisowe” i co z tego wynika, zostawiam prawnikowi: **[DO KONSULTACJI] Z7-K2**.

## 3. Triage nazw (pomiar 27.11.2026, en)

Słowa w nazwach dzielą się na trzy grupy:
- **Słowa ogólne** (ruch, sprzęt, część ciała, pozycja), np. `squat`, `row`, `dumbbell`, `incline`, `stretch`. To większość z 411 słów.
- **Nazwiska, imiona, skróty, nazwy własne**: 54 nazwy zawierają co najmniej jedno z 26 słów. Słowa: Arnold, Atlas, Bayesian, Bradford, Conan's, Cuban, EZ, GHD, Gironda, Jammer, Janda, Jefferson, JM, Meadows, Otis, Pallof, Pendlay, Rickshaw, Smith (Smith Machine), Superman, Svend, Tate, Tibialis (fałszywe trafienie, mięsień), Zercher, Zottman.
  Przykłady nazw: Pendlay Row, Arnold Press, EZ-Bar Curl, Pallof Press, Superman, Atlas Stones, Conan's Wheel, Zercher Squat, JM Press, GHD Sit-Up.
- **Nazwy geograficzne** (18 nazw): Bulgarian, Romanian, Russian, Turkish, Nordic, Copenhagen, Cossack, London, Cuban, Judo.
- **Nazwy obrazowe ze słów ogólnych**, np. Bird Dog, Dead Bug, Dragon Flag, Monster Walk, World's Greatest Stretch, Pirate Ship, Spider Curl. Liczby nie zmierzyłem automatycznie: **[DO USTALENIA] Z7-3**, ręczny przegląd 411 słów ok. 20 min agenta.

Przykład, dlaczego triage nie wystarcza sam: „Superman” to nazwa ćwiczenia zbudowana z jednego słowa, które jest też nazwą postaci. Czy taka nazwa w opisie ćwiczenia jest ryzykiem, rozstrzyga wyszukiwanie i prawnik (Z7-K2), nie triage.

## 4. Metody

### Metoda A: ręcznie, każda nazwa w TMview i w wyszukiwarce USPTO

- **Kto i czas:** właściciel (albo agent w przeglądarce w tempie człowieka). 708 nazw × 2 bazy × ok. 1 min ≈ **24 h**. Do tego nazwy lokalne każdego języka indeksowanego (pl: do 708 kolejnych, jeśli wszystkie się różnią).
- **Ryzyko:** najmniejsze ryzyko przeoczenia przy dokładnym wyszukiwaniu. Duże ryzyko zmęczenia i niejednolitych wyników. Agent w przeglądarce to wciąż „automated queries” w rozumieniu WIPO (pkt 2.1), dlatego WIPO wyłącznie ręcznie.
- **Wykonalność:** tak, bez kont. Koszt 0 zł.

### Metoda B (rekomendowana): triage w skrypcie + ręczne wyszukiwanie słów wyróżniających

1. Agent (ok. 1 h) robi skrypt i listę:
   - rozbija nazwy na słowa (411 dziś);
   - oznacza słowa ogólne według jawnej listy w repo;
   - wypisuje słowa wyróżniające (nazwiska, skróty, nazwy własne, geograficzne, obrazowe; dziś ok. 26 + 10 + Z7-3);
   - wypisuje nazwy, które je zawierają (54 + 18 + Z7-3).
2. Właściciel (ok. **1,5–2 h**) szuka w TMview i w wyszukiwarce USPTO każdego **słowa** wyróżniającego i każdej **całej nazwy** z takim słowem, w klasach z Z7-K1, ręcznie i w tempie poniżej 10 wyszukiwań na minutę (próg WIPO z pkt 2.1 jako miara ostrożności).
   Wynik każdego wyszukiwania (data, baza, zapytanie, liczba trafień w klasach, uwagi) trafia do arkusza w repo, a z niego do `trademark-check.json`. Nazwy z kolidującym znakiem w klasach dostają status `ryzyko`, a reszta `sprawdzone` z datą.
3. Nazwy złożone wyłącznie ze słów ogólnych dostają `sprawdzone` z polem metody (np. `"metoda": "triage: słowa ogólne"`). Strażnik dziś czyta tylko `status` i `data` (`src/straznicy.mjs:21-22`), więc dodatkowe pole niczego nie psuje.
   **[DO KONSULTACJI] Z7-K3:** czy taki status „sprawdzone” bez wyszukiwania całej nazwy jest wystarczającą starannością. Bezpieczniejsza opcja: także wyszukiwanie całych nazw ogólnych w EUIPO przez API (metoda C, krok 1) jako drugi przebieg po starcie.
- **Ryzyko:** pominięcie znaku zarejestrowanego dla połączenia słów ogólnych (np. nazwa obrazowa nieoznaczona w triage). Zmniejsza je ręczna lista nazw obrazowych (Z7-3) i przegląd listy słów ogólnych przez drugiego agenta (autor ≠ recenzent, jak P-4).
- **Wykonalność:** tak, bez kont i bez łamania warunków baz. Lista słów ogólnych jest deterministyczna i działa też dla nazw lokalnych (pl po Z-24, kolejne fale Z-70).
- **Czas razem:** agent ok. 1,5 h (skrypt + recenzja), właściciel ok. 1,5–2 h, plus nazwy pl: słowa wyróżniające pl to zwykle te same nazwiska, więc +0,5 h [OCENA].

### Metoda C: oficjalne API EUIPO dla wszystkich nazw + USPTO ręcznie dla wyróżniających

1. Właściciel rejestruje się na portalu API EUIPO z dowodem tożsamości (pkt 3.1 c), składa wniosek o sandbox, a potem o produkcję. Urząd może odmówić (pkt 3.1 d). Czas oczekiwania nieznany: **[DO USTALENIA] Z7-4**.
2. Agent (ok. 2–3 h) pisze skrypt z limitem zapytań z portalu (pkt 3.6 c) i odpytuje 708 nazw en + słowa wyróżniające. Klucz API trafia do sekretu poza repo (zasada wspólna 14).
3. USPTO: słowa i nazwy wyróżniające ręcznie, jak w metodzie B, krok 2 (ok. 1 h właściciela). Pełne pokrycie USA wymagałoby danych hurtowych USPTO (Z7-1, nieprzeczytane).
- **Ryzyko:** pokrywa tylko znaki unijne (EUTM), nie krajowe (np. polskie). Te są w TMview (Z7-2). Zależność od zgody urzędu i od czasu jej wydania, czyli możliwe opóźnienie Z-28 i startu. Dane osobowe stron postępowań w odpowiedziach API (pkt 3.1 b) trzeba przechowywać ostrożnie, poza repo publicznym.
- **Wykonalność:** warunkowa (zgoda urzędu). Koszt 0 zł według przeczytanych warunków (pkt 3.4 a: „royalty-free licence to use the API”). Opłat za API nie znalazłem: **[DO USTALENIA] Z7-5**.

### Odrzucone

- Automatyczne odpytywanie WIPO Global Brand Database: zakazane (pkt 2.1).
- Skrypt na stronie wyszukiwarki USPTO albo eSearch EUIPO: USPTO „not designed or intended to be a source for bulk downloads”; EUIPO `disallow: /eSearch/`.
- Płatne wyszukiwanie przez kancelarię: sprzeczne z zasadą „narzędzia 0 zł” (zasada wspólna 13); możliwe jako decyzja właściciela przy wyniku `ryzyko`.

## 5. Które języki ma liczyć strażnik S3

Dziś wszystkie 35 języków mają te same 708 nazw angielskich, więc wybór niczego nie zmienia, dopóki nie ma nazw lokalnych (P-7).

| Opcja | Kompromis |
|---|---|
| **1. Wszystkie budowane języki (stan kodu, `src/straznicy.mjs:70`) — rekomendacja** | Strony z `noindex` są publiczne pod domeną (P-3: najpierw publikacja z blokadą Google). Ryzyko znaku zależy od publikacji nazwy, nie od indeksowania. Koszt: nazwy lokalne języka spoza indeksu też wymagają sprawdzenia. Rozwiązuje to reguła Z-32 („język bez zrecenzowanych nazw — sama angielska”), jeśli „zrecenzowana” obejmie status S3. Wtedy język bez sprawdzonych nazw lokalnych pokazuje tylko angielskie, już sprawdzone. |
| 2. Tylko języki indeksowane (`indeksujJezyki`) | Mniej pracy przed falami języków (Z-70). Kompromis: nazwy lokalne niesprawdzone byłyby publiczne na stronach `noindex`. Strażnik przepuściłby nazwę ze statusem `ryzyko`, jeśli język nie jest indeksowany. |

Rekomendacja: **opcja 1 bez zmiany kodu S3** i warunek dla Z-32: nazwa lokalna wyświetla się tylko ze statusem `sprawdzone`. Do tego trzeba zmienić kod (nazwa lokalna przekazana do `checkTrademarks`), a zmiana kodu to osobne zadanie dla roli 08.

## Decyzja właściciela Z-08 (27.11.2026)

Dosłownie (przekazane przez koordynatora 27.11.2026, 14:48 UTC): „Nie robimy tego.” (sprawdzanie znaków towarowych). Żadna z metod A–C nie jest wykonywana, a `trademark-check.json` zostaje bez zmian.
**Skutek do rozstrzygnięcia przez koordynatora (osobne zadanie, nie Z-07):** strażnik S3 (`src/straznicy.mjs:17-27`, R-016, docs/54:376) przy `indeksowanie=true` przerywa build, gdy nazwa nie ma statusu „sprawdzone”. Z pustym plikiem Z-60 się nie zbuduje. Potrzebna jest zmiana S3 albo jego wyłączenie z zapisem decyzji (zmiana kodu: rola 08), a w planie zadanie Z-28 do usunięcia lub zmiany.
Ryzyko, które ta decyzja przyjmuje: nazwa ćwiczenia może kolidować z zarejestrowanym znakiem (przykład z sekcji 3: „Superman”). Pytania Z7-K1…K3 zostają bez odpowiedzi.

## 6. Pytanie do właściciela (Z-08, zamknięte decyzją wyżej)

Którą metodą sprawdzić znaki towarowe 708 nazw (en) i nazw pl?
- **B (rekomendacja):** ok. 1,5–2 h Twojej pracy w TMview i w wyszukiwarce USPTO na słowach wyróżniających, agent ok. 1,5 h. Bez kont. Ryzyko: znak ze słów ogólnych może umknąć.
- **A:** ok. 24 h Twojej pracy, najpełniejsza ręcznie.
- **C:** rejestracja na portalu API EUIPO z dowodem tożsamości i czekanie na zgodę (czas nieznany), agent 2–3 h, Ty ok. 1 h na USPTO. Pełne pokrycie znaków unijnych, bez krajowych.

Do konsultacji niezależnie od metody: Z7-K1 (klasy), Z7-K2 (użycie opisowe nazwy ćwiczenia), Z7-K3 (czy triage wystarcza do statusu „sprawdzone”).

## Otwarte

| ID | Sprawa | Kto |
|---|---|---|
| Z7-1 | Dane hurtowe USPTO: format, rozmiar, warunki | sesja Z-28 (strona do przeczytania innym sposobem) |
| Z7-2 | Warunki użycia TMview i odpytywanie automatyczne | sesja Z-28; do tego czasu TMview tylko ręcznie |
| Z7-3 | Lista nazw obrazowych ze słów ogólnych | agent w Z-28 (ok. 20 min) |
| Z7-4 | Czas zgody na produkcję API EUIPO | właściciel, tylko przy metodzie C |
| Z7-5 | Opłaty za API EUIPO | sesja Z-28, tylko przy metodzie C |
| Z7-K1–K3 | Klasy; użycie opisowe; staranność triage | właściciel (z prawnikiem albo bez, z zapisem) |
