// Z-12 · ikona strony: znak „linia wymiarowa” (dwa odcinki 2:1 = tempo przysiadu 2 s + 1 s). Warstwy SVG → PNG (Playwright, bez wygładzania przez skalowanie obrazów).
// Użycie: node generuj-ikone.cjs [warianty|pliki]. „warianty” robi arkusz porównania znaków A–C; „pliki” robi PNG wybranego znaku i arkusz kontrolny.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const C = { tlo: '#1d4ea3', znak: '#ffffff', tloC: '#121922', znakC: '#8fb3ff' }; /* tokeny --accent / --sheet (jasny) i --sheet / --accent (ciemny) */
const ZNAKI = {
  /* A: dwa znaczniki i strzałki (klasyczna linia wymiarowa) */
  a: k => `<path d="M12 18v28M52 18v28M14 32h36" stroke="${k}" stroke-width="5" fill="none" stroke-linecap="square"/><path d="M13 32l11-7v14zM51 32l-11-7v14z" fill="${k}"/>`,
  /* B: łańcuch wymiarowy 2:1 — trzy znaczniki, ukośne kreski zamiast strzałek */
  b: k => `<path d="M12 18v28M38.7 18v28M52 18v28M10 32h44" stroke="${k}" stroke-width="5" fill="none" stroke-linecap="square"/><path d="M7 37l10-10M33.7 37l10-10M47 37l10-10" stroke="${k}" stroke-width="4"/>`,
  /* C: łańcuch 2:1 ze strzałkami: odcinek długi i krótki */
  c: k => `<path d="M10 18v28M40 18v28M54 18v28M11 32h42" stroke="${k}" stroke-width="5" fill="none" stroke-linecap="square"/><path d="M11 32l10-6.5v13zM39 32l-10-6.5v13zM41 32l6-4.5v9zM53 32l-6-4.5v9z" fill="${k}"/>`,
};
const svg = (z, tlo, znak) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${tlo}"/>${ZNAKI[z](znak)}</svg>`;
const tryb = process.argv[2] ?? 'pliki', WYBOR = 'a';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const png = async (s, size, out) => { await p.setViewportSize({ width: size, height: size }); await p.setContent(`<style>*{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${s}`); await p.screenshot({ path: out, omitBackground: false }); };
  const arkusz = async (zn, out) => { /* każdy znak: 16, 32, 48, 96, 180 na tapecie jasnej i ciemnej, wariant jasny i ciemny */
    const rows = zn.map(z => ['#f2f4f7', '#1b1f24'].map(tap => `<div style="background:${tap};padding:16px;display:flex;gap:18px;align-items:flex-end;font:13px system-ui;color:${tap === '#1b1f24' ? '#ccc' : '#333'}"><b style="width:24px">${z.toUpperCase()}</b>${[16, 32, 48, 96, 180].map(s => `<img width="${s}" height="${s}" src="data:image/svg+xml;base64,${Buffer.from(svg(z, C.tlo, C.znak)).toString('base64')}">`).join('')}${[32, 96].map(s => `<img width="${s}" height="${s}" src="data:image/svg+xml;base64,${Buffer.from(svg(z, C.tloC, C.znakC)).toString('base64')}">`).join('')}</div>`).join('')).join('<div style="height:8px"></div>');
    await p.setViewportSize({ width: 700, height: 100 }); await p.setContent(`<body style="margin:0">${rows}</body>`); await p.screenshot({ path: out, fullPage: true }); };
  if (tryb === 'warianty') await arkusz(['a', 'b', 'c'], process.argv[3]);
  else {
    const D = __dirname; fs.writeFileSync(path.join(D, 'znak.svg'), svg(WYBOR, C.tlo, C.znak) + '\n'); fs.writeFileSync(path.join(D, 'znak-ciemny.svg'), svg(WYBOR, C.tloC, C.znakC) + '\n');
    for (const s of [96, 180, 192, 512]) await png(svg(WYBOR, C.tlo, C.znak), s, path.join(D, s === 180 ? 'apple-touch-icon.png' : `favicon-${s}.png`));
    await png(svg(WYBOR, C.tloC, C.znakC), 512, path.join(D, 'ikona-ciemna-512.png'));
    await arkusz([WYBOR], path.join(D, 'arkusz-ikony.png'));
  }
  await b.close();
})();
