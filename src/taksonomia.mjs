// Identyfikatory adresów dla filtrów (ASCII, angielskie, stałe) i kody hreflang. Wartości w danych aplikacji są polskimi identyfikatorami (partia „pośladki”, sprzęt „masa ciała”) —
// adres nie może zależeć od ich pisowni, więc mapa jest jawna; build przerywa, gdy w danych pojawi się wartość spoza mapy.
export const GROUP_ID = { klatka: 'chest', plecy: 'back', barki: 'shoulders', biceps: 'biceps', triceps: 'triceps', nogi: 'legs', 'pośladki': 'glutes', 'łydki': 'calves', core: 'core', cardio: 'cardio', inne: 'other' };
export const EQUIPMENT_ID = { hantle: 'dumbbell', sztanga: 'barbell', 'masa ciała': 'bodyweight', maszyna: 'machine', linki: 'cable', inne: 'other' };
export const familyId = f => f.replace(/_/g, '-');
/** Segment adresu języka: kod aplikacji małymi literami (pl, en, es-419, pt-br, zh-hant). */
export const langPath = l => l.toLowerCase();
/** Kod hreflang (ISO 639-1 + opcjonalnie region/pismo). Otwarte (docs/54 pkt 5): es-419 i sr — Google nie obsługuje es-419 wprost, serbski jest cyrylicą; do rozstrzygnięcia przed włączeniem tych języków. */
export const hreflang = l => l;
export const OPEN_HREFLANG = new Set(['es-419', 'sr']);
/** Znaczniki językowe do porównań (collator): kod aplikacji jest poprawnym znacznikiem BCP 47. */
export const collatorTag = l => l;
