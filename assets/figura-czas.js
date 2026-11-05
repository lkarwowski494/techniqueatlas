// Pozycja u (0–1) animacji figury w chwili ms od startu: wybór funkcji czasu wg trybu pętli z danych figury (eksport aplikacji, pole `loop`).
// 'jednokierunkowa' (skoki, rzuty, boje olympic): całe powtórzenie w jednym przebiegu, po końcu skok do początku, bez wahadła i bez tempa opuszczania — ta sama funkcja co w aplikacji (silnik figur, oneWayAt).
// Brak pola `loop` (dane sprzed trybu pętli) albo inna wartość: wahadło jak dotąd (uAt z tempem).
import { uAt, oneWayAt } from './silnik/figura.js';

export const isOneWay = data => data.loop === 'jednokierunkowa';
export const uOf = (data, ms, tempo) => data.static ? 1 : isOneWay(data) ? oneWayAt(ms) : uAt(ms, data.lowerFirst, tempo);
