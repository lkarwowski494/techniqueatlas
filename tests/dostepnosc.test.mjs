// S8 dostępność (docs/54 pkt 12): skaner WCAG 2.2 AA (axe-core) w przeglądarce bezgłowej na próbce zbudowanej strony — wszystkie 35 języków (build z nadpisaniem języków, config bez zmian),
// strony zbiorcze i ćwiczenia, motywy jasny i ciemny, „Ogranicz ruch” włączone i wyłączone. Pełna macierz 2 × 2 × 8 stron dla pl i en; dla pozostałych języków jedna kombinacja (na zmianę) i 6 stron — układ i style są wspólne, różnią się teksty (koszt: ok. 5 min).
// Wymaga zainstalowanej przeglądarki (Chrome/Chromium) i `npm ci` (devDependencies: playwright-core, axe-core); uzasadnienie w README.
import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../src/build.mjs';
import { readJson } from '../src/lib.mjs';
import { requireData, tmpDist } from './pomoc.mjs';
import { launch, serve, axeSource, axeViolations } from './przegladarka.mjs';

requireData();
const man = readJson('.cache/dane/manifest.json'), ALL = man.languages.map(l => l.lang);
const readEn = () => JSON.parse(readJsonText(`.cache/dane/${man.languages.find(l => l.lang === 'en').file}`));
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../src/lib.mjs';
function readJsonText(rel) { return readFileSync(join(ROOT, rel), 'utf8'); }

/** Próbka ćwiczeń: z figurą i własnymi wskazówkami, z figurą i błędami innej rodziny, najdłuższa nazwa, bez wskazówek, ze wskazówkami ogólnymi bez figury. */
function sample(en) {
  const ex = en.exercises, longest = [...ex].sort((a, b) => b.name.length - a.name.length)[0];
  const pick = [ex.find(e => e.slug === 'back-squat'), ex.find(e => e.figure && e.figure.errors.length >= 2 && e.family !== 'squat'), longest, ex.find(e => e.cues.scope === 'none'), ex.find(e => e.cues.scope === 'general' && !e.figure)];
  assert.ok(pick.every(Boolean), 'próbka ćwiczeń kompletna'); assert.equal(new Set(pick.map(e => e.slug)).size, 5);
  return pick.map(e => e.slug);
}

test('S8: skaner WCAG 2.2 AA — 35 języków × (strona główna, lista, filtr, 5 ćwiczeń) × motywy × „Ogranicz ruch”; strona wyboru języka i 404 — bez naruszeń', { timeout: 20 * 60 * 1000 }, async () => {
  const built = await build({ out: tmpDist(), cfg: { jezyki: ALL } }); const srv = await serve(built.out), browser = await launch(), source = axeSource();
  const slugs = sample(readEn()), paths = l => [`/${l.toLowerCase()}/`, `/${l.toLowerCase()}/exercises/`, `/${l.toLowerCase()}/muscles/legs/`, ...slugs.map(s => `/${l.toLowerCase()}/exercises/${s}/`)];
  /* koszt czasu: axe ok. 1,2 s na stronę; pełna macierz tylko dla pl i en, pozostałe 33 języków — jedna kombinacja (na zmianę jasny/bez ograniczenia ruchu i ciemny/z ograniczeniem) i 6 stron (zbiorcze + 3 ćwiczenia) */
  const FULL = ['pl', 'en'], combos = (l, i) => FULL.includes(l) ? [['light', 'no-preference'], ['light', 'reduce'], ['dark', 'no-preference'], ['dark', 'reduce']] : [i % 2 ? ['dark', 'reduce'] : ['light', 'no-preference']];
  const urlsOf = l => FULL.includes(l) ? paths(l) : [paths(l)[0], paths(l)[1], paths(l)[2], paths(l)[3], paths(l)[5], paths(l)[6]];
  const jobs = [...ALL.flatMap((l, i) => combos(l, i).map(([colorScheme, reducedMotion]) => ({ l, colorScheme, reducedMotion, urls: urlsOf(l) }))), { l: 'en', colorScheme: 'light', reducedMotion: 'no-preference', urls: ['/', '/nie-ma-takiej-strony/'] }, { l: 'en', colorScheme: 'dark', reducedMotion: 'reduce', urls: ['/', '/nie-ma-takiej-strony/'] }];
  const found = []; let scanned = 0, next = 0;
  async function worker() {
    for (;;) {
      const job = jobs[next++]; if (!job) return;
      const ctx = await browser.newContext({ colorScheme: job.colorScheme, reducedMotion: job.reducedMotion, viewport: { width: 390, height: 844 }, bypassCSP: true }), page = await ctx.newPage();
      for (const u of job.urls) { await page.goto(srv.url + u, { waitUntil: 'load' }); await page.waitForTimeout(30); for (const v of await axeViolations(page, source)) found.push(`${job.l} ${job.colorScheme}/${job.reducedMotion} ${u} — ${v.id} (${v.impact}) ${v.target}: ${v.help}`); scanned++; }
      await ctx.close();
    }
  }
  try { await Promise.all(Array.from({ length: 3 }, worker)); } finally { await browser.close(); await srv.close(); }
  assert.ok(scanned >= ALL.length * 6, `przeskanowano ${scanned} stron`);
  assert.deepEqual([...new Set(found)].slice(0, 15), [], `naruszeń: ${found.length} (przeskanowano ${scanned} stron)`);
});
