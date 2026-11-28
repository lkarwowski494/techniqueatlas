// Uproszczenie tekstów prawnych (sesja BR, 28.11.2026) — dwie krótkie strony: „Prywatność” i „Warunki”, wzór: apps4brew.com.
// Decyzje właściciela 28.11.2026: „Czy na stronie podajemy, kto ją prowadzi, i kontakt? - tak jak nasza strona apps4brew.com, 2. przeciez my nie przechowujemy zadnych danych. … 11. jakie serwisy z ustawami? Przeciez to zwykla strona z cwiczeniami. Robimy przerost formy nad trescia. … 14. Jak apps4brew”
// oraz „2: Prywatność + Warunki (Rekomendowane)” (regulamin i licencja łączą się w jedną stronę „Warunki”).
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildOnce, requireData, read, repoFiles, ROOT } from './pomoc.mjs';
import { czytaj, plikiHtml, element, tekst, hrefy } from './strona-html.mjs';

requireData();
const DIR = join(ROOT, 'docs/teksty/prawne');
const tresc = (f) => read(`docs/teksty/prawne/${f}`).replace(/<!--(?:(?!<!--)[\s\S])*?-->/g, '');
const slowa = (s) => s.replace(/^#.*$/gm, '').replace(/Obowiązuje od.*|Effective.*/g, '').split(/\s+/).filter(Boolean).length;

test('BR dwa dokumenty: w docs/teksty/prawne są pliki prywatnosc i warunki (pl, en), nie ma regulaminu ani licencji treści w żadnym języku', () => {
  const pliki = readdirSync(DIR);
  for (const d of ['prywatnosc', 'warunki']) for (const l of ['pl', 'en']) assert.ok(pliki.includes(`${d}.${l}.md`), `${d}.${l}.md`);
  assert.deepEqual(pliki.filter((f) => /^(regulamin|licencja-tresci)\./.test(f)), []);
});

test('BR długość: Prywatność ≤ 130 słów, Warunki ≤ 210 słów w pl i en (ok. 120 i 200)', () => {
  for (const l of ['pl', 'en']) { assert.ok(slowa(tresc(`prywatnosc.${l}.md`)) <= 130, `prywatność ${l}`); assert.ok(slowa(tresc(`warunki.${l}.md`)) <= 210, `warunki ${l}`); }
});

test('BR prowadzący w tekstach: „Apps4Brew” i support@apps4brew.com wpisane wprost; bez wstawek {{administrator}}/{{kontakt}} i bez zmiennych TA_ADMINISTRATOR/TA_KONTAKT w budowaniu', () => {
  for (const d of ['prywatnosc', 'warunki']) for (const l of ['pl', 'en']) { const t = tresc(`${d}.${l}.md`); assert.match(t, /Apps4Brew/); assert.match(t, /support@apps4brew\.com/); assert.doesNotMatch(t, /\{\{(administrator|kontakt|adresStrony|politykaAplikacji)\}\}/); }
  assert.match(tresc('warunki.pl.md'), /Warszawa/); assert.match(tresc('warunki.en.md'), /Warsaw/);
  for (const f of repoFiles().filter((f) => /^(src|scripts|\.github)\//.test(f) && /\.(mjs|yml)$/.test(f))) assert.doesNotMatch(read(f), /TA_ADMINISTRATOR|TA_KONTAKT/, f);
});

test('BR Prywatność: mówi, że strona nic nie zbiera (ciasteczka, konta, analityka, formularze), nazywa hosting GitHub Pages i logi z adresem IP; bez artykułów ustaw i procedury próśb o dane', () => {
  const pl = tresc('prywatnosc.pl.md'), en = tresc('prywatnosc.en.md');
  for (const r of [/ciasteczek/, /kont/, /analityk/, /formularz/, /GitHub Pages/, /adres IP/]) assert.match(pl, r, String(r));
  for (const r of [/cookies/, /accounts/, /analytics/, /forms/, /GitHub Pages/, /IP address/]) assert.match(en, r, String(r));
  for (const t of [pl, en]) assert.doesNotMatch(t, /RODO|GDPR|\bart\.|ustaw|UODO|skarg|Twoje prawa|Your rights/i);
});

test('BR Warunki: bezpłatne; ogólne, nie porada medyczna (bez wyłączenia odpowiedzialności); rysunki tylko jako część całej strony; baza ćwiczeń nie hurtem ani po kawałku; roboty z robots.txt; bez reklamacji, terminów, planów treningowych i artykułów ustaw', () => {
  const pl = tresc('warunki.pl.md'), en = tresc('warunki.en.md');
  for (const r of [/bezpłatn/, /nie jest poradą medyczną/, /[Rr]ysunki ćwiczeń/, /całej strony/, /robots\.txt/, /uczenia modeli/, /powtarzalnego pobierania/]) assert.match(pl, r, String(r));
  for (const r of [/free/, /not medical advice/, /drawings/, /whole page/, /robots\.txt/, /training models/, /repeated/, /database right/, /\bEU\b/]) assert.match(en, r, String(r));
  assert.doesNotMatch(pl, /reklamac|odpowiedzialn|\bart\.|ustaw|plan[a-z]* trening|14 dni|OpenAI|Google|Anthropic/i);
  assert.doesNotMatch(en, /complaint|liabil|responsib|\bArt\.|\bAct\b|training plan|14 days|OpenAI|Google|Anthropic/i);
});

test('BR akapit o wsparciu: bez słów o cenie — „bez subskrypcji” / „without a subscription”; reszta akapitu bez zmian', () => {
  const pl = JSON.parse(read('src/ui/pl.json')).wsparcie, en = JSON.parse(read('src/ui/en.json')).wsparcie;
  assert.equal(pl.w2, 'Aplikacja daje {dni} dni treningowych w miesiącu bez subskrypcji. Pełna wersja jest płatna: subskrypcja albo dostęp dożywotni.');
  assert.equal(en.w2, 'The app gives you {dni} training days a month without a subscription. The full version is paid: a subscription or lifetime access.');
  assert.equal(pl.w1, 'Ta strona jest bezpłatna.'); assert.equal(pl.w3, 'Jej zakup wspiera też rozwój tej strony.');
  assert.doesNotMatch(read('docs/teksty/ramka-w-aplikacji.md'), /miesiącu bez opłat|a month at no charge/);
});

test('BR strona: każdy język ma dwie strony prawne (privacy-policy, terms), nie ma content-license; stopka podaje „© 2026 Apps4Brew, Warszawa” i mailto support@apps4brew.com oraz dokładnie dwa linki prawne', async () => {
  const { out, ctx } = await buildOnce('br', { jezyki: ['pl', 'en', 'de'] });
  for (const l of ['pl', 'en', 'de']) {
    for (const s of ['privacy-policy', 'terms']) assert.ok(existsSync(join(out, l, s, 'index.html')), `${l}/${s}`);
    assert.equal(existsSync(join(out, l, 'content-license')), false, `${l}/content-license`);
    const st = element(czytaj(out, `${l}/index.html`), 'footer')?.wnetrze ?? '';
    assert.match(tekst(st), /© 2026 Apps4Brew, Warszawa/); assert.ok(hrefy(st).some((a) => a.href === 'mailto:support@apps4brew.com'));
    assert.equal(hrefy(st).filter((a) => /(^|\/)(privacy-policy|terms|content-license)\/?$/.test(a.href)).length, 2, l);
  }
  assert.equal(plikiHtml(out).filter((f) => /content-license|\/regulamin/.test(f)).length, 0);
  assert.match(czytaj(out, 'pl/privacy-policy/index.html'), /support@apps4brew\.com/);
});

test('BR przekład: dla 33 języków istnieją dokumenty prywatnosc i warunki, każdy z nagłówkiem h1, wstawką {{dataObowiazywania}}, adresem support@apps4brew.com i bez starych wstawek', () => {
  const kody = JSON.parse(read('config.json')).jezyki.filter((l) => l !== 'pl' && l !== 'en');
  assert.equal(kody.length, 33);
  for (const l of kody) for (const d of ['prywatnosc', 'warunki']) {
    const f = `docs/teksty/prawne/${d}.${l}.md`; assert.ok(existsSync(join(ROOT, f)), f);
    const t = read(f); assert.match(t, /^# .+/m, f); assert.match(t, /\{\{dataObowiazywania\}\}/, f); assert.match(t, /support@apps4brew\.com/, f);
    assert.doesNotMatch(t, /\{\{(administrator|kontakt|adresStrony|politykaAplikacji)\}\}|DO KONSULTACJI/, f);
  }
});
