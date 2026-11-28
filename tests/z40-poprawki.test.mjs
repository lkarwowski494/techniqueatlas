// Z-40 poprawki po audycie wyglądu (docs/design/audyt-z40-2026-11-28.md): testy akceptacyjne z raportu, pisane przed poprawką (czerwone), potem zielone.
// Statyczne (HTML po zbudowaniu pl, en, de) i w przeglądarce (Chromium bezgłowy, bez połączeń poza serwerem plików). Przewijanie przy 320 px i tekście 200% w 35 językach: tests/z40-przewijanie.test.mjs.
// Tekst 200% jak w audycie (dowody/tekst-200.txt): font-size korzenia ×2 (`calc(106.25% * 2)`), bo to ustawienie użytkownika skaluje rem.
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from '../src/build.mjs';
import { buildOnce, requireData, tmpDist, ROOT } from './pomoc.mjs';
import { readJson } from '../src/lib.mjs';
import { czytaj, element, elementy, tekst, hrefy } from './strona-html.mjs';
import { launch, serve } from './przegladarka.mjs';

requireData();
const { out, ctx } = await buildOnce('z40', { jezyki: ['pl', 'en', 'de'] });
const PL = readJson('src/ui/pl.json'), EN = readJson('src/ui/en.json');
const strona = (l, slug) => czytaj(out, `${l}/exercises/${slug}/index.html`);
const WYWOLANIE = 'calc(106.25% * 2)';

let srv, browser;
before(async () => { srv = await serve(out); browser = await launch(); });
after(async () => { await browser?.close(); await srv?.close(); });
async function otworz(sciezka, { w = 390, h = 900, kolor = 'light', ruch = 'no-preference', tekst200 = false } = {}) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: kolor, reducedMotion: ruch, bypassCSP: true }), p = await c.newPage();
  await p.goto(srv.url + sciezka); await p.evaluate(() => document.fonts.ready);
  if (tekst200) await p.evaluate(v => document.documentElement.style.setProperty('font-size', v, 'important'), WYWOLANIE);
  return { p, zamknij: () => c.close() };
}
const poziom = p => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

/* ---------- 001 / 007: przewijanie w poziomie przy tekście 200% ---------- */
test('Z-40 001: nagłówek przy 320 px i tekście 200% nie przewija strony w poziomie (pl, en, de; nazwa marki zawija się, nie jest ucinana)', async () => {
  for (const l of ['pl', 'en', 'de']) {
    const { p, zamknij } = await otworz(`/${l}/exercises/back-squat/`, { w: 320, tekst200: true });
    assert.equal(await poziom(p), 0, `${l}: przewijanie w poziomie`);
    const ucieta = await p.evaluate(() => { const n = document.querySelector('.marka-n'), r = n.getBoundingClientRect(); return r.right > document.documentElement.clientWidth || getComputedStyle(n).whiteSpace === 'nowrap' && n.scrollWidth > n.clientWidth; });
    assert.equal(ucieta, false, `${l}: nazwa marki ucięta`);
    await zamknij();
  }
});

test('Z-40 007: wykaz /pl/exercises/ przy 600–1024 px i tekście 200% nie przewija strony w poziomie', async () => {
  const zle = [];
  for (const w of [600, 641, 700, 768, 900, 1024]) { const { p, zamknij } = await otworz('/pl/exercises/', { w, tekst200: true }); const x = await poziom(p); if (x > 0) zle.push(`${w}: ${x}`); await zamknij(); }
  assert.deepEqual(zle, []);
});

test('Z-40 007: wykaz przy 100% tekstu zachowuje układ: tabela od ok. 640 px (nagłówek kolumn widoczny), karty-wiersze poniżej', async () => {
  const a = await otworz('/pl/exercises/', { w: 760 }), b = await otworz('/pl/exercises/', { w: 480 });
  assert.notEqual(await a.p.evaluate(() => getComputedStyle(document.querySelector('.wykaz thead')).display), 'none', 'przy 760 px nagłówek kolumn ma być widoczny');
  assert.equal(await b.p.evaluate(() => getComputedStyle(document.querySelector('.wykaz thead')).display), 'none', 'przy 480 px wiersze jako karty');
  await a.zamknij(); await b.zamknij();
});

/* ---------- 008: cel dotykowy przycisku języka ---------- */
test('Z-40 008: a.jezyk ma co najmniej 44 × 44 px przy 390 px (system: cel 44 px)', async () => {
  const { p, zamknij } = await otworz('/pl/exercises/back-squat/');
  const r = await p.evaluate(() => { const b = document.querySelector('a.jezyk').getBoundingClientRect(); return { w: b.width, h: b.height }; });
  assert.ok(r.w >= 44 && r.h >= 44, `a.jezyk ${r.w}×${r.h}`); await zamknij();
});

/* ---------- 002: licznik wyniku i ogłoszenie zmiany ---------- */
test('Z-40 002: teksty UI „wynik” w pl i en (liczby przez {n} i {m}), bez sklejania napisów', () => {
  for (const [l, u] of [['pl', PL], ['en', EN]]) { assert.ok(/\{n\}/.test(u.wynik) && /\{m\}/.test(u.wynik), `${l}: ui.wynik`); }
});

test('Z-40 002: lista ćwiczeń ma p.wynik z aria-live="polite": „<strong>N</strong> z M” (N = M przed filtrem), także w en', () => {
  for (const l of ['pl', 'en']) {
    const h = czytaj(out, `${l}/exercises/index.html`), p = element(h, 'p', 'wynik'); assert.ok(p, `${l}: brak p.wynik`);
    assert.match(p.otwarcie, /aria-live="polite"/); const n = ctx.data[l].exercises.length;
    assert.equal(tekst(p.wnetrze), (l === 'pl' ? PL : EN).wynik.replace('{n}', n).replace('{m}', n), l);
    assert.match(p.wnetrze, new RegExp(`<strong>${n}</strong>`));
  }
});

test('Z-40 002: strona filtra (partia, sprzęt, rodzaj ruchu) pokazuje „N z M” z liczbą ćwiczeń filtra', () => {
  const zle = [];
  for (const [kind, key, ids] of [['muscles', 'group', ['legs']], ['equipment', 'equipment', ['barbell']]]) for (const id of ids) {
    const h = czytaj(out, `pl/${kind}/${id}/index.html`), p = element(h, 'p', 'wynik'), wiersze = elementy(element(h, 'table', 'wykaz').wnetrze, 'tr').length - 1;
    if (!p) { zle.push(`${kind}/${id}: brak p.wynik`); continue; }
    if (!/aria-live="polite"/.test(p.otwarcie)) zle.push(`${kind}/${id}: bez aria-live`);
    if (tekst(p.wnetrze) !== PL.wynik.replace('{n}', wiersze).replace('{m}', ctx.data.pl.exercises.length)) zle.push(`${kind}/${id}: „${tekst(p.wnetrze)}” ≠ ${wiersze} z ${ctx.data.pl.exercises.length}`);
  }
  assert.deepEqual(zle, []);
});

test('Z-40 002: język bez własnego tekstu „wynik” (de) dostaje wersję angielską z lang="en" na akapicie, bez „undefined”', () => {
  const p = element(czytaj(out, 'de/exercises/index.html'), 'p', 'wynik'); assert.ok(p); assert.match(p.otwarcie, /lang="en"/); assert.doesNotMatch(p.wnetrze, /undefined|\{n\}|\{m\}/);
});

test('Z-40 002 (przeglądarka): wybór filtra zmienia element p.wynik[aria-live] na liczbę widocznych wierszy; „wyczyść” przywraca pełną liczbę; zero wyników = „0 z M”', async () => {
  const { p, zamknij } = await otworz('/pl/exercises/'), razem = ctx.data.pl.exercises.length;
  const live = () => p.evaluate(() => { const e = document.querySelector('p.wynik[aria-live]'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; });
  const widoczne = () => p.evaluate(() => document.querySelectorAll('.wykaz tbody tr:not([hidden])').length);
  await p.selectOption('#f-muscle', 'legs'); const n = await widoczne(); assert.ok(n > 0 && n < razem);
  assert.equal(await live(), PL.wynik.replace('{n}', n).replace('{m}', razem));
  await p.selectOption('#f-equipment', 'cable'); await p.selectOption('#f-movement', await p.evaluate(() => [...document.querySelectorAll('#f-movement option')].find(o => o.value && o.value.includes('squat'))?.value ?? ''));
  const n2 = await widoczne(); assert.equal(await live(), PL.wynik.replace('{n}', n2).replace('{m}', razem));
  await p.click('[data-wyczysc]:not([hidden])'); assert.equal(await live(), PL.wynik.replace('{n}', razem).replace('{m}', razem));
  await zamknij();
});

/* ---------- 003: przycisk animacji ---------- */
test('Z-40 003: przycisk animacji nie ma aria-pressed (zwykły przycisk ze zmienną etykietą), w HTML i po skrypcie', async () => {
  assert.doesNotMatch(strona('pl', 'back-squat'), /data-pause[^>]*aria-pressed|aria-pressed[^>]*data-pause/);
  for (const ruch of ['reduce', 'no-preference']) {
    const { p, zamknij } = await otworz('/pl/exercises/back-squat/', { ruch }); await p.waitForSelector('[data-pause]:not([hidden])');
    assert.equal(await p.getAttribute('[data-pause]', 'aria-pressed'), null, `${ruch}: aria-pressed`);
    const przed = await p.textContent('[data-pause]'); await p.click('[data-pause]'); assert.notEqual(await p.textContent('[data-pause]'), przed, `${ruch}: etykieta zmienia się po kliknięciu`);
    assert.equal(await p.getAttribute('[data-pause]', 'aria-pressed'), null, `${ruch}: aria-pressed po kliknięciu`); await zamknij();
  }
});

test('Z-40 003: przy „Ogranicz ruch” przycisk animacji ma tło arkusza (--sheet), nie odwrócone kolory', async () => {
  const { p, zamknij } = await otworz('/pl/exercises/back-squat/', { ruch: 'reduce' }); await p.waitForSelector('[data-pause]:not([hidden])');
  const r = await p.evaluate(() => { const probe = document.createElement('i'); probe.style.background = 'var(--sheet)'; document.body.append(probe); const sheet = getComputedStyle(probe).backgroundColor; probe.remove(); return { sheet, bg: getComputedStyle(document.querySelector('[data-pause]')).backgroundColor }; });
  assert.equal(r.bg, r.sheet); await zamknij();
});

/* ---------- 004: podpis figury ---------- */
test('Z-40 004: figcaption figury nie powtarza nazw faz ani czasów (tempo niesie linia wymiarowa): sam tekst „rysunek schematyczny”', () => {
  const zle = [];
  for (const l of ['pl', 'en']) for (const slug of ['back-squat', 'bench-press']) {
    const h = strona(l, slug), f = element(h, 'figcaption'); if (!f) { zle.push(`${l}/${slug}: brak figcaption`); continue; }
    const t = tekst(f.wnetrze), fazy = ctx.data[l].exercises.find(e => e.slug === slug).figure.phases.map(p => p.name);
    if (fazy.some(n => t.includes(n))) zle.push(`${l}/${slug}: „${t}”`);
    if (t !== ctx.data[l].labels.ui.schematic) zle.push(`${l}/${slug}: „${t}” ≠ ui.schematic`);
  }
  assert.deepEqual(zle, []);
});

/* ---------- 005: przyciski częstych błędów ---------- */
test('Z-40 005: przycisk błędu ma tekst = nazwa błędu bez końcowej kropki i bez „Pokaż częsty błąd”; nazwa dostępna zaczyna się od „Pokaż częsty błąd”', async () => {
  for (const l of ['pl', 'en']) {
    const h = strona(l, 'back-squat'), btn = elementy(h, 'button').filter(b => /data-error=/.test(b.otwarcie)); assert.ok(btn.length >= 2, `${l}: przyciski błędów`);
    const show = ctx.data[l].labels.ui.showError;
    for (const b of btn) { const t = tekst(b.wnetrze), al = b.otwarcie.match(/aria-label="([^"]*)"/)?.[1] ?? ''; assert.ok(t && !t.endsWith('.') && !t.includes(show), `${l}: tekst „${t}”`); assert.ok(al.startsWith(show) && al.includes(t), `${l}: aria-label „${al}”`); }
  }
  const { p, zamknij } = await otworz('/pl/exercises/back-squat/'); await p.waitForSelector('[data-error]:not([hidden])');
  const przed = await p.$eval('[data-error]', b => [b.textContent, b.getAttribute('aria-label')]); await p.click('[data-error]');
  assert.deepEqual(await p.$eval('[data-error]', b => [b.textContent, b.getAttribute('aria-label')]), przed, 'po kliknięciu etykieta bez zmian (stan niesie aria-pressed)');
  assert.equal(await p.getAttribute('[data-error]', 'aria-pressed'), 'true'); await zamknij();
});

/* ---------- 006: stopka z językami ---------- */
test('Z-40 006: p.jezyki w stopce ma ≤ 4 linki: język bieżący, angielski i „wszystkie języki (N)” do wyboru języka; ≤ 120 px przy 390 px', async () => {
  for (const l of ['pl', 'en', 'de']) {
    const h = czytaj(out, `${l}/exercises/back-squat/index.html`), p = element(h, 'p', 'jezyki'); assert.ok(p, l);
    const a = hrefy(p.wnetrze); assert.ok(a.length >= 1 && a.length <= 4, `${l}: ${a.length} linków`);
    assert.match(tekst(p.wnetrze), new RegExp(`\\(${ctx.langs.length}\\)`), `${l}: liczba języków w nazwie linku`);
    assert.ok(a.some(x => x.href.endsWith('/') && !/exercises/.test(x.href)), `${l}: link do wyboru języka`);
  }
  const { p, zamknij } = await otworz('/pl/exercises/back-squat/'); const hh = await p.$eval('p.jezyki', e => e.getBoundingClientRect().height); assert.ok(hh <= 120, `wysokość ${hh}`); await zamknij();
});

/* ---------- 009: plakietka App Store ---------- */
const APP = '123456789';
test('Z-40 009: z appStoreId ramka „w aplikacji” nie ma stylowanego linku tekstowego a.plakietka z tekstem „App Store” z i18n — jest <img alt> z lokalnego pliku albo link tekstowy bez klas stylu', async () => {
  const r = await build({ out: tmpDist(), cfg: { appStoreId: APP, jezyki: ['pl', 'en'] } }), ramka = element(czytaj(r.out, 'pl/exercises/back-squat/index.html'), 'aside', 'ramka');
  assert.ok(ramka, 'brak ramki'); assert.doesNotMatch(ramka.wnetrze, /<a class="plakietka"[^>]*>[^<]*</, 'link tekstowy z klasą plakietka (styl poza systemem)');
  const a = hrefy(ramka.wnetrze).find(x => x.href.startsWith(`https://apps.apple.com/app/id${APP}`)); assert.ok(a, 'link do sklepu w ramce');
});

/* ---------- 011: nagłówek krótkiej odpowiedzi ---------- */
test('Z-40 011: design-spec §10 pkt 9 zawiera dokładnie ten tekst nagłówka krótkiej odpowiedzi, który wdraża strona (src/ui/pl.json → howTo)', () => {
  const spec = readFileSync(join(ROOT, 'docs/design/system/design-spec.md'), 'utf8'); assert.ok(spec.includes(`„${PL.howTo}”`), `design-spec nie zawiera „${PL.howTo}”`);
  assert.doesNotMatch(spec, /„Jak zrobić \{n\}\?”/, 'design-spec: stary wzorzec z nazwą');
});

/* 010 (NIS, Open Graph i opis na listach, stronach prawnych i 404) — nie wdrożone w BL: wymaga zasobu graficznego (podgląd ogólny) i decyzji właściciela dla 180 ćwiczeń bez figury (Z-34 decyzja 3, design-spec §10 pkt 4) — zgłoszone koordynatorowi. */
