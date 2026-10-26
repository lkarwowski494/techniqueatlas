# Wyniki pomiarów renderowania figury (26.10.2026, spike)

Środowisko: Chromium bez interfejsu (Playwright), rysowanie programowe, widok 390×844 @2×, 10 s na przypadek; „4×” = procesor spowolniony czterokrotnie (symulacja telefonu).
To NIE jest test na telefonie — pokazuje stosunek obu opcji i zapas względem budżetu klatki (16,7 ms przy 60 Hz). Surowe dane: `wyniki-2026-10-26.json`.
Metoda: dla każdego przypadku strona w danym trybie ładowana w Chromium (Playwright), 10 s zbierania odstępów `requestAnimationFrame` i czasu podmiany zawartości SVG; `Emulation.setCPUThrottlingRate` = 4. Skrypt pomiarowy usunięto z repo po wyborze opcji (a) (tryb prerender przestał istnieć w generatorze); wyniki zostają jako dokumentacja decyzji.
Ćwiczenia: Back Squat i Bench Press (gotowe rodziny, próbki z rigu aplikacji), Pull Up (**pilot**: poza z generatora zewnętrznego, rodzina jeszcze niegotowa w aplikacji).

## Przesył (gzip; Pages serwuje gzip)

| | (a) silnik w przeglądarce | (b) prerender 48 kroków | (b) prerender 96 kroków |
|---|---|---|---|
| silnik JS + skrypt strony | 9,6 KB (w (b) wystarczyłoby ok. 1,5 KB) | — | — |
| dane figury Back Squat (2 błędy, 2 widoki) | 2,0 KB | 1125 KB | 2168 KB |
| dane figury Bench Press (1 błąd, 2 widoki) | 2,0 KB | 360 KB | 665 KB |
| dane figury Pull Up (bez błędów, 2 widoki) | 0,6 KB | 360 KB | 683 KB |
| cała strona Back Squat (HTML gz) | 13,3 KB | 1137 KB | — |

Wszystkie 87 figur (stan 0.20): (a) `figury.json` 2,4 MB surowo, 153 KB gzip — dane w repo; (b) 270 MB surowo (56 MB gzip) klatek niezależnych od języka, a gdyby klatki leżały w HTML każdej strony języka (jak w pomiarze) — razy 35 języków, czyli poza limitem 1 GB witryny Pages. Rosnąca biblioteka (docelowo 622 kolejne ćwiczenia) pogarsza (b) liniowo.

## Czas i płynność (10 s, Chromium)

| tryb | ćwiczenie | CPU | rysowanie klatki p50 / p95 / max ms | odstęp rAF p50 / p95 / max ms | odstępy > 33 ms | fps | długie zadania |
|---|---|---|---|---|---|---|---|
| (a) silnik | Back Squat | 1× | 1,8 / 3,1 / 48,6 | 16,7 / 16,7 / 33,4 | 0 | 59,8 | 1 |
| (a) silnik | Back Squat | 4× | 7,8 / 15,6 / 48,1 | 16,7 / 33,3 / 166,8 | 5 | 53,4 | 3 |
| (a) silnik | Bench Press | 1× | 1,6 / 3,0 / 10,5 | 16,7 / 16,7 / 16,8 | 0 | 60,0 | 0 |
| (a) silnik | Bench Press | 4× | 6,7 / 11,9 / 39,1 | 16,7 / 16,8 / 33,4 | 0 | 58,9 | 0 |
| (a) silnik | Pull Up | 1× | 2,0 / 3,7 / 12,4 | 16,7 / 16,7 / 16,8 | 0 | 60,0 | 0 |
| (a) silnik | Pull Up | 4× | 7,9 / 14,4 / 23,3 | 16,7 / 16,8 / 50,1 | 1 | 57,8 | 0 |
| (b) prerender 48 | Back Squat | 1× | 0,8 / 1,2 / 2,6 | 16,7 / 16,7 / 16,8 | 0 | 60,0 | 0 |
| (b) prerender 48 | Back Squat | 4× | 3,6 / 7,5 / 18,6 | 16,7 / 16,7 / 50,0 | 1 | 59,4 | 0 |
| (b) prerender 48 | Bench Press | 1× | 0,7 / 1,0 / 5,1 | 16,7 / 16,8 / 33,4 | 0 | 59,9 | 0 |
| (b) prerender 48 | Bench Press | 4× | 3,1 / 6,4 / 8,8 | 16,7 / 16,8 / 116,7 | 1 | 59,3 | 0 |
| (b) prerender 48 | Pull Up | 1× | 0,8 / 1,2 / 7,1 | 16,7 / 16,7 / 49,9 | 1 | 59,7 | 0 |
| (b) prerender 48 | Pull Up | 4× | 3,4 / 6,2 / 12,9 | 16,7 / 16,7 / 33,3 | 0 | 59,9 | 0 |

Wnioski: (a) mieści się w budżecie klatki także przy 4× wolniejszym procesorze (p95 ok. 15 ms, ale bez zapasu — pojedyncze klatki do 48 ms, kilka odstępów > 33 ms w 10 s);
(b) ma dwukrotnie krótszy czas klatki, ale przesyła 180–620 razy więcej danych. Różnice płynności są niewielkie (53–60 fps), przesył — rzędu wielkości.
Pierwszy przebieg 6 s dał ten sam obraz (silnik 4×: 0–3 odstępy > 33 ms, prerender: 0–1).

## Wierność względem aplikacji

- Rysunek z próbek w silniku przeglądarkowym = rysunek rigu w aplikacji (test w repo aplikacji, tests/strona-eksport.test.ts: 5 ćwiczeń, wszystkie widoki, 9 pozycji; odchylenie tylko z zaokrąglenia próbek do 0,01 cm).
- Dane pozy w kontrakcie `figury-v2/poza@1` (9 klatek z `exampleFor`) odwzorowują rig z błędem stawu do 1,1 cm (przysiad) i 1,9 cm (martwy ciąg), ale NIE obejmują ławki (kontrakt nie zna rekwizytu „ławka” — Bench Press bez ławki, błąd kolana do 9,9 cm). Dlatego eksport przesyła próbki klatek z rigu, a pozę kontraktu tylko obok.
