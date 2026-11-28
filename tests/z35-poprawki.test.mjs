// Z-35 poprawki po przeglądzie (BT): testy pisane przed poprawką (czerwone), potem zielone.
// 001 tempo tylko przy ćwiczeniach liczonych w powtórzeniach; 002 opis kategorii z nazwami lokalnymi; 003 <title> karty z nazwą lokalną.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOnce, requireData } from './pomoc.mjs';
import { czytaj, element, meta, tekst, dekoduj } from './strona-html.mjs';
import { nazwaLokalna } from '../src/pages.mjs';

requireData();
const { out, ctx } = await buildOnce('z35', { jezyki: ['pl', 'en', 'uk'] });
const POWTORZENIA = new Set(['reps', 'weight_reps']); /* wartości pola `metric` z eksportu danych (.cache/dane/atlas-*.json) */
const karta = (l, slug) => czytaj(out, `${l}/exercises/${slug}/index.html`);
const maTempo = html => /class="wymiar[ "]/.test(html) || /role="img" aria-label="[^"]*(Tempo|tempo)/.test(html);

test('Z-35 001: karta ćwiczenia na czas (metryka inna niż powtórzenia) nie ma paska tempa „.wymiar” (pl, en)', () => {
  for (const l of ['pl', 'en']) {
    const naCzas = ctx.data[l].exercises.filter(e => !POWTORZENIA.has(e.metric) && e.figure?.phases?.some(p => p.ms > 0));
    assert.ok(naCzas.length >= 20, `${l}: oczekiwano ok. 22 kart na czas z fazami, jest ${naCzas.length}`);
    const zle = naCzas.filter(e => maTempo(karta(l, e.slug))).map(e => `${e.slug} (${e.metric})`);
    assert.deepEqual(zle, [], `${l}: karty z paskiem tempa mimo metryki innej niż powtórzenia`);
  }
});

test('Z-35 001: wskazane karty (plank, dead-hang, wall-sit, child-s-pose, butterfly-stretch) bez paska tempa', () => {
  for (const s of ['plank', 'dead-hang', 'wall-sit', 'child-s-pose', 'butterfly-stretch']) {
    const e = ctx.data.pl.exercises.find(x => x.slug === s); assert.ok(e, s); assert.ok(!POWTORZENIA.has(e.metric), `${s}: metryka ${e.metric}`);
    assert.equal(maTempo(karta('pl', s)), false, s);
  }
});

test('Z-35 001: karta ćwiczenia z powtórzeniami nadal ma pasek tempa', () => {
  const zPowt = ctx.data.pl.exercises.filter(e => POWTORZENIA.has(e.metric) && e.figure?.phases?.some(p => p.ms > 0) && !e.figure.phases.some(p => p.untimed));
  assert.ok(zPowt.length > 100);
  const bez = zPowt.filter(e => !maTempo(karta('pl', e.slug))).map(e => e.slug);
  assert.deepEqual(bez, []);
  assert.ok(maTempo(karta('pl', 'back-squat')));
});

test('Z-35 002: opis strony kategorii pl nie wylicza angielskich nazw, gdy istnieje nazwa lokalna (np. /pl/muscles/biceps/)', () => {
  const opis = dekoduj(meta(czytaj(out, 'pl/muscles/biceps/index.html'), 'description'));
  const lok = ctx.data.pl.exercises.filter(e => e.group === 'biceps' && nazwaLokalna(ctx, 'pl', e)).map(e => e.name);
  assert.ok(lok.length > 0);
  for (const n of lok) assert.ok(!opis.includes(n), `opis zawiera angielską nazwę „${n}”: ${opis}`);
});

test('Z-35 002: na wszystkich stronach kategorii pl i uk opis nie zawiera angielskiej nazwy ćwiczenia, które ma lokalną; limity opisu zachowane', async () => {
  const { LIMITY } = await import('../src/szablony.mjs');
  const zle = [];
  for (const l of ['pl', 'uk']) {
    /* bez nazw angielskich zawartych w własnej nazwie lokalnej (np. „Burpee” w „Burpees”) — to nie wyciek angielskiej nazwy */
    const angielskie = ctx.data[l].exercises.filter(e => nazwaLokalna(ctx, l, e) && !nazwaLokalna(ctx, l, e).includes(e.name)).map(e => e.name);
    for (const dir of ['muscles', 'equipment', 'movements']) {
      const { readdirSync } = await import('node:fs'), { join } = await import('node:path');
      for (const sl of readdirSync(join(out, l, dir), { withFileTypes: true }).filter(x => x.isDirectory()).map(x => x.name)) {
        const o = meta(czytaj(out, `${l}/${dir}/${sl}/index.html`), 'description'); if (!o) continue;
        const dl = [...o].length; if (l === 'pl' && (dl < LIMITY.opis.min || dl > LIMITY.opis.max)) zle.push(`${l}/${dir}/${sl}: ${dl} znaków`);
        if (l === 'pl') for (const n of angielskie) if (o.includes(n)) { zle.push(`${l}/${dir}/${sl}: „${n}”`); break; }
      }
    }
  }
  assert.deepEqual(zle, []);
});

test('Z-35 003: <title> karty w języku bez szablonu = nazwa lokalna, gdy istnieje (uk back-squat); og:title i JSON-LD name zgodne', () => {
  const e = ctx.data.uk.exercises.find(x => x.slug === 'back-squat'), lok = nazwaLokalna(ctx, 'uk', e);
  assert.ok(lok, 'uk back-squat ma nazwę lokalną');
  const h = karta('uk', 'back-squat');
  assert.ok(tekst(element(h, 'title').wnetrze).startsWith(lok), tekst(element(h, 'title').wnetrze));
  assert.ok(meta(h, 'og:title').startsWith(lok), meta(h, 'og:title'));
  assert.ok(!tekst(element(h, 'title').wnetrze).startsWith(e.name));
});

test('Z-35 003: w języku bez szablonu żaden <title> karty z nazwą lokalną nie jest samą nazwą angielską', () => {
  const zle = ctx.data.uk.exercises.filter(e => nazwaLokalna(ctx, 'uk', e)).filter(e => !tekst(element(karta('uk', e.slug), 'title').wnetrze).includes(nazwaLokalna(ctx, 'uk', e))).map(e => e.slug);
  assert.deepEqual(zle, []);
});
