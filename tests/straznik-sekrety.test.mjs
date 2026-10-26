// Strażnik sekretów i danych osobowych (repo jest PUBLICZNE): klucze, tokeny, certyfikaty, e-maile, identyfikatory urządzeń, autorzy commitów.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { repoFiles, isText, read, ROOT } from './pomoc.mjs';

const SECRETS = [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\bgh[pousr]_[A-Za-z0-9]{30,}/, /\bgithub_pat_[A-Za-z0-9_]{30,}/, /\bAKIA[0-9A-Z]{16}\b/, /\bsk-[A-Za-z0-9_-]{20,}/, /\bxox[abprs]-[A-Za-z0-9-]{10,}/, /\bAIza[0-9A-Za-z_-]{35}/, /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/];
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
/** Dozwolone tylko adresy neutralne (noreply). Adres kontaktowy strony dodaje właściciel świadomie — wpis tutaj w tym samym commicie. */
const ALLOWED_EMAIL = [/^noreply@anthropic\.com$/, /@users\.noreply\.github\.com$/];
const UDID = /\b[0-9A-Fa-f]{8}-[0-9A-Fa-f]{16}\b/; /* UDID urządzeń Apple (nowy format 8-16) */
/** Przypięcia do commitu aplikacji (pole "commit" w danych i manifestach) nie są sekretem — usuwane przed szukaniem 40 znaków szesnastkowych. */
const PINNED = /"commit":\s*"[0-9a-f]{40}"/g;
const BAD_FILE = [/(^|\/)\.env(\..*)?$/, /\.(p8|p12|pem|key|mobileprovision|pfx|keystore|jks)$/i, /(^|\/)id_(rsa|ed25519|ecdsa)(\.pub)?$/, /credentials?\.json$/i];

test('samokontrola: wzorce wykrywają próbki (składane w locie)', () => {
  assert.ok(SECRETS[0].test('-----BEGIN ' + 'PRIVATE KEY-----')); assert.ok(SECRETS[1].test('gh' + 'p_' + 'a'.repeat(36))); assert.ok(UDID.test('00008030-' + '001A2B3C4D5E6F70'));
  const mail = 'jan.kowalski' + '@' + 'example.com'; assert.ok(mail.match(EMAIL)); assert.ok(!ALLOWED_EMAIL.some(r => r.test(mail))); assert.ok(ALLOWED_EMAIL.some(r => r.test('noreply@anthropic.com')));
});
test('brak plików z sekretami (.env, .p8, .p12, .pem, klucze) w repozytorium', () => { assert.deepEqual(repoFiles().filter(f => BAD_FILE.some(r => r.test(f))), []); });
test('brak kluczy, tokenów i identyfikatorów urządzeń w plikach tekstowych', () => {
  const bad = [];
  for (const f of repoFiles().filter(isText)) {
    const t = read(f);
    for (const r of SECRETS) if (r.test(t)) bad.push(`${f}: ${r}`);
    if (UDID.test(t)) bad.push(`${f}: UDID`);
    if (/\b[0-9a-f]{40}\b/.test(t.replace(PINNED, ''))) bad.push(`${f}: 40 znaków szesnastkowych (skrót/UDID)`);
  }
  assert.deepEqual(bad, []);
});
test('brak adresów e-mail poza neutralnymi (noreply)', () => {
  const bad = [];
  for (const f of repoFiles().filter(isText)) for (const m of read(f).match(EMAIL) ?? []) if (!ALLOWED_EMAIL.some(r => r.test(m))) bad.push(`${f}: ${m}`);
  assert.deepEqual(bad, []);
});
test('workflowy: bez sekretów (poza GITHUB_TOKEN), z jawnymi uprawnieniami, bez wywołań poza GitHub Actions', () => {
  const bad = [];
  for (const f of repoFiles().filter(f => /^\.github\/workflows\/.+\.ya?ml$/.test(f))) {
    const t = read(f);
    for (const m of t.matchAll(/secrets\.([A-Za-z0-9_]+)/g)) if (m[1] !== 'GITHUB_TOKEN') bad.push(`${f}: secrets.${m[1]}`);
    if (!/^permissions:/m.test(t)) bad.push(`${f}: brak jawnych uprawnień`);
    for (const m of t.matchAll(/uses:\s*([^\s@]+)@/g)) if (!/^actions\//.test(m[1])) bad.push(`${f}: akcja spoza actions/: ${m[1]}`);
  }
  assert.deepEqual(bad, []);
});
test('autorzy i komitenci commitów są neutralni (noreply) — adres osobisty w historii publicznego repo nie do cofnięcia', { skip: !existsSync(join(ROOT, '.git')) }, () => {
  let log = ''; try { log = execFileSync('git', ['log', '--all', '--format=%ae%n%ce'], { cwd: ROOT, encoding: 'utf8' }); } catch { return; }
  const bad = [...new Set(log.split('\n').filter(Boolean))].filter(a => !ALLOWED_EMAIL.some(r => r.test(a)));
  assert.deepEqual(bad.map(a => basename(a)), []);
});
