// Animacja figury na stronie ćwiczenia (przeglądarka, moduł ES, bez zależności i bez połączeń sieciowych poza własnym plikiem danych figury).
// Dane figury (próbki klatek, wspólne dla języków) ładuje dynamiczny import ./fig/<slug>.js; kształty liczy silnik figur v2 z aplikacji (./silnik/figura.js).
// Zasady: bez autostartu przy „Ogranicz ruch” (prefers-reduced-motion) — zostaje obraz statyczny z HTML; przycisk wstrzymania (WCAG 2.2.2); przyciski działają z klawiatury (button).
import { innerAt, uAt, TEMPO } from './silnik/figura.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = (tpl, v) => tpl.split('{opis}').join(v);

async function init(root) {
  let data; try { data = (await import(`./fig/${root.dataset.fig}.js`)).default; } catch { return; } /* bez danych zostaje obraz statyczny i tekst */
  const L = JSON.parse(root.querySelector('[data-labels]').textContent), texts = JSON.parse(root.querySelector('[data-errors]').textContent);
  const gs = [...root.querySelectorAll('[data-g]')], names = data.views.map(v => v.name);
  const pauseBtn = root.querySelector('[data-pause]'), errBtns = [...root.querySelectorAll('[data-error]')], errText = root.querySelector('[data-error-text]');
  let paused = reduce, err = -1, t0 = performance.now(), last = -1, raf = 0;
  const cur = () => err >= 0 ? data.errors[err] : null;
  const tempo = () => ({ ...TEMPO, ...(cur()?.kind === 'tempo' ? cur().tempo : data.tempo) });
  const frames = () => cur()?.kind === 'pose' ? data.errorFrames[err] : data.frames;
  const draw = u => gs.forEach((g, k) => { g.innerHTML = innerAt(frames(), u, names[k]); });
  const tick = now => {
    raf = 0; if (paused) return;
    const u = data.static ? 1 : uAt(now - t0, data.lowerFirst, tempo());
    if (u !== last) { last = u; draw(u); }
    raf = requestAnimationFrame(tick);
  };
  const start = () => { if (!raf && !data.static) { t0 = performance.now(); raf = requestAnimationFrame(tick); } };
  pauseBtn.hidden = !!data.static; pauseBtn.textContent = paused ? L.resume : L.pause; pauseBtn.setAttribute('aria-pressed', String(paused));
  pauseBtn.onclick = () => { paused = !paused; pauseBtn.textContent = paused ? L.resume : L.pause; pauseBtn.setAttribute('aria-pressed', String(paused)); if (!paused) start(); };
  errBtns.forEach(b => {
    const i = data.errors.findIndex(e => e.id === b.dataset.error); b.hidden = i < 0;
    b.onclick = () => {
      err = err === i ? -1 : i; errBtns.forEach(x => { const on = data.errors.findIndex(e => e.id === x.dataset.error) === err; x.textContent = `${on ? L.hideError : L.showError}: ${texts.find(t => t.id === x.dataset.error)?.text ?? ''}`; x.setAttribute('aria-pressed', String(on)); });
      errText.hidden = err < 0; errText.textContent = err < 0 ? '' : fmt(L.errorLine, texts.find(t => t.id === data.errors[err].id)?.text ?? ''); last = -1; if (paused) draw(1); else start();
    };
  });
  if (!paused) start(); else draw(1);
}
for (const root of document.querySelectorAll('[data-figure]')) init(root);
