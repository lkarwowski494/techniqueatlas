// Arkusz 5 krojów tytułowych (Z-12, E2 pkt 6). Użycie: node gen.mjs <katalog @fontsource> → index.html w bieżącym katalogu; zrzut: Playwright 1200 px, skala 1.
import fs from 'node:fs';
const F=process.argv[2];
const kroje=[
 ['ibm-plex-sans-condensed','IBM Plex Sans Condensed','obecny wybór; IBM Plex — pismo inżynierskie, wąskie jak opisy na rysunkach'],
 ['barlow-semi-condensed','Barlow Semi Condensed','wzorowany na tablicach i szyldach drogowych (Kalifornia); zaokrąglony grotesk'],
 ['saira-semi-condensed','Saira Semi Condensed','grotesk o kwadratowych łukach, rodzina szablonowych pism technicznych'],
 ['archivo-narrow','Archivo Narrow','grotesk z XIX-wiecznych druków; wąski, gęsty, „druk”'],
 ['overpass','Overpass','wywodzi się z Highway Gothic (FHWA) — pismo znaków; najbliżej liternictwa szablonowego'],
];
let ff='',pan='';
kroje.forEach(([k,n,o],i)=>{
 for(const w of [500,600]) for(const s of ['latin','latin-ext']){
  const p=`${F}/${k}/files/${k}-${s}-${w}-normal.woff2`; if(!fs.existsSync(p)) throw p;
  fs.copyFileSync(p,`f${i}-${s}-${w}.woff2`);
  ff+=`@font-face{font-family:K${i};font-weight:${w};src:url(f${i}-${s}-${w}.woff2)}\n`;}
 pan+=`<section class="p" style="--k:K${i}"><p class="et">${i+1}. ${n} — ${o}</p>
<div class="g"><h1><span>Przysiad ze sztangą na plecach</span><span class="en">Back Squat</span></h1>
<dl class="tab"><div><dt>Nazwa</dt><dd>Back Squat</dd></div><div><dt>Partia</dt><dd>nogi</dd></div><div><dt>Sprzęt</dt><dd>sztanga</dd></div><div><dt>Rodzaj ruchu</dt><dd>Przysiady</dd></div></dl></div>
<h1 class="dl">Spięcia brzucha na wyciągu ze skłonami bocznymi na półkuli balansowej</h1>
<div class="w"><div class="s" style="flex:20"><b>2 s</b><i>Opuszczanie</i></div><div class="s" style="flex:10"><b>1 s</b><i>Wstawanie</i></div><div class="s" style="flex:5"><b>0,5 s</b><i>Pauza</i></div></div>
<h2>Ustawienie · Ruch · Czego unikać · Zamienniki 0123456789 ĄĆĘŁŃÓŚŹŻ ąćęłńóśźż</h2></section>`;});
fs.writeFileSync('index.html',`<!doctype html><meta charset=utf-8><style>${ff}
body{margin:0;background:#eef1f4;color:#18202b;font:15px/1.4 system-ui,sans-serif;display:grid;grid-template-columns:1fr;gap:10px;padding:10px;width:1180px}
.p{background:#fff;border:1.5px solid #18202b;outline:1px solid #6b7686;outline-offset:4px;padding:12px 16px;margin:5px}
.et{margin:0 0 6px;font-size:13px;color:#4f5b6b}
.g{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;border-bottom:1.5px solid #18202b;padding-bottom:10px}
h1,h2,dt,b{font-family:var(--k)}h1{font-weight:600;font-size:44px;line-height:1.08;margin:0}h1 span{display:block}.en{font-size:22px;font-weight:500;color:#4f5b6b}
h1.dl{font-size:30px;margin:10px 0;max-width:560px}
.tab{display:grid;grid-template-columns:1fr 1fr;border:1.5px solid #18202b;margin:0;min-width:360px}.tab div{padding:4px 8px;border:.5px solid #6b7686}dt{font-size:12px;color:#4f5b6b;font-weight:500}dd{margin:0;font-weight:500}
.w{display:flex;max-width:520px}.s{border-top:2px solid #1d4ea3;display:flex;flex-direction:column;align-items:center;border-left:2px solid #1d4ea3}.s:last-child{border-right:2px solid #1d4ea3}b{font-weight:600;font-size:18px;font-variant-numeric:tabular-nums}i{font-style:normal;font-size:12px;color:#4f5b6b}
h2{font-weight:600;font-size:21px;margin:8px 0 0}</style>${pan}`);
