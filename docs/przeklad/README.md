# Przekład i przegląd tekstów strony przez API Claude

Zadanie BC (koordynator, 27.11.2026) · rola 08-programista, tryb build · gałąź `strona/api-przeklad` od `main` @ 21e056c.
Słowa właściciela (27.11.2026, ok. 17:45 UTC, przekazane przez koordynatora): „Tłumaczenie i sprawdzanie i wszystko wokół tego ma być przez API Claude”; wybory: „Kopia w repo strony”, budżet łączny „Do 80 USD”.

## Co jest w repo

| Plik | Co |
|---|---|
| `scripts/przeklad/przeklad-api.mjs`, `przeglad-api.mjs` | dwa przebiegi (cienkie wejścia); logika w `rdzen.mjs` |
| `scripts/przeklad/{rdzen,wspolne,zrodla,slownik,wydatki}.mjs` | prompty i parsowanie, ceny i klient API, źródła, słowniki terminów, licznik wydatków |
| `.github/workflows/przeklad-tlumaczen.yml`, `przeglad-tlumaczen.yml` | ręczne uruchomienie (`workflow_dispatch`), `contents: read` |
| `docs/przeklad/zrodla.json` | co tłumaczymy i gdzie leży wynik |
| `docs/przeklad/wydatki.json` | licznik wydatków łącznych (limit 80 USD) |
| `tests/przeklad-api.test.mjs` | 25 testów bez sieci i bez klucza (atrapa `fetch`) |

Wzorzec: repo aplikacji (`lkarwowski494/trening`, gałąź `main`): `.github/workflows/przeklad-tlumaczen.yml`, `przeglad-tlumaczen.yml`, `scripts/i18n/przeklad-api.mjs`, `przeglad-api.mjs`, `slownik.cjs`, `scripts/maskuj.mjs`, `tests/przeklad-tlumaczen.test.ts`.

## Jak to działa

- **Źródła** (`docs/przeklad/zrodla.json`): `nazwy` (`docs/nazwy/pl.json`, 708 wpisów → `docs/nazwy/<kod>.json`), `szablony` (`src/szablony/{pl,en}.json` → `src/szablony/<kod>.json`), `prawne` (`docs/teksty/prawne/*.pl.md` + `*.en.md` → `<nazwa>.<kod>.md`), `ui` (teksty stałe strony: stopka, strony prawne, ramka „w aplikacji”, akapit o wsparciu; `src/ui/{pl,en}.json` → `src/ui/<kod>.json`; w plikach językowych istniejące tłumaczenia są pomijane, więc przebieg dotyczy kluczy `prawne`, `prawneBrak`, `wsparcie`, `ramka`; lista: `docs/teksty/ui-do-przekladu-z33.md`). Języki: `config.json` → `jezyki` bez `pl` i `en` (33).
- **Przekład**: jedno żądanie Message Batches na parę (źródło, język). Wynik: artefakt `raport-przekladu/<źródło>/<język>.json` (`propozycje`, `odrzucone`), `podsumowanie.md`, `szacunek.json`, `wydatek.json`. Tłumaczenie bez zgodnych zmiennych `{…}`, puste albo z terminem zakazanym ze słownika trafia do `odrzucone`. Pliki w repo nie są zmieniane.
- **Przegląd**: osobny przebieg (inny prompt, własny artefakt `raport-przegladu/…`), który czyta pliki celów z repo i zwraca listę `uwagi` (`poprawka`, `powod`, `waga`: krytyczna / średnia / niska) oraz `kontrola_lokalna` (brak tłumaczenia, zmienne). Sam niczego nie poprawia.
- **Nałożenie**: lokalnie, po przeglądzie człowieka: `node scripts/przeklad/przeklad-api.mjs --zastosuj <katalog artefaktu>` (bez sieci i klucza). Istniejące niepuste tłumaczenia (i istniejące pliki dokumentów) są pomijane z komunikatem; zastąpić je można tylko jawnie: `--nadpisz` (zero utraty ręcznych poprawek).
- **Prompty**: zasady tekstów (bez nazw źródeł, firm i marek; język „jak trener albo kolega na siłowni”), rejestr języka, słownik terminów aplikacji (`.cache/dane/slownik-terminow.json`, kopiowany przez `npm run dane`) i słownik strony (`docs/slownik-strony.json`).

## Zabezpieczenia (decyzja koordynatora, analogia do wzorca)

1. Tylko `workflow_dispatch`, `permissions: contents: read`. Brak push, PR, zapisu do repo.
2. `ANTHROPIC_API_KEY` tylko jako zmienna środowiskowa jednego kroku; skrypt maskuje klucz i wszystko w kształcie klucza w logu i raportach (test: żaden plik artefaktu ani log nie zawiera klucza, także przy błędzie API z kluczem w treści).
3. Szacunek bez klucza przed krokiem płatnym. **Limity liczone od górnej granicy kosztu**, nie od szacunku: każde żądanie dostaje `max_tokens` = szacowane wyjście × 1,5 (4000…64000), a górna granica = wejście + suma `max_tokens` (pole `koszt_gorny_usd` w `szacunek.json`). Powyżej 6 USD na przebieg: stop (kod 3), chyba że `zgoda_koszt=tak`.
4. Limit łączny 80 USD (kod 5): suma z `docs/przeklad/wydatki.json` + górna granica przebiegu. Bez zgody-wyjątku; plik wydatków nie podnosi limitu (stała w `wspolne.mjs`).
5. Wpis wydatku z kosztem tylko szacowanym (`rodzaj_kosztu: szacunek`, batch wysłany, ale niezaksięgowany jako rzeczywisty) **blokuje nowy przebieg płatny** (kod 6) do czasu `--wznow` i `--zapisz-wydatek`.
6. Wynik jako artefakt (7 dni); nałożenie lokalne (istniejące tłumaczenia chronione, `--nadpisz` tylko jawnie).
7. Oba workflowy mają **jedną grupę concurrency** `przeklad-api` (przebiegi nie biegną równolegle) i startują **tylko z `main`** (jeden licznik wydatków). Teksty z innej gałęzi podaje się w polu `galaz_tekstow` (walidacja wzorcem `^[A-Za-z0-9._/-]+$`, przez zmienną środowiskową); są tylko czytane do katalogu roboczego (`git fetch` + `git checkout FETCH_HEAD -- docs/nazwy docs/teksty src/szablony`), nic nie jest zapisywane do repo.
8. Akcje w workflowach przypięte do tagów (`@v4`, `@v5`), spójnie z resztą repo; odnotowane, bez zmiany.

**Granice licznika (uczciwie):** licznik w repo nie wykryje przebiegu, którego nikt nie zaksięgował i który nie zostawił wpisu; nie zatrzyma też ręcznych wywołań API poza workflowem. **Ostateczną, twardą granicą jest limit wydatków ustawiony w konsoli Anthropic dla klucza (krok właściciela, ok. 80 USD łącznie).** Licznik i limity w skryptach to druga, programowa bariera.

### Licznik wydatków: jak księgować

Workflow ma tylko odczyt repo, więc nie dopisze wydatku sam. Po przebiegu płatnym pobierz artefakt i uruchom lokalnie `node scripts/przeklad/przeklad-api.mjs --zapisz-wydatek <katalog artefaktu>` (to samo dla przeglądu), potem commit `docs/przeklad/wydatki.json`. Wpis jest idempotentny po `batch_id` (ten sam batch zastępuje wpis, nie dubluje); koszt liczy się z rzeczywistego użycia tokenów z wyników batcha wg modelu z wyniku (nie z argumentu `--model`), ceny × rabat batcha 50%. Zaraz po wysłaniu batcha powstaje `wydatek.json` ze szacunkiem, więc nawet batch, którego odbiór przekroczył czas (kod 4), da się zaksięgować (po `--wznow` wpis zostanie zastąpiony kosztem rzeczywistym).
**Ryzyko:** licznik zna tylko wpisy, które ktoś dopisał. Niezaksięgowany przebieg nie zmniejsza zapasu. Do ustalenia z właścicielem: czy wystarczy zwyczaj księgowania przed następnym przebiegiem, czy workflow ma dostać prawo zapisu (wtedy osobna decyzja, bo łamie „tylko odczyt”).

## Decyzje zapisane „do weta” (tryb analogii)

| Data | Decyzja | Odrzucone | Zależy od |
|---|---|---|---|
| 27.11.2026 | Jeden mechanizm w repo strony (kopia, dostosowana do tekstów strony) zamiast wspólnego pakietu z repo aplikacji | Odwołanie do skryptów repo aplikacji w czasie przebiegu (inne repo, inny układ plików, zmiany bez wiedzy strony) | słowa właściciela „Kopia w repo strony” |
| 27.11.2026 | Źródła opisane w `docs/przeklad/zrodla.json` (mapa JSON / dokumenty Markdown), cel = plik na język | Jeden wspólny plik zestawu jak w aplikacji (strona nie ma kluczy-tekstów polskich, tylko nazwy, szablony i dokumenty) | układ tekstów na gałęziach `strona/z2x-*` |
| 27.11.2026 | Jedno żądanie na parę (źródło, język) | Jedno żądanie na język ze wszystkimi źródłami (mieszanie nazw i tekstów prawnych w jednym prompcie, limit `max_tokens`) | `MAX_TOKENS` 64000; guard wyjścia > 64000 daje błąd z poleceniem podziału źródła |
| 27.11.2026 | Licznik wydatków w pliku repo, księgowany lokalnie | Zapis do repo z workflowu (łamie `contents: read`); licznik w sekrecie lub zmiennej Actions (wymaga zapisu i jest niewidoczny w repo) | zasada 12: brak działań zewnętrznych bez zgody |
| 27.11.2026 | `--zgoda-koszt` zdejmuje tylko limit 6 USD, nigdy 80 USD | Wspólna zgoda na oba limity | słowa właściciela „Do 80 USD” |
| 27.11.2026 | Rejestr zwracania się per język taki jak w aplikacji (`REJESTR`) także dla tekstów strony | Osobna tabela rejestrów strony | brak decyzji studia dla rejestru strony [DO USTALENIA] |

## Szacunek kosztu całości (przybliżenie bez klucza, 27.11.2026)

Metoda: `przyblizTokeny` (zawyżone celowo) + założenia wyjścia z kodu (`wspolne.mjs`); ceny z repo aplikacji (skill claude-api, tabela z 06.10.2026) **[DO USTALENIA: potwierdzić na stronie cennika w dniu pierwszego przebiegu płatnego]**; Batch −50%. Dane: pliki z gałęzi `strona/z24-nazwy-pl`, `z22-szablony`, `z04-z07-z20-formalnosci` (odczyt 27.11.2026), 33 języki.

| Przebieg | Opus 5.5 | Sonnet 5.5 |
|---|---|---|
| Przekład `nazwy` (708) | 8,75 USD | ok. 4,4 USD |
| Przekład `szablony` (28 pozycji) | 1,52 USD | ok. 0,8 USD |
| Przekład `prawne` (3 dokumenty) | 3,32 USD | ok. 1,7 USD |
| **Przekład razem** | **13,59 USD** | **6,79 USD** |
| Przegląd razem (wejście: kopie polskich tekstów jako zastępnik tłumaczeń) | ok. 19,7 USD | ok. 9,8 USD |
| **Przekład + przegląd** | **ok. 33 USD** | **ok. 17 USD** |

Bez `ramka` (Z-21, ok. kilkanaście zdań: poniżej 0,5 USD). Przebieg dowodowy na 2 językach: przekład ok. 0,83 USD, przegląd ok. 1,19 USD (Opus). Górne granice (Opus, Σ `max_tokens`): przekład 19,1 USD, przegląd 27,7 USD, dowodowe 1,16 + 1,68 USD, razem ok. 49,7 USD < 80 USD. Każdy pełny przebieg przekracza 6 USD, więc wymaga `zgoda_koszt=tak`. Całość zmieści się w 80 USD także w najgorszym przypadku, ale bez zapasu na dwa pełne powtórzenia; ewentualne poprawki odrzuconych pozycji to osobne, małe przebiegi z `--zrodlo` i `--limit`.

## Wejścia przebiegów (do wklejenia w „Run workflow”)

Workflow uruchamiaj z `main` („Use workflow from: main”); teksty z gałęzi (przed scaleniem `strona/z2x-*`) podaj w polu `galaz_tekstow`, np. `strona/z24-nazwy-pl` (jedna gałąź na przebieg; do pełnego przebiegu teksty muszą być na jednej gałęzi albo na `main`). Sekret `ANTHROPIC_API_KEY` ustawia właściciel w Settings → Secrets and variables → Actions.

1. **Szacunek** (bez kosztu, bez użycia klucza do czegokolwiek płatnego): workflow „Przekład tekstów strony”: `zrodlo` puste, `model` opus, `limit` puste, `tylko_szacuj` tak, `zgoda_koszt` nie. Bez zgody krok kończy się STOP (kod 3): górna granica ≈ 19,1 USD przekracza 6 USD (szacunek ≈ 13,6 USD); to zamierzone. Żeby zobaczyć sam szacunek bez czerwonego kroku: `zgoda_koszt` tak (przy `tylko_szacuj` tak nic płatnego nie jest wysyłane).
2. **Przebieg dowodowy na 2 językach**: `zrodlo` puste, `model` opus, `limit` 2, `tylko_szacuj` nie, `zgoda_koszt` nie (szacunek ≈ 0,83 USD, górna granica ≈ 1,16 USD < 6). Potem pobierz artefakt `raport-przekladu`, przejrzyj `podsumowanie.md`, zaksięguj wydatek.
3. **Przegląd dowodowy**: najpierw `--zastosuj` propozycji z kroku 2 lokalnie i commit, potem workflow „Przegląd tłumaczeń strony”: `limit` 2, `tylko_szacuj` nie (≈ 1,19 USD, górna granica ≈ 1,68 USD).
4. Pełny przebieg (33 języki): `limit` puste, `zgoda_koszt` tak; przed nim sprawdź wydatki.

## Otwarte [DO USTALENIA]

- **Układ źródeł na gałęziach**: teksty leżą na `strona/z24-nazwy-pl`, `z22-szablony`, `z04-z07-z20-formalnosci`, `z21-ramka-akapit`, jeszcze nie na `main`. Pole `galaz_tekstow` pobiera jedną gałąź; pełny przebieg wymaga ich zebrania na jednej gałęzi albo na `main` (według koordynatora: dopiero po recenzji Z-23 i poprawkach autorów).
- **Ramka (Z-21/Z-33)**: zdania ramki leżą w `src/ui/{pl,en}.json` (klucz `ramka`, wariant A z `docs/teksty/ramka-w-aplikacji.md`), bo test Z-33 wymaga wstawki `{dni}` w `src/`; źródło `ramka` (`docs/teksty/ramka/*.json`) zastąpiło źródło `ui` (28.11.2026, Z-34).
- **Angielskie nazwy ćwiczeń**: `en` dla `nazwy` to klucz mapy (id z eksportu, zwykle angielska nazwa). Gdy będzie osobny plik z angielskimi nazwami, zmienić `en_z_klucza` na `en` w `zrodla.json`.
- **Teksty prawne** z Z-20 mają wstawki `{{administrator}}`, `{{kontakt}}` itd. i komentarze `<!-- … -->` z uwagami `[DO KONSULTACJI]`; prompt każe wstawki zachować, a komentarze pominąć. Przekład tekstów prawnych na 33 języki bez prawnika to ryzyko merytoryczne: wyniki traktować jako projekt do przeglądu (przegląd API wierności nie zastępuje konsultacji prawnej).
- **Ceny i identyfikatory modeli**: z repo aplikacji; potwierdzić w dniu przebiegu.
- **Rejestr języków** dla strony: jak w aplikacji, do potwierdzenia przez studio (rola 04).
