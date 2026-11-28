# STAN-AGENTA (sesja BO, 28.11.2026, rola 08-programista build)
Gałąź `strona/przeklad-poprawki`. Koordynator zakończył pracę przed końcem (limit konta); CI nie sprawdzone.

## Zrobione (kod i testy: tests/przeklad-api.test.mjs, 48 testów, wszystkie zielone; nowe 15 były czerwone przed zmianą)
1. `--jezyki` / wejście `jezyki` w obu workflowach (wzorzec w powłoce i w skrypcie, kody z config.json).
2. max_tokens: grecki współczynnik 2,6; podział źródła na części > 16 000 tokenów wyjścia (przegląd 30 000), custom_id `pr-<źródło>-p<N>-<język>`, scalanie raportów; granica kosztu dalej z sumy max_tokens, limity 6/80 USD nietknięte.
3. Spacje: przyczyna = `v.trim()` w parsujOdpowiedz (nie model). `zachowajSpacje` + zdanie w obu promptach + poprawki przeglądu.
4. Istniejące tłumaczenia pomijane (tylko brakujące pozycje), `--nadpisz` / wejście `nadpisz` (tylko przekład).
5. Licznik z gałęzi tekstów: `--wydatki-galaz`, scalanie po batch_id, nigdy nie obniża sumy, limit tylko ze stałej.
Opis: docs/przeklad/README.md (sekcja „Zmiany 28.11.2026”).

## Wynik testów
- tests/przeklad-api.test.mjs: 48/48 zielone.
- Cały `npm test` na czystym main (przed zmianami): 118 pass, 3 fail: build.test, jezyki-podglad.test, straznicy-startu.test (niezwiązane z przekładem; przyczyna niezbadana). Pełnego zestawu po zmianach nie dokończono (przerwany).

## Zostało / następny krok
- Sprawdzić tests.yml na gałęzi po pushu; ustalić, czy 3 testy wyżej padają też w CI na main.
- Brak pomiaru rzeczywistego zapotrzebowania greki: współczynnik 2,6 i podział to hipoteza [DO USTALENIA po przebiegu el].
- PR do main otwiera koordynator; płatnych przebiegów nie uruchamiano.

## Pułapki
- `--wznow` wymaga tego samego stanu plików celów co przy wysłaniu (podział i pomijanie od nich zależą).
- Przekład domyślnie pomija istniejące: stary `el` ma szablony i prawne, brak `nazwy/el`, więc ponowienie jest tylko dla nazw.
- Ponowienie nazw el: workflow przekładu z main, `galaz_tekstow`=gałąź z tekstami, `zrodlo`=nazwy, `jezyki`=el, najpierw `tylko_szacuj`=tak (ok. 0,5 USD).
