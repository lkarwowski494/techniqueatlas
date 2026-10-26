// Strażnik „bez analityki i bez połączeń z osobami trzecimi”: żadnych skryptów śledzących, pikseli, cookies, zewnętrznych zasobów (czcionek, skryptów, obrazów) ani wywołań sieciowych w kodzie strony.
// Strona ładuje wyłącznie własne pliki. Linki <a> do innych witryn są dozwolone (to nawigacja, nie pobieranie zasobów).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { repoFiles, isText, read, distFiles, buildOnce } from './pomoc.mjs';

const TRACKERS = /google-analytics|googletagmanager|googlesyndication|doubleclick|adsbygoogle|\bgtag\s*\(|\bga\s*\(\s*['"]|analytics\.js|plausible|matomo|piwik|hotjar|mixpanel|segment\.(?:com|io)|amplitude|clarity\.ms|fullstory|posthog|umami|fathom|cloudflareinsights|simpleanalytics|goatcounter|sentry|datadoghq|newrelic|facebook\.(?:net|com)\/tr|\bfbq\s*\(|connect\.facebook|snap(?:chat)?\.com\/.*pixel|sc-static\.net|analytics\.tiktok|mc\.yandex|metrika|linkedin\.com\/px|static\.hotjar|bat\.bing/i;
const NETWORK_API = /\bfetch\s*\(|XMLHttpRequest|sendBeacon|\bWebSocket\b|\bEventSource\b|new\s+Image\s*\(|document\.cookie|\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|importScripts|navigator\.serviceWorker/;
const EXT = /(?:^|["'\s=])(?:https?:)?\/\/(?!localhost)/;
/** Znacznik ładujący zasób z innej domeny: script/img/iframe/… z zewnętrznym src/srcset/data/poster albo <link> zasobowy (stylesheet, preload, icon, manifest, preconnect…) z zewnętrznym href. Metadane <link rel="canonical|alternate"> nie ładują zasobów. */
const EXTERNAL_RES = { test(html) {
  for (const m of html.matchAll(/<(script|link|img|iframe|source|video|audio|embed|object|track)\b([^>]*)>/gi)) {
    const tag = m[1].toLowerCase(), attrs = m[2]; const get = n => attrs.match(new RegExp(`\\b${n}\\s*=\\s*["']?([^"'\\s>]+)`, 'i'))?.[1];
    if (tag === 'link') { if (/\brel\s*=\s*["']?(?:canonical|alternate)\b/i.test(attrs)) continue; const h = get('href'); if (h && EXT.test(` ${h}`)) return true; continue; }
    for (const n of ['src', 'srcset', 'data', 'poster']) { const v = get(n); if (v && EXT.test(` ${v}`)) return true; }
  }
  return false;
} };
const CSS_URL = /url\(\s*["']?\s*(?:https?:)?\/\//i;
const IMPORT_HTTP = /@import\s+(?:url\()?\s*["']?(?:https?:)?\/\//i;
const JS_IMPORT_HTTP = /\bimport\s*(?:\(|[^'"]*from)\s*["']https?:/;

test('samokontrola: wzorce wykrywają próbki', () => {
  for (const s of ['<script src="https://www.google-' + 'analytics.com/a.js">', 'gtag' + '(\'js\')', 'plaus' + 'ible.io']) assert.ok(TRACKERS.test(s) || EXTERNAL_RES.test(s), s);
  assert.ok(EXTERNAL_RES.test('<link rel="stylesheet" href="https://fonts.example.org/x.css">')); assert.ok(!EXTERNAL_RES.test('<link rel="canonical" href="https://techniqueatlas.com/pl/">')); assert.ok(!EXTERNAL_RES.test('<link rel="alternate" hreflang="en" href="https://techniqueatlas.com/en/">')); assert.ok(EXTERNAL_RES.test('<img src="//cdn.example.org/a.png">')); assert.ok(!EXTERNAL_RES.test('<a href="https://example.org/">x</a>')); assert.ok(!EXTERNAL_RES.test('<script src="../../assets/a.js">'));
  assert.ok(NETWORK_API.test('fe' + 'tch("/x")')); assert.ok(!NETWORK_API.test('const y = 1'));
});
test('repozytorium (kod strony, generator, zasoby): brak skryptów śledzących; kod przeglądarki bez wywołań sieciowych, cookies i pamięci przeglądarki', () => {
  const bad = [];
  for (const f of repoFiles().filter(f => isText(f) && !/^tests\//.test(f) && f !== 'README.md' && !f.startsWith('pomiary/') && !f.startsWith('docs/'))) {
    const t = read(f); if (TRACKERS.test(t)) bad.push(`${f}: ${t.match(TRACKERS)[0]}`);
    if (/^assets\/.+\.js$/.test(f)) { if (NETWORK_API.test(t)) bad.push(`${f}: ${t.match(NETWORK_API)[0]}`); if (JS_IMPORT_HTTP.test(t)) bad.push(`${f}: import z sieci`); }
  }
  assert.deepEqual(bad, []);
});
test('zbudowana strona: tylko własne zasoby (zero zewnętrznych skryptów, stylów, obrazów, czcionek), brak śledzenia i wywołań sieciowych; jedyny import dynamiczny to własne pliki danych', async () => {
  const { out } = await buildOnce();
  const bad = [];
  for (const p of distFiles(out)) {
    const e = extname(p); if (!['.html', '.js', '.css'].includes(e)) continue; const t = readFileSync(p, 'utf8');
    if (TRACKERS.test(t)) bad.push(`${p}: tracker`); if (e === '.html' && EXTERNAL_RES.test(t)) bad.push(`${p}: zasób zewnętrzny`);
    if (CSS_URL.test(t) || IMPORT_HTTP.test(t)) bad.push(`${p}: url() lub @import z sieci`);
    if (e === '.js' && NETWORK_API.test(t)) bad.push(`${p}: ${t.match(NETWORK_API)[0]}`);
  }
  assert.deepEqual(bad, []);
});
