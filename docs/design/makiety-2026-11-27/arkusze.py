# Pasy pełnej rozdzielczości i arkusze porównawcze Z-10 z pełnych zrzutów (skala 2).
# Strażnik repo dopuszcza pliki do 300 KB, więc zrzut 2× dzielę na pasy po 2400 px (1200 px CSS) w palecie 256 kolorów.
# Użycie: python3 -I arkusze.py <katalog z pełnymi zrzutami> <katalog makiet>
import io, os, sys
from PIL import Image, ImageDraw, ImageFont

SRC, DST = sys.argv[1], sys.argv[2]
LIMIT = 300 * 1024
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 26)
KIER = {'a': 'A „Arkusz” (rysunek techniczny)', 'b': 'B „Plansza” (atlas anatomiczny)', 'c': 'C „Karta” (katalog biblioteki)'}
EKR = {'cwiczenie': 'strona ćwiczenia', 'glowna': 'strona główna języka', 'lista': 'lista z filtrem'}

def save(im, path):
    for colors in (256, 128, 64):
        b = io.BytesIO(); im.convert('RGB').quantize(colors=colors, method=Image.Quantize.FASTOCTREE).save(b, 'PNG', optimize=True)
        if len(b.getvalue()) <= LIMIT: open(path, 'wb').write(b.getvalue()); return colors
    raise SystemExit(f'{path}: powyżej 300 KB')

def tiles():
    out = os.path.join(DST, 'zrzuty'); os.makedirs(out, exist_ok=True); n = 0
    for f in sorted(os.listdir(SRC)):
        im = Image.open(os.path.join(SRC, f)); base = f[:-4]; h = 2400; parts = -(-im.height // h)
        while True:
            ok = True
            for i in range(parts):
                part = im.crop((0, i * im.height // parts, im.width, (i + 1) * im.height // parts))
                b = io.BytesIO(); part.convert('RGB').quantize(colors=256, method=Image.Quantize.FASTOCTREE).save(b, 'PNG', optimize=True)
                if len(b.getvalue()) > LIMIT: ok = False; break
            if ok: break
            parts += 1
        for i in range(parts):
            part = im.crop((0, i * im.height // parts, im.width, (i + 1) * im.height // parts))
            save(part, os.path.join(out, f'{base}-{i + 1}z{parts}.png')); n += 1
    return n

def label(w, text):
    im = Image.new('RGB', (w, 56), (255, 255, 255)); ImageDraw.Draw(im).text((16, 14), text, fill=(20, 24, 30), font=FONT); return im

def sheet(cells, title, path, gap=24):
    """cells: lista (podpis, obraz) w jednym wierszu, wyrównane do góry."""
    w = sum(c[1].width for c in cells) + gap * (len(cells) + 1); h = max(c[1].height for c in cells) + 56 + 48 + gap
    S = Image.new('RGB', (w, h), (214, 218, 224)); S.paste(label(w, title), (0, 0)); x = gap
    for cap, im in cells:
        d = ImageDraw.Draw(S); d.text((x, 64), cap, fill=(20, 24, 30), font=FONT); S.paste(im, (x, 104)); x += im.width + gap
    return save(S, path)

def shot(k, s, tag, motyw, scale, max_css_h):
    im = Image.open(os.path.join(SRC, f'{k}-{s}-{tag}-{motyw}.png'))
    im = im.crop((0, 0, im.width, min(im.height, max_css_h * 2)))
    return im.resize((int(im.width * scale / 2), int(im.height * scale / 2)), Image.LANCZOS)

def sheets():
    out = os.path.join(DST, 'arkusze'); os.makedirs(out, exist_ok=True); made = []
    for k in 'abc':
        for s in EKR:
            cells = [('komputer, jasny', shot(k, s, 'komp', 'jasny', .42, 2200)), ('komputer, ciemny', shot(k, s, 'komp', 'ciemny', .42, 2200)),
                     ('telefon, jasny', shot(k, s, 'tel', 'jasny', .8, 1150)), ('telefon, ciemny', shot(k, s, 'tel', 'ciemny', .8, 1150))]
            p = os.path.join(out, f'{k}-{s}.png'); sheet(cells, f'Kierunek {KIER[k]} · {EKR[s]} · komputer 1440 px (pomniejszony), telefon 390 px', p); made.append(p)
    for s in EKR:
        cells = [(f'{KIER[k][:1]}: komputer, jasny', shot(k, s, 'komp', 'jasny', .42, 2200)) for k in 'abc']
        p = os.path.join(out, f'porownanie-{s}-komputer.png'); sheet(cells, f'Porównanie kierunków A · B · C · {EKR[s]} · komputer 1440 px, jasny', p); made.append(p)
        cells = [(f'{KIER[k][:1]}: telefon, {m}', shot(k, s, 'tel', m, .8, 1150)) for k in 'abc' for m in ('jasny', 'ciemny')]
        p = os.path.join(out, f'porownanie-{s}-telefon.png'); sheet(cells, f'Porównanie kierunków A · B · C · {EKR[s]} · telefon 390 px, jasny i ciemny', p); made.append(p)
    return made

print('pasy:', tiles()); print('arkusze:', len(sheets()))
