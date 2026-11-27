# Teksty prawne strony (Z-20): projekty pl + en

Autor: sesja AS (M8-formalnosci, build, zakres zawężony), 27.11.2026. Stan: **projekt do recenzji Z-23** (P-4: autor i niezależny recenzent). Tłumaczenie na 33 języki to Z-26, a przeniesienie do słowników i stron to Z-33.
To nie jest porada prawna. Kwestie niejednoznaczne mają **[DO KONSULTACJI]** z pytaniem, które można zadać prawnikowi, i bezpieczniejszą opcją. Wybór należy do właściciela.

| Plik | Co |
|---|---|
| `polityka-prywatnosci.pl.md`, `polityka-prywatnosci.en.md` | polityka prywatności strony |
| `regulamin.pl.md`, `regulamin.en.md` | regulamin strony (usługa drogą elektroniczną) |
| `licencja-tresci.pl.md`, `licencja-tresci.en.md` | licencja treści (druk dla trenerów, docs/54:188) |
| `dowody.md` | tabela twierdzenie → dowód (`plik:linia`, strona z cytatem) i lista `[DO KONSULTACJI]` |
| `do-wlasciciela.md` | pytania do właściciela prostym językiem (PP, R, L, nieprzeczytane ustawy) z opcjami i rekomendacją; decyzje Z-23 do weta |

## Wstawki (wypełnia Z-33 z ustawień, nie z tego repo)

Repo jest publiczne. Strażnik `straznik-sekrety` dopuszcza tylko adresy e-mail noreply, a w repo nie zapisujemy danych osobowych (polecenie AS pkt 2). Dlatego dane administratora i kontakt są wstawkami:
- `{{administrator}}` (imię i nazwisko albo firma, jak w polityce prywatności aplikacji; art. 13 ust. 1 lit. a RODO, art. 5 ust. 2 UŚUDE). Decyzja: skąd Z-33 bierze tę wartość. **[DO USTALENIA] T-1.**
- `{{kontakt}}`: adres e-mail kontaktu (ten sam co w polityce aplikacji).
- `{{politykaAplikacji}}`: adres polityki prywatności aplikacji (`config.json` → `polityka`).
- `{{dataObowiazywania}}`: data publikacji (Z-51).
- `{{adresStrony}}`: `config.json` → `domena`.

## Decyzja zapisana „do weta” (tryb analogii, polecenie AS pkt 5)

- **27.11.2026, D12 zmienione przez plan:** docs/54 D12 A (docs/54:150) zakładało link w stopce do polityki aplikacji. Plan z 27.11 (Z-33 „Strony prawne + stopka”, P-5 „Od razu 35 języków”) zakłada **własne strony prawne strony**.
  Projekty piszę jako osobną politykę strony, która odsyła do polityki aplikacji tylko w sprawie e-maili. Odrzucone: sam link do polityki aplikacji. Powód: tamta polityka opisuje aplikację, nie stronę (brak logów hostingu, wyszukiwarki, linku do sklepu).
  Zależy od: P-5, Z-33.
- **27.11.2026, licencja a asystenci AI (P-11):** licencja zabrania budowania zbiorów do uczenia modeli z istotnej części treści (jak klauzula bazy danych w LICENSE aplikacji). Wprost **pozwala** wyszukiwarkom i asystentom AI indeksować strony, cytować je i streszczać z odnośnikiem.
  Odrzucone: (a) zakaz wszelkiego użycia przez AI, sprzeczny z P-11 („jeszcze ważniejsze w AI”); (b) brak zapisu o AI, niespójny z LICENSE aplikacji.
  Zależy od: Z-06 (roboty AI, robots.txt). Pytanie do koordynatora wysłane.
