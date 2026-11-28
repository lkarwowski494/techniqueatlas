// Wspólne dla przekładu i przeglądu przez API Anthropic (Message Batches): ceny, klient, maskowanie, szacunek tokenów.
// Wzorzec: repo aplikacji (lkarwowski494/trening), scripts/i18n/przeglad-api.mjs i scripts/maskuj.mjs; bez zależności (fetch).
// Klucz: wyłącznie zmienna środowiskowa ANTHROPIC_API_KEY, w nagłówku x-api-key; nigdy w logu, raporcie ani argumentach.

/* ---------- liczby w jednym miejscu ---------- */
/* Identyfikatory modeli i ceny USD za 1 mln tokenów: skopiowane z repo aplikacji (scripts/i18n/przeglad-api.mjs, tabela „Current Models” skilla claude-api, odczyt tam 06.10.2026).
 * [DO USTALENIA] potwierdzić na stronie cennika Anthropic w dniu pierwszego przebiegu płatnego (zasada 4); szacunek jest celowo zawyżony. */
export const MODELE = { opus: 'claude-opus-5-5', sonnet: 'claude-sonnet-5-5' };
export const CENY = { 'claude-opus-5-5': { we: 4, wy: 20 }, 'claude-sonnet-5-5': { we: 2, wy: 10 } };
export const RABAT_BATCH = 0.5;
export const DOMYSLNY_MODEL = MODELE.opus;
export const DOMYSLNY_EFFORT = 'medium';
export const EFFORTY = ['low', 'medium', 'high', 'xhigh', 'max'];
/** Limit na jeden przebieg (decyzja koordynatora 27.11.2026, analogia do 6 USD z repo aplikacji): powyżej — stop bez zgoda_koszt=tak. */
export const LIMIT_PRZEBIEGU_USD = 6;
/** Limit łączny w repo (słowa właściciela 27.11.2026: „Do 80 USD”): bez zgody-wyjątku; podniesienie wymaga zmiany tej stałej w commicie. */
export const LIMIT_LACZNY_USD = 80;
export const MAX_TOKENS = 64000;
export const CZEKAJ_MIN_DOMYSLNIE = 120;
export const INTERWAL_S = 60;
/** Założenia szacunku wyjścia (nie pomiar, zawyżone celowo). Przekład: tokeny angielskiego × współczynnik języka + obwiednia JSON na pozycję + myślenie modelu na żądanie. */
export const ZALOZENIA_PRZEKLADU = { obwiednia: 12, myslenie: 3000 };
/** Przegląd: pozycja „ok” ≈ 8 tokenów, poprawka ≈ 90; 20% pozycji z poprawką; myślenie ≈ 10 000 tokenów na żądanie. */
export const ZALOZENIA_PRZEGLADU = { tokenyOk: 8, tokenyPoprawka: 90, udzialPoprawek: 0.2, myslenie: 10000 };
const API = 'https://api.anthropic.com/v1';
const WERSJA_API = '2023-06-01';

/** Współczynnik długości tłumaczenia względem angielskiego w tokenach, zależny od pisma. Grecki ma najgorszą tokenizację (28.11.2026: nazwy/el ucięte przy max_tokens 35 900, które wystarczyło cyrylicy ze współczynnikiem 1,6), więc dostaje własny, wyższy. */
export const WSPOLCZYNNIK = (kod) => (['ja', 'ko', 'zh-Hant'].includes(kod) ? 1.0 : kod === 'el' ? 2.6 : ['bg', 'ru', 'uk', 'sr'].includes(kod) ? 1.6 : ['de', 'fi', 'hu', 'tr', 'nl', 'sv', 'da', 'nb', 'et', 'lt', 'lv', 'sl', 'hr', 'cs', 'sk', 'ro'].includes(kod) ? 1.35 : 1.25);
/** Największe szacowane wyjście (bez „myślenia”) jednego żądania; większe źródło jest dzielone na części (kolejne żądania). Przegląd ma wyjście głównie „ok”, więc wyższy próg. Pojedyncza pozycja się nie dzieli. */
export const CZESC_WY_MAKS = { przeklad: 16000, przeglad: 30000 };

/** Rejestr zwracania się per język (z repo aplikacji, docs/16; teksty strony trzymają ten sam rejestr co aplikacja). */
export const REJESTR = {
  cs: 'standard, formalny jak w iOS', sk: 'standard, formalny jak w iOS', hu: 'standard, formalny jak w iOS', ro: 'standard, formalny jak w iOS',
  bg: 'standard, formalny jak w iOS', hr: 'standard, formalny jak w iOS', sl: 'standard, formalny jak w iOS', lt: 'standard, formalny jak w iOS',
  lv: 'standard, formalny jak w iOS', uk: 'standard, formalny jak w iOS',
  sr: 'serbski, cyrylica, ekawica; polecenia jak w iOS („Додирните”)', et: 'standard, „sina” (jak Apple w iOS po estońsku)',
  es: 'es-ES (Hiszpania), „tú”', 'es-419': 'hiszpański Ameryki Łacińskiej, „tú” (jak Apple es-MX)',
  pt: 'pt-PT (Portugalia), formalnie, bez „você”', 'pt-BR': 'pt-BR, „você”, polecenia w trybie łączącym („Toque”, „Escolha”)',
  de: '„du”', fr: '„vous” (forma grzecznościowa); spacja nierozdzielająca przed ? ! : ; i w « »', it: '„tu”', nl: '„je/jij”',
  sv: '„du”', da: '„du”', nb: '„du”', fi: '„sinä”; bez końcówek fleksyjnych przy {parametrach}', tr: '„siz” (forma grzecznościowa); bez przyrostków przy {parametrach}',
  el: 'jak Apple; „;” jako znak zapytania', id: '„Anda”, polecenia bez „-lah”', ms: '„anda”', vi: '„bạn”, uprzejme „hãy” w poleceniach',
  ru: 'interfejs „вы” (jak iOS); wskazówki techniki „ты” (głos trenera)',
  ja: 'grzeczny styl です/ます, przyciski krótkie', ko: 'styl grzecznościowy: -니다 w zdaniach, -세요 w poleceniach',
  'zh-Hant': 'Tajwan, „你”, znaki tradycyjne, słownictwo iOS tajwańskie',
};

export const nazwaJezyka = (kod) => { try { return new Intl.DisplayNames(['pl'], { type: 'language' }).of(kod) ?? kod; } catch { return kod; } };
export const zmienne = (s) => (String(s).match(/\{[^}]*\}/g) ?? []).sort();
/** Typografia języka: fr — spacja nierozdzielająca przed ; : ! ? » i po « (jak w aplikacji, strażnik A11N-03). */
export const typografia = (kod, tekst) => (kod === 'fr' ? tekst.replace(/[ \t]([;:!?»])/g, ' $1').replace(/«[ \t]/g, '« ') : tekst);

/** Maskowanie wyjścia (repo i logi CI są publiczne): klucz podany wprost i wszystko w kształcie klucza Anthropic/Google oraz długie ciągi cyfr. */
export const maskuj = (tekst, klucz = '') => {
  let s = String(tekst ?? '');
  if (klucz && klucz.length >= 4) s = s.split(klucz).join('***');
  return s.replace(/AIza[0-9A-Za-z_-]{20,}/g, '***').replace(/sk-ant-[0-9A-Za-z_-]{10,}/g, '***').replace(/projects\/[^/\s"'`,;)\]]+/gi, 'projects/***').replace(/\d{9,}/g, '***');
};

/* ---------- szacunek bez sieci ---------- */
const cjk = (c) => (c >= 0x3040 && c <= 0x30ff) || (c >= 0x3400 && c <= 0x9fff) || (c >= 0xac00 && c <= 0xd7af) || (c >= 0xf900 && c <= 0xfaff);
/** Przybliżenie liczby tokenów (zawyżone celowo): znaki łacińskie ~2,8 znaku/token, inne alfabety ~1,7, CJK ~1 znak/token. */
export function przyblizTokeny(tekst) {
  let t = 0; for (const ch of String(tekst)) { const c = ch.codePointAt(0); t += c < 0x250 ? 0.36 : cjk(c) ? 1 : 0.6; }
  return Math.ceil(t);
}
export const tekstZadania = (z) => `${z.system}\n${z.messages.map((m) => m.content).join('\n')}`;
export function kosztUsd(tokWe, tokWy, model) {
  const c = CENY[model]; if (!c) throw new Error(`nieznany model dla cennika: ${model}`);
  return ((tokWe * c.we + tokWy * c.wy) / 1e6) * RABAT_BATCH;
}

/* ---------- API ---------- */
export function klient(fetchFn, klucz) {
  const naglowki = { 'x-api-key': klucz, 'anthropic-version': WERSJA_API, 'content-type': 'application/json' };
  const wywolaj = async (metoda, url, cialo, tekst = false) => {
    const r = await fetchFn(url, { method: metoda, headers: naglowki, body: cialo ? JSON.stringify(cialo) : undefined });
    if (!r.ok) { let m = ''; try { m = (await r.json())?.error?.message ?? ''; } catch { /* brak treści */ } throw new Error(maskuj(`API ${metoda} ${new URL(url).pathname}: HTTP ${r.status} ${m}`.trim(), klucz)); }
    return tekst ? r.text() : r.json();
  };
  return {
    liczTokeny: async (model, z) => (await wywolaj('POST', `${API}/messages/count_tokens`, { model, system: z.system, messages: z.messages })).input_tokens,
    utworz: (requests) => wywolaj('POST', `${API}/messages/batches`, { requests }),
    pobierz: (id) => wywolaj('GET', `${API}/messages/batches/${encodeURIComponent(id)}`),
    wyniki: (url) => wywolaj('GET', url, null, true),
  };
}

export async function czekajNaBatch(api, id, { czekajMin, interwalS, log, spij = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  const koniec = Date.now() + czekajMin * 60000;
  for (;;) {
    const b = await api.pobierz(id);
    if (b.processing_status === 'ended') return b;
    log(`batch ${id}: ${b.processing_status}, w toku ${b.request_counts?.processing ?? '?'}`);
    if (Date.now() + interwalS * 1000 > koniec) throw Object.assign(new Error(`przekroczono czas oczekiwania (${czekajMin} min); wyniki odbierzesz: --wznow ${id}`), { kodWyjscia: 4 });
    await spij(interwalS * 1000);
  }
}
