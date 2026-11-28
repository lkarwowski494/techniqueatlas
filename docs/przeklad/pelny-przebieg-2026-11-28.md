# Pełny przebieg przekładu i przeglądu (33 języki) — 28.11.2026

Sesja BM. Teksty to wynik API (opus, effort medium); sesja niczego nie tłumaczyła ani nie poprawiała od siebie. Ocena jakości przebiegu dowodowego: `dowodowy-2026-11-28.md`.

| | Przekład | Przegląd |
|---|---|---|
| Run | 46124484768 | 46126901328 |
| Batch | msgbatch_01TiZHbqyBjdsXq77TauCBSW | msgbatch_01A8hwfpZYrDQNowLNBfn2W5 |
| Żądań | 99 (98 przyjętych) | 98 |
| Koszt rzeczywisty | 15,07 USD | 9,04 USD |

Wydano łącznie **25,68 z 80 USD** (przebieg dowodowy 1,57 + 15,07 + 9,04). Szacunek rekomendacji: przekład ok. 15,8, przegląd ok. 10,1 USD; rzeczywiste koszty w granicach 5% szacunku.

## Braki

- `nazwy/el`: odpowiedź ucięta (max_tokens 35 900, grecki potrzebuje więcej); brak `docs/nazwy/el.json`. Decyzja koordynatora: na razie bez nazw greckich (strona pokazuje nazwy angielskie). Ponowienie wymaga zmiany kodu (wybór języków, wyższy mnożnik max_tokens dla el), poza zakresem tej sesji.
- Reszta kompletna: 32 języki mają nazwy, szablony i prawne; el ma szablony i prawne.

## Przegląd: uwagi według wagi i języka (226)

Krytyczne 7, średnie 126, niskie 93.

| Język | krytyczne | średnie | niskie | razem |
|---|---|---|---|---|
| hu | 3 | 4 | 0 | 7 |
| uk | 1 | 6 | 2 | 9 |
| vi | 1 | 4 | 3 | 8 |
| nb | 1 | 3 | 4 | 8 |
| sv | 1 | 2 | 2 | 5 |
| bg | 0 | 19 | 0 | 19 |
| hr | 0 | 10 | 6 | 16 |
| et | 0 | 9 | 3 | 12 |
| fr | 0 | 8 | 4 | 12 |
| sl | 0 | 6 | 2 | 8 |
| ko | 0 | 5 | 1 | 6 |
| sr | 0 | 5 | 2 | 7 |
| de | 0 | 4 | 2 | 6 |
| lt | 0 | 4 | 3 | 7 |
| lv | 0 | 4 | 2 | 6 |
| pt-BR | 0 | 4 | 3 | 7 |
| it | 0 | 3 | 3 | 6 |
| ms | 0 | 3 | 2 | 5 |
| nl | 0 | 3 | 4 | 7 |
| ru | 0 | 3 | 3 | 6 |
| cs | 0 | 2 | 2 | 4 |
| da | 0 | 2 | 5 | 7 |
| fi | 0 | 2 | 2 | 4 |
| id | 0 | 2 | 3 | 5 |
| tr | 0 | 2 | 4 | 6 |
| el | 0 | 2 | 0 | 2 |
| es-419 | 0 | 1 | 2 | 3 |
| es | 0 | 1 | 4 | 5 |
| pt | 0 | 1 | 4 | 5 |
| ro | 0 | 1 | 6 | 7 |
| zh-Hant | 0 | 1 | 3 | 4 |
| ja | 0 | 0 | 3 | 3 |
| sk | 0 | 0 | 4 | 4 |

Krytyczne (7), wszystkie przyjęte: hu ×3 (nazwy Triceps Kickback: „hátra döntött törzzsel” czytane jako tułów do tyłu, zamiast pochylenia w przód); nb, sv, vi (regulamin: wzmocnienie gwarancji, odwrócenie sensu „nie wymaga instalacji”, wzmocnienie „bez zbędnej zwłoki”); uk (szablon `albo` bez spacji wokół spójnika). Wzorzec błędu z przebiegu dowodowego (spacje wokół `albo`) powtórzył się w bg i innych; `bg` ma najwięcej uwag (19 średnich).

## Nałożenie

Wszystkie 226 poprawek API naniesiono skryptem, bez zmian własnych; 0 odrzuconych. Warunki: zmienne `{…}` i `{{…}}` w poprawce równe tłumaczeniu, tekst pliku zgodny z raportem (zmiana ręczna lub wcześniejsza = pominięcie), liczby bez zmian (poza dwiema nazwami, sprawdzonymi ręcznie: da „Clock Push-Up”, lt „Supine Figure-Four Stretch”, obie przyjęte). Walidacja: zmienne we wszystkich 129 plikach szablonów i prawnych zgodne (jedyna różnica to klucz `_opis`, komentarz tylko w pl.json), JSON poprawny we wszystkich plikach.

## Ograniczenia (zasada 2)

Przekład i przegląd robi ta sama klasa modeli, więc błędy skorelowane mogą przejść. Przegląd rodzimego użytkownika nie odbył się: nazwy ćwiczeń, szablony i zwłaszcza teksty prawne nie mają przeglądu człowieka ani konsultacji prawnej. Przed publikacją wskazane: rodzimi recenzenci przynajmniej dla języków z krytycznymi uwagami (hu, nb, sv, uk, vi) i dla tekstów prawnych we wszystkich językach.
