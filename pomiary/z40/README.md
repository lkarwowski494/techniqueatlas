# Z-40 — pomiary po poprawkach audytu wyglądu (28.11.2026)

Odtworzenie: `node -e "import('./src/build.mjs').then(m=>m.build({out:'<dist>',cfg:{jezyki:['pl','en','ru','de','nl','uk']}}))"` i `node pomiary/z40/mierz.mjs <dist> pomiary/z40`.
Warianty: 320 px i tekst 200% (font-size korzenia ×2, jak w audycie), 390 px i 100%, 768 px i 200% (listy); jasny i ciemny; „Ogranicz ruch”. Zrzuty: `zrzuty/` (jasny we wszystkich wariantach, ciemny przy 320 px). Wyniki: `sprawdzenie.json`.

## Wynik (40 widoków)
- axe-core (wcag2a/aa/21/22 + best-practice): 0 naruszeń.
- Przewijanie poziome: 0 px we wszystkich 40 widokach.
- Błędy konsoli: poza 404 (status strony) brak.
- Licznik wyniku: po wyborze filtra „Nogi” `p.wynik[aria-live]` pokazuje „N z 708 ćwiczeń” (pole `licznik` w `sprawdzenie.json`).
- 35 języków przy 320 px i tekście 200% (ćwiczenie, strona główna, lista): `tests/z40-przewijanie.test.mjs`, 0 px.
