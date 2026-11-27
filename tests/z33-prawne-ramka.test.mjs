// Z-30 → Z-33: strony prawne, stopka, ramka „w aplikacji” i akapit o wsparciu. Wyrocznia: teksty docs/teksty/prawne/*.md (Z-20), docs/teksty/ramka-w-aplikacji.md (Z-21: wariant A,
// akapit W1–W3 z {dni} = 5 z lib/access.ts tagu 1.1.1 według tabeli dowodów), komponenty z docs/design/system/szablony/cwiczenie.html. Budowane pl, en i de (język podglądu: 33 języki
// mają te same elementy po Z-26/Z-27). Testy oznaczone CZEKA('Z-33') są czerwone do wdrożenia; strategia: docs/55-strategia-testow-wdrozenia.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOnce, requireData, read, repoFiles, isText } from './pomoc.mjs';
import { CZEKA, czytaj, plikiHtml, element, elementy, tekst, hrefy, rozwiaz, istnieje, meta } from './strona-html.mjs';

requireData();
const APP = '1234567890'; /* identyfikator testowy — nie prawdziwa aplikacja */
const { out, ctx } = await buildOnce('z33', { jezyki: ['pl', 'en', 'de'], appStoreId: APP });
const bez = await buildOnce('z33-bez', { jezyki: ['pl', 'en'] });
const JEZ = ['pl', 'en'], DOK = ['polityka-prywatnosci', 'regulamin', 'licencja-tresci'];
const ramkaDok = read('docs/teksty/ramka-w-aplikacji.md');
/* tabela wariantu A: | A1 | pl | en | dowód | — sekcja „Wariant A” do „Wariant B” */
const wariantA = ramkaDok.slice(ramkaDok.indexOf('### Wariant A'), ramkaDok.indexOf('### Wariant B')).split('\n').map(w => w.split('|').map(x => x.trim())).filter(k => /^A\d$/.test(k[1]));
const ZDANIA = { pl: wariantA.map(k => k[2]), en: wariantA.map(k => k[3]) };
const akapit = ramkaDok.slice(ramkaDok.indexOf('## 2. Akapit o wsparciu')).split('\n').map(w => w.split('|').map(x => x.trim())).filter(k => /^W\d$/.test(k[1]));
const DNI = 5; /* lib/access.ts:25 tagu v1.1.1-b1042 (FREE_TRAINING_DAYS_PER_MONTH: 5) — dowód w tabeli akapitu, docs/teksty/ramka-w-aplikacji.md §2 */
const WSPARCIE = Object.fromEntries(JEZ.map((l, i) => [l, akapit.map(k => k[2 + i].replace('{dni}', DNI)).join(' ')]));
const naglowki = (l, d) => { const md = read(`docs/teksty/prawne/${d}.${l}.md`); return { h1: md.match(/^# (.+)$/m)[1].trim(), h2: [...md.matchAll(/^## (.+)$/gm)].map(m => m[1].trim()) }; };
const stopka = h => element(h, 'footer')?.wnetrze ?? '';
const cwiczenia = (c, l) => c.data[l].exercises.map(e => `${l}/exercises/${e.slug}/index.html`);

test('Z-33 wyrocznie wczytane: 8 zdań ramki (wariant A) i 3 zdania akapitu w pl i en (przechodzi dziś — pilnuje, że testy niżej czytają dokument, nie pustą tabelę)', () => {
  for (const l of JEZ) { assert.equal(ZDANIA[l].length, 8, l); assert.equal(akapit.length, 3); assert.match(WSPARCIE[l], /\b5\b/); }
});

test('Z-33 strony prawne pl i en: stopka każdej strony ma linki do polityki prywatności, regulaminu i licencji treści strony; każdy prowadzi do istniejącej strony z h1 i sekcjami (h2) z docs/teksty/prawne/<dokument>.<język>.md', CZEKA('Z-33', 'stopka z linkiem do polityki aplikacji'), () => {
  for (const l of JEZ) {
    const oczek = DOK.map(d => naglowki(l, d)), proba = [`${l}/index.html`, `${l}/exercises/index.html`, cwiczenia(ctx, l)[0]];
    for (const f of proba) {
      const cele = hrefy(stopka(czytaj(out, f))).map(a => rozwiaz(f, a.href, ctx.cfg.domena)).filter(p => p && istnieje(out, p));
      const strony = cele.map(p => czytaj(out, p)).map(h => ({ h1: tekst(element(h, 'h1')?.wnetrze ?? ''), h2: elementy(h, 'h2').map(e => tekst(e.wnetrze)), lang: h.match(/<html lang="([^"]+)"/)?.[1] }));
      for (const o of oczek) {
        const s = strony.find(s => s.h1 === o.h1); assert.ok(s, `${f}: brak linku do „${o.h1}”`);
        assert.deepEqual(o.h2.filter(t => !s.h2.includes(t)), [], `${o.h1}: brak sekcji`); assert.equal(s.lang, l);
      }
    }
  }
});

test('Z-33 strony prawne w języku podglądu (de, tak samo 33 języki): stopka ma 3 linki prawne do istniejących stron w tym języku (html lang)', CZEKA('Z-33', 'brak stron prawnych'), () => {
  const f = 'de/index.html', cele = hrefy(stopka(czytaj(out, f))).map(a => rozwiaz(f, a.href, ctx.cfg.domena)).filter(p => p && istnieje(out, p) && p.startsWith('de/'));
  const prawne = cele.filter(p => !/^de\/(index\.html|exercises\/)/.test(p));
  assert.ok(prawne.length >= 3, `linki prawne de: ${prawne}`);
  for (const p of prawne) assert.match(czytaj(out, p), /<html lang="de">/, p);
});

test('Z-33 wstawki i znaczniki robocze: w dist nie ma {{…}}, [DO KONSULTACJI] ani [DO USTALENIA]; licencja podaje adres strony (config.json → domena) (przechodzi dziś trywialnie — strażnik po dodaniu stron prawnych)', () => {
  const zle = plikiHtml(out).filter(f => /\{\{|\[DO KONSULTACJI\]|\[DO USTALENIA\]/.test(czytaj(out, f)));
  assert.deepEqual(zle, []);
});

test('Z-33 ramka „w aplikacji” (wariant A, do weta Z-21): każda strona ćwiczenia pl i en ma aside.ramka z dokładnie 8 zdaniami z docs/teksty/ramka-w-aplikacji.md w tej kolejności', CZEKA('Z-33', 'brak ramki'), () => {
  const zle = [];
  for (const l of JEZ) for (const f of cwiczenia(ctx, l)) {
    const r = element(czytaj(out, f), 'aside', 'ramka'), zd = r ? elementy(r.wnetrze, 'li').map(e => tekst(e.wnetrze)) : null;
    if (!zd || JSON.stringify(zd) !== JSON.stringify(ZDANIA[l])) zle.push(f);
  }
  assert.equal(zle.length, 0, `${zle.length} stron, np. ${zle.slice(0, 2)}`);
});

test('Z-33 ramka w języku podglądu (de): każda strona ćwiczenia ma aside.ramka z 8 niepustymi zdaniami i bez zdań polskich ani angielskich', CZEKA('Z-33', 'brak ramki'), () => {
  const zle = cwiczenia(ctx, 'de').filter(f => { const r = element(czytaj(out, f), 'aside', 'ramka'), zd = r ? elementy(r.wnetrze, 'li').map(e => tekst(e.wnetrze)) : []; return zd.length !== 8 || zd.some(z => !z || ZDANIA.pl.includes(z) || ZDANIA.en.includes(z)); });
  assert.equal(zle.length, 0, `${zle.length} stron`);
});

test('Z-33 appStoreId ustawione: plakietka w ramce prowadzi do https://apps.apple.com/app/id<appStoreId> (link w aside.ramka, nie tylko w stopce)', CZEKA('Z-33', 'link sklepu tylko w stopce'), () => {
  const zle = JEZ.flatMap(l => cwiczenia(ctx, l)).filter(f => !hrefy(element(czytaj(out, f), 'aside', 'ramka')?.wnetrze ?? '').some(a => a.href.startsWith(`https://apps.apple.com/app/id${APP}`)));
  assert.equal(zle.length, 0, `${zle.length} stron`);
});

test('Z-33 appStoreId puste (przypadek brzegowy, stan dzisiejszy config.json): ramka jest, ale bez plakietki i linku do sklepu; brak meta apple-itunes-app', CZEKA('Z-33', 'brak ramki'), () => {
  for (const l of JEZ) for (const f of cwiczenia(bez.ctx, l)) {
    const h = czytaj(bez.out, f), r = element(h, 'aside', 'ramka'); assert.ok(r, `${f}: brak ramki`);
    assert.doesNotMatch(r.wnetrze, /apps\.apple\.com|plakietka/, f); assert.equal(meta(h, 'apple-itunes-app'), null, f);
  }
});

test('Z-33 akapit o wsparciu: stopka każdej strony pl i en ma p.wsparcie z W1–W3 dla {dni} = 5', CZEKA('Z-33', 'brak akapitu'), () => {
  const zle = [];
  for (const f of plikiHtml(out)) { const l = f.split('/')[0]; if (!JEZ.includes(l)) continue; const w = element(stopka(czytaj(out, f)), 'p', 'wsparcie'); if (!w || tekst(w.wnetrze) !== WSPARCIE[l]) zle.push(f); }
  assert.equal(zle.length, 0, `${zle.length} stron, np. ${zle.slice(0, 2)}`);
});

test('Z-33 liczba dni nie jest przepisana: teksty w src/ mają wstawkę {dni}, a nie cyfrę (docs/18:175 repo trening: „liczba z PAYWALL.FREE_TRAINING_DAYS_PER_MONTH, nie przepisana”)', CZEKA('Z-33', 'brak tekstu akapitu w src'), () => {
  const zrodla = repoFiles().filter(f => f.startsWith('src/') && isText(f)), teksty = zrodla.map(read).join('\n');
  assert.ok(!/\d+ dni treningowych|\d+ training days/.test(teksty), 'src/: liczba dni przepisana cyfrą');
  assert.ok(/\{dni\} dni treningowych/.test(teksty), 'src/: brak tekstu pl z {dni}'); assert.ok(/\{dni\} training days/.test(teksty), 'src/: brak tekstu en z {dni}');
});

test('Z-33 słowo „darmowy” nie występuje na stronach pl (F-12: część aplikacji jest płatna; przechodzi dziś — strażnik po dodaniu akapitu i ramki)', () => {
  assert.deepEqual(plikiHtml(out).filter(f => f.startsWith('pl/') && /darmow/i.test(czytaj(out, f))), []);
});
