// Identyfikatory adresów dla filtrów (ASCII, angielskie, stałe) i kody hreflang. Wartości w danych aplikacji są polskimi identyfikatorami (partia „pośladki”, sprzęt „masa ciała”) —
// adres nie może zależeć od ich pisowni, więc mapa jest jawna; build przerywa, gdy w danych pojawi się wartość spoza mapy.
export const GROUP_ID = { klatka: 'chest', plecy: 'back', barki: 'shoulders', biceps: 'biceps', triceps: 'triceps', nogi: 'legs', 'pośladki': 'glutes', 'łydki': 'calves', core: 'core', cardio: 'cardio', inne: 'other' };
export const EQUIPMENT_ID = { hantle: 'dumbbell', sztanga: 'barbell', 'masa ciała': 'bodyweight', maszyna: 'machine', linki: 'cable', inne: 'other' };
export const familyId = f => f.replace(/_/g, '-');
/** Segment adresu języka: kod aplikacji małymi literami (pl, en, es-419, pt-br, zh-hant). */
export const langPath = l => l.toLowerCase();
/** Regiony wersji `es-419` (hiszpański Ameryki Łacińskiej) w hreflang. Google nie obsługuje kodu `es-419` („such as es-419, aren't supported”), więc ta sama strona jest zgłaszana jako es-XX dla każdego regionu
 * łacińskoamerykańskiego (docs/54 pkt 5). Lista = ES_419_REGIONS aplikacji bez „419” (to nie kod kraju), BR i JP (artefakt wykrywania regionu urządzenia: tam nie ma społeczności hiszpańskojęzycznej,
 * a pt-BR ma własną wersję) — kolejność alfabetyczna kodów. Hiszpania (ES) i pozostałe regiony zostają przy `es`. */
export const ES_419_HREFLANG_REGIONS = ['AR', 'BO', 'BZ', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'GT', 'HN', 'MX', 'NI', 'PA', 'PE', 'PR', 'PY', 'SV', 'US', 'UY', 'VE'];
/** Znacznik BCP 47 języka strony (atrybuty lang i hreflang na <a>, JSON-LD): serbski jest pisany cyrylicą (aplikacja: sr-Cyrl-RS), więc `sr-Cyrl`; reszta jak kod aplikacji (es-419, pt-BR, zh-Hant są poprawnymi znacznikami). */
export const hreflang = l => l === 'sr' ? 'sr-Cyrl' : l;
/** Kody hreflang dla wyszukiwarek (<link rel="alternate"> i mapy witryny): jedna strona może mieć kilka kodów (es-419 → es-XX), zawsze ten sam adres. */
export const hreflangCodes = l => l === 'es-419' ? ES_419_HREFLANG_REGIONS.map(r => `es-${r}`) : [hreflang(l)];
/** Znaczniki językowe do porównań (collator): kod aplikacji jest poprawnym znacznikiem BCP 47. */
export const collatorTag = l => l;
