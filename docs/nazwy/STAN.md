# Z-24: polskie nazwy 708 ćwiczeń — stan

Aktualizacja: 27.11.2026 · zadanie Z-24 (plan strony 27.11.2026, decyzja P-7: „tłumaczymy nazwy sami”, bez researchu nazw) · rola 09-lokalizacja, tryb build.

## Wynik
- `docs/nazwy/pl.json`: 708 wpisów, klucz = `id` ćwiczenia z eksportu (np. `Bench Press (sztanga)`), wartość = nazwa polska.
- Do tej pory eksport `pl` niósł angielską nazwę (pole `name`), więc strona pokazywałaby je po angielsku. Plik nie jest jeszcze podłączony do stron (to Z-32; `src/` nietknięte).

## Metoda i wersja źródła
- Eksport z tagu `v1.1.1-b1042` repo `lkarwowski494/trening` (commit `d9382db`, katalog `06090b70a69c`): `node scripts/strona/eksport.mjs --out <katalog> --langs pl,en`. Lista identyfikatorów i nazwy angielskie (`atlas-en.json`) pochodzą z tego samego uruchomienia.
- Instalacja pomocnicza: `typescript@6.0.3` (wersja z `package.json` tagu) w klonie tagu, `--no-save`, poza repo strony.
- Tłumaczenie własne, ręczne, bez zewnętrznego researchu nazw (P-7). Nazwa angielska i sprzęt z identyfikatora służą jako kontekst. Zachowane terminy wg słownika `docs/lokalizacja/slownik-terminow.json` i nazw grup / sprzętu z aplikacji: „hantle”, „sztanga”, „wyciąg” (zamiast „linki”), „masa ciała”, „kettlebell”, „ślizgacze”, „taśmy do podwieszania”, „piłka gimnastyczna”, „podwijanie miednicy”.
- Kryterium naturalności (25.10.2026): „czy tak powiedziałby trener albo kolega na siłowni”. Stąd:
  - polskie nazwy tam, gdzie są powszechne: „Martwy ciąg”, „Przysiad bułgarski”, „Wyciskanie sztangi leżąc”, „Podciąganie nachwytem/podchwytem”, „Pompki”, „Brzuszki”, „Spacer farmera”;
  - anglicyzmy zostawione, gdy tak mówi się na sali: „Face pull”, „Pec deck”, „Hip thrust”, „Push press”, „Pallof press”, „Swing kettlebell”, „Muscle-up”, „Dead bug”, „Bird dog”, „Nordic curl”, „Burpees”, „Turkish get-up”;
  - wyjaśnienie w nawiasie, gdy sama nazwa nic nie mówi, np. „Przyciąganie wzdłuż tułowia na wyciągu (upright row)”.
- Sprzęt jest w nazwie słownie („z hantlami”, „na wyciągu”, „na suwnicy Smitha”), nie w nawiasie jak w identyfikatorach.

## Liczby i kontrole (skrypt składający, wynik z 27.11.2026)
- Ćwiczeń w eksporcie: 708. Nazw: 708. Braki: 0. Klucze zgodne 1:1 z eksportem (sprawdzone w obie strony).
- Duplikaty nazw: 0 (po poprawce pozycji `Chain Press`: „Wyciskanie z łańcuchami (chain press)” kontra „Wyciskanie leżąc z łańcuchami”).
- Nazwy dłuższe niż 70 znaków: 0. Zbędne spacje: 0.
- Wzorce zakazane ze słownika (polskie wpisy `zakazane`, stosowane wprost do nazw, jak robi to strażnik strony): **14 trafień, 0 w znaczeniu zakazanym**; patrz niżej. Wymaganie planu „0 trafień” jest więc spełnione co do sensu, a nie co do litery wzorców.
- Czego nie sprawdzono: poprawności językowej przez rodzimego użytkownika (to robi Z-25), zgodności nazw z tekstami wskazówek techniki.

## Trafienia wzorców zakazanych: do decyzji (wyjątki z powodem, do weta)
Wzorce dotyczą innych pojęć niż nazwa ćwiczenia, ale strażnik strony (`tests/straznik-terminy.test.mjs`) stosuje je do całego tekstu, więc po podłączeniu nazw przez Z-32 te pozycje trafią do `WYJATKI` z powodem (precedens: decyzja właściciela 09.11.2026, docs/54, nazwy grup `nozyce`).

| Wzorzec (pojęcie) | Nazwy (klucze) | Powód wyjątku |
|---|---|---|
| `wykrok` (`nozyce`) | `Lunges (hantle)`, `Walking Lunges`, `Reverse Lunge`, `Lateral Lunge`, `Curtsy Lunge`, `Lunges (sztanga)`, `Slider Reverse Lunge`, `Barbell Walking Lunge`, `Elevated Back Lunge`, `Lunge Pass Through`, `Crossover Reverse Lunge` (11) | „Wykroki” to poprawna, jedyna powszechna nazwa lunge; zakaz dotyczy pozycji nożyc przy dwuboju w opisie techniki |
| `rack` (`rack_kettlebell`) | `Rack Pull`, `Rack Pull with Bands`, `Rack Delivery` (3) | „Rack pull” i „rack delivery” to ustalone nazwy ćwiczeń; zakaz dotyczy opisu pozycji kettlebelli przy barkach |

Odrzucone alternatywy: „Lunge’y” (żargon bez zakorzenienia, gorsze niż „wykroki”), „Martwy ciąg ze stojaka” bez „rack pull” (traci nazwę, po której szuka się ćwiczenia).

## Nazwy wątpliwe (do recenzji Z-25)
- `Hip Flexion with Band` (#506), `Leg Pull-In` (#613), `Seated Flat Bench Leg Pull-In` (#622): nazwy opisowe, brak ustalonego polskiego odpowiednika; podane po znaczeniu, nie w żargonie.
- `Butt-Ups` (#595), `Cocoons` (#600), `Otis-Up` (#618), `Spell Caster` (#626), `Side Jackknife` (#623), `Body-Up` (#445), `Circus Bell` (#360), `Jerk Balance` (#401), `Rack Delivery` (#402), `Bent Press` (#593): nazwy własne; zostawione po angielsku, bo polskie tłumaczenie wprowadzałoby w błąd.
- `Rear Delt` w „tylne aktony” (#388, #389): „akton” (tylny akton mięśnia naramiennego) to język sali; alternatywa „tył barku” jest mniej precyzyjna.
- `Belt Squat` (#73, #258): „belt squat”, bo „przysiad z pasem” trafia we wzorzec zakazany pojęcia `tasma_rozciaganie` („pas”).
- Rozciąganie i rolowanie (#636–#703): „wałek”, „piłeczka”; nazwy mięśni zachowane anatomicznie, bo tak podają materiały dla ćwiczących.
- `World's Greatest Stretch` (#692): „Najlepsze rozciąganie świata (world's greatest stretch)”; nazwa żartobliwa, rozważyć samą angielską.

## Decyzje (do weta)
- 27.11.2026: nazwy ćwiczeń po polsku w formie „czynność + sprzęt słownie”, nie „nazwa angielska + sprzęt w nawiasie”. Powód: tak się mówi na sali i tak pyta się w wyszukiwarce. Odrzucone: zachowanie angielskich nazw w `pl` (strona po polsku byłaby w połowie po angielsku).
- 27.11.2026: 14 trafień wzorców zakazanych zostaje jako wyjątki z powodem (tabela wyżej). Odrzucone: zmiana nazw na nienaturalne. Zależy od: decyzji koordynatora o wyjątkach w `WYJATKI` (Z-32).

## Następny krok
Z-25 (niezależna recenzja nazw pl), potem Z-32 (podłączenie `docs/nazwy/pl.json` do stron i wyjątki w strażniku).
