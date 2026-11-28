# Teksty prawne strony: dwie krótkie strony (BR, 28.11.2026)

Od 28.11.2026 strona ma **dwie** strony prawne, wzorowane na apps4brew.com (stopka „© 2026 Apps4Brew, Warszawa”, kontakt support@apps4brew.com):

| Plik | Co | Długość |
|---|---|---|
| `polityka-prywatnosci.<język>.md` | „Prywatność”: strona nic nie zbiera; hosting (GitHub Pages) zapisuje techniczne logi z adresem IP na własnych zasadach; kontakt | ok. 55–65 słów |
| `warunki.<język>.md` | „Warunki”: treść bezpłatna i ogólna, nie porada medyczna; rysunki tylko jako część całej strony; baza ćwiczeń nie hurtem ani po kawałku; roboty dozwolone przez robots.txt | ok. 100–120 słów |
| `dowody.md` | dowody twierdzeń o tym, co robi strona (kod, testy) | |
| `do-wlasciciela.md` | pytania z Z-23 z odpowiedziami właściciela z 28.11.2026 | |

Języki: pl i en (źródła), 33 pozostałe z przekładu API (`docs/przeklad/`, źródło `prawne`).

## Decyzje (28.11.2026, właściciel; szczegóły w `do-wlasciciela.md`)

- Prowadzący i kontakt jak na apps4brew.com: „Apps4Brew, Warszawa”, support@apps4brew.com, bez imienia i nazwiska. Wpisane wprost w tekstach i w `config.json` (`prowadzacy`, `kontakt`, `rokStrony`); wstawek `{{administrator}}`, `{{kontakt}}` i zmiennych środowiska `TA_ADMINISTRATOR`, `TA_KONTAKT` nie ma.
- Jedyna wstawka: `{{dataObowiazywania}}` (`config.json`; strażnik S12 wymaga jej przy indeksowaniu).
- Regulamin i licencja treści połączone w „Warunki”. Bez reklamacji, terminów, planów treningowych, artykułów ustaw i procedury próśb o dane.
- Przed publikacją nikt nie czytał tekstów jako prawnik; właściciel uznał, że to zwykły katalog ćwiczeń i prawnego przeglądu nie zleca (odpowiedź 13).
