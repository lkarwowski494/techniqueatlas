# Z-24: polskie nazwy 708 ćwiczeń — stan

Aktualizacja: 27.11.2026 (po recenzji Z-25) · zadanie Z-24 (plan strony 27.11.2026, decyzja P-7: „tłumaczymy nazwy sami”, bez researchu nazw) · rola 09-lokalizacja, tryb build, potem fix wg recenzji.

## Wynik
- `docs/nazwy/pl.json`: 708 wpisów, klucz = `id` ćwiczenia z eksportu (np. `Bench Press (sztanga)`), wartość = nazwa polska.
- Eksport `pl` niósł dotąd angielską nazwę (pole `name`), więc strona pokazywałaby je po angielsku. Plik nie jest jeszcze podłączony do stron (to Z-32; `src/` nietknięte).
- Wersja 1 (SHA 9f4e060) została zrecenzowana (Z-25, commit b9ec769, werdykt: przyjęte z poprawkami). Wersja 2 (ta) zawiera wszystkie poprawki z recenzji.

## Metoda i wersja źródła
- Eksport z tagu `v1.1.1-b1042` repo `lkarwowski494/trening` (commit `d9382db`, katalog `06090b70a69c`): `node scripts/strona/eksport.mjs --out <katalog> --langs pl,en`. Lista identyfikatorów i nazwy angielskie pochodzą z tego samego uruchomienia.
- Instalacja pomocnicza: `typescript@6.0.3` (wersja z `package.json` tagu) w klonie tagu, `--no-save`, poza repo strony.
- Tłumaczenie własne, bez zewnętrznego researchu nazw (P-7). Kryterium naturalności (25.10.2026): „czy tak powiedziałby trener albo kolega na siłowni”. Wzorzec: „czynność + sprzęt słownie” („z hantlami”, „na wyciągu”, „na suwnicy Smitha”), nie „nazwa angielska + sprzęt w nawiasie”.
- Kanon: **nazwy zrecenzowane w aplikacji** (`docs/lokalizacja/nazwy-lokalne.json`, pole `pl`, tag `v1.1.1-b1042`, recenzja „zatwierdzone” 11.11.2026) oraz słownik terminów (`slownik-terminow.json`). Poprzednia wersja tego pliku nie porównywała nazw z aplikacją; to było źródłem większości poprawek.

## Poprawki z recenzji Z-25 (wprowadzone 27.11.2026)
Źródło: `docs/nazwy/recenzja-pl-2026-11-27.md` na gałęzi `strona/z25-recenzja-nazw-pl` (b9ec769), tabele A, B, C. Wprowadzono wszystkie **227 poprawek**; nie pominięto żadnej.

| Waga | Liczba | Co |
|---|---|---|
| W (wysoka) | 2 | `Clean and Jerk` (rwanie to snatch, nie clean: „Zarzut i podrzut (clean and jerk)”); `Downward Facing Balance` (ćwiczenie na piłce gimnastycznej, nie pozycja jogi: „Balans na piłce gimnastycznej leżąc przodem”) |
| S (średnia) | 214 | nazwy zrecenzowane w aplikacji przejęte (165) i poprawione wg jej odmiany i terminów (8), terminy dwuboju po polsku z angielskim w nawiasie, odmiana „kettlebellem / hantlą / sztanga EZ”, nazwy gubiące sprzęt (skrzynia, ławka głową w dół, talerz) |
| N (niska) | 11 | szlify nazw (np. „Spider curl”, „Zwijanie lędźwi”, „Scyzoryk bokiem”, „World's greatest stretch”) |

Liczenie wag jak w recenzji (tabela A wg jej wagi, tabele B i C = S). Każda poprawka zgadzała się z kolumną „Obecna” recenzji (0 niezgodności); propozycje z tabel A i C nie kolidowały.

Testy akceptacyjne z recenzji, wynik po poprawkach:
- `grep "rwanie i podrzut\|psa głową"` → 0 trafień (001).
- `Clean`, `Snatch`, `Jerk` poza nawiasem tylko w trzech drillach: `Jerk balance`, `Snatch balance`, `Muscle snatch` (003).
- `kettlebell\b` bez odmiany tylko w `Swing kettlebell`; 0 trafień `hantlem`, `hantla\b`, `łaman` (004).
- Różnice z aplikacją: 24 z 276 wspólnych nazw, **dokładnie** lista „STRONA” (16) + „POPRAWIONA” (8) z załącznika C; żadna spoza listy (005, 002).
- Duplikaty nazw: 0. Najdłuższa nazwa: 69 znaków. Klucze 1:1 z eksportem (708/708).

## Zgłoszenie dla aplikacji: 16 nazw, w których strona jest lepsza (nie zmieniano ich na nazwę aplikacji)
Zadanie dla roli 09 w repo aplikacji (poza tym repo). Powody wg recenzji: „skos ujemny/dodatni” i „Dzień dobry” to nie język sali, „ławka płaska” kontra „leżąc” (słownik: `wyciskanie_lezac`), brak „ławki skośnej głową w dół” (słownik: `lawka_skosna_glowa_w_dol`), „pas” w nazwie belt squat trafia we wzorzec `tasma_rozciaganie`, nazwa „Brzuszki” zderzyłaby się z `Crunch`.

| Klucz | Aplikacja | Strona (zostaje) |
|---|---|---|
| `Bench Press (sztanga)` | Wyciskanie sztangi na ławce płaskiej | Wyciskanie sztangi leżąc |
| `Bench Press (hantle)` | Wyciskanie hantli na ławce płaskiej | Wyciskanie hantli leżąc |
| `Chest Fly (hantle)` | Rozpiętki z hantlami na ławce płaskiej | Rozpiętki z hantlami leżąc |
| `Przysiad z pasem (linki)` | Przysiad z pasem na wyciągu | Belt squat na wyciągu |
| `Decline Bench Press (hantle)` | Wyciskanie hantli głową w dół | Wyciskanie hantli na ławce skośnej głową w dół |
| `Plank Shoulder Taps` | Podpórka z dotykaniem barków | Deska z dotykaniem barków |
| `Sit Up` | Brzuszki | Brzuszki z podniesieniem tułowia (sit-up) |
| `Rollout (sztanga)` | Wyjazdy ze sztangą | Rollout ze sztangą |
| `Belt Squat Machine` | Przysiad z pasem na maszynie | Belt squat na maszynie |
| `Wide-Grip Barbell Bench Press` | Wyciskanie sztangi na ławce szerokim chwytem | Wyciskanie sztangi leżąc szerokim chwytem |
| `Smith Machine Decline Press` | Wyciskanie na suwnicy Smitha głową w dół | Wyciskanie na ławce skośnej głową w dół na suwnicy Smitha |
| `Leverage Decline Chest Press` | Wyciskanie na maszynie, skos ujemny | Wyciskanie na maszynie głową w dół |
| `Leverage Incline Chest Press` | Wyciskanie na maszynie, skos dodatni | Wyciskanie na maszynie na ławce skośnej |
| `Seated Good Mornings` | Dzień dobry siedząc | Good morning siedząc |
| `Cable Incline Triceps Extension` | Prostowanie ramion na wyciągu, ławka skośna | Prostowanie ramion na wyciągu na ławce skośnej |
| `Hip Flexion with Band` | Zginanie biodra z gumą | Unoszenie kolana z gumą |

Osiem nazw „POPRAWIONA” (aplikacja ma w nich przecinek w nazwie albo gubi ławkę / chwyt; strona ma poprawioną wersję tej samej nazwy; do przejęcia przez aplikację): `Single Arm RDL (hantel/linka)`, `One-Arm Flat Bench Dumbbell Fly`, `One Arm Dumbbell Bench Press`, `Wide-Grip Decline Barbell Pullover`, `One-Arm Incline Lateral Raise`, `Reverse Grip Bench Press`, `Decline EZ Bar Triceps Extension`, `Bosu Ball Cable Crunch With Side Bends`.

Test po stronie Z-32 (z recenzji, znalezisko 002): `docs/nazwy/pl.json` porównywany z `nazwy-lokalne.json`; różnica dozwolona tylko z listy wyjątków z powodem (tu: 16 + 8 powyżej).

## Wzorce zakazane ze słownika: 14 trafień, wyjątki z powodem dla Z-32
Wzorce dotyczą innych pojęć niż nazwa ćwiczenia, ale strażnik strony (`tests/straznik-terminy.test.mjs`) stosuje je do całego tekstu. Po podłączeniu nazw przez Z-32 trafią do `WYJATKI` (klucz `pl/<pojęcie>: <nazwa>`, po jednym wpisie na tekst; precedens: decyzja właściciela 09.11.2026, docs/54). Poniższa lista jest zbudowana z nazw **po poprawkach** (kontrola: skrypt na `pl.json`, 14 trafień, te same nazwy).

| Wzorzec (pojęcie) | Nazwy końcowe (klucze) | Decyzja | Powód wyjątku |
|---|---|---|---|
| `wykrok` (`nozyce`) | „Wykroki z hantlami” (`Lunges (hantle)`), „Wykroki chodzone” (`Walking Lunges`), „Wykroki w tył” (`Reverse Lunge`), „Wykroki w bok” (`Lateral Lunge`), „Wykroki skrzyżne (curtsy)” (`Curtsy Lunge`), „Wykroki ze sztangą” (`Lunges (sztanga)`), „Wykroki w tył na ślizgaczach” (`Slider Reverse Lunge`), „Wykroki chodzone ze sztangą” (`Barbell Walking Lunge`), „Wykroki w tył z podwyższenia” (`Elevated Back Lunge`), „Wykroki z przekładaniem piłki” (`Lunge Pass Through`), „Wykroki w tył ze skrzyżowaniem nóg” (`Crossover Reverse Lunge`) (11) | przyjęty | słownik sam mówi, że „wykrok” to osobne ćwiczenie (lunge); zakaz chroni opis pozycji nożyc w dwuboju |
| `rack` (`rack_kettlebell`) | „Rack pull” (`Rack Pull`), „Rack pull z gumami” (`Rack Pull with Bands`) (2) | przyjęty | „rack” to tu stojak; „rack pull” to nazwa, po której się szuka |
| `rack` (`rack_kettlebell`) | „Rack delivery” (`Rack Delivery`) (1) | **warunkowy** | tu „rack” to pozycja sztangi przy barkach, czyli to, czego zakaz dotyczy; karta nie ma opisu ruchu, więc polskiej nazwy nie da się ustalić bez zgadywania. Wyjątek do czasu opisu karty, potem nazwa polska bez „rack” |

Nowe nazwy z recenzji nie dodają trafień. „Przysiad z obciążeniem podwieszonym przy biodrach (dip belt)” omija „pas” (wzorzec `tasma_rozciaganie`); `Belt squat` zostaje z tego samego powodu.

## Czego nie wprowadzono
- Nic z 227 poprawek. Zostają bez zmian zgodnie z recenzją: 16 nazw „STRONA” (wyżej), `Rack Delivery` po angielsku (warunkowo), drille `Snatch balance`, `Jerk balance`, `Muscle snatch` po angielsku oraz `Swing kettlebell` bez odmiany (utarta nazwa).
- Poprawka 006 (wyjątki w strażniku) należy do Z-32 razem z podłączeniem nazw, nie do tego zadania.

## Do sprawdzenia (pewność ≤ 80%, z recenzji; wymaga człowieka)
- Czy na polskiej sali mówi się „zarzut siłowy” / „rwanie siłowe” (power clean / snatch) i „z zawieszenia” (hang): pytanie do trenera dwuboju; do tego czasu angielski w nawiasie.
- `Rack Delivery`: jaki to ruch (karta bez opisu i wskazówek).
- „Hantla” (ż.) czy „hantel” (m.), „sztanga EZ” czy „łamana”: wybór wynika ze spójności z aplikacją; zmiana wymaga zmiany aplikacji (opcja b w znalezisku 002).
- Anatomiczne nazwy w rozciąganiu (np. „mięśnia piszczelowego tylnego”) wobec potocznych w aplikacji („bok łydki”, „tył uda”): ocena człowieka.
- Nie sprawdzono: poprawności językowej przez rodzimego użytkownika ani trenera (recenzja Z-25 to recenzja modelu), zgodności z tekstami wskazówek techniki.

## Decyzje (do weta)
- 27.11.2026: nazwy ćwiczeń po polsku w formie „czynność + sprzęt słownie”. Odrzucone: angielskie nazwy w `pl`.
- 27.11.2026 (po recenzji Z-25, opcja a ze znaleziska 002): nazwy zrecenzowane w aplikacji są kanonem strony; 16 lepszych nazw strony zostaje i idzie do aplikacji. Odrzucone: strona jako kanon (koszt nowej recenzji w aplikacji i przekładu 33 języków, tłumaczonych z polskich nazw).
- 27.11.2026 (znalezisko 003, opcja a): terminy dwuboju po polsku z angielskim w nawiasie (zarzut, rwanie, podrzut). Odrzucone: same angielskie nazwy.
- 27.11.2026: wyjątki strażnika terminów: 13 przyjętych, `Rack Delivery` warunkowo, po jednym wpisie na tekst z nazw końcowych (Z-32).

## Następny krok
Z-32: podłączenie `docs/nazwy/pl.json` do stron, wyjątki w strażniku terminów, test porównujący z `nazwy-lokalne.json`. Zgłoszenie 16 nazw do aplikacji (rola 09 w repo aplikacji).
