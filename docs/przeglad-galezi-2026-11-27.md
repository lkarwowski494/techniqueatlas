# Przegląd starych gałęzi strony — Z-01 (27.11.2026)

Zadanie Z-01 z planu startu strony (zatwierdzony przez właściciela 27.11.2026; repo trening, gałąź `koordynacja`, `docs/koordynacja/plan-strony-2026-11-27.md`). Rola: 07-jakosc, tryb audit. Tylko odczyt: **nic nie usunięte, nic nie scalone**. Usuwa gałęzie wyłącznie właściciel.

## Metoda
- Baza: `main` @ `21e056c0` (= oczekiwany HEAD).
- `git ls-remote --heads origin` (27.11.2026): **12 gałęzi poza `main`**.
- Na każdą gałąź: `git fetch --depth=200`, `git merge-base`, `git log main..gałąź`, `git diff main...gałąź`, `git cherry main gałąź` (czy łatka jest już w main pod innym SHA), `git merge-base --is-ancestor gałąź main`.
- Porównanie z danymi wydania: tag aplikacji `v1.1.1-b1042` (`d9382dbe`), na który plan przepina PIN w Z-02 (`repo:plik:linia` = repo trening na tym tagu).

## Wynik zbiorczy

| # | Gałąź | Ostatni commit | Commity poza main | W main? | Rekomendacja dla gałęzi |
|---|---|---|---|---|---|
| 1 | `claude/inspiring-rubin-tzqxk9` | 2026-11-09 `bcbcf5c` | 0 | tak — przodek main (scalona PR #5) | usunąć |
| 2 | `claude/s6-pelna` | 2026-11-02 `26c7b97` | 0 | tak — przodek main | usunąć |
| 3 | `claude/start-w0-pin-s6` | 2026-11-02 `53cc92f` | 0 | tak — przodek main | usunąć |
| 4 | `claude/zakres-strona-e3` | 2026-11-02 `4b7af95` | 0 | tak — przodek main | usunąć |
| 5 | `naprawy/07-jakosc-003-011` | 2026-11-01 `cd5cc33` | 0 | tak — przodek main | usunąć |
| 6 | `s2-s3/pin-jezyki` | 2026-11-01 `5911dca` | 0 | tak — przodek main | usunąć |
| 7 | `seo/infrastruktura-indeksowania` | 2026-11-01 `3069df8` | 0 | tak — przodek main | usunąć |
| 8 | `claude/tender-thompson-445sqk` | 2026-10-27 `94683b2` | 2 | tak — obie łatki w main pod innym SHA (`git cherry`: `-`), potem nadpisane | usunąć |
| 9 | `claude/stan-wskazowka` | 2026-11-02 `435d8ee` | 1 | nie | usunąć (treść nieaktualna) |
| 10 | `filtr-audytu-s6` | 2026-10-27 `4aebdfe` | 1 | nie | usunąć (zastąpiona przez ZM-06) |
| 11 | `claude/amazing-cori-vqo0qi` | 2026-11-02 `d449c1f` | 2 | częściowo (sprzątanie `tmpDist` w innej postaci) | **zachować** do przeniesienia reszty |
| 12 | `figury/petla-jednokierunkowa` | 2026-11-05 `e29555f` | 1 | nie | **zachować** do przeniesienia (potrzebna po Z-02) |

Gałęzie 1–7: każdy commit jest w historii `main` (`git merge-base --is-ancestor` = prawda, `git log main..gałąź` puste) — nie ma czego przenosić.

## Gałęzie z unikalnymi zmianami

### 8. `claude/tender-thompson-445sqk` — w main, usunąć
| Commit | Plik | Istota | W main (dowód) | Rekomendacja |
|---|---|---|---|---|
| `c44f058` | `PIN.json` | PIN → integracja-1-1 `4e5a7f9` | łatka w main jako `fb8d581`; PIN dziś `ab59dd5` (`PIN.json:5`), Z-02 przepina na `d9382dbe` | odrzucić — nieaktualne |
| `c44f058` | `src/pages.mjs`, `tests/build.test.mjs` | role mięśni czytane jako `roles[].region` | łatka w main (`fb8d581`), potem odwrócona: main czyta `r.id` (`src/pages.mjs:176`, `tests/build.test.mjs:156`) zgodnie z kontraktem eksportu `{id, text}` (trening `scripts/strona/kontrakt.json:2,22`; `scripts/strona/eksport.mjs:162`) | odrzucić — `region` łamie kontrakt 1.1.1 |
| `94683b2` | `src/pages.mjs`, testy | ikona `data:,` (bez 404 `/favicon.ico`) | `67199b5`; `src/pages.mjs:23`, `tests/build.test.mjs:192` | odrzucić — już jest; ikonę docelową robi Z-12 |

### 9. `claude/stan-wskazowka` — usunąć
| Commit | Plik | Istota | W main | Rekomendacja |
|---|---|---|---|---|
| `435d8ee` | `STAN.md` (nowy) | wskazówka, gdzie jest stan pracy (repo trening, gałąź `claude/wizardly-curie-476stg`), skrót stanu 02.11 („F-20 czeka”, „tag 1.1 nie istnieje”) | brak `STAN.md`; stan 02.11 nieaktualny (tag `v1.1.1-b1042` istnieje, F-20 częściowo zrobione wg `docs/54-strona-biblioteki.md:35`) | odrzucić — stan zadań prowadzi `docs/55-plan-startu.md` (Z-00); plik w publicznym repo wskazywałby wewnętrzne gałęzie robocze |

### 10. `filtr-audytu-s6` — usunąć
| Commit | Plik | Istota | W main | Rekomendacja |
|---|---|---|---|---|
| `4aebdfe` | `src/straznicy.mjs`, `src/build.mjs`, `tests/straznicy-startu.test.mjs`, `README.md` | S6 w starej postaci „figura dla 709/709” + automatyczny wyjątek dla rodzin bez zatwierdzonego audytu (`manifest.audit.filter`, `e.audit`), błąd przy wyłączonym filtrze | S6 przepisany (ZM-06, 02.11) na regułę indeksowania `pelna` + własne wskazówki: `src/straznicy.mjs:39-56`, `src/pages.mjs:194-196`; filtr rysunków robi eksport aplikacji (rysunek tylko z rodziny z recenzją, bez `V2_WSTRZYMANE`: trening `scripts/strona/eksport.mjs:76,135-136`); eksport 1.1.1 nie ma pól `audit` (brak trafień `audit` w `scripts/strona/eksport.mjs`) | odrzucić — oparte na wycofanej regule; Z-03 i tak przepisuje S6 wg P-1 |

### 11. `claude/amazing-cori-vqo0qi` — zachować, przenieść część
| Commit | Plik | Istota | W main | Rekomendacja |
|---|---|---|---|---|
| `7a60493` | `tests/pomoc.mjs` | rejestr katalogów `tmpDir()`/`tmpDist()` i usuwanie przy `exit` | **tak, w innej postaci**: `tests/pomoc.mjs:22-23` (`026729a`, 09.11; trening `docs/40-lekcje.md:151`, ZB-050) | odrzucić tę część — dubel |
| `7a60493` | `tests/pomoc.mjs` | sprzątanie także przy SIGINT/SIGTERM | nie (main: tylko `process.on('exit')`, `tests/pomoc.mjs:22`) | przenieść |
| `7a60493` | `tests/uruchom-testy.mjs` (nowy), `package.json` | `npm test` w świeżym `TMPDIR`; błąd, gdy zostanie `atlas-*`; katalog zawsze usuwany | nie (`package.json:11` = `node --test`) | przenieść — to „test-strażnik sprzątania” z decyzji ZB-050 wariant A (trening `docs/18-przekazanie.md:321`, zatwierdzona 09.11: `:324`), w main niewdrożony |
| `7a60493` | `tests/sprzatanie.test.mjs` (nowy) | test strażnika | nie | przenieść |
| `7a60493` | `tests/przypnij.test.mjs` | `atlas-pin-*` przez `tmpDir` | nie — main nadal `mkdtempSync` bez sprzątania (`tests/przypnij.test.mjs:22`) | przenieść |
| `d449c1f` | `docs/54-strona-biblioteki.md`, `README.md` | zapis „decyzja właściciela 02.11.2026: katalogi tymczasowe — wariant A” | brak w main docs/54 | przenieść jako opis; źródło decyzji podać jako ZB-050 (docs/18 trening `:321`, `:324`) — wpisu z 02.11 nie znalazłem w docs/18 [DO USTALENIA: czy była osobna decyzja 02.11] |

Zadanie docelowe: **brak w planie** (luka, nie kolizja). Rekomendacja: dopisać małe zadanie etapu 0 (np. Z-09 | 08-programista (build) | sonnet/medium | 0,5 h | po — | `npm test` kończy się błędem przy pozostawionym `atlas-*`), przed Z-02/Z-03, bo każdy pełny build to ok. 372 MB (plan, „Stan zmierzony”), a sesje Z-02/Z-03/Z-31 wielokrotnie uruchamiają `npm test`. Przeniesienie = przeniesienie na obecne `tests/pomoc.mjs` (konflikt z `026729a`), nie scalenie gałęzi.

### 12. `figury/petla-jednokierunkowa` — zachować, przenieść (krytyczne dla Z-02)
| Commit | Plik | Istota | W main | Rekomendacja |
|---|---|---|---|---|
| `e29555f` | `assets/figura-czas.js` (nowy), `assets/figura-strona.js` | tryb pętli `loop: 'jednokierunkowa'` → `oneWayAt` silnika aplikacji zamiast wahadła `uAt` | nie (brak `oneWay`/`loop` w `src`, `assets`, `tests` main) | przenieść |
| `e29555f` | `src/pages.mjs` | `figureModule` przekazuje `loop`; fazy `untimed` bez sekund | nie (`src/pages.mjs` main liczy sekundy dla każdej fazy poza „Pauza”) | przenieść |
| `e29555f` | `tests/petla-jednokierunkowa.test.mjs` | testy trybu | nie | przenieść |

Dlaczego krytyczne: eksport tagu 1.1.1 wysyła `loop` i `untimed` (trening `scripts/strona/eksport.mjs:84,88,138`), silnik dla przeglądarki eksportuje `oneWayAt` (`scripts/strona/figura.entry.js:7-10`), a wymaganie **BR-BIB-007** (trening `docs/brd/wymagania.md:715-723`) mówi wprost o rysunku „w aplikacji albo na stronie”: skok i rzut raz, bez cofania, faza bez sekund; wahadło balistyczne (kb_ballistic) bez sekund. Po Z-02 (PIN → 1.1.1) obecny main animowałby skoki i rzuty wahadłem (skok wstecz) i pokazywał sekundy przy fazach `untimed` — błąd widoczny na stronach z rysunkiem.

Braki gałęzi względem 1.1.1 (do zrobienia przy przeniesieniu):
- czas przebiegu per ćwiczenie: aplikacja używa `oneWayAt(ms, oneWayRepMs(spec.key))` (trening `components/ExerciseFigureV2.tsx:92`; `ONE_WAY_REP_MS` = Alternating Deltoid Raise 6000 ms, `lib/figures/v2/anim.ts:22`) — gałąź używa domyślnego 1500 ms;
- tryb `cykl_lustro` (marsz: carry, sled_throw, strongman; `lib/figures/v2/figure.ts:142`, `cycleAt` w `ExerciseFigureV2.tsx:92`) — gałąź go nie obsługuje, a `figura.entry.js:10` 1.1.1 nie eksportuje `cycleAt` ani `oneWayRepMs` [DO USTALENIA na `npm run dane` z PIN 1.1.1: ile ćwiczeń strony ma `loop` = `cykl_lustro` / `jednokierunkowa` i czy przeglądarka da się odtworzyć bez zmiany eksportu aplikacji — „nowego wydania aplikacji przed startem” plan nie robi].

Zadanie docelowe: **Z-02** (to samo przepięcie PIN; „gotowe, gdy” rozszerzyć o tryby pętli) albo osobne Z-02a tuż po Z-02, przed Z-31. Rekomendacja: Z-02a | 08-programista (build) | sonnet/medium | 1–1,5 h | po Z-02.

## 3b) Kolizje z planem (P-11 „nie robić dwa razy”)

| Gałąź / zmiana | Zadanie planu | Kolizja |
|---|---|---|
| `figury/petla-jednokierunkowa` | Z-02 (PIN 1.1.1), Z-31 (wygląd, `assets/`) | **tak** — gotowa praca nad animacją wg trybu pętli; bez przeniesienia Z-02/Z-31 zrobi to od nowa albo przeoczy (plan jej nie wymienia). Przenieść, nie pisać ponownie |
| `claude/amazing-cori-vqo0qi` (strażnik `npm test`) | żadne (najbliżej Z-00/Z-30) | luka — zrealizowana decyzja ZB-050 bez wdrożenia w main; przenieść jako małe zadanie |
| `filtr-audytu-s6` | Z-03 (S6 wg P-1) | brak — gałąź oparta na wycofanej regule; Z-03 jej nie używa |
| `claude/tender-thompson-445sqk` (ikona) | Z-12 (ikona) | brak — `data:,` już w main, Z-12 robi ikonę docelową |
| `claude/stan-wskazowka` | Z-00 (`docs/55-plan-startu.md`) | brak — Z-00 zastępuje |
| gałęzie 1–7 | — | brak — w main |

## Decyzje do weta (tryb „analogia”, 27.11.2026)
1. Gałęzie 1–10: rekomendacja „usunąć” (usuwa właściciel). Analogia: plan „JUŻ ZROBIONE, NIE ZLECAĆ PONOWNIE” + zasada zamknięcia PR/usunięcia gałęzi w CLAUDE.md repo trening.
2. `figury/petla-jednokierunkowa` → Z-02/Z-02a, z dopełnieniem `oneWayRepMs` i `cykl_lustro`. Analogia: BR-BIB-007 (trening `docs/brd/wymagania.md:715`) i P-9 „nie ma miejsca na błąd”.
3. `claude/amazing-cori-vqo0qi` → nowe małe zadanie etapu 0. Analogia: ZB-050 wariant A (trening `docs/18-przekazanie.md:321`, zatwierdzone `:324`).

## Komendy (każda osobno, 27.11.2026)
| Komenda | Kod wyjścia | Wynik |
|---|---|---|
| `git rev-parse HEAD` (start) | 0 | `21e056c0` = oczekiwany; `git status --porcelain` pusty |
| `git ls-remote --heads origin` | 0 | 13 wpisów = `main` + 12 gałęzi |
| `git fetch origin --depth=200 <12 gałęzi> main` | 0 | historia wystarczyła do `git merge-base` dla 12/12 |
| `git log`/`git diff`/`git cherry`/`git merge-base --is-ancestor` × 12 | 0 | tabela „Wynik zbiorczy” |
| `git clone --depth 1 --branch v1.1.1-b1042 …/trening` | 0 | HEAD `d9382dbe` |
| `npm ci` | 0 | — |
| `npm run dane` | 0 | dane 1.0.1 @ `ab59dd5` (PIN main) |
| `node --test tests/straznik-sekrety.test.mjs tests/straznik-zrodla.test.mjs tests/straznik-terminy.test.mjs` | 0 | 13/13 (po skróceniu pełnego SHA w raporcie — strażnik sekretów odrzuca 40 znaków szesnastkowych) |

Pełnego `npm test` lokalnie nie uruchamiałem (zmiana to tylko ten plik w `docs/`); wynik pełnego zestawu daje `tests.yml` na końcowym SHA (podany w przekazaniu do koordynatora).

## Uwagi
- Liczba gałęzi: **12** (jak w poleceniu). Moje „13” w pierwszej wiadomości do koordynatora liczyło `main` — błąd, poprawiony tu.
- Rola: prompt 07-jakosc (audit) otrzymany od koordynatora w 3 wiadomościach (`add_repo` biblioteki odrzucone przez uprawnienia sesji). Treść przyszła z encjami HTML (`&lt;`, `&gt;`, `&amp;`), więc suma bajtów/sha256 nie jest porównywalna 1:1 z 76418 B / `869d32a97801149c` [DO USTALENIA]; akapity kompletne (zasady wspólne 1–22, kontrakt roli, JAK-01…19, moduły, szablony). Szablon raportu roli (`audit/07-jakosc-*.md`, werdykt wydania) nie dotyczy Z-01 — polecenie AR.md wyznacza ten plik i zakres; z roli stosuję: dowód `plik:linia`, `[DO USTALENIA]`, tożsamość commitu, komendy z kodami wyjścia, pliki śledzone poza tym raportem nietknięte.
