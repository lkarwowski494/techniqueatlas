# Stan agenta — Z-40 audyt wyglądu (rola 04, audit, moduł strona-www), sesja BK

28.11.2026 · gałąź `strona/z40-audyt-wygladu` od `strona/integracja-start` @ 7a227e3.

## Zrobione
- Raport: `docs/design/audyt-z40-2026-11-28.md` (werdykt: zgodny z zastrzeżeniami; KRYT 0, WYS 3, ŚR 6, NIS 2), dowody `dowody/`, zrzuty `zrzuty/` (≤ 300 KB).
- `sprawdz-raport.mjs --rola 04-studio-projektowe`: kod 0.

## Decyzje (analogia, do weta)
- Skala KRYT/WYS/ŚR/NIS → P0/P1/P2 realny/P2 szlif (próg z repo trening niedostępny).
- Zgłoszenia uzupełnień CSS: wchodzą [hidden], .widoki, .drobne, .tekst-prawny, p.odp jako poprawka selektora; .wizualnie-ukryte już w systemie; a.plakietka nie wchodzi.

## Następny krok
Rola 04 fix (system): 001, 007, 008 + przyjęte zgłoszenia; rola 08: 002–006, 009.
