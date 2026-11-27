// Pozycja u (0–1) animacji figury w chwili ms od startu: wybór funkcji czasu wg trybu pętli z danych figury (eksport aplikacji, pole `loop`) — jak ExerciseFigureV2 w aplikacji (v1.1.1).
// 'jednokierunkowa' (skoki, rzuty, boje olympic): całe powtórzenie w jednym przebiegu, po końcu skok do początku, bez wahadła i bez tempa opuszczania — oneWayAt silnika z czasem przebiegu ćwiczenia (oneWayRepMs(key); 1500 ms, wyjątki w silniku).
// 'cykl_lustro' (marsz, nośne): aplikacja liczy pozycję 0–2 (cycleAt: druga połowa w lustrze, bez cofania); próbki klatek w danych pokrywają całe 0–2, więc u = cycleAt/2, bez tempa.
// Brak pola `loop` (dane sprzed trybu pętli), 'wahadlo' albo inna wartość: wahadło jak dotąd (uAt z tempem).
import { uAt, oneWayAt } from './silnik/figura.js';
import { oneWayRepMs, cycleAt } from './silnik/anim.js';

export const isOneWay = data => data.loop === 'jednokierunkowa';
export const uOf = (data, ms, tempo) => data.static ? 1 : isOneWay(data) ? oneWayAt(ms, oneWayRepMs(data.key)) : data.loop === 'cykl_lustro' ? cycleAt(ms) / 2 : uAt(ms, data.lowerFirst, tempo);
