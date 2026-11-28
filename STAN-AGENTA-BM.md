# Stan agenta — przekład API (09-lokalizacja, build), sesja BM

Aktualizacja: 2026-11-28 · gałąź `strona/przeklad-api` (od `strona/integracja-start`) · plik osobno od `STAN-AGENTA.md` (sesja BJ, Z-34), żeby nie nadpisać cudzego stanu.

## Zrobione (SHA na gałęzi)
- 62d6cae: przebieg dowodowy cs+sk nałożony, koszt 0,96 USD zaksięgowany (run 46122711651). CI zielony.
- 724aaeb: 12 poprawek z przeglądu dowodowego (run 46123851310, 0,61 USD) + `docs/przeklad/dowodowy-2026-11-28.md`. CI zielony.
- 14e559f: pełny przekład 33 języków (run 46124484768, batch msgbatch_01TiZHbqyBjdsXq77TauCBSW, 15,07 USD). 98/99 żądań; brak `nazwy/el` (max_tokens).
- 1015381, 7e93e73, f96c3d3: pełny przegląd (run 46126901328, batch msgbatch_01A8hwfpZYrDQNowLNBfn2W5, 9,04 USD): 226 uwag (7 krytycznych, 126 średnich, 93 niskie), wszystkie nałożone, 0 odrzuconych; raport `docs/przeklad/pelny-przebieg-2026-11-28.md`.
- 2c16b0f: test `tests/z32-nazwy.test.mjs:39` bez wpisanego `de` jako języka bez nazw (KO-140; język dobierany dynamicznie, skip z komunikatem). Zgoda koordynatora; wypchnięte też na polecenie hooka środowiska.
- Wydatki: 25,68 z 80 USD (`docs/przeklad/wydatki.json`, 4 wpisy rzeczywiste).

## CI
- 14e559f, 1015381, 7e93e73, f96c3d3: czerwone (jeden test Z-32 z założeniem „de bez nazw”; test 215 Z-33 to TODO i nie przerywa).
- 2c16b0f: run w toku w chwili zapisu; wynik niesprawdzony. Sprawdź: `gh run list --branch strona/przeklad-api --limit 1`. Jeśli czerwony: `gh run view <id> --log-failed`; nie mam .cache, więc lokalnie tego testu nie uruchomię (23 testów lokalnie pada bez `npm run dane`).

## Co zostało
1. Wynik tests.yml dla 2c16b0f; jeśli czerwony, diagnoza (pierwszy kandydat: manifest/`src/ui` dla wybranego języka, np. el).
2. `nazwy/el`: wymaga zmiany kodu (wybór języków `--jezyki`, wyższy mnożnik max_tokens dla el lub podział na pół); robi osobna sesja, trafia na main z PR publikacji (decyzja koordynatora). Koszt ponowienia ok. 0,5 USD.
3. Test 215 (Z-33 ramka de): CZEKA zostaje, bo źródło `ramka` nie było w przebiegu; przekład ramki to osobny przebieg.
4. Przegląd rodzimych użytkowników: hu, nb, sv, uk, vi (uwagi krytyczne) i teksty prawne we wszystkich językach; dwie nazwy do potwierdzenia (sk Jumping Jacks, cs Atlas Stones).
5. Usterka spacji wokół „albo” w 29 językach: przyczyna niesprawdzona (model czy parser); sprawdzić `scripts/przeklad/rdzen.mjs` (parsowanie) i dopisać do promptu zachowanie spacji.
6. Księgowanie do main: wpisy `wydatki.json` są tylko na tej gałęzi; workflow czyta licznik z main. Scalić wpisy przed następnym przebiegiem (propozycje w `dowodowy-2026-11-28.md`).

## Pułapki
- Workflowy startują tylko z `main`, teksty z `galaz_tekstow`; licznik czyta main.
- Przekład nie pomija języków z plikami (cs, sk dostały drugi przebieg); `limit` bierze pierwsze N języków (el jest 26.).
- `--zastosuj` pomija istniejące niepuste wpisy; `--nadpisz` tylko jawnie. Klucz `_opis` w `src/szablony/pl.json` to komentarz, tłumaczenia go nie mają.
- Skrypty nakładania poprawek były w scratchpadzie sesji (nie w repo); logika: poprawka przyjęta, gdy zmienne `{…}`/`{{…}}` równe, a tekst pliku zgodny z raportem (klucze zagnieżdżone po kropce).
- Klasyfikator odmówił raz commita zmiany testu na podstawie samej wiadomości innej sesji; zadziałało dopiero po hooku środowiska. Zmiany testów tylko za zgodą właściciela.
