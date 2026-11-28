# Ramka „w aplikacji” i akapit o wsparciu (Z-21), pl + en

Stan: gotowe do recenzji (Z-23) · 27.11.2026 · rola 04-studio-projektowe (build, zawężona do brzmienia tekstów; bez etapów projektu wizualnego, które należą do Z-10/Z-12).

Źródło prawdy o funkcjach: kod aplikacji na tagu `v1.1.1-b1042` (repo trening, commit `d9382dbe`), sklonowany 27.11.2026. Dowody w tabelach to `plik:linia` na tym commicie. Etykiety angielskie są z `lib/i18n.en.ts` tego samego tagu, więc ramka używa tych samych nazw co aplikacja.

Decyzje, na których stoją teksty:
- P-2 (plan z 27.11.2026, słowa właściciela): „Ramka od razu, zdania na stronie”; „Aplikacja ma wszystko. Pozwala zrobic trening, wyrbac cwiczenie itd.”
- P-6 (plan z 27.11.2026): „Tak, razem z ramką (Recommended)” → liczba dni z kodu wydanej wersji.
- Brzmienie akapitu: repo trening `docs/18-przekazanie.md:177` (02.11.2026) — „Strona i narzędzia są bezpłatne. Aplikacja: 5 dni treningowych w miesiącu bez subskrypcji, pełna wersja płatna (subskrypcja albo dostęp dożywotni); to wspiera też rozwój tej strony.” Zakaz „darmowy” przy części płatnej: tamże (art. 7 pkt 20 ustawy o przeciwdziałaniu nieuczciwym praktykom rynkowym, wg docs/18); `docs/54-strona-biblioteki.md:32` (F-12).
- Zdania tylko o funkcjach wydanej wersji: `docs/54-strona-biblioteki.md:338-339` (pkt 9).

Zasady brzmienia: zwykły język, bez superlatyw i wykrzykników, bez obietnic, których kod nie spełnia, bez nazw innych firm i bez nazwy aplikacji (nazwę i plakietkę dokłada komponent). Każde zdanie ramki musi być prawdziwe dla każdego ćwiczenia, bo ramka stoi na każdej stronie ćwiczenia. Dlatego nie ma w niej rysunku ruchu, który ma tylko część ćwiczeń (`components/ExerciseCues.tsx:45`).

## 1. Ramka „w aplikacji”

### Wariant A — 8 zdań (rekomendowany)

| # | pl | en | Dowód (tag 1.1.1) |
|---|---|---|---|
| A1 | W aplikacji dodasz to ćwiczenie do treningu albo do własnego szablonu. | In the app, you can add this exercise to a workout or to your own template. | `app/picker.tsx:20` (cele „dodaj do treningu”, „dodaj do szablonu”), `app/picker.tsx:56` (`addExerciseToActive`), `components/ActiveWorkout.tsx:194` („+ Dodaj ćwiczenie”) |
| A2 | W czasie treningu zapisujesz każdą serię, a obok widzisz wynik z poprzedniego razu. | During a workout, you log each set and see your previous result next to it. | `components/WorkoutBlocks.tsx:165` i `:199` (kolumna i podpis „Poprzednio” / „Previous”, `lib/i18n.en.ts:106`), `components/ActiveWorkout.tsx:40` |
| A3 | Po odhaczeniu serii zaczyna się odliczanie przerwy. | When you tick off a set, the rest timer starts. | `lib/setFlow.ts:17` („Odhaczenie serii: startuje przerwę”), `lib/setFlow.ts:26` |
| A4 | Gdy nie masz sprzętu albo jest zajęty, aplikacja podsuwa zamienniki, także ten sam ruch na innym przyrządzie. | If you don't have the equipment or it's taken, the app suggests alternatives, including the same movement with different equipment. | `app/swap.tsx:21` (trening w toku: „Propozycje”, „Ten sam ruch, inny przyrząd”), `app/swap.tsx:73`, `:77`; `lib/swap.ts:15` (`SWAP_TOP = 3`); en: „Suggestions” `lib/i18n.en.ts:258` |
| A5 | Po wybraniu miejsca treningu lista pokazuje ćwiczenia, które da się tam zrobić. | Once you choose where you train, the list shows the exercises you can do there. | `app/picker.tsx:79` („tylko dostępne w: {l}” / wyszarzone niedostępne), `app/adapt.tsx:18` („Dostosuj do miejsca”) |
| A6 | Na ekranie ćwiczenia widzisz swoje ostatnie treningi z nim, a w „Postępach” wykres i rekordy. | The exercise screen lists your recent sessions with it, and Progress shows a chart and your records. | `app/exercise/[id].tsx:91-95` („Ostatnie treningi”, przycisk „Postępy”), `components/ExerciseProgress.tsx:12` (wykres i rekordy jednego ćwiczenia); en: „Progress” `lib/i18n.en.ts:10` |
| A7 | Z szablonów ułożysz plan tygodnia albo wygenerujesz szablony i plan z kilku założeń. | You can build a weekly plan from your templates, or generate templates and a plan from a few choices. | `app/plan.tsx:21` (plan tygodnia: szablon albo „Wolne” na każdy dzień), `app/generator.tsx:27` i `:35` (dwa tryby: „Nowe szablony i plan”, „Plan z moich szablonów”) |
| A8 | Historia, postępy, szablony i kopia zapasowa są dostępne zawsze, także bez płatnej wersji. | Your history, progress, templates and backups are always available, even without the paid version. | `lib/access.ts:259-262` (`ALWAYS_AVAILABLE`: history, progress, templatesAndPlan, library, backup, restoreBackup, exportCsv…), `lib/access.ts:241` (blokowany jest tylko start treningu na żywo ponad limit) |

### Wariant B — 5 zdań (krótszy)

| # | pl | en | Dowód |
|---|---|---|---|
| B1 | W aplikacji dodasz to ćwiczenie do treningu albo do własnego szablonu. | In the app, you can add this exercise to a workout or to your own template. | jak A1 |
| B2 | W czasie treningu zapisujesz każdą serię, widzisz wynik z poprzedniego razu, a po odhaczeniu serii zaczyna się odliczanie przerwy. | During a workout, you log each set, see your previous result, and the rest timer starts when you tick off a set. | jak A2 + A3 |
| B3 | Gdy nie masz sprzętu albo jest zajęty, aplikacja podsuwa zamienniki, także ten sam ruch na innym przyrządzie. | If you don't have the equipment or it's taken, the app suggests alternatives, including the same movement with different equipment. | jak A4 |
| B4 | Na ekranie ćwiczenia widzisz swoje ostatnie treningi z nim, a w „Postępach” wykres i rekordy. | The exercise screen lists your recent sessions with it, and Progress shows a chart and your records. | jak A6 |
| B5 | Z szablonów ułożysz plan tygodnia albo wygenerujesz szablony i plan z kilku założeń. | You can build a weekly plan from your templates, or generate templates and a plan from a few choices. | jak A7 |

### Rekomendacja: wariant A (do weta, 27.11.2026)

- **Za A:** odpowiada wprost na słowa właściciela z P-2 („Aplikacja ma wszystko”): pokazuje cały cykl, od dodania ćwiczenia, przez trening, po postępy i plan. Zdanie A8 uprzedza pytanie „co stracę bez płacenia” i domyka akapit o wsparciu bez wpędzania w poczucie winy (docs/18:175). Mieści się w widełkach 5–8 zdań.
- **Za B:** jest krótszy o ok. 26% (pl: 490 zamiast 666 znaków). Lepiej pasuje, gdyby projekt Z-10/Z-12 dał ramce mało miejsca, na przykład obok rysunku na telefonie.
- **Kompromis:** A to 8 krótkich zdań (po polsku od 7 do 17 słów), więc pełny tekst można zostawić, a na wąskim ekranie zwinąć go pod pierwszymi dwoma zdaniami. To decyzja wyglądu, więc należy do Z-10/Z-12, nie do tego dokumentu.
- **Podstawa (analogia):** P-2 wymaga zdań „co aplikacja pozwala zrobić z tym ćwiczeniem i w treningu”, a P-9 wymaga strony „czystej, czytelnej”. Obu warunków dotrzymują oba warianty, więc wybór jest do weta właściciela przez koordynatora. Bez weta przyjmuję A.

## 2. Akapit o wsparciu

Liczba dni pochodzi z kodu: `lib/access.ts:25` na tagu 1.1.1 → `FREE_TRAINING_DAYS_PER_MONTH: 5`. W szablonie liczba jest zmienną `{dni}`, a nie przepisaną cyfrą (docs/18:175: „liczba z `PAYWALL.FREE_TRAINING_DAYS_PER_MONTH`, nie przepisana”). Plan przewiduje, że strona weźmie ją z `.cache/app` (Z-33).

| # | pl | en | Dowód |
|---|---|---|---|
| W1 | Ta strona jest bezpłatna. | This website is free to use. | strona bez opłat: `docs/54-strona-biblioteki.md:15` („cała strona i narzędzia bezpłatne”) |
| W2 | Aplikacja daje {dni} dni treningowych w miesiącu bez subskrypcji. Pełna wersja jest płatna: subskrypcja albo dostęp dożywotni. | The app gives you {dni} training days a month without a subscription. The full version is paid: a subscription or lifetime access. | `lib/access.ts:25` (`FREE_TRAINING_DAYS_PER_MONTH: 5`), `lib/access.ts:2-3` (decyzja 22.10.2026: Pro — subskrypcja albo dostęp dożywotni zdejmuje limit), `lib/access.ts:42` (`ENTITLEMENT_PLANS = ['monthly', 'yearly', 'lifetime']`) |
| W3 | Jej zakup wspiera też rozwój tej strony. | Buying it also supports this website. | sens z docs/18:177 (deklaracja właściciela, nie funkcja kodu); brzmienie z podmiotem po recenzji Z-23 (06-tresci-010) |

Pełny tekst pl (dla {dni} = 5): „Ta strona jest bezpłatna. Aplikacja daje 5 dni treningowych w miesiącu bez subskrypcji. Pełna wersja jest płatna: subskrypcja albo dostęp dożywotni. Jej zakup wspiera też rozwój tej strony.”

Pełny tekst en (dla {dni} = 5): “This website is free to use. The app gives you 5 training days a month without a subscription. The full version is paid: a subscription or lifetime access. Buying it also supports this website.”

### Odstępstwa od brzmienia z docs/18:177 (do weta, 27.11.2026)

1. **„Strona i narzędzia są bezpłatne” → „Ta strona jest bezpłatna”.** Na starcie strona nie ma narzędzi: fale 1 i 2 przychodzą po starcie (`docs/54-strona-biblioteki.md:105`; plan z 27.11, „Czego nie robimy”: narzędzi strony przed startem; Z-75). Zdanie o narzędziach, których nie ma, łamie zasadę „mówimy tylko o tym, co jest” (docs/54 pkt 9). Słowa „i narzędzia” wracają razem z falą 1. Kontrolę zastępczą przy F-04 opisuje docs/54:339.
2. **Średnik przed „to wspiera” → osobne zdanie; potem pełne zdania z podmiotem.** Po rozdzieleniu „To wspiera…” mogło odnosić się do 5 bezpłatnych dni, a „Aplikacja: …” brzmiało telegraficznie. Recenzja Z-23 (06-tresci-010, opcja a) daje każdemu zdaniu podmiot: „Aplikacja daje…”, „Pełna wersja jest płatna…”, „Jej zakup wspiera…” (en: „Buying it also supports this website.”). Sens bez zmian: wspiera zakup pełnej wersji, jak w docs/18:177. Do weta właściciela (wariant b: brzmienie z docs/18).
3. **Słowo „darmowy” i en „free” przy aplikacji: brak.** Przy części płatnej stoi „bez opłat” / „at no charge” (decyzja 02.11, docs/18:177). En „free to use” dotyczy tylko strony, która jest bezpłatna w całości. Pytanie, czy „at no charge” przy dniach aplikacji jest bezpieczne prawnie po angielsku tak samo jak „bez opłat” po polsku, zostaje dla recenzenta Z-23: `[DO USTALENIA]`.

### Uwaga merytoryczna do „dni treningowych” (bez zmiany brzmienia)

„Dzień treningowy” w kodzie liczy się tylko wtedy, gdy ukończony trening na żywo trwał dłużej niż 7 minut (`lib/access.ts:30-31`, `MIN_LIVE_MINUTES_FOR_DAY = 7`, `lib/access.ts:206`). Drugi trening tego samego dnia nie zużywa limitu (`lib/access.ts:197-198`, `:253`). Akapit mówi „dni treningowych”, więc jest zgodny z kodem: jest raczej hojniejszy, niż obiecuje, a nie odwrotnie. Dopisanie szczegółu (np. „liczą się treningi dłuższe niż 7 minut”) wydłużyłoby stopkę, więc go nie dodaję. Jeśli Z-23 uzna to za potrzebne, należy dopisać to w tym pliku.

## 3. Czego ramka celowo nie mówi

Zostawione poza ramką, bo nie dotyczą każdego ćwiczenia albo nie mam dowodu dla wydania 1.1.1 w sklepie:
- Rysunek ruchu: tylko część ćwiczeń (`components/ExerciseCues.tsx:45`), a strona i tak go pokazuje.
- Zegarek: kod jest w `targets/watch-app`, ale nie sprawdziłem, czy wchodzi w wydanie 1.1.1 → `[DO USTALENIA]`, następne wydanie (Z-74).
- Apple Health, głos, przypomnienia: prawdziwe, ale nie dotyczą „tego ćwiczenia”, a każde wydłuża ramkę ponad 8 zdań.
- Import planu ze strony: dopiero w 1.2 (docs/18:177, ZM-04), więc tu go nie ma.

## 4. Dla następnych kroków

- Z-23 (recenzja): sprawdzić każde `plik:linia` na `d9382dbe` i pytanie `[DO USTALENIA]` z punktu 2.3.
- Z-26 (33 języki): przekład wariantu wybranego po wecie i akapitu. Etykiety „Postępy”, „Poprzednio” i „Propozycje” brać ze słowników aplikacji (`lib/locales/*.json`), żeby strona mówiła językiem aplikacji. Przy części płatnej w żadnym języku nie wolno użyć odpowiednika „darmowy”.
- Z-33 (wdrożenie): `{dni}` z `.cache/app` (`lib/access.ts`); strażnik „zdania ramki sprawdzone dla wersji = wersjaWydania” — ten plik jest sprawdzony dla wersji **1.1.1**.
