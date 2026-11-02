// F-16 (kontrakt zakresu docs/54, start W0): PIN.json na commicie z nazwami EN (ZB-025 b) i adresy ćwiczeń zamrożone w slugs.lock.json — 709 wpisów, ten sam adres w każdym budowanym języku.
// Zmiana nazwy po zamrożeniu nie tworzy po cichu nowego adresu: bez wpisu build stoi, z wpisem przekierowania stary adres prowadzi do nowego. Zadanie z 02.11.2026.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { effectiveSlugs, checkSlugLock, freeze } from '../src/slugi.mjs';
import { readJson, CACHE } from '../src/lib.mjs';
import { requireData } from './pomoc.mjs';

requireData();
const KATALOG = 709; /* liczba ćwiczeń katalogu aplikacji (kontrakt F-16: „zamrożenie slugów 709”) */
const man = readJson('.cache/dane/manifest.json'), cfg = readJson('config.json'), pin = readJson('PIN.json');
const lock = readJson('slugs.lock.json').slugi, ov = readJson('slug-overrides.json');
const dane = l => JSON.parse(readFileSync(join(CACHE, `dane/${man.languages.find(x => x.lang === l).file}`), 'utf8'));

test('F-16: dane w .cache pochodzą z commitu z PIN.json', () => {
  assert.equal(man.app.commit, pin.commit);
});
test('F-16: slugs.lock.json ma 709 wpisów i zgadza się z adresami ćwiczeń w każdym budowanym języku', () => {
  assert.equal(Object.keys(lock).length, KATALOG);
  for (const l of cfg.jezyki) {
    const ex = dane(l).exercises, eff = effectiveSlugs(ex, ov.nadpisania);
    assert.equal(ex.length, KATALOG, `${l}: liczba ćwiczeń`);
    assert.deepEqual(eff.errors, [], l);
    for (const [id, slug] of eff.slugs) assert.equal(lock[id], slug, `${l}: ${id}`);
    assert.deepEqual(checkSlugLock({ current: eff.slugs, lock, redirects: ov.przekierowania, indexing: true }).errors, [], l);
  }
});
test('F-16: zmiana nazwy po zamrożeniu — bez wpisu błąd (nie nowy adres), z przekierowaniem stary adres prowadzi do nowego, a zamrożenie przyjmuje nowy', () => {
  const [id, old] = Object.entries(lock)[0], renamed = `${old}-renamed`;
  const current = new Map(Object.entries(lock)); current.set(id, renamed);
  const bez = checkSlugLock({ current, lock, redirects: {}, indexing: true });
  assert.match(bez.errors.join('\n'), new RegExp(`zmienił się z ${old} na ${renamed} bez przekierowania`));
  assert.match(freeze({ current, lock, redirects: {} }).errors.join('\n'), /bez przekierowania/);
  const redirects = { [old]: { do: id, od: '2026-11-02' } };
  const z = checkSlugLock({ current, lock, redirects, indexing: true });
  assert.deepEqual(z.errors, []);
  assert.deepEqual(z.redirects, [{ from: old, to: renamed }]);
  assert.equal(freeze({ current, lock, redirects }).lock[id], renamed);
});
