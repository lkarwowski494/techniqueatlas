# Pomiar startowy: dane z tagu v1.1.1-b1042 (Z-02)

Data pomiaru: 2026-11-27 · PIN.json → `lkarwowski494/trening`, ref `v1.1.1-b1042`, commit `d9382dbe5dde91e8b746d14193ed332ab889df62` · `manifest.app.version` = 1.1.1 · `config.json → wersjaWydania` = "1.1.1".
Metoda: `npm run dane`, potem odczyt `.cache/dane/atlas-pl.json` i `atlas-en.json` (pola `figure`, `pelna`, `cues.scope`, `cues.missing`). Liczby takie same w pl i en.

| Wielkość | Wartość | Plan (27.11) |
|---|---|---|
| ćwiczenia | 708 | 708 |
| z animowanym rysunkiem (`figure`) | 528 | 528 |
| pełna karta (`pelna === true`) | 447 | 447 |
| własne wskazówki kompletne (`cues.scope === "own"`, `missing` = 0) | 310 | 310 |
| pełna karta + własne wskazówki | 232 | 232 |
| rysunek + własne wskazówki („oba”) | 263 | — |
| wskazówki wspólne (`general`) / brak (`none`) | 257 / 141 | 398 łącznie |

Pole `pelna` jest w eksporcie 1.1.1 (708 z 708 ćwiczeń). Plan notował „F-20 nie ma w tagu 1.1.1”: pole jest, więc strażnik S6 „eksport bez pola pelna” nie zadziała. Po P-1 (ZM-08) i tak nie jest ono warunkiem indeksowania.

## Parytet adresów (slugs.lock.json)
- Surowe adresy z danych 1.1.1 różnią się od `slugs.lock.json` w 14 ćwiczeniach (zmiana nazwy w aplikacji); `checkSlugLock` zgłaszał 14 błędów „zmienił się bez przekierowania”.
- Rozstrzygnięcie (analogia: P-8 „krótkie angielskie, jak dziś” i adresy zamrożone, docs/54 pkt 4; **do weta właściciela**): zostają stare adresy, 14 wpisów w `slug-overrides.json → nadpisania` (id ćwiczenia → stary slug). Alternatywa: nowe adresy i 14 przekierowań (dłuższe trzymanie przekierowań, ryzyko dla zamrożonych adresów).
- Wynik po zmianie: 708 z 708 adresów zgodnych z lockiem w pl i en, 0 błędów, 0 ostrzeżeń; 1 przekierowanie z `slug-overrides.json` (`wide-grip-pulldown-behind-the-neck` → lista) bez zmian; lock ma 709 wpisów (708 + 1 ćwiczenie usunięte).
