# Szablony tytułu, opisu, nagłówków-pytań i krótkiej odpowiedzi (Z-22)

Zadanie Z-22 planu startu (rola 04-studio-projektowe, build, moduł strona-www; sesja AZ, 27.11.2026). Języki: pl i en; tłumaczenie na 33 języki w Z-26, recenzja w Z-23, wdrożenie w `src/pages.mjs` w Z-34.
Kod szablonów: `src/szablony.mjs` (czyste funkcje, bez zmian w `src/pages.mjs`). Teksty stałe: `src/szablony/pl.json`, `src/szablony/en.json`. Test: `tests/szablony.test.mjs`. Tabela wzorców: `npm run szablony`; strony główne, listy i kategorie: `node src/szablony.mjs --strony`.
Dane: eksport aplikacji v1.1.1 (PIN.json, `npm run dane`), 708 ćwiczeń na język, 310 z własnymi kompletnymi wskazówkami (strony indeksowane wg P-1).

## 1. Zasady (wspólne dla wszystkich szablonów)

1. **Tylko dane, które strona już pokazuje:** nazwa, etykieta rodziny ruchu (`src/ui/<język>.json → families`), mięśnie (`regions` z obciążeniem, etykiety z eksportu), sprzęt (`requires` → `capabilities`), wskazówki własne (`cues.setup/move/tips/mistakes`, zdania dosłownie), liczby policzone z eksportu. Żadnego zdania spoza danych, słów kluczowych, nazw innych firm ani źródeł (plan, „Czego nie robimy”; Z-06 B3, A14). *Dlaczego:* tekst pod frazy to wzorzec, przed którym ostrzega Google („scaled content abuse”, Z-06 B5) i Bing (Z-06 B3).
2. **Wskazówki ogólne wzorca ruchu (`scope: general`, 28 wspólnych tekstów) nie trafiają do tytułu, opisu ani krótkiej odpowiedzi.** *Dlaczego:* ten sam tekst na wielu stronach nie opisuje danego ćwiczenia i robi opisy podobne (Google, snippet: „Identical or similar descriptions on every page of a site aren't helpful”).
3. **Brak powtórzeń słów między tytułem a opisem** (wymóg planu Z-22). Słowo = ciąg liter ≥ 4 znaków; porównanie po pierwszych 5 literach (łapie odmianę: „sztanga/sztangę”, „press/pressing”), bez spójników z listy w kodzie (`POMIJANE`). Zdanie, które powtarza słowo tytułu, wypada z opisu; bierze się następne. Wyjątek nazwany — pkt 3.4.
4. **Tytuł w języku strony.** Google: „Use the same language and writing system (meaning, the script or alphabet for a given language) as the primary content on your pages.” (developers.google.com/search/docs/appearance/title-link, „Last updated 2025-12-10”, odczyt 27.11.2026). Nazwy ćwiczeń są dziś angielskie także na stronach pl (P-7, nazwy lokalne dopiero z Z-24/Z-32), więc tytuł pl dostaje dopisek po polsku.
5. **Bez nazwy witryny w tytule strony ćwiczenia.** Nazwę witryny podaje `WebSite` JSON-LD na stronie `/` i `og:site_name` (Z-06 A6); Google: „Google may omit the site name from the title link, if it's repetitive with the site name that's already shown in the search result” (title-link, jw.). Dziś ogon „— Biblioteka ćwiczeń” (18 znaków) jest dłuższy niż mediana nazwy (16) — Z-06 A10 każe go usunąć.
6. **Długości** — źródła nie podają liczb. Google: „While there's no limit on how long a <title> element can be, the title link is truncated in Google Search results as needed, typically to fit the device width.” (title-link) i „There's no limit on how long a meta description can be, but the snippet is truncated in Google Search results as needed” (developers.google.com/search/docs/appearance/snippet, „Last updated 2026-04-20”, odczyt 27.11.2026). Z-06 też nie podaje liczb. Przyjęte granice (decyzja studia, do weta): **tytuł ≤ 60 znaków, opis 50–160 znaków, krótka odpowiedź ≤ 320 znaków** (`LIMITY` w kodzie). *Dlaczego:* tytuł i opis mieszczą się w szerokości wyniku na telefonie bez ucinania w środku zdania; to analogia do powszechnej praktyki, nie norma — dlatego zdanie, które przekroczyłoby limit, wypada w całości, a nie jest ucinane.
7. **Unikalność** tytułów (wszystkie strony) i opisów (strony indeksowane) w obrębie języka — Google, snippet: „Create unique descriptions for each page on your site”; „Page-specific data is a good candidate for programmatic generation.”
8. **Dane strukturalne:** nagłówki-pytania to zwykłe `<h2>`, **bez** `FAQPage` i `HowTo` (Z-06 B2: wycofane wyniki rozszerzone). Dla Z-34 zostaje wskazanie z Z-06 A11: `BreadcrumbList` (jest) i `WebPage` z `primaryImageOfPage`; dane strukturalne zgodne z widoczną treścią.

## 2. Strona ćwiczenia

### 2.1 Tytuł `<title>`
Szablon: `{nazwa} — {dopisek}` albo sama `{nazwa}`.
- `{nazwa}` = nazwa angielska z eksportu; po Z-32, gdy język ma zrecenzowaną nazwę lokalną (parametr `nazwaLokalna`): `{lokalna} ({angielska})` i **bez dopisku**; gdy to przekracza 60 znaków — sama `{lokalna}` (angielska zostaje w `<h1>`); lokalna dłuższa niż 60 znaków zostaje w całości (nazwy nie ucinamy — obcina wyszukiwarka); lokalna różna od angielskiej tylko wielkością liter („Nordic curl”) = nazwa angielska. Na pełnym `docs/nazwy/pl.json` z gałęzi `strona/z24-nazwy-pl` (708 nazw, odczyt 27.11.2026): 464 tytuły podwójne, reszta sama lokalna, 5 tytułów > 60 (lokalne 61–69 znaków), 0 powtórzeń tytuł↔opis poza wyjątkami; test na 6 przykładach z tego pliku.
- `{dopisek}` (kandydaci w kolejności): etykieta rodziny ruchu w języku strony (`families`), mięśnie główne. Kandydat odpada, gdy powtarza słowo nazwy, ma w sobie myślnik (etykieta „barki — przód” dałaby dwa myślniki w tytule) albo tytuł przekroczyłby 60 znaków.
- Wybór wariantu (z dopiskiem rodziny / mięśni / sama nazwa): ten, przy którym opis (2.2) osiąga minimum długości; potem — na stronach nie po angielsku — wariant z dopiskiem (pkt 1.4; rodzina przed mięśniami); potem ten, przy którym opis zachowuje zdanie ruchu i mięśnie główne. Przy remisie wcześniejszy.
- Wynik dla 310 stron indeksowanych: pl — dopisek rodziny 254, mięśni 22, sama nazwa 34; en — sama nazwa 157, rodzina 125, mięśnie 28. Długość tytułu: pl 15–60 (mediana 35), en 7–58 (mediana 24).

### 2.2 Opis `<meta name="description">`
Kolejka zdań z danych: 1) pierwsze zdanie ruchu (`cues.move[0]`), 2) mięśnie główne (`Mięśnie główne: {lista}.`; brak głównych → pomocnicze; brak obu → partia), 3) sprzęt (`Potrzebny sprzęt: {lista}.`, grupy alternatyw łączone słowem „albo”/„or”), 4) pierwsze zdanie ustawienia, 5) pierwsza wskazówka, 6) dalsze zdania ruchu, ustawienia, wskazówek i błędów, 7) mięśnie pomocnicze, 8) rodzaj ruchu (`Rodzaj ruchu: {rodzina}.`). Zdania 1 i 4–6 tylko przy własnych wskazówkach.
Zdanie wchodzi, gdy nie powtarza słowa tytułu i opis zostaje ≤ 160 znaków; składanie kończy się po przekroczeniu 100 znaków (2 × minimum), żeby opis nie był listą wszystkiego.
**Rozdzielanie powtórzonych opisów (tylko strony indeksowane):** gdy dwa ćwiczenia dostają ten sam opis (warianty z tymi samymi wskazówkami, np. Bench Press i Incline Bench Press w en), opis składa się do limitu, najpierw ze zdań, których bliźniak nie ma; gdy i to nie wystarcza, wchodzi zdanie o sprzęcie albo zdanie, którego bliźniak nie ma, **mimo powtórzenia słowa z tytułu** (wyjątek od pkt 1.3, zapisany w polu `wyjatek`). Uzasadnienie: unikalność ma źródło (pkt 1.7), zakaz powtórzeń jest zasadą planu bez źródła zewnętrznego. Skala: pl 6, en 38 z 310 stron (en: nazwy niosą sprzęt i ruch — „Dumbbell…”, „…Press” — więc zdanie, które je odróżnia, zawsze powtarza słowo tytułu).
Wynik dla 310 stron indeksowanych: pl 52–160 znaków (mediana 126), en 20–160 (mediana 124); opis zaczyna się zdaniem ruchu w pl 217/310, en 147/310 (w en zdanie ruchu często powtarza słowo nazwy, np. „press”, „curl”).
Krótsze niż 50 znaków: pl 0, en 9 stron indeksowanych — test sprawdza, że dane się wyczerpały (każde pominięte zdanie powtarza słowo tytułu albo przekracza limit); nie dopisujemy tekstu spoza danych.
Strony noindex (398 bez własnych wskazówek): opis z mięśni, sprzętu i rodzaju ruchu, bez wymogu minimum i unikalności; pusty opis (pl 1, en 14 stron — wszystkie słowa danych są w nazwie; z nazwami lokalnymi pl 8) ma jawne pole `pominOpis: true` i Z-34 **nie wstawia** `<meta name="description">` (jak dziś `layout()` przy pustym polu); test: `pominOpis` ⇔ pusty opis, i nigdy na stronie indeksowanej.

### 2.3 Krótka odpowiedź (akapit pod `<h1>`, przed rysunkiem)
Własne wskazówki: `{cues.move[0]} {zdanie mięśni}` (bez ruchu — pierwsze zdanie ustawienia). Bez własnych wskazówek: `{zdanie mięśni} {zdanie sprzętu}`. Bez zakazu powtórzeń względem tytułu (to treść strony, nie wynik wyszukiwania). Długość: pl 25–215, en 21–192 znaki na stronach indeksowanych. *Dlaczego ten skład:* odpowiada na dwa pytania, z którymi ktoś wchodzi na stronę ćwiczenia — jak się je robi i co pracuje — zdaniami, które strona i tak pokazuje niżej (Z-06 A14: tylko z istniejących danych).

### 2.4 Nagłówki-pytania (`<h2>` sekcji)
| Sekcja (dane) | pl | en | Kiedy |
|---|---|---|---|
| `cues.setup` | Jak się ustawić? | How do you set up? | własne wskazówki z ustawieniem |
| `cues.move` | Jak wykonać ruch? | How do you perform the movement? | własne wskazówki z ruchem |
| `regions` (mięśnie, sylwetka) | Które mięśnie pracują? | Which muscles does it work? | ćwiczenie ma mięśnie |
| `cues.tips` / `cues.ok` | Co pomaga w technice? | What helps your technique? | są wskazówki (przy ogólnych zostaje dopisek „Ogólne wskazówki dla tego ruchu”) |
| `cues.mistakes` | Jakich błędów unikać? | Which mistakes should you avoid? | są błędy |
| `requires` | Jaki sprzęt jest potrzebny? | What equipment do you need? | jest sprzęt |
| `alternatives` | Czym można je zastąpić? | What can you do instead? | są zamienniki |
Bez nazwy ćwiczenia w nagłówku (nazwa raz, w `<h1>`; Google o tytule: „there's no reason to have the same words or phrases appear multiple times” — przeniesione analogią na nagłówki). Pusta sekcja = brak nagłówka. Dziś mięśnie nie mają nagłówka — Z-34 dodaje `<h2>` nad sylwetką i listami.

## 3. Strona główna języka, lista, kategorie

| Strona | Tytuł | Opis (pl) | Opis (en) |
|---|---|---|---|
| główna języka | `{siteName}` (bez zmian) | `{n} opisów: rysunek ruchu przy {f}, wskazówki techniki przy {c}, zamienniki przy {z}.` | `{n} entries: movement drawing for {f}, technique cues for {c}, substitutes for {z}.` |
| lista A–Z | `{allExercises}` (bez ogona „— {siteName}”, który powtarzał „ćwiczenia”) | `{n} pozycji od A do Z z filtrem partii mięśniowej, sprzętu i rodzaju ruchu.` | `{n} entries from A to Z, filterable by muscle group, equipment and movement type.` |
| kategoria (partia, sprzęt, rodzaj ruchu) | `{exercisesIn}`; gdy ta sama etykieta jest w dwóch rodzajach („inne” jako partia i sprzęt): `{filtr}: {etykieta}` | `{n} pozycji, w tym {3 nazwy A–Z bez słów tytułu}.`; za mało nazw → `{n} pozycji z rysunkiem ruchu przy {f} i wskazówkami techniki przy {c}.` | analogicznie |
Liczby z eksportu (dziś: n 708, f 528, c 567, z 609). Formy liczby mnogiej przez `Intl.PluralRules` (jak `countLine`).
**Znalezisko (stan obecny):** dzisiejszy opis strony głównej i listy — `countLine` „708 ćwiczeń z opisem techniki, mięśniami i zamiennikami.” — twierdzi coś, czego dane nie potwierdzają: wskazówki techniki ma 567 z 708, zamienniki 609 z 708. Nowy opis podaje liczby. Dziś też dwie strony mają ten sam tytuł „Ćwiczenia: inne — Biblioteka ćwiczeń” (partia i sprzęt) — nowy szablon je rozróżnia.

## 4. Wzorce: 5 ćwiczeń o różnym profilu danych (pl, en)

Tabela generowana przez `npm run szablony` (test pilnuje, że jest aktualna). W nawiasach liczba znaków.

| Ćwiczenie (profil) | Język | Tytuł (znaki) | Opis (znaki) | Krótka odpowiedź | Nagłówki-pytania | Powtórzenia tytuł↔opis |
|---|---|---|---|---|---|---|
| `bench-press` — wskazówki pełne (ustawienie, ruch, wskazówki, błędy), rysunek, role mięśni | pl | Bench Press — Wyciskanie leżąc (30) | Opuść sztangę kontrolowanie do klatki, potem wypchnij ją w górę do wyprostu rąk. Mięśnie główne: klatka. (104) | Opuść sztangę kontrolowanie do klatki, potem wypchnij ją w górę do wyprostu rąk. Mięśnie główne: klatka. | Jak się ustawić? · Jak wykonać ruch? · Które mięśnie pracują? · Co pomaga w technice? · Jakich błędów unikać? · Jaki sprzęt jest potrzebny? · Czym można je zastąpić? | brak |
|  | en | Bench Press (11) | Main muscles: chest. Equipment needed: barbell, flat bench, rack / stands or bench with uprights. Secondary muscles: triceps, front delts. (138) | Lower the bar under control to your chest, then press it up until your arms are straight. Main muscles: chest. | How do you set up? · How do you perform the movement? · Which muscles does it work? · What helps your technique? · Which mistakes should you avoid? · What equipment do you need? · What can you do instead? | bench (wyjątek: requires) |
| `nordic-curl` — własne wskazówki bez rysunku; sprzęt jako alternatywa 4 pozycji | pl | Nordic Curl — Uginanie i prostowanie nóg (40) | Pochylaj się w przód jak najwolniej, hamując ruch tyłem ud. Mięśnie główne: dwugłowe. Biodra wyprostowane — tułów i uda w jednej linii, bez zginania w biodrach. (160) | Pochylaj się w przód jak najwolniej, hamując ruch tyłem ud. Mięśnie główne: dwugłowe. | Jak się ustawić? · Jak wykonać ruch? · Które mięśnie pracują? · Co pomaga w technice? · Jaki sprzęt jest potrzebny? · Czym można je zastąpić? | brak |
|  | en | Nordic Curl — Leg curls and extensions (38) | Lean forward as slowly as you can, resisting with the back of your thighs. Main muscles: hamstrings. (100) | Lean forward as slowly as you can, resisting with the back of your thighs. Main muscles: hamstrings. | How do you set up? · How do you perform the movement? · Which muscles does it work? · What helps your technique? · What equipment do you need? · What can you do instead? | brak |
| `deadlift` — jeden sprzęt | pl | Deadlift — Martwe ciągi i skłony (32) | Potrzebny sprzęt: sztanga. Stopy pod sztangą, mniej więcej na szerokość bioder do barków; sztanga tuż przy piszczelach, nad środkiem stopy. (139) | Podnoś, prostując jednocześnie biodra i kolana; na górze stań prosto, z biodrami w przód. Mięśnie główne: dwugłowe, pośladki. | Jak się ustawić? · Jak wykonać ruch? · Które mięśnie pracują? · Co pomaga w technice? · Jakich błędów unikać? · Jaki sprzęt jest potrzebny? · Czym można je zastąpić? | brak |
|  | en | Deadlift (8) | Main muscles: hamstrings, glutes. Equipment needed: barbell. Feet under the bar, about hip- to shoulder-width apart; the bar close to your shins, over mid-foot. (160) | Lift by straightening your hips and knees together; finish standing tall with your hips through. Main muscles: hamstrings, glutes. | How do you set up? · How do you perform the movement? · Which muscles does it work? · What helps your technique? · Which mistakes should you avoid? · What equipment do you need? · What can you do instead? | brak |
| `seated-barbell-military-press` — kilka sprzętów (3 grupy), bez sekcji wskazówek | pl | Seated Barbell Military Press — Wyciskanie nad głowę (52) | Mięśnie główne: barki — przód. Potrzebny sprzęt: sztanga, klatka / stojaki, ławka płaska albo ławka skośna albo skrzynia / stopień. (131) | Wypchnij ciężar nad głowę do wyprostu rąk; opuść go z powrotem do barków. Mięśnie główne: barki — przód. | Jak się ustawić? · Jak wykonać ruch? · Które mięśnie pracują? · Jakich błędów unikać? · Jaki sprzęt jest potrzebny? · Czym można je zastąpić? | brak |
|  | en | Seated Barbell Military Press (29) | Main muscles: front delts. Grip a little wider than your shoulders; bar in front of your shoulders. Elbows flaring out to the sides instead of pointing forward. (160) | Press the weight overhead until your arms are straight; lower it back to your shoulders. Main muscles: front delts. | How do you set up? · How do you perform the movement? · Which muscles does it work? · Which mistakes should you avoid? · What equipment do you need? · What can you do instead? | brak |
| `zercher-squat` — rzadka odmiana (niche), tylko wskazówki ogólne wzorca ruchu — noindex | pl | Zercher Squat — Przysiady (25) | Mięśnie główne: czworogłowe. Potrzebny sprzęt: sztanga, klatka / stojaki. Mięśnie pomocnicze: pośladki, brzuch. (111) | Mięśnie główne: czworogłowe. Potrzebny sprzęt: sztanga, klatka / stojaki. | Które mięśnie pracują? · Co pomaga w technice? · Jakich błędów unikać? · Jaki sprzęt jest potrzebny? · Czym można je zastąpić? | brak |
|  | en | Zercher Squat (13) | Main muscles: quads. Equipment needed: barbell, rack / stands. Secondary muscles: glutes, abs. (94) | Main muscles: quads. Equipment needed: barbell, rack / stands. | Which muscles does it work? · What helps your technique? · Which mistakes should you avoid? · What equipment do you need? · What can you do instead? | brak |

Sprawdzenie (test `tests/szablony.test.mjs`, wszystkie 708 ćwiczeń × 2 języki): tytuły niepuste, ≤ 60, unikalne; opisy ≤ 160; opisy stron indeksowanych ≥ 50 albo dane wyczerpane, unikalne poza bliźniakami o identycznych danych; powtórzenia słów tytuł↔opis tylko w zdaniach z pola `wyjatek`; wskazówki w opisie i odpowiedzi dosłownie z eksportu i tylko przy własnych wskazówkach; pytania tylko przy sekcjach z treścią; strony główne, listy i kategorie: unikalne, 50–160, bez powtórzeń.

## 5. Decyzje do weta (analogia)

| # | Decyzja | Odrzucone | Powód |
|---|---|---|---|
| SZ-1 | Granice: tytuł ≤ 60, opis 50–160, odpowiedź ≤ 320 znaków | brak granic (źródła ich nie podają); 70/155 | źródła mówią tylko o obcinaniu do szerokości urządzenia; zdanie wypada w całości zamiast ucinania |
| SZ-2 | Bez nazwy witryny w tytule strony ćwiczenia i listy | ogon „— {siteName}” (dziś) | Z-06 A6/A10; Google pomija powtórzoną nazwę witryny |
| SZ-3 | Dopisek w języku strony (rodzina ruchu / mięśnie) do czasu nazw lokalnych | sama angielska nazwa na stronie pl | Google: tytuł w języku treści strony |
| SZ-4 | Unikalność opisu wygrywa z zakazem powtórzeń (wyjątek: pl 6, en 38 stron) | ścisły zakaz → pl 15 i en 22 grupy identycznych opisów | unikalność ma źródło (Google, snippet), zakaz — tylko zasadę planu |
| SZ-5 | Krótsze opisy, gdy dane się wyczerpały (en 9 stron indeksowanych < 50 znaków) | dopisywanie zdań spoza danych | plan: tylko dane |
| SZ-6 | Nagłówki-pytania bez nazwy ćwiczenia; bez `FAQPage`/`HowTo` | „Jak wykonać {nazwa}?” w każdym nagłówku | powtarzanie nazwy = upychanie słów; Z-06 B2 |

## 6. Otwarte
- **Bliźniaki w danych aplikacji:** `seated-cable-row` i `seated-dual-cable-row` mają identyczne mięśnie, sprzęt i wskazówki (pl i en) — różnią się tylko nazwą, więc opis jest wspólny. Do zgłoszenia roli treści aplikacji (poza zakresem strony).
- Teksty stałe `src/szablony/*.json` — do tłumaczenia w Z-26; w językach bez form liczby mnogiej (ja, ko, zh-Hant, vi, id, ms) forma `other`.
