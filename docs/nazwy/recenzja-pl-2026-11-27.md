# Recenzja: polskie nazwy 708 ćwiczeń (Z-25) — techniqueatlas — 2026-11-27
Commit recenzowany: 9f4e060 (`strona/z24-nazwy-pl`) · Rola: 09-lokalizacja, tryb audit, recenzent niezależny (autor: sesja AU) · Środowisko: Linux w chmurze, Node 22, git i push na gałąź roboczą działają; aplikacji nie uruchamiano (nazwy nie są jeszcze podłączone do stron, Z-32).

Źródło prawdy: tag `v1.1.1-b1042` repo aplikacji (d9382db): `docs/lokalizacja/slownik-terminow.json` (słownik terminów) i `docs/lokalizacja/nazwy-lokalne.json`, pole `pl` (276 nazw ćwiczeń zrecenzowanych 11.11.2026 i pokazywanych w aplikacji na karcie ćwiczenia).

## Podsumowanie

**Werdykt: PRZYJĘTE Z POPRAWKAMI.**

Nazwy są w większości zrozumiałe i trzymają wzorzec „czynność + sprzęt słownie”; brak duplikatów, literówek i zbędnych spacji. Dwie nazwy zmieniają znaczenie (zarzut i podrzut opisany jako „rwanie i podrzut”; ćwiczenie na piłce gimnastycznej opisane jako pozycja jogi). Największy problem jest systemowy: **189 z 276 nazw, które aplikacja już pokazuje po polsku, brzmi na stronie inaczej** (inne formy „hantla/hantel”, „sztanga EZ/łamana”, „kettlebellem/kettlebell”, angielskie „clean/snatch/jerk” zamiast „zarzut/rwanie/podrzut”). Użytkownik, który zna nazwę z aplikacji, nie znajdzie jej na stronie tym samym słowem. Autor nie porównał nazw z `nazwy-lokalne.json` (STAN.md wymienia tylko słownik terminów i nazwy grup).

Poprawek razem: **227 nazw** (W — wysoka: 2, S — średnia: 214, N — niska: 11). 214 średnich wynika z jednej reguły: „nazwa zrecenzowana w aplikacji jest kanonem strony; ta sama odmiana i te same terminy w nazwach spoza aplikacji”. Wyjątki od tej reguły (16 nazw, gdzie strona jest lepsza) zgłaszam do poprawy w aplikacji.

14 trafień wzorców zakazanych: 13 wyjątków przyjętych, 1 (`Rack Delivery`) przyjęty warunkowo.

| ID | Poziom | Rodzaj | Tytuł | Status |
|---|---|---|---|---|
| 09-lokalizacja-001 | P1 | D | Dwie nazwy zmieniają znaczenie ćwiczenia | otwarte |
| 09-lokalizacja-002 | P1 | D | 189 z 276 nazw różni się od nazw zrecenzowanych w aplikacji | otwarte |
| 09-lokalizacja-003 | P2 | D | Terminy dwuboju po angielsku wbrew słownikowi (`podrzut_jerk`) | otwarte |
| 09-lokalizacja-004 | P2 | D | Odmiana „kettlebell”, „hantel/hantla” i nazwa sztangi EZ niespójne | otwarte |
| 09-lokalizacja-005 | P2 | D | Nazwy gubiące sprzęt albo niezrozumiałe na sali | otwarte |
| 09-lokalizacja-006 | P2 | P | 14 trafień wzorców zakazanych wymaga wyjątków w strażniku | otwarte |

## Linia bazowa i założenia

Ocena od zera, przed lekturą STAN.md (STAN.md przeczytany po ocenie nazw, do porównania na końcu).

Wymiary pokrycia:
- **Rynki i języki:** tylko `pl`; inne języki strony poza zakresem Z-25.
- **Miejsca tekstu:** nazwy ćwiczeń (tytuły stron, wyszukiwarka). Sprawdzone. Wskazówki techniki: sprawdzone, brak (poza zakresem).
- **Gramatyka:** odmiana rzeczowników obcych („kettlebell”), rodzaj („hantel”/„hantla”), konstrukcje z nieodmienionym angielskim („z pullover”, „ze snatch”). Znaleziska 003, 004.
- **Formy i terminy:** słownik terminów (`wyciskanie_lezac`, `lawka_skosna_glowa_w_dol`, `podrzut_jerk`, `nozyce`, `ledzwie`, `kettlebell`, `wyciag`). Znaleziska 003, 005.
- **Spójność z aplikacją:** porównanie 1:1 z `nazwy-lokalne.json`. Znalezisko 002.
- **Formaty, układ, RTL, VoiceOver, mechanizm i18n:** nie dotyczy (plik danych niepodłączony).
- **Treści krytyczne:** nazwy nie niosą liczb ani dawek; sprawdzone, brak.

Soczewki: (1) bywalec polskiej siłowni, który zna nazwy z aplikacji; (2) trener dwuboju (terminy rwanie/zarzut/podrzut); (3) osoba, która szuka ćwiczenia w wyszukiwarce po polsku; (4) tłumacz, który widzi klucz i nazwę bez rysunku (czy nazwa mówi, jaki sprzęt i jaki ruch).

Wzorzec najlepszych: jedna nazwa ćwiczenia w całym produkcie (aplikacja i strona), potoczny termin sali, a angielska nazwa w nawiasie tylko tam, gdzie po polsku się jej szuka. Rejestru założeń (`docs/zalozenia.md`) w repo strony nie ma; zmian statusu nie proponuję.

## Pokrycie (co sprawdzono, czego nie)

| Obszar / pliki / ekrany | Sprawdzone? | Jak (plik dowodu) |
|---|---|---|
| `docs/nazwy/pl.json`, wszystkie 708 nazw | tak, przeczytane w całości | lektura ręczna + dowody/mechanizmy.txt |
| Słownik terminów (tag aplikacji), 105 pojęć, wpisy `pl` | tak | dowody/wzorce-zakazane.txt |
| Nazwy `pl` w aplikacji (`nazwy-lokalne.json`), 276 wspólnych kluczy | tak | dowody/roznice-z-aplikacja.txt |
| Sprzęt z katalogu aplikacji dla 20 nazw wątpliwych | tak | `scripts/equipment/catalog-1002-fields.json` w tagu (pole sprzętu) |
| Nazwy po proponowanych poprawkach: wzorce i zgodność z aplikacją | tak | dowody/wzorce-zakazane-po-poprawkach.txt, dowody/roznice-z-aplikacja-po-poprawkach.txt |
| Docs/nazwy/STAN.md (po ocenie) | tak | — |
| Strony z podłączonymi nazwami, wyszukiwarka | nie: nazwy niepodłączone (Z-32) | — |
| Ocena rodzimego użytkownika języka / trenera | nie: recenzja modelu, nie człowieka | — |

## Kontrola dowodów i sekretów

`node sprawdz-raport.mjs docs/nazwy/recenzja-pl-2026-11-27.md . --rola 09-lokalizacja` (skrypt w scratchpadzie): wynik i kod wyjścia w dowody/sprawdz-raport.txt (kod 0)

`git status --porcelain` przed commitem: tylko nowe pliki `docs/nazwy/recenzja-pl-2026-11-27.md` i `docs/nazwy/dowody/`; `docs/nazwy/pl.json` i `src/` nietknięte.

## Stosowalność listy kontrolnej

| Pozycja | Status | Wynik |
|---|---|---|
| LOK-01 | nie dotyczy: zakres Z-25 to tylko `pl` | — |
| LOK-02 | nie dotyczy: brak konfiguracji Expo w repo strony | — |
| LOK-03 | nie dotyczy: nazwy niepodłączone (Z-32) | — |
| LOK-04 | dotyczy: klucze `pl.json` vs eksport | ok (708/708, wg STAN.md; nie powtarzano eksportu) |
| LOK-05 | nie dotyczy: nazwy bez liczebników | — |
| LOK-06 | nie dotyczy: brak parametrów i liczb | — |
| LOK-07 | nie dotyczy: brak dat i jednostek | — |
| LOK-08 | nie sprawdzono: brak stron z nazwami | długość: najdłuższa proponowana nazwa ma 69 znaków |
| LOK-09 | nie dotyczy: klucz = id katalogu, nazwa tylko do wyświetlania | — |
| LOK-10 | nie dotyczy: nazwy nie są treścią krytyczną | — |
| LOK-11 | dotyczy: terminy z glosariusza, sens, mieszanie języków | znaleziska 001–005 |
| LOK-12 | nie dotyczy | — |
| LOK-13 | nie dotyczy | — |
| LOK-14 | nie dotyczy: tylko alfabet łaciński z polskimi znakami | — |
| LOK-15 | dotyczy: strażnik terminów strony | znalezisko 006 |

## Znaleziska (szczegóły)

### 09-lokalizacja-001 · Dwie nazwy zmieniają znaczenie ćwiczenia
- Pozycja listy kontrolnej: LOK-11
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/nazwy/pl.json:401` „"Clean and Jerk": "Clean and jerk (rwanie i podrzut)"” — rwanie to snatch, a clean and jerk to zarzut i podrzut; `docs/nazwy/pl.json:558` „"Downward Facing Balance": "Równowaga w pozycji psa głową w dół"” — w katalogu aplikacji sprzęt tego ćwiczenia to piłka gimnastyczna (`stability_ball`), nazwa opisuje pozycję jogi bez piłki.
- Mechanizm: przekład z nazwy angielskiej bez sprawdzenia sprzętu i terminu; inne przypadki tego mechanizmu w 005.
- Powraca: nie
- Wzorzec lub źródło: słownik terminów, pojęcie `podrzut_jerk` i `nozyce` (tag v1.1.1-b1042); aplikacja: „Zarzut i podrzut kettlebella jednorącz”, „Balans na piłce gimnastycznej leżąc przodem”.
- Kroki w aplikacji: użytkownik szuka „rwanie” i trafia na zarzut i podrzut; użytkownik bez piłki próbuje ćwiczenia jak pozycji jogi.
- Opcje: tabela A, wiersze z wagą W.
- Test akceptacyjny: obie nazwy jak w tabeli A; `grep -n "rwanie i podrzut\|psa głową" docs/nazwy/pl.json` → 0 trafień.
- Status: otwarte

### 09-lokalizacja-002 · 189 z 276 nazw różni się od nazw zrecenzowanych w aplikacji
- Pozycja listy kontrolnej: LOK-11
- Poziom: P1
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: dowody/roznice-z-aplikacja.txt („wspólnych kluczy: 276; różnych nazw: 189”).
- Mechanizm: lista strony powstała bez porównania z `nazwy-lokalne.json`; skutkiem są różne formy w całym pliku: „z hantlem” 29× na stronie wobec „z hantlą” 22× w aplikacji, „sztanga łamana” 7× wobec „sztanga EZ” 5×, „z kettlebell” 24× wobec odmienionego w aplikacji 12× (dowody/mechanizmy.txt).
- Powraca: nie → trwała kontrola: test w Z-32 porównujący `docs/nazwy/pl.json` z `nazwy-lokalne.json` (różnica dozwolona tylko z listy wyjątków z powodem).
- Wzorzec lub źródło: decyzja właściciela 25.10.2026 w słowniku terminów: jedno brzmienie terminu; nazwy aplikacji mają recenzję „zatwierdzone” (autor ≠ recenzent, 11.11.2026).
- Kroki w aplikacji: użytkownik widzi w aplikacji „Uginanie ramion ze sztangą EZ”, na stronie „Uginanie ramion ze sztangą łamaną”; szuka nazwy z aplikacji i nie trafia.
- Opcje: (a) aplikacja jest kanonem, strona przejmuje 173 nazwy (165 bez zmian, 8 poprawionych) i zachowuje 16 lepszych, które zgłaszamy aplikacji — mało pracy, jedna nazwa w produkcie; (b) strona jest kanonem, aplikacja zmienia 189 nazw — wymaga nowej recenzji w aplikacji i przekładu w 33 językach, które tłumaczono z polskich nazw. Rekomendacja: (a).
- Test akceptacyjny: dowody/roznice-z-aplikacja-po-poprawkach.txt — różnic 24, wszystkie z listy w załączniku C (16 „STRONA” + 8 „POPRAWIONA”).
- Status: otwarte

### 09-lokalizacja-003 · Terminy dwuboju po angielsku wbrew słownikowi
- Pozycja listy kontrolnej: LOK-11
- Poziom: P2
- Realność: realny · Pewność: wysoka (jerk), średnia (clean, snatch)
- Rodzaj: D
- Dowód: dowody/mechanizmy.txt, sekcja „Clean/Snatch/Jerk po angielsku”: 38 nazw; np. `docs/nazwy/pl.json:241` „"Kettlebell Snatch": "Szarpnięcie kettlebell (snatch)"”.
- Mechanizm: zasada „anglicyzm, gdy tak mówi się na sali” zastosowana do całej grupy; słownik ma pojęcie `podrzut_jerk` (zalecany „podrzut”, „jedno brzmienie we wszystkich wskazówkach języka”), a aplikacja używa „Rwanie hantlą”, „Zarzut kettlebella”, „Podrzut kettlebella”. „Szarpnięcie” nie jest terminem ani dwuboju, ani sali.
- Powraca: nie
- Wzorzec lub źródło: słownik terminów, `podrzut_jerk`, `nozyce`; nazwy aplikacji (analogia, do weta).
- Kroki w aplikacji: ta sama osoba czyta w aplikacji „Podrzut kettlebella jednorącz”, a na stronie „Jerk z kettlebell jednorącz”.
- Opcje: (a) polskie terminy dwuboju z angielskim w nawiasie przy nazwach, po których się szuka (tabela A) — zgodne ze słownikiem i aplikacją, nawias zostawia wyszukiwanie po angielsku; (b) angielskie nazwy (stan obecny) — prostsze dla bywalców boksów crossfitowych, sprzeczne ze słownikiem. Rekomendacja: (a). Drille bez polskiej nazwy („Snatch balance”, „Jerk balance”, „Muscle snatch”) zostają po angielsku.
- Test akceptacyjny: `grep -nE "\b(Clean|Snatch|Jerk)\b" docs/nazwy/pl.json` → tylko wewnątrz nawiasów i w trzech drillach.
- Status: otwarte

### 09-lokalizacja-004 · Odmiana „kettlebell”, „hantel/hantla” i nazwa sztangi EZ niespójne
- Pozycja listy kontrolnej: LOK-11
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: `docs/nazwy/pl.json:162` „"Kettlebell Press": "Wyciskanie kettlebell"”; w tym samym pliku „Przysiad z dwoma kettlebellami z przodu” (odmienione). dowody/mechanizmy.txt: 24 nieodmienione, 8 odmienionych.
- Mechanizm: `grep -nE "kettlebell\b" docs/nazwy/pl.json` → 24 trafienia (lista w dowody/mechanizmy.txt); „hantel” 29; „sztanga łamana” 7.
- Powraca: nie
- Wzorzec lub źródło: słownik `kettlebell` (opis pojęć używa „kettlebellem”); aplikacja (dowody/mechanizmy.txt, sekcje „aplikacja: …”).
- Kroki w aplikacji: tytuł strony „Halo z kettlebell” brzmi jak błąd; w aplikacji ta sama rodzina nazw jest odmieniona.
- Opcje: tabela B i załącznik C. „Swing kettlebell” zostaje (utarta nazwa).
- Test akceptacyjny: po poprawkach `kettlebell\b` tylko w „Swing kettlebell”; 0 trafień „hantlem”, „hantla\b”, „łaman”.
- Status: otwarte

### 09-lokalizacja-005 · Nazwy gubiące sprzęt albo niezrozumiałe na sali
- Pozycja listy kontrolnej: LOK-11
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: D
- Dowód: tabela A, waga S i N; sprzęt z katalogu aplikacji (skrzynia w `Single Leg Push-Off`, ławka decline w `Weighted Sit-Ups - With Bands`, talerz w `Car Drivers`, pas do dipów w `Dip Belt Squat`).
- Mechanizm: dosłowny przekład nazwy angielskiej („Wycieraczki izometryczne”, „Kierowca (car driver)”, „Uginanie ramion spider curl”) albo „ławka skośna” bez „głową w dół” tam, gdzie ławka jest decline (słownik `lawka_skosna_glowa_w_dol`: samo „ławka skośna” to incline).
- Powraca: nie
- Wzorzec lub źródło: słownik terminów (`lawka_skosna_glowa_w_dol`, `ledzwie`); nazwy aplikacji.
- Kroki w aplikacji: użytkownik nie wie, że do „Odbicia jedną nogą” potrzebna jest skrzynia.
- Opcje: tabela A.
- Test akceptacyjny: nazwy jak w tabeli A.
- Status: otwarte

### 09-lokalizacja-006 · 14 trafień wzorców zakazanych wymaga wyjątków w strażniku
- Pozycja listy kontrolnej: LOK-15
- Poziom: P2
- Realność: realny · Pewność: wysoka
- Rodzaj: P
- Dowód: dowody/wzorce-zakazane.txt (14 trafień: `nozyce` 11, `rack_kettlebell` 3); `tests/straznik-terminy.test.mjs:17` „Wyjątki (decyzja właściciela 09.11.2026, docs/54)”.
- Mechanizm: wzorce słownika opisują wskazówki techniki, a strażnik strony stosuje je do każdego tekstu; nazwa ćwiczenia „Wykroki …” to inne pojęcie niż pozycja nożyc.
- Powraca: tak, precedens `pl/nozyce: Wykroki i wejścia na skrzynię` → trwała kontrola już jest (wyjątek nieużyty = błąd).
- Wzorzec lub źródło: słownik `nozyce`: „„wykrok” to osobne ćwiczenie (lunge)”.
- Kroki w aplikacji: brak; dotyczy CI po Z-32.
- Opcje: sekcja „Trafienia wzorców zakazanych i nazwy wątpliwe” niżej.
- Test akceptacyjny: po Z-32 strażnik zielony z wyjątkami zbudowanymi z nazw końcowych (po poprawkach), każdy z powodem.
- Status: otwarte

## Poprawki do `docs/nazwy/pl.json`

Wagi: **W** — nazwa zmienia znaczenie albo jest błędem faktu; **S** — niespójna ze słownikiem lub aplikacją albo niezrozumiała; **N** — szlif. Poprawki wykonuje autor (Z-24/AU); recenzja nie zmienia `pl.json`. Po zastosowaniu A, B i C: 0 duplikatów, 14 trafień wzorców (te same 14 nazw), 24 różnice z aplikacją, wszystkie uzasadnione (dowody/wzorce-zakazane-po-poprawkach.txt, dowody/roznice-z-aplikacja-po-poprawkach.txt).

### A. Poprawki pojedyncze (53)

Kolumna „#” to pozycja w pliku. Znak † = klucz jest też w załączniku C (nazwa zgodna z aplikacją).

| # | Klucz | Obecna | Proponowana | Waga | Powód |
|---|---|---|---|---|---|
| 400 | Clean and Jerk | Clean and jerk (rwanie i podrzut) | Zarzut i podrzut (clean and jerk) | W | „rwanie” to snatch, nie clean; clean and jerk = zarzut i podrzut |
| 557 | Downward Facing Balance † | Równowaga w pozycji psa głową w dół | Balans na piłce gimnastycznej leżąc przodem | W | ćwiczenie na piłce gimnastycznej (sprzęt w katalogu), nie pozycja jogi |
| 239 | Kettlebell Clean | Clean z kettlebell | Zarzut kettlebella | S | clean = zarzut; odmiana |
| 240 | Kettlebell Snatch | Szarpnięcie kettlebell (snatch) | Rwanie kettlebellem | S | snatch = rwanie (aplikacja: „Rwanie hantlą”); „szarpnięcie” to nie termin sali |
| 242 | Power Clean | Power clean | Zarzut siłowy (power clean) | S | clean = zarzut (aplikacja: „Zarzut kettlebella…”) |
| 294 | Isometric Wipers † | Wycieraczki izometryczne | Pompki szeroko z przesunięciem na boki | S | „wycieraczki izometryczne” to kalka bez sensu na sali (nazwa z aplikacji) |
| 307 | Clean Shrug | Szrugsy z clean | Szrugsy chwytem do zarzutu | S | „z clean” niezrozumiałe |
| 308 | Snatch Shrug | Szrugsy ze snatch | Szrugsy chwytem do rwania | S | „ze snatch” niezrozumiałe |
| 353 | Double Kettlebell Jerk | Jerk z dwoma kettlebellami | Podrzut dwóch kettlebelli | S | słownik podrzut_jerk |
| 361 | Clean and Press | Clean and press | Zarzut i wyciskanie (clean and press) | S | clean = zarzut |
| 375 | Car Drivers † | Kierowca (car driver) | Obroty talerzem jak kierownicą | S | „Kierowca” nic nie mówi; sprzęt: talerz |
| 379 | Dumbbell Incline Shoulder Raise † | Unoszenie hantli na ławce skośnej (barki) | Wypychanie barków z hantlami na ławce skośnej | S | ruch łopatek w przód; „unoszenie hantli” sugeruje wznosy |
| 380 | Barbell Incline Shoulder Raise † | Unoszenie sztangi na ławce skośnej (barki) | Wypychanie barków ze sztangą na ławce skośnej | S | jak wyżej |
| 381 | Smith Incline Shoulder Raise † | Unoszenie na ławce skośnej na suwnicy Smitha (barki) | Wypychanie barków na suwnicy Smitha | S | jak wyżej |
| 388 | Cable Rope Rear-Delt Rows † | Wiosłowanie na tylne aktony z linką na wyciągu | Wiosłowanie liną na wyciągu na tył barków | S | „tylne aktony” to język podręcznika; „linka” myli z liną (uchwytem) |
| 389 | Barbell Rear Delt Row | Wiosłowanie sztangą na tylne aktony | Wiosłowanie sztangą na tył barków | S | jak wyżej |
| 403 | Double Kettlebell Snatch | Snatch z dwoma kettlebellami | Rwanie dwoma kettlebellami | S | snatch = rwanie |
| 404 | Double Kettlebell Clean | Clean z dwoma kettlebellami | Zarzut dwóch kettlebelli | S | clean = zarzut |
| 488 | Jerk Dip Squat | Przysiad jerk dip | Ugięcie do podrzutu (jerk dip) | S | słownik podrzut_jerk; „przysiad” myli (to płytkie ugięcie) |
| 504 | Dip Belt Squat | Przysiad z obciążeniem na uprzęży (dip belt) | Przysiad z obciążeniem podwieszonym przy biodrach (dip belt) | S | sprzęt to pas do dipów, nie uprząż; bez słowa „pas”, żeby nie dodawać wyjątku od wzorca tasma_rozciaganie |
| 510 | Hang Clean | Hang clean | Zarzut z zawieszenia (hang clean) | S | hang = z zawieszenia |
| 511 | Clean Pull | Clean pull | Ciąg zarzutowy (clean pull) | S | termin dwuboju |
| 512 | Block Clean | Clean z podwyższenia | Zarzut z bloków | S | block = bloki; „z podwyższenia” ok, ale bloki to sprzęt dwuboju |
| 513 | Split Clean | Split clean | Zarzut do nożyc (split clean) | S | split = nożyce |
| 514 | Barbell Snatch | Snatch ze sztangą | Rwanie (snatch) | S | termin dwuboju; angielski w nawiasie dla szukających |
| 515 | Block Snatch | Snatch z podwyższenia | Rwanie z bloków | S | snatch = rwanie; block = bloki |
| 516 | Block Power Snatch | Power snatch z podwyższenia | Rwanie siłowe z bloków | S | power = siłowe |
| 518 | Power Jerk | Power jerk | Podrzut siłowy (power jerk) | S | słownik podrzut_jerk: jerk = podrzut |
| 519 | Split Jerk | Split jerk | Podrzut do nożyc (split jerk) | S | słownik podrzut_jerk, nozyce |
| 520 | Squat Jerk | Squat jerk | Podrzut do przysiadu (squat jerk) | S | słownik podrzut_jerk |
| 531 | Alternate Leg Push-Off † | Odbicia naprzemiennie jedną nogą | Wyskoki z nogą na skrzyni naprzemiennie | S | nazwa gubi skrzynię (sprzęt w katalogu) |
| 532 | Single Leg Push-Off † | Odbicia jedną nogą | Wyskoki z nogą na skrzyni | S | jak wyżej |
| 554 | Clean | Clean | Zarzut (clean) | S | clean = zarzut |
| 555 | Clean Deadlift | Martwy ciąg z clean | Martwy ciąg chwytem do zarzutu | S | „z clean” niezrozumiałe |
| 558 | Dumbbell Clean | Clean z hantlami | Zarzut hantli | S | clean = zarzut |
| 562 | Hang Snatch | Hang snatch | Rwanie z zawieszenia (hang snatch) | S | hang = z zawieszenia |
| 575 | Block Power Clean | Power clean z podwyższenia | Zarzut siłowy z bloków | S | jak wyżej |
| 576 | Power Snatch | Power snatch | Rwanie siłowe (power snatch) | S | power = siłowe |
| 582 | Snatch Deadlift | Martwy ciąg ze snatch | Martwy ciąg chwytem do rwania | S | „ze snatch” niezrozumiałe |
| 583 | Snatch Pull | Snatch pull | Ciąg rwaniowy (snatch pull) | S | termin dwuboju |
| 584 | Split Snatch | Split snatch | Rwanie do nożyc (split snatch) | S | split = nożyce (słownik nozyce) |
| 635 | Weighted Sit-Ups - With Bands † | Brzuszki na ławce skośnej z gumą | Brzuszki z gumą na ławce skośnej głową w dół | S | sprzęt: ławka decline; samo „ławka skośna” = incline (słownik lawka_skosna_glowa_w_dol) |
| 60 | Spider Curl | Uginanie ramion spider curl | Spider curl | N | „Uginanie ramion spider curl” dubluje „curl”; aplikacja: „Spider curl ze sztangą” |
| 167 | Bayesian Curl | Uginanie ramion bayesian curl | Bayesian curl na wyciągu | N | jak wyżej |
| 277 | Front Raise And Pullover † | Unoszenie ramion przodem z pullover | Unoszenie sztangi i pullover leżąc | N | „z pullover” bez odmiany; nazwa z aplikacji |
| 456 | Decline Close-Grip Bench To Skull Crusher † | Wyciskanie wąsko na ławce głową w dół przechodzące we francuskie | Wyciskanie wąsko do francuskiego głową w dół | N | nazwa z aplikacji, krótsza |
| 457 | Decline Dumbbell Triceps Extension | Prostowanie ramion z hantlami na ławce głową w dół | Prostowanie ramion z hantlami na ławce skośnej głową w dół | N | słownik lawka_skosna_glowa_w_dol |
| 490 | Barbell Walking Lunge | Chodzone wykroki ze sztangą | Wykroki chodzone ze sztangą | N | spójnie z Walking Lunges w aplikacji: „Wykroki chodzone” |
| 604 | Decline Oblique Crunch | Brzuszki skośne na ławce głową w dół | Brzuszki skośne na ławce skośnej głową w dół | N | słownik lawka_skosna_glowa_w_dol |
| 605 | Decline Reverse Crunch | Odwrotne brzuszki na ławce głową w dół | Odwrotne brzuszki na ławce skośnej głową w dół | N | słownik lawka_skosna_glowa_w_dol |
| 623 | Side Jackknife | Side jackknife | Scyzoryk bokiem (side jackknife) | N | „scyzoryk” to nazwa sali (aplikacja: Cocoons → „Scyzoryk z ugiętymi nogami”) |
| 692 | World's Greatest Stretch | Najlepsze rozciąganie świata (world's greatest stretch) | World's greatest stretch | N | nazwa żartobliwa; dosłowny przekład brzmi jak reklama |
| 705 | Lower Back Curl | Zwijanie dolnej części pleców (lower back curl) | Zwijanie lędźwi (lower back curl) | N | słownik ledzwie: lędźwie, nie „dolna część pleców” |

### B. Poprawki mechaniczne: odmiana i sprzęt jak w aplikacji (13)

| # | Klucz | Obecna | Proponowana | Waga |
|---|---|---|---|---|
| 161 | Kettlebell Press | Wyciskanie kettlebell | Wyciskanie kettlebella | S |
| 234 | Kettlebell Windmill | Windmill z kettlebell | Windmill z kettlebellem | S |
| 316 | Kettlebell Sumo High Pull | Wysokie przyciąganie kettlebell w rozkroku sumo | Wysokie przyciąganie kettlebella w rozkroku sumo | S |
| 349 | Kettlebell Arnold Press | Wyciskanie Arnolda z kettlebell | Wyciskanie Arnolda z kettlebellem | S |
| 369 | Single Dumbbell Front Raise | Unoszenie jednego hantla przodem | Unoszenie jednej hantli przodem | S |
| 376 | Kettlebell Halo | Halo z kettlebell | Halo z kettlebellem | S |
| 377 | Kettlebell Halo with Overhead Extension | Halo z kettlebell z prostowaniem ramion nad głową | Halo z kettlebellem z prostowaniem ramion nad głową | S |
| 406 | Kettlebell Thruster | Thruster z kettlebell | Thruster z kettlebellem | S |
| 413 | Reverse EZ-Bar Preacher Curl | Uginanie ramion nachwytem ze sztangą łamaną na modlitewniku | Uginanie ramion nachwytem ze sztangą EZ na modlitewniku | S |
| 453 | Close-Grip EZ-Bar Press | Wyciskanie sztangi łamanej wąskim chwytem | Wyciskanie sztangi EZ wąskim chwytem | S |
| 463 | Kettlebell Overhead Triceps Extension | Prostowanie ramion zza głowy z kettlebell | Prostowanie ramion zza głowy z kettlebellem | S |
| 495 | Dumbbell Squat | Przysiad z hantlem | Przysiad z hantlą | S |
| 611 | Kettlebell Figure 8 | Ósemka z kettlebell | Ósemka z kettlebellem | S |

### C. Nazwy, które aplikacja już pokazuje po polsku (189 różnic)

Reguła: „APLIKACJA” = przejmij nazwę aplikacji (165); „POPRAWIONA” = nazwa strony z odmianą/terminem aplikacji (8); „STRONA” = zostaje nazwa strony, rozbieżność do poprawy w aplikacji (16). Waga każdej zmiany: S.

| Klucz | Aplikacja (zrecenzowana) | Strona (obecna) | Proponowana | Skąd | Powód |
|---|---|---|---|---|---|
| Bench Press (sztanga) | Wyciskanie sztangi na ławce płaskiej | Wyciskanie sztangi leżąc | Wyciskanie sztangi leżąc | STRONA | słownik: pojęcie wyciskanie_lezac |
| Bench Press (hantle) | Wyciskanie hantli na ławce płaskiej | Wyciskanie hantli leżąc | Wyciskanie hantli leżąc | STRONA | słownik: wyciskanie_lezac |
| Chest Fly (hantle) | Rozpiętki z hantlami na ławce płaskiej | Rozpiętki z hantlami leżąc | Rozpiętki z hantlami leżąc | STRONA | spójnie z wyciskaniem leżąc |
| One Arm Row (hantle) | Wiosłowanie hantlą jednorącz | Wiosłowanie jednorącz z hantlem | Wiosłowanie hantlą jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Chest Supported Row | Wiosłowanie z oparciem klatki piersiowej | Wiosłowanie z podparciem klatki piersiowej | Wiosłowanie z oparciem klatki piersiowej | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Wiosłowanie na linkach (siedząc) | Wiosłowanie na wyciągach siedząc | Wiosłowanie na dwóch wyciągach siedząc | Wiosłowanie na wyciągach siedząc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Straight Arm Pulldown | Ściąganie drążka prostymi rękami | Ściąganie drążka wyciągu na prostych rękach | Ściąganie drążka prostymi rękami | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Upright Row (hantle) | Wiosłowanie hantlami do brody | Przyciąganie hantli wzdłuż tułowia (upright row) | Wiosłowanie hantlami do brody | APLIKACJA | nazwa zrecenzowana w aplikacji |
| EZ Bar Curl | Uginanie ramion ze sztangą EZ | Uginanie ramion ze sztangą łamaną | Uginanie ramion ze sztangą EZ | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Concentration Curl (hantle) | Uginanie koncentryczne z hantlą | Uginanie skoncentrowane z hantlem | Uginanie koncentryczne z hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Skullcrusher (hantle) | Wyciskanie francuskie hantli leżąc | Wyciskanie francuskie z hantlami | Wyciskanie francuskie hantli leżąc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Skullcrusher (EZ) | Wyciskanie francuskie sztangą EZ leżąc | Wyciskanie francuskie ze sztangą łamaną | Wyciskanie francuskie sztangą EZ leżąc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Triceps Dips (ławka) | Dipy na ławce | Dipy tricepsowe na ławce | Dipy na ławce | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Overhead Triceps Extension (hantel) | Prostowanie ramion z hantlą zza głowy | Wyciskanie francuskie z hantlem zza głowy | Prostowanie ramion z hantlą zza głowy | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Cable Overhead Extension | Prostowanie ramion nad głową na wyciągu | Prostowanie ramion zza głowy na wyciągu | Prostowanie ramion nad głową na wyciągu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Przysiad z pasem (linki) | Przysiad z pasem na wyciągu | Belt squat na wyciągu | Belt squat na wyciągu | STRONA | „pas” trafia we wzorzec tasma_rozciaganie; alternatywa: nazwa aplikacji + wyjątek |
| Walking Lunges | Wykroki chodzone | Chodzone wykroki | Wykroki chodzone | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Hip Thrust (sztanga) | Hip thrust | Hip thrust ze sztangą | Hip thrust | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Hip Thrust (hantel) | Hip thrust z hantlą | Hip thrust z hantlem | Hip thrust z hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Decline Bench Press (hantle) | Wyciskanie hantli głową w dół | Wyciskanie hantli na ławce skośnej głową w dół | Wyciskanie hantli na ławce skośnej głową w dół | STRONA | słownik: lawka_skosna_glowa_w_dol |
| Squeeze Press (hantle) | Wyciskanie hantli ze ściskaniem | Wyciskanie hantli ściśniętych razem (squeeze press) | Wyciskanie hantli ze ściskaniem | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Arm Cable Fly | Rozpiętki na wyciągu jednorącz | Rozpiętki jednorącz na wyciągu | Rozpiętki na wyciągu jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Arm Cable Chest Press | Wyciskanie na wyciągu jednorącz | Wyciskanie jednorącz na wyciągu | Wyciskanie na wyciągu jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Smith Machine Incline Press | Wyciskanie na suwnicy Smitha na ławce skośnej | Wyciskanie na ławce skośnej na suwnicy Smitha | Wyciskanie na suwnicy Smitha na ławce skośnej | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Pullover (hantel) | Pullover z hantlą | Pullover z hantlem | Pullover z hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Arm Cable Row | Wiosłowanie na wyciągu jednorącz | Wiosłowanie jednorącz na wyciągu | Wiosłowanie na wyciągu jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Seal Row (sztanga) | Wiosłowanie sztangą z oparciem na ławce | Wiosłowanie sztangą leżąc na ławce (seal row) | Wiosłowanie sztangą z oparciem na ławce | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Arm Lat Pulldown | Ściąganie wyciągu górnego jednorącz | Ściąganie drążka wyciągu górnego jednorącz | Ściąganie wyciągu górnego jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Arm Overhead Press (hantel) | Wyciskanie hantli nad głowę jednorącz | Wyciskanie hantla jednorącz nad głowę | Wyciskanie hantli nad głowę jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Y Raise (hantle) | Unoszenie hantli w literę Y | Unoszenie hantli w kształt litery Y | Unoszenie hantli w literę Y | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Upright Row (linki) | Wiosłowanie na wyciągu do brody | Przyciąganie wzdłuż tułowia na wyciągu (upright row) | Wiosłowanie na wyciągu do brody | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Upright Row (sztanga) | Wiosłowanie sztangą do brody | Przyciąganie sztangi wzdłuż tułowia (upright row) | Wiosłowanie sztangą do brody | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Pike Push Up | Pompki w pozycji odwróconego V | Pompki pike | Pompki w pozycji odwróconego V | APLIKACJA | nazwa zrecenzowana w aplikacji |
| External Rotation (linki) | Rotacja zewnętrzna na wyciągu | Rotacja zewnętrzna ramienia na wyciągu | Rotacja zewnętrzna na wyciągu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| External Rotation (hantel) | Rotacja zewnętrzna z hantlą | Rotacja zewnętrzna ramienia z hantlem | Rotacja zewnętrzna z hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Band Pull Apart | Rozciąganie gumy w poziomie | Rozciąganie gumy na boki (band pull-apart) | Rozciąganie gumy w poziomie | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Hammer Curl (linki) | Uginanie młotkowe na wyciągu | Uginanie ramion chwytem młotkowym na wyciągu | Uginanie młotkowe na wyciągu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Preacher Curl (EZ) | Uginanie ramion ze sztangą EZ na modlitewniku | Uginanie ramion na modlitewniku ze sztangą łamaną | Uginanie ramion ze sztangą EZ na modlitewniku | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Reverse Wrist Curl (hantle) | Uginanie nadgarstków nachwytem z hantlami | Odwrotne uginanie nadgarstków z hantlami | Uginanie nadgarstków nachwytem z hantlami | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Arm Triceps Pushdown | Prostowanie ramienia na wyciągu jednorącz | Prostowanie ramienia jednorącz na wyciągu górnym | Prostowanie ramienia na wyciągu jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Triceps Kickback (linki) | Prostowanie ramienia w opadzie na wyciągu | Prostowanie ramienia w opadzie tułowia na wyciągu (kickback) | Prostowanie ramienia w opadzie na wyciągu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Overhead Triceps Extension (EZ) | Prostowanie ramion ze sztangą EZ zza głowy | Prostowanie ramion zza głowy ze sztangą łamaną | Prostowanie ramion ze sztangą EZ zza głowy | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Skullcrusher (sztanga) | Wyciskanie francuskie sztangi leżąc | Wyciskanie francuskie ze sztangą | Wyciskanie francuskie sztangi leżąc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Leg RDL (hantel) | Rumuński martwy ciąg jednonóż z hantlą | Rumuński martwy ciąg na jednej nodze z hantlem | Rumuński martwy ciąg jednonóż z hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Leg RDL (linki) | Rumuński martwy ciąg jednonóż na wyciągu | Rumuński martwy ciąg na jednej nodze na wyciągu | Rumuński martwy ciąg jednonóż na wyciągu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Leg Press | Wypychanie na suwnicy jedną nogą | Wypychanie jedną nogą na suwnicy | Wypychanie na suwnicy jedną nogą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Sumo Squat (hantel) | Przysiad sumo z hantlą | Przysiad sumo z hantlem | Przysiad sumo z hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Leg Curl (hantel) | Uginanie nóg z hantlą | Uginanie nóg z hantlem | Uginanie nóg z hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Cable Pull Through | Przeciąganie wyciągu między nogami | Pull-through na wyciągu | Przeciąganie wyciągu między nogami | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Sumo Deadlift (kettlebell) | Martwy ciąg sumo z kettlebellem | Martwy ciąg sumo z kettlebell | Martwy ciąg sumo z kettlebellem | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Plank Shoulder Taps | Podpórka z dotykaniem barków | Deska z dotykaniem barków | Deska z dotykaniem barków | STRONA | spójnie z Plank → Deska |
| GHD Sit Up | Brzuszki na maszynie GHD | Brzuszki na ławce GHD | Brzuszki na maszynie GHD | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Sit Up | Brzuszki | Brzuszki z podniesieniem tułowia (sit-up) | Brzuszki z podniesieniem tułowia (sit-up) | STRONA | nazwa aplikacji „Brzuszki” zderzyłaby się z Crunch na stronie |
| Rollout (sztanga) | Wyjazdy ze sztangą | Rollout ze sztangą | Rollout ze sztangą | STRONA | spójnie z Standing Barbell Rollout i Barbell Rollout from Bench |
| Side Bend (hantel) | Skłony boczne z hantlą | Skłony boczne z hantlem | Skłony boczne z hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Snatch (hantel) | Rwanie hantlą | Szarpnięcie z hantlem (snatch) | Rwanie hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Arm RDL (hantel/linka) | Rumuński martwy ciąg jednorącz, hantla lub wyciąg | Rumuński martwy ciąg jednorącz z hantlem lub na wyciągu | Rumuński martwy ciąg jednorącz z hantlą lub na wyciągu | POPRAWIONA | przecinek w nazwie aplikacji |
| Belt Squat Machine | Przysiad z pasem na maszynie | Belt squat na maszynie | Belt squat na maszynie | STRONA | jak wyżej |
| Around The Worlds | Around the world z hantlami | Okrążenia ramion z hantlami leżąc (around the world) | Around the world z hantlami | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Flat Bench Dumbbell Fly | Rozpiętka z hantlą jednorącz na ławce | Rozpiętki jednorącz z hantlem leżąc | Rozpiętki z hantlą jednorącz leżąc | POPRAWIONA | spójnie z rozpiętkami leżąc + forma „hantla” |
| One-Arm Kettlebell Floor Press | Wyciskanie kettlebella jednorącz leżąc na podłodze | Wyciskanie kettlebell jednorącz leżąc na podłodze | Wyciskanie kettlebella jednorącz leżąc na podłodze | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One Arm Dumbbell Bench Press | Wyciskanie hantli jednorącz na ławce | Wyciskanie hantla jednorącz leżąc | Wyciskanie hantli jednorącz leżąc | POPRAWIONA | wyciskanie leżąc + forma „hantla” |
| Wide-Grip Barbell Bench Press | Wyciskanie sztangi na ławce szerokim chwytem | Wyciskanie sztangi leżąc szerokim chwytem | Wyciskanie sztangi leżąc szerokim chwytem | STRONA | spójnie z wyciskaniem leżąc |
| Front Raise And Pullover | Unoszenie sztangi i pullover leżąc | Unoszenie ramion przodem z pullover | Unoszenie sztangi i pullover leżąc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Wide-Grip Decline Barbell Pullover | Pullover ze sztangą głową w dół | Pullover ze sztangą szerokim chwytem na ławce głową w dół | Pullover ze sztangą szerokim chwytem na ławce skośnej głową w dół | POPRAWIONA | aplikacja gubi ławkę i szeroki chwyt; słownik |
| Smith Machine Decline Press | Wyciskanie na suwnicy Smitha głową w dół | Wyciskanie na ławce skośnej głową w dół na suwnicy Smitha | Wyciskanie na ławce skośnej głową w dół na suwnicy Smitha | STRONA | słownik: lawka_skosna_glowa_w_dol |
| Leverage Decline Chest Press | Wyciskanie na maszynie, skos ujemny | Wyciskanie na maszynie głową w dół | Wyciskanie na maszynie głową w dół | STRONA | „skos ujemny” to nie język sali; słownik |
| Leverage Incline Chest Press | Wyciskanie na maszynie, skos dodatni | Wyciskanie na maszynie na ławce skośnej | Wyciskanie na maszynie na ławce skośnej | STRONA | „skos dodatni” to nie język sali |
| Push-Up Wide | Pompki szeroko | Pompki szerokim chwytem | Pompki szeroko | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Isometric Wipers | Pompki szeroko z przesunięciem na boki | Wycieraczki izometryczne | Pompki szeroko z przesunięciem na boki | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Incline Push-Up Reverse Grip | Pompki odwrotnym chwytem na podwyższeniu | Pompki na podwyższeniu odwrotnym chwytem | Pompki odwrotnym chwytem na podwyższeniu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Plyo Kettlebell Push-Ups | Pompki z przeskokiem dłoni nad kettlebellem | Pompki plyometryczne na kettlebell | Pompki z przeskokiem dłoni nad kettlebellem | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Full Range-Of-Motion Lat Pulldown | Ściąganie drążka pełnym zakresem ruchu | Ściąganie drążka wyciągu górnego w pełnym zakresie ruchu | Ściąganie drążka pełnym zakresem ruchu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Gironda Sternum Chins | Podciąganie do mostka w stylu Girondy | Podciąganie Girondy do mostka | Podciąganie do mostka w stylu Girondy | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Kneeling High Pulley Row | Wiosłowanie na wyciągu górnym w klęku | Wiosłowanie na klęczkach na wyciągu górnym | Wiosłowanie na wyciągu górnym w klęku | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Leverage High Row | Wiosłowanie na maszynie z górnym uchwytem | Wiosłowanie wysokie na maszynie | Wiosłowanie na maszynie z górnym uchwytem | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One Arm Chin-Up | Podciąganie jednorącz | Podciąganie podchwytem jednorącz | Podciąganie jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Reverse Grip Bent Over Row | Wiosłowanie sztangą podchwytem w opadzie | Wiosłowanie sztangą w opadzie tułowia podchwytem | Wiosłowanie sztangą podchwytem w opadzie | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Seated Good Mornings | Dzień dobry siedząc | Good morning siedząc | Good morning siedząc | STRONA | „Dzień dobry” to kalka; strona i aplikacja mają „Good morning” w Good Morning |
| Smith Machine Behind the Back Shrug | Szrugsy na suwnicy Smitha za plecami | Szrugsy za plecami na suwnicy Smitha | Szrugsy na suwnicy Smitha za plecami | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Smith Machine Bent Over Row | Wiosłowanie na suwnicy Smitha w opadzie | Wiosłowanie w opadzie tułowia na suwnicy Smitha | Wiosłowanie na suwnicy Smitha w opadzie | APLIKACJA | nazwa zrecenzowana w aplikacji |
| See-Saw Press (Alternating Side Press) | Naprzemienne wyciskanie hantli nad głowę | Wyciskanie naprzemienne boczne (see-saw press) | Naprzemienne wyciskanie hantli nad głowę | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Kettlebell Seated Press | Wyciskanie kettlebella siedząc | Wyciskanie kettlebell siedząc | Wyciskanie kettlebella siedząc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Kettlebell Push Press | Push press z kettlebellem jednorącz | Push press z kettlebell jednorącz | Push press z kettlebellem jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Kettlebell Jerk | Podrzut kettlebella jednorącz | Jerk z kettlebell jednorącz | Podrzut kettlebella jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Kettlebell Split Jerk | Podrzut nożycowy kettlebella jednorącz | Split jerk z kettlebell jednorącz | Podrzut nożycowy kettlebella jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Lateral Raise (hantel) | Unoszenie hantli bokiem jednorącz | Unoszenie hantla bokiem jednorącz | Unoszenie hantli bokiem jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Incline Lateral Raise | Unoszenie hantli bokiem jednorącz, ławka skośna | Unoszenie hantla bokiem jednorącz na ławce skośnej | Unoszenie hantli bokiem jednorącz na ławce skośnej | POPRAWIONA | przecinek w nazwie aplikacji |
| Cable Seated Lateral Raise | Unoszenie ramion bokiem na wyciągu siedząc | Unoszenie ramienia bokiem na wyciągu siedząc | Unoszenie ramion bokiem na wyciągu siedząc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Front Incline Dumbbell Raise | Unoszenie hantli w przód na ławce skośnej | Unoszenie hantli przodem na ławce skośnej | Unoszenie hantli w przód na ławce skośnej | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Straight Raises on Incline Bench | Unoszenie sztangi na ławce skośnej leżąc przodem | Unoszenie prostych ramion na ławce skośnej | Unoszenie sztangi na ławce skośnej leżąc przodem | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Car Drivers | Obroty talerzem jak kierownicą | Kierowca (car driver) | Obroty talerzem jak kierownicą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Kettlebell Pirate Ships | Pirate ship z kettlebellem | Statek piracki z kettlebell | Pirate ship z kettlebellem | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Dumbbell Incline Shoulder Raise | Wypychanie barków z hantlami na ławce skośnej | Unoszenie hantli na ławce skośnej (barki) | Wypychanie barków z hantlami na ławce skośnej | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Barbell Incline Shoulder Raise | Wypychanie barków ze sztangą na ławce skośnej | Unoszenie sztangi na ławce skośnej (barki) | Wypychanie barków ze sztangą na ławce skośnej | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Smith Incline Shoulder Raise | Wypychanie barków na suwnicy Smitha | Unoszenie na ławce skośnej na suwnicy Smitha (barki) | Wypychanie barków na suwnicy Smitha | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Dumbbell One-Arm Upright Row | Wiosłowanie hantlą do brody jednorącz | Przyciąganie hantla wzdłuż tułowia jednorącz (upright row) | Wiosłowanie hantlą do brody jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Smith Machine One-Arm Upright Row | Wiosłowanie do brody na suwnicy Smitha jednorącz | Przyciąganie wzdłuż tułowia jednorącz na suwnicy Smitha (upright row) | Wiosłowanie do brody na suwnicy Smitha jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Dumbbell Lying One-Arm Rear Lateral Raise | Unoszenie hantli w tył leżąc jednorącz | Unoszenie hantla w tył jednorącz leżąc bokiem | Unoszenie hantli w tył leżąc jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Cable Rear Lateral Raise | Unoszenie ramion w tył na wyciągu jednorącz | Unoszenie ramienia w tył jednorącz na wyciągu | Unoszenie ramion w tył na wyciągu jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Cable Rope Rear-Delt Rows | Wiosłowanie liną na wyciągu na tył barków | Wiosłowanie na tylne aktony z linką na wyciągu | Wiosłowanie liną na wyciągu na tył barków | APLIKACJA | nazwa zrecenzowana w aplikacji |
| External Rotation with Band | Rotacja zewnętrzna z gumą | Rotacja zewnętrzna ramienia z gumą | Rotacja zewnętrzna z gumą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Internal Rotation with Band | Rotacja wewnętrzna z gumą | Rotacja wewnętrzna ramienia z gumą | Rotacja wewnętrzna z gumą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Isometric Neck Exercise - Front And Back | Izometryczne napinanie szyi przód i tył | Izometria mięśni szyi: przód i tył | Izometryczne napinanie szyi przód i tył | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Isometric Neck Exercise - Sides | Izometryczne napinanie szyi na boki | Izometria mięśni szyi: boki | Izometryczne napinanie szyi na boki | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Lying Neck Extension (talerz) | Prostowanie szyi leżąc z talerzem | Prostowanie szyi z talerzem leżąc | Prostowanie szyi leżąc z talerzem | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Lying Neck Flexion (talerz) | Zginanie szyi leżąc z talerzem | Zginanie szyi z talerzem leżąc | Zginanie szyi leżąc z talerzem | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Kettlebell Clean and Jerk | Zarzut i podrzut kettlebella jednorącz | Clean and jerk z kettlebell jednorącz | Zarzut i podrzut kettlebella jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Spider Curl (sztanga) | Spider curl ze sztangą | Uginanie ramion spider curl ze sztangą | Spider curl ze sztangą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Seated Close-Grip Concentration Barbell Curl | Uginanie koncentryczne ze sztangą siedząc | Uginanie skoncentrowane ze sztangą wąskim chwytem siedząc | Uginanie koncentryczne ze sztangą siedząc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Cross Body Hammer Curl | Uginanie młotkowe po przekątnej | Uginanie ramion chwytem młotkowym przed ciałem | Uginanie młotkowe po przekątnej | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Lying Supine Dumbbell Curl | Uginanie ramion z hantlami leżąc | Uginanie ramion z hantlami leżąc na plecach | Uginanie ramion z hantlami leżąc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One Arm Dumbbell Preacher Curl | Uginanie z hantlą na modlitewniku jednorącz | Uginanie ramienia z hantlem na modlitewniku jednorącz | Uginanie z hantlą na modlitewniku jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Preacher Hammer Dumbbell Curl | Uginanie młotkowe z hantlami na modlitewniku | Uginanie ramion chwytem młotkowym na modlitewniku | Uginanie młotkowe z hantlami na modlitewniku | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Standing One-Arm Cable Curl | Uginanie ramienia na wyciągu stojąc jednorącz | Uginanie ramienia na wyciągu jednorącz stojąc | Uginanie ramienia na wyciągu stojąc jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Lying Close-Grip Bar Curl On High Pulley | Uginanie ramion na górnym wyciągu leżąc | Uginanie ramion wąskim chwytem na wyciągu górnym leżąc | Uginanie ramion na górnym wyciągu leżąc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Dumbbell Lying Pronation | Pronacja leżąc z hantlą | Pronacja z hantlem leżąc | Pronacja leżąc z hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Dumbbell Lying Supination | Supinacja leżąc z hantlą | Supinacja z hantlem leżąc | Supinacja leżąc z hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Dumbbell Wrist Curl | Uginanie nadgarstka z hantlą jednorącz | Uginanie nadgarstka z hantlem jednorącz | Uginanie nadgarstka z hantlą jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Dumbbell Reverse Wrist Curl | Uginanie nadgarstka nachwytem z hantlą jednorącz | Odwrotne uginanie nadgarstka z hantlem jednorącz | Uginanie nadgarstka nachwytem z hantlą jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Reverse Plate Curls | Uginanie ramion z talerzem nachwytem | Uginanie ramion nachwytem z talerzem | Uginanie ramion z talerzem nachwytem | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Bottoms-Up Clean From The Hang Position | Zarzut kettlebella dnem do góry ze zwisu | Clean z kettlebell dnem do góry z zawisu | Zarzut kettlebella dnem do góry ze zwisu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Smith Machine Close-Grip Bench Press | Wyciskanie wąskim chwytem na suwnicy Smitha | Wyciskanie leżąc wąskim chwytem na suwnicy Smitha | Wyciskanie wąskim chwytem na suwnicy Smitha | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Reverse Grip Bench Press | Wyciskanie sztangi na ławce odwrotnym chwytem | Wyciskanie leżąc podchwytem | Wyciskanie sztangi leżąc podchwytem | POPRAWIONA | spójnie z wyciskaniem leżąc; dodane „sztangi” |
| Decline Close-Grip Bench To Skull Crusher | Wyciskanie wąsko do francuskiego głową w dół | Wyciskanie wąsko na ławce głową w dół przechodzące we francuskie | Wyciskanie wąsko do francuskiego głową w dół | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Decline EZ Bar Triceps Extension | Prostowanie ramion ze sztangą EZ głową w dół | Prostowanie ramion ze sztangą łamaną na ławce głową w dół | Prostowanie ramion ze sztangą EZ na ławce skośnej głową w dół | POPRAWIONA | słownik + sprzęt jak w aplikacji |
| Lying Close-Grip Barbell Triceps Extension Behind The Head | Wyciskanie francuskie wąsko zza głowy leżąc | Prostowanie ramion za głowę ze sztangą wąskim chwytem leżąc | Wyciskanie francuskie wąsko zza głowy leżąc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Lying Dumbbell Triceps Extension | Prostowanie ramienia z hantlą leżąc jednorącz | Prostowanie ramienia z hantlem jednorącz leżąc | Prostowanie ramienia z hantlą leżąc jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Dumbbell One-Arm Triceps Extension | Prostowanie ramienia z hantlą jednorącz | Prostowanie ramienia z hantlem jednorącz | Prostowanie ramienia z hantlą jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Standing Overhead Barbell Triceps Extension | Prostowanie ramion ze sztangą nad głową | Prostowanie ramion zza głowy ze sztangą stojąc | Prostowanie ramion ze sztangą nad głową | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Cable Incline Triceps Extension | Prostowanie ramion na wyciągu, ławka skośna | Prostowanie ramion na wyciągu na ławce skośnej | Prostowanie ramion na wyciągu na ławce skośnej | STRONA | przecinek w nazwie aplikacji |
| Reverse Grip Triceps Pushdown | Prostowanie ramion na wyciągu podchwytem | Prostowanie ramion na wyciągu górnym podchwytem | Prostowanie ramion na wyciągu podchwytem | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Standing Low-Pulley One-Arm Triceps Extension | Prostowanie ramienia na dolnym wyciągu jednorącz | Prostowanie ramienia na wyciągu dolnym jednorącz stojąc | Prostowanie ramienia na dolnym wyciągu jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Ring Dips | Dipy na kółkach | Dipy na kółkach gimnastycznych | Dipy na kółkach | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Incline Push-Up Close-Grip | Pompki wąsko z rękami na podwyższeniu | Pompki wąskie na podwyższeniu | Pompki wąsko z rękami na podwyższeniu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Overhead Kettlebell Squat | Przysiad z kettlebellem nad głową jednorącz | Przysiad z kettlebell nad głową jednorącz | Przysiad z kettlebellem nad głową jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Hip Flexion with Band | Zginanie biodra z gumą | Unoszenie kolana z gumą | Unoszenie kolana z gumą | STRONA | „zginanie biodra” to język podręcznika; nazwa strony mówi, co widać |
| One-Arm Side Deadlift | Martwy ciąg z boku jednorącz | Martwy ciąg boczny jednorącz | Martwy ciąg z boku jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Sled Drag (Harness) | Ciągnięcie sanek w szelkach | Ciągnięcie sanek w uprzęży | Ciągnięcie sanek w szelkach | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Alternate Leg Diagonal Bound | Naprzemienny skok po przekątnej | Skoki diagonalne naprzemiennie | Naprzemienny skok po przekątnej | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Alternate Leg Push-Off | Wyskoki z nogą na skrzyni naprzemiennie | Odbicia naprzemiennie jedną nogą | Wyskoki z nogą na skrzyni naprzemiennie | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Leg Push-Off | Wyskoki z nogą na skrzyni | Odbicia jedną nogą | Wyskoki z nogą na skrzyni | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Side to Side Box Shuffle | Przeskoki na podwyższeniu z boku na bok | Przeskoki ze strony na stronę przez skrzynię | Przeskoki na podwyższeniu z boku na bok | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Dumbbell Seated Box Jump | Wskok na skrzynię z siadu z hantlami | Wskok na skrzynię z hantlami z siadu | Wskok na skrzynię z siadu z hantlami | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Double Leg Butt Kick | Podskoki z piętami do pośladków obunóż | Doskoki piętami do pośladków obunóż | Podskoki z piętami do pośladków obunóż | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Single Leg Butt Kick | Podskoki z piętami do pośladków jednonóż | Doskoki piętą do pośladka jednonóż | Podskoki z piętami do pośladków jednonóż | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Front Cone Hops | Skoki przez pachołek w przód | Przeskoki przez pachołki do przodu | Skoki przez pachołek w przód | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Downward Facing Balance | Balans na piłce gimnastycznej leżąc przodem | Równowaga w pozycji psa głową w dół | Balans na piłce gimnastycznej leżąc przodem | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Dumbbell Seated One-Leg Calf Raise | Wspięcia na palce siedząc jednonóż z hantlą | Wspięcia na palce siedząc na jednej nodze z hantlem | Wspięcia na palce siedząc jednonóż z hantlą | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Prone Flutter Kicks | Nożyce leżąc na brzuchu | Nożyce nóg leżąc na brzuchu | Nożyce leżąc na brzuchu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Hip Extension with Bands | Prostowanie biodra z gumami | Prostowanie biodra z gumą | Prostowanie biodra z gumami | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Lateral Cone Hops | Skoki przez pachołek w bok | Skoki boczne przez pachołki | Skoki przez pachołek w bok | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Kettlebell Swings | Wymachy kettlebellem jednorącz | Swing kettlebell jednorącz | Wymachy kettlebellem jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Alternate Heel Touchers | Naprzemienne dotykanie pięt | Dotykanie pięt naprzemiennie | Naprzemienne dotykanie pięt | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Bosu Ball Cable Crunch With Side Bends | Brzuszki na wyciągu ze skłonami, półkula | Spięcia brzucha na wyciągu z bocznymi skłonami na półkuli balansowej | Spięcia brzucha na wyciągu ze skłonami bocznymi na półkuli balansowej | POPRAWIONA | przecinek i „półkula” bez określenia w aplikacji |
| Butt-Ups | Unoszenie bioder z podporu na przedramionach | Butt-up | Unoszenie bioder z podporu na przedramionach | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Cable Russian Twists | Rosyjskie skręty na wyciągu | Russian twist na wyciągu | Rosyjskie skręty na wyciągu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Cable Seated Crunch | Brzuszki na wyciągu siedząc | Spięcia brzucha na wyciągu siedząc | Brzuszki na wyciągu siedząc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Cocoons | Scyzoryk z ugiętymi nogami | Cocoon | Scyzoryk z ugiętymi nogami | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Gorilla Chin/Crunch | Podciąganie z unoszeniem kolan | Gorilla chin-up z brzuszkiem | Podciąganie z unoszeniem kolan | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Kneeling Cable Crunch With Alternating Oblique Twists | Brzuszki na wyciągu w klęku ze skrętami | Spięcia brzucha na wyciągu na klęczkach ze skrętami tułowia | Brzuszki na wyciągu w klęku ze skrętami | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm High-Pulley Cable Side Bends | Skłony boczne na górnym wyciągu jednorącz | Skłony boczne na wyciągu górnym jednorącz | Skłony boczne na górnym wyciągu jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One-Arm Medicine Ball Slam | Rzut piłką lekarską o podłogę jednorącz | Rzuty piłką lekarską o podłogę jednorącz | Rzut piłką lekarską o podłogę jednorącz | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Seated Flat Bench Leg Pull-In | Przyciąganie nóg siedząc na ławce | Przyciąganie nóg do klatki siedząc na ławce | Przyciąganie nóg siedząc na ławce | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Sledgehammer Swings | Uderzenia młotem w oponę | Uderzenia młotem | Uderzenia młotem w oponę | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Supine One-Arm Overhead Throw | Rzut jednorącz nad głowę leżąc na plecach | Rzut znad głowy jednorącz leżąc na plecach | Rzut jednorącz nad głowę leżąc na plecach | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Weighted Sit-Ups - With Bands | Brzuszki z gumą na ławce skośnej głową w dół | Brzuszki na ławce skośnej z gumą | Brzuszki z gumą na ławce skośnej głową w dół | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Chin To Chest Stretch | Rozciąganie karku w skłonie brody do klatki | Rozciąganie karku: broda do klatki | Rozciąganie karku w skłonie brody do klatki | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Leg Swings (Front-to-Back) | Wymachy nóg w przód i w tył | Wymachy nogą w przód i w tył | Wymachy nóg w przód i w tył | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Groiners | Przyciąganie stopy do dłoni z podporu | Groiner | Przyciąganie stopy do dłoni z podporu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Iron Crosses (Stretch) | Żelazny krzyż (rozciąganie) | Iron cross (rozciąganie) | Żelazny krzyż (rozciąganie) | APLIKACJA | nazwa zrecenzowana w aplikacji |
| One Knee To Chest | Kolano do klatki piersiowej | Przyciąganie jednego kolana do klatki | Kolano do klatki piersiowej | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Round The World Shoulder Stretch | Rozciąganie barków z krążeniem ramion | Rozciąganie barków (okrążenia ramion) | Rozciąganie barków z krążeniem ramion | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Leg Swings (Side-to-Side) | Wymachy nóg na boki | Wymachy nogą na boki | Wymachy nóg na boki | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Side Lying Groin Stretch | Rozciąganie pachwiny leżąc na boku | Rozciąganie przywodzicieli leżąc na boku | Rozciąganie pachwiny leżąc na boku | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Standing Soleus And Achilles Stretch | Rozciąganie łydki i ścięgna Achillesa stojąc | Rozciąganie mięśnia płaszczkowatego i ścięgna Achillesa stojąc | Rozciąganie łydki i ścięgna Achillesa stojąc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Standing Toe Touches | Dotykanie palców stóp stojąc | Skłony do dotknięcia palców stojąc | Dotykanie palców stóp stojąc | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Adductor-SMR | Rolowanie przywodzicieli | Rolowanie przywodzicieli wałkiem | Rolowanie przywodzicieli | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Calves-SMR | Rolowanie łydek | Rolowanie łydek wałkiem | Rolowanie łydek | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Foam Roll: Hamstrings | Rolowanie tyłu uda | Rolowanie tylnej części uda wałkiem | Rolowanie tyłu uda | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Iliotibial Tract-SMR | Rolowanie pasma biodrowo-piszczelowego | Rolowanie pasma biodrowo-piszczelowego wałkiem | Rolowanie pasma biodrowo-piszczelowego | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Latissimus Dorsi-SMR | Rolowanie najszerszego grzbietu | Rolowanie najszerszych grzbietu wałkiem | Rolowanie najszerszego grzbietu | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Peroneals-SMR | Rolowanie boku łydki | Rolowanie mięśni strzałkowych wałkiem | Rolowanie boku łydki | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Piriformis-SMR | Rolowanie mięśnia gruszkowatego | Rolowanie mięśnia gruszkowatego wałkiem | Rolowanie mięśnia gruszkowatego | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Foam Roll: Quadriceps | Rolowanie przodu uda | Rolowanie czworogłowego wałkiem | Rolowanie przodu uda | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Rhomboids-SMR | Rolowanie górnej części pleców | Rolowanie górnej części pleców wałkiem | Rolowanie górnej części pleców | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Foot-SMR | Rolowanie stopy | Rolowanie stopy piłeczką | Rolowanie stopy | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Frog Hops | Skoki żabką | Skoki żabki | Skoki żabką | APLIKACJA | nazwa zrecenzowana w aplikacji |
| Toe Touchers | Dotykanie palców stóp leżąc | Dotykanie palców stóp | Dotykanie palców stóp leżąc | APLIKACJA | nazwa zrecenzowana w aplikacji |

## Trafienia wzorców zakazanych i nazwy wątpliwe (zadanie 2)

### Trafienia wzorców (14)

| Wzorzec (pojęcie) | Nazwy | Decyzja | Powód |
|---|---|---|---|
| `wykrok` (`nozyce`) | 11 nazw „Wykroki …” (dowody/wzorce-zakazane.txt) | **wyjątek przyjęty** | słownik sam mówi, że „wykrok” to osobne ćwiczenie (lunge); zakaz chroni opis pozycji nożyc w dwuboju; precedens `pl/nozyce: Wykroki i wejścia na skrzynię` |
| `rack` (`rack_kettlebell`) | `Rack Pull`, `Rack Pull with Bands` | **wyjątek przyjęty** | „rack” to tu stojak, nie pozycja kettlebelli przy barkach; „rack pull” to nazwa, po której się szuka |
| `rack` (`rack_kettlebell`) | `Rack Delivery` | **wyjątek warunkowy** | tu „rack” znaczy pozycję sztangi przy barkach, czyli to, czego zakaz dotyczy; karta nie ma opisu ruchu, więc polskiej nazwy nie da się ustalić bez zgadywania. Wyjątek do czasu opisu karty, potem nazwa polska bez „rack” |

Forma wyjątków: jak dotąd w `WYJATKI` strażnika, po jednym wpisie na tekst (`pl/nozyce: <nazwa>`), budowane z nazw **po poprawkach** (np. „Wykroki chodzone ze sztangą”, nie „Chodzone wykroki ze sztangą”). Odrzucone: jeden wyjątek dla całego pojęcia w plikach nazw — szybszy, ale przepuściłby „wykrok” użyty w znaczeniu nożyc w przyszłej nazwie.

Nowe nazwy z recenzji nie dodają trafień: „Przysiad z obciążeniem podwieszonym przy biodrach (dip belt)” omija „pas” (wzorzec `tasma_rozciaganie`). `Belt squat` zostaje z tego samego powodu.

### Nazwy wątpliwe z listy autora

| Pozycja | Decyzja |
|---|---|
| `Hip Flexion with Band` (#506) | przyjęta nazwa strony „Unoszenie kolana z gumą” (lepsza niż „Zginanie biodra z gumą” w aplikacji; do zgłoszenia aplikacji) |
| `Leg Pull-In` (#613) | przyjęta |
| `Seated Flat Bench Leg Pull-In` (#622) | nazwa aplikacji „Przyciąganie nóg siedząc na ławce” (załącznik C) |
| `Butt-Ups` (#595), `Cocoons` (#600) | nazwy aplikacji: „Unoszenie bioder z podporu na przedramionach”, „Scyzoryk z ugiętymi nogami” (załącznik C) |
| `Side Jackknife` (#623) | „Scyzoryk bokiem (side jackknife)” (tabela A, N) |
| `Otis-Up`, `Spell Caster`, `Body-Up`, `Circus Bell`, `Jerk Balance`, `Bent Press` | przyjęte po angielsku |
| `Rack Delivery` (#402) | po angielsku warunkowo (wyżej) |
| „tylne aktony” (#388, #389) | odrzucone: „na tył barków” (aplikacja; „akton” to język podręcznika) |
| `Belt Squat` (#73, #258) | przyjęte „Belt squat” (odstępstwo od aplikacji „Przysiad z pasem…”, żeby nie dodawać wyjątku od `tasma_rozciaganie`) |
| Rozciąganie i rolowanie (#636–#703) | 11 nazw rolowania wg aplikacji, bez „wałkiem” (załącznik C); pozostałe przyjęte |
| `World's Greatest Stretch` (#692) | sama nazwa angielska (tabela A, N) |

## Do sprawdzenia (pewność ≤ 80%)
- Czy na polskiej sali mówi się „zarzut siłowy” / „rwanie siłowe” (power clean/snatch) i „z zawieszenia” (hang) — pytanie do trenera dwuboju; do tego czasu angielski w nawiasie.
- „Rack Delivery”: jaki to ruch (karta bez opisu i wskazówek).
- „Hantla” (ż.) czy „hantel” (m.) jako forma potoczna — obie są w użyciu; wybór „hantla” wynika tylko ze spójności z aplikacją.
- „Sztanga EZ” czy „sztanga łamana” — jak wyżej; jeśli właściciel woli „łamaną”, zmienić trzeba aplikację (opcja b w 002).
- Anatomiczne nazwy w rozciąganiu (np. „mięśnia piszczelowego tylnego”) wobec potocznych w aplikacji („bok łydki”, „tył uda”) — ocena człowieka.

## Co działa dobrze i należy zachować
- Wzorzec „czynność + sprzęt słownie” i polskie nazwy podstawowe („Martwy ciąg”, „Przysiad bułgarski”, „Podciąganie nachwytem”).
- „Wyciąg” zamiast „linki”, „ślizgacze”, „taśmy do podwieszania”, „piłka gimnastyczna”, „suwnica Smitha” — zgodne ze słownikiem.
- Anglicyzmy sali („Face pull”, „Hip thrust”, „Pallof press”) bez zbędnego tłumaczenia.
- Nawias z nazwą angielską tylko tam, gdzie polska nic nie mówi.
- Zero duplikatów i kontrola trafień wzorców przed recenzją.

## Decyzje dla właściciela
Decyzje recenzenta (analogia, do weta):
1. Nazwa zrecenzowana w aplikacji jest kanonem strony (002, opcja a). Odrzucone: strona jako kanon (koszt przekładu w 33 językach aplikacji).
2. Terminy dwuboju po polsku z angielskim w nawiasie (003, opcja a). Odrzucone: same angielskie nazwy.
3. Wyjątki strażnika: 13 przyjętych, `Rack Delivery` warunkowo; po jednym wpisie na tekst z nazw końcowych.
4. 16 nazw, w których strona jest lepsza niż aplikacja (załącznik C, „STRONA”), zgłosić aplikacji jako osobne zadanie (rola 09 w repo aplikacji).

## Proponowane polecenie naprawy
`node tools/assemble.mjs 09-lokalizacja --tryb fix --zadania 09-lokalizacja-001,09-lokalizacja-002,09-lokalizacja-003,09-lokalizacja-004,09-lokalizacja-005`

Wykonawca: autor nazw (AU), według tabel A, B i C; 006 realizuje Z-32 razem z podłączeniem nazw.

## Porównanie ze STAN.md autora (po ocenie)
- Zgodne: przyjęcie „wykroków” i „rack pull” jako wyjątków; „Belt squat”; nazwy własne po angielsku.
- Rozbieżne: autor nie porównał nazw z aplikacją (002); „tylne aktony” uznał za język sali (odrzucone); „clean/snatch/jerk” zostawił po angielsku mimo pojęcia `podrzut_jerk` (003); `Rack Delivery` autor traktuje jak `Rack Pull`, recenzja tylko warunkowo.
- Nie wykryte przez autora: 001 (dwie zmiany znaczenia), 004 (odmiana), 005.
